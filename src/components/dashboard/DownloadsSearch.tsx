import React, { useState, useCallback, useRef, useEffect } from 'react';

interface DownloadFile {
  name: string;
  path: string;
  size: number;
  modified: string;
  extension: string;
  type: string;
  score?: number;
}

interface DownloadsSearchProps {
  onFileSelect?: (file: DownloadFile) => void;
  onFileUpload?: (file: DownloadFile) => void;
}

const DownloadsSearch: React.FC<DownloadsSearchProps> = ({
  onFileSelect,
  onFileUpload
}) => {
  const [files, setFiles] = useState<DownloadFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<DownloadFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedFile, setSelectedFile] = useState<DownloadFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Fetch downloads
  const fetchDownloads = async (filter?: string) => {
    setIsLoading(true);
    try {
      const url = filter 
        ? `http://localhost:1117/api/downloads?filter=${encodeURIComponent(filter)}`
        : 'http://localhost:1117/api/downloads';
      const response = await fetch(url);
      const data = await response.json();
      setFiles(data.files || []);
      setFilteredFiles(data.files || []);
    } catch (err) {
      console.error('Failed to fetch downloads:', err);
      setMessage('Could not access Downloads folder. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDownloads();
  }, []);

  // Speech setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    synthRef.current = window.speechSynthesis;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SR) {
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setTranscript(text);
        
        if (event.results[event.resultIndex].isFinal) {
          handleVoiceSearch(text);
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
  }, [isListening]);

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
        speak("Tell me the name of the file you want to upload from your Downloads folder.");
      } catch (e) {}
    }
  };

  // Voice search for file
  const handleVoiceSearch = async (text: string) => {
    const lower = text.toLowerCase();
    
    // Upload command
    if (lower.includes('upload') && selectedFile) {
      speak(`Uploading ${selectedFile.name}`);
      onFileUpload?.(selectedFile);
      return;
    }
    
    // Search command
    try {
      const response = await fetch('http://localhost:1117/api/downloads/voice-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      });
      
      const data = await response.json();
      
      if (data.matches && data.matches.length > 0) {
        setFilteredFiles(data.matches);
        setSelectedFile(data.bestMatch);
        
        speak(`Found ${data.matches.length} matching files. Best match is ${data.bestMatch.name}. Say upload to upload it.`);
      } else {
        speak("No matching files found. Try saying the file name again.");
        setFilteredFiles([]);
      }
    } catch (err) {
      // Fallback: client-side search
      const query = lower.replace(/find|get|upload|the|file|called|named/g, '').trim();
      const matches = files.filter(f => 
        f.name.toLowerCase().includes(query)
      );
      
      if (matches.length > 0) {
        setFilteredFiles(matches);
        setSelectedFile(matches[0]);
        speak(`Found ${matches.length} files. ${matches[0].name} is the best match.`);
      } else {
        speak("No matching files found.");
      }
    }
  };

  // Filter files
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredFiles(files);
      return;
    }
    
    const q = query.toLowerCase();
    const filtered = files.filter(f => 
      f.name.toLowerCase().includes(q) ||
      f.type.toLowerCase().includes(q)
    );
    setFilteredFiles(filtered);
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      'PDF Document': '📄',
      'Excel Spreadsheet': '📊',
      'CSV Data': '📋',
      'Word Document': '📝',
      'Image': '🖼️',
      'Video': '🎬',
      'CAD Drawing': '📐',
      '3D Model': '🧊',
      'Archive': '📦'
    };
    return icons[type] || '📁';
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a, #1e293b)',
      borderRadius: 20,
      padding: 24,
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
      }}>
        <div>
          <h3 style={{ color: '#fff', margin: 0, fontSize: '1.2em' }}>📂 Downloads Folder</h3>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '0.85em' }}>
            {files.length} files • Say file name to find it
          </p>
        </div>
        
        <button
          onClick={toggleListening}
          style={{
            padding: '10px 20px',
            borderRadius: 20,
            border: 'none',
            background: isListening ? '#ef4444' : '#10b981',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {isListening ? '⏹️ Stop' : '🎤 Voice Search'}
        </button>
      </div>

      {/* Search input */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search files..."
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(0,0,0,0.3)',
            color: '#fff',
            fontSize: '1em'
          }}
        />
      </div>

      {/* Voice transcript */}
      {transcript && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: 10,
          padding: 12,
          marginBottom: 16
        }}>
          <span style={{ color: '#10b981', fontSize: '0.8em' }}>🎤 Searching:</span>
          <p style={{ color: '#e2e8f0', margin: '4px 0 0' }}>"{transcript}"</p>
        </div>
      )}

      {/* Selected file */}
      {selectedFile && (
        <div style={{
          background: 'rgba(6, 182, 212, 0.2)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          border: '2px solid #06b6d4'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>{getIcon(selectedFile.type)}</span>
              <div>
                <div style={{ color: '#e2e8f0', fontWeight: 600 }}>{selectedFile.name}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.85em' }}>{selectedFile.type} • {formatSize(selectedFile.size)}</div>
              </div>
            </div>
            
            <button
              onClick={() => onFileUpload?.(selectedFile)}
              style={{
                padding: '10px 24px',
                borderRadius: 20,
                border: 'none',
                background: '#06b6d4',
                color: '#000',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              📤 Upload This
            </button>
          </div>
        </div>
      )}

      {/* File list */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <span style={{ fontSize: 30 }}>⏳</span>
          <p style={{ color: '#94a3b8' }}>Scanning downloads...</p>
        </div>
      ) : (
        <div style={{
          maxHeight: 300,
          overflow: 'auto',
          borderRadius: 12,
          background: 'rgba(0,0,0,0.2)'
        }}>
          {filteredFiles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30 }}>
              <p style={{ color: '#64748b' }}>No files found</p>
            </div>
          ) : (
            filteredFiles.map((file, idx) => (
              <div
                key={idx}
                onClick={() => { setSelectedFile(file); onFileSelect?.(file); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: selectedFile?.name === file.name ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = selectedFile?.name === file.name ? 'rgba(6, 182, 212, 0.1)' : 'transparent'}
              >
                <span style={{ fontSize: 24 }}>{getIcon(file.type)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#e2e8f0', fontSize: '0.9em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.75em' }}>
                    {file.type} • {formatSize(file.size)}
                  </div>
                </div>
                {file.score && file.score > 0 && (
                  <span style={{
                    background: '#10b98130',
                    color: '#10b981',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: '0.7em'
                  }}>
                    Match
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {message && (
        <div style={{
          marginTop: 16,
          padding: 12,
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: 8,
          color: '#ef4444',
          fontSize: '0.85em'
        }}>
          ⚠️ {message}
        </div>
      )}
    </div>
  );
};

export default DownloadsSearch;
