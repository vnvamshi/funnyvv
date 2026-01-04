import React, { useState, useCallback } from 'react';
import VoiceTeleprompter from '../shared/VoiceTeleprompter';

const THEME = { gold: '#B8860B', teal: '#004236' };

const SERVICES = [
  { id: 's1', icon: '🏗️', title: 'Home Renovation', desc: 'Complete renovation services', price: 'From $5,000' },
  { id: 's2', icon: '🎨', title: 'Interior Design', desc: 'Professional design consultation', price: 'From $500' },
  { id: 's3', icon: '🔧', title: 'Plumbing', desc: '24/7 plumbing repairs', price: 'From $100' },
  { id: 's4', icon: '⚡', title: 'Electrical', desc: 'Licensed electricians', price: 'From $150' },
  { id: 's5', icon: '🌳', title: 'Landscaping', desc: 'Outdoor transformation', price: 'From $300' },
  { id: 's6', icon: '🧹', title: 'Cleaning', desc: 'Regular and deep cleaning', price: 'From $80' },
];

interface Props { isOpen: boolean; onClose: () => void; }

const ServicesPage: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selected, setSelected] = useState<typeof SERVICES[0] | null>(null);

  const handleVoice = useCallback((cmd: string) => {
    const svc = SERVICES.find(s => cmd.includes(s.title.toLowerCase().split(' ')[0].toLowerCase()));
    if (svc) setSelected(svc);
    if (cmd.includes('close')) onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#f5f5f5', zIndex: 9998, overflow: 'auto' }}>
      <div style={{ background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`, padding: '30px 20px', textAlign: 'center', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
        <h1 style={{ color: '#fff', margin: '0 0 8px' }}>🛠️ Services</h1>
        <p style={{ color: '#F5EC9B', margin: 0 }}>Professional home services</p>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
        {SERVICES.map(s => (
          <div key={s.id} onClick={() => setSelected(s)} style={{ background: '#fff', borderRadius: '16px', padding: '24px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', cursor: 'pointer' }}>
            <span style={{ fontSize: '3em' }}>{s.icon}</span>
            <h3 style={{ margin: '12px 0 8px', color: '#333' }}>{s.title}</h3>
            <p style={{ color: '#888', margin: '0 0 12px', fontSize: '0.9em' }}>{s.desc}</p>
            <span style={{ background: THEME.gold, color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85em' }}>{s.price}</span>
          </div>
        ))}
      </div>
      <VoiceTeleprompter context="services" onCommand={handleVoice} initialMessage="Say a service name like 'plumbing' or 'cleaning'." />
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', maxWidth: '400px', width: '90%', padding: '30px', textAlign: 'center' }}>
            <span style={{ fontSize: '4em' }}>{selected.icon}</span>
            <h2>{selected.title}</h2>
            <p style={{ color: '#666' }}>{selected.desc}</p>
            <p style={{ color: THEME.gold, fontSize: '1.5em', fontWeight: 600 }}>{selected.price}</p>
            <button style={{ marginTop: '16px', padding: '14px 32px', background: THEME.gold, color: '#fff', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>Request Quote</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
