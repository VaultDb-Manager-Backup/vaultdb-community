# Getting Started

This guide will help you get VaultDB Community up and running quickly.

## Prerequisites

- Node.js 18+ or Docker
- MongoDB 6+
- Redis 7+
- Database client tools (mysqldump, pg_dump, mongodump) for the databases you want to backup

## Installation

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/VaultDb-Manager-Backup/vaultdb-community.git
cd vaultdb-community

# Start with Docker Compose
docker-compose up -d
```

Access the web UI at http://localhost:3000

### Option 2: npm CLI

```bash
# Install globally
npm install -g @vaultdb/cli

# Initialize configuration
vaultdb config init

# This creates a vaultdb.yaml file in your current directory
```

### Option 3: From Source

```bash
# Clone the repository
git clone https://github.com/VaultDb-Manager-Backup/vaultdb-community.git
cd vaultdb-community

# Install dependencies
npm install

# Build
npm run build

# Start the server
npm run start

# In another terminal, start the worker
npm run start:worker
```

## Configuration

Create a `vaultdb.yaml` file:

```yaml
# Database to backup
database:
  type: postgres          # postgres, mysql, mariadb, mongodb
  host: localhost
  port: 5432
  user: myuser
  password: mypassword
  database: mydb

# Where to store backups
storage:
  type: s3
  endpoint: https://s3.amazonaws.com
  region: us-east-1
  bucket: my-backups
  accessKey: YOUR_ACCESS_KEY
  secretKey: YOUR_SECRET_KEY

# Backup settings
backup:
  schedule: "0 2 * * *"   # Cron expression (daily at 2 AM)
  retention: 7            # Keep last 7 backups
  encryption: true        # Encrypt backup files
```

## Your First Backup

### Using the CLI

```bash
# Create a backup configuration
vaultdb backup create --config ./vaultdb.yaml

# Run a backup immediately
vaultdb backup run

# List backups
vaultdb backup list

# Restore from backup
vaultdb restore <backup-id>
```

### Using the Web UI

1. Open http://localhost:3000
2. Click "New Backup Configuration"
3. Fill in your database details
4. Click "Test Connection" to verify
5. Save the configuration
6. Click "Run Backup" to start

## Environment Variables

You can also configure VaultDB using environment variables:

```bash
# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=myuser
DB_PASSWORD=mypassword
DB_DATABASE=mydb

# Storage
STORAGE_TYPE=s3
S3_ENDPOINT=https://s3.amazonaws.com
S3_REGION=us-east-1
S3_BUCKET=my-backups
S3_ACCESS_KEY=xxx
S3_SECRET_KEY=xxx

# Application
MONGODB_URI=mongodb://localhost:27017/vaultdb
REDIS_URL=redis://localhost:6379
ENCRYPTION_KEY=your-32-byte-encryption-key
```

## Next Steps

- [Configuration Reference](configuration.md)
- [CLI Reference](cli-reference.md)
- [API Reference](api-reference.md)
- [Storage Providers](storage-providers.md)
