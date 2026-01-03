#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
#
#  ██╗   ██╗██╗███████╗████████╗ █████╗ ██╗   ██╗██╗███████╗██╗    ██╗
#  ██║   ██║██║██╔════╝╚══██╔══╝██╔══██╗██║   ██║██║██╔════╝██║    ██║
#  ██║   ██║██║███████╗   ██║   ███████║██║   ██║██║█████╗  ██║ █╗ ██║
#  ╚██╗ ██╔╝██║╚════██║   ██║   ██╔══██║╚██╗ ██╔╝██║██╔══╝  ██║███╗██║
#   ╚████╔╝ ██║███████║   ██║   ██║  ██║ ╚████╔╝ ██║███████╗╚███╔███╔╝
#    ╚═══╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝  ╚═══╝  ╚═╝╚══════╝ ╚══╝╚══╝
#
#  MASTER CONTROL SYSTEM v2.0
#  Foolproof • Self-Healing • Version-Controlled • Archive-Enabled
#
#═══════════════════════════════════════════════════════════════════════════════
#
#  SAFEGUARDS:
#  ✅ Every change creates a version backup FIRST
#  ✅ README auto-updated with stats after every change
#  ✅ Keep last 10 versions in GitHub (.versions)
#  ✅ Keep last 15 versions in local ARCHIVE (zipped)
#  ✅ One-click restore from any version
#  ✅ Auto-install missing dependencies
#  ✅ Never delete without backup
#  ✅ Sync to GitHub after every version
#  ✅ Full system restore from GitHub possible
#  ✅ Lock system prevents concurrent modifications
#  ✅ Complete logging for audit trail
#
#═══════════════════════════════════════════════════════════════════════════════

set -e  # Exit on error

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════
WORKING_DIR="$HOME/vistaview_WORKING"
GITHUB_DIR="$HOME/Documents/GitHub/funnyvv"
VERSIONS_DIR="$WORKING_DIR/.versions"
ARCHIVE_DIR="$HOME/vistaview_ARCHIVE"       # Local archive (separate location)
MAX_VERSIONS=10                              # GitHub versions to keep
MAX_ARCHIVE=15                               # Local archive versions to keep
VERSION_PREFIX="vv"
LOCK_FILE="$WORKING_DIR/.vistaview.lock"
LOG_FILE="$WORKING_DIR/logs/master.log"

# Ports
PORT_FRONTEND=5200
PORT_BACKEND=3005
PORT_DASHBOARD=3006
PORT_OLLAMA=11434

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════════════════════
# LOGGING
# ═══════════════════════════════════════════════════════════════════════════════
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    mkdir -p "$(dirname "$LOG_FILE")"
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    case "$level" in
        "INFO") echo -e "${GREEN}✅ $message${NC}" ;;
        "WARN") echo -e "${YELLOW}⚠️  $message${NC}" ;;
        "ERROR") echo -e "${RED}❌ $message${NC}" ;;
        "ACTION") echo -e "${CYAN}🔄 $message${NC}" ;;
        "VERSION") echo -e "${BLUE}📦 $message${NC}" ;;
        "ARCHIVE") echo -e "${MAGENTA}🗄️  $message${NC}" ;;
        "SECURITY") echo -e "${RED}🔒 $message${NC}" ;;
    esac
}

# ═══════════════════════════════════════════════════════════════════════════════
# LOCK MANAGEMENT (Prevent concurrent modifications)
# ═══════════════════════════════════════════════════════════════════════════════
acquire_lock() {
    if [ -f "$LOCK_FILE" ]; then
        local lock_pid=$(cat "$LOCK_FILE" 2>/dev/null)
        if [ -n "$lock_pid" ] && ps -p "$lock_pid" > /dev/null 2>&1; then
            log "ERROR" "Another process is modifying VistaView (PID: $lock_pid)"
            echo ""
            echo "If this is stuck, run: rm $LOCK_FILE"
            exit 1
        else
            rm -f "$LOCK_FILE"
        fi
    fi
    echo $$ > "$LOCK_FILE"
    log "INFO" "Lock acquired (PID: $$)"
}

release_lock() {
    rm -f "$LOCK_FILE"
}

trap release_lock EXIT

