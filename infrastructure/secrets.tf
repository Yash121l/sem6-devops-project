# ─── Secrets Manager ──────────────────────────────────────────────────────────
# Stores sensitive env vars injected into the ECS task at runtime

resource "random_password" "db" {
  length           = 32
  special          = true
  override_special = "!#$%^&*()-_=+[]{}:?"
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

resource "random_password" "jwt_refresh_secret" {
  length  = 64
  special = false
}

resource "aws_secretsmanager_secret" "app" {
  name                    = "${var.project_name}/${var.environment}/app"
  description             = "ShopSmart application secrets"
  recovery_window_in_days = 0 # immediate deletion for demo; use 7 for production
}

resource "aws_secretsmanager_secret_version" "app" {
  secret_id = aws_secretsmanager_secret.app.id

  secret_string = jsonencode({
    DATABASE_PASSWORD   = random_password.db.result
    JWT_SECRET          = random_password.jwt_secret.result
    JWT_REFRESH_SECRET  = random_password.jwt_refresh_secret.result
  })

  # Ignore future changes so manual rotations aren't overwritten
  lifecycle {
    ignore_changes = [secret_string]
  }
}
