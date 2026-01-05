#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
#  VISTAVIEW COMPLETE SETUP - RUN ALL PARTS
#═══════════════════════════════════════════════════════════════════════════════

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  🚀 VISTAVIEW COMPLETE SETUP"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

SCRIPTS_DIR="$HOME/Downloads"

# Run all part scripts
if [ -f "$SCRIPTS_DIR/COMPLETE_UNIFIED_FIX_JAN04.sh" ]; then
    echo "📦 Running: COMPLETE_UNIFIED_FIX_JAN04.sh"
    bash "$SCRIPTS_DIR/COMPLETE_UNIFIED_FIX_JAN04.sh"
fi

if [ -f "$SCRIPTS_DIR/PART_A_VOICE_COMMENTS.sh" ]; then
    echo "📦 Running: PART_A_VOICE_COMMENTS.sh"
    bash "$SCRIPTS_DIR/PART_A_VOICE_COMMENTS.sh"
fi

if [ -f "$SCRIPTS_DIR/PART_B_PDF_EXTRACTION.sh" ]; then
    echo "📦 Running: PART_B_PDF_EXTRACTION.sh"
    bash "$SCRIPTS_DIR/PART_B_PDF_EXTRACTION.sh"
fi

if [ -f "$SCRIPTS_DIR/PART_C_PRODUCT_CATALOG.sh" ]; then
    echo "📦 Running: PART_C_PRODUCT_CATALOG.sh"
    bash "$SCRIPTS_DIR/PART_C_PRODUCT_CATALOG.sh"
fi

if [ -f "$SCRIPTS_DIR/PART_D_REAL_ESTATE.sh" ]; then
    echo "📦 Running: PART_D_REAL_ESTATE.sh"
    bash "$SCRIPTS_DIR/PART_D_REAL_ESTATE.sh"
fi

if [ -f "$SCRIPTS_DIR/PART_E_DOWNLOADS_DASHBOARD.sh" ]; then
    echo "📦 Running: PART_E_DOWNLOADS_DASHBOARD.sh"
    bash "$SCRIPTS_DIR/PART_E_DOWNLOADS_DASHBOARD.sh"
fi

if [ -f "$SCRIPTS_DIR/PART_F_AI_TRAINING.sh" ]; then
    echo "📦 Running: PART_F_AI_TRAINING.sh"
    bash "$SCRIPTS_DIR/PART_F_AI_TRAINING.sh"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  ✅ ALL PARTS INSTALLED"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "  📋 NEXT STEPS:"
echo ""
echo "  1. Install backend dependencies:"
echo "     cd ~/vistaview_WORKING/backend"
echo "     npm install pdf-parse xlsx minio multer axios --save"
echo ""
echo "  2. Run database migrations:"
echo "     psql -U vistaview -d vistaview -f migrations/create_products_tables.sql"
echo "     psql -U vistaview -d vistaview -f migrations/create_properties_table.sql"
echo ""
echo "  3. Update server.cjs - add this line:"
echo "     require('./complete_integration.cjs')(app, pool);"
echo ""
echo "  4. Start backend:"
echo "     cd ~/vistaview_WORKING/backend && node server.cjs"
echo ""
echo "  5. Start frontend:"
echo "     cd ~/vistaview_WORKING && npx vite --port 5180 --host"
echo ""
echo "  6. Open browser:"
echo "     http://localhost:5180"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
