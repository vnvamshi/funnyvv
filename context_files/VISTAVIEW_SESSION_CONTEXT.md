# ═══════════════════════════════════════════════════════════════════════════════
# VISTAVIEW SESSION CONTEXT
# Last Updated: 2026-01-04
# 
# INSTRUCTION TO NEW CLAUDE SESSION:
# Copy this ENTIRE file and paste it as your FIRST message to continue work.
# ═══════════════════════════════════════════════════════════════════════════════

## PROJECT IDENTITY
```
PROJECT: VistaView - Voice-First Real Estate Marketplace
WORKING_DIR: /Users/vistaview/vistaview_WORKING
BACKUP_DIR: /Users/vistaview/vistaview_BACKUPS
```

## ACTIVE SERVICES
```
BACKEND: http://localhost:1117 (Express, server.cjs, v22.0)
FRONTEND: http://localhost:5180 (Vite + React)
POSTGRES: localhost:5432/vistaview (pgvector enabled)
MINIO: localhost:9000 (console: 9001) - bucket: vistaview
```

## KEY DIRECTORIES
```
src/agentic/           - Voice system (VoiceBrain, AgenticBar, WalkAndClick)
src/components/        - React components
src/components/signin/vendor/ - Vendor onboarding flow
backend/               - Express API server
backend/uploads/       - Temp upload storage
```

## AGENTIC SYSTEM STATUS
| Component | File | Status |
|-----------|------|--------|
| VoiceBrain.ts | src/agentic/VoiceBrain.ts | ✅ Created |
| WalkAndClick.ts | src/agentic/WalkAndClick.ts | ✅ Created |
| AgenticBar.tsx | src/agentic/AgenticBar.tsx | ✅ Created |
| VendorPhone.tsx | src/components/signin/vendor/ | ✅ Has AgenticBar |
| VendorOTP.tsx | src/components/signin/vendor/ | ✅ Has AgenticBar |
| VendorProfile.tsx | src/components/signin/vendor/ | ✅ Has AgenticBar |
| VendorUpload.tsx | src/components/signin/vendor/ | ⏳ Needs creation (PART3) |
| GlobalAgenticBar | src/components/global/ | ⏳ Needs creation (PART4) |
| Teleprompter | src/agentic/ | ⏳ Needs creation (PART5) |
| GLBSceneController | src/agentic/ | ⏳ Needs creation (PART6) |

## VOICE FEATURES IMPLEMENTED
- ✅ Audio Mutex (IDLE → LISTENING → SPEAKING → PAUSED)
- ✅ Word-to-digit conversion ("seven zero three" → "703")
- ✅ Walk & Click pointer navigation
- ✅ "Hey" / "pause" stops with empathy response
- ✅ Mode switching (interactive/talkative/text)
- ✅ Buttons: STT, TTS, Pause, Mode, Research, Type input

## PENDING TASKS (Priority Order)
1. Run PART3: VendorUpload with AgenticBar (PDF upload step)
2. Run PART4: GlobalAgenticBar on all pages
3. Run PART5: Teleprompter display
4. Run PART6: GLB "go to floor 44" commands
5. Verify PDF → Products pipeline creates real data
6. Add AgenticBar to main pages (Home, About, Products)

## SCRIPTS CREATED (in ~/Downloads)
- vistaview_MASTER.sh - Core agentic + backend (RUN FIRST)
- vistaview_PART3.sh - Vendor upload components
- vistaview_PART4.sh - Global floating bar
- vistaview_PART5.sh - Teleprompter + status
- vistaview_PART6.sh - GLB scene controller

## RULES (VISTAVIEW_AGENTIC_STANDARD_V1)
1. NO deletions of files, folders, buckets, tables
2. ALWAYS backup before any edit (.bak_YYYYMMDD_HHMMSS)
3. Keep unlimited backups
4. PLAN → APPLY workflow
5. Split large tasks into parts
6. Resume from last checkpoint on crash
7. Never re-init existing folders

## API ENDPOINTS
```
GET  /api/health          - Server health + counts
GET  /api/dashboard       - Full dashboard data
GET  /api/products        - List products (?category=, ?search=)
POST /api/vendors         - Create vendor
POST /api/catalog/upload  - Upload PDF catalog
GET  /api/stats           - Quick stats
GET  /api/ai/training/stats - AI metrics
```

## QUICK COMMANDS FOR NEW SESSION
```bash
# Check services
curl http://localhost:1117/api/health
curl http://localhost:5180

# Restart backend
cd /Users/vistaview/vistaview_WORKING/backend
pkill -f "node server" ; node server.cjs &

# Restart frontend  
cd /Users/vistaview/vistaview_WORKING
pkill -f vite ; npm run dev &

# View logs
tail -f /tmp/vv_backend.log
tail -f /tmp/vv_frontend.log
```

## CONTINUE FROM HERE
The user wants:
1. AgenticBar visible on EVERY screen (vendor, main pages, modals, GLB)
2. Walk & Click pointer that visually navigates
3. "Go to floor 44" in GLB viewer
4. PDF upload creates REAL products (not 0)
5. Teleprompter showing what Mr. V says
6. Dashboard at :1117 showing live metrics

Next action: Run the PART scripts (3,4,5,6) or verify what's already applied.
