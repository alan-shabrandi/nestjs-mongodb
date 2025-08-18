#!/bin/sh
set -e

echo "⏳ Waiting for MongoDB replica set to be ready..."

until mongosh --quiet --host mongo1:27017 --eval "rs.isMaster().ismaster" | grep "true" > /dev/null 2>&1; do
  echo "🕒 Replica set not ready yet, retrying in 2s..."
  sleep 2
done

echo "✅ MongoDB replica set is ready. Starting NestJS..."
exec "$@"
