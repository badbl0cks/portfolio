#!/bin/bash
set -euo pipefail

# Generate Docker tags based on git ref and environment
# Usage: ./generate-docker-tags.sh IMAGE_BASE GIT_SHA GIT_REF PROD

if [ $# -ne 4 ]; then
    echo "Error: Invalid number of arguments" > /dev/stderr
    echo "Usage: $0 IMAGE_BASE GIT_SHA GIT_REF PROD" > /dev/stderr
    exit 1
fi

IMAGE_BASE="$1"
GIT_SHA="$2"
GIT_REF="$3"
PROD="$4"

# Validate inputs
if [ -z "$IMAGE_BASE" ] || [ -z "$GIT_SHA" ]; then
    echo "Error: IMAGE_BASE and GIT_SHA cannot be empty" > /dev/stderr
    exit 1
fi

# Always include SHA tags
echo "${IMAGE_BASE}:sha-${GIT_SHA:0:7}"
echo "${IMAGE_BASE}:sha-${GIT_SHA}"

# Handle version tags
if [[ "$GIT_REF" =~ ^refs/tags/v([0-9]+)\.([0-9]+)\.([0-9]+)(-.*)?$ ]]; then
  MAJOR="${BASH_REMATCH[1]}"
  MINOR="${BASH_REMATCH[2]}"
  PATCH="${BASH_REMATCH[3]}"
  PRERELEASE="${BASH_REMATCH[4]}"

  if [[ -z "$PRERELEASE" ]] && [[ "$PROD" == "true" ]]; then
    echo "${IMAGE_BASE}:latest"
    echo "${IMAGE_BASE}:stable"
    [[ "$MAJOR" -gt 0 ]] && echo "${IMAGE_BASE}:v${MAJOR}"
    echo "${IMAGE_BASE}:v${MAJOR}.${MINOR}"
    echo "${IMAGE_BASE}:v${MAJOR}.${MINOR}.${PATCH}"
  else
    echo "${IMAGE_BASE}:latest-staging"
    echo "${IMAGE_BASE}:staging"
    echo "${IMAGE_BASE}:v${MAJOR}.${MINOR}.${PATCH}-prerelease"
  fi
elif [[ "$PROD" == "false" ]]; then
  echo "${IMAGE_BASE}:latest-staging"
  echo "${IMAGE_BASE}:staging"
fi
