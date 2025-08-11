# Stage 1: Runtime dependencies
FROM node:24-slim AS deps
SHELL ["bash", "-exc"]

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y python3 make g++ curl net-tools && rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN --mount=type=bind,source=package-lock.json,target=package-lock.json --mount=type=bind,source=package.json,target=package.json npm ci --omit=dev && npm cache clean --force

# Stage 2: Build dependencies - Includes dev dependencies for build
FROM node:24-slim AS build-deps
SHELL ["bash", "-exc"]

WORKDIR /app

ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y python3 make g++ curl net-tools && rm -rf /var/lib/apt/lists/*

# Install all dependencies including dev dependencies for build
RUN --mount=type=bind,source=package-lock.json,target=package-lock.json --mount=type=bind,source=package.json,target=package.json npm ci && npm cache clean --force

# Stage 3: Source and build - Cache invalidated when source code changes
FROM build-deps AS builder
SHELL ["bash", "-exc"]

WORKDIR /app

# Copy source code (excluding semantic-release artifacts)
COPY nuxt.config.ts tsconfig.json tailwind.config.js eslint.config.mjs package.json ./
COPY app/ ./app/
COPY server/ ./server/
COPY public/ ./public/

# Build the application (this is cached unless source code changes)
RUN npx nuxt build

# Stage 4: Runtime assembly - Only invalidated by version/metadata changes
FROM deps AS runtime

ARG VERSION=0.0.0

WORKDIR /app

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder /app/.output ./.output

# Copy package configs
# These change frequently but don't affect the expensive build steps above
COPY package.json package-lock.json ./

# Set runtime environment
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
ENV NODE_ENV=production
ENV NODE_PATH=/app/node_modules
ENV APP_VERSION=${VERSION}
ENV PUID=1000
ENV PGID=1000

# Set up data directory and permissions
RUN mkdir -p data && chown -R ${PUID}:${PGID} data && chown -R ${PUID}:${PGID} /app && chmod 755 /app data

EXPOSE 3000

USER ${PUID}:${PGID}

CMD ["node", ".output/server/index.mjs"]
