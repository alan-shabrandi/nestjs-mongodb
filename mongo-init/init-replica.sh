#!/bin/sh
set -e

echo "⏳ Waiting for mongo1 to be ready..."
until mongosh --quiet --host mongo1:27017 --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  sleep 2
done

echo "⚡ Initializing replica set with arbiter..."
mongosh --host mongo1:27017 <<EOF
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27017" },
    { _id: 2, host: "mongo3:27017" },
    { _id: 3, host: "mongo-arbiter:27017", arbiterOnly: true }
  ]
});
EOF

echo "⚙️ Setting default write concern..."
mongosh --host mongo1:27017 <<EOF
db.adminCommand({
  setDefaultRWConcern: 1,
  defaultWriteConcern: { w: "majority" }
});
EOF

echo "✔️ Replica set initialized with arbiter"