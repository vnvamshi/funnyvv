// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - VENDOR UPLOAD v2.0
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useCallback } from 'react';

interface VendorUploadProps {
  onFileSelected: (file: File) => void;
  speak: (text: string) => void;
}

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B' };

const VendorUpload: React.FC<VendorUploadProps> = ({ onFileSelected, speak }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const processFile = (file: File) => {
    const validExts = ['.pdf', '.xlsx', '.xls', '.csv'];
    const isValid = validExts.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!isValid) {
      speak("Sorry, I only accept PDF, Excel, or CSV files.");
      return;
    }
    setSelectedFile(file);
    speak(`Got ${file.name}. Click Process to start.`);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '4em' }}>📤</span>
      <h3 style={{ color: THEME.gold, marginTop: '16px' }}>Upload Your Catalog</h3>
      <p style={{ color: '#888', marginBottom: '24px' }}>PDF, Excel, or CSV supported</p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.xlsx,.xls,.csv"
        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
        style={{ display: 'none' }}
      />

      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `3px dashed ${isDragging ? THEME.gold : 'rgba(184,134,11,0.5)'}`,
            borderRadius: '20px',
            padding: '50px',
            cursor: 'pointer',
            background: isDragging ? 'rgba(184,134,11,0.1)' : 'rgba(0,0,0,0.2)',
            maxWidth: '450px',
            margin: '0 auto'
          }}
        >
          <span style={{ fontSize: '3em' }}>📁</span>
          <p style={{ color: THEME.goldLight, marginTop: '16px' }}>
            {isDragging ? 'Drop here!' : 'Click or drag & drop'}
          </p>
        </div>
      ) : (
        <div style={{
          background: 'rgba(184,134,11,0.1)',
          border: `2px solid ${THEME.gold}`,
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '450px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <span style={{ fontSize: '2.5em' }}>📄</span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ color: '#fff', margin: 0, fontWeight: 500 }}>{selectedFile.name}</p>
              <p style={{ color: '#888', margin: '4px 0 0', fontSize: '0.85em' }}>{formatSize(selectedFile.size)}</p>
            </div>
            <button onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2em' }}>✕</button>
          </div>
          <button
            onClick={() => onFileSelected(selectedFile)}
            style={{ padding: '14px 40px', background: THEME.gold, color: '#000', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600 }}
          >
            🚀 Process Catalog
          </button>
        </div>
      )}
    </div>
  );
};

export default VendorUpload;
