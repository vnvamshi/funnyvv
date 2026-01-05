#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
#  COMPLETE UNIFIED FIX - EVERYTHING WORKING
#  
#  FIXES:
#  1. VendorFlow broken import
#  2. Universal AgenticBar that ACTUALLY listens
#  3. Auto-fill that ACTUALLY works
#  4. Upload with multiple formats (PDF, CSV, CAD, GLB, MOV, etc.)
#  5. MinIO integration
#  6. Backend processing
#═══════════════════════════════════════════════════════════════════════════════

VV="$HOME/vistaview_WORKING"
SIGNIN_DIR="$VV/src/components/signin"
COMMON_DIR="$SIGNIN_DIR/common"
VENDOR_DIR="$SIGNIN_DIR/vendor"
BUILDER_DIR="$SIGNIN_DIR/builder"
AGENT_DIR="$SIGNIN_DIR/agent"

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  🔧 COMPLETE UNIFIED FIX - EVERYTHING"
echo "═══════════════════════════════════════════════════════════════════════════════"

mkdir -p "$COMMON_DIR"
mkdir -p "$VENDOR_DIR"
mkdir -p "$BUILDER_DIR"
mkdir -p "$AGENT_DIR"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 1: Create UNIVERSAL AgenticBar that ACTUALLY WORKS
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "🎤 Creating Universal AgenticBar..."

cat > "$COMMON_DIR/UniversalAgenticBar.tsx" << 'UNIVERSALAGENTICBAR'
import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';

export interface AgenticBarRef {
  speak: (text: string) => void;
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
}

interface UniversalAgenticBarProps {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onCommand?: (command: string) => void;
  welcomeMessage?: string;
  hints?: string[];
  autoStart?: boolean;
  showWaveform?: boolean;
  accentColor?: string;
  context?: string;
}