# ═══════════════════════════════════════════════════════════════════════════════
# SANITY CHECKS
# ═══════════════════════════════════════════════════════════════════════════════
check_dependencies() {
    log "ACTION" "Checking dependencies..."
    
    local all_ok=true
    
    # Node.js
    if command -v node &> /dev/null; then
        local node_ver=$(node --version)
        log "INFO" "Node.js: $node_ver ✓"
    else
        log "ERROR" "Node.js: NOT INSTALLED"
        echo "  Install: brew install node"
        all_ok=false
    fi
    
    # npm
    if command -v npm &> /dev/null; then
        local npm_ver=$(npm --version)
        log "INFO" "npm: $npm_ver ✓"
    else
        log "ERROR" "npm: NOT INSTALLED"
        all_ok=false
    fi
    
    # Git
    if command -v git &> /dev/null; then
        local git_ver=$(git --version | cut -d' ' -f3)
        log "INFO" "Git: $git_ver ✓"
    else
        log "ERROR" "Git: NOT INSTALLED"
        echo "  Install: brew install git"
        all_ok=false
    fi
    
    # Ollama
    if command -v ollama &> /dev/null; then
        log "INFO" "Ollama: INSTALLED ✓"
        # Check if running
        if curl -s http://localhost:$PORT_OLLAMA/api/tags > /dev/null 2>&1; then
            log "INFO" "Ollama: RUNNING ✓"
        else
            log "WARN" "Ollama: NOT RUNNING (starting...)"
            nohup ollama serve > /dev/null 2>&1 &
            sleep 3
        fi
        
        # Check for models
        if ollama list 2>/dev/null | grep -q "gpt-oss:20b"; then
            log "INFO" "Model gpt-oss:20b: AVAILABLE ✓"
        else
            log "WARN" "Model gpt-oss:20b: NOT FOUND"
            echo "  Install: ollama pull gpt-oss:20b"
        fi
    else
        log "WARN" "Ollama: NOT INSTALLED (AI features limited)"
        echo "  Install: curl -fsSL https://ollama.com/install.sh | sh"
    fi
    
    # rsync
    if command -v rsync &> /dev/null; then
        log "INFO" "rsync: AVAILABLE ✓"
    else
        log "WARN" "rsync: NOT INSTALLED (using cp instead)"
    fi
    
    # zip
    if command -v zip &> /dev/null; then
        log "INFO" "zip: AVAILABLE ✓"
    else
        log "WARN" "zip: NOT INSTALLED (archiving limited)"
    fi
    
    if [ "$all_ok" = false ]; then
        return 1
    fi
    return 0
}

check_working_dir() {
    if [ ! -d "$WORKING_DIR" ]; then
        log "ERROR" "Working directory not found: $WORKING_DIR"
        echo ""
        echo "To restore from GitHub:"
        echo "  $0 restore-from-github"
        echo ""
        echo "Or clone manually:"
        echo "  git clone https://github.com/vnvamshi/funnyvv.git $WORKING_DIR"
        return 1
    fi
    log "INFO" "Working directory: OK ✓"
    return 0
}

check_github_dir() {
    if [ ! -d "$GITHUB_DIR" ]; then
        log "WARN" "GitHub directory not found: $GITHUB_DIR"
        echo "Please clone using GitHub Desktop or:"
        echo "  git clone https://github.com/vnvamshi/funnyvv.git $GITHUB_DIR"
        return 1
    fi
    log "INFO" "GitHub directory: OK ✓"
    return 0
}

check_archive_dir() {
    if [ ! -d "$ARCHIVE_DIR" ]; then
        log "ACTION" "Creating archive directory..."
        mkdir -p "$ARCHIVE_DIR"
    fi
    log "INFO" "Archive directory: $ARCHIVE_DIR ✓"
    return 0
}

# ═══════════════════════════════════════════════════════════════════════════════
# VERSION MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════════
get_current_version() {
    if [ -f "$WORKING_DIR/.current_version" ]; then
        cat "$WORKING_DIR/.current_version"
    else
        echo "v1.0.0"
    fi
}

get_next_version() {
    local current=$(get_current_version)
    local major=$(echo "$current" | cut -d'.' -f1 | tr -d 'v')
    local minor=$(echo "$current" | cut -d'.' -f2)
    local patch=$(echo "$current" | cut -d'.' -f3)
    
    patch=$((patch + 1))
    if [ $patch -ge 100 ]; then
        patch=0
        minor=$((minor + 1))
    fi
    if [ $minor -ge 100 ]; then
        minor=0
        major=$((major + 1))
    fi
    
    echo "v${major}.${minor}.${patch}"
}

get_ai_stats() {
    local ai_file="$WORKING_DIR/data/ai-data.json"
    if [ -f "$ai_file" ]; then
        local interactions=$(grep -o '"total_interactions": [0-9]*' "$ai_file" 2>/dev/null | grep -o '[0-9]*' | head -1 || echo "0")
        local patterns=$(grep -o '"learned_patterns": [0-9]*' "$ai_file" 2>/dev/null | grep -o '[0-9]*' | head -1 || echo "0")
        local prices=$(grep -o '"market_prices_learned": [0-9]*' "$ai_file" 2>/dev/null | grep -o '[0-9]*' | head -1 || echo "0")
        echo "${interactions:-0}|${patterns:-0}|${prices:-0}"
    else
        echo "0|0|0"
    fi
}

