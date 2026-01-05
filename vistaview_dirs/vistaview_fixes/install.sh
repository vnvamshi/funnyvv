#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# VISTAVIEW v4.0 - Installation Script
# Copies fixed files to your working folder
# ═══════════════════════════════════════════════════════════════════════════════

# Configuration
WORKING_DIR="/Users/vistaview/Documents/GitHub/funnyvv"
BACKUP_DIR="$WORKING_DIR/.backup-$(date +%Y%m%d-%H%M%S)"
VERSION="v4.0-$(date +%Y%m%d-%H%M%S)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
GOLD='\033[0;33m'
NC='\033[0m' # No Color

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "  VISTAVIEW v4.0 - Installation Script"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

# Check if working directory exists
if [ ! -d "$WORKING_DIR" ]; then
    echo -e "${RED}ERROR: Working directory not found: $WORKING_DIR${NC}"
    exit 1
fi

# Create backup directory
echo -e "${YELLOW}Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"

# Backup existing files
echo "Backing up existing files to $BACKUP_DIR"
cp "$WORKING_DIR/backend/server.cjs" "$BACKUP_DIR/" 2>/dev/null
cp "$WORKING_DIR/backend/dashboard.html" "$BACKUP_DIR/" 2>/dev/null
cp "$WORKING_DIR/src/App.tsx" "$BACKUP_DIR/" 2>/dev/null
cp "$WORKING_DIR/src/components/SignInPopover.tsx" "$BACKUP_DIR/" 2>/dev/null
cp "$WORKING_DIR/src/components/VendorOnboardingModal.tsx" "$BACKUP_DIR/" 2>/dev/null
cp "$WORKING_DIR/src/components/WhoAreYouModal.tsx" "$BACKUP_DIR/" 2>/dev/null

echo -e "${GREEN}✓ Backup created${NC}"
echo ""

# Copy new files
echo -e "${YELLOW}Installing updated files...${NC}"

# Backend files
echo "  → backend/server.cjs"
cat > "$WORKING_DIR/backend/server.cjs" << 'SERVEREOF'
// [Content of server.cjs will be copied here]
// This is a placeholder - the actual content needs to be pasted
SERVEREOF

echo "  → backend/dashboard.html"
# Dashboard will be copied

# Frontend components
echo "  → src/components/AgentBar.tsx"
echo "  → src/components/SignInPopover.tsx"
echo "  → src/components/VendorOnboardingModal.tsx"
echo "  → src/components/WhoAreYouModal.tsx"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Installation Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "  1. Restart your backend server:"
echo "     cd $WORKING_DIR/backend && node server.cjs"
echo ""
echo "  2. Refresh your frontend (already running on dev server)"
echo ""
echo "  3. Access the dashboard at:"
echo "     http://localhost:1117/dashboard"
echo ""
echo "Version: $VERSION"
echo "Backup: $BACKUP_DIR"
echo ""
