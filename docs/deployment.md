# EC2 Deployment

## GitHub Actions to EC2

Deployment is handled by `.github/workflows/deploy-ec2.yml`.

Required secrets:

- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`
- `EC2_APP_DIR`
- `EC2_SERVICE_NAME`

## Deployment flow

1. GitHub Actions installs dependencies and builds both applications.
2. The workflow packages the repository into `release.tar.gz`.
3. The artifact is copied to the EC2 host over SSH.
4. `scripts/deploy-ec2.sh` extracts the release into `releases/<sha>`.
5. Dependencies are installed, apps are built, and the `current` symlink is updated.
6. The target service is restarted with `systemctl` or `pm2`.

## Idempotency

The deploy script is safe to rerun:

- uses `mkdir -p` for directories
- recreates the target release directory
- refreshes the `current` symlink with `ln -sfn`
- rebuilds the release from the provided artifact
