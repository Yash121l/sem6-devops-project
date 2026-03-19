#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# scripts/bootstrap.sh
#
# ONE-TIME setup script. Run this ONCE to prepare your AWS account so the
# GitHub Actions pipeline can take over from there.
#
# Prerequisites:
#   - AWS CLI v2 installed and configured (aws configure)
#   - Terraform >= 1.5.0 installed
#   - GitHub CLI (gh) installed and authenticated  [optional]
#
# Usage:
#   chmod +x scripts/bootstrap.sh
#   AWS_REGION=us-east-1 GITHUB_REPO=you/repo ./scripts/bootstrap.sh
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

PROJECT_NAME="${PROJECT_NAME:-shopsmart}"
AWS_REGION="${AWS_REGION:-us-east-1}"
GITHUB_REPO="${GITHUB_REPO:-}"
TF_STATE_BUCKET="${PROJECT_NAME}-tf-state"
TF_LOCK_TABLE="${PROJECT_NAME}-tf-lock"
INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/infrastructure"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ─── Preflight checks ─────────────────────────────────────────────────────────
info "Checking prerequisites …"
command -v aws       >/dev/null || error "AWS CLI not found. Install: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
command -v terraform >/dev/null || error "Terraform not found. Install: https://developer.hashicorp.com/terraform/install"
command -v gh        >/dev/null || warn  "GitHub CLI not found — you will need to add GitHub secrets manually."

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
CALLER=$(aws sts get-caller-identity --query Arn --output text)
success "AWS account: $ACCOUNT_ID  ($CALLER)"

# ─── Terraform state bucket ───────────────────────────────────────────────────
info "Checking Terraform state bucket ($TF_STATE_BUCKET) …"
if ! aws s3api head-bucket --bucket "$TF_STATE_BUCKET" 2>/dev/null; then
  info "Creating S3 bucket $TF_STATE_BUCKET in $AWS_REGION …"
  if [ "$AWS_REGION" = "us-east-1" ]; then
    aws s3api create-bucket --bucket "$TF_STATE_BUCKET" --region "$AWS_REGION"
  else
    aws s3api create-bucket \
      --bucket "$TF_STATE_BUCKET" \
      --region "$AWS_REGION" \
      --create-bucket-configuration LocationConstraint="$AWS_REGION"
  fi
  aws s3api put-bucket-versioning \
    --bucket "$TF_STATE_BUCKET" \
    --versioning-configuration Status=Enabled
  aws s3api put-bucket-encryption \
    --bucket "$TF_STATE_BUCKET" \
    --server-side-encryption-configuration \
    '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
  aws s3api put-public-access-block \
    --bucket "$TF_STATE_BUCKET" \
    --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
  success "State bucket created."
else
  success "State bucket already exists."
fi

# ─── DynamoDB lock table ───────────────────────────────────────────────────────
info "Checking DynamoDB lock table ($TF_LOCK_TABLE) …"
if ! aws dynamodb describe-table --table-name "$TF_LOCK_TABLE" 2>/dev/null; then
  info "Creating DynamoDB table $TF_LOCK_TABLE …"
  aws dynamodb create-table \
    --table-name "$TF_LOCK_TABLE" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "$AWS_REGION"
  aws dynamodb wait table-exists --table-name "$TF_LOCK_TABLE"
  success "Lock table created."
else
  success "Lock table already exists."
fi

# ─── Terraform init ───────────────────────────────────────────────────────────
info "Initialising Terraform …"
terraform -chdir="$INFRA_DIR" init \
  -backend-config="bucket=$TF_STATE_BUCKET" \
  -backend-config="key=terraform.tfstate" \
  -backend-config="region=$AWS_REGION" \
  -backend-config="dynamodb_table=$TF_LOCK_TABLE" \
  -backend-config="encrypt=true"
success "Terraform initialised."

# ─── Terraform plan ───────────────────────────────────────────────────────────
info "Running terraform plan …"
terraform -chdir="$INFRA_DIR" plan \
  -var="aws_region=$AWS_REGION" \
  -var="api_image_tag=latest" \
  -out="$INFRA_DIR/bootstrap.tfplan"

echo ""
echo -e "${YELLOW}Review the plan above. Press ENTER to apply, or Ctrl-C to abort.${NC}"
read -r

# ─── Terraform apply ──────────────────────────────────────────────────────────
info "Applying infrastructure …"
terraform -chdir="$INFRA_DIR" apply -auto-approve "$INFRA_DIR/bootstrap.tfplan"
success "Infrastructure provisioned."

# ─── Capture outputs ──────────────────────────────────────────────────────────
WEBSITE=$(terraform -chdir="$INFRA_DIR" output -raw cloudfront_domain)
API_URL=$(terraform -chdir="$INFRA_DIR" output -raw api_url)

# ─── Set GitHub Actions variable (if gh CLI available) ────────────────────────
if command -v gh >/dev/null && [ -n "$GITHUB_REPO" ]; then
  info "Setting GitHub Actions variable AWS_REGION …"
  gh variable set AWS_REGION --body "$AWS_REGION" --repo "$GITHUB_REPO" || true
  success "GitHub variable AWS_REGION set."
fi

# ─── Final summary ────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         ShopSmart Bootstrap Complete 🎉                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  🌐 Website:  ${BLUE}$WEBSITE${NC}"
echo -e "  🔌 API:      ${BLUE}$API_URL${NC}"
echo ""
echo -e "  ${YELLOW}ACTION REQUIRED — add these 2 secrets to GitHub Actions:${NC}"
echo -e "  (Settings → Secrets and variables → Actions → New repository secret)"
echo ""
echo -e "    ${YELLOW}AWS_ACCESS_KEY_ID${NC}      ← your IAM access key"
echo -e "    ${YELLOW}AWS_SECRET_ACCESS_KEY${NC}  ← your IAM secret key"
echo ""
echo -e "  After that, push to ${YELLOW}main${NC} — the pipeline handles everything automatically."
echo ""
