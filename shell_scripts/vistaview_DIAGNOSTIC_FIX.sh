#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
#  VISTAVIEW MASTER DIAGNOSTIC & FIX SCRIPT
#  vistaview_DIAGNOSTIC_FIX.sh
#  
#  VISTAVIEW_AGENTIC_STANDARD_v1.1 COMPLIANT
#  - Creates backup before ANY changes
#  - Provides detailed diagnostics
#  - Fixes issues automatically
#  - Generates error report
#═══════════════════════════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Paths
VV_HOME="$HOME/vistaview_WORKING"
VV_BACKUPS="$HOME/vistaview_BACKUPS"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$VV_BACKUPS/DIAGNOSTIC_$TIMESTAMP"
LOG_FILE="$HOME/Downloads/vistaview_diagnostic_$TIMESTAMP.log"

# Initialize log
exec > >(tee -a "$LOG_FILE") 2>&1

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  VISTAVIEW MASTER DIAGNOSTIC & FIX${NC}"
echo -e "${BLUE}  $(date)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo ""

#───────────────────────────────────────────────────────────────────────────────
# PHASE 1: PRE-FLIGHT CHECKS
#───────────────────────────────────────────────────────────────────────────────
echo -e "${CYAN}[PHASE 1] PRE-FLIGHT CHECKS${NC}"
echo "─────────────────────────────────────────────────────────────────────────────"

ERRORS=()
WARNINGS=()
FIXES_APPLIED=()

# Check if project exists
echo -n "Checking project directory... "
if [[ -d "$VV_HOME" ]]; then
    echo -e "${GREEN}EXISTS${NC}"
else
    echo -e "${RED}MISSING${NC}"
    ERRORS+=("Project directory not found at $VV_HOME")
    echo -e "${RED}FATAL: Cannot continue without project. Exiting.${NC}"
    exit 1
fi

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}$NODE_VERSION${NC}"
else
    echo -e "${RED}NOT FOUND${NC}"
    ERRORS+=("Node.js not installed")
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}v$NPM_VERSION${NC}"
else
    echo -e "${RED}NOT FOUND${NC}"
    ERRORS+=("npm not installed")
fi

# Check if ports are in use
echo -n "Checking port 5180 (frontend)... "
if lsof -i :5180 &> /dev/null; then
    echo -e "${YELLOW}IN USE${NC}"
    WARNINGS+=("Port 5180 already in use - may need to kill existing process")
else
    echo -e "${GREEN}AVAILABLE${NC}"
fi

echo -n "Checking port 3001 (backend)... "
if lsof -i :3001 &> /dev/null; then
    echo -e "${YELLOW}IN USE${NC}"
    WARNINGS+=("Port 3001 already in use - may need to kill existing process")
else
    echo -e "${GREEN}AVAILABLE${NC}"
fi

echo ""

#───────────────────────────────────────────────────────────────────────────────
# PHASE 2: CREATE BACKUP
#───────────────────────────────────────────────────────────────────────────────
echo -e "${CYAN}[PHASE 2] CREATING BACKUP${NC}"
echo "─────────────────────────────────────────────────────────────────────────────"

mkdir -p "$BACKUP_DIR"
echo "Backup location: $BACKUP_DIR"

# Backup key directories
echo -n "Backing up src/agentic/... "
if [[ -d "$VV_HOME/src/agentic" ]]; then
    cp -r "$VV_HOME/src/agentic" "$BACKUP_DIR/" 2>/dev/null && echo -e "${GREEN}OK${NC}" || echo -e "${YELLOW}EMPTY${NC}"
else
    echo -e "${YELLOW}NOT FOUND${NC}"
fi

echo -n "Backing up src/components/... "
if [[ -d "$VV_HOME/src/components" ]]; then
    cp -r "$VV_HOME/src/components" "$BACKUP_DIR/" 2>/dev/null && echo -e "${GREEN}OK${NC}" || echo -e "${YELLOW}FAILED${NC}"
