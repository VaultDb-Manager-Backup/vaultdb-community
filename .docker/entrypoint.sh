#!/bin/sh
set -e

# Ensure backup directories exist and are writable
mkdir -p /app/backups /app/restores

# If running as root, fix permissions and switch to vaultdb user
if [ "$(id -u)" = "0" ]; then
  chown -R vaultdb:vaultdb /app/backups /app/restores
  exec su-exec vaultdb "$@"
fi

# If already running as vaultdb, just execute
exec "$@"
