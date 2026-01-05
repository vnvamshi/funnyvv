#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
#  VISTAVIEW SESSION SAVE - vv_save.sh
#  Run this to save current session state before closing
#═══════════════════════════════════════════════════════════════════════════════

CONTEXT_HOME="${HOME}/vistaview_context"
STATE="${CONTEXT_HOME}/session_state.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "💾 Saving session state..."

# Update timestamp in session state
if [[ -f "$STATE" ]]; then
    # Use temp file for safe update
    TMP=$(mktemp)
    jq --arg ts "$TIMESTAMP" '.last_updated = $ts' "$STATE" > "$TMP" && mv "$TMP" "$STATE"
    echo "✅ Session state saved at $TIMESTAMP"
else
    echo "⚠️  No session state file found at $STATE"
fi

# Also create a timestamped backup
BACKUP_DIR="${CONTEXT_HOME}/checkpoints"
mkdir -p "$BACKUP_DIR"
cp "$STATE" "${BACKUP_DIR}/session_state_$(date +%Y%m%d_%H%M%S).json"
echo "📦 Checkpoint created in $BACKUP_DIR"
