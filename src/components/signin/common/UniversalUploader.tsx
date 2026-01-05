import React, { useState, useRef } from 'react';

interface Props {
  accept?: string[];
  onUpload: (results: any[]) => void;
  speak?: (t: string) => void;
  title?: string;
  description?: string;
  accentColor?: string;
}

const FILE_ICONS: Record<string, string> = {
  pdf: '📄', csv: '📊', xlsx: '📗', xls: '📗',
  jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️',
  docx: '📝', doc: '📝', json: '📋', xml: '📋', txt: '📄'
};

const UniversalUploader: React.FC<Props> = ({
  accept = ['pdf', 'csv', 'xlsx', 'jpg', 'png', 'docx'],
  onUpload,
  speak,
  title = 'Upload Files',
  description = 'Drag & drop or click to upload',
  accentColor = '#B8860B'
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptString = accept.map(ext => `.${ext}`).join(',');

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploading(true);
    setProgress(0);
    speak?.(`Uploading ${fileArray.length} file${fileArray.length > 1 ? 's' : ''}`);

    const uploadResults: any[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', ext);

        const response = await fetch('http://localhost:1117/api/upload/file', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        uploadResults.push({
          file,
          success: response.ok,
          data,
          preview: ['jpg', 'jpeg', 'png', 'gif'].includes(ext) ? URL.createObjectURL(file) : undefined
        });
      } catch (err: any) {
        uploadResults.push({ file, success: false, error: err.message });
      }

      setProgress(Math.round(((i + 1) / fileArray.length) * 100));
    }

    setResults(uploadResults);
    setUploading(false);
    onUpload(uploadResults);

    const successCount = uploadResults.filter(r => r.success).length;
    speak?.(`Uploaded ${successCount} of ${fileArray.length} files`);
  };

  const getIcon = (name: string) => FILE_ICONS[name.split('.').pop()?.toLowerCase() || ''] || '📄';

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptString}
        multiple
        onChange={e => e.target.files && handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />

      <div
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragActive ? accentColor : 'rgba(255,255,255,0.2)'}`,
          borderRadius: 16,
          padding: '40px 20px',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          background: dragActive ? `${accentColor}20` : 'rgba(0,0,0,0.2)',
          transition: 'all 0.3s'
        }}
      >
        {uploading ? (
          <>
            <div style={{ fontSize: '2.5em', marginBottom: 15 }}>📤</div>
            <p style={{ color: '#06b6d4', margin: '0 0 15px' }}>Uploading... {progress}%</p>
            <div style={{ height: 8, background: 'rgba(0,0,0,0.3)', borderRadius: 4, maxWidth: 300, margin: '0 auto' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg, ${accentColor}, #06b6d4)`, borderRadius: 4 }} />
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '3em', marginBottom: 15 }}>{dragActive ? '📥' : '📁'}</div>
            <p style={{ color: '#e2e8f0', fontSize: '1.1em', margin: '0 0 8px' }}>{title}</p>
            <p style={{ color: '#64748b', fontSize: '0.85em', margin: 0 }}>{description}</p>
            <p style={{ color: '#64748b', fontSize: '0.75em', marginTop: 10 }}>
              Supports: {accept.map(e => e.toUpperCase()).join(', ')}
            </p>
          </>
        )}
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ color: '#e2e8f0', fontSize: 14 }}>{results.length} files</span>
            <button onClick={() => setResults([])} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Clear</button>
          </div>
          {results.map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', background: 'rgba(0,0,0,0.2)',
              borderRadius: 10, marginBottom: 8,
              border: `1px solid ${r.success ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
            }}>
              {r.preview ? (
                <img src={r.preview} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 24 }}>{getIcon(r.file.name)}</span>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ color: '#e2e8f0', margin: 0, fontSize: 13 }}>{r.file.name}</p>
                <p style={{ color: '#64748b', margin: 0, fontSize: 11 }}>{(r.file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <span>{r.success ? '✅' : '❌'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UniversalUploader;
