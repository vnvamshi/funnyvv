#!/bin/bash
echo "Reverting to backup: /Users/vistaview/vistaview_BACKUPS/MASTER_20260104_141709"
pkill -f "node server" 2>/dev/null; pkill -f vite 2>/dev/null
rsync -av --delete --exclude='node_modules' "/Users/vistaview/vistaview_BACKUPS/MASTER_20260104_141709/code/" "/Users/vistaview/vistaview_WORKING/"
cd "/Users/vistaview/vistaview_WORKING/backend" && node server.cjs &
cd "/Users/vistaview/vistaview_WORKING" && npm run dev &
echo "Reverted!"
