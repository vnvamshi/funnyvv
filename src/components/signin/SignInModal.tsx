import React, { useState, useEffect } from 'react';
import VendorFlow from './vendor/VendorFlow';
import { BuilderFlow } from './builder';
import { AgentFlow } from './agent';

interface Props { isOpen: boolean; onClose: () => void; }
type FlowType = 'selector' | 'vendor' | 'builder' | 'agent';

const SignInModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [flowType, setFlowType] = useState<FlowType>('selector');
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => { if (!isOpen) setFlowType('selector'); }, [isOpen]);

  if (!isOpen) return null;

  if (flowType === 'vendor') return <VendorFlow onClose={onClose} onBack={() => setFlowType('selector')} />;
  if (flowType === 'builder') return <BuilderFlow onClose={onClose} onBack={() => setFlowType('selector')} />;
  if (flowType === 'agent') return <AgentFlow onClose={onClose} onBack={() => setFlowType('selector')} />;

  const options = [
    { id: 'vendor', icon: '📦', title: 'Vendor', desc: 'Sell products & materials', color: '#B8860B', bg: 'linear-gradient(135deg, #004236, #001a15)' },
    { id: 'builder', icon: '🏗️', title: 'Builder', desc: 'Construction & development', color: '#f59e0b', bg: 'linear-gradient(135deg, #1e3a5f, #0f1c2e)' },
    { id: 'agent', icon: '🏠', title: 'Agent', desc: 'Real estate services', color: '#10b981', bg: 'linear-gradient(135deg, #1a1a2e, #16213e)' }
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 24, width: '100%', maxWidth: 900, padding: 40, border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h2 style={{ color: '#fff', fontSize: 28, margin: '0 0 10px', background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Who Are You?</h2>
          <p style={{ color: '#94a3b8', fontSize: 16, margin: 0 }}>Select your role to get started</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {options.map(opt => (
            <div key={opt.id} onClick={() => setFlowType(opt.id as FlowType)} onMouseEnter={() => setHovered(opt.id)} onMouseLeave={() => setHovered(null)}
              style={{ background: opt.bg, border: `2px solid ${hovered === opt.id ? opt.color : 'rgba(255,255,255,0.1)'}`, borderRadius: 16, padding: 30, cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s', transform: hovered === opt.id ? 'translateY(-8px)' : 'none', boxShadow: hovered === opt.id ? `0 20px 40px ${opt.color}30` : 'none' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{opt.icon}</div>
              <h3 style={{ color: opt.color, fontSize: 22, margin: '0 0 8px' }}>{opt.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>{opt.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 30 }}><button onClick={onClose} style={{ padding: '10px 30px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 25, color: '#94a3b8', cursor: 'pointer' }}>← Close</button></div>
      </div>
    </div>
  );
};

export default SignInModal;
