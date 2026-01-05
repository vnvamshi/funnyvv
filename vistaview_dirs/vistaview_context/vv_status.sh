#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
#  VISTAVIEW STATUS - vv_status.sh
#  Quick status check for current session
#═══════════════════════════════════════════════════════════════════════════════

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

CONTEXT_HOME="${HOME}/vistaview_context"
STATE="${CONTEXT_HOME}/session_state.json"
VV_HOME="${HOME}/vistaview_WORKING"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  VISTAVIEW STATUS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

# Session info
if [[ -f "$STATE" ]]; then
    echo ""
    echo -e "${GREEN}📋 SESSION INFO:${NC}"
    echo "   Task:    $(jq -r '.current_task // "none"' "$STATE")"
    echo "   Status:  $(jq -r '.task_status // "unknown"' "$STATE")"
    echo "   Updated: $(jq -r '.last_updated // "never"' "$STATE")"
    
    # Pending items
    PENDING=$(jq -r '.pending_items | length' "$STATE" 2>/dev/null || echo "0")
    if [[ "$PENDING" -gt 0 ]]; then
        echo ""
        echo -e "${YELLOW}⏳ PENDING ($PENDING items):${NC}"
        jq -r '.pending_items[]' "$STATE" 2>/dev/null | head -5 | while read -r item; do
            echo "   ❌ $item"
        done
        [[ "$PENDING" -gt 5 ]] && echo "   ... and $((PENDING - 5)) more"
    fi
fi

# Project status
echo ""
echo -e "${GREEN}📁 PROJECT STATUS:${NC}"
if [[ -d "$VV_HOME" ]]; then
    echo "   Project: ${GREEN}EXISTS${NC} at $VV_HOME"
    
    # Check if dev server might be running
    if lsof -i :5180 >/dev/null 2>&1; then
        echo "   Frontend: ${GREEN}RUNNING${NC} on port 5180"
    else
        echo "   Frontend: ${YELLOW}STOPPED${NC}"
    fi
    
    if lsof -i :3001 >/dev/null 2>&1; then
        echo "   Backend:  ${GREEN}RUNNING${NC} on port 3001"
    else
        echo "   Backend:  ${YELLOW}STOPPED${NC}"
    fi
else
    echo "   Project: ${RED}NOT FOUND${NC} at $VV_HOME"
fi

# Recent transcripts
echo ""
echo -e "${GREEN}📜 RECENT TRANSCRIPTS:${NC}"
if [[ -f "$STATE" ]]; then
    jq -r '.recent_sessions[-3:][] | "   \(.id): \(.summary)"' "$STATE" 2>/dev/null
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
