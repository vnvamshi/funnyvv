import React, { useState, useRef, useCallback } from 'react';

interface FileCategory {
  id: string;
  label: string;
  icon: string;
  accept: string;
  description: string;
}

interface UploadedFile {
  file: File;
  category: string;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
}

interface MultiFormatUploaderProps {
  onFilesUploaded?: (files: UploadedFile[]) => void;
  onAllComplete?: () => void;
  speak?: (text: string) => void;
  userType: 'vendor' | 'builder' | 'agent';
  accentColor?: string;
}

const FILE_CATEGORIES: Record<string, FileCategory[]> = {
  vendor: [
    { id: 'catalog', label: 'Product Catalog', icon: '📄', accept: '.pdf,.xlsx,.csv', description: 'PDF, Excel, CSV' },
    { id: 'images', label: 'Product Images', icon: '🖼️', accept: '.jpg,.jpeg,.png,.webp', description: 'JPG, PNG, WebP' },
    { id: 'specs', label: 'Specifications', icon: '📋', accept: '.pdf,.docx,.txt', description: 'PDF, Word, Text' },
    { id: 'cad', label: 'CAD/3D Files', icon: '📐', accept: '.dwg,.dxf,.glb,.gltf,.obj,.fbx', description: 'DWG, DXF, GLB, OBJ' },
    { id: 'video', label: 'Product Videos', icon: '🎬', accept: '.mp4,.mov,.webm', description: 'MP4, MOV, WebM' },
  ],
  builder: [
    { id: 'portfolio', label: 'Portfolio', icon: '🏗️', accept: '.pdf,.jpg,.jpeg,.png', description: 'PDF, Images' },
    { id: 'floorplans', label: 'Floor Plans', icon: '📐', accept: '.pdf,.dwg,.dxf', description: 'PDF, CAD files' },
    { id: 'renders', label: '3D Renders', icon: '🎨', accept: '.jpg,.jpeg,.png,.glb,.gltf', description: 'Images, 3D files' },
    { id: 'surveys', label: 'Surveys/Permits', icon: '📋', accept: '.pdf,.jpg,.png', description: 'PDF, Images' },
    { id: 'video', label: 'Project Videos', icon: '🎬', accept: '.mp4,.mov,.webm', description: 'MP4, MOV' },
  ],
  agent: [
    { id: 'listings', label: 'Property Listings', icon: '🏠', accept: '.pdf,.xlsx,.csv', description: 'PDF, Excel, CSV' },
    { id: 'photos', label: 'Property Photos', icon: '📸', accept: '.jpg,.jpeg,.png,.webp', description: 'JPG, PNG, WebP' },
    { id: 'floorplans', label: 'Floor Plans', icon: '📐', accept: '.pdf,.jpg,.png', description: 'PDF, Images' },
    { id: 'virtual', label: 'Virtual Tours', icon: '🎥', accept: '.mp4,.mov,.glb', description: 'Video, 3D' },
    { id: 'docs', label: 'Documents', icon: '📄', accept: '.pdf,.docx', description: 'PDF, Word' },
  ]
};

