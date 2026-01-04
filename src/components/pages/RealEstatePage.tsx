import React, { useState, useCallback } from 'react';
import VoiceTeleprompter from '../shared/VoiceTeleprompter';

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B', teal: '#004236' };

const PROPERTIES = [
  { id: 'p1', title: 'Modern Downtown Condo', price: 450000, address: '123 Main St', beds: 2, baths: 2, sqft: 1200, type: 'condo' },
  { id: 'p2', title: 'Luxury Waterfront Villa', price: 1250000, address: '456 Ocean Dr', beds: 5, baths: 4, sqft: 4500, type: 'house' },
  { id: 'p3', title: 'Cozy Studio Apartment', price: 185000, address: '789 Beach Blvd', beds: 1, baths: 1, sqft: 600, type: 'apartment' },
  { id: 'p4', title: 'Family Home with Pool', price: 650000, address: '321 Palm Ave', beds: 4, baths: 3, sqft: 2800, type: 'house' },
];

interface Props { isOpen: boolean; onClose: () => void; }

const RealEstatePage: React.FC<Props> = ({ isOpen, onClose }) => {
  const [properties] = useState(PROPERTIES);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<typeof PROPERTIES[0] | null>(null);

  const filtered = filter === 'all' ? properties : properties.filter(p => p.type === filter);

  const handleVoice = useCallback((cmd: string) => {
    if (cmd.includes('house')) setFilter('house');
    if (cmd.includes('condo')) setFilter('condo');
    if (cmd.includes('apartment')) setFilter('apartment');
    if (cmd.includes('all')) setFilter('all');
    if (cmd.includes('close')) onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#f5f5f5', zIndex: 9998, overflow: 'auto' }}>
      <div style={{ background: `linear-gradient(135deg, ${THEME.teal}, #001a15)`, padding: '30px 20px', textAlign: 'center', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
        <h1 style={{ color: '#fff', margin: '0 0 8px' }}>🏠 Real Estate</h1>
        <p style={{ color: THEME.goldLight, margin: 0 }}>{filtered.length} properties</p>
      </div>
      <div style={{ padding: '16px 20px', background: '#fff', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {['all', 'house', 'condo', 'apartment'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: filter === f ? THEME.gold : '#e0e0e0', color: filter === f ? '#fff' : '#333', cursor: 'pointer' }}>
            {f === 'all' ? '🏠 All' : f === 'house' ? '🏡 Houses' : f === 'condo' ? '🏢 Condos' : '🏬 Apartments'}
          </button>
        ))}
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {filtered.map(p => (
          <div key={p.id} onClick={() => setSelected(p)} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', cursor: 'pointer' }}>
            <div style={{ height: '160px', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '3em' }}>🏠</span></div>
            <div style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 8px', color: '#333' }}>{p.title}</h3>
              <p style={{ color: '#888', margin: '0 0 8px', fontSize: '0.85em' }}>📍 {p.address}</p>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', color: '#666', fontSize: '0.8em' }}>
                <span>🛏 {p.beds}</span><span>🚿 {p.baths}</span><span>📐 {p.sqft.toLocaleString()} sqft</span>
              </div>
              <span style={{ color: THEME.gold, fontWeight: 700, fontSize: '1.3em' }}>${p.price.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
      <VoiceTeleprompter context="realestate" onCommand={handleVoice} initialMessage="Say 'show houses' or 'condos' to filter properties." />
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', maxWidth: '500px', width: '90%', padding: '30px', textAlign: 'center' }}>
            <h2>{selected.title}</h2>
            <p style={{ color: THEME.gold, fontSize: '2em', fontWeight: 700 }}>${selected.price.toLocaleString()}</p>
            <p style={{ color: '#666' }}>{selected.beds} bed • {selected.baths} bath • {selected.sqft.toLocaleString()} sqft</p>
            <button style={{ marginTop: '20px', padding: '14px 32px', background: THEME.gold, color: '#fff', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>Schedule Tour</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealEstatePage;