const UniversalAgenticBar = forwardRef<AgenticBarRef, UniversalAgenticBarProps>(({
  onTranscript,
  onCommand,
  welcomeMessage,
  hints = [],
  autoStart = true,
  showWaveform = true,
  accentColor = '#10b981',
  context = ''
}, ref) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastHeard, setLastHeard] = useState('');
  const [status, setStatus] = useState<'ready' | 'listening' | 'processing' | 'speaking'>('ready');
  const [errorMsg, setErrorMsg] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isInitializedRef = useRef(false);
  const shouldRestartRef = useRef(false);

  // Initialize speech synthesis and recognition
  useEffect(() => {
    if (typeof window === 'undefined' || isInitializedRef.current) return;
    
    synthRef.current = window.speechSynthesis;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setErrorMsg('Speech recognition not supported');
      console.error('Speech recognition not supported in this browser');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('🎤 Recognition started');
        setIsListening(true);
        setStatus('listening');
        setErrorMsg('');
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);
        
        if (finalTranscript) {
          console.log('✓ Final transcript:', finalTranscript);
          setLastHeard(finalTranscript);
          onTranscript?.(finalTranscript, true);
          onCommand?.(finalTranscript);
        } else if (interimTranscript) {
          onTranscript?.(interimTranscript, false);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access denied. Please allow microphone access.');
        } else if (event.error === 'no-speech') {
          // This is normal, just restart
          if (shouldRestartRef.current) {
            setTimeout(() => {
              try { recognition.start(); } catch (e) {}
            }, 100);
          }
        } else {
          setErrorMsg(`Error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        console.log('🎤 Recognition ended');
        setIsListening(false);
        setStatus('ready');
        
        // Auto-restart if should be listening
        if (shouldRestartRef.current) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              console.log('Could not restart recognition');
            }
          }, 100);
        }
      };

      recognitionRef.current = recognition;
      isInitializedRef.current = true;

      // Welcome message and auto-start
      if (welcomeMessage) {
        setTimeout(() => speak(welcomeMessage), 500);
      }
      
      if (autoStart) {
        setTimeout(() => startListening(), welcomeMessage ? 2000 : 500);
      }

    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setErrorMsg('Failed to initialize speech recognition');
    }

    return () => {
      shouldRestartRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    
    // Stop listening while speaking
    shouldRestartRef.current = false;
    recognitionRef.current?.stop();
    
    synthRef.current.cancel();
    setStatus('speaking');
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onend = () => {
      setStatus('ready');
      // Resume listening after speaking
      if (autoStart) {
        setTimeout(() => startListening(), 300);
      }
    };
    
    utterance.onerror = () => {
      setStatus('ready');
    };
    
    synthRef.current.speak(utterance);
  }, [autoStart]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setErrorMsg('Speech recognition not available');
      return;
    }
    
    try {
      shouldRestartRef.current = true;
      recognitionRef.current.start();
      console.log('🎤 Starting recognition...');
    } catch (err: any) {
      if (err.message?.includes('already started')) {
        console.log('Recognition already running');
        setIsListening(true);
      } else {
        console.error('Failed to start recognition:', err);
        setErrorMsg('Failed to start listening');
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
    setStatus('ready');
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    speak,
    startListening,
    stopListening,
    isListening
  }), [speak, startListening, stopListening, isListening]);

  return (
    <div style={{
      marginTop: 16,
      padding: 16,
      background: 'rgba(0,0,0,0.4)',
      borderRadius: 16,
      border: `2px solid ${isListening ? accentColor : 'rgba(255,255,255,0.1)'}`,
      transition: 'all 0.3s'
    }}>
      {/* Status Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: isListening ? accentColor : status === 'speaking' ? '#f59e0b' : '#64748b',
          boxShadow: isListening ? `0 0 10px ${accentColor}` : 'none',
          animation: isListening ? 'pulse 1s infinite' : 'none'
        }} />
        <span style={{ color: accentColor, fontSize: '0.9em', fontWeight: 600 }}>
          🎤 {status === 'listening' ? 'LISTENING' : status === 'speaking' ? 'SPEAKING' : 'READY'}
        </span>
        {context && (
          <span style={{
            marginLeft: 'auto',
            fontSize: '0.75em',
            padding: '2px 8px',
            borderRadius: 10,
            background: `${accentColor}20`,
            color: accentColor
          }}>
            {context}
          </span>
        )}
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.2)',
          borderRadius: 8,
          padding: '8px 12px',
          marginBottom: 10,
          color: '#ef4444',
          fontSize: '0.85em'
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Waveform */}
      {showWaveform && isListening && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 3,
          height: 30,
          alignItems: 'center',
          marginBottom: 12
        }}>
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              style={{
                width: 3,
                background: `linear-gradient(to top, ${accentColor}, #06b6d4)`,
                borderRadius: 2,
                animation: `wave 0.4s ease-in-out ${i * 0.05}s infinite alternate`,
                height: 8
              }}
            />
          ))}
        </div>
      )}

      {/* Transcript Display */}
      {(transcript || lastHeard) && (
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ color: accentColor, fontSize: '0.75em', fontWeight: 600 }}>✓ HEARD</span>
            {transcript && transcript !== lastHeard && (
              <span style={{ color: '#64748b', fontSize: '0.7em' }}>(processing...)</span>
            )}
          </div>
          <p style={{
            color: '#e2e8f0',
            margin: 0,
            fontSize: '1em',
            lineHeight: 1.4
          }}>
            "{transcript || lastHeard}"
          </p>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
        <button
          onClick={toggleListening}
          style={{
            padding: '12px 28px',
            borderRadius: 25,
            border: 'none',
            background: isListening ? '#ef4444' : accentColor,
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95em',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s',
            boxShadow: `0 4px 15px ${isListening ? 'rgba(239, 68, 68, 0.3)' : `${accentColor}40`}`
          }}
        >
          {isListening ? '⏹️ Stop' : '🎤 Listen'}
        </button>
        
        <button
          onClick={() => speak(hints.length > 0 ? `Try saying: ${hints[0]}` : 'How can I help you?')}
          style={{
            padding: '12px 28px',
            borderRadius: 25,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent',
            color: '#e2e8f0',
            cursor: 'pointer',
            fontSize: '0.95em',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          🔊 Help
        </button>
      </div>

      {/* Hints */}
      {hints.length > 0 && (
        <p style={{
          color: '#64748b',
          fontSize: '0.8em',
          textAlign: 'center',
          margin: '14px 0 0',
          lineHeight: 1.5
        }}>
          💡 {hints.map((h, i) => `"${h}"`).join(' • ')}
        </p>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes wave {
          from { height: 6px; }
          to { height: 24px; }
        }
      `}</style>
    </div>
  );
});

UniversalAgenticBar.displayName = 'UniversalAgenticBar';

export default UniversalAgenticBar;
UNIVERSALAGENTICBAR

echo "  ✅ UniversalAgenticBar.tsx"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 2: Create Universal Multi-Format Uploader
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "📁 Creating Universal Multi-Format Uploader..."

cat > "$COMMON_DIR/MultiFormatUploader.tsx" << 'MULTIFORMATUPLOADER'
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
MULTIFORMATUPLOADER

echo "  ✅ MultiFormatUploader.tsx"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 3: Update common/index.ts
#═══════════════════════════════════════════════════════════════════════════════
cat > "$COMMON_DIR/index.ts" << 'COMMONINDEX'
export { default as UniversalAgenticBar } from './UniversalAgenticBar';
export type { AgenticBarRef } from './UniversalAgenticBar';
export { default as MultiFormatUploader } from './MultiFormatUploader';
export { default as WalkingCursor } from './WalkingCursor';
COMMONINDEX

echo "  ✅ common/index.ts"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 4: Fix VendorFlow with working AgenticBar
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "📦 Fixing VendorFlow..."

cat > "$VENDOR_DIR/VendorFlow.tsx" << 'VENDORFLOW'
import React, { useState, useCallback, useRef, useEffect } from 'react';
import UniversalAgenticBar, { AgenticBarRef } from '../common/UniversalAgenticBar';
import MultiFormatUploader from '../common/MultiFormatUploader';

interface Props {
  onClose: () => void;
  onBack: () => void;
}

type Step = 'phone' | 'otp' | 'profile' | 'upload' | 'complete';
const STEPS: Step[] = ['phone', 'otp', 'profile', 'upload', 'complete'];
const LABELS = ['Phone', 'Verify', 'Profile', 'Catalog', 'Done'];
const THEME = { primary: '#004236', secondary: '#001a15', accent: '#B8860B' };

const VendorFlow: React.FC<Props> = ({ onClose, onBack }) => {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [isBeautifying, setIsBeautifying] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  
  const agenticBarRef = useRef<AgenticBarRef>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const companyInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const speak = useCallback((text: string) => {
    agenticBarRef.current?.speak(text);
  }, []);

  const goNext = () => {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) {
      setStep(STEPS[i + 1]);
    }
  };

  const goBack = () => {
    const i = STEPS.indexOf(step);
    if (i > 0) {
      setStep(STEPS[i - 1]);
    } else {
      onBack();
    }
  };

  // Auto-fill with typewriter effect
  const typeIntoField = async (ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement>, value: string, setter: (v: string) => void) => {
    if (!ref.current) return;
    
    ref.current.focus();
    ref.current.classList.add('vv-filling');
    
    for (let i = 0; i <= value.length; i++) {
      await new Promise(r => setTimeout(r, 50));
      const newValue = value.substring(0, i);
      ref.current.value = newValue;
      setter(newValue);
    }
    
    ref.current.classList.remove('vv-filling');
    ref.current.classList.add('vv-filled');
    setTimeout(() => ref.current?.classList.remove('vv-filled'), 500);
  };

  // Process voice commands
  const handleVoiceCommand = useCallback(async (text: string) => {
    const lower = text.toLowerCase();
    console.log('Processing command:', text);

    // Number conversion
    const numberWords: Record<string, string> = {
      'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
      'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'oh': '0'
    };
    
    let processed = lower;
    for (const [word, digit] of Object.entries(numberWords)) {
      processed = processed.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
    }
    const digits = processed.replace(/\D/g, '');

    // Phone step
    if (step === 'phone' && digits.length > 0) {
      const newPhone = (phone + digits).slice(0, 10);
      await typeIntoField(phoneInputRef, newPhone, setPhone);
      if (newPhone.length === 10) {
        speak('Phone number complete! Say next or click Send OTP.');
      }
    }

    // OTP step
    if (step === 'otp' && digits.length > 0) {
      const newOtp = (otp + digits).slice(0, 6);
      await typeIntoField(otpInputRef, newOtp, setOtp);
      if (newOtp.length === 6) {
        speak('Code complete! Say verify or click the button.');
      }
    }

    // Profile step - Company name extraction
    if (step === 'profile') {
      const companyPatterns = [
        /(?:my company is|company name is|we are|i'm from|this is|called)\s+(.+?)(?:\s+and|\s+we|\.|$)/i,
        /^(.+?)\s+(?:inc|llc|corp|company|co\b)/i
      ];
      
      for (const pattern of companyPatterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[1].length > 2) {
          await typeIntoField(companyInputRef, match[1].trim(), setCompanyName);
          speak(`Got it, ${match[1].trim()}.`);
          break;
        }
      }

      // Description extraction
      const descPatterns = [
        /(?:we sell|we offer|we make|we provide|we specialize in|dealing in)\s+(.+)/i,
        /(?:our products include|products are|selling)\s+(.+)/i
      ];
      
      for (const pattern of descPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          await typeIntoField(descriptionRef, match[1].trim(), setDescription);
          break;
        }
      }

      // Beautify command
      if (lower.includes('beautify') || lower.includes('enhance') || lower.includes('improve')) {
        handleBeautify();
      }
    }

    // Navigation commands
    if (lower.includes('next') || lower.includes('continue') || lower.includes('send') || lower.includes('verify') || lower.includes('save')) {
      if (step === 'phone' && phone.length === 10) {
        speak('Sending verification code.');
        goNext();
      } else if (step === 'otp' && otp.length === 6) {
        speak('Verifying code.');
        goNext();
      } else if (step === 'profile' && companyName.trim() && description.trim()) {
        speak('Saving profile.');
        goNext();
      } else if (step === 'upload') {
        goNext();
      }
    }

    if (lower.includes('back') || lower.includes('previous')) {
      goBack();
    }

    if (lower.includes('clear') || lower.includes('reset')) {
      if (step === 'phone') { setPhone(''); phoneInputRef.current && (phoneInputRef.current.value = ''); }
      if (step === 'otp') { setOtp(''); otpInputRef.current && (otpInputRef.current.value = ''); }
      speak('Cleared.');
    }
  }, [step, phone, otp, companyName, description, speak]);

  // Beautify description
  const handleBeautify = async () => {
    if (!description.trim()) {
      speak('Please enter a description first.');
      return;
    }

    setIsBeautifying(true);
    speak('Enhancing your description...');

    try {
      const response = await fetch('http://localhost:1117/api/beautify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: description,
          type: 'vendor',
          companyName
        })
      });

      const data = await response.json();
      if (data.beautified) {
        await typeIntoField(descriptionRef, data.beautified, setDescription);
        speak('Description enhanced!');
      }
    } catch (err) {
      const enhanced = `${companyName || 'Our company'} is a premier supplier of ${description}. We offer high-quality products with exceptional service and competitive pricing.`;
      await typeIntoField(descriptionRef, enhanced, setDescription);
      speak('Description enhanced!');
    } finally {
      setIsBeautifying(false);
    }
  };

  // Save vendor to backend
  const saveVendor = async () => {
    try {
      await fetch('http://localhost:1117/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          companyName,
          description,
          files: uploadedFiles.map(f => ({ name: f.file.name, category: f.category, url: f.url }))
        })
      });
      speak('Congratulations! Your vendor profile is set up and your catalog is being processed.');
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const formatPhone = (p: string) => {
    if (p.length <= 3) return p;
    if (p.length <= 6) return `${p.slice(0,3)}-${p.slice(3)}`;
    return `${p.slice(0,3)}-${p.slice(3,6)}-${p.slice(6)}`;
  };

  const stepIndex = STEPS.indexOf(step);

  // Welcome messages
  const getWelcomeMessage = () => {
    switch (step) {
      case 'phone': return 'Welcome vendor! Please say or enter your phone number digit by digit.';
      case 'otp': return 'Enter the 6-digit verification code sent to your phone.';
      case 'profile': return 'Tell me about your company. Say your company name and what products you sell.';
      case 'upload': return 'Upload your product catalog and images. You can upload PDFs, images, CAD files, and more.';
      case 'complete': return 'Congratulations! Your vendor profile is ready.';
      default: return '';
    }
  };

  const getHints = () => {
    switch (step) {
      case 'phone': return ['seven zero three...', 'next', 'clear'];
      case 'otp': return ['one two three four five six', 'verify'];
      case 'profile': return ['My company is ABC Corp', 'We sell flooring materials', 'beautify'];
      case 'upload': return ['upload catalog', 'skip', 'next'];
      default: return [];
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'phone':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3em' }}>📦</span>
              <h3 style={{ color: THEME.accent, margin: '10px 0 5px' }}>Vendor Phone</h3>
              <p style={{ color: '#888', fontSize: '0.9em' }}>Say your digits: "seven zero three..."</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
              <span style={{ color: '#888', fontSize: '1.2em' }}>+1</span>
              <input
                ref={phoneInputRef}
                type="tel"
                value={formatPhone(phone)}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="000-000-0000"
                style={{
                  padding: '16px 20px',
                  fontSize: '1.5em',
                  fontFamily: 'monospace',
                  background: 'rgba(0,0,0,0.3)',
                  border: `2px solid ${phone.length === 10 ? '#10b981' : THEME.accent}40`,
                  borderRadius: 12,
                  color: '#fff',
                  textAlign: 'center',
                  width: 220,
                  outline: 'none'
                }}
              />
            </div>

            <button
              onClick={goNext}
              disabled={phone.length !== 10}
              style={{
                padding: '14px 40px',
                background: phone.length === 10 ? THEME.accent : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 30,
                color: phone.length === 10 ? '#000' : '#666',
                fontWeight: 600,
                cursor: phone.length === 10 ? 'pointer' : 'not-allowed',
                alignSelf: 'center'
              }}
            >
              Send OTP →
            </button>
          </div>
        );

      case 'otp':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3em' }}>🔐</span>
              <h3 style={{ color: THEME.accent, margin: '10px 0 5px' }}>Verify Code</h3>
              <p style={{ color: '#888', fontSize: '0.9em' }}>Code sent to {formatPhone(phone)}</p>
            </div>

            <input
              ref={otpInputRef}
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              style={{
                padding: '16px 20px',
                fontSize: '2em',
                fontFamily: 'monospace',
                background: 'rgba(0,0,0,0.3)',
                border: `2px solid ${otp.length === 6 ? '#10b981' : THEME.accent}40`,
                borderRadius: 12,
                color: '#fff',
                textAlign: 'center',
                width: 200,
                letterSpacing: 8,
                alignSelf: 'center',
                outline: 'none'
              }}
            />

            <button
              onClick={goNext}
              disabled={otp.length !== 6}
              style={{
                padding: '14px 40px',
                background: otp.length === 6 ? THEME.accent : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 30,
                color: otp.length === 6 ? '#000' : '#666',
                fontWeight: 600,
                cursor: otp.length === 6 ? 'pointer' : 'not-allowed',
                alignSelf: 'center'
              }}
            >
              Verify →
            </button>
          </div>
        );

      case 'profile':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '2.5em' }}>📦</span>
              <h3 style={{ color: THEME.accent, margin: '10px 0 5px' }}>Vendor Profile</h3>
            </div>

            <div>
              <label style={{ color: '#ccc', fontSize: '0.85em', display: 'block', marginBottom: 6 }}>Company Name</label>
              <input
                ref={companyInputRef}
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Your company name"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(0,0,0,0.3)',
                  border: `1px solid ${THEME.accent}40`,
                  borderRadius: 10,
                  color: '#fff',
                  fontSize: '1em',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ color: '#ccc', fontSize: '0.85em' }}>Products & Services</label>
                <button
                  onClick={handleBeautify}
                  disabled={isBeautifying || !description.trim()}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 15,
                    border: 'none',
                    background: isBeautifying ? 'rgba(139, 92, 246, 0.3)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    color: '#fff',
                    fontSize: '0.8em',
                    fontWeight: 600,
                    cursor: isBeautifying || !description.trim() ? 'not-allowed' : 'pointer',
                    opacity: !description.trim() ? 0.5 : 1
                  }}
                >
                  {isBeautifying ? '⏳ Beautifying...' : '✨ Beautify'}
                </button>
              </div>
              <textarea
                ref={descriptionRef}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what you sell... e.g., 'flooring materials, tiles, hardwood'"
                rows={4}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(0,0,0,0.3)',
                  border: `1px solid ${THEME.accent}40`,
                  borderRadius: 10,
                  color: '#fff',
                  fontSize: '1em',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
              />
            </div>

            <button
              onClick={goNext}
              disabled={!companyName.trim() || !description.trim()}
              style={{
                padding: '14px 40px',
                background: companyName.trim() && description.trim() ? THEME.accent : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 30,
                color: companyName.trim() && description.trim() ? '#000' : '#666',
                fontWeight: 600,
                cursor: companyName.trim() && description.trim() ? 'pointer' : 'not-allowed',
                alignSelf: 'center'
              }}
            >
              Save Profile →
            </button>
          </div>
        );

      case 'upload':
        return (
          <MultiFormatUploader
            userType="vendor"
            accentColor={THEME.accent}
            speak={speak}
            onFilesUploaded={setUploadedFiles}
            onAllComplete={() => {
              saveVendor();
              goNext();
            }}
          />
        );

      case 'complete':
        return (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <span style={{ fontSize: '4em' }}>🎉</span>
            <h2 style={{ color: THEME.accent }}>Setup Complete!</h2>
            <p style={{ color: '#888' }}>Your vendor profile is ready.</p>
            <p style={{ color: '#10b981', fontSize: '0.9em' }}>
              {uploadedFiles.length > 0 ? `${uploadedFiles.length} files uploaded` : 'No files uploaded'}
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '14px 40px',
                marginTop: 20,
                background: THEME.accent,
                border: 'none',
                borderRadius: 30,
                color: '#000',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              View Product Catalog →
            </button>
          </div>
        );
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.92)',
      zIndex: 10000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`,
        borderRadius: 20,
        width: '100%',
        maxWidth: 650,
        maxHeight: '90vh',
        overflow: 'hidden',
        border: `2px solid ${THEME.accent}40`
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          background: 'rgba(0,0,0,0.3)',
          borderBottom: `1px solid ${THEME.accent}30`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '1.6em' }}>📦</span>
            <div>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.1em' }}>Vendor Setup</h2>
              <span style={{ color: '#888', fontSize: '0.8em' }}>
                Step {stepIndex + 1}/{STEPS.length} • {LABELS[stepIndex]}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              width: 36,
              height: 36,
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1.2em'
            }}
          >
            ✕
          </button>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', padding: '10px 24px', gap: 4, background: 'rgba(0,0,0,0.2)' }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i <= stepIndex ? THEME.accent : 'rgba(255,255,255,0.15)'
              }}
            />
          ))}
        </div>

        {/* Back button */}
        <div style={{ padding: '12px 24px', background: 'rgba(0,0,0,0.2)' }}>
          <button
            onClick={goBack}
            style={{
              padding: '6px 12px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              borderRadius: 15,
              cursor: 'pointer',
              fontSize: '0.85em'
            }}
          >
            ← Back
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24, overflow: 'auto', maxHeight: 'calc(90vh - 280px)' }}>
          {renderStep()}
        </div>

        {/* Universal AgenticBar */}
        {step !== 'complete' && (
          <div style={{ padding: '0 24px 24px' }}>
            <UniversalAgenticBar
              ref={agenticBarRef}
              welcomeMessage={getWelcomeMessage()}
              hints={getHints()}
              onCommand={handleVoiceCommand}
              autoStart={true}
              accentColor={THEME.accent}
              context={LABELS[stepIndex]}
            />
          </div>
        )}
      </div>

      <style>{`
        .vv-filling {
          border-color: #06b6d4 !important;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.3), 0 0 20px rgba(6, 182, 212, 0.2) !important;
        }
        .vv-filled {
          animation: successFlash 0.5s ease-out !important;
        }
        @keyframes successFlash {
          0% { background-color: rgba(34, 197, 94, 0.3); }
          100% { background-color: transparent; }
        }
      `}</style>
    </div>
  );
};

