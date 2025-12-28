# VaultDB Community

Open source database backup manager with support for MySQL, PostgreSQL, MongoDB, and MariaDB.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker Image](https://img.shields.io/badge/docker-ghcr.io-blue.svg)](https://github.com/VaultDb-Manager-Backup/vaultdb-community/pkgs/container/vaultdb-community)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## Features

- **Multi-Database Support**: MySQL, PostgreSQL, MongoDB, MariaDB
- **Multi-Storage**: AWS S3, MinIO, Cloudflare R2, FTP/SFTP, Local
- **Scheduled Backups**: Cron-based automatic backups
- **Encryption**: AES-256-GCM file encryption
- **Retention Policies**: Automatic cleanup of old backups
- **Checksum Verification**: Data integrity validation
- **REST API**: Programmatic backup management
- **Web UI**: Simple dashboard for monitoring
- **HTTP Basic Auth**: Optional dashboard protection

## Self-Hosting

### Quick Start with Docker

The easiest way to run VaultDB Community is using our pre-built Docker image:

```bash
docker run -d \
  --name vaultdb \
  -p 3000:3000 \
  -e MONGODB_URI=mongodb://your-mongo:27017/vaultdb \
  -e REDIS_HOST=your-redis \
  ghcr.io/vaultdb-manager-backup/vaultdb-community:latest
```

### Docker Compose (Recommended)

Create a `docker-compose.yaml` file:

```yaml
services:
  app:
    image: ghcr.io/vaultdb-manager-backup/vaultdb-community:latest
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/vaultdb
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - AUTH_USERNAME=admin
      - AUTH_PASSWORD=your-secure-password
    volumes:
      - backups:/app/backups
    depends_on:
      - mongo
      - redis
    restart: unless-stopped

  worker:
    image: ghcr.io/vaultdb-manager-backup/vaultdb-community:latest
    command: ["node", "packages/server/dist/server/src/worker/main.js"]
    environment:
      - MONGODB_URI=mongodb://mongo:27017/vaultdb
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    volumes:
      - backups:/app/backups
    depends_on:
      - mongo
      - redis
    restart: unless-stopped

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  mongo_data:
  redis_data:
  backups:
```

Start the services:

```bash
docker compose up -d

# Access the dashboard
open http://localhost:3000
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment mode | `production` |
| `AUTH_USERNAME` | Dashboard username (leave empty to disable auth) | - |
| `AUTH_PASSWORD` | Dashboard password (leave empty to disable auth) | - |
| `MONGODB_URI` | MongoDB connection string | `mongodb://mongo:27017/vaultdb` |
| `REDIS_HOST` | Redis host | `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `ENCRYPTION_KEY` | 32-character key for backup encryption | - |
| `BACKUP_CONCURRENCY` | Number of concurrent backup jobs | `2` |
| `RESTORE_CONCURRENCY` | Number of concurrent restore jobs | `2` |

### Available Tags

| Tag | Description |
|-----|-------------|
| `latest` | Latest stable release |
| `x.y.z` | Specific version (e.g., `0.1.1`) |
| `x.y` | Latest patch of minor version |
| `x` | Latest minor of major version |

```bash
# Pull specific version
docker pull ghcr.io/vaultdb-manager-backup/vaultdb-community:0.1.1

# Pull latest
docker pull ghcr.io/vaultdb-manager-backup/vaultdb-community:latest
```

### Platform Support

The Docker image supports multiple architectures:
- `linux/amd64` - Intel/AMD 64-bit (servers, most VPS)
- `linux/arm64` - ARM 64-bit (Apple Silicon M1/M2/M3, Raspberry Pi 4)

## Development

For local development with hot-reload:

```bash
# Clone the repository
git clone https://github.com/VaultDb-Manager-Backup/vaultdb-community.git
cd vaultdb-community

# Install dependencies
yarn install

# Start infrastructure (MongoDB, Redis)
docker compose -f .docker/dev/app.yaml up -d mongo redis

# Start development servers
yarn start:dev        # API server
yarn start:dev:worker # Worker (separate terminal)

# Or use Docker with source mounting
docker compose -f .docker/dev/app.yaml up -d
```

### Docker Compose Profiles (Development)

```bash
# Start core services only
docker compose -f .docker/dev/app.yaml up -d

# Start with MinIO storage (S3-compatible)
docker compose -f .docker/dev/app.yaml --profile storage up -d

# Start with test databases (MySQL, PostgreSQL)
docker compose -f .docker/dev/app.yaml --profile databases up -d

# Start everything
docker compose -f .docker/dev/app.yaml --profile storage --profile databases up -d
```

## Authentication

VaultDB Community supports optional HTTP Basic Authentication to protect the dashboard.

### Enable Authentication

Set the following environment variables:

```env
AUTH_USERNAME=admin
AUTH_PASSWORD=your-secure-password
```

### Disable Authentication

Leave the variables empty or remove them:

```env
AUTH_USERNAME=
AUTH_PASSWORD=
```

### Public Endpoints

The `/health` endpoint is always public for monitoring purposes:

```bash
curl http://localhost:3001/health
# {"status":"ok","timestamp":"..."}
```

## Documentation

- [Getting Started](docs/getting-started.md)
- [Configuration](docs/configuration.md)
- [CLI Reference](docs/cli-reference.md)
- [API Reference](docs/api-reference.md)

## Supported Databases

| Database   | Backup | Restore | Selective |
|------------|--------|---------|-----------|
| MySQL      | Yes    | Yes     | Tables    |
| MariaDB    | Yes    | Yes     | Tables    |
| PostgreSQL | Yes    | Yes     | Tables    |
| MongoDB    | Yes    | Yes     | Collections |

## Supported Storage Providers

| Provider          | Status |
|-------------------|--------|
| AWS S3            | Yes    |
| MinIO             | Yes    |
| Cloudflare R2     | Yes    |
| DigitalOcean Spaces | Yes  |
| Backblaze B2      | Yes    |
| FTP               | Yes    |
| SFTP              | Yes    |
| Local Filesystem  | Yes    |

## Configuration Example

```yaml
# vaultdb.yaml
database:
  type: postgres
  host: localhost
  port: 5432
  user: admin
  password: ${DB_PASSWORD}
  database: myapp

storage:
  type: s3
  endpoint: https://s3.amazonaws.com
  bucket: my-backups
  region: us-east-1

backup:
  schedule: "0 2 * * *"  # Daily at 2 AM
  retention: 7           # Keep last 7 backups
  encryption: true
```

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   CLI/API   │────▶│    Queue    │────▶│   Worker    │
└─────────────┘     │   (Redis)   │     └──────┬──────┘
                    └─────────────┘            │
                                               ▼
┌─────────────┐                       ┌─────────────┐
│  Database   │◀──────────────────────│   Backup    │
│  (Source)   │                       │  Strategy   │
└─────────────┘                       └──────┬──────┘
                                             │
                                             ▼
                                    ┌─────────────┐
                                    │   Storage   │
                                    │  Provider   │
                                    └─────────────┘
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## VaultDB Pro

Looking for enterprise features like multi-tenancy, RBAC, and priority support?
Check out [VaultDB Pro](https://vaultdb.com.br).

## Support

- [GitHub Issues](https://github.com/VaultDb-Manager-Backup/vaultdb-community/issues)
- [Discord Community](https://discord.gg/vaultdb)
- [Documentation](https://docs.vaultdb.com.br)
