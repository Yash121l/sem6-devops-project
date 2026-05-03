output "state_bucket" {
  value = aws_s3_bucket.tfstate.id
}

output "lock_table" {
  value = aws_dynamodb_table.tflock.name
}

output "backend_config_hint" {
  value = <<-EOT
    In terraform/ run:
      terraform init \\
        -backend-config="bucket=${aws_s3_bucket.tfstate.id}" \\
        -backend-config="key=shopsmart/eks/terraform.tfstate" \\
        -backend-config="region=${var.aws_region}" \\
        -backend-config="dynamodb_table=${aws_dynamodb_table.tflock.name}" \\
        -backend-config="encrypt=true"
  EOT
}
