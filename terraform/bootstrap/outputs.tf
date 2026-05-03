output "state_bucket" {
  value = aws_s3_bucket.tfstate.id
}

output "backend_config_hint" {
  value = <<-EOT
    In terraform/ run (S3 native locking is enabled in `terraform/versions.tf` via `use_lockfile`):
      terraform init \\
        -backend-config="bucket=${aws_s3_bucket.tfstate.id}" \\
        -backend-config="key=shopsmart/eks/terraform.tfstate" \\
        -backend-config="region=${var.aws_region}" \\
        -backend-config="encrypt=true"
  EOT
}
