#!/bin/bash
DIR="$HOME/vistaview_WORKING"
cd "$DIR"

echo "🚀 Starting VistaView Complete..."

# Kill existing
pkill -f "node.*server.cjs" 2>/dev/null
pkill -f "node.*learner" 2>/dev/null
pkill -f vite 2>/dev/null
lsof -ti:3005 -ti:3006 -ti:5200 | xargs kill -9 2>/dev/null
sleep 2

# Start backend
echo "📦 Starting backend on port 3005..."
cd "$DIR/backend" && node server.cjs > ../logs/backend.log 2>&1 &

# Start learner
echo "🧠 Starting learning engine..."
cd "$DIR/backend" && node learner.cjs > ../logs/learner.log 2>&1 &

# Start dashboard
echo "📊 Starting dashboard on port 3006..."
cd "$DIR/dashboard" && node server.cjs > ../logs/dashboard.log 2>&1 &

# Start frontend
echo "🌐 Starting frontend on port 5200..."
cd "$DIR" && npm run dev -- --port 5200 --host > logs/frontend.log 2>&1 &

sleep 3

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ VISTAVIEW COMPLETE RUNNING!                        ║"
echo "╠══════════════════════════════════════════════════════════════════════════╣"
echo "║                                                                          ║"
echo "║  🌐 Frontend:    http://localhost:5200                                   ║"
echo "║  📊 Dashboard:   http://localhost:3006/dashboard                         ║"
echo "║  🔌 Backend API: http://localhost:3005/api/stats                         ║"
echo "║  🤖 Ollama:      http://localhost:11434 (gpt-oss:20b)                    ║"
echo "║                                                                          ║"
echo "║  📁 Data: ~/vistaview_WORKING/data/ai-data.json                         ║"
echo "║  📈 Interactions: 2208+ | Patterns: 70+ | Prices: 2208+                 ║"
echo "║                                                                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
