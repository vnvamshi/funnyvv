#!/bin/bash
# VistaView Backup Script
# Creates timestamped backup of AI data

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/vistaview_WORKING/backups"
DATA_DIR="$HOME/vistaview_WORKING/data"

mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup: $TIMESTAMP"

# Backup AI data
cp "$DATA_DIR/ai-data.json" "$BACKUP_DIR/ai-data_$TIMESTAMP.json"

# Create manifest
cat > "$BACKUP_DIR/manifest_$TIMESTAMP.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "files": [
    "ai-data_$TIMESTAMP.json"
  ],
  "stats": $(grep -o '"total_interactions": [0-9]*' "$DATA_DIR/ai-data.json" | head -1)
}
EOF

echo "✅ Backup complete: $BACKUP_DIR/ai-data_$TIMESTAMP.json"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "ai-data_*.json" -mtime +7 -delete
find "$BACKUP_DIR" -name "manifest_*.json" -mtime +7 -delete

echo "🧹 Old backups cleaned"