else
    echo -e "${YELLOW}NOT FOUND${NC}"
fi

echo -n "Backing up server/... "
if [[ -d "$VV_HOME/server" ]]; then
    cp -r "$VV_HOME/server" "$BACKUP_DIR/" 2>/dev/null && echo -e "${GREEN}OK${NC}" || echo -e "${YELLOW}FAILED${NC}"
else
    echo -e "${YELLOW}NOT FOUND${NC}"
fi

echo -n "Backing up package.json... "
cp "$VV_HOME/package.json" "$BACKUP_DIR/" 2>/dev/null && echo -e "${GREEN}OK${NC}" || echo -e "${YELLOW}FAILED${NC}"

echo -n "Backing up vite.config.ts... "
cp "$VV_HOME/vite.config.ts" "$BACKUP_DIR/" 2>/dev/null && echo -e "${GREEN}OK${NC}" || echo -e "${YELLOW}FAILED${NC}"

echo ""

#───────────────────────────────────────────────────────────────────────────────
# PHASE 3: FILE STRUCTURE CHECK
#───────────────────────────────────────────────────────────────────────────────
echo -e "${CYAN}[PHASE 3] FILE STRUCTURE CHECK${NC}"
echo "─────────────────────────────────────────────────────────────────────────────"

REQUIRED_FILES=(
    "package.json"
    "vite.config.ts"
    "src/main.tsx"
    "src/App.tsx"
    "index.html"
)

VOICE_FILES=(
    "src/agentic/VoiceBrain.ts"
    "src/agentic/AgenticBar.tsx"
    "src/agentic/index.ts"
)

COMPONENT_FILES=(
    "src/components/vendor/VendorPhone.tsx"
)

echo "Required core files:"
for file in "${REQUIRED_FILES[@]}"; do
    echo -n "  $file... "
    if [[ -f "$VV_HOME/$file" ]]; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}MISSING${NC}"
        ERRORS+=("Missing required file: $file")
    fi
done

echo ""
echo "Voice system files:"
for file in "${VOICE_FILES[@]}"; do
    echo -n "  $file... "
    if [[ -f "$VV_HOME/$file" ]]; then
        SIZE=$(wc -c < "$VV_HOME/$file" | tr -d ' ')
        if [[ "$SIZE" -gt 100 ]]; then
            echo -e "${GREEN}OK (${SIZE} bytes)${NC}"
        else
            echo -e "${YELLOW}SUSPICIOUS (only ${SIZE} bytes)${NC}"
            WARNINGS+=("$file is suspiciously small ($SIZE bytes)")
        fi
    else
        echo -e "${RED}MISSING${NC}"
        ERRORS+=("Missing voice file: $file")
    fi
done

echo ""
echo "Component files:"
for file in "${COMPONENT_FILES[@]}"; do
    echo -n "  $file... "
    if [[ -f "$VV_HOME/$file" ]]; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}MISSING${NC}"
        ERRORS+=("Missing component: $file")
    fi
done

echo ""

#───────────────────────────────────────────────────────────────────────────────
# PHASE 4: SYNTAX & IMPORT CHECK
#───────────────────────────────────────────────────────────────────────────────
echo -e "${CYAN}[PHASE 4] SYNTAX & IMPORT CHECK${NC}"
echo "─────────────────────────────────────────────────────────────────────────────"

cd "$VV_HOME"

# Check for TypeScript errors
echo -n "Running TypeScript check... "
if command -v npx &> /dev/null; then
    TSC_OUTPUT=$(npx tsc --noEmit 2>&1) || true
    TSC_ERRORS=$(echo "$TSC_OUTPUT" | grep -c "error TS" || echo "0")
    if [[ "$TSC_ERRORS" -eq 0 ]]; then
        echo -e "${GREEN}NO ERRORS${NC}"
    else
        echo -e "${RED}$TSC_ERRORS ERRORS${NC}"
        ERRORS+=("TypeScript has $TSC_ERRORS errors")
        echo "$TSC_OUTPUT" | grep "error TS" | head -10
    fi
