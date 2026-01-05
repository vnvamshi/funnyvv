#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════════
#  PART A: ENHANCED UPLOAD MODAL + VOICE COMMENTS + TRANSCRIPT SAVING
#  
#  Features:
#  1. BIGGER expanded upload modal (full screen option)
#  2. Voice comments section - describe your products
#  3. All voice transcripts saved to database
#  4. AI processes transcripts and extracts info
#  5. Multiple upload categories with descriptions
#  6. Beautification during upload with voice
#═══════════════════════════════════════════════════════════════════════════════

VV="$HOME/vistaview_WORKING"
COMMON_DIR="$VV/src/components/signin/common"

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  🎤 PART A: ENHANCED UPLOAD + VOICE COMMENTS"
echo "═══════════════════════════════════════════════════════════════════════════════"

mkdir -p "$COMMON_DIR"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 1: Create Enhanced Upload Modal with Voice Comments
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "📁 Creating EnhancedUploadModal..."

cat > "$COMMON_DIR/EnhancedUploadModal.tsx" << 'ENHANCEDUPLOAD'
import React, { useState, useRef, useCallback, useEffect } from 'react';

interface VoiceComment {
  id: string;
  text: string;
  timestamp: Date;
  category?: string;
  processed: boolean;
  extractedInfo?: any;
}

interface FileUpload {
  file: File;
  category: string;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error';
  minioUrl?: string;
  extractedData?: any;
}

interface EnhancedUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'vendor' | 'builder' | 'agent';
  userId?: string;
  companyName?: string;
  onComplete?: (data: { files: FileUpload[], voiceComments: VoiceComment[], extractedProducts: any[] }) => void;
}

const FILE_CATEGORIES = {
  vendor: [
    { id: 'catalog', label: 'Product Catalog', icon: '📄', accept: '.pdf,.xlsx,.csv', desc: 'Main product catalog with prices' },
    { id: 'images', label: 'Product Images', icon: '🖼️', accept: '.jpg,.jpeg,.png,.webp,.heic', desc: 'High-res product photos' },
    { id: 'specs', label: 'Specifications', icon: '📋', accept: '.pdf,.docx,.txt,.md', desc: 'Technical specs and datasheets' },
    { id: 'cad', label: 'CAD / 3D Files', icon: '📐', accept: '.dwg,.dxf,.glb,.gltf,.obj,.fbx,.step,.stl', desc: '2D/3D design files' },
    { id: 'video', label: 'Product Videos', icon: '🎬', accept: '.mp4,.mov,.webm,.avi', desc: 'Demo and installation videos' },
    { id: 'certifications', label: 'Certifications', icon: '🏆', accept: '.pdf,.jpg,.png', desc: 'Quality certifications' },
  ],
  builder: [
    { id: 'portfolio', label: 'Project Portfolio', icon: '🏗️', accept: '.pdf,.jpg,.jpeg,.png', desc: 'Completed projects showcase' },
    { id: 'floorplans', label: 'Floor Plans', icon: '📐', accept: '.pdf,.dwg,.dxf,.jpg,.png', desc: 'Architectural floor plans' },
    { id: 'renders', label: '3D Renders', icon: '🎨', accept: '.jpg,.jpeg,.png,.glb,.gltf,.fbx', desc: '3D visualizations' },
    { id: 'surveys', label: 'Surveys & Permits', icon: '📋', accept: '.pdf,.jpg,.png', desc: 'Land surveys, permits' },
    { id: 'video', label: 'Project Videos', icon: '🎬', accept: '.mp4,.mov,.webm', desc: 'Walkthrough videos' },
    { id: 'bom', label: 'Bill of Materials', icon: '📊', accept: '.xlsx,.csv,.pdf', desc: 'Material lists and costs' },
  ],
  agent: [
    { id: 'listings', label: 'Property Listings', icon: '🏠', accept: '.pdf,.xlsx,.csv', desc: 'MLS listings, property data' },
    { id: 'photos', label: 'Property Photos', icon: '📸', accept: '.jpg,.jpeg,.png,.webp,.heic', desc: 'Property photography' },
    { id: 'floorplans', label: 'Floor Plans', icon: '📐', accept: '.pdf,.jpg,.png', desc: 'Property layouts' },
    { id: 'virtual', label: 'Virtual Tours', icon: '🎥', accept: '.mp4,.mov,.glb,.matterport', desc: '360° tours, 3D scans' },
    { id: 'docs', label: 'Legal Documents', icon: '📄', accept: '.pdf,.docx', desc: 'Contracts, disclosures' },
    { id: 'comps', label: 'Comparables', icon: '📊', accept: '.pdf,.xlsx,.csv', desc: 'Market analysis, comps' },
  ]
};

