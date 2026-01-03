#!/bin/bash
# Syncs vistaview_WORKING to GitHub clone folder
# Uses GitHub Desktop for actual push

SOURCE="$HOME/vistaview_WORKING"
DEST="$HOME/Documents/GitHub/funnyvv"

echo "🔄 Syncing to GitHub folder..."

# Sync files (excluding node_modules, logs, backups)
rsync -av --delete \
  --exclude 'node_modules' \
  --exclude 'logs/*.log' \
  --exclude 'backups/*.json' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude '.env.local' \
  --exclude 'frontend_src.zip' \
  "$SOURCE/" "$DEST/"

echo "✅ Sync complete!"
echo ""
echo "Now open GitHub Desktop and commit/push the changes."
