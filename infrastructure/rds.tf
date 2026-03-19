# ─── RDS PostgreSQL ───────────────────────────────────────────────────────────

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id
  tags       = { Name = "${var.project_name}-db-subnet-group" }
}

resource "aws_db_parameter_group" "postgres" {
  name   = "${var.project_name}-pg16"
  family = "postgres16"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_duration"
    value = "1"
  }

  tags = { Name = "${var.project_name}-pg16" }
}

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-postgres"

  engine               = "postgres"
  engine_version       = "16"
  instance_class       = var.db_instance_class
  allocated_storage    = var.db_allocated_storage
  storage_type         = "gp3"
  storage_encrypted    = true

  db_name  = var.db_name
  username = var.db_username
  password = jsondecode(aws_secretsmanager_secret_version.app.secret_string)["DATABASE_PASSWORD"]

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.postgres.name

  # Backups
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  # Free-tier eligible; disable multi-AZ for cost savings
  multi_az            = false
  publicly_accessible = false

  # Deletion protection (disable for easy teardown in dev)
  deletion_protection = false
  skip_final_snapshot = true

  tags = { Name = "${var.project_name}-postgres" }
}
