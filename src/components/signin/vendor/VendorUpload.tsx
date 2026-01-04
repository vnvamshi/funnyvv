import React, { useState, useRef } from 'react';
import UnifiedAgenticBar from '../common/UnifiedAgenticBar';

interface Props {
  onFileSelect: (file: File) => void;
  onProductsExtracted: (products: any[]) => void;
  speak: (t: string) => void;
}

const THEME = { teal: '#004236', gold: '#B8860B' };

const VendorUpload: React.FC<Props> = ({ onFileSelect, onProductsExtracted, speak }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState('');
  const [productCount, setProductCount] = useState(0);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setStatus('error');
      setError('Please upload a PDF file');
      speak("Please upload a PDF file.");
      return;
    }

    setUploading(true);
    setStatus('uploading');
    setProgress(20);
    setFileName(file.name);
    setError('');
    
    speak(`Uploading ${file.name}`);
    onFileSelect(file);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setProgress(50);
      
      const res = await fetch('http://localhost:1117/api/upload/pdf', {
        method: 'POST',
        body: formData
      });

      setProgress(80);
      const data = await res.json();
      setProgress(100);

      if (data.success || data.products) {
        setStatus('success');
        const products = data.products || [];
        setProductCount(products.length);
        onProductsExtracted(products);
        speak(`Upload complete! Found ${products.length} products.`);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
      speak("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCommand = (cmd: string) => {
    const lower = cmd.toLowerCase();
    if (lower.includes('upload') || lower.includes('select') || lower.includes('file')) {
      fileRef.current?.click();
    }
    if (lower.includes('retry') || lower.includes('again')) {
      setStatus('idle');
      setProgress(0);
    }
    if (lower.includes('next') || lower.includes('continue')) {
      if (status === 'success') {
        speak("Moving to next step.");
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '2.5em' }}>📄</span>
        <h3 style={{ color: THEME.gold, margin: '10px 0 5px' }}>Upload Your Catalog</h3>
        <p style={{ color: '#888', fontSize: '0.9em' }}>Upload a PDF catalog to create product listings</p>
      </div>

      <div
        onClick={() => status !== 'uploading' && fileRef.current?.click()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleUpload(f); }}
        onDragOver={e => e.preventDefault()}
        style={{
          border: `2px dashed ${status === 'error' ? '#ef4444' : status === 'success' ? '#10b981' : THEME.gold}40`,
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          background: uploading ? 'rgba(6, 182, 212, 0.1)' : 'rgba(0,0,0,0.2)'
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
          style={{ display: 'none' }}
        />

        {status === 'idle' && (
          <>
            <div style={{ fontSize: '3em', marginBottom: '15px' }}>📁</div>
            <p style={{ color: '#fff', margin: '0 0 8px' }}>Click or drag PDF to upload</p>
            <p style={{ color: '#888', fontSize: '0.85em', margin: 0 }}>Supports up to 50MB</p>
          </>
        )}

        {status === 'uploading' && (
          <>
            <div style={{ fontSize: '2.5em', marginBottom: '15px' }}>📤</div>
            <p style={{ color: '#06b6d4', margin: '0 0 15px' }}>Uploading {fileName}...</p>
            <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden', maxWidth: '300px', margin: '0 auto' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)', transition: 'width 0.3s' }} />
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '2.5em', marginBottom: '15px' }}>✅</div>
            <p style={{ color: '#10b981', margin: '0 0 8px' }}>Upload successful!</p>
            <p style={{ color: '#06b6d4' }}>Found {productCount} products</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '2.5em', marginBottom: '15px' }}>❌</div>
            <p style={{ color: '#ef4444', margin: 0 }}>{error || 'Upload failed'}</p>
          </>
        )}
      </div>

      {status === 'error' && (
        <button
          onClick={() => { setStatus('idle'); setProgress(0); }}
          style={{
            padding: '12px 24px',
            background: THEME.gold,
            border: 'none',
            borderRadius: '25px',
            color: '#000',
            fontWeight: 600,
            cursor: 'pointer',
            alignSelf: 'center'
          }}
        >
          Try Again
        </button>
      )}

      {/* UNIFIED AGENTIC BAR */}
      <UnifiedAgenticBar
        context="Catalog Upload"
        onCommand={handleCommand}
        speak={speak}
        hints='Say "upload" to select file • "next" when done'
      />
    </div>
  );
};

export default VendorUpload;
