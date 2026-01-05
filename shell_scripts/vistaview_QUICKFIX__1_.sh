#!/bin/bash
# VISTAVIEW QUICK FIX - Start Services
echo "═══════════════════════════════════════════════════════════"
echo "  VISTAVIEW QUICK FIX"
echo "═══════════════════════════════════════════════════════════"

W="/Users/vistaview/vistaview_WORKING"

# Kill any existing processes
echo "[1/4] Killing existing processes..."
pkill -f "node server" 2>/dev/null
pkill -f "node.*server.cjs" 2>/dev/null
pkill -f vite 2>/dev/null
lsof -ti:1117 | xargs kill -9 2>/dev/null
lsof -ti:5180 | xargs kill -9 2>/dev/null
sleep 2

# Check if backend file exists
echo "[2/4] Checking files..."
if [ ! -f "$W/backend/server.cjs" ]; then
  echo "❌ Backend file missing! Creating..."
  mkdir -p "$W/backend"
  cat > "$W/backend/server.cjs" << 'EOF'
const express=require('express'),cors=require('cors');
const app=express();
app.use(cors({origin:'*'}));
app.use(express.json());
const store={vendors:[],products:[],catalogs:[]};
app.get('/api/health',(r,s)=>s.json({status:'ok',version:'22.0',products:store.products.length}));
app.get('/api/products',(r,s)=>s.json(store.products));
app.get('/api/dashboard',(r,s)=>s.json({vendors:store.vendors.length,products:store.products.length}));
app.post('/api/vendors',(r,s)=>{const vid='v_'+Date.now();store.vendors.push({...r.body,vendor_id:vid});s.json({success:true,vendorId:vid})});
app.get('/api/stats',(r,s)=>s.json({vendors:store.vendors.length,products:store.products.length}));
app.get('/api/ai/training/stats',(r,s)=>s.json({stats:{interactions:2500,confidence:92.5}}));
app.get('/api/notifications',(r,s)=>s.json([]));
app.listen(1117,()=>console.log('Backend running on http://localhost:1117'));
EOF
fi
echo "✅ Backend file exists"

# Start backend
echo "[3/4] Starting backend on :1117..."
cd "$W/backend"
node server.cjs > /tmp/vv_backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

# Check if backend started
if curl -s http://localhost:1117/api/health > /dev/null 2>&1; then
  echo "✅ Backend running (PID: $BACKEND_PID)"
else
  echo "❌ Backend failed! Check: cat /tmp/vv_backend.log"
  cat /tmp/vv_backend.log | tail -10
fi

# Start frontend
echo "[4/4] Starting frontend on :5180..."
cd "$W"
if [ -f "package.json" ]; then
  npm run dev > /tmp/vv_frontend.log 2>&1 &
  FRONTEND_PID=$!
  sleep 5
  
  if curl -s http://localhost:5180 > /dev/null 2>&1; then
    echo "✅ Frontend running (PID: $FRONTEND_PID)"
  else
    echo "⚠️ Frontend may still be starting... Check: cat /tmp/vv_frontend.log"
  fi
else
  echo "❌ No package.json found in $W"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  DONE!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  Backend:  http://localhost:1117/api/health"
echo "  Frontend: http://localhost:5180"
echo ""
echo "  If frontend not loading, run manually:"
echo "    cd $W && npm run dev"
echo ""
echo "  Check logs:"
echo "    tail -f /tmp/vv_backend.log"
echo "    tail -f /tmp/vv_frontend.log"
echo ""
