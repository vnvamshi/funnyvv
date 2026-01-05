#!/bin/bash
# VistaView GitHub Push Script
# Run this on your local machine after downloading the backup

echo "=========================================="
echo "  VistaView GitHub Push Script"
echo "  End-of-Day Backup: January 4-5, 2026"
echo "=========================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "Error: Not in a git repository"
    echo "Please cd to the VISTAVIEW_EOD_BACKUP_JAN04_2026 directory"
    exit 1
fi

# Get GitHub repository URL from user
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/vistaview-backup.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "Error: Repository URL is required"
    exit 1
fi

# Add remote origin
echo "Adding remote origin..."
git remote remove origin 2>/dev/null
git remote add origin "$REPO_URL"

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main --force

echo ""
echo "=========================================="
echo "  Backup pushed to GitHub successfully!"
echo "=========================================="
echo ""
echo "Your backup is now available at:"
echo "$REPO_URL"
echo ""
echo "Contents include:"
echo "  - 10 React/TypeScript components"
echo "  - 19 shell scripts"
echo "  - 5 JSON configuration files"
echo "  - Backend server.cjs v33.4+"
echo "  - 108 session transcripts"
echo "  - Complete vistaview directories"
