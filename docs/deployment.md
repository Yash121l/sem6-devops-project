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

Create **Variables** (not secrets) so `terraform init` can use a shared S3 backend. State locking uses **S3 native lockfiles** (`use_lockfile` in [`terraform/versions.tf`](../terraform/versions.tf)); you do **not** need a DynamoDB table for locks.

| Variable | Example | Source |
|----------|---------|--------|
| `TF_STATE_BUCKET` | `myorg-shopsmart-tfstate-1234` | Output `state_bucket` from one-time `terraform/bootstrap` apply |
| `TF_STATE_KEY` | (optional) `shopsmart/eks/terraform.tfstate` | Default used by workflow if unset |

If you previously set `TF_STATE_DYNAMODB_TABLE`, you can remove it; it is no longer used. You may delete an old bootstrap DynamoDB lock table in the DynamoDB console after migrating.

### Optional: EKS IAM roles (restricted labs, e.g. Vocareum)

If Terraform fails with **`iam:CreateRole` AccessDenied** when creating `aws_iam_role.eks_cluster` / `eks_node`, your account cannot create IAM roles. Ask your instructor for **two existing role ARNs** (or create them in an account where `iam:CreateRole` is allowed), then set these **repository Variables** so CI passes `TF_VAR_*` into Terraform:

| Variable | Role trust / policies (summary) |
|----------|----------------------------------|
| `EKS_CLUSTER_IAM_ROLE_ARN` | Trust **eks.amazonaws.com** for `sts:AssumeRole`. Attach **AmazonEKSClusterPolicy** and **AmazonEKSVPCResourceController**. |
| `EKS_NODE_IAM_ROLE_ARN` | Trust **ec2.amazonaws.com**. Attach **AmazonEKSWorkerNodePolicy**, **AmazonEKS_CNI_Policy**, **AmazonEC2ContainerRegistryReadOnly**. |

Leave both unset if your IAM user may create roles; Terraform will create them as before.

**Troubleshooting `CreateNodegroup` … `Cross-account pass role is not allowed`**

- The node role ARN must be in the **same AWS account** as the EKS cluster (copy the full **Role ARN** from IAM → Roles → your lab node role). A typo in the account ID in the ARN triggers this error.
- Your CI principal also needs **`iam:PassRole`** on that node role (and often on the cluster role). If the lab still blocks `PassRole`, ask the instructor to allow passing the lab’s `LabEksNodeRole` to the EKS service.

Pull requests may run `terraform plan` with a **local** backend when `TF_STATE_BUCKET` is unset (plan only, no state written to the repo). Pushes to `main` **fail fast** if `TF_STATE_BUCKET` is missing, so production applies never run without remote state.

## One-time: bootstrap remote state

From your laptop (AWS CLI configured):

Use a **real** S3 bucket name: **lowercase** letters, numbers, and hyphens only (3–63 chars), globally unique—for example `yashlunawat-shopsmart-tfstate-7f2a`. Do not use the placeholder text from tutorials as the actual name.

```bash
cd terraform/bootstrap
terraform init
terraform apply -var='state_bucket_name=yashlunawat-shopsmart-tfstate-7f2a' -var='aws_region=us-east-1'
```

Copy the output `state_bucket` into the GitHub variable `TF_STATE_BUCKET` above. See also [`terraform/backend.hcl.example`](../terraform/backend.hcl.example) for local `terraform init -backend-config=...` flags.

The root module [`terraform/versions.tf`](../terraform/versions.tf) declares an `s3` backend with **placeholder** `bucket` and `key` values and `use_lockfile = true`. Override `bucket` and `key` with `-backend-config` (or a `backend.hcl` file), or use `terraform init -backend=false` for a throwaway local plan.

Use **Terraform 1.11 or newer** locally so `terraform validate` matches CI (`use_lockfile` requires 1.11+).

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

The CI principal needs broad permissions for a student sandbox, including `eks:*`, `ec2:*` (for VPC and nodes), `iam:*` (EKS service roles), `ecr:*`, `s3:*`, `rds:*`, and `application-autoscaling` where applicable. Tighten policies for real production accounts.
