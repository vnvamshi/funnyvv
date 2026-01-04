#!/bin/bash
pkill -f "node.*server" 2>/dev/null
pkill -f "python.*ml_bridge" 2>/dev/null
pkill -f "vite" 2>/dev/null
echo "✅ All stopped"
