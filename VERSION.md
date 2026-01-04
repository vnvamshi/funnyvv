# VistaView Version Info

**Version:** v3.15.0-20260104  
**Date:** January 04, 2026 at 03:17 PM  
**Backup ID:** 20260104_151753

## What's Included

### Frontend Components
- `src/components/signin/vendor/` - Complete VendorFlow (6 steps)
- `src/components/signin/common/UnifiedAgenticBar.tsx` - Voice UI for all modals
- `src/components/agentic/` - AgenticBar variants (floating, walker, minimal, inline)
- `src/hooks/` - useVoice, useFormFiller, useVoiceForm

### Backend
- `backend/server.cjs` - Express server v33.5
- `backend/parse_pdf.py` - PDF parser

### Database
- `database_backups/vistaview_LATEST.sql` - Full PostgreSQL dump
- `database_backups/schema_LATEST.sql` - Schema only
- `database_backups/csv/` - Table exports

## Key Features
- ✅ UnifiedAgenticBar in ALL vendor steps
- ✅ Voice-to-form filling with typewriter animation
- ✅ PDF catalog upload and parsing
- ✅ AI beautification endpoint
- ✅ Speech-to-text / Text-to-speech
- ✅ Walking cursor integration

## Database Tables


## Restore Instructions

### Database
```bash
psql -d vistaview < database_backups/vistaview_LATEST.sql
```

### Project
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend && node server.cjs
```
