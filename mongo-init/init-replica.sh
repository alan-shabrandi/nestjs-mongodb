#!/bin/sh
set -e

echo "⏳ Starting MongoDB with replica set..."

# Start mongod in background
mongod --replSet rs0 --bind_ip_all &
MONGO_PID=$!

# Wait until mongod is ready
until mongosh --quiet --host localhost:27017 --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  echo "🕒 Waiting for mongod to accept connections..."
  sleep 2
done

echo "✅ mongod is up, checking replica set..."

# Check if already initialized
IS_INIT=$(mongosh --quiet --host localhost:27017 --eval "rs.status().ok" 2>/dev/null || echo "0")

if [ "$IS_INIT" != "1" ]; then
  echo "⚡ Initializing replica set..."
  mongosh --host localhost:27017 <<EOF
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27017" },
    { _id: 2, host: "mongo3:27017" }
  ]
});
EOF
else
  echo "✔️ Replica set already initialized"
fi

# Keep mongod running
wait $MONGO_PID
