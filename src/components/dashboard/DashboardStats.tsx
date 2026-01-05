import React, { useState, useEffect, useCallback, useRef } from 'react';

interface DashboardStats {
  vendors: number;
  builders: number;
  agents: number;
  products: number;
  properties: number;
  uploads: number;
  voiceComments: number;
  recentUploads: any[];
  recentProducts: any[];
  recentProperties: any[];
}

const DashboardStatsComponent: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    vendors: 0,
    builders: 0,
    agents: 0,
    products: 0,
    properties: 0,
    uploads: 0,
    voiceComments: 0,
    recentUploads: [],
    recentProducts: [],
    recentProperties: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:1117/api/dashboard/stats');
      const data = await response.json();
      setStats(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      // Demo data
      setStats({
        vendors: 12,
        builders: 8,
        agents: 15,
        products: 156,
        properties: 42,
        uploads: 234,
        voiceComments: 89,
        recentUploads: [],
        recentProducts: [],
        recentProperties: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
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
          handleVoiceCommand(text);
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
        speak("Ask me about your dashboard stats.");
      } catch (e) {}
    }
  };

  const handleVoiceCommand = (text: string) => {
    const lower = text.toLowerCase();
    
    if (lower.includes('vendor') || lower.includes('vendors')) {
      speak(`You have ${stats.vendors} registered vendors.`);
    }
    else if (lower.includes('builder') || lower.includes('builders')) {
      speak(`You have ${stats.builders} registered builders.`);
    }
    else if (lower.includes('agent') || lower.includes('agents')) {
      speak(`You have ${stats.agents} registered agents.`);
    }
    else if (lower.includes('product') || lower.includes('products')) {
      speak(`There are ${stats.products} products in your catalog.`);
    }
    else if (lower.includes('property') || lower.includes('properties') || lower.includes('listing')) {
      speak(`There are ${stats.properties} property listings.`);
    }
    else if (lower.includes('upload') || lower.includes('file')) {
      speak(`${stats.uploads} files have been uploaded.`);
    }
    else if (lower.includes('voice') || lower.includes('comment')) {
      speak(`${stats.voiceComments} voice comments have been recorded.`);
    }
    else if (lower.includes('refresh') || lower.includes('update')) {
      fetchStats();
      speak("Refreshing dashboard stats.");
    }
    else if (lower.includes('summary') || lower.includes('overview') || lower.includes('total')) {
      speak(`Dashboard summary: ${stats.vendors} vendors, ${stats.builders} builders, ${stats.agents} agents, ${stats.products} products, and ${stats.properties} properties.`);
    }
    else {
      speak("You can ask about vendors, builders, agents, products, properties, or uploads.");
    }
  };

  const statCards = [
    { label: 'Vendors', value: stats.vendors, icon: '📦', color: '#B8860B' },
    { label: 'Builders', value: stats.builders, icon: '🏗️', color: '#f59e0b' },
    { label: 'Agents', value: stats.agents, icon: '🏠', color: '#10b981' },
    { label: 'Products', value: stats.products, icon: '🏷️', color: '#06b6d4' },
    { label: 'Properties', value: stats.properties, icon: '🏘️', color: '#8b5cf6' },
    { label: 'Uploads', value: stats.uploads, icon: '📤', color: '#ec4899' },
    { label: 'Voice Comments', value: stats.voiceComments, icon: '🎤', color: '#14b8a6' },
  ];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a, #1e293b)',
      borderRadius: 20,
      padding: 24,
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <div>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '1.5em' }}>📊 Dashboard</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '0.85em' }}>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={fetchStats}
            style={{
              padding: '10px 20px',
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh
          </button>
          
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
            {isListening ? '⏹️ Stop' : '🎤 Ask'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <span style={{ fontSize: 30 }}>⏳</span>
          <p style={{ color: '#94a3b8' }}>Loading stats...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 16
        }}>
          {statCards.map(card => (
            <div
              key={card.label}
              style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 16,
                padding: 20,
                border: `1px solid ${card.color}30`,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = card.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = `${card.color}30`}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>{card.icon}</div>
              <div style={{ color: card.color, fontSize: '2em', fontWeight: 700 }}>
                {card.value.toLocaleString()}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.9em' }}>{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Voice Transcript */}
      {transcript && (
        <div style={{
          marginTop: 20,
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 12,
          padding: 16,
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <span style={{ color: '#10b981', fontSize: '0.8em' }}>🎤 You said:</span>
          <p style={{ color: '#e2e8f0', margin: '4px 0 0' }}>"{transcript}"</p>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
};

export default DashboardStatsComponent;
