#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
#  vv_resume.sh - Run this and paste output into new Claude session
#═══════════════════════════════════════════════════════════════════════════════

VV_HOME="$HOME/vistaview_WORKING"
VV_CONTEXT="$HOME/vistaview_context"

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  VISTAVIEW SESSION RESTORE - Paste everything below into new Claude chat"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "RESTORE_CONTEXT: $VV_CONTEXT/manifest.json"
echo "RESUME_SESSION_STATE: $VV_CONTEXT/session_state.json"
echo "FOLLOW_RULES: VISTAVIEW_AGENTIC_STANDARD_v1.1"
echo ""
echo "---"
echo ""
echo "PROJECT: VistaView Agentic System"
echo "LOCATION: $VV_HOME"
echo "DEV SERVER: cd $VV_HOME && npm run dev"
echo "URL: http://localhost:5180"
echo ""

# Show current task
if [[ -f "$VV_CONTEXT/session_state.json" ]]; then
    echo "CURRENT TASK: $(jq -r '.current_task // "Unknown"' "$VV_CONTEXT/session_state.json")"
    echo "STATUS: $(jq -r '.task_status // "Unknown"' "$VV_CONTEXT/session_state.json")"
    echo ""
    echo "NEXT STEPS:"
    jq -r '.what_to_do_next[]' "$VV_CONTEXT/session_state.json" 2>/dev/null | while read -r step; do
        echo "  - $step"
    done
fi

echo ""
echo "---"
echo ""
echo "KEY FILES:"
echo "  Voice: src/agentic/VoiceBrain.ts (singleton)"
echo "  UI: src/agentic/AgenticBar.tsx (useVoice hook)"
echo "  Pattern: Audio Mutex - speaking stops listening"
echo ""
echo "VOICE COMMANDS:"
echo "  Pause: 'hey', 'stop', 'pause', 'wait'"
echo "  Resume: 'resume', 'continue', 'go ahead'"
echo "  Test: say 'seven zero three' → captures '703'"
echo ""
echo "Help me continue from where we left off."
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
