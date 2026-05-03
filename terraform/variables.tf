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