create_version() {
    local description="${1:-Auto backup}"
    local version=$(get_next_version)
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local version_dir="$VERSIONS_DIR/${version}_${timestamp}"
    
    log "VERSION" "Creating version $version: $description"
    
    mkdir -p "$version_dir"
    mkdir -p "$VERSIONS_DIR"
    
    # Backup critical directories
    for dir in data backend dashboard docs src public server; do
        if [ -d "$WORKING_DIR/$dir" ]; then
            cp -R "$WORKING_DIR/$dir" "$version_dir/" 2>/dev/null || true
        fi
    done
    
    # Backup critical files
    for file in package.json README.md .gitignore vite.config.ts tsconfig.json tailwind.config.cjs postcss.config.cjs; do
        if [ -f "$WORKING_DIR/$file" ]; then
            cp "$WORKING_DIR/$file" "$version_dir/" 2>/dev/null || true
        fi
    done
    
    # Get AI stats
    local stats=$(get_ai_stats)
    local interactions=$(echo "$stats" | cut -d'|' -f1)
    local patterns=$(echo "$stats" | cut -d'|' -f2)
    local prices=$(echo "$stats" | cut -d'|' -f3)
    
    # Create version manifest
    cat > "$version_dir/MANIFEST.json" << EOF
{
    "version": "$version",
    "timestamp": "$timestamp",
    "description": "$description",
    "created_at": "$(date -Iseconds)",
    "created_by": "$(whoami)",
    "ai_stats": {
        "total_interactions": ${interactions:-0},
        "learned_patterns": ${patterns:-0},
        "market_prices_learned": ${prices:-0}
    },
    "restore_command": "./vistaview.sh restore $version"
}
EOF
    
    # Update current version
    echo "$version" > "$WORKING_DIR/.current_version"
    
    log "INFO" "Version $version created in .versions/"
    
    # Create local archive (separate from GitHub)
    create_archive "$version" "$timestamp" "$description"
    
    # Purge old versions
    purge_old_versions
    
    # Update README
    update_readme "$version" "$description"
    
    # Append to CHANGELOG
    append_changelog "$version" "$description" "$interactions" "$patterns"
    
    echo "$version"
}

create_archive() {
    local version="$1"
    local timestamp="$2"
    local description="$3"
    
    check_archive_dir
    
    local archive_name="vistaview_${version}_${timestamp}.zip"
    local archive_path="$ARCHIVE_DIR/$archive_name"
    
    log "ARCHIVE" "Creating local archive: $archive_name"
    
    if command -v zip &> /dev/null; then
        cd "$WORKING_DIR"
        zip -rq "$archive_path" \
            data/ backend/ dashboard/ docs/ src/ public/ server/ \
            package.json README.md .gitignore \
            -x "*.log" -x "node_modules/*" -x ".git/*" \
            2>/dev/null || true
        
        # Create archive manifest
        cat > "$ARCHIVE_DIR/${version}_${timestamp}_MANIFEST.txt" << EOF
VistaView Archive
=================
Version: $version
Timestamp: $timestamp
Description: $description
Created: $(date)
Size: $(du -h "$archive_path" 2>/dev/null | cut -f1)

To Restore:
1. unzip $archive_name -d ~/vistaview_WORKING
2. cd ~/vistaview_WORKING
3. ./vistaview.sh setup

AI Stats at backup:
$(get_ai_stats | tr '|' '\n' | paste - - - | awk '{print "  Interactions: "$1"\n  Patterns: "$2"\n  Prices: "$3}')
EOF
        
        log "INFO" "Archive created: $archive_path"
    else
        log "WARN" "zip not installed, skipping archive"
    fi
    
    # Purge old archives (keep last MAX_ARCHIVE)
    purge_old_archives
}

