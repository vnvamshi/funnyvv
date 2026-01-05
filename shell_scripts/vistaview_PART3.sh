#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# PART 3: AgenticBar in ALL Vendor Steps (including PDF Upload)
# VISTAVIEW_AGENTIC_STANDARD_V1 Compliant
# ═══════════════════════════════════════════════════════════════════════════════

W="/Users/vistaview/vistaview_WORKING"
TS=$(date -u +%Y%m%d_%H%M%S)
BK="/Users/vistaview/vistaview_BACKUPS/$TS"

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  PART 3: AgenticBar in ALL Vendor Steps"
echo "  Timestamp: $TS"
echo "═══════════════════════════════════════════════════════════════════════════════"

# ═══════════════════════════════════════════════════════════════════════════════
# BACKUP (Rule 2,3,4)
# ═══════════════════════════════════════════════════════════════════════════════
echo "[BACKUP] Creating recursive backup..."
mkdir -p "$BK"
cp -r "$W/src/components" "$BK/" 2>/dev/null
echo "✅ Backup: $BK"

# ═══════════════════════════════════════════════════════════════════════════════
# PLAN: Find ALL vendor step components
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "[PLAN] Finding all vendor flow components..."
find "$W/src" -name "*.tsx" -path "*vendor*" -o -name "*Vendor*.tsx" -o -name "*Upload*.tsx" -o -name "*Catalog*.tsx" 2>/dev/null | head -20

# ═══════════════════════════════════════════════════════════════════════════════
# APPLY: Create VendorUpload.tsx (Step 4 - PDF Upload with AgenticBar)
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "[APPLY] Creating VendorUpload.tsx with AgenticBar..."

mkdir -p "$W/src/components/signin/vendor"

cat > "$W/src/components/signin/vendor/VendorUpload.tsx" << 'EOF'
// VendorUpload.tsx - PDF Catalog Upload with AgenticBar
import React, { useState, useCallback, useRef } from 'react';
import AgenticBar, { speak, onCommand } from '../../../agentic';

interface Props {
  vendorId: string;
  vendorName: string;
  onComplete: (catalogId: string, stats: any) => void;
}

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  filename: string;
  stats: { totalPages: number; totalImages: number; totalProducts: number } | null;
  error: string | null;
}

