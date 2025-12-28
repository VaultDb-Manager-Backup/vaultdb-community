# VaultDB Community - Dockerfile
# Multi-stage build for optimized production image

ARG VERSION=0.1.0

# ===========================================
# Stage 1: Build
# ===========================================
FROM node:20-alpine AS builder

ARG VERSION

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy root package files first
COPY package.json ./
COPY yarn.lock* ./

# Copy workspace package files
COPY packages/core/package.json ./packages/core/
COPY packages/server/package.json ./packages/server/
COPY packages/cli/package.json ./packages/cli/

# Install all dependencies (including dev for build)
RUN yarn install --frozen-lockfile || npm ci

# Copy source code and configs
COPY tsconfig.json ./
COPY packages ./packages

# Build all packages
RUN yarn build

# ===========================================
# Stage 2: Production
# ===========================================
FROM node:20-alpine AS production

ARG VERSION

LABEL org.opencontainers.image.title="VaultDB Community"
LABEL org.opencontainers.image.description="Database Backup Manager - Community Edition"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.source="https://github.com/VaultDb-Manager-Backup/vaultdb-community"
LABEL org.opencontainers.image.licenses="MIT"

ENV APP_VERSION=${VERSION}

WORKDIR /app

# Install runtime dependencies for database clients
RUN apk add --no-cache \
    # PostgreSQL client
    postgresql16-client \
    # MySQL/MariaDB client
    mysql-client \
    mariadb-client \
    # MongoDB tools
    mongodb-tools \
    # Utilities
    bash \
    curl \
    tar \
    gzip

# Create non-root user
RUN addgroup -g 1001 -S vaultdb && \
    adduser -S vaultdb -u 1001 -G vaultdb

# Copy package files for structure
COPY package.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/server/package.json ./packages/server/
COPY packages/cli/package.json ./packages/cli/

# Copy node_modules from builder (production deps are included)
COPY --from=builder /app/node_modules ./node_modules

# Copy built packages from builder
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/server/dist ./packages/server/dist

# Copy views and public folders (not compiled)
# Edge.js expects /app/views in production
COPY packages/server/views ./views
COPY packages/server/public ./public

# Create backup directories
RUN mkdir -p /app/backups /app/restores && \
    chown -R vaultdb:vaultdb /app

# Switch to non-root user
USER vaultdb

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Default command (API server)
CMD ["node", "packages/server/dist/server/src/api/main.js"]