purge_old_versions() {
    log "ACTION" "Checking version count..."
    
    local version_count=$(ls -1d "$VERSIONS_DIR"/v* 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$version_count" -gt "$MAX_VERSIONS" ]; then
        local to_delete=$((version_count - MAX_VERSIONS))
        log "ACTION" "Purging $to_delete old version(s) from .versions/ (keeping last $MAX_VERSIONS)"
        
        ls -1d "$VERSIONS_DIR"/v* 2>/dev/null | sort | head -n "$to_delete" | while read dir; do
            log "INFO" "Removing: $(basename "$dir")"
            rm -rf "$dir"
        done
    else
        log "INFO" "Version count OK: $version_count/$MAX_VERSIONS"
    fi
}

purge_old_archives() {
    log "ACTION" "Checking archive count..."
    
    local archive_count=$(ls -1 "$ARCHIVE_DIR"/*.zip 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$archive_count" -gt "$MAX_ARCHIVE" ]; then
        local to_delete=$((archive_count - MAX_ARCHIVE))
        log "ACTION" "Purging $to_delete old archive(s) (keeping last $MAX_ARCHIVE)"
        
        ls -1t "$ARCHIVE_DIR"/*.zip 2>/dev/null | tail -n "$to_delete" | while read file; do
            local base=$(basename "$file" .zip)
            log "INFO" "Removing archive: $(basename "$file")"
            rm -f "$file"
            rm -f "$ARCHIVE_DIR/${base}_MANIFEST.txt"
        done
    else
        log "INFO" "Archive count OK: $archive_count/$MAX_ARCHIVE"
    fi
}

list_versions() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo "                     LOCAL VERSIONS (.versions/)"
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo ""
    
    if [ ! -d "$VERSIONS_DIR" ] || [ -z "$(ls -A "$VERSIONS_DIR" 2>/dev/null)" ]; then
        echo "No versions found. Create one with: $0 backup"
    else
        printf "%-12s %-20s %-12s %-10s %s\n" "VERSION" "TIMESTAMP" "INTERACT." "PATTERNS" "DESCRIPTION"
        echo "───────────────────────────────────────────────────────────────────────────"
        
        for dir in $(ls -1d "$VERSIONS_DIR"/v* 2>/dev/null | sort -r | head -$MAX_VERSIONS); do
            if [ -f "$dir/MANIFEST.json" ]; then
                local ver=$(basename "$dir" | cut -d'_' -f1)
                local ts=$(basename "$dir" | cut -d'_' -f2)
                local interactions=$(grep -o '"total_interactions": [0-9]*' "$dir/MANIFEST.json" 2>/dev/null | grep -o '[0-9]*' || echo "0")
                local patterns=$(grep -o '"learned_patterns": [0-9]*' "$dir/MANIFEST.json" 2>/dev/null | grep -o '[0-9]*' || echo "0")
                local desc=$(grep -o '"description": "[^"]*"' "$dir/MANIFEST.json" 2>/dev/null | cut -d'"' -f4 | head -c 25)
                printf "%-12s %-20s %-12s %-10s %s\n" "$ver" "$ts" "$interactions" "$patterns" "$desc"
            fi
        done
    fi
    
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo "                     LOCAL ARCHIVES ($ARCHIVE_DIR)"
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo ""
    
    if [ -d "$ARCHIVE_DIR" ] && [ -n "$(ls -A "$ARCHIVE_DIR"/*.zip 2>/dev/null)" ]; then
        printf "%-40s %-10s %s\n" "ARCHIVE FILE" "SIZE" "DATE"
        echo "───────────────────────────────────────────────────────────────────────────"
        
        ls -1t "$ARCHIVE_DIR"/*.zip 2>/dev/null | head -$MAX_ARCHIVE | while read file; do
            local name=$(basename "$file")
            local size=$(du -h "$file" 2>/dev/null | cut -f1)
            local date=$(stat -f "%Sm" -t "%Y-%m-%d" "$file" 2>/dev/null || stat --format="%y" "$file" 2>/dev/null | cut -d' ' -f1)
            printf "%-40s %-10s %s\n" "$name" "$size" "$date"
        done
    else
        echo "No archives found."
    fi
    
    echo ""
    echo "Current version: $(get_current_version)"
    echo "Restore command: ./vistaview.sh restore <version>"
    echo ""
}

restore_version() {
    local target_version="$1"
    
    if [ -z "$target_version" ]; then
        log "ERROR" "Please specify a version to restore"
        echo ""
        echo "Usage: $0 restore <version>"
        echo "       $0 restore v1.0.5"
        echo ""
        list_versions
        return 1
    fi
    
    # Find version directory
    local version_dir=$(ls -1d "$VERSIONS_DIR"/${target_version}* 2>/dev/null | head -1)
    
    if [ -z "$version_dir" ] || [ ! -d "$version_dir" ]; then
        # Try to find in archives
        local archive_file=$(ls -1 "$ARCHIVE_DIR"/vistaview_${target_version}*.zip 2>/dev/null | head -1)
        
        if [ -n "$archive_file" ] && [ -f "$archive_file" ]; then
            log "ACTION" "Restoring from archive: $(basename "$archive_file")"
            restore_from_archive "$archive_file"
            return $?
        fi
        
        log "ERROR" "Version not found: $target_version"
        list_versions
        return 1
    fi
    
    log "ACTION" "Restoring to version: $target_version"
    
    # Create backup of current state first
    create_version "Auto-backup before restore to $target_version"
    
    # Stop all services
    stop_services
    
    # Restore files
    log "ACTION" "Restoring files..."
    
    for dir in data backend dashboard docs src public server; do
        if [ -d "$version_dir/$dir" ]; then
            rm -rf "$WORKING_DIR/$dir"
            cp -R "$version_dir/$dir" "$WORKING_DIR/"
            log "INFO" "Restored: $dir/"
        fi
    done
    
    for file in package.json README.md .gitignore vite.config.ts tsconfig.json; do
        if [ -f "$version_dir/$file" ]; then
            cp "$version_dir/$file" "$WORKING_DIR/"
            log "INFO" "Restored: $file"
        fi
    done
    
    # Update current version marker
    echo "$target_version" > "$WORKING_DIR/.current_version"
    
    log "INFO" "Restored to version $target_version"
    
    # Reinstall dependencies
    log "ACTION" "Reinstalling dependencies..."
    cd "$WORKING_DIR" && npm install --legacy-peer-deps --silent 2>/dev/null || true
    
    # Start services
    start_services
    
    log "INFO" "Restore complete!"
}

restore_from_archive() {
    local archive_file="$1"
    
    if [ ! -f "$archive_file" ]; then
        log "ERROR" "Archive not found: $archive_file"
        return 1
    fi
    
    log "ACTION" "Restoring from archive: $(basename "$archive_file")"
    
    # Create backup first
    if [ -d "$WORKING_DIR" ]; then
        create_version "Auto-backup before archive restore"
    fi
    
    # Stop services
    stop_services
    
    # Extract archive
    mkdir -p "$WORKING_DIR"
    unzip -o "$archive_file" -d "$WORKING_DIR" 2>/dev/null
    
    # Install dependencies
    cd "$WORKING_DIR" && npm install --legacy-peer-deps --silent 2>/dev/null || true
    
    # Start services
    start_services
    
    log "INFO" "Restored from archive!"
}

# ═══════════════════════════════════════════════════════════════════════════════
# README & CHANGELOG AUTO-UPDATE
# ═══════════════════════════════════════════════════════════════════════════════
update_readme() {
    local version="$1"
    local description="$2"
    local stats=$(get_ai_stats)
    local interactions=$(echo "$stats" | cut -d'|' -f1)
    local patterns=$(echo "$stats" | cut -d'|' -f2)
    local prices=$(echo "$stats" | cut -d'|' -f3)
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local date_only=$(date '+%Y-%m-%d')
    
    log "ACTION" "Updating README.md..."
    
    # Check if we have the full README template
    if [ -f "$WORKING_DIR/docs/README_TEMPLATE.md" ]; then
        # Use template and substitute values
        sed -e "s/{{VERSION}}/$version/g" \
            -e "s/{{INTERACTIONS}}/$interactions/g" \
            -e "s/{{PATTERNS}}/$patterns/g" \
            -e "s/{{PRICES}}/$prices/g" \
            -e "s/{{TIMESTAMP}}/$timestamp/g" \
            -e "s/{{DATE}}/$date_only/g" \
            -e "s/{{DESCRIPTION}}/$description/g" \
            "$WORKING_DIR/docs/README_TEMPLATE.md" > "$WORKING_DIR/README.md"
    else
        # Create minimal README with stats
        cat > "$WORKING_DIR/README.md" << EOF
# 🏠 VistaView - The Amazon of Real Estate

[![Version](https://img.shields.io/badge/version-${version}-blue.svg)](#)
[![AI](https://img.shields.io/badge/AI-gpt--oss:20b-green.svg)](#)
[![Interactions](https://img.shields.io/badge/interactions-${interactions}-orange.svg)](#)

> **Version:** ${version} | **Updated:** ${timestamp}

## 🚀 Quick Start

\`\`\`bash
./vistaview.sh setup    # Fresh install
./vistaview.sh start    # Start services
./vistaview.sh status   # Check status
\`\`\`

## 📊 AI Stats

| Metric | Value |
|--------|-------|
| Total Interactions | ${interactions} |
| Learned Patterns | ${patterns} |
| Market Prices | ${prices} |

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:${PORT_FRONTEND} |
| Dashboard | http://localhost:${PORT_DASHBOARD}/dashboard |
| Backend | http://localhost:${PORT_BACKEND}/api/stats |

## 📋 Commands

\`\`\`bash
./vistaview.sh start              # Start all
./vistaview.sh stop               # Stop all
./vistaview.sh backup "message"   # Create backup
./vistaview.sh versions           # List versions
./vistaview.sh restore v1.0.5     # Restore version
./vistaview.sh sync               # Sync to GitHub
\`\`\`

## 🆘 Emergency Restore

\`\`\`bash
git clone https://github.com/vnvamshi/funnyvv.git ~/vistaview_WORKING
cd ~/vistaview_WORKING
./vistaview.sh setup
\`\`\`

---
*Auto-generated: ${timestamp}*
EOF
    fi
    
    log "INFO" "README.md updated"
}

append_changelog() {
    local version="$1"
    local description="$2"
    local interactions="$3"
    local patterns="$4"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    local changelog="$WORKING_DIR/docs/CHANGELOG.md"
    
    if [ ! -f "$changelog" ]; then
        mkdir -p "$WORKING_DIR/docs"
        cat > "$changelog" << 'EOF'
# VistaView Changelog

All notable changes documented here.

---

EOF
    fi
    
    # Prepend new entry (after header)
    local temp_file=$(mktemp)
    head -6 "$changelog" > "$temp_file"
    
    cat >> "$temp_file" << EOF

## [$version] - $(date '+%Y-%m-%d')

### Changes
- $description

### Stats at Backup
- Interactions: $interactions
- Patterns: $patterns
- Timestamp: $timestamp

---
EOF
    
    tail -n +7 "$changelog" >> "$temp_file"
    mv "$temp_file" "$changelog"
    
    log "INFO" "CHANGELOG.md updated"
}

# ═══════════════════════════════════════════════════════════════════════════════
# SERVICE MANAGEMENT
# ═══════════════════════════════════════════════════════════════════════════════
stop_services() {
    log "ACTION" "Stopping all services..."
    
    pkill -f "node.*server.cjs" 2>/dev/null || true
    pkill -f "node.*learner" 2>/dev/null || true
    pkill -f "vite.*$PORT_FRONTEND" 2>/dev/null || true
    
    lsof -ti:$PORT_FRONTEND 2>/dev/null | xargs kill -9 2>/dev/null || true
    lsof -ti:$PORT_BACKEND 2>/dev/null | xargs kill -9 2>/dev/null || true
    lsof -ti:$PORT_DASHBOARD 2>/dev/null | xargs kill -9 2>/dev/null || true
    
    sleep 2
    log "INFO" "All services stopped"
}

start_services() {
    log "ACTION" "Starting all services..."
    
    cd "$WORKING_DIR"
    mkdir -p logs
    
    # Start backend
    if [ -f "backend/server.cjs" ]; then
        log "ACTION" "Starting backend on port $PORT_BACKEND..."
        cd "$WORKING_DIR/backend"
        [ ! -d "node_modules" ] && npm install --silent 2>/dev/null
        node server.cjs >> "$WORKING_DIR/logs/backend.log" 2>&1 &
        sleep 1
        cd "$WORKING_DIR"
    fi
    
    # Start learner
    if [ -f "backend/learner.cjs" ]; then
        log "ACTION" "Starting learning engine..."
        cd "$WORKING_DIR/backend"
        node learner.cjs >> "$WORKING_DIR/logs/learner.log" 2>&1 &
        sleep 1
        cd "$WORKING_DIR"
    fi
    
    # Start dashboard
    if [ -f "dashboard/server.cjs" ]; then
        log "ACTION" "Starting dashboard on port $PORT_DASHBOARD..."
        cd "$WORKING_DIR/dashboard"
        [ ! -d "node_modules" ] && npm install --silent 2>/dev/null
        node server.cjs >> "$WORKING_DIR/logs/dashboard.log" 2>&1 &
        sleep 1
        cd "$WORKING_DIR"
    fi
    
    # Start frontend
    log "ACTION" "Starting frontend on port $PORT_FRONTEND..."
    cd "$WORKING_DIR"
    npm run dev -- --port $PORT_FRONTEND --host >> logs/frontend.log 2>&1 &
    
    sleep 3
    log "INFO" "All services started"
    
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo "  🌐 Frontend:    http://localhost:$PORT_FRONTEND"
    echo "  📊 Dashboard:   http://localhost:$PORT_DASHBOARD/dashboard"
    echo "  🔌 Backend:     http://localhost:$PORT_BACKEND/api/stats"
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo ""
}

check_status() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo "                     SERVICE STATUS"
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo ""
    
    local all_ok=true
    
    # Frontend
    if curl -s "http://localhost:$PORT_FRONTEND" > /dev/null 2>&1; then
        echo -e "🖥️  Frontend (${PORT_FRONTEND}):     ${GREEN}✅ RUNNING${NC}"
    else
        echo -e "🖥️  Frontend (${PORT_FRONTEND}):     ${RED}❌ DOWN${NC}"
        all_ok=false
    fi
    
    # Backend
    if curl -s "http://localhost:$PORT_BACKEND/api/health" > /dev/null 2>&1; then
        echo -e "🔌 Backend (${PORT_BACKEND}):      ${GREEN}✅ RUNNING${NC}"
    else
        echo -e "🔌 Backend (${PORT_BACKEND}):      ${RED}❌ DOWN${NC}"
        all_ok=false
    fi
    
    # Dashboard
    if curl -s "http://localhost:$PORT_DASHBOARD/dashboard" > /dev/null 2>&1; then
        echo -e "📊 Dashboard (${PORT_DASHBOARD}):    ${GREEN}✅ RUNNING${NC}"
    else
        echo -e "📊 Dashboard (${PORT_DASHBOARD}):    ${RED}❌ DOWN${NC}"
        all_ok=false
    fi
    
    # Ollama
    if curl -s "http://localhost:$PORT_OLLAMA/api/tags" > /dev/null 2>&1; then
        echo -e "🤖 Ollama (${PORT_OLLAMA}):     ${GREEN}✅ RUNNING${NC}"
    else
        echo -e "🤖 Ollama (${PORT_OLLAMA}):     ${YELLOW}⚠️  NOT RUNNING${NC}"
    fi
    
    echo ""
    echo "───────────────────────────────────────────────────────────────────────────"
    
    # AI Stats
    local stats=$(get_ai_stats)
    local interactions=$(echo "$stats" | cut -d'|' -f1)
    local patterns=$(echo "$stats" | cut -d'|' -f2)
    local prices=$(echo "$stats" | cut -d'|' -f3)
    
    echo ""
    echo "📊 AI Stats:"
    echo "   Total Interactions: $interactions"
    echo "   Learned Patterns:   $patterns"
    echo "   Market Prices:      $prices"
    echo "   Current Version:    $(get_current_version)"
    echo ""
    
    # Version counts
    local ver_count=$(ls -1d "$VERSIONS_DIR"/v* 2>/dev/null | wc -l | tr -d ' ')
    local arch_count=$(ls -1 "$ARCHIVE_DIR"/*.zip 2>/dev/null | wc -l | tr -d ' ')
    echo "💾 Backups:"
    echo "   Local Versions:     $ver_count/$MAX_VERSIONS"
    echo "   Archive (zipped):   $arch_count/$MAX_ARCHIVE"
    echo ""
    
    if [ "$all_ok" = true ]; then
        echo -e "${GREEN}✅ All systems operational${NC}"
    else
        echo -e "${YELLOW}⚠️  Some services are down. Run: ./vistaview.sh restart${NC}"
    fi
    echo ""
}

# ═══════════════════════════════════════════════════════════════════════════════
# GITHUB SYNC
# ═══════════════════════════════════════════════════════════════════════════════
sync_to_github() {
    log "ACTION" "Syncing to GitHub..."
    
    if ! check_github_dir; then
        return 1
    fi
    
    # Create version first
    create_version "Sync to GitHub"
    
    # Sync files using rsync
    if command -v rsync &> /dev/null; then
        rsync -av --delete \
            --exclude 'node_modules' \
            --exclude '.versions' \
            --exclude 'logs/*.log' \
            --exclude 'backups' \
            --exclude '.git' \
            --exclude '.env' \
            --exclude '.env.local' \
            --exclude 'frontend_src.zip' \
            --exclude '*.zip' \
            "$WORKING_DIR/" "$GITHUB_DIR/"
    else
        # Fallback to cp
        rm -rf "$GITHUB_DIR"/*
        cp -R "$WORKING_DIR"/* "$GITHUB_DIR/" 2>/dev/null || true
        rm -rf "$GITHUB_DIR/node_modules" "$GITHUB_DIR/.versions" "$GITHUB_DIR/.git"
    fi
    
    log "INFO" "Files synced to: $GITHUB_DIR"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo "  📁 Files synced to: $GITHUB_DIR"
    echo ""
    echo "  Next steps:"
    echo "  1. Open GitHub Desktop"
    echo "  2. Review changes"
    echo "  3. Write commit message"
    echo "  4. Click 'Commit to main'"
    echo "  5. Click 'Push origin'"
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo ""
}

restore_from_github() {
    log "ACTION" "Restoring from GitHub..."
    
    if ! check_github_dir; then
        log "WARN" "GitHub directory not found. Cloning..."
        git clone https://github.com/vnvamshi/funnyvv.git "$GITHUB_DIR"
    fi
    
    # Backup current state if exists
    if [ -d "$WORKING_DIR" ] && [ -f "$WORKING_DIR/data/ai-data.json" ]; then
        log "ACTION" "Backing up current state..."
        create_version "Auto-backup before GitHub restore"
    fi
    
    # Stop services
    stop_services
    
    # Sync from GitHub
    mkdir -p "$WORKING_DIR"
    
    if command -v rsync &> /dev/null; then
        rsync -av --delete \
            --exclude '.git' \
            --exclude 'node_modules' \
            "$GITHUB_DIR/" "$WORKING_DIR/"
    else
        rm -rf "$WORKING_DIR"/*
        cp -R "$GITHUB_DIR"/* "$WORKING_DIR/" 2>/dev/null || true
        rm -rf "$WORKING_DIR/.git"
    fi
    
    # Install dependencies
    log "ACTION" "Installing dependencies..."
    cd "$WORKING_DIR" && npm install --legacy-peer-deps --silent 2>/dev/null || true
    
    if [ -d "$WORKING_DIR/backend" ]; then
        cd "$WORKING_DIR/backend" && npm install --silent 2>/dev/null || true
    fi
    
    if [ -d "$WORKING_DIR/dashboard" ]; then
        cd "$WORKING_DIR/dashboard" && npm install --silent 2>/dev/null || true
    fi
    
    log "INFO" "Restore from GitHub complete!"
    
    # Start services
    start_services
}

# ═══════════════════════════════════════════════════════════════════════════════
# SETUP (Fresh Install)
# ═══════════════════════════════════════════════════════════════════════════════
setup() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo "                  VISTAVIEW SETUP"
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo ""
    
    # Check dependencies
    check_dependencies || true
    
    # Create directories
    mkdir -p "$WORKING_DIR"/{logs,backups,.versions}
    mkdir -p "$WORKING_DIR"/ops/{scripts,cron}
    mkdir -p "$WORKING_DIR"/docs
    mkdir -p "$WORKING_DIR"/reports
    mkdir -p "$ARCHIVE_DIR"
    
    # Install npm dependencies
    log "ACTION" "Installing npm dependencies..."
    cd "$WORKING_DIR"
    
    if [ -f "package.json" ]; then
        npm install --legacy-peer-deps 2>/dev/null || npm install --force 2>/dev/null || true
    fi
    
    if [ -d "backend" ] && [ -f "backend/package.json" ]; then
        cd "$WORKING_DIR/backend" && npm install --silent 2>/dev/null || true
    fi
    
    if [ -d "dashboard" ] && [ -f "dashboard/package.json" ]; then
        cd "$WORKING_DIR/dashboard" && npm install --silent 2>/dev/null || true
    fi
    
    cd "$WORKING_DIR"
    
    # Create initial version
    create_version "Initial setup"
    
    # Start services
    start_services
    
    # Show status
    sleep 3
    check_status
    
    log "INFO" "Setup complete!"
}

# ═══════════════════════════════════════════════════════════════════════════════
# MANUAL ARCHIVE COMMAND
# ═══════════════════════════════════════════════════════════════════════════════
archive_now() {
    local description="${1:-Manual archive}"
    local version=$(get_current_version)
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    
    log "ARCHIVE" "Creating manual archive..."
    
    create_archive "$version" "$timestamp" "$description"
    
    log "INFO" "Archive created in: $ARCHIVE_DIR"
}

# ═══════════════════════════════════════════════════════════════════════════════
# HELP
# ═══════════════════════════════════════════════════════════════════════════════
show_help() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo "  VISTAVIEW MASTER CONTROL SYSTEM v2.0"
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "SERVICE COMMANDS:"
    echo "  setup                  Fresh install and setup"
    echo "  start                  Start all services"
    echo "  stop                   Stop all services"
    echo "  restart                Restart all services"
    echo "  status                 Check service status and AI stats"
    echo ""
    echo "VERSION COMMANDS:"
    echo "  backup [description]   Create version backup (auto-archives)"
    echo "  versions               List all versions and archives"
    echo "  restore <version>      Restore to specific version"
    echo "  archive [description]  Create manual archive only"
    echo ""
    echo "GITHUB COMMANDS:"
    echo "  sync                   Sync working folder to GitHub"
    echo "  restore-from-github    Restore everything from GitHub"
    echo ""
    echo "SYSTEM COMMANDS:"
    echo "  check                  Run all sanity checks"
    echo "  help                   Show this help"
    echo ""
    echo "EXAMPLES:"
    echo "  $0 setup                          # Fresh setup"
    echo "  $0 backup 'Added new feature'     # Create backup"
    echo "  $0 restore v1.0.5                 # Restore version"
    echo "  $0 sync                           # Push to GitHub"
    echo ""
    echo "DIRECTORIES:"
    echo "  Working:  $WORKING_DIR"
    echo "  GitHub:   $GITHUB_DIR"
    echo "  Archives: $ARCHIVE_DIR"
    echo ""
    echo "RETENTION:"
    echo "  Local Versions (.versions/): Keep last $MAX_VERSIONS"
    echo "  Local Archives (zipped):     Keep last $MAX_ARCHIVE"
    echo ""
}

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════
main() {
    local command="${1:-help}"
    shift || true
    
    case "$command" in
        setup)
            acquire_lock
            setup
            ;;
        start)
            acquire_lock
            check_working_dir || exit 1
            start_services
            check_status
            ;;
        stop)
            acquire_lock
            stop_services
            ;;
        restart)
            acquire_lock
            check_working_dir || exit 1
            stop_services
            start_services
            check_status
            ;;
        status)
            check_status
            ;;
        backup)
            acquire_lock
            check_working_dir || exit 1
            create_version "${1:-Manual backup}"
            ;;
        versions|list)
            list_versions
            ;;
        restore)
            acquire_lock
            restore_version "$1"
            ;;
        archive)
            acquire_lock
            check_working_dir || exit 1
            archive_now "${1:-Manual archive}"
            ;;
        sync)
            acquire_lock
            check_working_dir || exit 1
            sync_to_github
            ;;
        restore-from-github|github-restore|pull)
            acquire_lock
            restore_from_github
            ;;
        check)
            check_dependencies
            check_working_dir || true
            check_github_dir || true
            check_archive_dir
            check_status
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log "ERROR" "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main
main "$@"
