variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "shopsmart"
}

variable "environment" {
  description = "Deployment environment (production, staging)"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

# ─── Networking ────────────────────────────────────────────────────────────────

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones to use (at least 2 for HA)"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# ─── Application ───────────────────────────────────────────────────────────────

variable "api_image_tag" {
  description = "Docker image tag to deploy (set by CI to the commit SHA)"
  type        = string
  default     = "latest"
}

variable "api_cpu" {
  description = "ECS task CPU units (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "api_memory" {
  description = "ECS task memory in MiB"
  type        = number
  default     = 512
}

variable "api_desired_count" {
  description = "Number of ECS tasks to run"
  type        = number
  default     = 1
}

variable "api_port" {
  description = "Port the API container listens on"
  type        = number
  default     = 3000
}

# ─── Database ──────────────────────────────────────────────────────────────────

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "ecommerce"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "shopsmart"
  sensitive   = true
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GiB"
  type        = number
  default     = 20
}

# ─── Cache ─────────────────────────────────────────────────────────────────────

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

# ─── JWT / Auth ────────────────────────────────────────────────────────────────

variable "jwt_expiry" {
  description = "JWT access token expiry"
  type        = string
  default     = "15m"
}

variable "jwt_refresh_expiry" {
  description = "JWT refresh token expiry"
  type        = string
  default     = "7d"
}

# ─── Alerts ────────────────────────────────────────────────────────────────────

variable "alert_email" {
  description = "Email to receive CloudWatch alarm notifications"
  type        = string
  default     = ""
}