else
    echo -e "${YELLOW}SKIPPED (npx not available)${NC}"
fi

# Check agentic/index.ts exports
echo ""
echo "Checking src/agentic/index.ts exports:"
if [[ -f "$VV_HOME/src/agentic/index.ts" ]]; then
    echo "  Contents:"
    cat "$VV_HOME/src/agentic/index.ts" | head -20 | sed 's/^/    /'
    
    # Check for required exports
    echo ""
    echo -n "  Exports AgenticBar... "
    if grep -q "AgenticBar" "$VV_HOME/src/agentic/index.ts"; then
        echo -e "${GREEN}YES${NC}"
    else
        echo -e "${RED}NO${NC}"
        ERRORS+=("AgenticBar not exported from index.ts")
    fi
    
    echo -n "  Exports VoiceBrain... "
    if grep -q "VoiceBrain" "$VV_HOME/src/agentic/index.ts"; then
        echo -e "${GREEN}YES${NC}"
    else
        echo -e "${YELLOW}NO (may be internal)${NC}"
    fi
else
    echo -e "  ${RED}FILE MISSING${NC}"
fi

# Check VendorPhone imports
echo ""
echo "Checking VendorPhone.tsx imports:"
if [[ -f "$VV_HOME/src/components/vendor/VendorPhone.tsx" ]]; then
    IMPORT_LINE=$(grep -n "from.*agentic" "$VV_HOME/src/components/vendor/VendorPhone.tsx" 2>/dev/null | head -1)
    if [[ -n "$IMPORT_LINE" ]]; then
        echo "  $IMPORT_LINE"
        
        # Check if it's default or named import
        if echo "$IMPORT_LINE" | grep -q "{ AgenticBar }"; then
            echo -e "  Import style: ${GREEN}Named import (correct)${NC}"
        elif echo "$IMPORT_LINE" | grep -q "AgenticBar from"; then
            echo -e "  Import style: ${YELLOW}Default import${NC}"
            WARNINGS+=("VendorPhone uses default import - may need named import")
        fi
    else
        echo -e "  ${YELLOW}No agentic import found${NC}"
    fi
else
    echo -e "  ${RED}FILE MISSING${NC}"
fi

echo ""

#───────────────────────────────────────────────────────────────────────────────
# PHASE 5: NODE MODULES CHECK
#───────────────────────────────────────────────────────────────────────────────
echo -e "${CYAN}[PHASE 5] NODE MODULES CHECK${NC}"
echo "─────────────────────────────────────────────────────────────────────────────"

echo -n "Checking node_modules... "
if [[ -d "$VV_HOME/node_modules" ]]; then
    MODULE_COUNT=$(ls -1 "$VV_HOME/node_modules" | wc -l | tr -d ' ')
    echo -e "${GREEN}EXISTS ($MODULE_COUNT packages)${NC}"
else
    echo -e "${RED}MISSING${NC}"
    ERRORS+=("node_modules missing - need to run npm install")
fi

echo -n "Checking package-lock.json... "
if [[ -f "$VV_HOME/package-lock.json" ]]; then
    echo -e "${GREEN}EXISTS${NC}"
else
    echo -e "${YELLOW}MISSING${NC}"
    WARNINGS+=("package-lock.json missing")
fi

echo ""

#───────────────────────────────────────────────────────────────────────────────
# PHASE 6: VITE CONFIG CHECK
#───────────────────────────────────────────────────────────────────────────────
echo -e "${CYAN}[PHASE 6] VITE CONFIG CHECK${NC}"
echo "─────────────────────────────────────────────────────────────────────────────"

if [[ -f "$VV_HOME/vite.config.ts" ]]; then
    echo "Vite config found. Checking port..."
    PORT_LINE=$(grep -E "port.*:" "$VV_HOME/vite.config.ts" 2>/dev/null | head -1)
    if [[ -n "$PORT_LINE" ]]; then
        echo "  $PORT_LINE"
    else
        echo "  Using default port"
    fi
