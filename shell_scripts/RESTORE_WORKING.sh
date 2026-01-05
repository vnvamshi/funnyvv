#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
#  🔄 RESTORE WORKING STATE
#  Removes ONESHOT damage and restores working COMPLETE_UNIFIED_FIX structure
#═══════════════════════════════════════════════════════════════════════════════

VV="$HOME/vistaview_WORKING"
SRC="$VV/src"

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  🔄 RESTORE WORKING STATE"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Step 1: Remove ONESHOT damage (new files/folders that broke things)
echo "🗑️  Removing ONESHOT damage..."

# Remove the agentic folder I created (it conflicted with existing structure)
rm -rf "$SRC/components/agentic" 2>/dev/null && echo "  Removed components/agentic/"

# Remove wrong VendorFlow/BuilderFlow/AgentFlow in signin/ root (should be in subfolders)
rm -f "$SRC/components/signin/VendorFlow.tsx" 2>/dev/null && echo "  Removed signin/VendorFlow.tsx"
rm -f "$SRC/components/signin/BuilderFlow.tsx" 2>/dev/null && echo "  Removed signin/BuilderFlow.tsx"
rm -f "$SRC/components/signin/AgentFlow.tsx" 2>/dev/null && echo "  Removed signin/AgentFlow.tsx"

# Remove my broken pages
rm -f "$SRC/pages/HomePage.tsx" 2>/dev/null && echo "  Removed pages/HomePage.tsx"
rm -f "$SRC/pages/ProductCatalogPage.tsx" 2>/dev/null && echo "  Removed pages/ProductCatalogPage.tsx"
rm -f "$SRC/pages/RealEstatePage.tsx" 2>/dev/null && echo "  Removed pages/RealEstatePage.tsx"

# Remove upload folder I created
rm -rf "$SRC/components/upload" 2>/dev/null && echo "  Removed components/upload/"

echo ""
echo "✅ Damage removed"
echo ""

# Step 2: Restore App.tsx to working version (imports WhoAreYouModal)
echo "📄 Restoring App.tsx..."

cat > "$SRC/App.tsx" << 'APPTSX'
import React, { useState } from 'react';
import { WhoAreYouModal } from './components/signin';

function App() {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {showModal && (
        <WhoAreYouModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
}

export default App;
APPTSX

echo "  ✅ App.tsx restored"

# Step 3: Fix signin/index.ts exports
echo "📄 Restoring signin/index.ts..."

cat > "$SRC/components/signin/index.ts" << 'SIGNININDEX'
export { default as WhoAreYouModal } from './WhoAreYouModal';
export { default as VendorFlow } from './vendor/VendorFlow';
export { default as BuilderFlow } from './builder/BuilderFlow';
export { default as AgentFlow } from './agent/AgentFlow';
SIGNININDEX

echo "  ✅ signin/index.ts restored"

# Step 4: Verify the working files exist
echo ""
echo "🔍 Verifying working files..."

check_file() {
    if [ -f "$1" ]; then
        echo "  ✅ $2"
    else
        echo "  ❌ MISSING: $2"
    fi
}

check_file "$SRC/components/signin/WhoAreYouModal.tsx" "WhoAreYouModal.tsx"
check_file "$SRC/components/signin/vendor/VendorFlow.tsx" "vendor/VendorFlow.tsx"
check_file "$SRC/components/signin/builder/BuilderFlow.tsx" "builder/BuilderFlow.tsx"
check_file "$SRC/components/signin/agent/AgentFlow.tsx" "agent/AgentFlow.tsx"
check_file "$SRC/components/signin/common/UniversalAgenticBar.tsx" "common/UniversalAgenticBar.tsx"
check_file "$SRC/components/signin/common/MultiFormatUploader.tsx" "common/MultiFormatUploader.tsx"

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  ✅ RESTORE COMPLETE!"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "  NOW RUN:"
echo "  cd ~/vistaview_WORKING && npx vite --port 5180 --host"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
