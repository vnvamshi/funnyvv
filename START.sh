#!/bin/bash
echo "🤖 Starting VistaView Agentic AI..."

VV="$HOME/vistaview_WORKING"

# Kill existing backend
pkill -f "node.*server.cjs" 2>/dev/null
sleep 1

# Start backend (port 1117)
cd "$VV/backend"
node server.cjs > server.log 2>&1 &
sleep 2

# Verify
if curl -s http://localhost:1117/api/health | grep -q "ok"; then
    echo "✅ Backend running on port 1117"
    echo "   Dashboard: http://localhost:1117/dashboard"
else
    echo "❌ Backend failed to start"
    cat server.log | tail -10
fi

echo ""
echo "📌 Your frontend should be on port 5180"
echo "   cd $VV/frontend && npm run dev"
