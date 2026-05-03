locals {
  cluster_name = "${var.project_name}-${var.environment}-eks"
  azs = slice(
    data.aws_availability_zones.available.names,
    0,
    min(3, length(data.aws_availability_zones.available.names))
  )

  # EKS access entries need an IAM role/user ARN. STS assumed-role ARNs must map to iam:role/... .
  # Doing this with string logic avoids data.aws_iam_session_context (which calls iam:GetRole and is
  # explicitly denied on some lab accounts, e.g. Vocareum Pvoclabs2 on role "voclabs").
  caller_arn = data.aws_caller_identity.current.arn
  deployer_access_arn = (
    can(regex(":assumed-role/", local.caller_arn))
    ? format(
      "arn:%s:iam::%s:role/%s",
      data.aws_partition.current.partition,
      data.aws_caller_identity.current.account_id,
      split("/", split(":assumed-role/", local.caller_arn)[1])[0]
    )
    : local.caller_arn
  )
}
