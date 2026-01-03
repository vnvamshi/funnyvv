#!/bin/bash
echo "🛑 Stopping all VistaView services..."
pkill -f "node.*server.cjs" 2>/dev/null
pkill -f "node.*learner" 2>/dev/null
pkill -f vite 2>/dev/null
lsof -ti:3005 -ti:3006 -ti:5200 | xargs kill -9 2>/dev/null
echo "✅ All services stopped"
