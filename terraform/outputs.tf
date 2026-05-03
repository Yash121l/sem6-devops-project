output "rubric_bucket_id" {
  description = "Rubric S3 bucket (unique name, versioning, encryption, public access blocked)"
  value       = aws_s3_bucket.rubric.id
}

output "ecr_repository_url" {
  description = "ECR registry URL for docker push (repository root, without tag)"
  value       = aws_ecr_repository.api.repository_url
}

output "ecr_repository_name" {
  value = aws_ecr_repository.api.name
}

output "cluster_name" {
  description = "EKS cluster name for aws eks update-kubeconfig"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "aws_region" {
  value = var.aws_region
}

output "configure_kubectl" {
  description = "Example command to merge kubeconfig locally"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}

output "database_host" {
  value = aws_db_instance.postgres.address
}

output "database_port" {
  value = aws_db_instance.postgres.port
}

output "database_name" {
  value = aws_db_instance.postgres.db_name
}

output "database_user" {
  value = aws_db_instance.postgres.username
}

output "database_password" {
  value     = random_password.db.result
  sensitive = true
}

output "jwt_secret" {
  description = "JWT signing secret (>= 32 chars); inject into Kubernetes as JWT_SECRET"
  value       = random_password.jwt.result
  sensitive   = true
}
