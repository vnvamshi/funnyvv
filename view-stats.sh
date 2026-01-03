#!/bin/bash
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  VISTAVIEW AI LEARNING STATS                                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "📊 Training Statistics:"
curl -s http://localhost:3001/api/ai/training/stats 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "  Could not fetch stats"

echo ""
echo "─────────────────────────────────────────────────────────────────"
echo ""
echo "📦 Database Status:"
curl -s http://localhost:3001/api/status 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "  Could not fetch status"

echo ""
echo "─────────────────────────────────────────────────────────────────"
echo ""
echo "🧠 AI Memories:"
MEMORIES=$(curl -s http://localhost:3001/api/ai/memory 2>/dev/null)
echo "  Total memories: $(echo $MEMORIES | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('count',0))" 2>/dev/null || echo "N/A")"

echo ""
echo "📚 Learning Sessions:"
SESSIONS=$(curl -s http://localhost:3001/api/ai/learning/sessions 2>/dev/null)
echo "  Total sessions: $(echo $SESSIONS | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('count',0))" 2>/dev/null || echo "N/A")"
echo ""
