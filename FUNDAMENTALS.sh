#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
#
#  ██╗   ██╗██╗███████╗████████╗ █████╗ ██╗   ██╗██╗███████╗██╗    ██╗
#  ██║   ██║██║██╔════╝╚══██╔══╝██╔══██╗██║   ██║██║██╔════╝██║    ██║
#  ██║   ██║██║███████╗   ██║   ███████║██║   ██║██║█████╗  ██║ █╗ ██║
#  ╚██╗ ██╗██║╚════██║   ██║   ██╔══██║╚██╗ ██╗██║██╔══╝  ██║███╗██║
#   ╚████╔╝██║███████║   ██║   ██║  ██║ ╚████╔╝██║███████╗╚███╔███╔╝
#    ╚═══╝ ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝  ╚═══╝ ╚═╝╚══════╝ ╚══╝╚══╝
#
#  FUNDAMENTAL RULES - NEVER MODIFY THIS FILE
#  Version: 1.0.0 (ROOT - IMMUTABLE)
#
#═══════════════════════════════════════════════════════════════════════════════

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  RULE 0: THIS FILE IS THE ROOT - NEVER TOUCH                              ║
# ║  Any script that runs MUST source this file first                         ║
# ║  Any script that tries to modify this file MUST be blocked                ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

#═══════════════════════════════════════════════════════════════════════════════
# PORTS (PERMANENT - MEMORIZE THESE)
#═══════════════════════════════════════════════════════════════════════════════
export VV_PORT_BACKEND=1116      # Backend API
export VV_PORT_DASHBOARD=1117   # Dashboard UI
export VV_PORT_FRONTEND=5200    # Frontend (dev team)
export VV_PORT_OLLAMA=11434     # Ollama AI

#═══════════════════════════════════════════════════════════════════════════════
# THEME (IMMUTABLE - NEVER CHANGE)
#═══════════════════════════════════════════════════════════════════════════════
export VV_TEAL_PRIMARY="#004236"
export VV_TEAL_SECONDARY="#007E67"
export VV_GOLD_PRIMARY="#905E26"
export VV_GOLD_SECONDARY="#F5EC9B"
export VV_GOLD_ACCENT="#B8860B"

#═══════════════════════════════════════════════════════════════════════════════
# BACKUP RULES (CRITICAL)
#═══════════════════════════════════════════════════════════════════════════════
# RULE 1: GitHub base version is ROOT - NEVER modify
# RULE 2: Version 1.0.0 is foundation - NEVER delete
# RULE 3: N-1 backups start from v1.1.0 onwards
# RULE 4: Always backup BEFORE any change
# RULE 5: Keep minimum 15 archive versions
# RULE 6: Auto-heal reverts to N-1, never to ROOT

export VV_ROOT_VERSION="v1.0.0"
export VV_WORKING_VERSION_START="v1.1.0"
export VV_GITHUB_IS_SACRED=true
export VV_BACKUP_BEFORE_CHANGE=true

#═══════════════════════════════════════════════════════════════════════════════
# PATHS (STANDARD)
#═══════════════════════════════════════════════════════════════════════════════
export VV_WORKING_DIR="$HOME/vistaview_WORKING"
export VV_GITHUB_DIR="$HOME/Documents/GitHub/funnyvv"
export VV_ARCHIVE_DIR="$HOME/vistaview_ARCHIVE"
export VV_DATA_FILE="$VV_WORKING_DIR/data/ai-data.json"

#═══════════════════════════════════════════════════════════════════════════════
# TEAM (CANONICAL - CEO ALWAYS HIGHLIGHTED)
#═══════════════════════════════════════════════════════════════════════════════
# CEO - ALWAYS SPOTLIGHT
export VV_CEO_NAME="Vamshi Krishna Vuppaladadium"
export VV_CEO_TITLE="Founder & Chief Executive Officer"

# TEAM MEMBERS
export VV_TEAM_1_NAME="Sunitha Tripuram"
export VV_TEAM_1_TITLE="IT Operations"

export VV_TEAM_2_NAME="Krishna Yashodha"
export VV_TEAM_2_TITLE="Chief Architect & IT Director"

export VV_TEAM_3_NAME="Vikram Jangam"
export VV_TEAM_3_TITLE="Advisor · Investor · Strategist"

#═══════════════════════════════════════════════════════════════════════════════
# VISTAVIEW IDENTITY (CANONICAL)
#═══════════════════════════════════════════════════════════════════════════════
export VV_TAGLINE="The world's first hands-free, self-learning real estate intelligence platform"
export VV_DESCRIPTION="It doesn't just display information — it listens, understands, builds, and evolves."

#═══════════════════════════════════════════════════════════════════════════════
# VOICE PROTOCOL (STANDARD)
#═══════════════════════════════════════════════════════════════════════════════
export VV_WAKE_PHRASE="Hey Vista"
export VV_INTERRUPT_WORDS="stop,wait,pause,hey,hold on"
export VV_CLOSE_WORDS="close,exit,cancel,back,go back"

#═══════════════════════════════════════════════════════════════════════════════
# UI RULES (IMMUTABLE)
#═══════════════════════════════════════════════════════════════════════════════
# - Theme colors NEVER change
# - ADDITIVE UI only (never replace)
# - Widget is GLOBAL (every page)
# - Teleprompter bar in EVERY modal
# - CEO always highlighted more than others

#═══════════════════════════════════════════════════════════════════════════════
# LEARNING RULES (IMMUTABLE)
#═══════════════════════════════════════════════════════════════════════════════
# - Learning NEVER stops
# - Log EVERYTHING
# - UI changes cannot erase data
# - Backup before modify

#═══════════════════════════════════════════════════════════════════════════════
# FUNCTION: Check if this file has been modified (SECURITY)
#═══════════════════════════════════════════════════════════════════════════════
VV_FUNDAMENTALS_HASH="DO_NOT_MODIFY_THIS_FILE"

check_fundamentals() {
    if [ "$VV_FUNDAMENTALS_HASH" != "DO_NOT_MODIFY_THIS_FILE" ]; then
        echo "❌ CRITICAL: FUNDAMENTALS.sh has been tampered with!"
        echo "   Restore from GitHub root immediately."
        exit 1
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# END OF FUNDAMENTALS - DO NOT ADD ANYTHING BELOW THIS LINE
#═══════════════════════════════════════════════════════════════════════════════