const VendorUpload: React.FC<Props> = ({ vendorId, vendorName, onComplete }) => {
  const [state, setState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    filename: '',
    stats: null,
    error: null
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    setState(s => ({ ...s, status: 'uploading', filename: file.name, progress: 10 }));
    speak('Uploading your catalog. This may take a moment.', () => {});

    const formData = new FormData();
    formData.append('catalog', file);
    formData.append('vendorId', vendorId);
    formData.append('vendorName', vendorName);
    formData.append('originalFilename', file.name);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setState(s => ({ ...s, progress: Math.min(s.progress + 10, 90) }));
      }, 500);

      setState(s => ({ ...s, status: 'processing', progress: 30 }));
      speak('Processing your PDF catalog.', () => {});

      const response = await fetch('http://localhost:1117/api/catalog/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      
      setState(s => ({
        ...s,
        status: 'complete',
        progress: 100,
        stats: result.stats
      }));

      speak(`Excellent! Created ${result.stats?.totalProducts || 0} products from your catalog. Say next to continue.`, () => {});
      
      setTimeout(() => onComplete(result.catalogId, result.stats), 2000);

    } catch (error: any) {
      setState(s => ({ ...s, status: 'error', error: error.message }));
      speak('Sorry, there was an error uploading your catalog. Please try again.', () => {});
    }
  }, [vendorId, vendorName, onComplete]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      handleUpload(file);
    } else {
      speak('Please select a PDF file.', () => {});
    }
  }, [handleUpload]);

  const handleCommand = useCallback((cmd: string) => {
    if (cmd.includes('upload') || cmd.includes('choose') || cmd.includes('select')) {
      fileInputRef.current?.click();
    }
    if (cmd.includes('next') || cmd.includes('continue')) {
      if (state.status === 'complete') {
        speak('Moving to the next step.', () => {});
      }
    }
  }, [state.status]);

  React.useEffect(() => {
    return onCommand(handleCommand);
  }, [handleCommand]);

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '4em' }}>📄</span>
      <h3 style={{ color: '#B8860B', margin: '16px 0 8px', fontSize: '1.4em' }}>
        Upload Your Catalog
      </h3>
      <p style={{ color: '#888', marginBottom: '24px' }}>
        Upload a PDF catalog to create your product listings
      </p>

      {state.status === 'idle' && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '20px 40px',
              background: 'linear-gradient(135deg, #B8860B, #DAA520)',
              color: '#000',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              fontSize: '1.2em',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '0 auto'
            }}
          >
            📁 Choose PDF File
          </button>
          <p style={{ color: '#666', marginTop: '16px', fontSize: '0.9em' }}>
            or drag and drop your PDF here
          </p>
        </>
      )}

      {(state.status === 'uploading' || state.status === 'processing') && (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '3em' }}>⚙️</span>
          </div>
          <p style={{ color: '#B8860B', fontWeight: 600, marginBottom: '8px' }}>
            {state.status === 'uploading' ? 'Uploading...' : 'Processing...'}
          </p>
          <p style={{ color: '#888', marginBottom: '16px' }}>{state.filename}</p>
          
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '12px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${state.progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #B8860B, #DAA520)',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <p style={{ color: '#888', marginTop: '8px' }}>{state.progress}%</p>

          {/* Steps */}
          <div style={{ marginTop: '24px', textAlign: 'left' }}>
            {['Parsing catalog', 'Extracting images', 'AI enhancement', 'Database storage', 'Publishing'].map((step, i) => {
              const isActive = state.progress >= (i + 1) * 20;
              const isCurrent = state.progress >= i * 20 && state.progress < (i + 1) * 20;
              return (
                <div key={step} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: isCurrent ? 'rgba(184,134,11,0.2)' : 'transparent',
                  borderRadius: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: isActive ? '#4CAF50' : isCurrent ? '#B8860B' : 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8em'
                  }}>
                    {isActive ? '✓' : isCurrent ? '...' : (i + 1)}
                  </span>
                  <span style={{ color: isActive ? '#4CAF50' : isCurrent ? '#B8860B' : '#666' }}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {state.status === 'complete' && state.stats && (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '4em' }}>🎉</span>
          </div>
          <h4 style={{ color: '#4CAF50', marginBottom: '16px' }}>Catalog Processed!</h4>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginBottom: '24px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2em', fontWeight: 700, color: '#B8860B' }}>
                {state.stats.totalPages}
              </div>
              <div style={{ color: '#888', fontSize: '0.9em' }}>Pages</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2em', fontWeight: 700, color: '#B8860B' }}>
                {state.stats.totalImages}
              </div>
              <div style={{ color: '#888', fontSize: '0.9em' }}>Images</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2em', fontWeight: 700, color: '#4CAF50' }}>
                {state.stats.totalProducts}
              </div>
              <div style={{ color: '#888', fontSize: '0.9em' }}>Products</div>
            </div>
          </div>

          <p style={{ color: '#4CAF50' }}>✓ Say "next" to continue</p>
        </div>
      )}

      {state.status === 'error' && (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '4em' }}>❌</span>
          </div>
          <p style={{ color: '#f44336', marginBottom: '16px' }}>{state.error}</p>
          <button
            onClick={() => setState(s => ({ ...s, status: 'idle', error: null }))}
            style={{
              padding: '12px 24px',
              background: '#B8860B',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Try Again
          </button>
        </div>
      )}

      <AgenticBar
        context="Catalog Upload"
        hints={['"upload" to select file', '"next" when complete']}
        welcomeMessage={state.status === 'idle' ? "Now let's upload your product catalog. Click choose file or say upload to select your PDF." : undefined}
        autoStart={true}
      />
    </div>
  );
};

export default VendorUpload;
EOF
echo "✅ VendorUpload.tsx created"

# ═══════════════════════════════════════════════════════════════════════════════
# APPLY: Create VendorAddress.tsx (Step 5)
# ═══════════════════════════════════════════════════════════════════════════════
echo "[APPLY] Creating VendorAddress.tsx..."

cat > "$W/src/components/signin/vendor/VendorAddress.tsx" << 'EOF'
// VendorAddress.tsx - Business Address with AgenticBar
import React, { useState, useEffect, useCallback } from 'react';
import AgenticBar, { speak, onCommand } from '../../../agentic';

