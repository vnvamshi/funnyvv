// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - INTERIOR DESIGN PAGE
// With STT/TTS teleprompter
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useCallback } from 'react';
import VoiceTeleprompter from '../shared/VoiceTeleprompter';

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B', teal: '#004236' };

const STYLES = [
  { id: 'modern', name: 'Modern', icon: '🏢', description: 'Clean lines, minimal clutter, neutral colors' },
  { id: 'traditional', name: 'Traditional', icon: '🏛️', description: 'Classic elegance, rich colors, ornate details' },
  { id: 'minimalist', name: 'Minimalist', icon: '⬜', description: 'Less is more, functional, spacious' },
  { id: 'industrial', name: 'Industrial', icon: '🏭', description: 'Raw materials, exposed brick, metal accents' },
  { id: 'bohemian', name: 'Bohemian', icon: '🎨', description: 'Eclectic, colorful, layered textures' },
  { id: 'scandinavian', name: 'Scandinavian', icon: '❄️', description: 'Light, airy, natural materials, cozy' },
];

const ROOMS = [
  { id: 'living', name: 'Living Room', icon: '🛋️' },
  { id: 'bedroom', name: 'Bedroom', icon: '🛏️' },
  { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
  { id: 'bathroom', name: 'Bathroom', icon: '🚿' },
  { id: 'office', name: 'Home Office', icon: '💼' },
  { id: 'outdoor', name: 'Outdoor', icon: '🌳' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const InteriorDesignPage: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const handleVoiceCommand = useCallback((cmd: string) => {
    console.log('[InteriorDesign] Voice command:', cmd);
    
    // Style selection
    const style = STYLES.find(s => cmd.includes(s.name.toLowerCase()));
    if (style) setSelectedStyle(style.id);
    
    // Room selection
    const room = ROOMS.find(r => cmd.includes(r.name.toLowerCase().split(' ')[0]));
    if (room) setSelectedRoom(room.id);
  }, []);

  const handleNavigate = useCallback((target: string) => {
    if (target === 'home') onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#f5f5f5',
      zIndex: 9998,
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`,
        padding: '30px 20px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
          width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer'
        }}>✕</button>
        <h1 style={{ color: '#fff', margin: '0 0 8px', fontSize: '2em' }}>
          🎨 Interior Design
        </h1>
        <p style={{ color: THEME.goldLight, margin: 0 }}>
          AI-powered design inspiration
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        {/* Design Styles */}
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Choose Your Style</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '40px'
        }}>
          {STYLES.map(style => (
            <div
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              style={{
                background: selectedStyle === style.id ? THEME.gold : '#fff',
                color: selectedStyle === style.id ? '#fff' : '#333',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '2.5em', display: 'block', marginBottom: '12px' }}>
                {style.icon}
              </span>
              <h3 style={{ margin: '0 0 6px', fontSize: '1em' }}>{style.name}</h3>
              <p style={{ margin: 0, fontSize: '0.75em', opacity: 0.8 }}>{style.description}</p>
            </div>
          ))}
        </div>

        {/* Rooms */}
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Select a Room</h2>
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '40px'
        }}>
          {ROOMS.map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              style={{
                padding: '12px 20px',
                borderRadius: '25px',
                border: 'none',
                background: selectedRoom === room.id ? THEME.gold : '#fff',
                color: selectedRoom === room.id ? '#fff' : '#333',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1em'
              }}
            >
              {room.icon} {room.name}
            </button>
          ))}
        </div>

        {/* Get Design Button */}
        {selectedStyle && selectedRoom && (
          <div style={{ textAlign: 'center' }}>
            <button style={{
              padding: '16px 40px',
              background: `linear-gradient(135deg, ${THEME.gold}, #D4A84B)`,
              color: '#fff',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              fontSize: '1.1em',
              fontWeight: 600,
              boxShadow: `0 8px 24px ${THEME.gold}40`
            }}>
              ✨ Generate Design Ideas
            </button>
          </div>
        )}
      </div>

      {/* Voice Teleprompter */}
      <VoiceTeleprompter
        context="interiordesign"
        onCommand={handleVoiceCommand}
        onNavigate={handleNavigate}
        initialMessage="Welcome to Interior Design. Say a style like 'modern' or 'scandinavian', then say a room like 'living room'."
      />
    </div>
  );
};

export default InteriorDesignPage;