export default VendorFlow;
VENDORFLOW

echo "  ✅ VendorFlow.tsx (FIXED)"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 5: Update vendor/index.ts
#═══════════════════════════════════════════════════════════════════════════════
cat > "$VENDOR_DIR/index.ts" << 'VENDORINDEX'
export { default as VendorFlow } from './VendorFlow';
export { default } from './VendorFlow';
VENDORINDEX

echo "  ✅ vendor/index.ts"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 6: Fix BuilderFlow with Universal AgenticBar
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "🏗️ Fixing BuilderFlow..."

cat > "$BUILDER_DIR/BuilderFlow.tsx" << 'BUILDERFLOW'
import React, { useState, useCallback, useRef } from 'react';
import UniversalAgenticBar, { AgenticBarRef } from '../common/UniversalAgenticBar';
import MultiFormatUploader from '../common/MultiFormatUploader';

interface Props { onClose: () => void; onBack: () => void; }

type Step = 'phone' | 'otp' | 'profile' | 'upload' | 'complete';
const STEPS: Step[] = ['phone', 'otp', 'profile', 'upload', 'complete'];
const LABELS = ['Phone', 'Verify', 'Profile', 'Portfolio', 'Done'];
const THEME = { primary: '#1e3a5f', secondary: '#0f1c2e', accent: '#f59e0b' };

