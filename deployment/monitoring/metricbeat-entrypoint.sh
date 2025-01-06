#!/bin/bash
set -e

echo "Setting permissions for metricbeat.yml..."
chown root:root /usr/share/metricbeat/metricbeat.yml
chmod 600 /usr/share/metricbeat/metricbeat.yml

exec "$@"
