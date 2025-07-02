#!/bin/bash

# Create a backup directory if it doesn't exist
mkdir -p /home/ubuntu/db_backups

# Get current date for the backup filename
DATE=$(date +"%Y-%m-%d_%H-%M-%S")

# Create a backup of the SQLite database
cp /path/to/your/healthcare.db /home/ubuntu/db_backups/healthcare_$DATE.db

# Keep only the last 7 backups
ls -tp /home/ubuntu/db_backups/ | grep -v '/$' | tail -n +8 | xargs -I {} rm -- /home/ubuntu/db_backups/{}

echo "Database backup completed: healthcare_$DATE.db"