else
    echo -e "${RED}vite.config.ts MISSING${NC}"
    ERRORS+=("vite.config.ts missing")
fi

echo ""

#───────────────────────────────────────────────────────────────────────────────
# PHASE 7: VOICE BRAIN VALIDATION
#───────────────────────────────────────────────────────────────────────────────
echo -e "${CYAN}[PHASE 7] VOICE BRAIN VALIDATION${NC}"
echo "─────────────────────────────────────────────────────────────────────────────"

if [[ -f "$VV_HOME/src/agentic/VoiceBrain.ts" ]]; then
    echo "VoiceBrain.ts found. Checking critical patterns:"
    
    echo -n "  Singleton pattern... "
    if grep -q "getInstance" "$VV_HOME/src/agentic/VoiceBrain.ts"; then
        echo -e "${GREEN}YES${NC}"
    else
        echo -e "${RED}NO${NC}"
        ERRORS+=("VoiceBrain missing singleton pattern (getInstance)")
    fi
    
    echo -n "  Audio Mutex (stop listening when speaking)... "
    if grep -q "shouldRestart.*false" "$VV_HOME/src/agentic/VoiceBrain.ts" || \
       grep -q "stopListening" "$VV_HOME/src/agentic/VoiceBrain.ts"; then
        echo -e "${GREEN}YES${NC}"
    else
        echo -e "${YELLOW}UNCLEAR${NC}"
        WARNINGS+=("Audio Mutex pattern may be missing")
    fi
    
    echo -n "  Pause commands (hey/stop)... "
    if grep -q "'hey'" "$VV_HOME/src/agentic/VoiceBrain.ts" || \
       grep -q '"hey"' "$VV_HOME/src/agentic/VoiceBrain.ts"; then
        echo -e "${GREEN}YES${NC}"
    else
        echo -e "${RED}NO${NC}"
        ERRORS+=("VoiceBrain missing 'hey' pause command")
    fi
    
    echo -n "  Resume commands... "
    if grep -q "'resume'" "$VV_HOME/src/agentic/VoiceBrain.ts" || \
       grep -q '"resume"' "$VV_HOME/src/agentic/VoiceBrain.ts"; then
        echo -e "${GREEN}YES${NC}"
    else
        echo -e "${RED}NO${NC}"
        ERRORS+=("VoiceBrain missing 'resume' command")
    fi
    
    echo -n "  SpeechRecognition setup... "
    if grep -q "SpeechRecognition" "$VV_HOME/src/agentic/VoiceBrain.ts"; then
        echo -e "${GREEN}YES${NC}"
    else
        echo -e "${RED}NO${NC}"
        ERRORS+=("VoiceBrain missing SpeechRecognition")
    fi
else
    echo -e "${RED}VoiceBrain.ts NOT FOUND${NC}"
    ERRORS+=("VoiceBrain.ts missing entirely")
fi

echo ""

#───────────────────────────────────────────────────────────────────────────────
# PHASE 8: SUMMARY & RECOMMENDATIONS
#───────────────────────────────────────────────────────────────────────────────
echo -e "${CYAN}[PHASE 8] SUMMARY${NC}"
echo "═══════════════════════════════════════════════════════════════════════════════"

