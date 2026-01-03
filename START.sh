#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
# VISTAVIEW START v2.1
# - BACKUP FIRST (always)
# - Never touch GitHub root
# - Backend: 1116, Dashboard: 1117
#═══════════════════════════════════════════════════════════════════════════════

WORKING_DIR="$HOME/vistaview_WORKING"
DATA_FILE="$WORKING_DIR/data/ai-data.json"

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║  🚀 VISTAVIEW START v2.1                                                ║"
echo "╠══════════════════════════════════════════════════════════════════════════╣"
echo "║  Backend:   Port 1116                                                   ║"
echo "║  Dashboard: Port 1117                                                   ║"
echo "║  Frontend:  Port 5200                                                   ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 0: SHOW CURRENT DATA (Before anything)
# ═══════════════════════════════════════════════════════════════════════════════
echo "📊 Current AI Data Status:"
if [ -f "$DATA_FILE" ]; then
    INTERACTIONS=$(grep -o '"total_interactions": [0-9]*' "$DATA_FILE" 2>/dev/null | grep -o '[0-9]*' || echo "0")
    PATTERNS=$(grep -o '"learned_patterns": [0-9]*' "$DATA_FILE" 2>/dev/null | grep -o '[0-9]*' || echo "0")
    echo "   ✅ Data file exists"
    echo "   📈 Interactions: $INTERACTIONS"
    echo "   🧠 Patterns: $PATTERNS"
else
    echo "   ⚠️  No data file - will create fresh"
    INTERACTIONS=0
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1: BACKUP BEFORE ANYTHING (Best Practice)
# ═══════════════════════════════════════════════════════════════════════════════
echo "💾 Step 1: Creating backup before start..."
mkdir -p "$WORKING_DIR/.versions/hot"
if [ -f "$DATA_FILE" ]; then
    BACKUP_FILE="$WORKING_DIR/.versions/hot/ai-data_$(date +%Y%m%d_%H%M%S).json"
    cp "$DATA_FILE" "$BACKUP_FILE"
    echo "   ✅ Backed up to: $BACKUP_FILE"
else
    echo "   ⚠️  No data to backup"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2: STOP EXISTING PROCESSES
# ═══════════════════════════════════════════════════════════════════════════════
echo "⏹️  Step 2: Stopping existing processes..."
pkill -f "node.*server" 2>/dev/null
pkill -f "node.*learner" 2>/dev/null
pkill -f "node.*dashboard" 2>/dev/null
lsof -ti:1116 | xargs kill -9 2>/dev/null
lsof -ti:1117 | xargs kill -9 2>/dev/null
lsof -ti:3005 | xargs kill -9 2>/dev/null
lsof -ti:3006 | xargs kill -9 2>/dev/null
sleep 2
echo "   ✅ Cleared"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 3: ENSURE DIRECTORIES & FILES
# ═══════════════════════════════════════════════════════════════════════════════
echo "📁 Step 3: Checking structure..."
mkdir -p "$WORKING_DIR"/{backend,dashboard,data,logs,.versions/hot,.versions/warm}
mkdir -p "$HOME/vistaview_ARCHIVE"

# Create data file if missing (preserve existing!)
if [ ! -f "$DATA_FILE" ]; then
    cat > "$DATA_FILE" << 'EOF'
{
  "stats": {
    "total_interactions": 0,
    "learned_patterns": 0,
    "market_prices_learned": 0,
    "accuracy_score": 0,
    "started_at": "2026-01-03T00:00:00.000Z"
  },
  "memories": [],
  "tables": ["accounts","vendors","products","builders","projects","properties","services"],
  "ui_actions": [],
  "golden_conversations": []
}
EOF
    echo "   ✅ Created fresh data file"
else
    echo "   ✅ Data file preserved (${INTERACTIONS} interactions)"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 4: START BACKEND (Port 1116)
# ═══════════════════════════════════════════════════════════════════════════════
echo "🔧 Step 4: Starting Backend on port 1116..."
cd "$WORKING_DIR/backend"

# Check if server.cjs exists
if [ ! -f "server.cjs" ]; then
    echo "   ❌ server.cjs not found! Copy from Downloads."
    exit 1
fi

node server.cjs > "$WORKING_DIR/logs/backend.log" 2>&1 &
BACKEND_PID=$!
sleep 2

if curl -s http://localhost:1116/api/health > /dev/null 2>&1; then
    echo "   ✅ Backend running (PID: $BACKEND_PID)"
else
    echo "   ❌ Backend failed! Check logs:"
    tail -5 "$WORKING_DIR/logs/backend.log"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 5: START LEARNER
# ═══════════════════════════════════════════════════════════════════════════════
echo "🧠 Step 5: Starting Learning Engine..."
if [ -f "$WORKING_DIR/backend/learner.cjs" ]; then
    node "$WORKING_DIR/backend/learner.cjs" > "$WORKING_DIR/logs/learner.log" 2>&1 &
    echo "   ✅ Learner running (every 30 seconds)"
else
    echo "   ⚠️  learner.cjs not found - skipping"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 6: START DASHBOARD (Port 1117)
# ═══════════════════════════════════════════════════════════════════════════════
echo "📊 Step 6: Starting Dashboard on port 1117..."
cd "$WORKING_DIR/dashboard"

if [ ! -f "server.cjs" ]; then
    echo "   ❌ dashboard/server.cjs not found! Copy from Downloads."
else
    node server.cjs > "$WORKING_DIR/logs/dashboard.log" 2>&1 &
    sleep 2
    
    if curl -s http://localhost:1117/dashboard > /dev/null 2>&1; then
        echo "   ✅ Dashboard running"
    else
        echo "   ❌ Dashboard failed! Check logs."
    fi
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 7: START AUTO-PROTECT (if available)
# ═══════════════════════════════════════════════════════════════════════════════
echo "🛡️  Step 7: Starting Auto-Protect..."
if [ -f "$WORKING_DIR/auto-protect.sh" ]; then
    "$WORKING_DIR/auto-protect.sh" start 2>/dev/null || echo "   ⚠️  Auto-protect may already be running"
else
    echo "   ⚠️  auto-protect.sh not found - skipping"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 8: VERIFY
# ═══════════════════════════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════════════════════"
echo "📊 VERIFICATION"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "Backend (1116):"
curl -s http://localhost:1116/api/stats 2>/dev/null || echo "  Not responding"
echo ""
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║  ✅ VISTAVIEW RUNNING                                                   ║"
echo "╠══════════════════════════════════════════════════════════════════════════╣"
echo "║                                                                          ║"
echo "║  📊 Dashboard:   http://localhost:1117/dashboard                         ║"
echo "║  🔌 Backend:     http://localhost:1116/api/stats                         ║"
echo "║  🌐 Frontend:    http://localhost:5200                                   ║"
echo "║                                                                          ║"
echo "║  🛡️  GitHub root (v1.0.0) is PROTECTED                                   ║"
echo "║  💾 Data preserved: ${INTERACTIONS} interactions                              ║"
echo "║                                                                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
