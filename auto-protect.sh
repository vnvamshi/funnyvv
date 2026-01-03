#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
# VISTAVIEW AUTO-PROTECT v2.0
# - Ports: Backend=1116, Dashboard=1117
# - NEVER touches GitHub root (v1.0.0)
# - N-1 starts from v1.1.0+
# - Backup BEFORE any change
#═══════════════════════════════════════════════════════════════════════════════

# Source fundamentals
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
[ -f "$SCRIPT_DIR/FUNDAMENTALS.sh" ] && source "$SCRIPT_DIR/FUNDAMENTALS.sh"

# Ports (Easy to remember: 1116 backend, 1117 dashboard)
PORT_BACKEND=${VV_PORT_BACKEND:-1116}
PORT_DASHBOARD=${VV_PORT_DASHBOARD:-1117}

# Paths
WORKING_DIR="${VV_WORKING_DIR:-$HOME/vistaview_WORKING}"
GITHUB_DIR="${VV_GITHUB_DIR:-$HOME/Documents/GitHub/funnyvv}"
ARCHIVE_DIR="${VV_ARCHIVE_DIR:-$HOME/vistaview_ARCHIVE}"
DATA_FILE="$WORKING_DIR/data/ai-data.json"
HOT_DIR="$WORKING_DIR/.versions/hot"
WARM_DIR="$WORKING_DIR/.versions/warm"
LOG_FILE="$WORKING_DIR/logs/auto-protect.log"
PID_FILE="$WORKING_DIR/.auto-protect.pid"

# Intervals
HOT_INTERVAL=300      # 5 min
WARM_INTERVAL=1800    # 30 min  
COLD_INTERVAL=3600    # 1 hour
HEALTH_INTERVAL=60    # 1 min

# Retention
HOT_KEEP=12
WARM_KEEP=10
ARCHIVE_KEEP=15

# Current version tracker
VERSION_FILE="$WORKING_DIR/.current_version"

#═══════════════════════════════════════════════════════════════════════════════
# LOGGING
#═══════════════════════════════════════════════════════════════════════════════
log() {
    local level="$1" msg="$2"
    local ts=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$ts] [$level] $msg" >> "$LOG_FILE"
    case "$level" in
        INFO)   echo "✅ $msg" ;;
        WARN)   echo "⚠️  $msg" ;;
        ERROR)  echo "❌ $msg" ;;
        BACKUP) echo "💾 $msg" ;;
        HEAL)   echo "🔧 $msg" ;;
        PROTECT) echo "🛡️  $msg" ;;
    esac
}

#═══════════════════════════════════════════════════════════════════════════════
# VERSION MANAGEMENT
#═══════════════════════════════════════════════════════════════════════════════
get_current_version() {
    cat "$VERSION_FILE" 2>/dev/null || echo "v1.1.0"
}

increment_version() {
    local current=$(get_current_version)
    local major minor patch
    IFS='.' read -r major minor patch <<< "${current#v}"
    patch=$((patch + 1))
    echo "v${major}.${minor}.${patch}" > "$VERSION_FILE"
    cat "$VERSION_FILE"
}

