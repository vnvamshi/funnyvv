import React, { useRef } from 'react';

interface Props {
  onFileSelected: (file: File) => void;
  speak: (text: string) => void;
}

const VendorUpload: React.FC<Props> = ({ onFileSelected, speak }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      speak(`Got it! Processing ${file.name}. Starting the 5-step pipeline now.`);
      setTimeout(() => onFileSelected(file), 1500);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '4em' }}>📤</span>
      <h3 style={{ color: '#B8860B', marginTop: '16px' }}>Upload Your Catalog</h3>
      <p style={{ color: '#888', marginBottom: '24px' }}>PDF, Excel, or CSV supported</p>

      <input ref={fileRef} type="file" accept=".pdf,.xlsx,.xls,.csv" onChange={handleFile} style={{ display: 'none' }} />
      
      <div onClick={() => fileRef.current?.click()} style={{ border: '3px dashed #B8860B', borderRadius: '16px', padding: '50px', cursor: 'pointer', background: 'rgba(184,134,11,0.05)' }}>
        <span style={{ fontSize: '3em' }}>📁</span>
        <p style={{ color: '#F5EC9B', marginTop: '16px' }}>Click to browse or drag file here</p>
      </div>
    </div>
  );
};

export default VendorUpload;
