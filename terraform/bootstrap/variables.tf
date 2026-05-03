variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "state_bucket_name" {
  type        = string
  description = "Globally unique S3 bucket for Terraform remote state (create once)"
}

variable "lock_table_name" {
  type        = string
  description = "DynamoDB table name for state locking"
  default     = "terraform-locks-shopsmart"
}
