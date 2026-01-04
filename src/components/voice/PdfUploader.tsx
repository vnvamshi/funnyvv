/**
 * PdfUploader - Handles PDF upload to backend
 */

import React, { useState, useCallback } from 'react';

interface PdfUploaderProps {
    onSuccess?: (data: any) => void;
    onError?: (error: string) => void;
    children?: React.ReactNode;
}

export function PdfUploader({ onSuccess, onError, children }: PdfUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    
    const handleUpload = useCallback(async (file: File) => {
        if (!file) return;
        
        setUploading(true);
        setProgress(10);
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            setProgress(30);
            
            const response = await fetch('http://localhost:1117/api/upload/pdf', {
                method: 'POST',
                body: formData
            });
            
            setProgress(70);
            
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }
            
            const data = await response.json();
            setProgress(100);
            
            console.log('[PdfUploader] Success:', data);
            onSuccess?.(data);
            
        } catch (err: any) {
            console.error('[PdfUploader] Error:', err);
            onError?.(err.message || 'Upload failed');
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    }, [onSuccess, onError]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
    };
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleUpload(file);
    };
    
    return (
        <div 
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            style={{ position: 'relative' }}
        >
            <input
                type="file"
                accept=".pdf"
                onChange={handleChange}
                style={{ display: 'none' }}
                id="pdf-upload-input"
            />
            <label htmlFor="pdf-upload-input" style={{ cursor: 'pointer', display: 'block' }}>
                {children || (
                    <div style={{
                        border: '2px dashed #4a5568',
                        borderRadius: '12px',
                        padding: '40px',
                        textAlign: 'center',
                        background: uploading ? 'rgba(6, 182, 212, 0.1)' : 'transparent'
                    }}>
                        {uploading ? (
                            <>
                                <div style={{ fontSize: '24px', marginBottom: '10px' }}>📤</div>
                                <div>Uploading... {progress}%</div>
                                <div style={{
                                    height: '4px',
                                    background: '#1a202c',
                                    borderRadius: '2px',
                                    marginTop: '10px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${progress}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)',
                                        transition: 'width 0.3s'
                                    }} />
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📄</div>
                                <div>Click or drag PDF to upload</div>
                            </>
                        )}
                    </div>
                )}
            </label>
        </div>
    );
}

export default PdfUploader;
