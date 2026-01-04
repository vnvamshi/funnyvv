import React, { useState, useCallback } from 'react';
import VoiceTeleprompter from '../shared/VoiceTeleprompter';

const THEME = { gold: '#B8860B', teal: '#004236' };

const STYLES = [
  { id: 'modern', name: 'Modern', icon: '🏢', desc: 'Clean lines, minimal' },
  { id: 'traditional', name: 'Traditional', icon: '🏛️', desc: 'Classic elegance' },
  { id: 'minimalist', name: 'Minimalist', icon: '⬜', desc: 'Less is more' },
  { id: 'industrial', name: 'Industrial', icon: '🏭', desc: 'Raw materials' },
  { id: 'bohemian', name: 'Bohemian', icon: '🎨', desc: 'Eclectic, colorful' },
  { id: 'scandinavian', name: 'Scandinavian', icon: '❄️', desc: 'Light and cozy' },
];

const ROOMS = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office'];

interface Props { isOpen: boolean; onClose: () => void; }

const InteriorDesignPage: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const handleVoice = useCallback((cmd: string) => {
    const style = STYLES.find(s => cmd.includes(s.name.toLowerCase()));
    if (style) setSelectedStyle(style.id);
    const room = ROOMS.find(r => cmd.includes(r.toLowerCase().split(' ')[0]));
    if (room) setSelectedRoom(room);
    if (cmd.includes('close')) onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#f5f5f5', zIndex: 9998, overflow: 'auto' }}>
      <div style={{ background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`, padding: '30px 20px', textAlign: 'center', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
        <h1 style={{ color: '#fff', margin: '0 0 8px' }}>🎨 Interior Design</h1>
        <p style={{ color: '#F5EC9B', margin: 0 }}>AI-powered design inspiration</p>
      </div>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' }}>
        <h2 style={{ color: '#333', marginBottom: '16px' }}>Choose Your Style</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '30px' }}>
          {STYLES.map(s => (
            <div key={s.id} onClick={() => setSelectedStyle(s.id)} style={{ background: selectedStyle === s.id ? THEME.gold : '#fff', color: selectedStyle === s.id ? '#fff' : '#333', borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <span style={{ fontSize: '2em' }}>{s.icon}</span>
              <p style={{ margin: '8px 0 4px', fontWeight: 500 }}>{s.name}</p>
              <p style={{ margin: 0, fontSize: '0.75em', opacity: 0.8 }}>{s.desc}</p>
            </div>
          ))}
        </div>
        <h2 style={{ color: '#333', marginBottom: '16px' }}>Select Room</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
          {ROOMS.map(r => (
            <button key={r} onClick={() => setSelectedRoom(r)} style={{ padding: '10px 20px', borderRadius: '25px', border: 'none', background: selectedRoom === r ? THEME.gold : '#fff', color: selectedRoom === r ? '#fff' : '#333', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>{r}</button>
          ))}
        </div>
        {selectedStyle && selectedRoom && (
          <div style={{ textAlign: 'center' }}>
            <button style={{ padding: '16px 40px', background: `linear-gradient(135deg, ${THEME.gold}, #D4A84B)`, color: '#fff', border: 'none', borderRadius: '30px', cursor: 'pointer', fontSize: '1.1em', fontWeight: 600 }}>✨ Generate Design Ideas</button>
          </div>
        )}
      </div>
      <VoiceTeleprompter context="interior" onCommand={handleVoice} initialMessage="Say a style like 'modern' or 'scandinavian', then a room like 'bedroom'." />
    </div>
  );
};

export default InteriorDesignPage;
