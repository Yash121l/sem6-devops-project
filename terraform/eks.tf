# Native EKS (no terraform-aws-modules/eks) so `terraform plan` works when iam:GetRole is denied
# on the lab role (e.g. Vocareum). Access uses deployer_access_arn from locals.tf.
#
# When iam:CreateRole is also denied, set var.eks_cluster_iam_role_arn and var.eks_node_iam_role_arn
# to roles your lab pre-provisions (see docs/deployment.md).

locals {
  create_eks_cluster_iam = var.eks_cluster_iam_role_arn == ""
  create_eks_node_iam    = var.eks_node_iam_role_arn == ""
}

resource "aws_iam_role" "eks_cluster" {
  count = local.create_eks_cluster_iam ? 1 : 0

  name_prefix = "${var.project_name}-eks-cluster-"
  description = "EKS control plane role for ${local.cluster_name}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "eks.${data.aws_partition.current.dns_suffix}" }
    }]
  })

  tags = { Environment = var.environment }
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  count = local.create_eks_cluster_iam ? 1 : 0

  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster[0].name
}

resource "aws_iam_role_policy_attachment" "eks_vpc_controller" {
  count = local.create_eks_cluster_iam ? 1 : 0

  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/AmazonEKSVPCResourceController"
  role       = aws_iam_role.eks_cluster[0].name
}

resource "aws_eks_cluster" "this" {
  name     = local.cluster_name
  role_arn = local.create_eks_cluster_iam ? aws_iam_role.eks_cluster[0].arn : var.eks_cluster_iam_role_arn
  version  = var.cluster_version

  vpc_config {
    subnet_ids              = module.vpc.private_subnets
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  access_config {
    authentication_mode                         = "API_AND_CONFIG_MAP"
    bootstrap_cluster_creator_admin_permissions = false
  }

  bootstrap_self_managed_addons = false

  # depends_on must be a static list (no conditionals). Ordering for self-created IAM
  # roles is handled implicitly via role_arn -> aws_iam_role; policy attachments share that role.

  tags = { Environment = var.environment }
}

resource "aws_eks_access_entry" "deployer" {
  cluster_name  = aws_eks_cluster.this.name
  principal_arn = local.deployer_access_arn
  type          = "STANDARD"
}

resource "aws_eks_access_policy_association" "deployer_admin" {
  cluster_name  = aws_eks_cluster.this.name
  principal_arn = aws_eks_access_entry.deployer.principal_arn
  policy_arn    = "arn:${data.aws_partition.current.partition}:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"

  access_scope {
    type = "cluster"
  }
}

resource "aws_iam_role" "eks_node" {
  count = local.create_eks_node_iam ? 1 : 0

  name_prefix = "${var.project_name}-eks-node-"
  description = "EKS managed node group role for ${local.cluster_name}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.${data.aws_partition.current.dns_suffix}" }
    }]
  })

  tags = { Environment = var.environment }
}

resource "aws_iam_role_policy_attachment" "eks_node_worker" {
  count = local.create_eks_node_iam ? 1 : 0

  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node[0].name
}

resource "aws_iam_role_policy_attachment" "eks_node_cni" {
  count = local.create_eks_node_iam ? 1 : 0

  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node[0].name
}

resource "aws_iam_role_policy_attachment" "eks_node_ecr" {
  count = local.create_eks_node_iam ? 1 : 0

  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_node[0].name
}

resource "aws_eks_addon" "vpc_cni" {
  cluster_name                = aws_eks_cluster.this.name
  addon_name                  = "vpc-cni"
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "OVERWRITE"
}

resource "aws_eks_addon" "kube_proxy" {
  cluster_name                = aws_eks_cluster.this.name
  addon_name                  = "kube-proxy"
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "OVERWRITE"

  depends_on = [aws_eks_addon.vpc_cni]
}

resource "aws_eks_node_group" "this" {
  cluster_name    = aws_eks_cluster.this.name
  node_group_name = "${var.project_name}-ng"
  node_role_arn   = local.create_eks_node_iam ? aws_iam_role.eks_node[0].arn : var.eks_node_iam_role_arn
  subnet_ids      = module.vpc.private_subnets

  scaling_config {
    desired_size = 2
    max_size     = 4
    min_size     = 1
  }

  instance_types = ["t3.medium"]

  update_config {
    max_unavailable = 1
  }

  # Static depends_on only (Terraform rejects conditionals/concat here). Addons before nodes.
  depends_on = [
    aws_eks_addon.vpc_cni,
    aws_eks_addon.kube_proxy,
  ]

  tags = { Environment = var.environment }
}

resource "aws_eks_addon" "coredns" {
  cluster_name                = aws_eks_cluster.this.name
  addon_name                  = "coredns"
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "OVERWRITE"

  depends_on = [aws_eks_node_group.this]
}
