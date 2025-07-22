#!/bin/bash

readonly BLUE_COLOR="blue"
readonly GREEN_COLOR="green"
readonly CORE_PROJECT_NAME="portfolio"
readonly DEPLOYMENT_LABEL="deployment.color"
readonly RETRY_MAX_ATTEMPTS="${RETRY_MAX_ATTEMPTS:-5}"
readonly RETRY_DELAY="${RETRY_DELAY:-5}"

execute_if_not_dry() {
    local description="$1"
    shift

    if [ "$DRY_RUN" = true ]; then
        indent_output echo "[DRY RUN] Would execute: $description"
        indent_output echo " Command: $*"
    else
        "$@"
    fi
}

execute_or_fail() {
    local description="$1"
    shift

    if [ "$DRY_RUN" = true ]; then
        indent_output echo "[DRY RUN] Would execute: $description"
        indent_output echo " Command: $*"
    else
        if ! "$@"; then
            echo "❌ Error: Failed to $description"
            exit 1
        fi
    fi
}

execute_or_warn() {
    local description="$1"
    shift

    if [ "$DRY_RUN" = true ]; then
        indent_output echo "[DRY RUN] Would execute: $description"
        indent_output echo " Command: $*"
    else
        if ! "$@"; then
            echo "⚠️  Warning: Failed to $description (continuing anyway)"
        fi
    fi
}

retry() {
    local max_attempts=$RETRY_MAX_ATTEMPTS
    local delay=$RETRY_DELAY
    local attempt=1
    local exit_code=0

    until "$@"; do
        exit_code=$?

        if [ "$attempt" -ge "$max_attempts" ]; then
            echo "❌ Command failed after $max_attempts attempts: $*" >&2
            return $exit_code
        fi

        echo "⚠️  Attempt $attempt failed, retrying in ${delay}s..." >&2
        sleep "$delay"

        delay=$((delay * 2))
        attempt=$((attempt + 1))
    done

    if [ $attempt -gt 1 ]; then
        echo "✅ Command succeeded after $attempt attempts"
    fi

    return 0
}

run_on_target() {
    if [[ -n "${DEPLOY_HOST}" ]]; then
        ssh deploy -q -E /dev/null "$*"
    else
        bash -c -- "$*"
    fi
}

require_var() {
    local var_name=$1
    local var_value=${!var_name:-}

    if [ -z "$var_value" ]; then
        echo "❌ Deployment Error: Required environment variable '${var_name}' is not set or is empty" >&2
        echo "   Please check your GitHub Actions secrets, workflow environment variables," >&2
        echo "   or deployment configuration to ensure '${var_name}' is properly defined." >&2
        exit 1
    fi
}

# Helper function for common error handling pattern
error_exit() {
    echo "❌ ERROR: $1" >&2
    exit 1
}

# Helper function for command execution with error handling
run_or_exit() {
    local description="$1"
    shift

    if ! "$@"; then
        error_exit "$description"
    fi
}

get_current_color() {
    local blue_count=$(count_color_containers "$BLUE_COLOR")
    local green_count=$(count_color_containers "$GREEN_COLOR")

    if [ "$blue_count" -gt 0 ] && [ "$green_count" -eq 0 ]; then
        echo "$BLUE_COLOR"
    elif [ "$green_count" -gt 0 ] && [ "$blue_count" -eq 0 ]; then
        echo "$GREEN_COLOR"
    elif [ "$blue_count" -gt 0 ] && [ "$green_count" -gt 0 ]; then
        local project_name_blue=$(get_project_name "$BLUE_COLOR")
        local project_name_green=$(get_project_name "$GREEN_COLOR")
        local blue_newest=$(docker inspect --format='{{.Created}}' "$(docker ps -q --filter "label=com.docker.compose.project=$project_name_blue" | head -1)" 2>/dev/null || echo '1970-01-01')
        local green_newest=$(docker inspect --format='{{.Created}}' "$(docker ps -q --filter "label=com.docker.compose.project=$project_name_green" | head -1)" 2>/dev/null || echo '1970-01-01')

        if [[ "$blue_newest" > "$green_newest" ]]; then
            echo "$BLUE_COLOR"
        else
            echo "$GREEN_COLOR"
        fi
    else
        echo "none"
    fi
}

get_deployment_state() {
    local blue_count=$(count_color_containers "$BLUE_COLOR")
    local green_count=$(count_color_containers "$GREEN_COLOR")

    if [ "$blue_count" -gt 0 ] && [ "$green_count" -gt 0 ]; then
        echo "both"
    elif [ "$blue_count" -gt 0 ]; then
        echo "$BLUE_COLOR"
    elif [ "$green_count" -gt 0 ]; then
        echo "$GREEN_COLOR"
    else
        echo "none"
    fi
}

is_deployment_in_progress() {
    local deployment_state=$(get_deployment_state)
    [ "$deployment_state" = "both" ]
}

switch_color() {
    [ "$1" = "$BLUE_COLOR" ] && echo "$GREEN_COLOR" || echo "$BLUE_COLOR"
}

get_project_name() {
    local color=$1
    local env_suffix=$([ "${PROD:-}" = "true" ] && echo "prod" || echo "staging")
    echo "${CORE_PROJECT_NAME}-${env_suffix}-${color}"
}

get_compose_files() {
    echo "-f docker-compose_web.yml"
}

refresh_proxy() {
    echo "🔄 Refreshing proxy configuration..."
}

count_containers() {
    local filters=$1
    docker ps ${filters} -q 2>/dev/null | wc -l | tr -d '\n' || echo 0
}

count_color_containers() {
    local color=$1
    local project_name=$(get_project_name "$color")
    docker ps --filter "label=com.docker.compose.project=$project_name" -q 2>/dev/null | wc -l
}

