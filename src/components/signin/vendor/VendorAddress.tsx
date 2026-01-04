// VendorAddress.tsx - Business Address with AgenticBar
import React, { useState, useEffect, useCallback } from 'react';
import AgenticBar, { speak, onCommand } from '../../../agentic';

interface Props {
  address: { street: string; city: string; state: string; zip: string };
  onChange: (address: any) => void;
  onNext: () => void;
}

const VendorAddress: React.FC<Props> = ({ address, onChange, onNext }) => {
  const [form, setForm] = useState(address);

  const updateField = (field: string, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    onChange(updated);
  };

  const isComplete = form.street && form.city && form.state && form.zip;

  const handleCommand = useCallback((cmd: string) => {
    if ((cmd.includes('next') || cmd.includes('continue') || cmd.includes('save')) && isComplete) {
      speak('Saving your address.', () => onNext());
    }
    if (cmd.includes('skip')) {
      speak('Skipping address for now.', () => onNext());
    }
    if (cmd.includes('clear') || cmd.includes('reset')) {
      setForm({ street: '', city: '', state: '', zip: '' });
      onChange({ street: '', city: '', state: '', zip: '' });
      speak('Address cleared.');
    }
  }, [isComplete, onNext, onChange]);

  useEffect(() => {
    return onCommand(handleCommand);
  }, [handleCommand]);

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '4em' }}>📍</span>
      <h3 style={{ color: '#B8860B', margin: '16px 0 8px', fontSize: '1.4em' }}>
        Business Address
      </h3>
      <p style={{ color: '#888', marginBottom: '24px' }}>
        Where is your business located?
      </p>

      <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
        <input
          type="text"
          placeholder="Street Address"
          value={form.street}
          onChange={e => updateField('street', e.target.value)}
          style={{
            width: '100%',
            padding: '14px 16px',
            marginBottom: '12px',
            borderRadius: '10px',
            border: `2px solid ${form.street ? '#B8860B' : 'rgba(184,134,11,0.4)'}`,
            background: 'rgba(0,0,0,0.3)',
            color: '#fff',
            fontSize: '1em'
          }}
        />
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="City"
            value={form.city}
            onChange={e => updateField('city', e.target.value)}
            style={{
              flex: 2,
              padding: '14px 16px',
              borderRadius: '10px',
              border: `2px solid ${form.city ? '#B8860B' : 'rgba(184,134,11,0.4)'}`,
              background: 'rgba(0,0,0,0.3)',
              color: '#fff',
              fontSize: '1em'
            }}
          />
          <input
            type="text"
            placeholder="State"
            value={form.state}
            onChange={e => updateField('state', e.target.value.toUpperCase().slice(0, 2))}
            style={{
              flex: 1,
              padding: '14px 16px',
              borderRadius: '10px',
              border: `2px solid ${form.state ? '#B8860B' : 'rgba(184,134,11,0.4)'}`,
              background: 'rgba(0,0,0,0.3)',
              color: '#fff',
              fontSize: '1em',
              textTransform: 'uppercase'
            }}
          />
        </div>
        <input
          type="text"
          placeholder="ZIP Code"
          value={form.zip}
          onChange={e => updateField('zip', e.target.value.replace(/\D/g, '').slice(0, 5))}
          style={{
            width: '50%',
            padding: '14px 16px',
            marginBottom: '24px',
            borderRadius: '10px',
            border: `2px solid ${form.zip ? '#B8860B' : 'rgba(184,134,11,0.4)'}`,
            background: 'rgba(0,0,0,0.3)',
            color: '#fff',
            fontSize: '1em'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={() => speak('Skipping.', () => onNext())}
          style={{
            padding: '14px 28px',
            background: 'transparent',
            color: '#888',
            border: '1px solid #555',
            borderRadius: '24px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Skip for now
        </button>
        <button
          onClick={() => isComplete && speak('Saving.', () => onNext())}
          disabled={!isComplete}
          style={{
            padding: '14px 36px',
            background: isComplete ? 'linear-gradient(135deg, #B8860B, #DAA520)' : 'rgba(255,255,255,0.1)',
            color: isComplete ? '#000' : '#555',
            border: 'none',
            borderRadius: '24px',
            cursor: isComplete ? 'pointer' : 'not-allowed',
            fontWeight: 700
          }}
        >
          Continue →
        </button>
      </div>

      <AgenticBar
        context="Business Address"
        hints={['"next" to continue', '"skip" to skip']}
        welcomeMessage="Enter your business address, or say skip to add it later."
        autoStart={true}
      />
    </div>
  );
};

export default VendorAddress;