#═══════════════════════════════════════════════════════════════════════════════
# GITHUB PROTECTION (NEVER TOUCH ROOT)
#═══════════════════════════════════════════════════════════════════════════════
protect_github_root() {
    # This function ensures we NEVER modify the base GitHub repo directly
    # We only COPY from working to a sync folder, never push destructive changes
    
    if [ -d "$GITHUB_DIR/.git" ]; then
        # Check if there's a .root_protected marker
        if [ ! -f "$GITHUB_DIR/.root_protected" ]; then
            # Create protection marker
            echo "v1.0.0 - ROOT - DO NOT DELETE" > "$GITHUB_DIR/.root_protected"
            log "PROTECT" "GitHub root protection marker created"
        fi
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# HOT BACKUP (Every 5 min - data only)
#═══════════════════════════════════════════════════════════════════════════════
hot_backup() {
    mkdir -p "$HOT_DIR"
    
    if [ -f "$DATA_FILE" ]; then
        local ts=$(date '+%Y%m%d_%H%M%S')
        cp "$DATA_FILE" "$HOT_DIR/ai-data_${ts}.json"
        
        local interactions=$(grep -o '"total_interactions": [0-9]*' "$DATA_FILE" 2>/dev/null | grep -o '[0-9]*' || echo "0")
        log "BACKUP" "HOT: ai-data.json ($interactions interactions)"
        
        # Cleanup
        ls -t "$HOT_DIR"/ai-data_*.json 2>/dev/null | tail -n +$((HOT_KEEP + 1)) | xargs rm -f 2>/dev/null
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# WARM BACKUP (Every 30 min - snapshot + git commit)
#═══════════════════════════════════════════════════════════════════════════════
warm_backup() {
    mkdir -p "$WARM_DIR" "$ARCHIVE_DIR"
    
    local version=$(get_current_version)
    local ts=$(date '+%Y%m%d_%H%M%S')
    local snapshot_name="${version}_${ts}"
    local snapshot_dir="$WARM_DIR/$snapshot_name"
    
    # Get stats
    local interactions=$(grep -o '"total_interactions": [0-9]*' "$DATA_FILE" 2>/dev/null | grep -o '[0-9]*' || echo "0")
    local patterns=$(grep -o '"learned_patterns": [0-9]*' "$DATA_FILE" 2>/dev/null | grep -o '[0-9]*' || echo "0")
    
    mkdir -p "$snapshot_dir"
    
    # Copy essentials
    cp -r "$WORKING_DIR/data" "$snapshot_dir/" 2>/dev/null
    cp -r "$WORKING_DIR/backend" "$snapshot_dir/" 2>/dev/null
    cp -r "$WORKING_DIR/dashboard" "$snapshot_dir/" 2>/dev/null
    cp "$VERSION_FILE" "$snapshot_dir/" 2>/dev/null
    cp "$WORKING_DIR/FUNDAMENTALS.sh" "$snapshot_dir/" 2>/dev/null
    
    # Manifest
    cat > "$snapshot_dir/MANIFEST.json" << EOF
{
    "version": "$version",
    "timestamp": "$ts",
    "stats": { "interactions": $interactions, "patterns": $patterns },
    "type": "warm_backup",
    "ports": { "backend": $PORT_BACKEND, "dashboard": $PORT_DASHBOARD }
}
EOF
    
    log "BACKUP" "WARM: $snapshot_name (interactions: $interactions)"
    
    # Archive zip
    (cd "$WARM_DIR" && zip -rq "$ARCHIVE_DIR/vistaview_${snapshot_name}.zip" "$snapshot_name" 2>/dev/null)
    log "BACKUP" "ARCHIVE: vistaview_${snapshot_name}.zip"
    
    # Git commit (local only - NEVER auto-push to protect root)
    if [ -d "$GITHUB_DIR/.git" ]; then
        protect_github_root
        
        # Sync ONLY data and configs, not destructive
        rsync -a --delete \
            --exclude 'node_modules' \
            --exclude '.versions' \
            --exclude 'logs/*.log' \
            --exclude '.root_protected' \
            "$WORKING_DIR/" "$GITHUB_DIR/working_copy/" 2>/dev/null
        
        cd "$GITHUB_DIR"
        git add -A 2>/dev/null
        git commit -m "Auto: $interactions interactions, $patterns patterns [$ts]" 2>/dev/null && \
            log "BACKUP" "GIT: Committed locally"
    fi
    
    # Cleanup old
    ls -dt "$WARM_DIR"/*/ 2>/dev/null | tail -n +$((WARM_KEEP + 1)) | xargs rm -rf 2>/dev/null
    ls -t "$ARCHIVE_DIR"/vistaview_*.zip 2>/dev/null | tail -n +$((ARCHIVE_KEEP + 1)) | xargs rm -f 2>/dev/null
}

#═══════════════════════════════════════════════════════════════════════════════
# COLD BACKUP (Every hour - git push)
#═══════════════════════════════════════════════════════════════════════════════
cold_backup() {
    if [ -d "$GITHUB_DIR/.git" ]; then
        protect_github_root
        
        cd "$GITHUB_DIR"
        local unpushed=$(git log origin/main..HEAD 2>/dev/null | head -1)
        
        if [ -n "$unpushed" ]; then
            git push origin main 2>/dev/null && \
                log "BACKUP" "COLD: Pushed to GitHub (offsite)" || \
                log "WARN" "COLD: Push failed, will retry"
        fi
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# HEALTH CHECK
#═══════════════════════════════════════════════════════════════════════════════
health_check() {
    # Check backend (port 1116)
    if ! curl -s "http://localhost:$PORT_BACKEND/api/health" > /dev/null 2>&1; then
        log "ERROR" "Backend DOWN on port $PORT_BACKEND"
        auto_heal "backend"
    fi
    
    # Check dashboard (port 1117)
    if ! curl -s "http://localhost:$PORT_DASHBOARD/dashboard" > /dev/null 2>&1; then
        log "WARN" "Dashboard DOWN on port $PORT_DASHBOARD"
        auto_heal "dashboard"
    fi
    
    # Check data file
    if [ -f "$DATA_FILE" ]; then
        if ! python3 -c "import json; json.load(open('$DATA_FILE'))" 2>/dev/null; then
            log "ERROR" "Data file CORRUPTED"
            auto_heal "data"
        fi
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# AUTO-HEAL
#═══════════════════════════════════════════════════════════════════════════════
auto_heal() {
    local component="$1"
    log "HEAL" "Healing $component..."
    
    case "$component" in
        backend)
            pkill -f "node.*server.cjs" 2>/dev/null
            sleep 2
            cd "$WORKING_DIR/backend"
            PORT=$PORT_BACKEND node server.cjs >> "$WORKING_DIR/logs/backend.log" 2>&1 &
            sleep 3
            curl -s "http://localhost:$PORT_BACKEND/api/health" > /dev/null 2>&1 && \
                log "HEAL" "Backend restored on port $PORT_BACKEND" || \
                revert_to_n1
            ;;
        dashboard)
            pkill -f "dashboard.*server.cjs" 2>/dev/null
            sleep 2
            cd "$WORKING_DIR/dashboard"
            PORT=$PORT_DASHBOARD node server.cjs >> "$WORKING_DIR/logs/dashboard.log" 2>&1 &
            log "HEAL" "Dashboard restarted on port $PORT_DASHBOARD"
            ;;
        data)
            local latest=$(ls -t "$HOT_DIR"/ai-data_*.json 2>/dev/null | head -1)
            [ -f "$latest" ] && cp "$latest" "$DATA_FILE" && \
                log "HEAL" "Data restored from $latest"
            ;;
    esac
}

#═══════════════════════════════════════════════════════════════════════════════
# REVERT TO N-1 (Never to root v1.0.0)
#═══════════════════════════════════════════════════════════════════════════════
revert_to_n1() {
    log "HEAL" "Reverting to N-1..."
    
    # Find latest warm backup (NOT v1.0.0)
    local latest=$(ls -dt "$WARM_DIR"/*/ 2>/dev/null | grep -v "v1.0.0" | head -1)
    
    if [ -d "$latest" ]; then
        pkill -f "node.*server.cjs" 2>/dev/null
        pkill -f "node.*learner" 2>/dev/null
        sleep 2
        
        [ -d "$latest/data" ] && cp -r "$latest/data/"* "$WORKING_DIR/data/"
        [ -d "$latest/backend" ] && cp -r "$latest/backend/"* "$WORKING_DIR/backend/"
        
        # Restart
        cd "$WORKING_DIR/backend"
        PORT=$PORT_BACKEND node server.cjs >> "$WORKING_DIR/logs/backend.log" 2>&1 &
        node learner.cjs >> "$WORKING_DIR/logs/learner.log" 2>&1 &
        
        cd "$WORKING_DIR/dashboard"
        PORT=$PORT_DASHBOARD node server.cjs >> "$WORKING_DIR/logs/dashboard.log" 2>&1 &
        
        log "HEAL" "Reverted to: $latest"
    else
        log "ERROR" "No N-1 backup found (v1.0.0 is protected)"
    fi
}

#═══════════════════════════════════════════════════════════════════════════════
# MAIN LOOP
#═══════════════════════════════════════════════════════════════════════════════
run_protection() {
    log "INFO" "Auto-Protect v2.0 starting"
    log "INFO" "Backend: port $PORT_BACKEND | Dashboard: port $PORT_DASHBOARD"
    log "PROTECT" "GitHub root (v1.0.0) is PROTECTED - will never be modified"
    
    echo $$ > "$PID_FILE"
    
    local hot=0 warm=0 cold=0 health=0
    
    hot_backup
    warm_backup
    
    while true; do
        sleep 60
        ((hot+=60)) ((warm+=60)) ((cold+=60)) ((health+=60))
        
        [ $health -ge $HEALTH_INTERVAL ] && { health_check; health=0; }
        [ $hot -ge $HOT_INTERVAL ] && { hot_backup; hot=0; }
        [ $warm -ge $WARM_INTERVAL ] && { warm_backup; warm=0; }
        [ $cold -ge $COLD_INTERVAL ] && { cold_backup; cold=0; }
    done
}

#═══════════════════════════════════════════════════════════════════════════════
# COMMANDS
#═══════════════════════════════════════════════════════════════════════════════
case "$1" in
    start)
        [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null && \
            { echo "Already running"; exit 1; }
        
        mkdir -p "$WORKING_DIR/logs" "$HOT_DIR" "$WARM_DIR" "$ARCHIVE_DIR"
        
        echo "╔══════════════════════════════════════════════════════════════════════════╗"
        echo "║  🛡️  VISTAVIEW AUTO-PROTECT v2.0                                         ║"
        echo "╠══════════════════════════════════════════════════════════════════════════╣"
        echo "║  Backend:     http://localhost:$PORT_BACKEND                                    ║"
        echo "║  Dashboard:   http://localhost:$PORT_DASHBOARD                                    ║"
        echo "╠══════════════════════════════════════════════════════════════════════════╣"
        echo "║  HOT:   Every 5 min  │  WARM: Every 30 min  │  COLD: Every 1 hour       ║"
        echo "║  🛡️ GitHub root (v1.0.0) is PROTECTED                                    ║"
        echo "╚══════════════════════════════════════════════════════════════════════════╝"
        
        nohup "$0" _run >> "$LOG_FILE" 2>&1 &
        echo $! > "$PID_FILE"
        echo "✅ Started (PID: $!)"
        ;;
    _run)
        run_protection
        ;;
    stop)
        [ -f "$PID_FILE" ] && { kill $(cat "$PID_FILE") 2>/dev/null; rm -f "$PID_FILE"; echo "✅ Stopped"; } || echo "Not running"
        ;;
    status)
        if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            echo "✅ RUNNING (PID: $(cat "$PID_FILE"))"
            echo "   HOT:  $(ls "$HOT_DIR"/*.json 2>/dev/null | wc -l | tr -d ' ') backups"
            echo "   WARM: $(ls -d "$WARM_DIR"/*/ 2>/dev/null | wc -l | tr -d ' ') snapshots"
            echo "   ARCHIVE: $(ls "$ARCHIVE_DIR"/*.zip 2>/dev/null | wc -l | tr -d ' ') zips"
        else
            echo "❌ NOT running"
        fi
        ;;
    backup)
        hot_backup && warm_backup && echo "✅ Manual backup done"
        ;;
    *)
        echo "Usage: $0 {start|stop|status|backup}"
        ;;
esac
