/**
 * UniversalUploader - Handles ALL file formats
 * 
 * Supports: PDF, CSV, Excel, Images, Documents, JSON, XML, etc.
 * 
 * Features:
 * - Drag & drop
 * - Multiple files
 * - Progress tracking
 * - File preview
 * - Voice commands ("upload", "select file")
 */

import React, { useState, useRef, useCallback } from 'react';
import { useAgentic } from './useAgentic';

interface FileResult {
  file: File;
  success: boolean;
  data?: any;
  error?: string;
  preview?: string;
}

interface UniversalUploaderProps {
  // File types
  accept?: string[];  // ['pdf', 'csv', 'xlsx', 'jpg', 'png', 'docx', 'json', 'xml']
  maxSize?: number;   // MB
  multiple?: boolean;
  
  // Callbacks
  onUpload?: (results: FileResult[]) => void;
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
  
  // Voice
  enableVoice?: boolean;
  voiceContext?: string;
  speak?: (text: string) => void;
  
  // Appearance
  variant?: 'dropzone' | 'button' | 'minimal';
  theme?: 'dark' | 'light' | 'teal';
  showPreview?: boolean;
  
  // Custom render
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const FILE_TYPES: Record<string, { mime: string; icon: string; color: string }> = {
  pdf: { mime: 'application/pdf', icon: '📄', color: '#ef4444' },
  csv: { mime: 'text/csv', icon: '📊', color: '#22c55e' },
  xlsx: { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', icon: '📗', color: '#16a34a' },
  xls: { mime: 'application/vnd.ms-excel', icon: '📗', color: '#16a34a' },
  jpg: { mime: 'image/jpeg', icon: '🖼️', color: '#f59e0b' },
  jpeg: { mime: 'image/jpeg', icon: '🖼️', color: '#f59e0b' },
  png: { mime: 'image/png', icon: '🖼️', color: '#8b5cf6' },
  gif: { mime: 'image/gif', icon: '🖼️', color: '#ec4899' },
  webp: { mime: 'image/webp', icon: '🖼️', color: '#06b6d4' },
  docx: { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', icon: '📝', color: '#2563eb' },
  doc: { mime: 'application/msword', icon: '📝', color: '#2563eb' },
  json: { mime: 'application/json', icon: '📋', color: '#f97316' },
  xml: { mime: 'application/xml', icon: '📋', color: '#a855f7' },
  txt: { mime: 'text/plain', icon: '📄', color: '#64748b' },
  zip: { mime: 'application/zip', icon: '📦', color: '#eab308' }
};

const THEMES = {
  dark: { bg: 'rgba(15, 23, 42, 0.9)', border: 'rgba(255,255,255,0.1)', text: '#e2e8f0' },
  light: { bg: 'rgba(255, 255, 255, 0.9)', border: 'rgba(0,0,0,0.1)', text: '#1e293b' },
  teal: { bg: 'rgba(0, 66, 54, 0.9)', border: 'rgba(184, 134, 11, 0.4)', text: '#e2e8f0' }
};

export const UniversalUploader: React.FC<UniversalUploaderProps> = ({
  accept = ['pdf', 'csv', 'xlsx', 'jpg', 'png', 'docx'],
  maxSize = 50,
  multiple = true,
  onUpload,
  onProgress,
  onError,
  enableVoice = true,
  voiceContext = 'upload',
  speak,
  variant = 'dropzone',
  theme = 'teal',
  showPreview = true,
  children,
  className = '',
  style = {}
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<FileResult[]>([]);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colors = THEMES[theme];
  
  // Build accept string
  const acceptString = accept.map(ext => FILE_TYPES[ext]?.mime || `.${ext}`).join(',');
  
  // Voice control
  const agentic = useAgentic({
    context: voiceContext,
    onCommand: (cmd, intent) => {
      const lower = cmd.toLowerCase();
      if (lower.includes('upload') || lower.includes('select') || lower.includes('file') || lower.includes('choose')) {
        fileInputRef.current?.click();
      }
      if (lower.includes('clear') || lower.includes('remove')) {
        clearFiles();
      }
    }
  });
  
  const speakFn = speak || agentic.speak;
  
  // Validate file
  const validateFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!accept.includes(ext) && !accept.includes('*')) {
      return `File type .${ext} not allowed`;
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `File too large (max ${maxSize}MB)`;
    }
    return null;
  };
  
  // Handle files
  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList);
    const validFiles: File[] = [];
    
    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        onError?.(error);
        speakFn?.(`Cannot upload ${file.name}. ${error}`);
      } else {
        validFiles.push(file);
      }
    }
    
    if (validFiles.length === 0) return;
    
    setFiles(prev => multiple ? [...prev, ...validFiles] : validFiles);
    speakFn?.(`Selected ${validFiles.length} file${validFiles.length > 1 ? 's' : ''}`);
    
    // Auto-upload
    await uploadFiles(validFiles);
  }, [accept, maxSize, multiple, onError, speakFn]);
  
  // Upload files to backend
  const uploadFiles = async (filesToUpload: File[]) => {
    setUploading(true);
    setProgress(0);
    
    const uploadResults: FileResult[] = [];
    const totalFiles = filesToUpload.length;
    
    for (let i = 0; i < totalFiles; i++) {
      const file = filesToUpload[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', ext);
        
        // Determine endpoint based on file type
        let endpoint = 'http://localhost:1117/api/upload/file';
        if (['pdf'].includes(ext)) endpoint = 'http://localhost:1117/api/upload/pdf';
        else if (['csv', 'xlsx', 'xls'].includes(ext)) endpoint = 'http://localhost:1117/api/upload/spreadsheet';
        else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) endpoint = 'http://localhost:1117/api/upload/image';
        else if (['docx', 'doc'].includes(ext)) endpoint = 'http://localhost:1117/api/upload/document';
        
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        uploadResults.push({
          file,
          success: response.ok && (data.success !== false),
          data,
          preview: ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) 
            ? URL.createObjectURL(file) 
            : undefined
        });
        
      } catch (err: any) {
        uploadResults.push({
          file,
          success: false,
          error: err.message || 'Upload failed'
        });
      }
      
      const newProgress = Math.round(((i + 1) / totalFiles) * 100);
      setProgress(newProgress);
      onProgress?.(newProgress);
    }
    
    setResults(uploadResults);
    setUploading(false);
    onUpload?.(uploadResults);
    
    const successCount = uploadResults.filter(r => r.success).length;
    speakFn?.(`Uploaded ${successCount} of ${totalFiles} files successfully`);
  };
  
  // Clear files
  const clearFiles = () => {
    setFiles([]);
    setResults([]);
    setProgress(0);
  };
  
  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  // Get file icon
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return FILE_TYPES[ext]?.icon || '📄';
  };
  
  const getFileColor = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return FILE_TYPES[ext]?.color || '#64748b';
  };
  
  if (variant === 'button') {
    return (
      <div className={className} style={style}>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptString}
          multiple={multiple}
          onChange={e => e.target.files && handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)',
            border: 'none',
            borderRadius: 25,
            color: 'white',
            fontWeight: 600,
            cursor: uploading ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          {uploading ? '⏳' : '📁'} {uploading ? `Uploading ${progress}%` : 'Select Files'}
        </button>
      </div>
    );
  }
  
  if (variant === 'minimal') {
    return (
      <div className={className} style={style}>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptString}
          multiple={multiple}
          onChange={e => e.target.files && handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
        <span 
          onClick={() => fileInputRef.current?.click()}
          style={{ color: '#06b6d4', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {uploading ? `Uploading ${progress}%...` : 'Click to upload'}
        </span>
      </div>
    );
  }
  
  return (
    <div className={className} style={style}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptString}
        multiple={multiple}
        onChange={e => e.target.files && handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />
      
      {/* Dropzone */}
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragActive ? '#06b6d4' : colors.border}`,
          borderRadius: 16,
          padding: 40,
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          background: dragActive ? 'rgba(6, 182, 212, 0.1)' : colors.bg,
          transition: 'all 0.3s'
        }}
      >
        {children || (
          <>
            {uploading ? (
              <>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📤</div>
                <p style={{ color: colors.text, fontSize: 16, margin: '0 0 12px' }}>
                  Uploading... {progress}%
                </p>
                <div style={{
                  height: 8, background: 'rgba(0,0,0,0.3)', borderRadius: 4,
                  overflow: 'hidden', maxWidth: 300, margin: '0 auto'
                }}>
                  <div style={{
                    width: `${progress}%`, height: '100%',
                    background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 48, marginBottom: 16 }}>
                  {dragActive ? '📥' : '📁'}
                </div>
                <p style={{ color: colors.text, fontSize: 16, margin: '0 0 8px' }}>
                  {dragActive ? 'Drop files here' : 'Click or drag files to upload'}
                </p>
                <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
                  Supports: {accept.join(', ').toUpperCase()} (max {maxSize}MB)
                </p>
              </>
            )}
          </>
        )}
      </div>
      
      {/* File list */}
      {results.length > 0 && showPreview && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ color: colors.text, fontSize: 14, fontWeight: 500 }}>
              {results.length} file{results.length > 1 ? 's' : ''} uploaded
            </span>
            <button
              onClick={clearFiles}
              style={{
                background: 'transparent', border: 'none',
                color: '#ef4444', cursor: 'pointer', fontSize: 13
              }}
            >
              Clear all
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {results.map((result, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', background: 'rgba(0,0,0,0.2)',
                  borderRadius: 10, border: `1px solid ${result.success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}
              >
                {result.preview ? (
                  <img src={result.preview} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 24 }}>{getFileIcon(result.file.name)}</span>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ color: colors.text, margin: 0, fontSize: 13 }}>{result.file.name}</p>
                  <p style={{ color: '#64748b', margin: '2px 0 0', fontSize: 11 }}>
                    {(result.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <span style={{ fontSize: 18 }}>{result.success ? '✅' : '❌'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Voice hint */}
      {enableVoice && (
        <p style={{ color: '#64748b', fontSize: 11, textAlign: 'center', marginTop: 12 }}>
          💡 Say "upload" or "select file" to choose files
        </p>
      )}
    </div>
  );
};

export default UniversalUploader;