interface Props {
  address: { street: string; city: string; state: string; zip: string };
  onChange: (address: any) => void;
  onNext: () => void;
}

const VendorAddress: React.FC<Props> = ({ address, onChange, onNext }) => {
  const [form, setForm] = useState(address);

  const updateField = (field: string, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    onChange(updated);
  };

  const isComplete = form.street && form.city && form.state && form.zip;

  const handleCommand = useCallback((cmd: string) => {
    if ((cmd.includes('next') || cmd.includes('continue') || cmd.includes('save')) && isComplete) {
      speak('Saving your address.', () => onNext());
    }
    if (cmd.includes('skip')) {
      speak('Skipping address for now.', () => onNext());
    }
    if (cmd.includes('clear') || cmd.includes('reset')) {
      setForm({ street: '', city: '', state: '', zip: '' });
      onChange({ street: '', city: '', state: '', zip: '' });
      speak('Address cleared.');
    }
  }, [isComplete, onNext, onChange]);

  useEffect(() => {
    return onCommand(handleCommand);
  }, [handleCommand]);

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '4em' }}>📍</span>
      <h3 style={{ color: '#B8860B', margin: '16px 0 8px', fontSize: '1.4em' }}>
        Business Address
      </h3>
      <p style={{ color: '#888', marginBottom: '24px' }}>
        Where is your business located?
      </p>

      <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
        <input
          type="text"
          placeholder="Street Address"
          value={form.street}
          onChange={e => updateField('street', e.target.value)}
          style={{
            width: '100%',
            padding: '14px 16px',
            marginBottom: '12px',
            borderRadius: '10px',
            border: `2px solid ${form.street ? '#B8860B' : 'rgba(184,134,11,0.4)'}`,
            background: 'rgba(0,0,0,0.3)',
            color: '#fff',
            fontSize: '1em'
          }}
        />
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="City"
            value={form.city}
            onChange={e => updateField('city', e.target.value)}
            style={{
              flex: 2,
              padding: '14px 16px',
              borderRadius: '10px',
              border: `2px solid ${form.city ? '#B8860B' : 'rgba(184,134,11,0.4)'}`,
              background: 'rgba(0,0,0,0.3)',
              color: '#fff',
              fontSize: '1em'
            }}
          />
          <input
            type="text"
            placeholder="State"
            value={form.state}
            onChange={e => updateField('state', e.target.value.toUpperCase().slice(0, 2))}
            style={{
              flex: 1,
              padding: '14px 16px',
              borderRadius: '10px',
              border: `2px solid ${form.state ? '#B8860B' : 'rgba(184,134,11,0.4)'}`,
              background: 'rgba(0,0,0,0.3)',
              color: '#fff',
              fontSize: '1em',
              textTransform: 'uppercase'
            }}
          />
        </div>
        <input
          type="text"
          placeholder="ZIP Code"
          value={form.zip}
          onChange={e => updateField('zip', e.target.value.replace(/\D/g, '').slice(0, 5))}
          style={{
            width: '50%',
            padding: '14px 16px',
            marginBottom: '24px',
            borderRadius: '10px',
            border: `2px solid ${form.zip ? '#B8860B' : 'rgba(184,134,11,0.4)'}`,
            background: 'rgba(0,0,0,0.3)',
            color: '#fff',
            fontSize: '1em'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={() => speak('Skipping.', () => onNext())}
          style={{
            padding: '14px 28px',
            background: 'transparent',
            color: '#888',
            border: '1px solid #555',
            borderRadius: '24px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Skip for now
        </button>
        <button
          onClick={() => isComplete && speak('Saving.', () => onNext())}
          disabled={!isComplete}
          style={{
            padding: '14px 36px',
            background: isComplete ? 'linear-gradient(135deg, #B8860B, #DAA520)' : 'rgba(255,255,255,0.1)',
            color: isComplete ? '#000' : '#555',
            border: 'none',
            borderRadius: '24px',
            cursor: isComplete ? 'pointer' : 'not-allowed',
            fontWeight: 700
          }}
        >
          Continue →
        </button>
      </div>

      <AgenticBar
        context="Business Address"
        hints={['"next" to continue', '"skip" to skip']}
        welcomeMessage="Enter your business address, or say skip to add it later."
        autoStart={true}
      />
    </div>
  );
};

export default VendorAddress;
EOF
echo "✅ VendorAddress.tsx created"

# ═══════════════════════════════════════════════════════════════════════════════
# APPLY: Create VendorComplete.tsx (Step 6 - Completion)
# ═══════════════════════════════════════════════════════════════════════════════
echo "[APPLY] Creating VendorComplete.tsx..."

cat > "$W/src/components/signin/vendor/VendorComplete.tsx" << 'EOF'
// VendorComplete.tsx - Onboarding Complete with AgenticBar
import React, { useEffect, useCallback } from 'react';
import AgenticBar, { speak, onCommand } from '../../../agentic';

interface Props {
  vendorName: string;
  stats: { totalProducts: number } | null;
  onViewStore: () => void;
  onClose: () => void;
}

const VendorComplete: React.FC<Props> = ({ vendorName, stats, onViewStore, onClose }) => {
  
  const handleCommand = useCallback((cmd: string) => {
    if (cmd.includes('view') || cmd.includes('store') || cmd.includes('products') || cmd.includes('see')) {
      speak('Opening your store.', () => onViewStore());
    }
    if (cmd.includes('close') || cmd.includes('done') || cmd.includes('finish')) {
      speak('Congratulations on joining VistaView!', () => onClose());
    }
  }, [onViewStore, onClose]);

  useEffect(() => {
    return onCommand(handleCommand);
  }, [handleCommand]);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '5em', marginBottom: '16px' }}>🎉</div>
      <h2 style={{ color: '#4CAF50', margin: '16px 0', fontSize: '1.8em' }}>
        Welcome to VistaView!
      </h2>
      <p style={{ color: '#B8860B', fontSize: '1.2em', marginBottom: '8px' }}>
        {vendorName}
      </p>
      <p style={{ color: '#888', marginBottom: '24px' }}>
        Your vendor account is now active
      </p>

      {stats && stats.totalProducts > 0 && (
        <div style={{
          background: 'rgba(76,175,80,0.15)',
          border: '1px solid #4CAF50',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          maxWidth: '300px',
          margin: '0 auto 24px'
        }}>
          <div style={{ fontSize: '3em', fontWeight: 700, color: '#4CAF50' }}>
            {stats.totalProducts}
          </div>
          <div style={{ color: '#888' }}>Products Published</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => speak('Opening your store.', () => onViewStore())}
          style={{
            padding: '16px 32px',
            background: 'linear-gradient(135deg, #B8860B, #DAA520)',
            color: '#000',
            border: 'none',
            borderRadius: '28px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '1.1em'
          }}
        >
          🏪 View My Store
        </button>
        <button
          onClick={() => speak('Closing.', () => onClose())}
          style={{
            padding: '16px 32px',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: '28px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Done
        </button>
      </div>

      <AgenticBar
        context="Setup Complete"
        hints={['"view store" to see products', '"done" to close']}
        welcomeMessage={`Congratulations ${vendorName}! Your vendor account is now live on VistaView with ${stats?.totalProducts || 0} products. Say view store to see your products, or done to close.`}
        autoStart={true}
      />
    </div>
  );
};

export default VendorComplete;
EOF
echo "✅ VendorComplete.tsx created"

# ═══════════════════════════════════════════════════════════════════════════════
# APPLY: Update index exports
# ═══════════════════════════════════════════════════════════════════════════════
echo "[APPLY] Creating vendor index..."

cat > "$W/src/components/signin/vendor/index.ts" << 'EOF'
export { default as VendorPhone } from './VendorPhone';
export { default as VendorOTP } from './VendorOTP';
export { default as VendorProfile } from './VendorProfile';
export { default as VendorUpload } from './VendorUpload';
export { default as VendorAddress } from './VendorAddress';
export { default as VendorComplete } from './VendorComplete';
EOF
echo "✅ vendor/index.ts created"

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  PART 3 COMPLETE"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  Created:"
echo "    ✅ VendorUpload.tsx   - PDF Upload with AgenticBar"
echo "    ✅ VendorAddress.tsx  - Address entry with AgenticBar"
echo "    ✅ VendorComplete.tsx - Completion screen with AgenticBar"
echo "    ✅ vendor/index.ts    - Exports"
echo "  Backup: $BK"
echo "═══════════════════════════════════════════════════════════════════════════════"
