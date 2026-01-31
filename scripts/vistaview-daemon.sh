#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# VISTAVIEW 24/7 DAEMON
# Keeps frontend and backend running automatically
# © 2026 Vista View Realty Services LLC
# ═══════════════════════════════════════════════════════════════════════════════

WORKING_DIR="/Users/vistaview/vistaview_WORKING"
LOG_DIR="$HOME/logs/vistaview"
PID_DIR="$HOME/.vistaview"

mkdir -p "$LOG_DIR" "$PID_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_DIR/daemon.log"
}

check_backend() {
    curl -s -o /dev/null -w '%{http_code}' http://localhost:1117/api/health 2>/dev/null
}

check_frontend() {
    curl -s -o /dev/null -w '%{http_code}' http://localhost:5180 2>/dev/null
}

start_backend() {
    log "Starting backend..."
    cd "$WORKING_DIR/backend"
    nohup npm start >> "$LOG_DIR/backend.log" 2>&1 &
    echo $! > "$PID_DIR/backend.pid"
    log "Backend started with PID $(cat $PID_DIR/backend.pid)"
}

start_frontend() {
    log "Starting frontend..."
    cd "$WORKING_DIR"
    nohup npm run dev >> "$LOG_DIR/frontend.log" 2>&1 &
    echo $! > "$PID_DIR/frontend.pid"
    log "Frontend started with PID $(cat $PID_DIR/frontend.pid)"
}

# Main loop
log "═══════════════════════════════════════════════════════════════"
log "VISTAVIEW DAEMON STARTED"
log "═══════════════════════════════════════════════════════════════"

while true; do
    # Check backend
    if [ "$(check_backend)" != "200" ]; then
        log "⚠️ Backend is down, restarting..."
        start_backend
        sleep 10
    fi

    # Check frontend
    if [ "$(check_frontend)" != "200" ]; then
        log "⚠️ Frontend is down, restarting..."
        start_frontend
        sleep 10
    fi

    # Sleep for 60 seconds before next check
    sleep 60
done
