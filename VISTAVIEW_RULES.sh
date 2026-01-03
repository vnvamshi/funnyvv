# ═══════════════════════════════════════════════════════════════════════════════
# VISTAVIEW GOLDEN RULES - MUST BE READ BEFORE ANY MODIFICATION
# ═══════════════════════════════════════════════════════════════════════════════
#
# These rules are NON-NEGOTIABLE. Every script, every change, every modification
# MUST follow these rules. Violation = system instability.
#
# ═══════════════════════════════════════════════════════════════════════════════

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                         🎨 UI RULES (IMMUTABLE)                             │
# └─────────────────────────────────────────────────────────────────────────────┘

UI_THEME_TEAL_PRIMARY="#004236"
UI_THEME_TEAL_SECONDARY="#007E67"
UI_THEME_GOLD_PRIMARY="#905E26"
UI_THEME_GOLD_SECONDARY="#F5EC9B"
UI_THEME_GOLD_ACCENT="#B8860B"

# RULE 1: UI theme is IMMUTABLE
# - Same colors, typography, spacing, icon style
# - NEVER change these values
# - NEVER override in components

# RULE 2: ADDITIVE UI ONLY
# - New icons/buttons/pages CAN be added
# - NEVER rewrite the whole layout
# - NEVER replace existing components

# RULE 3: NEVER MODIFY ~/vistaview_devteam/
# - That is the dev team's code
# - Only ADD overlays, never modify source

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                      🤖 AI WIDGET RULES                                     │
# └─────────────────────────────────────────────────────────────────────────────┘

# RULE 4: Widget is GLOBAL
# - Voice + teleprompter exists on EVERY page
# - Persists across navigation
# - Never disappears during route changes

# RULE 5: Widget controls EXISTING navbar
# - Never create duplicate icons
# - Never replace navigation
# - Only CONTROL existing elements

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                      🧠 LEARNING BACKEND RULES                              │
# └─────────────────────────────────────────────────────────────────────────────┘

# RULE 6: Learning backend NEVER STOPS
# - UI changes must NOT restart training jobs
# - UI changes must NOT erase database
# - Learning runs 24/7 independently

# RULE 7: If it isn't logged, it didn't happen
# - Log ALL transcript events
# - Log ALL TTS events (start/stop/interrupt)
# - Log ALL UI actions
# - Log ALL route changes
# - Log ALL API calls
# - Log ALL DB writes

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                      📍 ROUTE MAP (PERMANENT)                               │
# └─────────────────────────────────────────────────────────────────────────────┘

ROUTE_MAP=(
    "home:/"
    "about:/about"
    "how-it-works:/how-it-works"
    "partners:/partners"
    "lend-with-us:/lend-with-us"
    "real-estate:/real-estate"
    "catalog:/catalog"
    "interior:/interior"
    "services:/services"
    "sign-in:/sign-in"
)

# RULE 8: Agent NEVER violates route map
# - These routes are permanent
# - Never create duplicates
# - Never remove existing routes

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                      🎯 UI ACTION BUS (STANDARD)                            │
# └─────────────────────────────────────────────────────────────────────────────┘

UI_ACTIONS=(
    "UI_HIGHLIGHT"      # Highlight a nav item
    "UI_MOVE_CURSOR"    # Move cursor avatar to target
    "UI_CLICK"          # Click an element
    "UI_SCROLL_TO"      # Scroll to a section
    "UI_OPEN_MODAL"     # Open a modal by name
    "UI_CLOSE_MODAL"    # Close a modal
    "UI_NAVIGATE"       # Navigate to route
    "UI_BACK"           # Go back in history
)

# RULE 9: All UI actions must be logged
# - Every action → DB log
# - Include: action, target, timestamp, success/fail
# - Learn from success patterns

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                      🎤 VOICE PROTOCOL                                      │
# └─────────────────────────────────────────────────────────────────────────────┘

WAKE_PHRASE="Hey Vista"
INTERRUPT_PHRASES=("Hey" "Stop" "Wait" "Pause")

# RULE 10: Wake + Interrupt Protocol
# - Wake phrase activates listening
# - Interrupt immediately stops TTS
# - Pause current action chain
# - Ask: "Continue or change direction?"

# TTS Settings (American accent, slightly faster)
TTS_RATE_INCREASE=7          # 5-10% faster
TTS_PITCH="slightly_lower"   # More confident
TTS_VOICE="en-US"            # American English

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                      🏪 VENDOR FLOW (5 STEPS)                               │
# └─────────────────────────────────────────────────────────────────────────────┘

VENDOR_FLOW=(
    "1:Phone + OTP verification"
    "2:EIN/Tax ID + business basics"
    "3:Upload catalog (PDF/ZIP/CSV)"
    "4:Auto-parse, image crop/upscale, embeddings"
    "5:Publish + promo campaign"
)

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                      🏗️ BUILDER FLOW (5 STEPS)                              │
# └─────────────────────────────────────────────────────────────────────────────┘

BUILDER_FLOW=(
    "1:Phone + OTP verification"
    "2:EIN + company verification"
    "3:Upload CAD/PDF/GLB"
    "4:2D→3D conversion + GLB normalization"
    "5:Publish project + floor navigation"
)

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                      ✨ SEAMLESS WEBSITE REQUIREMENTS                       │
# └─────────────────────────────────────────────────────────────────────────────┘

# RULE 11: No full page reloads (client-side nav only)
# RULE 12: Persistent widget state across routes
# RULE 13: Animated cursor with intent (not teleporting)
# RULE 14: Predictable back behavior (stack-based history)
# RULE 15: Fast first response (< 1 second feedback)
# RULE 16: Explain what it's doing ("opening products...")
# RULE 17: Permission prompts ("Want me to read this aloud?")
# RULE 18: Graceful fallback (placeholder if section missing)
# RULE 19: Live HUD refresh (never looks dead)

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                      💾 BACKUP RULES                                        │
# └─────────────────────────────────────────────────────────────────────────────┘

# RULE 20: NEVER delete without backup
# RULE 21: ALWAYS create version before modifying
# RULE 22: Keep 10 versions in GitHub
# RULE 23: Keep 15 versions in local archive
# RULE 24: Auto-update README after every change
# RULE 25: Append to CHANGELOG after every version

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                      🔒 SECURITY RULES                                      │
# └─────────────────────────────────────────────────────────────────────────────┘

# RULE 26: NEVER commit secrets to git
# RULE 27: NEVER put passwords in scripts
# RULE 28: NEVER share tokens in chat/email
# RULE 29: Use environment variables for secrets
# RULE 30: Keep .env.local outside repo

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                      📊 PORTS (PERMANENT)                                   │
# └─────────────────────────────────────────────────────────────────────────────┘

PORT_FRONTEND=5200
PORT_BACKEND=3005
PORT_DASHBOARD=3006
PORT_OLLAMA=11434
PORT_DEVTEAM_FRONTEND=5173
PORT_DEVTEAM_BACKEND=3001

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                      🎓 TRAINING REQUIREMENTS                               │
# └─────────────────────────────────────────────────────────────────────────────┘

# Golden Dataset Target:
# - 20 vendor onboarding conversations
# - 20 builder onboarding conversations
# - 20 navigation demo conversations
# - 20 catalog ingestion tests

# Failure Replay Rule:
# - Save transcript + UI action log on every failure
# - Run nightly as regression tests
# - Agent must pass ALL replays before deploy

# ═══════════════════════════════════════════════════════════════════════════════
# END OF GOLDEN RULES
# ═══════════════════════════════════════════════════════════════════════════════
