#!/bin/bash
set -euo pipefail

# Blue-Green deployment script for Nuxt app
# Usage: ./deploy-blue-green.sh

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common-lib.sh"

# Validate required environment variables
require_var "IMAGE_TAR"
require_var "PROD"
require_var "DOMAIN"
require_var "WIREGUARD_ENDPOINT_HOST"
require_var "REPO_PROJECT_PATH"
require_var "DEPLOY_HOST"

validate_deployment_env

# Modify project path based on environment for proper isolation
if [ "$PROD" = "true" ]; then
    REPO_PROJECT_PATH="${REPO_PROJECT_PATH}-prod"
    echo "🏭 Production deployment path: $REPO_PROJECT_PATH"
else
    REPO_PROJECT_PATH="${REPO_PROJECT_PATH}-staging"
    echo "🧪 Staging deployment path: $REPO_PROJECT_PATH"
fi

# Update derived paths
CURRENT_LINK_PATH="${REPO_PROJECT_PATH}/current"
RELEASES_PATH="${REPO_PROJECT_PATH}/releases"

echo "⚙️ Docker host: $DOCKER_HOST"

# Generate deployment timestamp
DEPLOYMENT_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RELEASE_TYPE=$([ "${PROD}" = "true" ] && echo "prod" || echo "staging")
NEW_RELEASE_PATH="${RELEASES_PATH}/${DEPLOYMENT_TIMESTAMP}"

# Use Git SHA for image tag (if available, otherwise use timestamp)
if [ -n "${GIT_SHA:-}" ]; then
    IMAGE_TAG="sha-${GIT_SHA:0:7}"
else
    IMAGE_TAG="dev-${DEPLOYMENT_TIMESTAMP}"
fi

# Check for deployment in progress
if is_deployment_in_progress; then
    echo "⚠️ ERROR: Deployment appears to be in progress (both colors are running)"
    echo "   This might indicate a previous deployment didn't complete properly."
    echo "   Please check the deployment status and clean up any old containers."
    echo "   If you are sure that the deployment is complete, you can run the following command to clean up the old containers:"
    echo "   ssh deploy 'cd ${REPO_PROJECT_PATH}/current && docker compose -p portfolio-\$ENV-blue down && docker compose -p portfolio-\$ENV-green down' (where \$ENV is prod or staging)"
    exit 1
fi

CURRENT_COLOR=$(get_current_color)
NEW_COLOR=$(switch_color "$CURRENT_COLOR")

echo "🎨 Current deployment color: $CURRENT_COLOR"
echo "🎨 New deployment color: $NEW_COLOR"

echo "🔍 Resolving WIREGUARD_ENDPOINT_HOST IP address..."
WIREGUARD_ENDPOINT_IP=$(run_on_target "dig +short $WIREGUARD_ENDPOINT_HOST | tail -n1")
[ -z "$WIREGUARD_ENDPOINT_IP" ] && error_exit "Failed to resolve IP address for WIREGUARD_ENDPOINT_HOST"

echo "📁 Creating release directory..."
run_on_target "mkdir -p '${NEW_RELEASE_PATH}'"

echo "🏷️ Setting environment variables..."
echo "IMAGE_TAG=\"${IMAGE_TAG}\"" >> .env
echo "DEPLOYMENT_COLOR=\"${NEW_COLOR}\"" >> .env
echo "RELEASE_TYPE=\"${RELEASE_TYPE}\"" >> .env
echo "WIREGUARD_ENDPOINT_IP=\"${WIREGUARD_ENDPOINT_IP}\"" >> .env

# Set computed image name based on release type
if [ "$RELEASE_TYPE" = "staging" ]; then
    IMAGE_NAME="portfolio-dev:${IMAGE_TAG}"
else
    IMAGE_NAME="portfolio:${IMAGE_TAG}"
fi
echo "IMAGE_NAME=\"${IMAGE_NAME}\"" >> .env

echo "📋 Copying deployment files..."
scp deploy/docker-compose.yml deploy/haproxy.cfg .env deploy:"${NEW_RELEASE_PATH}/"

echo "📁 Ensuring static-assets directory exists..."
run_on_target "mkdir -p '/srv/static-assets'"

echo "🐳 Loading Docker image (${IMAGE_TAR})..."
docker load -i "${IMAGE_TAR}"

PROJECT_NAME=$(get_project_name "$NEW_COLOR")
WEB_SERVICE_NAME=$(get_web_service_name)

echo "🔵🟢 Starting ${NEW_COLOR} deployment..."
run_on_target "cd '${NEW_RELEASE_PATH}' && docker compose -p '${PROJECT_NAME}' up --no-build -d"

echo "⏳ Waiting for new containers to be healthy..."
if ! wait_for_healthy_containers "$PROJECT_NAME" "$WEB_SERVICE_NAME" 1; then
    echo "❌ New deployment failed to become healthy. Rolling back..."
    run_on_target "cd '${NEW_RELEASE_PATH}' && docker compose -p '${PROJECT_NAME}' down"
    run_on_target "rm -rf '${NEW_RELEASE_PATH}'"
    error_exit "New deployment failed to become healthy"
fi

echo "✅ New deployment is healthy!"

echo "🔗 Updating current deployment symlink..."
if [ -L "$CURRENT_LINK_PATH" ]; then
    PREVIOUS_RELEASE=$(run_on_target "readlink -f '${CURRENT_LINK_PATH}'")
    run_on_target "echo '${PREVIOUS_RELEASE}' > '${NEW_RELEASE_PATH}/.previous_version'"
fi

run_on_target "ln -sfn '${NEW_RELEASE_PATH}' '${CURRENT_LINK_PATH}'"

if [ "$CURRENT_COLOR" != "none" ]; then
    echo "🧹 Cleaning up previous deployment (${CURRENT_COLOR})..."
    cleanup_color_containers "$CURRENT_COLOR"
fi

echo "🗑️ Cleaning up old releases (keep last 5)..."
run_on_target "cd '${RELEASES_PATH}' && ls -t | tail -n +6 | xargs -r rm -rf"

echo "🎉 Deployment completed successfully!"
echo "📊 Current deployment: ${NEW_COLOR} (${IMAGE_TAG})"
echo "🌍 Domain: ${DOMAIN}"
