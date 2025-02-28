#!/bin/bash
set -e

# Wait for MongoDB instances to be ready
sleep 30

# Initialize replica set
mongosh --host mongodb1:27017 <<'EOF'
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongodb1:27017" },
    { _id: 1, host: "mongodb2:27017" },
    { _id: 2, host: "mongodb3:27017" }
  ]
});
EOF

# Wait for replica set to initialize
sleep 10

# Check replica set status
mongosh --host mongodb1:27017 --eval "rs.status();" 