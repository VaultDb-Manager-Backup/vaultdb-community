# VaultDB Community Edition

Self-hosted, **open source database backup manager** built for developers and DevOps teams
who want **full control**, **reliable backups**, and **no vendor lock-in**.

VaultDB Community is production-ready for small teams, projects, and self-hosted environments.

Supports **MySQL**, **PostgreSQL**, **MongoDB**, and **MariaDB**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker Image](https://img.shields.io/badge/docker-ghcr.io-blue.svg)](https://github.com/VaultDb-Manager-Backup/vaultdb-community/pkgs/container/vaultdb-community)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

---

## Why VaultDB Community?

VaultDB Community focuses on one critical responsibility:

> **Create reliable, automated database backups — fully under your control.**

No SaaS lock-in.
No hidden processes.
No external dependencies you don't control.

You decide:
- Where backups are stored
- How often they run
- How long they are kept

---

## Features

- **Multi-Database Support**
  MySQL, PostgreSQL, MongoDB, MariaDB

- **Multi-Storage Support**
  AWS S3, MinIO, Cloudflare R2, DigitalOcean Spaces, Backblaze B2, FTP, SFTP, Local filesystem

- **Scheduled Backups**
  Cron-based automatic backups

- **Retention Policies**
  Automatic cleanup of old backups

- **Checksum Verification**
  Integrity validation for every backup file

- **Web UI**
  Simple dashboard for monitoring backup jobs

- **Built-in Authentication**
  HTTP Basic Auth available out of the box (configured via environment variables)

---

## Community Edition Philosophy

VaultDB Community is a **backup-first, production-ready** solution for
self-hosted environments.

Some capabilities are intentionally left out to keep the Community Edition:

- Simple to operate
- Easy to audit
- Transparent and predictable

Features such as **restore workflows, managed encryption, advanced access control,
and notifications** are planned for future or commercial editions.

---

## Quick Start (Docker)

The fastest way to run VaultDB Community is using Docker.

```bash
docker run -d \
  --name vaultdb \
  -p 3000:3000 \
  -e MONGODB_URI=mongodb://your-mongo:27017/vaultdb \
  -e REDIS_HOST=your-redis \
  ghcr.io/vaultdb-manager-backup/vaultdb-community:latest
```

---

## Authentication

VaultDB Community includes built-in HTTP Basic Authentication for the Web UI.

Authentication is enabled only by configuration.

### Enable Authentication

```env
AUTH_USERNAME=admin
AUTH_PASSWORD=your-secure-password
```

Once configured, the dashboard will require authentication automatically.

### Disable Authentication

```env
AUTH_USERNAME=
AUTH_PASSWORD=
```

### Notes

- Authentication applies only to the Web UI
- Internal services and workers are not affected
- `/health` endpoint is always public

---

## Docker Image Tags

| Tag | Description |
|-----|-------------|
| `latest` | Latest stable release |
| `x.y.z` | Specific version |
| `x.y` | Latest patch of a minor version |
| `x` | Latest minor of a major version |

```bash
docker pull ghcr.io/vaultdb-manager-backup/vaultdb-community:latest
```

---

## Platform Support

- **linux/amd64** — Most servers and VPS
- **linux/arm64** — Apple Silicon and ARM-based servers

---

## Supported Databases

| Database | Backup | Selective |
|----------|--------|-----------|
| MySQL | Yes | Tables |
| MariaDB | Yes | Tables |
| PostgreSQL | Yes | Tables |
| MongoDB | Yes | Collections |

---

## Supported Storage Providers

| Provider | Supported |
|----------|-----------|
| AWS S3 | Yes |
| MinIO | Yes |
| Cloudflare R2 | Yes |
| DigitalOcean Spaces | Yes |
| Backblaze B2 | Yes |
| FTP | Yes |
| SFTP | Yes |
| Local Filesystem | Yes |

---

## Documentation

- [Getting Started](https://docs.vaultdb.com.br/getting-started)
- [Configuration](https://docs.vaultdb.com.br/configuration)
- [CLI Reference](https://docs.vaultdb.com.br/cli)
- [API Reference](https://docs.vaultdb.com.br/api)
- [Roadmap](https://docs.vaultdb.com.br/roadmap)

---

## Contributing

Contributions are welcome and encouraged.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## VaultDB Pro

VaultDB Pro builds on top of the Community Edition and is designed for
teams and regulated environments.

Additional features include:

- Restore workflows
- Managed encryption
- Multi-tenancy
- RBAC (Role-Based Access Control)
- Notifications and alerting
- Priority support

Learn more at https://vaultdb.com.br

---

## Support & Community

- **GitHub Issues**: https://github.com/VaultDb-Manager-Backup/vaultdb-community/issues
- **Discord**: https://discord.gg/vaultdb
- **Documentation**: https://docs.vaultdb.com.br

---

## License

VaultDB Community Edition is [MIT licensed](LICENSE).
