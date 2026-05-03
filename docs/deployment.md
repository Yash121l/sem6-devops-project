# AWS deployment (Terraform, ECR, EKS)

This repository follows the course rubric: **tests → Terraform → Docker (ECR) → Kubernetes (EKS)** via [`.github/workflows/rubric-pipeline.yml`](../.github/workflows/rubric-pipeline.yml).

## GitHub Actions secrets

Configure under **Settings → Secrets and variables → Actions**.

### Required (AWS)

| Secret | Purpose |
|--------|---------|
| `AWS_ACCESS_KEY_ID` | IAM access for Terraform, ECR, and EKS API |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key |
| `AWS_REGION` | Region for all resources (for example `us-east-1`) |
| `AWS_SESSION_TOKEN` | Only when using **temporary** credentials (STS). For long-lived IAM user keys, create the secret empty or omit it in your fork; the `configure-aws-credentials` action treats it as optional. |

### Required on `main` (remote Terraform state)

Create **Variables** (not secrets) so `terraform init` can use a shared S3 backend and DynamoDB lock table:

| Variable | Example | Source |
|----------|---------|--------|
| `TF_STATE_BUCKET` | `myorg-shopsmart-tfstate-1234` | Output `state_bucket` from one-time `terraform/bootstrap` apply |
| `TF_STATE_DYNAMODB_TABLE` | `terraform-locks-shopsmart` | Output `lock_table` from bootstrap |
| `TF_STATE_KEY` | (optional) `shopsmart/eks/terraform.tfstate` | Default used by workflow if unset |

Pull requests may run `terraform plan` with a **local** backend when these variables are unset (plan only, no state written to the repo). Pushes to `main` **fail fast** if the state variables are missing, so production applies never run without remote state.

## One-time: bootstrap remote state

From your laptop (AWS CLI configured):

Use a **real** S3 bucket name: **lowercase** letters, numbers, and hyphens only (3–63 chars), globally unique—for example `yashlunawat-shopsmart-tfstate-7f2a`. Do not use the placeholder text from tutorials as the actual name.

```bash
cd terraform/bootstrap
terraform init
terraform apply -var='state_bucket_name=yashlunawat-shopsmart-tfstate-7f2a' -var='aws_region=us-east-1'
```

Copy the outputs `state_bucket` and `lock_table` into the GitHub variables above. See also [`terraform/backend.hcl.example`](../terraform/backend.hcl.example) for the `terraform init -backend-config=...` flags used locally.

The root module [`terraform/versions.tf`](../terraform/versions.tf) declares an `s3` backend with **placeholder** `bucket`, `key`, and `dynamodb_table` values. Always override them with `-backend-config` (or a `backend.hcl` file) or use `terraform init -backend=false` for a throwaway local plan.

## What Terraform manages

Root module: [`terraform/`](../terraform/).

- **Rubric S3 bucket**: unique name (`random` suffix), versioning on, SSE-S3 encryption, public access fully blocked.
- **VPC + NAT**: private subnets for EKS nodes, public subnets for load balancers.
- **EKS**: native `aws_eks_cluster` / node group / add-ons (not `terraform-aws-modules/eks`, so `terraform plan` works when your lab IAM policy denies `iam:GetRole` on the federated role).
- **ECR**: repository for the NestJS API image.
- **RDS PostgreSQL**: small instance in private subnets so the API can run migrations and satisfy `/api/v1/health/readiness` (database ping).

Outputs include `ecr_repository_url`, `cluster_name`, database host, and masked secrets for the pipeline (JWT and DB password are generated in Terraform).

## Kubernetes manifests

Directory: [`k8s/`](../k8s/).

- Namespace `shopsmart` (non-default).
- `Deployment` with **2** replicas, CPU/memory requests and limits, **liveness** and **readiness** HTTP probes on the versioned API health routes.
- `Service` `type: LoadBalancer` to expose the API.

The GitHub Actions workflow substitutes the ECR image tag (`IMAGE_PLACEHOLDER` in the Deployment) and creates the `shopsmart-api-env` secret from Terraform outputs.

## Local kubectl against EKS

After apply:

```bash
aws eks update-kubeconfig --region "$AWS_REGION" --name "$(terraform output -raw cluster_name)"
kubectl get pods,svc -n shopsmart
```

## Teardown

```bash
cd terraform
terraform destroy
```

Then remove the ECR images and, if desired, delete the bootstrap state bucket after emptying it. EKS and RDS incur ongoing cost until destroyed.

## IAM outline

The CI principal needs broad permissions for a student sandbox, including `eks:*`, `ec2:*` (for VPC and nodes), `iam:*` (EKS service roles), `ecr:*`, `s3:*`, `rds:*`, `dynamodb:*`, and `application-autoscaling` where applicable. Tighten policies for real production accounts.
