#!/bin/bash
set -e

# Wait for MongoDB instances to be ready
sleep 30

# Initialize replica set
echo "Initializing replica set..."
mongosh --host mongodb1:27017 <<-'EOF'
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongodb1:27017", priority: 2 },
    { _id: 1, host: "mongodb2:27017", priority: 1 },
    { _id: 2, host: "mongodb3:27017", priority: 1 }
  ]
});
EOF

# Wait for replica set to initialize
echo "Waiting for replica set to initialize..."
sleep 20

# Check replica set status
echo "Checking replica set status..."
mongosh --host mongodb1:27017 --eval "rs.status();"

# Wait for primary to be elected
echo "Waiting for primary election..."
until mongosh --host mongodb1:27017 --eval "rs.isMaster().ismaster" | grep "true"; do
  echo "Waiting for primary..."
  sleep 5
done

echo "MongoDB replica set setup completed"