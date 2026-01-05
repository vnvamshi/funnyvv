#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
#  VISTAVIEW SESSION BOOTSTRAP - vv_boot.sh
#  Run this at the start of ANY new session to restore full context
#═══════════════════════════════════════════════════════════════════════════════

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

CONTEXT_HOME="${HOME}/vistaview_context"
MANIFEST="${CONTEXT_HOME}/manifest.json"
STATE="${CONTEXT_HOME}/session_state.json"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  VISTAVIEW SESSION RESTORE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

# Check context exists
if [[ ! -d "$CONTEXT_HOME" ]]; then
    echo -e "${YELLOW}⚠️  Context directory not found. Creating fresh...${NC}"
    mkdir -p "$CONTEXT_HOME"/{checkpoints,logs,backups}
fi

# Load manifest
if [[ -f "$MANIFEST" ]]; then
    echo -e "${GREEN}✅ Loading manifest...${NC}"
    
    # Export key variables from manifest
    export VV_HOME=$(jq -r '.paths.project_home // empty' "$MANIFEST" 2>/dev/null || echo "$HOME/vistaview_WORKING")
    export VV_BACKUPS=$(jq -r '.paths.backups // empty' "$MANIFEST" 2>/dev/null || echo "$HOME/vistaview_BACKUPS")
    export VV_STANDARD=$(jq -r '.ruleset // empty' "$MANIFEST" 2>/dev/null || echo "VISTAVIEW_AGENTIC_STANDARD_V1.1")
    
    echo "   VV_HOME:     $VV_HOME"
    echo "   VV_BACKUPS:  $VV_BACKUPS"
    echo "   VV_STANDARD: $VV_STANDARD"
else
    echo -e "${YELLOW}⚠️  No manifest found. Using defaults...${NC}"
    export VV_HOME="$HOME/vistaview_WORKING"
    export VV_BACKUPS="$HOME/vistaview_BACKUPS"
    export VV_STANDARD="VISTAVIEW_AGENTIC_STANDARD_V1.1"
fi

# Load session state
if [[ -f "$STATE" ]]; then
    echo -e "${GREEN}✅ Loading session state...${NC}"
    
    LAST_BACKUP=$(jq -r '.last_backup // "never"' "$STATE" 2>/dev/null)
    LAST_MODE=$(jq -r '.last_used_mode // "Interactive"' "$STATE" 2>/dev/null)
    CURRENT_TASK=$(jq -r '.current_task // "none"' "$STATE" 2>/dev/null)
    PENDING_ITEMS=$(jq -r '.pending_items | length // 0' "$STATE" 2>/dev/null)
    
    echo "   Last backup:   $LAST_BACKUP"
    echo "   Last mode:     $LAST_MODE"
    echo "   Current task:  $CURRENT_TASK"
    echo "   Pending items: $PENDING_ITEMS"
    
    # Show pending items if any
    if [[ "$PENDING_ITEMS" -gt 0 ]]; then
        echo ""
        echo -e "${YELLOW}📋 PENDING ITEMS:${NC}"
        jq -r '.pending_items[]' "$STATE" 2>/dev/null | while read -r item; do
            echo "   • $item"
        done
    fi
else
    echo -e "${YELLOW}⚠️  No session state found. Starting fresh...${NC}"
fi

# Show quick status
echo ""
echo -e "${BLUE}───────────────────────────────────────────────────────────────${NC}"
echo -e "${GREEN}✅ Context restored! Ready to continue.${NC}"
echo ""
echo "Quick commands:"
echo "  vv_save    - Save current session state"
echo "  vv_status  - Show current status"
echo "  vv_backup  - Create full backup"
echo ""

# Create helper aliases
alias vv_save="bash ${CONTEXT_HOME}/vv_save.sh"
alias vv_status="bash ${CONTEXT_HOME}/vv_status.sh"
alias vv_backup="bash ${CONTEXT_HOME}/vv_backup.sh"

# Change to project directory if it exists
if [[ -d "$VV_HOME" ]]; then
    cd "$VV_HOME"
    echo -e "📁 Working directory: ${GREEN}$(pwd)${NC}"
fi