const BuilderFlow: React.FC<Props> = ({ onClose, onBack }) => {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [isBeautifying, setIsBeautifying] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  
  const agenticBarRef = useRef<AgenticBarRef>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const companyInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const speak = useCallback((text: string) => agenticBarRef.current?.speak(text), []);

  const goNext = () => { const i = STEPS.indexOf(step); if (i < STEPS.length - 1) setStep(STEPS[i + 1]); };
  const goBack = () => { const i = STEPS.indexOf(step); if (i > 0) setStep(STEPS[i - 1]); else onBack(); };

  const typeIntoField = async (ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement>, value: string, setter: (v: string) => void) => {
    if (!ref.current) return;
    ref.current.focus();
    ref.current.classList.add('vv-filling');
    for (let i = 0; i <= value.length; i++) {
      await new Promise(r => setTimeout(r, 50));
      const newValue = value.substring(0, i);
      ref.current.value = newValue;
      setter(newValue);
    }
    ref.current.classList.remove('vv-filling');
  };

  const handleVoiceCommand = useCallback(async (text: string) => {
    const lower = text.toLowerCase();
    const numberWords: Record<string, string> = { 'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'oh': '0' };
    let processed = lower;
    for (const [word, digit] of Object.entries(numberWords)) processed = processed.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
    const digits = processed.replace(/\D/g, '');

    if (step === 'phone' && digits.length > 0) {
      const newPhone = (phone + digits).slice(0, 10);
      await typeIntoField(phoneInputRef, newPhone, setPhone);
      if (newPhone.length === 10) speak('Phone complete!');
    }

    if (step === 'otp' && digits.length > 0) {
      const newOtp = (otp + digits).slice(0, 6);
      await typeIntoField(otpInputRef, newOtp, setOtp);
      if (newOtp.length === 6) speak('Code complete!');
    }

    if (step === 'profile') {
      const companyMatch = text.match(/(?:company is|called|we are|i'm from)\s+(.+?)(?:\s+and|\.|$)/i);
      if (companyMatch && companyMatch[1]) await typeIntoField(companyInputRef, companyMatch[1].trim(), setCompanyName);
      
      const descMatch = text.match(/(?:we build|we specialize in|we do|services include)\s+(.+)/i);
      if (descMatch && descMatch[1]) await typeIntoField(descriptionRef, descMatch[1].trim(), setDescription);
      
      if (lower.includes('beautify')) handleBeautify();
    }

    if (lower.includes('next') || lower.includes('continue') || lower.includes('send') || lower.includes('verify') || lower.includes('save')) {
      if (step === 'phone' && phone.length === 10) goNext();
      else if (step === 'otp' && otp.length === 6) goNext();
      else if (step === 'profile' && companyName.trim() && description.trim()) goNext();
      else if (step === 'upload') goNext();
    }

    if (lower.includes('clear')) {
      if (step === 'phone') setPhone('');
      if (step === 'otp') setOtp('');
      speak('Cleared.');
    }
  }, [step, phone, otp, companyName, description, speak]);

  const handleBeautify = async () => {
    if (!description.trim()) return;
    setIsBeautifying(true);
    speak('Enhancing description...');
    try {
      const res = await fetch('http://localhost:1117/api/beautify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: description, type: 'builder', companyName })
      });
      const data = await res.json();
      if (data.beautified) await typeIntoField(descriptionRef, data.beautified, setDescription);
    } catch {
      const enhanced = `${companyName || 'Our company'} is a premier construction firm specializing in ${description}. We deliver exceptional quality on every project.`;
      await typeIntoField(descriptionRef, enhanced, setDescription);
    }
    setIsBeautifying(false);
    speak('Enhanced!');
  };

  const saveBuilder = async () => {
    try {
      await fetch('http://localhost:1117/api/builders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, companyName, description, files: uploadedFiles })
      });
    } catch (e) { console.error(e); }
  };

  const formatPhone = (p: string) => { if (p.length <= 3) return p; if (p.length <= 6) return `${p.slice(0,3)}-${p.slice(3)}`; return `${p.slice(0,3)}-${p.slice(3,6)}-${p.slice(6)}`; };
  const stepIndex = STEPS.indexOf(step);

  const getWelcome = () => {
    switch (step) {
      case 'phone': return 'Welcome builder! Say your phone number digit by digit.';
      case 'otp': return 'Enter the verification code.';
      case 'profile': return 'Tell me about your construction company.';
      case 'upload': return 'Upload your portfolio, floor plans, and project photos.';
      default: return '';
    }
  };

  const getHints = () => {
    switch (step) {
      case 'phone': return ['seven zero three...', 'next'];
      case 'otp': return ['one two three...', 'verify'];
      case 'profile': return ['My company is ABC Construction', 'We build custom homes', 'beautify'];
      case 'upload': return ['skip', 'next'];
      default: return [];
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'phone':
        return (<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}><div style={{ textAlign: 'center' }}><span style={{ fontSize: '3em' }}>🏗️</span><h3 style={{ color: THEME.accent, margin: '10px 0' }}>Builder Phone</h3></div><div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}><span style={{ color: '#888' }}>+1</span><input ref={phoneInputRef} type="tel" value={formatPhone(phone)} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="000-000-0000" style={{ padding: '16px 20px', fontSize: '1.5em', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', border: `2px solid ${THEME.accent}40`, borderRadius: 12, color: '#fff', textAlign: 'center', width: 220 }} /></div><button onClick={goNext} disabled={phone.length !== 10} style={{ padding: '14px 40px', background: phone.length === 10 ? THEME.accent : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: phone.length === 10 ? '#000' : '#666', fontWeight: 600, alignSelf: 'center', cursor: phone.length === 10 ? 'pointer' : 'not-allowed' }}>Send OTP →</button></div>);
      case 'otp':
        return (<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}><div style={{ textAlign: 'center' }}><span style={{ fontSize: '3em' }}>🔐</span><h3 style={{ color: THEME.accent, margin: '10px 0' }}>Verify Code</h3></div><input ref={otpInputRef} type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} style={{ padding: '16px 20px', fontSize: '2em', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', border: `2px solid ${THEME.accent}40`, borderRadius: 12, color: '#fff', textAlign: 'center', width: 180, letterSpacing: 8, alignSelf: 'center' }} /><button onClick={goNext} disabled={otp.length !== 6} style={{ padding: '14px 40px', background: otp.length === 6 ? THEME.accent : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: otp.length === 6 ? '#000' : '#666', fontWeight: 600, alignSelf: 'center', cursor: otp.length === 6 ? 'pointer' : 'not-allowed' }}>Verify →</button></div>);
      case 'profile':
        return (<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}><div style={{ textAlign: 'center' }}><span style={{ fontSize: '2.5em' }}>🏗️</span><h3 style={{ color: THEME.accent, margin: '10px 0' }}>Builder Profile</h3></div><div><label style={{ color: '#ccc', fontSize: '0.85em', display: 'block', marginBottom: 6 }}>Company Name</label><input ref={companyInputRef} type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your construction company" style={{ width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${THEME.accent}40`, borderRadius: 10, color: '#fff' }} /></div><div><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><label style={{ color: '#ccc', fontSize: '0.85em' }}>Services</label><button onClick={handleBeautify} disabled={isBeautifying || !description.trim()} style={{ padding: '6px 14px', borderRadius: 15, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', fontSize: '0.8em', cursor: 'pointer', opacity: !description.trim() ? 0.5 : 1 }}>{isBeautifying ? '⏳' : '✨'} Beautify</button></div><textarea ref={descriptionRef} value={description} onChange={e => setDescription(e.target.value)} placeholder="What do you build?" rows={4} style={{ width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${THEME.accent}40`, borderRadius: 10, color: '#fff', resize: 'vertical', fontFamily: 'inherit' }} /></div><button onClick={goNext} disabled={!companyName.trim() || !description.trim()} style={{ padding: '14px 40px', background: companyName && description ? THEME.accent : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: companyName && description ? '#000' : '#666', fontWeight: 600, alignSelf: 'center', cursor: companyName && description ? 'pointer' : 'not-allowed' }}>Save →</button></div>);
      case 'upload':
        return <MultiFormatUploader userType="builder" accentColor={THEME.accent} speak={speak} onFilesUploaded={setUploadedFiles} onAllComplete={() => { saveBuilder(); goNext(); }} />;
      case 'complete':
        return (<div style={{ textAlign: 'center', padding: 40 }}><span style={{ fontSize: '4em' }}>🎉</span><h2 style={{ color: THEME.accent }}>Setup Complete!</h2><p style={{ color: '#888' }}>Your builder profile is ready.</p><button onClick={onClose} style={{ padding: '14px 40px', marginTop: 20, background: THEME.accent, border: 'none', borderRadius: 30, color: '#000', fontWeight: 600, cursor: 'pointer' }}>View Real Estate →</button></div>);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <div style={{ background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`, borderRadius: 20, width: '100%', maxWidth: 650, maxHeight: '90vh', overflow: 'hidden', border: `2px solid ${THEME.accent}40` }}>
        <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.3)', borderBottom: `1px solid ${THEME.accent}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><span style={{ fontSize: '1.6em' }}>🏗️</span><div><h2 style={{ color: '#fff', margin: 0, fontSize: '1.1em' }}>Builder Setup</h2><span style={{ color: '#888', fontSize: '0.8em' }}>Step {stepIndex + 1}/{STEPS.length}</span></div></div><button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer' }}>✕</button></div>
        <div style={{ display: 'flex', padding: '10px 24px', gap: 4, background: 'rgba(0,0,0,0.2)' }}>{STEPS.map((_, i) => (<div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= stepIndex ? THEME.accent : 'rgba(255,255,255,0.15)' }} />))}</div>
        <div style={{ padding: '12px 24px', background: 'rgba(0,0,0,0.2)' }}><button onClick={goBack} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 15, cursor: 'pointer' }}>← Back</button></div>
        <div style={{ padding: 24, overflow: 'auto', maxHeight: 'calc(90vh - 280px)' }}>{renderStep()}</div>
        {step !== 'complete' && (<div style={{ padding: '0 24px 24px' }}><UniversalAgenticBar ref={agenticBarRef} welcomeMessage={getWelcome()} hints={getHints()} onCommand={handleVoiceCommand} autoStart={true} accentColor={THEME.accent} context={LABELS[stepIndex]} /></div>)}
      </div>
      <style>{`.vv-filling { border-color: #06b6d4 !important; box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.3) !important; }`}</style>
    </div>
  );
};

export default BuilderFlow;
BUILDERFLOW

cat > "$BUILDER_DIR/index.ts" << 'EOF'
export { default as BuilderFlow } from './BuilderFlow';
export { default } from './BuilderFlow';
EOF

echo "  ✅ BuilderFlow.tsx (FIXED)"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 7: Fix AgentFlow with Universal AgenticBar
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "🏠 Fixing AgentFlow..."

cat > "$AGENT_DIR/AgentFlow.tsx" << 'AGENTFLOW'
import React, { useState, useCallback, useRef } from 'react';
import UniversalAgenticBar, { AgenticBarRef } from '../common/UniversalAgenticBar';
import MultiFormatUploader from '../common/MultiFormatUploader';

interface Props { onClose: () => void; onBack: () => void; }

type Step = 'phone' | 'otp' | 'license' | 'profile' | 'upload' | 'complete';
const STEPS: Step[] = ['phone', 'otp', 'license', 'profile', 'upload', 'complete'];
const LABELS = ['Phone', 'Verify', 'License', 'Profile', 'Listings', 'Done'];
const THEME = { primary: '#1a1a2e', secondary: '#16213e', accent: '#10b981' };
const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

const AgentFlow: React.FC<Props> = ({ onClose, onBack }) => {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [license, setLicense] = useState('');
  const [licenseState, setLicenseState] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [isBeautifying, setIsBeautifying] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  
  const agenticBarRef = useRef<AgenticBarRef>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const companyInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const speak = useCallback((text: string) => agenticBarRef.current?.speak(text), []);

  const goNext = () => { const i = STEPS.indexOf(step); if (i < STEPS.length - 1) setStep(STEPS[i + 1]); };
  const goBack = () => { const i = STEPS.indexOf(step); if (i > 0) setStep(STEPS[i - 1]); else onBack(); };

  const typeIntoField = async (ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement>, value: string, setter: (v: string) => void) => {
    if (!ref.current) return;
    ref.current.focus();
    for (let i = 0; i <= value.length; i++) {
      await new Promise(r => setTimeout(r, 50));
      ref.current.value = value.substring(0, i);
      setter(value.substring(0, i));
    }
  };

  const handleVoiceCommand = useCallback(async (text: string) => {
    const lower = text.toLowerCase();
    const numberWords: Record<string, string> = { 'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'oh': '0' };
    let processed = lower;
    for (const [word, digit] of Object.entries(numberWords)) processed = processed.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
    const digits = processed.replace(/\D/g, '');

    if (step === 'phone' && digits.length > 0) {
      const newPhone = (phone + digits).slice(0, 10);
      await typeIntoField(phoneInputRef, newPhone, setPhone);
      if (newPhone.length === 10) speak('Phone complete!');
    }

    if (step === 'otp' && digits.length > 0) {
      const newOtp = (otp + digits).slice(0, 6);
      await typeIntoField(otpInputRef, newOtp, setOtp);
      if (newOtp.length === 6) speak('Code complete!');
    }

    if (step === 'license') {
      // State detection
      STATES.forEach(s => {
        if (lower.includes(s.toLowerCase())) {
          setLicenseState(s);
          speak(`Selected ${s}`);
        }
      });
      // License number
      if (digits.length > 0) {
        await typeIntoField(licenseInputRef, (license + digits).slice(0, 12), setLicense);
      }
    }

    if (step === 'profile') {
      const companyMatch = text.match(/(?:agency is|brokerage is|i work at|called)\s+(.+?)(?:\s+and|\.|$)/i);
      if (companyMatch && companyMatch[1]) await typeIntoField(companyInputRef, companyMatch[1].trim(), setCompanyName);
      
      const descMatch = text.match(/(?:specialize in|i sell|i help with|focus on)\s+(.+)/i);
      if (descMatch && descMatch[1]) await typeIntoField(descriptionRef, descMatch[1].trim(), setDescription);
      
      if (lower.includes('beautify')) handleBeautify();
    }

    if (lower.includes('next') || lower.includes('continue') || lower.includes('verify') || lower.includes('save')) {
      if (step === 'phone' && phone.length === 10) goNext();
      else if (step === 'otp' && otp.length === 6) goNext();
      else if (step === 'license' && license && licenseState) goNext();
      else if (step === 'profile' && companyName && description) goNext();
      else if (step === 'upload') goNext();
    }
  }, [step, phone, otp, license, licenseState, companyName, description, speak]);

  const handleBeautify = async () => {
    if (!description.trim()) return;
    setIsBeautifying(true);
    try {
      const res = await fetch('http://localhost:1117/api/beautify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: description, type: 'agent', companyName })
      });
      const data = await res.json();
      if (data.beautified) await typeIntoField(descriptionRef, data.beautified, setDescription);
    } catch {
      const enhanced = `${companyName || 'Our agency'} specializes in ${description}. We provide expert guidance to help clients achieve their real estate goals.`;
      await typeIntoField(descriptionRef, enhanced, setDescription);
    }
    setIsBeautifying(false);
    speak('Enhanced!');
  };

  const saveAgent = async () => {
    try {
      await fetch('http://localhost:1117/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, license, licenseState, companyName, description, files: uploadedFiles })
      });
    } catch (e) { console.error(e); }
  };

  const formatPhone = (p: string) => { if (p.length <= 3) return p; if (p.length <= 6) return `${p.slice(0,3)}-${p.slice(3)}`; return `${p.slice(0,3)}-${p.slice(3,6)}-${p.slice(6)}`; };
  const stepIndex = STEPS.indexOf(step);

  const getWelcome = () => {
    switch (step) {
      case 'phone': return 'Welcome real estate agent! Say your phone number.';
      case 'otp': return 'Enter the verification code.';
      case 'license': return 'Enter your license number and state.';
      case 'profile': return 'Tell me about your agency.';
      case 'upload': return 'Upload property listings and photos.';
      default: return '';
    }
  };

  const getHints = () => {
    switch (step) {
      case 'phone': return ['seven zero three...', 'next'];
      case 'otp': return ['one two three...', 'verify'];
      case 'license': return ['Texas', 'California', 'next'];
      case 'profile': return ['My agency is RE/MAX', 'I specialize in luxury homes', 'beautify'];
      default: return [];
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'phone':
        return (<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}><div style={{ textAlign: 'center' }}><span style={{ fontSize: '3em' }}>🏠</span><h3 style={{ color: THEME.accent, margin: '10px 0' }}>Agent Phone</h3></div><div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}><span style={{ color: '#888' }}>+1</span><input ref={phoneInputRef} type="tel" value={formatPhone(phone)} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="000-000-0000" style={{ padding: '16px 20px', fontSize: '1.5em', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', border: `2px solid ${THEME.accent}40`, borderRadius: 12, color: '#fff', textAlign: 'center', width: 220 }} /></div><button onClick={goNext} disabled={phone.length !== 10} style={{ padding: '14px 40px', background: phone.length === 10 ? THEME.accent : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: phone.length === 10 ? '#000' : '#666', fontWeight: 600, alignSelf: 'center', cursor: phone.length === 10 ? 'pointer' : 'not-allowed' }}>Send OTP →</button></div>);
      case 'otp':
        return (<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}><div style={{ textAlign: 'center' }}><span style={{ fontSize: '3em' }}>🔐</span><h3 style={{ color: THEME.accent, margin: '10px 0' }}>Verify</h3></div><input ref={otpInputRef} type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} style={{ padding: '16px 20px', fontSize: '2em', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', border: `2px solid ${THEME.accent}40`, borderRadius: 12, color: '#fff', textAlign: 'center', width: 180, letterSpacing: 8, alignSelf: 'center' }} /><button onClick={goNext} disabled={otp.length !== 6} style={{ padding: '14px 40px', background: otp.length === 6 ? THEME.accent : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: otp.length === 6 ? '#000' : '#666', fontWeight: 600, alignSelf: 'center', cursor: otp.length === 6 ? 'pointer' : 'not-allowed' }}>Verify →</button></div>);
      case 'license':
        return (<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}><div style={{ textAlign: 'center' }}><span style={{ fontSize: '3em' }}>🏆</span><h3 style={{ color: THEME.accent, margin: '10px 0' }}>License Verification</h3></div><input ref={licenseInputRef} type="text" value={license} onChange={e => setLicense(e.target.value)} placeholder="License Number" style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${THEME.accent}40`, borderRadius: 10, color: '#fff' }} /><select value={licenseState} onChange={e => setLicenseState(e.target.value)} style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${THEME.accent}40`, borderRadius: 10, color: licenseState ? '#fff' : '#888' }}><option value="">Select State</option>{STATES.map(s => <option key={s} value={s}>{s}</option>)}</select><button onClick={goNext} disabled={!license || !licenseState} style={{ padding: '14px 40px', background: license && licenseState ? THEME.accent : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: license && licenseState ? '#000' : '#666', fontWeight: 600, alignSelf: 'center', cursor: license && licenseState ? 'pointer' : 'not-allowed' }}>Verify →</button></div>);
      case 'profile':
        return (<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}><div style={{ textAlign: 'center' }}><span style={{ fontSize: '2.5em' }}>🏠</span><h3 style={{ color: THEME.accent, margin: '10px 0' }}>Agent Profile</h3></div><input ref={companyInputRef} type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Agency/Brokerage Name" style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${THEME.accent}40`, borderRadius: 10, color: '#fff' }} /><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: -14 }}><label style={{ color: '#ccc', fontSize: '0.85em' }}>Specialties</label><button onClick={handleBeautify} disabled={isBeautifying || !description.trim()} style={{ padding: '6px 14px', borderRadius: 15, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', fontSize: '0.8em', cursor: 'pointer', opacity: !description.trim() ? 0.5 : 1 }}>{isBeautifying ? '⏳' : '✨'} Beautify</button></div><textarea ref={descriptionRef} value={description} onChange={e => setDescription(e.target.value)} placeholder="Your specialties..." rows={4} style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${THEME.accent}40`, borderRadius: 10, color: '#fff', resize: 'vertical', fontFamily: 'inherit' }} /><button onClick={goNext} disabled={!companyName || !description} style={{ padding: '14px 40px', background: companyName && description ? THEME.accent : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 30, color: companyName && description ? '#000' : '#666', fontWeight: 600, alignSelf: 'center', cursor: companyName && description ? 'pointer' : 'not-allowed' }}>Save →</button></div>);
      case 'upload':
        return <MultiFormatUploader userType="agent" accentColor={THEME.accent} speak={speak} onFilesUploaded={setUploadedFiles} onAllComplete={() => { saveAgent(); goNext(); }} />;
      case 'complete':
        return (<div style={{ textAlign: 'center', padding: 40 }}><span style={{ fontSize: '4em' }}>🎉</span><h2 style={{ color: THEME.accent }}>Setup Complete!</h2><p style={{ color: '#888' }}>Your agent profile is ready.</p><button onClick={onClose} style={{ padding: '14px 40px', marginTop: 20, background: THEME.accent, border: 'none', borderRadius: 30, color: '#000', fontWeight: 600, cursor: 'pointer' }}>View Listings →</button></div>);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <div style={{ background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`, borderRadius: 20, width: '100%', maxWidth: 650, maxHeight: '90vh', overflow: 'hidden', border: `2px solid ${THEME.accent}40` }}>
        <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.3)', borderBottom: `1px solid ${THEME.accent}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><span style={{ fontSize: '1.6em' }}>🏠</span><div><h2 style={{ color: '#fff', margin: 0, fontSize: '1.1em' }}>Agent Setup</h2><span style={{ color: '#888', fontSize: '0.8em' }}>Step {stepIndex + 1}/{STEPS.length}</span></div></div><button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer' }}>✕</button></div>
        <div style={{ display: 'flex', padding: '10px 24px', gap: 4, background: 'rgba(0,0,0,0.2)' }}>{STEPS.map((_, i) => (<div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= stepIndex ? THEME.accent : 'rgba(255,255,255,0.15)' }} />))}</div>
        <div style={{ padding: '12px 24px', background: 'rgba(0,0,0,0.2)' }}><button onClick={goBack} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 15, cursor: 'pointer' }}>← Back</button></div>
        <div style={{ padding: 24, overflow: 'auto', maxHeight: 'calc(90vh - 280px)' }}>{renderStep()}</div>
        {step !== 'complete' && (<div style={{ padding: '0 24px 24px' }}><UniversalAgenticBar ref={agenticBarRef} welcomeMessage={getWelcome()} hints={getHints()} onCommand={handleVoiceCommand} autoStart={true} accentColor={THEME.accent} context={LABELS[stepIndex]} /></div>)}
      </div>
    </div>
  );
};

