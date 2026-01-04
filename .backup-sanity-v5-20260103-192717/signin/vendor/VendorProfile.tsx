import React, { useState } from 'react';

interface Props {
  profile: string;
  beautified: string;
  onChange: (text: string) => void;
  onBeautify: (text: string) => void;
  onSave: () => void;
  speak: (text: string) => void;
}

const VendorProfile: React.FC<Props> = ({ profile, beautified, onChange, onBeautify, onSave, speak }) => {
  const [text, setText] = useState(profile);
  const [showBeautified, setShowBeautified] = useState(!!beautified);

  const beautify = () => {
    const b = `🏪 **Premium Vendor on VistaView**\n\n${text.charAt(0).toUpperCase() + text.slice(1)}.\n\n✨ Committed to quality products and excellent customer service.\n📦 Fast shipping • 🔒 Secure transactions • ⭐ Satisfaction guaranteed`;
    onBeautify(b);
    setShowBeautified(true);
    speak("Here's your beautified profile. Does this look good? Say yes to save.");
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '3em' }}>✍️</span>
        <h3 style={{ color: '#B8860B' }}>Tell Me About Your Business</h3>
        <p style={{ color: '#888' }}>What do you sell? Where do you ship?</p>
      </div>

      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); onChange(e.target.value); }}
        placeholder="I sell handcrafted furniture and ship nationwide..."
        style={{ width: '100%', minHeight: '100px', padding: '16px', borderRadius: '12px', border: '2px solid rgba(184,134,11,0.4)', background: 'rgba(0,0,0,0.3)', color: '#fff', resize: 'vertical' }}
      />

      {!showBeautified && text.length > 20 && (
        <button onClick={beautify} style={{ marginTop: '16px', padding: '12px 32px', background: '#B8860B', color: '#000', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600 }}>
          ✨ Beautify Profile
        </button>
      )}

      {showBeautified && beautified && (
        <div style={{ marginTop: '24px', padding: '20px', background: 'rgba(184,134,11,0.1)', borderRadius: '12px', border: '1px solid #B8860B' }}>
          <h4 style={{ color: '#B8860B', marginBottom: '10px' }}>✨ Beautified Preview:</h4>
          <pre style={{ color: '#ddd', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{beautified}</pre>
          <button onClick={onSave} style={{ marginTop: '16px', padding: '12px 32px', background: '#B8860B', color: '#000', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 600 }}>
            ✓ Save Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default VendorProfile;