# Removed get_previous_release_path - no longer needed as we use direct container cleanup

cleanup_color_containers() {
    local color=$1
    local project_name=$(get_project_name "$color")
    
    # Get container IDs using the same filter logic as get_current_color
    local container_ids=$(run_on_target "docker ps --filter 'label=com.docker.compose.project=$project_name' -q 2>/dev/null")
    
    if [ -n "$container_ids" ]; then
        echo "🛑 Stopping $color containers from project: $project_name"
        # Stop containers directly by ID, with timeout
        run_on_target "echo '$container_ids' | xargs -r docker stop --timeout 10 2>/dev/null || true"
        
        echo "🗑️  Removing $color containers from project: $project_name"
        # Remove containers directly by ID
        run_on_target "echo '$container_ids' | xargs -r docker rm -f 2>/dev/null || true"
    else
        echo "ℹ️  No $color containers found to clean up"
    fi
}

wait_with_countdown() {
    local seconds=$1
    local message=$2

    echo -n "$message"
    for ((i=seconds; i>0; i--)); do
        echo -n " $i"
        sleep 1
    done
    echo " done!"
}

get_web_service_name() {
    echo "portfolio"
}
validate_deployment_env() {
    require_var "REPO_PROJECT_PATH"
    require_var "PROD"
    require_var "DOMAIN"

    export CURRENT_LINK_PATH="${REPO_PROJECT_PATH}/current"
    export RELEASES_PATH="${REPO_PROJECT_PATH}/releases"
}

get_health_check_status() {
    local statuses=$(docker ps --format '{{.Names}} {{.Status}}')
    local unhealthy_count=0
    local IFS=$'\n'
    for status in $statuses; do
        local name=$(echo $status | cut -d' ' -f1)
        local status=$(echo $status | cut -d' ' -f2-)
        if [[ "$status" == *"unhealthy"* ]]; then
            unhealthy_count=$((unhealthy_count + 1))
            echo "❌ Unhealthy: $name [$status]"
        else
            echo "✅ Healthy: $name [$status]"
        fi
    done
    return $unhealthy_count
}

wait_for_healthy_containers() {
    local project_name=$1
    local service_name=$2
    local expected_count=$3
    local max_attempts=60
    local attempt=0

    echo "⏳ Waiting for $service_name containers to be healthy..."

    while [ $attempt -lt $max_attempts ]; do
        healthy_count=$(count_containers "--filter label=com.docker.compose.project=${project_name} --filter label=com.docker.compose.service=${service_name} --filter health=healthy")

        if [[ "$healthy_count" -eq "$expected_count" ]]; then
            echo "✅ All $service_name containers are healthy ($healthy_count/$expected_count)"
            return 0
        fi

        echo "⏳ Healthy containers: $healthy_count/$expected_count (attempt $((attempt+1))/$max_attempts)"
        sleep 5
        attempt=$((attempt + 1))
    done

    echo "❌ Timeout waiting for $service_name containers to be healthy"
    return 1
}

list_releases() {
    local REPO_PROJECT_PATH=$1
    local RELEASES_PATH="${REPO_PROJECT_PATH}/releases"
    local CURRENT_LINK_PATH="${REPO_PROJECT_PATH}/current"

    echo "📋 Available releases:"
        if [ -d "$RELEASES_PATH" ]; then
            for release in $(ls -dt ${RELEASES_PATH}/*); do
                version=$(basename "$release")
                status=""

                if [ -L "$CURRENT_LINK_PATH" ] && [ "$(readlink -f "$CURRENT_LINK_PATH")" = "$(realpath "$release")" ]; then
                    status=" [CURRENT]"
                fi

                if [ -f "${release}/.failed" ]; then
                    status="${status} [FAILED]"
                fi

                indent_output echo "- ${version}${status}"
            done
        else
            indent_output echo "No releases found"
        fi
}

get_deployment_image_tag() {
    local color=$1
    local container=$(docker ps --filter "label=com.docker.compose.project=${CORE_PROJECT_NAME}-${color}" --format '{{.Names}}'| head -1)
    if [ -n "$container" ]; then
        docker inspect "${container}" --format '{{index .Config.Labels "deployment.image_tag"}}'
    else
        echo "unknown"
    fi
}

prefix_output() {
    local prefix="  "

    if [ $# -lt 2 ]; then
        echo "Error: prefix_output requires at least 2 arguments" >&2
        return 1
    fi

    prefix="$1"
    shift

    "$@" 2>&1 | sed "s/^/${prefix}/"

    return ${PIPESTATUS[0]}
}

indent_output() {
    local indent="   "

    if [[ "$1" =~ ^[[:space:]]+$ ]]; then
        indent="$1"
        shift
    fi

    prefix_output "$indent" "$@"
}

run_with_header() {
    local header="$1"
    shift

    echo "$header"
    indent_output "  " "$@"
}

substitute_env_vars() {
    local file_path="$1"

    if [ ! -f "$file_path" ]; then
        echo "❌ Error: File '$file_path' does not exist" >&2
        return 1
    fi

    while IFS= read -r line; do
        while [[ "$line" =~ \$\{([A-Za-z_][A-Za-z0-9_]*)\} ]]; do
            local var_name="${BASH_REMATCH[1]}"
            local var_value="${!var_name:-}"
            line="${line//\$\{${var_name}\}/${var_value}}"
        done
        echo "$line"
    done < "$file_path" > "$file_path.tmp" && mv "$file_path.tmp" "$file_path"
}

substitute_env_vars_remote() {
    local file_path="$1"

    if [[ -n "${DEPLOY_HOST}" ]]; then
        run_on_target "$(declare -f substitute_env_vars); substitute_env_vars '$file_path'"
    else
        substitute_env_vars "$file_path"
    fi
}
