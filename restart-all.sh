#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"
echo "Stopping all services..."
pkill -f vite 2>/dev/null || true
pkill -f "node server" 2>/dev/null || true
pkill -f "node.*index.cjs" 2>/dev/null || true
pkill -f "node.*learner" 2>/dev/null || true
sleep 2
echo "Starting all services..."
./start-all.sh
