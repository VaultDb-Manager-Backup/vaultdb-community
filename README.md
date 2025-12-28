# VaultDB Community

Open source database backup manager with support for MySQL, PostgreSQL, MongoDB, and MariaDB.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
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

## Quick Start

### Using Docker Compose

```bash
# Clone the repository
git clone https://github.com/VaultDb-Manager-Backup/vaultdb-community.git
cd vaultdb-community

# Copy and configure environment variables
cp .docker/dev/.env.example .docker/dev/.env

# Start the services
docker compose -f .docker/dev/app.yaml up -d

# Access the dashboard
open http://localhost:3001
```

Default credentials: `admin` / `admin`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `AUTH_USERNAME` | Basic auth username (leave empty to disable) | - |
| `AUTH_PASSWORD` | Basic auth password (leave empty to disable) | - |
| `MONGODB_URI` | MongoDB connection string | `mongodb://mongo:27017/vaultdb` |
| `REDIS_HOST` | Redis host | `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `ENCRYPTION_KEY` | 32-character encryption key | - |
| `S3_ENDPOINT` | S3-compatible endpoint URL | - |
| `S3_REGION` | S3 region | `us-east-1` |
| `S3_ACCESS_KEY` | S3 access key | - |
| `S3_SECRET_KEY` | S3 secret key | - |
| `S3_BUCKET_NAME` | S3 bucket name | `backups` |

### Using npm/CLI

```bash
npm install -g @vaultdb/cli
vaultdb config init
vaultdb backup run
```

## Docker Compose Profiles

```bash
# Start core services only (app, worker, mongo, redis)
docker compose -f .docker/dev/app.yaml up -d

# Start with MinIO storage (S3-compatible)
docker compose -f .docker/dev/app.yaml --profile storage up -d

# Start with test databases (MySQL, PostgreSQL)
docker compose -f .docker/dev/app.yaml --profile databases up -d

# Start everything
docker compose -f .docker/dev/app.yaml --profile storage --profile databases up -d

# Scale workers
WORKER_REPLICAS=3 docker compose -f .docker/dev/app.yaml up -d
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
