resource "random_id" "rubric_bucket" {
  byte_length = 4
}

# Course rubric: globally unique name, versioning, SSE-S3 encryption, public access fully blocked
resource "aws_s3_bucket" "rubric" {
  bucket = "${var.project_name}-rubric-data-${var.environment}-${random_id.rubric_bucket.hex}"

  tags = {
    Name        = "rubric-coursework-data"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "rubric" {
  bucket = aws_s3_bucket.rubric.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "rubric" {
  bucket = aws_s3_bucket.rubric.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "rubric" {
  bucket                  = aws_s3_bucket.rubric.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "random_password" "db" {
  length  = 20
  special = false
}

resource "random_password" "jwt" {
  length  = 48
  special = false
}

resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-rds-"
  description = "PostgreSQL for ShopSmart API"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "Postgres from VPC (EKS workloads)"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_db_subnet_group" "main" {
  name_prefix = "${var.project_name}-db-"
  subnet_ids  = module.vpc.private_subnets

  tags = {
    Name = "${var.project_name}-db-subnets"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_db_instance" "postgres" {
  identifier     = "${var.project_name}-pg"
  engine         = "postgres"
  engine_version = "16"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 50
  storage_encrypted     = true

  db_name  = "shopsmart"
  username = "shopsmart"
  password = random_password.db.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  skip_final_snapshot     = true
  publicly_accessible     = false
  backup_retention_period = 0
  multi_az                = false

  tags = {
    Environment = var.environment
  }
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.5"

  name = "${var.project_name}-${var.environment}-vpc"
  cidr = var.vpc_cidr

  azs             = local.azs
  private_subnets = [for i, az in local.azs : cidrsubnet(var.vpc_cidr, 8, i + 1)]
  public_subnets  = [for i, az in local.azs : cidrsubnet(var.vpc_cidr, 8, i + 101)]

  enable_nat_gateway      = true
  single_nat_gateway      = true
  enable_dns_hostnames    = true
  enable_dns_support      = true
  map_public_ip_on_launch = true

  public_subnet_tags = {
    "kubernetes.io/cluster/${local.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                      = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/cluster/${local.cluster_name}" = "owned"
    "kubernetes.io/role/internal-elb"             = "1"
  }

  tags = {
    Environment = var.environment
  }
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.31"

  cluster_name    = local.cluster_name
  cluster_version = var.cluster_version

  cluster_endpoint_public_access           = true
  enable_cluster_creator_admin_permissions = true

  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
  }

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    default = {
      name           = "${var.project_name}-ng"
      instance_types = ["t3.medium"]
      min_size       = 1
      max_size       = 4
      desired_size   = 2
    }
  }

  tags = {
    Environment = var.environment
  }
}

resource "aws_ecr_repository" "api" {
  name                 = "${var.project_name}-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Environment = var.environment
  }
}
