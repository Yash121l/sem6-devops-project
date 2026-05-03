locals {
  cluster_name = "${var.project_name}-${var.environment}-eks"
  azs = slice(
    data.aws_availability_zones.available.names,
    0,
    min(3, length(data.aws_availability_zones.available.names))
  )
}
