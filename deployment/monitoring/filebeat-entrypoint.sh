#!/bin/bash
set -e

echo "Setting permissions for filebeat.yml..."
chown root:root /usr/share/filebeat/filebeat.yml
chmod 600 /usr/share/filebeat/filebeat.yml

exec "$@"
