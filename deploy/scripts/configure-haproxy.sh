#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "${SCRIPT_DIR}/common-lib.sh" ]; then
    source "${SCRIPT_DIR}/common-lib.sh"
else
    echo "❌ ERROR: common-lib.sh not found at ${SCRIPT_DIR}/common-lib.sh"
    exit 1
fi

readonly HAPROXY_BASE_DIR="/srv/haproxy"
readonly HAPROXY_CONFIGS_DIR="${HAPROXY_BASE_DIR}/configs"
readonly HAPROXY_COMPOSE_FILE="${HAPROXY_BASE_DIR}/docker-compose.yml"
readonly HAPROXY_MAIN_CONFIG="${HAPROXY_CONFIGS_DIR}/00-haproxy.cfg"
readonly BACKEND_TEMPLATE_PATH="${SCRIPT_DIR}/../haproxy.backend.cfg"
readonly HAPROXY_COMPOSE_TEMPLATE="${SCRIPT_DIR}/../docker-compose-haproxy.yml"

show_usage() {
    cat << EOF
Usage: $0 [add|remove] <backend_name>

Commands:
  add <backend_name>     - Add backend configuration (uses \$DOMAIN and \$RELEASE_TYPE env vars)
  remove <backend_name>  - Remove backend configuration

Environment Variables:
  DOMAIN        - Domain name for the backend (required for add command)
  RELEASE_TYPE  - Release type (e.g., prod, staging) (required for add command)

Examples:
  DOMAIN=badblocks.dev RELEASE_TYPE=prod $0 add portfolio-prod
  $0 remove portfolio-staging
EOF
}

setup_infrastructure_dirs_and_certs() {
    local certs_dir="${HAPROXY_BASE_DIR}/certs"    
    echo "🏗️  Setting up HAProxy directories..."
    run_or_exit "Failed to setup HAProxy directories" run_on_target "mkdir -p '${HAPROXY_BASE_DIR}' '${HAPROXY_CONFIGS_DIR}' && chmod 755 '${HAPROXY_BASE_DIR}' '${HAPROXY_CONFIGS_DIR}'"
    # Add certificate setup if environment variables are set
    if [[ -n "${CF_PEM_CERT:-}" ]] && [[ -n "${CF_PEM_CA:-}" ]]; then     
        echo "🏗️  Setting up HAProxy certificates..." 
        run_or_exit "Failed to setup HAProxy directories" run_on_target "mkdir -p '${certs_dir}' && chmod 755 '${certs_dir}'"
        
        run_or_exit "Failed to install crt-${DOMAIN}.pem certificate file" run_on_target "cat > '${certs_dir}/crt-${DOMAIN}.pem' << 'EOF'
$CF_PEM_CERT
EOF
chmod 644 '${certs_dir}/crt-${DOMAIN}.pem'"
        
        run_or_exit "Failed to install Cloudflare CA file" run_on_target "cat > '${certs_dir}/ca.pem' << 'EOF'
$CF_PEM_CA
EOF
chmod 644 '${certs_dir}/ca.pem'"
    fi
}

