#!/bin/bash
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  VISTAVIEW SERVICE STATUS                                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "Backend API (port 3001):"
if pgrep -f "node.*index.cjs" > /dev/null; then
    echo "  ✅ RUNNING (PID: $(pgrep -f 'node.*index.cjs'))"
else
    echo "  ❌ NOT RUNNING"
fi

echo ""
echo "Learning Engine:"
if pgrep -f "node.*learner" > /dev/null; then
    echo "  ✅ RUNNING (PID: $(pgrep -f 'node.*learner'))"
else
    echo "  ❌ NOT RUNNING"
fi

echo ""
echo "Frontend (Vite):"
if pgrep -f "vite" > /dev/null; then
    echo "  ✅ RUNNING (PID: $(pgrep -f 'vite'))"
else
    echo "  ❌ NOT RUNNING"
fi

echo ""
echo "─────────────────────────────────────────────────────────────────"
echo "Health Check:"
curl -s http://localhost:3001/health 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "  Backend not responding"
echo ""
