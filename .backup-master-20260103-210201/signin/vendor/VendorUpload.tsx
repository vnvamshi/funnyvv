import React, { useState, useRef } from 'react';
const THEME = { gold: '#B8860B', goldLight: '#F5EC9B' };
interface Props { onFileSelected: (f: File) => void; speak: (t: string) => void; }
const VendorUpload: React.FC<Props> = ({ onFileSelected, speak }) => {
  const [file, setFile] = useState<File | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const handle = (f: File) => { if (!['.pdf','.xlsx','.csv'].some(e => f.name.toLowerCase().endsWith(e))) { speak("Use PDF, Excel, or CSV."); return; } setFile(f); speak(`Got ${f.name}. Click Process.`); };
  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '4em' }}>📤</span>
      <h3 style={{ color: THEME.gold, marginTop: '16px' }}>Upload Catalog</h3>
      <input ref={ref} type="file" accept=".pdf,.xlsx,.csv" onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])} style={{ display: 'none' }} />
      {!file ? (
        <div onClick={() => ref.current?.click()} style={{ border: `3px dashed ${THEME.gold}50`, borderRadius: '20px', padding: '50px', cursor: 'pointer', marginTop: '20px' }}>
          <span style={{ fontSize: '3em' }}>📁</span>
          <p style={{ color: THEME.goldLight }}>Click to upload</p>
        </div>
      ) : (
        <div style={{ background: 'rgba(184,134,11,0.1)', border: `2px solid ${THEME.gold}`, borderRadius: '16px', padding: '24px', marginTop: '20px' }}>
          <p style={{ color: '#fff' }}>📄 {file.name}</p>
          <button onClick={() => onFileSelected(file)} style={{ padding: '14px 40px', background: THEME.gold, color: '#000', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600, marginTop: '16px' }}>🚀 Process</button>
        </div>
      )}
    </div>
  );
};
export default VendorUpload;