export default AgentFlow;
AGENTFLOW

cat > "$AGENT_DIR/index.ts" << 'EOF'
export { default as AgentFlow } from './AgentFlow';
export { default } from './AgentFlow';
EOF

echo "  ✅ AgentFlow.tsx (FIXED)"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 8: Update signin/index.ts
#═══════════════════════════════════════════════════════════════════════════════
cat > "$SIGNIN_DIR/index.ts" << 'SIGNININDEX'
export { default as WhoAreYouModal } from './WhoAreYouModal';
export { default as VendorFlow } from './vendor/VendorFlow';
export { default as BuilderFlow } from './builder/BuilderFlow';
export { default as AgentFlow } from './agent/AgentFlow';
SIGNININDEX

echo "  ✅ signin/index.ts"

#═══════════════════════════════════════════════════════════════════════════════
# SUMMARY
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  ✅ COMPLETE UNIFIED FIX DONE!"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "  🔧 FIXED:"
echo ""
echo "  1️⃣ UniversalAgenticBar - ACTUALLY LISTENS"
echo "     • Proper SpeechRecognition initialization"
echo "     • Auto-restart on end"
echo "     • Error handling with messages"
echo "     • Waveform animation"
echo "     • Transcript display"
echo ""
echo "  2️⃣ MultiFormatUploader - MULTIPLE FORMATS"
echo "     • Vendor: Catalog PDF, Images, CAD, Video, Specs"
echo "     • Builder: Portfolio, Floor Plans, 3D, Surveys, Video"
echo "     • Agent: Listings, Photos, Floor Plans, Virtual Tours, Docs"
echo "     • Drag & drop + click"
echo "     • Progress tracking"
echo ""
echo "  3️⃣ VendorFlow - FIXED COMPLETELY"
echo "     • Voice auto-fill for phone, OTP, profile"
echo "     • Beautify button"
echo "     • Multi-format upload"
echo "     • Backend save"
echo ""
echo "  4️⃣ BuilderFlow - FIXED COMPLETELY"
echo "     • Same features as Vendor"
echo ""
echo "  5️⃣ AgentFlow - FIXED COMPLETELY"
echo "     • License verification step"
echo "     • State selection by voice"
echo ""
echo "  📋 NEXT:"
echo "     cd ~/vistaview_WORKING && npx vite --port 5180"
echo ""
echo "  💡 HOW TO USE:"
echo "     • Say numbers: 'seven zero three four five six..'"
echo "     • Say 'next' or 'continue' to proceed"
echo "     • Say 'clear' to reset"
echo "     • Say 'beautify' to enhance description"
echo "     • Say company name: 'My company is ABC Corp'"
echo "     • Say products: 'We sell flooring and tiles'"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
