#!/bin/bash
# Run this script with sudo on the host machine before starting containers

# Set virtual memory parameters
sysctl -w vm.max_map_count=262144

# Set swappiness
sysctl -w vm.swappiness=1

# Make settings persistent
echo "vm.max_map_count=262144" >> /etc/sysctl.conf
echo "vm.swappiness=1" >> /etc/sysctl.conf 