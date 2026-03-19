# ─── ElastiCache Redis ────────────────────────────────────────────────────────

resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-redis-subnet"
  subnet_ids = aws_subnet.private[*].id
  tags       = { Name = "${var.project_name}-redis-subnet" }
}

resource "aws_elasticache_parameter_group" "redis7" {
  name   = "${var.project_name}-redis7"
  family = "redis7"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "${var.project_name}-redis"
  description          = "ShopSmart session and cache store"

  node_type            = var.redis_node_type
  num_cache_clusters   = 1          # single node; set to 2 for read replica
  port                 = 6379

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]
  parameter_group_name = aws_elasticache_parameter_group.redis7.name

  at_rest_encryption_enabled = true
  transit_encryption_enabled = false # enable when app supports TLS Redis

  automatic_failover_enabled = false # requires num_cache_clusters >= 2

  tags = { Name = "${var.project_name}-redis" }
}