const MultiFormatUploader: React.FC<MultiFormatUploaderProps> = ({
  onFilesUploaded,
  onAllComplete,
  speak,
  userType,
  accentColor = '#10b981'
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const categories = FILE_CATEGORIES[userType] || FILE_CATEGORIES.vendor;

  const handleFileSelect = useCallback(async (categoryId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadedFile: UploadedFile = {
        file,
        category: categoryId,
        progress: 0,
        status: 'pending'
      };

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        uploadedFile.preview = URL.createObjectURL(file);
      }

      newFiles.push(uploadedFile);
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    speak?.(`Added ${files.length} file${files.length > 1 ? 's' : ''} to ${categoryId}`);

    // Auto-upload
    for (const uf of newFiles) {
      await uploadFile(uf);
    }
  }, [speak]);

  const uploadFile = async (uploadedFile: UploadedFile) => {
    setIsUploading(true);
    
    // Update status
    setUploadedFiles(prev => prev.map(f => 
      f.file === uploadedFile.file ? { ...f, status: 'uploading', progress: 10 } : f
    ));

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile.file);
      formData.append('category', uploadedFile.category);
      formData.append('userType', userType);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadedFiles(prev => prev.map(f => 
          f.file === uploadedFile.file && f.progress < 90 
            ? { ...f, progress: f.progress + 10 } 
            : f
        ));
      }, 200);

      const response = await fetch('http://localhost:1117/api/upload/file', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      if (response.ok) {
        const data = await response.json();
        setUploadedFiles(prev => prev.map(f => 
          f.file === uploadedFile.file 
            ? { ...f, status: 'success', progress: 100, url: data.url } 
            : f
        ));
        speak?.(`Uploaded ${uploadedFile.file.name} successfully`);
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadedFiles(prev => prev.map(f => 
        f.file === uploadedFile.file ? { ...f, status: 'error', progress: 0 } : f
      ));
      speak?.(`Failed to upload ${uploadedFile.file.name}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((categoryId: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    handleFileSelect(categoryId, e.dataTransfer.files);
  }, [handleFileSelect]);

  const removeFile = (file: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== file));
  };

  const getFilesForCategory = (categoryId: string) => {
    return uploadedFiles.filter(f => f.category === categoryId);
  };

  const allFilesUploaded = uploadedFiles.length > 0 && uploadedFiles.every(f => f.status === 'success');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: '2.5em' }}>📁</span>
        <h3 style={{ color: accentColor, margin: '10px 0 5px' }}>Upload Your Files</h3>
        <p style={{ color: '#888', fontSize: '0.9em' }}>
          Drag & drop or click to upload
        </p>
      </div>

      {/* Category Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12
      }}>
        {categories.map(cat => {
          const filesInCat = getFilesForCategory(cat.id);
          const isDragOver = dragOver === cat.id;
          
          return (
            <div
              key={cat.id}
              onClick={() => fileInputRefs.current[cat.id]?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(cat.id); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(cat.id, e)}
              style={{
                background: isDragOver ? `${accentColor}20` : 'rgba(0,0,0,0.3)',
                border: `2px dashed ${isDragOver ? accentColor : filesInCat.length > 0 ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
                borderRadius: 12,
                padding: 16,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                minHeight: 120
              }}
            >
              <input
                ref={el => fileInputRefs.current[cat.id] = el}
                type="file"
                accept={cat.accept}
                multiple
                onChange={(e) => handleFileSelect(cat.id, e.target.files)}
                style={{ display: 'none' }}
              />
              
              <div style={{ fontSize: 28, marginBottom: 8 }}>{cat.icon}</div>
              <div style={{ color: '#e2e8f0', fontSize: '0.9em', fontWeight: 600 }}>{cat.label}</div>
              <div style={{ color: '#64748b', fontSize: '0.75em', marginTop: 4 }}>{cat.description}</div>
              
              {filesInCat.length > 0 && (
                <div style={{
                  marginTop: 8,
                  padding: '4px 10px',
                  background: '#10b98130',
                  borderRadius: 10,
                  fontSize: '0.75em',
                  color: '#10b981'
                }}>
                  {filesInCat.length} file{filesInCat.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 12,
          padding: 16,
          maxHeight: 200,
          overflow: 'auto'
        }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85em', marginBottom: 10 }}>
            Uploaded Files ({uploadedFiles.length})
          </div>
          
          {uploadedFiles.map((uf, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 0',
              borderBottom: idx < uploadedFiles.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
            }}>
              {uf.preview ? (
                <img src={uf.preview} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: 6, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  📄
                </div>
              )}
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#e2e8f0', fontSize: '0.85em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {uf.file.name}
                </div>
                {uf.status === 'uploading' && (
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 4 }}>
                    <div style={{ width: `${uf.progress}%`, height: '100%', background: accentColor, borderRadius: 2, transition: 'width 0.2s' }} />
                  </div>
                )}
              </div>
              
              <div style={{
                fontSize: 16,
                color: uf.status === 'success' ? '#10b981' : uf.status === 'error' ? '#ef4444' : '#64748b'
              }}>
                {uf.status === 'success' ? '✓' : uf.status === 'error' ? '✕' : uf.status === 'uploading' ? '⏳' : '○'}
              </div>
              
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(uf.file); }}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Complete Button */}
      {uploadedFiles.length > 0 && (
        <button
          onClick={() => {
            onFilesUploaded?.(uploadedFiles);
            if (allFilesUploaded) {
              onAllComplete?.();
            }
          }}
          disabled={isUploading}
          style={{
            padding: '14px 40px',
            background: allFilesUploaded ? accentColor : 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: 30,
            color: allFilesUploaded ? '#000' : '#888',
            fontWeight: 600,
            cursor: isUploading ? 'wait' : 'pointer',
            alignSelf: 'center'
          }}
        >
          {isUploading ? 'Uploading...' : allFilesUploaded ? 'Continue →' : 'Finish Uploading'}
        </button>
      )}

      {/* Skip option */}
      <button
        onClick={onAllComplete}
        style={{
          padding: '10px 20px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 20,
          color: '#64748b',
          cursor: 'pointer',
          alignSelf: 'center',
          fontSize: '0.85em'
        }}
      >
        Skip for now →
      </button>
    </div>
  );
};

export default MultiFormatUploader;
