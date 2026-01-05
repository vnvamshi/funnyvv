/**
 * FlowSelector - Let user choose which flow (Vendor/Builder/Agent)
 */

import React, { useState } from 'react';
import { useAgentic } from '../core/useAgentic';
import { UnifiedAgenticBar } from '../core/UnifiedAgenticBar';

type FlowType = 'vendor' | 'builder' | 'agent' | null;

interface FlowSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (flowType: FlowType) => void;
}

const FLOWS = [
  {
    id: 'vendor' as FlowType,
    icon: '📦',
    title: 'Vendor',
    description: 'Sell products and materials',
    color: '#B8860B',
    bgGradient: 'linear-gradient(135deg, #004236, #001a15)'
  },
  {
    id: 'builder' as FlowType,
    icon: '🏗️',
    title: 'Builder',
    description: 'Construction and development',
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, #1e3a5f, #0f1c2e)'
  },
  {
    id: 'agent' as FlowType,
    icon: '🏠',
    title: 'Agent',
    description: 'Real estate services',
    color: '#10b981',
    bgGradient: 'linear-gradient(135deg, #1a1a2e, #16213e)'
  }
];

export const FlowSelector: React.FC<FlowSelectorProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const [hoveredId, setHoveredId] = useState<FlowType>(null);

  const agentic = useAgentic({
    context: 'flow_selector',
    autoStart: true,
    onCommand: (cmd) => {
      const lower = cmd.toLowerCase();
      if (lower.includes('vendor') || lower.includes('sell') || lower.includes('product')) {
        onSelect('vendor');
      }
      if (lower.includes('builder') || lower.includes('construct') || lower.includes('build')) {
        onSelect('builder');
      }
      if (lower.includes('agent') || lower.includes('real estate') || lower.includes('property')) {
        onSelect('agent');
      }
      if (lower.includes('close') || lower.includes('cancel') || lower.includes('back')) {
        onClose();
      }
    }
  });

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        agentic.speak("Welcome! Are you a vendor, builder, or real estate agent?");
      }, 500);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.92)',
      zIndex: 10000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        borderRadius: 24,
        width: '100%',
        maxWidth: 900,
        padding: 40,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h2 style={{ 
            color: '#fff', 
            fontSize: 28, 
            margin: '0 0 10px',
            background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Who Are You?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 16, margin: 0 }}>
            Select your role to get started
          </p>
        </div>

        {/* Flow Options */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          marginBottom: 30
        }}>
          {FLOWS.map(flow => (
            <div
              key={flow.id}
              onClick={() => onSelect(flow.id)}
              onMouseEnter={() => setHoveredId(flow.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: flow.bgGradient,
                border: `2px solid ${hoveredId === flow.id ? flow.color : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 16,
                padding: 30,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.3s',
                transform: hoveredId === flow.id ? 'translateY(-8px)' : 'none',
                boxShadow: hoveredId === flow.id ? `0 20px 40px ${flow.color}30` : 'none'
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>{flow.icon}</div>
              <h3 style={{ color: flow.color, fontSize: 22, margin: '0 0 8px' }}>{flow.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>{flow.description}</p>
            </div>
          ))}
        </div>

        {/* Close button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 30px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 25,
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            ← Back
          </button>
        </div>

        {/* AgenticBar */}
        <div style={{ marginTop: 30 }}>
          <UnifiedAgenticBar
            context="flow_selector"
            position="inline"
            variant="full"
            theme="dark"
            hints='Say "vendor", "builder", or "agent" to select'
            showInput={true}
          />
        </div>
      </div>
    </div>
  );
};

export default FlowSelector;
