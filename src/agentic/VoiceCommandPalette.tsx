// VoiceCommandPalette.tsx - Quick voice command reference
import React, { useState } from 'react';
import { speak } from './AgenticBar';

interface Command {
  phrase: string;
  description: string;
  category: 'navigation' | 'action' | 'mode' | 'control';
}

const COMMANDS: Command[] = [
  // Navigation
  { phrase: 'sign in', description: 'Open sign in modal', category: 'navigation' },
  { phrase: "I'm a vendor", description: 'Start vendor onboarding', category: 'navigation' },
  { phrase: 'go back', description: 'Navigate back', category: 'navigation' },
  { phrase: 'close', description: 'Close current modal', category: 'navigation' },
  { phrase: 'home', description: 'Go to home page', category: 'navigation' },
  { phrase: 'products', description: 'View products', category: 'navigation' },
  
  // Actions
  { phrase: 'yes / confirm', description: 'Confirm current action', category: 'action' },
  { phrase: 'clear / reset', description: 'Clear current input', category: 'action' },
  { phrase: 'beautify', description: 'AI enhance profile', category: 'action' },
  { phrase: 'save', description: 'Save and continue', category: 'action' },
  { phrase: 'upload', description: 'Start file upload', category: 'action' },
  
  // Mode
  { phrase: 'talkative mode', description: 'More verbose responses', category: 'mode' },
  { phrase: 'interactive mode', description: 'Brief responses', category: 'mode' },
  { phrase: 'text mode', description: 'Silent mode', category: 'mode' },
  
  // Control
  { phrase: 'hey / pause', description: 'Pause listening', category: 'control' },
  { phrase: 'resume', description: 'Resume listening', category: 'control' },
  { phrase: 'help', description: 'Get help', category: 'control' },
];

const VoiceCommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const categories = ['all', 'navigation', 'action', 'mode', 'control'];
  const filteredCommands = filter === 'all' 
    ? COMMANDS 
    : COMMANDS.filter(c => c.category === filter);

  const categoryColors: Record<string, string> = {
    navigation: '#4CAF50',
    action: '#2196F3',
    mode: '#9C27B0',
    control: '#FF9800'
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          padding: '10px 16px',
          background: 'rgba(30,30,30,0.9)',
          color: '#888',
          border: '1px solid #555',
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: '0.85em',
          zIndex: 9998
        }}
      >
        💡 Voice Commands
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '90px',
      right: '20px',
      width: '320px',
      maxHeight: '400px',
      background: 'rgba(20,20,20,0.98)',
      borderRadius: '16px',
      border: '1px solid #444',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      zIndex: 9998,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ color: '#fff', fontWeight: 600 }}>💡 Voice Commands</span>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '1.2em'
          }}
        >
          ×
        </button>
      </div>

      {/* Category Filter */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid #333',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto'
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '4px 10px',
              background: filter === cat ? '#B8860B' : 'rgba(255,255,255,0.1)',
              color: filter === cat ? '#000' : '#888',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '0.75em',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Commands List */}
      <div style={{
        maxHeight: '280px',
        overflowY: 'auto',
        padding: '8px'
      }}>
        {filteredCommands.map((cmd, i) => (
          <div
            key={i}
            onClick={() => speak(`Try saying: ${cmd.phrase}`)}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              marginBottom: '4px',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.03)',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px'
            }}>
              <span style={{
                padding: '2px 8px',
                background: categoryColors[cmd.category],
                color: '#000',
                borderRadius: '8px',
                fontSize: '0.7em',
                fontWeight: 600
              }}>
                {cmd.phrase}
              </span>
            </div>
            <div style={{ color: '#888', fontSize: '0.8em' }}>
              {cmd.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoiceCommandPalette;
