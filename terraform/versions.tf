terraform {
  required_version = ">= 1.5.0"

  # Placeholders are overridden by `terraform init -backend-config=...` (see docs/deployment.md).
  backend "s3" {
    bucket         = "override-with-backend-config"
    key            = "override-with-backend-config.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "override-with-backend-config"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}
