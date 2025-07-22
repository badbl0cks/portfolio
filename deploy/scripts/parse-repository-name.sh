#!/bin/bash
set -euo pipefail

# Parse repository name and generate project paths
# Usage: ./parse-repository-name.sh GITHUB_REPOSITORY

if [ $# -eq 0 ]; then
    echo "Error: No repository name provided" > /dev/stderr
    echo "Usage: $0 GITHUB_REPOSITORY" > /dev/stderr
    exit 1
fi

GITHUB_REPOSITORY="$1"

echo "GITHUB_REPOSITORY: $GITHUB_REPOSITORY" > /dev/stderr

if [[ "$GITHUB_REPOSITORY" == *".git" ]]; then
  if [[ "$GITHUB_REPOSITORY" == "https://"* ]]; then
    echo "GITHUB_REPOSITORY ends in .git and is an HTTPS URI" > /dev/stderr
    REPO=$(echo "$GITHUB_REPOSITORY" | sed 's/\.git$//' | cut -d'/' -f4-5 | sed 's/[^a-zA-Z0-9\/-]/-/g')
  elif [[ "$GITHUB_REPOSITORY" == "git@"* ]]; then
    echo "GITHUB_REPOSITORY ends in .git and is an SSH URI" > /dev/stderr
    REPO=$(echo "$GITHUB_REPOSITORY" | sed 's/\.git$//' | cut -d':' -f2 | sed 's/[^a-zA-Z0-9\/-]/-/g')
  else
    echo "GITHUB_REPOSITORY ends in .git and is not a URI" > /dev/stderr
    REPO=$(echo "$GITHUB_REPOSITORY" | sed 's/\.git$//' | sed 's/[^a-zA-Z0-9\/-]/-/g')
  fi
else
  echo "GITHUB_REPOSITORY is not a URI" > /dev/stderr
  REPO=$(echo "$GITHUB_REPOSITORY" | sed 's/[^a-zA-Z0-9\/-]/-/g')
fi

REPO_NAME_ONLY=$(echo "$REPO" | cut -d'/' -f2)
# Default path - will be modified by deployment script based on environment
REPO_PROJECT_PATH="/srv/${REPO_NAME_ONLY}"

# Output in format that can be sourced - using printf %q for proper escaping
printf "export REPO=%q\n" "$REPO"
printf "export REPO_NAME_ONLY=%q\n" "$REPO_NAME_ONLY"
printf "export REPO_PROJECT_PATH=%q\n" "$REPO_PROJECT_PATH" 