#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
#  VISTAVIEW FULL BACKUP - vv_backup.sh
#  Creates timestamped backup of entire project
#═══════════════════════════════════════════════════════════════════════════════

VV_HOME="${HOME}/vistaview_WORKING"
VV_BACKUPS="${HOME}/vistaview_BACKUPS"
CONTEXT_HOME="${HOME}/vistaview_context"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "📦 Creating full backup..."

# Create backup directory
BACKUP_DIR="${VV_BACKUPS}/FULL_${TIMESTAMP}"
mkdir -p "$BACKUP_DIR"

# Backup project (excluding node_modules)
if [[ -d "$VV_HOME" ]]; then
    echo "   Backing up project..."
    rsync -a --exclude='node_modules' --exclude='.git' "$VV_HOME/" "$BACKUP_DIR/project/"
fi

# Backup context
if [[ -d "$CONTEXT_HOME" ]]; then
    echo "   Backing up context..."
    cp -r "$CONTEXT_HOME" "$BACKUP_DIR/context/"
fi

# Update session state with backup time
STATE="${CONTEXT_HOME}/session_state.json"
if [[ -f "$STATE" ]]; then
    TMP=$(mktemp)
    jq --arg ts "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" '.last_backup = $ts' "$STATE" > "$TMP" && mv "$TMP" "$STATE"
fi

echo "✅ Backup complete: $BACKUP_DIR"
echo "   Size: $(du -sh "$BACKUP_DIR" | cut -f1)"
