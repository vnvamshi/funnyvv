import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Props {
  onFileSelect: (file: File) => void;
  onProductsExtracted: (products: any[]) => void;
  speak: (t: string) => void;
}

const THEME = { primary: '#1e3a5f', accent: '#f59e0b' };

const BuilderUpload: React.FC<Props> = ({ onFileSelect, onProductsExtracted, speak }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    speak("Upload your portfolio. You can upload project photos, floor plans, or documents. Say upload to select a file.");
    setTimeout(() => startListening(), 1500);
  }, []);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event: any) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; i++) text += event.results[i][0].transcript;
        setTranscript(text);
        if (event.results[event.resultIndex].isFinal) {
          const lower = text.toLowerCase();
          if (lower.includes('upload') || lower.includes('select') || lower.includes('choose')) {
            fileInputRef.current?.click();
          }
        }
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => { if (isListening) recognitionRef.current?.start(); };
    }
    return () => recognitionRef.current?.stop();
  }, [isListening]);

  const startListening = () => { try { recognitionRef.current?.start(); setIsListening(true); } catch (e) {} };
  const toggleListening = () => { if (isListening) { recognitionRef.current?.stop(); setIsListening(false); } else { startListening(); } };

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true); setStatus('uploading'); setProgress(10); setFileName(file.name);
    speak(`Uploading ${file.name}`);
    onFileSelect(file);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setProgress(30);
      const response = await fetch('http://localhost:1117/api/upload/pdf', { method: 'POST', body: formData });
      setProgress(70);
      const data = await response.json();
      setProgress(100);
      setStatus('success');
      onProductsExtracted(data.products || []);
      speak("Upload successful!");
    } catch (err) {
      setStatus('error');
      speak("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '2.5em' }}>📁</span>
        <h3 style={{ color: THEME.accent, margin: '10px 0 5px' }}>Upload Portfolio</h3>
        <p style={{ color: '#888', fontSize: '0.9em' }}>Project photos, floor plans, documents</p>
      </div>

      <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} style={{ display: 'none' }} />

      <div onClick={() => !uploading && fileInputRef.current?.click()} style={{
        border: `2px dashed ${status === 'success' ? '#10b981' : status === 'error' ? '#ef4444' : THEME.accent}40`,
        borderRadius: 16, padding: '40px 20px', textAlign: 'center', cursor: uploading ? 'wait' : 'pointer', background: 'rgba(0,0,0,0.2)'
      }}>
        {status === 'idle' && (<><div style={{ fontSize: '3em', marginBottom: 15 }}>📁</div><p style={{ color: '#e2e8f0' }}>Click or say "upload" to select files</p></>)}
        {status === 'uploading' && (<><div style={{ fontSize: '2.5em', marginBottom: 15 }}>📤</div><p style={{ color: '#06b6d4' }}>Uploading {fileName}... {progress}%</p><div style={{ height: 8, background: 'rgba(0,0,0,0.3)', borderRadius: 4, maxWidth: 300, margin: '10px auto' }}><div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg, ${THEME.accent}, #06b6d4)`, borderRadius: 4 }} /></div></>)}
        {status === 'success' && (<><div style={{ fontSize: '2.5em', marginBottom: 15 }}>✅</div><p style={{ color: '#10b981' }}>Upload successful!</p><p style={{ color: '#e2e8f0' }}>{fileName}</p></>)}
        {status === 'error' && (<><div style={{ fontSize: '2.5em', marginBottom: 15 }}>❌</div><p style={{ color: '#ef4444' }}>Upload failed</p></>)}
      </div>

      {/* AgenticBar */}
      <div style={{ marginTop: 10, padding: 16, background: 'rgba(0,0,0,0.3)', borderRadius: 16, border: `2px solid ${isListening ? '#10b981' : 'rgba(255,255,255,0.1)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: isListening ? '#10b981' : '#64748b', animation: isListening ? 'pulse 1s infinite' : 'none' }} />
          <span style={{ color: '#06b6d4', fontSize: '0.9em' }}>🎤 {isListening ? 'LISTENING' : 'READY'}</span>
        </div>
        {isListening && (<div style={{ display: 'flex', justifyContent: 'center', gap: 3, height: 25, alignItems: 'center', marginBottom: 10 }}>{[...Array(12)].map((_, i) => (<div key={i} style={{ width: 3, background: 'linear-gradient(to top, #10b981, #06b6d4)', borderRadius: 2, animation: `wave 0.4s ease-in-out ${i * 0.05}s infinite alternate`, height: 8 }} />))}</div>)}
        {transcript && (<div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}><p style={{ color: '#e2e8f0', margin: 0 }}>"{transcript}"</p></div>)}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          <button onClick={toggleListening} style={{ padding: '10px 24px', borderRadius: 25, border: 'none', background: isListening ? '#ef4444' : '#10b981', color: 'white', fontWeight: 600, cursor: 'pointer' }}>{isListening ? '⏹️ Stop' : '🎤 Listen'}</button>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.75em', textAlign: 'center', margin: '12px 0 0' }}>💡 Say: "upload" • "select file"</p>
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } @keyframes wave { from { height: 6px; } to { height: 20px; } }`}</style>
    </div>
  );
};

export default BuilderUpload;