echo ""
echo -e "${RED}ERRORS (${#ERRORS[@]}):${NC}"
if [[ ${#ERRORS[@]} -eq 0 ]]; then
    echo -e "  ${GREEN}None!${NC}"
else
    for err in "${ERRORS[@]}"; do
        echo -e "  ${RED}✗${NC} $err"
    done
fi

echo ""
echo -e "${YELLOW}WARNINGS (${#WARNINGS[@]}):${NC}"
if [[ ${#WARNINGS[@]} -eq 0 ]]; then
    echo -e "  ${GREEN}None!${NC}"
else
    for warn in "${WARNINGS[@]}"; do
        echo -e "  ${YELLOW}⚠${NC} $warn"
    done
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"

#───────────────────────────────────────────────────────────────────────────────
# PHASE 9: AUTOMATIC FIXES
#───────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}[PHASE 9] AUTOMATIC FIXES${NC}"
echo "─────────────────────────────────────────────────────────────────────────────"

# Fix 1: Kill processes on ports if needed
if lsof -i :5180 &> /dev/null || lsof -i :3001 &> /dev/null; then
    echo -n "Killing existing processes on ports 5180/3001... "
    lsof -ti :5180 | xargs kill -9 2>/dev/null || true
    lsof -ti :3001 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}DONE${NC}"
    FIXES_APPLIED+=("Killed existing processes on ports")
fi

# Fix 2: Install node_modules if missing
if [[ ! -d "$VV_HOME/node_modules" ]]; then
    echo "Installing node_modules..."
    cd "$VV_HOME"
    npm install
    FIXES_APPLIED+=("Installed node_modules")
fi

# Fix 3: Create agentic directory if missing
if [[ ! -d "$VV_HOME/src/agentic" ]]; then
    echo -n "Creating src/agentic directory... "
    mkdir -p "$VV_HOME/src/agentic"
    echo -e "${GREEN}DONE${NC}"
    FIXES_APPLIED+=("Created src/agentic directory")
fi

# Fix 4: Fix index.ts exports if problematic
if [[ -f "$VV_HOME/src/agentic/index.ts" ]]; then
    if ! grep -q "AgenticBar" "$VV_HOME/src/agentic/index.ts"; then
        echo -n "Fixing src/agentic/index.ts exports... "
        cat > "$VV_HOME/src/agentic/index.ts" << 'INDEXEOF'
// Agentic System Exports
export * from './VoiceBrain';
export * from './AgenticBar';
export { AgenticBar as default } from './AgenticBar';
INDEXEOF
        echo -e "${GREEN}DONE${NC}"
        FIXES_APPLIED+=("Fixed index.ts exports")
    fi
fi

echo ""
echo -e "${GREEN}FIXES APPLIED (${#FIXES_APPLIED[@]}):${NC}"
if [[ ${#FIXES_APPLIED[@]} -eq 0 ]]; then
    echo "  None needed"
else
    for fix in "${FIXES_APPLIED[@]}"; do
        echo -e "  ${GREEN}✓${NC} $fix"
    done
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

#───────────────────────────────────────────────────────────────────────────────
# PHASE 10: NEXT STEPS
#───────────────────────────────────────────────────────────────────────────────
echo -e "${CYAN}[PHASE 10] NEXT STEPS${NC}"
echo "─────────────────────────────────────────────────────────────────────────────"

if [[ ${#ERRORS[@]} -gt 0 ]]; then
    echo -e "${RED}There are ${#ERRORS[@]} errors that need manual attention.${NC}"
    echo ""
    echo "Run these commands to fix voice system:"
    echo ""
    echo "  cd ~/Downloads"
    echo "  ./vistaview_COMPLETE_PART1.sh"
    echo "  ./vistaview_COMPLETE_PART2.sh"
    echo ""
else
    echo -e "${GREEN}No critical errors found!${NC}"
    echo ""
    echo "To start the dev server:"
    echo ""
    echo "  cd ~/vistaview_WORKING"
    echo "  npm run dev"
    echo ""
    echo "Then open: http://localhost:5180"
fi

echo ""
echo "─────────────────────────────────────────────────────────────────────────────"
echo -e "Log saved to: ${CYAN}$LOG_FILE${NC}"
echo -e "Backup saved to: ${CYAN}$BACKUP_DIR${NC}"
echo ""
echo -e "To revert changes: ${YELLOW}cp -r $BACKUP_DIR/* $VV_HOME/${NC}"
echo "═══════════════════════════════════════════════════════════════════════════════"
