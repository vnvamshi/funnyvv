// ═══════════════════════════════════════════════════════════════════════════════
// AI Stats Widget v7.0 - Fetches LIVE stats from API
// ═══════════════════════════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:1117/api';

interface AIStats {
  interactions: number;
  patterns: number;
  webCrawls: number;
  confidence: number;
}

const AIStatsWidget: React.FC = () => {
  const [stats, setStats] = useState<AIStats>({
    interactions: 0,
    patterns: 0,
    webCrawls: 0,
    confidence: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/ai/training/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setError(false);
      } else {
        setError(true);
      }
    } catch (e) {
      console.error('[AIStatsWidget] Fetch error:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', gap: '16px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px' }}>
        <span style={{ color: '#888' }}>Loading stats...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', gap: '16px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px' }}>
        <span style={{ color: '#ff6b6b' }}>⚠️ Backend offline</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '16px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', flexWrap: 'wrap' }}>
      <StatItem icon="💬" value={stats.interactions.toLocaleString()} label="interactions" />
      <StatItem icon="🎯" value={stats.patterns.toString()} label="patterns" />
      <StatItem icon="🌐" value={stats.webCrawls.toString()} label="web crawls" />
      <StatItem icon="📈" value={`${stats.confidence}%`} label="confidence" />
    </div>
  );
};

const StatItem: React.FC<{ icon: string; value: string; label: string }> = ({ icon, value, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <span>{icon}</span>
    <span style={{ color: '#B8860B', fontWeight: 600 }}>{value}</span>
    <span style={{ color: '#888', fontSize: '0.85em' }}>{label}</span>
  </div>
);

export default AIStatsWidget;
