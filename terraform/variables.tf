variable "aws_region" {
  type        = string
  description = "AWS region for all resources"
  default     = "us-east-1"
}

variable "project_name" {
  type        = string
  description = "Short name prefix for resources"
  default     = "shopsmart"
}

variable "environment" {
  type        = string
  description = "Deployment stage (e.g. dev, prod)"
  default     = "dev"
}

variable "vpc_cidr" {
  type        = string
  description = "VPC CIDR for the EKS cluster network"
  default     = "10.0.0.0/16"
}

variable "cluster_version" {
  type        = string
  description = "Kubernetes version for EKS control plane"
  default     = "1.31"
}

variable "eks_cluster_iam_role_arn" {
  type        = string
  description = <<-EOT
    Existing IAM role ARN for the EKS control plane (trust policy: sts:AssumeRole for eks.amazonaws.com;
    attach AmazonEKSClusterPolicy and AmazonEKSVPCResourceController). Use when your account denies iam:CreateRole (e.g. Vocareum). Leave empty to create the role in Terraform.
  EOT
  default     = ""
}

variable "eks_node_iam_role_arn" {
  type        = string
  description = <<-EOT
    Existing IAM role ARN for managed nodes (trust ec2.amazonaws.com; attach AmazonEKSWorkerNodePolicy,
    AmazonEKS_CNI_Policy, AmazonEC2ContainerRegistryReadOnly). Leave empty to create the role in Terraform.
  EOT
  default     = ""
}