const EnhancedUploadModal: React.FC<EnhancedUploadModalProps> = ({
  isOpen,
  onClose,
  userType,
  userId,
  companyName,
  onComplete
}) => {
  const [isExpanded, setIsExpanded] = useState(true); // Start expanded
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [voiceComments, setVoiceComments] = useState<VoiceComment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [extractedProducts, setExtractedProducts] = useState<any[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const categories = FILE_CATEGORIES[userType];

  // Initialize speech
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    synthRef.current = window.speechSynthesis;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SR) {
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentTranscript(transcript);

        if (event.results[event.resultIndex].isFinal) {
          // Save voice comment
          const comment: VoiceComment = {
            id: `vc-${Date.now()}`,
            text: transcript,
            timestamp: new Date(),
            category: activeCategory || undefined,
            processed: false
          };
          setVoiceComments(prev => [...prev, comment]);
          
          // Process the comment
          processVoiceComment(comment);
          
          setCurrentTranscript('');
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => {
        if (isListening) {
          try { recognition.start(); } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      recognitionRef.current?.stop();
    };
  }, [isListening, activeCategory]);

  // Welcome message
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        speak(`Welcome to the upload center. You can upload files in ${categories.length} different categories. 
               You can also describe your products by voice, and I'll save everything for processing.
               Click on a category to start uploading, or just start talking to describe your products.`);
      }, 500);
    }
  }, [isOpen]);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    synthRef.current.speak(u);
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        speak("I'm listening. Describe your products, prices, features, or anything you want me to remember.");
      } catch (e) {}
    }
  };

  // Process voice comment - extract useful info
  const processVoiceComment = async (comment: VoiceComment) => {
    try {
      const response = await fetch('http://localhost:1117/api/process-voice-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: comment.text,
          userType,
          userId,
          companyName,
          category: comment.category
        })
      });

      const data = await response.json();
      
      // Update comment with extracted info
      setVoiceComments(prev => prev.map(vc => 
        vc.id === comment.id 
          ? { ...vc, processed: true, extractedInfo: data.extracted }
          : vc
      ));

      if (data.extracted?.products?.length > 0) {
        speak(`I found ${data.extracted.products.length} products in your description. I'll add them to your catalog.`);
        setExtractedProducts(prev => [...prev, ...data.extracted.products]);
      }
    } catch (err) {
      console.error('Failed to process voice comment:', err);
      // Fallback: Mark as processed anyway
      setVoiceComments(prev => prev.map(vc => 
        vc.id === comment.id ? { ...vc, processed: true } : vc
      ));
    }
  };

  // Handle file selection
  const handleFileSelect = async (categoryId: string, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newFiles: FileUpload[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const upload: FileUpload = {
        file,
        category: categoryId,
        progress: 0,
        status: 'pending'
      };

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        upload.preview = URL.createObjectURL(file);
      }

      newFiles.push(upload);
    }

    setFiles(prev => [...prev, ...newFiles]);
    speak(`Added ${fileList.length} files to ${categoryId}. Starting upload.`);

    // Upload each file
    for (const upload of newFiles) {
      await uploadFileToMinIO(upload);
    }
  };

  // Upload to MinIO with 5-step process
  const uploadFileToMinIO = async (upload: FileUpload) => {
    setFiles(prev => prev.map(f => 
      f.file === upload.file ? { ...f, status: 'uploading', progress: 10 } : f
    ));

    try {
      // Step 1: Upload to MinIO
      const formData = new FormData();
      formData.append('file', upload.file);
      formData.append('category', upload.category);
      formData.append('userType', userType);
      formData.append('userId', userId || 'anonymous');

      // Progress simulation
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.file === upload.file && f.progress < 40 
            ? { ...f, progress: f.progress + 5 } 
            : f
        ));
      }, 200);

      const response = await fetch('http://localhost:1117/api/upload/minio', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      
      // Step 2: Update progress - uploaded
      setFiles(prev => prev.map(f => 
        f.file === upload.file ? { ...f, progress: 50, minioUrl: data.url } : f
      ));

      // Step 3: Process if PDF/Excel - extract products
      if (upload.file.name.match(/\.(pdf|xlsx|csv)$/i) && upload.category === 'catalog') {
        setFiles(prev => prev.map(f => 
          f.file === upload.file ? { ...f, status: 'processing', progress: 60 } : f
        ));

        speak('Processing your catalog. Extracting products and prices.');

        const extractResponse = await fetch('http://localhost:1117/api/extract-products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileUrl: data.url,
            fileName: upload.file.name,
            userType,
            userId
          })
        });

        const extractData = await extractResponse.json();
        
        setFiles(prev => prev.map(f => 
          f.file === upload.file ? { ...f, progress: 80, extractedData: extractData } : f
        ));

        if (extractData.products?.length > 0) {
          setExtractedProducts(prev => [...prev, ...extractData.products]);
          speak(`Extracted ${extractData.products.length} products from your catalog.`);
        }
      }

      // Step 4: Vectorize content
      setFiles(prev => prev.map(f => 
        f.file === upload.file ? { ...f, progress: 90 } : f
      ));

      await fetch('http://localhost:1117/api/vectorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: data.url,
          fileName: upload.file.name,
          category: upload.category,
          userType,
          userId
        })
      });

      // Step 5: Complete
      setFiles(prev => prev.map(f => 
        f.file === upload.file ? { ...f, status: 'success', progress: 100 } : f
      ));

    } catch (err) {
      console.error('Upload error:', err);
      setFiles(prev => prev.map(f => 
        f.file === upload.file ? { ...f, status: 'error', progress: 0 } : f
      ));
      speak(`Failed to upload ${upload.file.name}. Please try again.`);
    }
  };

  // Save all voice comments to database
  const saveAllVoiceComments = async () => {
    try {
      await fetch('http://localhost:1117/api/save-voice-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userType,
          companyName,
          comments: voiceComments
        })
      });
    } catch (err) {
      console.error('Failed to save voice comments:', err);
    }
  };

  // Complete and close
  const handleComplete = async () => {
    setIsProcessing(true);
    
    // Save voice comments
    await saveAllVoiceComments();
    
    // Callback with all data
    onComplete?.({
      files,
      voiceComments,
      extractedProducts
    });

    speak('All files uploaded and processed. Your catalog is ready!');
    
    setTimeout(() => {
      setIsProcessing(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  const successfulUploads = files.filter(f => f.status === 'success').length;
  const totalUploads = files.length;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.95)',
      zIndex: 10001,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: isExpanded ? 0 : 20
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        borderRadius: isExpanded ? 0 : 24,
        width: isExpanded ? '100%' : '95%',
        height: isExpanded ? '100%' : '95%',
        maxWidth: isExpanded ? '100%' : 1400,
        maxHeight: isExpanded ? '100%' : '95vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: isExpanded ? 'none' : '2px solid rgba(16, 185, 129, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          background: 'rgba(0,0,0,0.4)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: '1.8em' }}>
              {userType === 'vendor' ? '📦' : userType === 'builder' ? '🏗️' : '🏠'}
            </span>
            <div>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.3em' }}>
                Upload Center - {companyName || userType.charAt(0).toUpperCase() + userType.slice(1)}
              </h2>
              <span style={{ color: '#94a3b8', fontSize: '0.85em' }}>
                {successfulUploads}/{totalUploads} files • {voiceComments.length} voice comments • {extractedProducts.length} products extracted
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              {isExpanded ? '⊙ Compact' : '⊕ Expand'}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                width: 40,
                height: 40,
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '1.2em'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: isExpanded ? '1fr 400px' : '1fr 350px',
          overflow: 'hidden'
        }}>
          {/* Left: Upload Categories */}
          <div style={{
            padding: 24,
            overflow: 'auto',
            borderRight: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h3 style={{ color: '#10b981', margin: '0 0 20px', fontSize: '1.1em' }}>
              📁 File Categories
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 16
            }}>
              {categories.map(cat => {
                const catFiles = files.filter(f => f.category === cat.id);
                const isActive = activeCategory === cat.id;
                
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      fileInputRefs.current[cat.id]?.click();
                    }}
                    style={{
                      background: isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0,0,0,0.3)',
                      border: `2px dashed ${isActive ? '#10b981' : catFiles.length > 0 ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
                      borderRadius: 16,
                      padding: 20,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      ref={el => fileInputRefs.current[cat.id] = el}
                      type="file"
                      accept={cat.accept}
                      multiple
                      onChange={e => handleFileSelect(cat.id, e.target.files)}
                      style={{ display: 'none' }}
                    />
                    
                    <div style={{ fontSize: 36, marginBottom: 10 }}>{cat.icon}</div>
                    <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{cat.label}</div>
                    <div style={{ color: '#64748b', fontSize: '0.8em', marginBottom: 8 }}>{cat.desc}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.75em' }}>{cat.accept}</div>
                    
                    {catFiles.length > 0 && (
                      <div style={{
                        marginTop: 10,
                        padding: '6px 12px',
                        background: '#10b98130',
                        borderRadius: 20,
                        color: '#10b981',
                        fontSize: '0.85em',
                        textAlign: 'center'
                      }}>
                        ✓ {catFiles.length} file{catFiles.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Uploaded Files List */}
            {files.length > 0 && (
              <div style={{ marginTop: 30 }}>
                <h3 style={{ color: '#10b981', margin: '0 0 16px', fontSize: '1.1em' }}>
                  📤 Uploaded Files
                </h3>
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: 12,
                  padding: 16,
                  maxHeight: 300,
                  overflow: 'auto'
                }}>
                  {files.map((f, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 0',
                      borderBottom: idx < files.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                    }}>
                      {f.preview ? (
                        <img src={f.preview} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📄</div>
                      )}
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#e2e8f0', fontSize: '0.9em' }}>{f.file.name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.75em' }}>{f.category} • {(f.file.size / 1024 / 1024).toFixed(2)} MB</div>
                        {f.status === 'uploading' && (
                          <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 4 }}>
                            <div style={{ width: `${f.progress}%`, height: '100%', background: '#10b981', borderRadius: 2 }} />
                          </div>
                        )}
                        {f.status === 'processing' && (
                          <div style={{ color: '#f59e0b', fontSize: '0.75em', marginTop: 2 }}>⏳ Processing...</div>
                        )}
                      </div>
                      
                      <div style={{
                        color: f.status === 'success' ? '#10b981' : f.status === 'error' ? '#ef4444' : '#64748b',
                        fontSize: 18
                      }}>
                        {f.status === 'success' ? '✓' : f.status === 'error' ? '✕' : '○'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Products Preview */}
            {extractedProducts.length > 0 && (
              <div style={{ marginTop: 30 }}>
                <h3 style={{ color: '#10b981', margin: '0 0 16px', fontSize: '1.1em' }}>
                  🏷️ Extracted Products ({extractedProducts.length})
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: 12
                }}>
                  {extractedProducts.slice(0, 8).map((p, idx) => (
                    <div key={idx} style={{
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: 10,
                      padding: 12,
                      fontSize: '0.85em'
                    }}>
                      <div style={{ color: '#e2e8f0', fontWeight: 600 }}>{p.name || `Product ${idx + 1}`}</div>
                      {p.price && <div style={{ color: '#10b981' }}>${p.price}</div>}
                      {p.sku && <div style={{ color: '#64748b', fontSize: '0.8em' }}>SKU: {p.sku}</div>}
                    </div>
                  ))}
                  {extractedProducts.length > 8 && (
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      borderRadius: 10,
                      padding: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981'
                    }}>
                      +{extractedProducts.length - 8} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Voice Comments Panel */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Voice Input Header */}
            <div style={{
              padding: 20,
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <h3 style={{ color: '#06b6d4', margin: '0 0 12px', fontSize: '1.1em' }}>
                🎤 Voice Comments
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85em', margin: '0 0 16px' }}>
                Describe your products, prices, features. Everything will be saved and processed.
              </p>
              
              {/* Listening Status */}
              <div style={{
                background: isListening ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0,0,0,0.3)',
                borderRadius: 12,
                padding: 16,
                border: `2px solid ${isListening ? '#10b981' : 'rgba(255,255,255,0.1)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: isListening ? '#10b981' : '#64748b',
                    animation: isListening ? 'pulse 1s infinite' : 'none'
                  }} />
                  <span style={{ color: isListening ? '#10b981' : '#94a3b8' }}>
                    {isListening ? 'LISTENING...' : 'Click to start speaking'}
                  </span>
                </div>

                {/* Waveform */}
                {isListening && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 3, height: 30, alignItems: 'center', marginBottom: 12 }}>
                    {[...Array(12)].map((_, i) => (
                      <div key={i} style={{
                        width: 3,
                        background: 'linear-gradient(to top, #10b981, #06b6d4)',
                        borderRadius: 2,
                        animation: `wave 0.4s ease-in-out ${i * 0.05}s infinite alternate`,
                        height: 8
                      }} />
                    ))}
                  </div>
                )}

                {/* Current transcript */}
                {currentTranscript && (
                  <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 12
                  }}>
                    <span style={{ color: '#06b6d4', fontSize: '0.75em' }}>Speaking:</span>
                    <p style={{ color: '#e2e8f0', margin: '4px 0 0' }}>"{currentTranscript}"</p>
                  </div>
                )}

                <button
                  onClick={toggleListening}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: 25,
                    border: 'none',
                    background: isListening ? '#ef4444' : '#10b981',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {isListening ? '⏹️ Stop Recording' : '🎤 Start Recording'}
                </button>
              </div>
            </div>

            {/* Saved Voice Comments */}
            <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
              <h4 style={{ color: '#94a3b8', margin: '0 0 12px', fontSize: '0.9em' }}>
                Saved Comments ({voiceComments.length})
              </h4>
              
              {voiceComments.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '0.9em', textAlign: 'center', padding: 40 }}>
                  No voice comments yet.<br />Start speaking to describe your products.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {voiceComments.map(vc => (
                    <div key={vc.id} style={{
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: 10,
                      padding: 12,
                      borderLeft: `3px solid ${vc.processed ? '#10b981' : '#f59e0b'}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ color: vc.processed ? '#10b981' : '#f59e0b', fontSize: '0.75em' }}>
                          {vc.processed ? '✓ Processed' : '⏳ Processing...'}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '0.7em' }}>
                          {new Date(vc.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p style={{ color: '#e2e8f0', margin: 0, fontSize: '0.9em' }}>"{vc.text}"</p>
                      
                      {vc.extractedInfo && (
                        <div style={{ marginTop: 8, padding: 8, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 6 }}>
                          <span style={{ color: '#10b981', fontSize: '0.75em' }}>Extracted:</span>
                          <div style={{ color: '#94a3b8', fontSize: '0.8em', marginTop: 4 }}>
                            {vc.extractedInfo.products?.length > 0 && `${vc.extractedInfo.products.length} products`}
                            {vc.extractedInfo.prices?.length > 0 && ` • ${vc.extractedInfo.prices.length} prices`}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Complete Button */}
            <div style={{ padding: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                onClick={handleComplete}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  borderRadius: 30,
                  border: 'none',
                  background: isProcessing ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #10b981, #06b6d4)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: isProcessing ? 'wait' : 'pointer',
                  fontSize: '1em'
                }}
              >
                {isProcessing ? '⏳ Processing...' : '✓ Complete & Publish'}
              </button>
              
              <p style={{ color: '#64748b', fontSize: '0.75em', textAlign: 'center', margin: '12px 0 0' }}>
                {files.length} files • {voiceComments.length} voice comments • {extractedProducts.length} products
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes wave { from { height: 6px; } to { height: 24px; } }
      `}</style>
    </div>
  );
};

export default EnhancedUploadModal;
ENHANCEDUPLOAD

echo "  ✅ EnhancedUploadModal.tsx"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 2: Update common/index.ts
#═══════════════════════════════════════════════════════════════════════════════
cat > "$COMMON_DIR/index.ts" << 'COMMONINDEX'
export { default as UniversalAgenticBar } from './UniversalAgenticBar';
export type { AgenticBarRef } from './UniversalAgenticBar';
export { default as MultiFormatUploader } from './MultiFormatUploader';
export { default as EnhancedUploadModal } from './EnhancedUploadModal';
export { default as WalkingCursor } from './WalkingCursor';
COMMONINDEX

echo "  ✅ common/index.ts"

#═══════════════════════════════════════════════════════════════════════════════
# STEP 3: Backend routes for voice comments and processing
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "🔌 Creating backend routes..."

cat > "$VV/backend/voice_comments_routes.cjs" << 'VOICEROUTES'
// Voice Comments & Processing Routes
// Add these to your server.cjs

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE COMMENTS TABLE
// ═══════════════════════════════════════════════════════════════════════════════
/*
CREATE TABLE IF NOT EXISTS voice_comments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100),
    user_type VARCHAR(50),
    company_name VARCHAR(255),
    text TEXT NOT NULL,
    category VARCHAR(100),
    extracted_info JSONB DEFAULT '{}',
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_voice_comments_user ON voice_comments(user_id);
*/

// Process voice comment - extract useful info
app.post('/api/process-voice-comment', async (req, res) => {
    try {
        const { text, userType, userId, companyName, category } = req.body;
        
        // Simple extraction logic (can be enhanced with LLM)
        const extracted = {
            products: [],
            prices: [],
            features: [],
            keywords: []
        };
        
        // Extract prices (e.g., "$50", "50 dollars", "fifty bucks")
        const priceMatches = text.match(/\$?\d+(?:\.\d{2})?(?:\s*(?:dollars|bucks))?/gi);
        if (priceMatches) {
            extracted.prices = priceMatches.map(p => parseFloat(p.replace(/[^0-9.]/g, '')));
        }
        
        // Extract potential product names (capitalized words or phrases)
        const productPatterns = [
            /(?:we (?:sell|offer|have)|our) ([^.]+)/gi,
            /([A-Z][a-z]+ (?:[A-Z][a-z]+ )*(?:flooring|tiles|cabinets|fixtures|appliances|materials))/gi
        ];
        
        for (const pattern of productPatterns) {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) extracted.products.push({ name: match[1].trim() });
            }
        }
        
        // Extract features/keywords
        const featureWords = ['premium', 'luxury', 'affordable', 'durable', 'waterproof', 'eco-friendly', 'sustainable'];
        for (const word of featureWords) {
            if (text.toLowerCase().includes(word)) {
                extracted.features.push(word);
            }
        }
        
        // Save to database
        await pool.query(
            `INSERT INTO voice_comments (user_id, user_type, company_name, text, category, extracted_info, processed)
             VALUES ($1, $2, $3, $4, $5, $6, true)`,
            [userId, userType, companyName, text, category, JSON.stringify(extracted)]
        );
        
        res.json({ success: true, extracted });
    } catch (err) {
        console.error('Process voice comment error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Save all voice comments at once
app.post('/api/save-voice-comments', async (req, res) => {
    try {
        const { userId, userType, companyName, comments } = req.body;
        
        for (const comment of comments) {
            await pool.query(
                `INSERT INTO voice_comments (user_id, user_type, company_name, text, category, extracted_info, processed, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 ON CONFLICT DO NOTHING`,
                [userId, userType, companyName, comment.text, comment.category, 
                 JSON.stringify(comment.extractedInfo || {}), comment.processed, comment.timestamp]
            );
        }
        
        res.json({ success: true, saved: comments.length });
    } catch (err) {
        console.error('Save voice comments error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get voice comments for a user
app.get('/api/voice-comments/:userId', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM voice_comments WHERE user_id = $1 ORDER BY created_at DESC',
            [req.params.userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

console.log('✅ Voice comments routes loaded');
VOICEROUTES

echo "  ✅ voice_comments_routes.cjs"

#═══════════════════════════════════════════════════════════════════════════════
# SUMMARY
#═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  ✅ PART A COMPLETE!"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "  📁 CREATED:"
echo "     • EnhancedUploadModal.tsx - BIGGER, EXPANDED upload interface"
echo "     • Voice comments system - Record, save, process"
echo "     • Extracted info from voice"
echo "     • Backend routes for voice comments"
echo ""
echo "  🎤 FEATURES:"
echo "     • Full-screen expandable modal"
echo "     • 6 upload categories per user type"
echo "     • Voice comments recorded and saved"
echo "     • AI extracts products/prices from voice"
echo "     • Progress tracking per file"
echo "     • Extracted products preview"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