init_haproxy_infrastructure() {
    echo "🚀 Initializing HAProxy infrastructure..."

    setup_infrastructure_dirs_and_certs

    # Check both config files in parallel and prepare uploads
    local main_config_missing=false
    local compose_config_missing=false
    local upload_commands=()

    if ! run_on_target "test -f '${HAPROXY_MAIN_CONFIG}'"; then
        main_config_missing=true
        upload_commands+=("scp '${SCRIPT_DIR}/../haproxy.cfg' deploy:'${HAPROXY_MAIN_CONFIG}'")
        echo "📋 Main HAProxy config needs creation"
    else
        echo "✅ Main config already exists"
    fi

    if ! run_on_target "test -f '${HAPROXY_COMPOSE_FILE}'"; then
        [ ! -f "$HAPROXY_COMPOSE_TEMPLATE" ] && error_exit "HAProxy compose template not found at $HAPROXY_COMPOSE_TEMPLATE"
        compose_config_missing=true
        upload_commands+=("scp '${HAPROXY_COMPOSE_TEMPLATE}' deploy:'${HAPROXY_COMPOSE_FILE}'")
        echo "🐳 Docker-compose config needs creation"
    else
        echo "✅ Docker-compose config already exists"
    fi

    # Upload missing config files in parallel if any are needed
    if [ ${#upload_commands[@]} -gt 0 ]; then
        echo "📤 Uploading configuration files..."
        for cmd in "${upload_commands[@]}"; do
            eval "$cmd" || error_exit "Failed to upload config file: $cmd"
        done &
        wait
        echo "✅ Configuration files uploaded"
    fi

    # Start HAProxy service (creates network automatically via compose)
    if ! is_haproxy_running; then
        echo "▶️ Starting HAProxy service..."

        if run_on_target "cd '${HAPROXY_BASE_DIR}' && docker compose up -d"; then
            echo "✅ HAProxy containers started"
            
            echo "⏳ Waiting for HAProxy to be healthy..."
            if wait_for_haproxy_healthy; then
                echo "✅ HAProxy is healthy and ready"
            else
                echo "❌ ERROR: HAProxy failed to become healthy"
                return 1
            fi
        else
            echo "❌ ERROR: Failed to start HAProxy containers"
            exit 1
        fi
    else
        echo "✅ HAProxy is already running"
    fi

    echo "✅ HAProxy infrastructure ready"
}

wait_for_haproxy_healthy() {
    local attempts=0
    local max_attempts=30

    while [ $attempts -lt $max_attempts ]; do
        attempts=$((attempts + 1))

        # Get status in single call and parse more efficiently
        local container_info
        container_info=$(run_on_target "cd '${HAPROXY_BASE_DIR}' && docker compose ps haproxy --format '{{.Status}}'")

        # Check if container is healthy or running (single grep operation)
        if echo "$container_info" | grep -qE "(health: healthy|Up.*[0-9])"; then
            return 0
        fi

        [ $attempts -lt $max_attempts ] && sleep 2
    done

    echo "❌ ERROR: HAProxy failed to become healthy after $max_attempts attempts"
    echo "   Last status: $container_info"
    return 1
}

is_haproxy_running() {
    run_on_target "cd '${HAPROXY_BASE_DIR}' && docker compose ps haproxy --format '{{.Status}}' | grep -q 'Up'"
}

is_haproxy_infrastructure_ready() {
    if ! run_on_target "test -d '${HAPROXY_BASE_DIR}'"; then
        return 1
    fi

    if ! run_on_target "test -f '${HAPROXY_MAIN_CONFIG}'"; then
        return 1
    fi

    if ! run_on_target "test -f '${HAPROXY_COMPOSE_FILE}'"; then
        return 1
    fi

    if ! is_haproxy_running; then
        return 1
    fi

    return 0
}

add_backend() {
    local backend_name="$1"

    [[ -z "$backend_name" ]] && {
        show_usage
        error_exit "add command requires backend_name"
    }

    [[ -z "${DOMAIN:-}" ]] && {
        show_usage
        error_exit "DOMAIN environment variable is required for add command"
    }

    [[ -z "${RELEASE_TYPE:-}" ]] && {
        show_usage
        error_exit "RELEASE_TYPE environment variable is required for add command"
    }

    echo "➕ Adding backend: $backend_name"

    # TODO: MAKE THIS IDEMPOTENT AND REMOVE THE is_haproxy_infrastructure_ready CHECK
    if ! is_haproxy_infrastructure_ready; then
        echo "🔧 Initializing HAProxy infrastructure..."
        init_haproxy_infrastructure
    fi

    local backend_config_path="${HAPROXY_CONFIGS_DIR}/${backend_name}.cfg"

    [ ! -f "$BACKEND_TEMPLATE_PATH" ] && error_exit "Backend template not found at $BACKEND_TEMPLATE_PATH"

    local temp_config="/tmp/${backend_name}.cfg"
    echo "📝 Generating backend config from template..."
    cp "$BACKEND_TEMPLATE_PATH" "$temp_config"
    
    substitute_env_vars "$temp_config"
    echo "✅ Backend config generated"

    echo "📤 Uploading backend config..."
    scp "$temp_config" deploy:"$backend_config_path" || { rm -f "$temp_config"; error_exit "Failed to upload backend config"; }
    echo "✅ Backend config uploaded"

    rm -f "$temp_config"

    echo "🔄 Reloading HAProxy..."
    reload_haproxy
}

remove_backend() {
    local backend_name="$1"

    [ -z "$backend_name" ] && { show_usage; error_exit "remove command requires backend_name"; }

    echo "➖ Removing backend: $backend_name"

    if ! is_haproxy_infrastructure_ready; then
        echo "🔧 Initializing HAProxy infrastructure..."
        init_haproxy_infrastructure
    fi

    local backend_config_path="${HAPROXY_CONFIGS_DIR}/${backend_name}.cfg"

    if run_on_target "test -f '${backend_config_path}'"; then
        run_on_target "rm -f '${backend_config_path}'"
        echo "✅ Backend configuration removed"
        reload_haproxy
    else
        echo "✅ Backend configuration already absent"
    fi
}

reload_haproxy() {
    if ! is_haproxy_infrastructure_ready; then
        echo "🔧 Infrastructure not ready, initializing..."
        init_haproxy_infrastructure
        return 0  # Infrastructure init already handles health check
    fi

    run_or_exit "Failed to send reload signal to HAProxy" run_on_target "cd '${HAPROXY_BASE_DIR}' && docker kill -s HUP haproxy"
    
    # Brief pause for reload to take effect, then single health check
    sleep 1
    if wait_for_haproxy_healthy; then
        echo "✅ HAProxy configuration reloaded"
    else
        error_exit "HAProxy became unhealthy after reload"
    fi
}

validate_backend_name() {
    local backend_name="$1"
    [ -z "$backend_name" ] && error_exit "Backend name cannot be empty"
    [[ "$backend_name" =~ ^[a-zA-Z0-9][a-zA-Z0-9_-]*$ ]] 2>/dev/null || error_exit "Invalid backend name '$backend_name'. Can only contain alphanumeric characters, hyphens, and underscores."
}

main() {
    local command="${1:-}"

    case "$command" in
        "add")
            local backend_name="${2:-}"

            validate_backend_name "$backend_name"
            add_backend "$backend_name"
            ;;
        "remove")
            local backend_name="${2:-}"

            validate_backend_name "$backend_name"
            remove_backend "$backend_name"
            ;;
        "help"|"-h"|"--help")
            show_usage
            ;;
        *)
            show_usage
            error_exit "Unknown command '$command'"
            ;;
    esac

    echo "✅ HAProxy configuration completed"
}

[[ "${BASH_SOURCE[0]}" == "${0}" ]] && main "$@"
