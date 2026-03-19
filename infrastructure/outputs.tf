# ─── Outputs ──────────────────────────────────────────────────────────────────
# These values are read by the CI/CD pipeline after terraform apply

output "ecr_repository_url" {
  description = "ECR repository URL for the API Docker image"
  value       = aws_ecr_repository.api.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.api.name
}

output "ecs_task_definition_family" {
  description = "ECS task definition family (used to register new revisions)"
  value       = aws_ecs_task_definition.api.family
}

output "alb_dns_name" {
  description = "ALB DNS name (API endpoint)"
  value       = aws_lb.main.dns_name
}

output "cloudfront_domain" {
  description = "CloudFront domain name (public website URL)"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (needed for cache invalidation)"
  value       = aws_cloudfront_distribution.frontend.id
}

output "frontend_bucket_name" {
  description = "S3 bucket name for frontend assets"
  value       = aws_s3_bucket.frontend.bucket
}

output "api_url" {
  description = "Full API base URL used by the frontend build"
  value       = "http://${aws_lb.main.dns_name}/api/v1"
}

output "dashboard_url" {
  description = "CloudWatch dashboard URL"
  value       = "https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
}
