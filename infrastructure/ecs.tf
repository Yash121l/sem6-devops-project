# ─── ECS Cluster ──────────────────────────────────────────────────────────────

resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = { Name = "${var.project_name}-cluster" }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
    base              = 1
  }
}

# ─── CloudWatch Log Group ─────────────────────────────────────────────────────

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/${var.project_name}-api"
  retention_in_days = 14
  tags              = { Name = "${var.project_name}-api-logs" }
}

# ─── ECS Task Definition ──────────────────────────────────────────────────────

locals {
  db_password_arn = "${aws_secretsmanager_secret.app.arn}:DATABASE_PASSWORD::"
  jwt_secret_arn  = "${aws_secretsmanager_secret.app.arn}:JWT_SECRET::"
  jwt_refresh_arn = "${aws_secretsmanager_secret.app.arn}:JWT_REFRESH_SECRET::"
}

resource "aws_ecs_task_definition" "api" {
  family                   = "${var.project_name}-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.api_cpu
  memory                   = var.api_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "api"
      image     = "${aws_ecr_repository.api.repository_url}:${var.api_image_tag}"
      essential = true

      portMappings = [{
        containerPort = var.api_port
        protocol      = "tcp"
      }]

      environment = [
        { name = "NODE_ENV",          value = "production" },
        { name = "PORT",              value = tostring(var.api_port) },
        { name = "DATABASE_HOST",     value = aws_db_instance.main.address },
        { name = "DATABASE_PORT",     value = "5432" },
        { name = "DATABASE_NAME",     value = var.db_name },
        { name = "DATABASE_USER",     value = var.db_username },
        { name = "REDIS_HOST",        value = aws_elasticache_replication_group.main.primary_endpoint_address },
        { name = "REDIS_PORT",        value = "6379" },
        { name = "JWT_EXPIRY",        value = var.jwt_expiry },
        { name = "JWT_REFRESH_EXPIRY", value = var.jwt_refresh_expiry },
        { name = "CORS_ORIGIN",       value = "https://${aws_cloudfront_distribution.frontend.domain_name}" },
        { name = "THROTTLE_TTL",      value = "60" },
        { name = "THROTTLE_LIMIT",    value = "100" },
      ]

      # Sensitive values pulled from Secrets Manager at task start
      secrets = [
        { name = "DATABASE_PASSWORD", valueFrom = local.db_password_arn },
        { name = "JWT_SECRET",        valueFrom = local.jwt_secret_arn },
        { name = "JWT_REFRESH_SECRET", valueFrom = local.jwt_refresh_arn },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.api.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "node -e \"require('http').get('http://localhost:${var.api_port}/api/v1/health/liveness', r => process.exit(r.statusCode===200?0:1))\""]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = { Name = "${var.project_name}-api-task" }
}

# ─── ECS Service ──────────────────────────────────────────────────────────────

resource "aws_ecs_service" "api" {
  name            = "${var.project_name}-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.api_desired_count

  launch_type         = "FARGATE"
  platform_version    = "LATEST"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = var.api_port
  }

  # Enable rolling deployments with no downtime
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  deployment_circuit_breaker {
    enable   = true
    rollback = true   # auto-rollback if health checks fail
  }

  # Wait for ALB health checks before considering deployment done
  health_check_grace_period_seconds = 60

  depends_on = [aws_lb_listener.http]

  lifecycle {
    # Allow CI to change task definition without Terraform overwriting it
    ignore_changes = [task_definition, desired_count]
  }

  tags = { Name = "${var.project_name}-api-service" }
}

# ─── Auto Scaling ─────────────────────────────────────────────────────────────

resource "aws_appautoscaling_target" "api" {
  max_capacity       = 4
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "api_cpu" {
  name               = "${var.project_name}-api-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension
  service_namespace  = aws_appautoscaling_target.api.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value       = 70
    scale_in_cooldown  = 300
    scale_out_cooldown = 60

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}
