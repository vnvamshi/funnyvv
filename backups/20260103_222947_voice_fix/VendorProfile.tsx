import React, { useState } from 'react';

interface Props {
  profile: string;
  beautified: string;
  companyName: string;
  onChange: (profile: string) => void;
  onCompanyChange: (name: string) => void;
  onBeautify: (beautified: string) => void;
  onSave: () => void;
  speak: (text: string) => void;
}

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B' };

// Beautification templates based on industry patterns
const BEAUTIFY_TEMPLATES = {
  furniture: {
    intro: "Premium furniture solutions provider",
    qualities: ["handcrafted excellence", "sustainable materials", "timeless designs"],
    closing: "Transforming spaces with quality craftsmanship since establishment."
  },
  lighting: {
    intro: "Innovative lighting design specialists",
    qualities: ["energy-efficient solutions", "ambient atmosphere creation", "smart integration"],
    closing: "Illuminating spaces with cutting-edge technology and elegant design."
  },
  general: {
    intro: "Quality home improvement solutions provider",
    qualities: ["customer-focused approach", "premium quality products", "competitive pricing"],
    closing: "Dedicated to enhancing your living spaces with exceptional products and service."
  }
};

const VendorProfile: React.FC<Props> = ({
  profile, beautified, companyName, onChange, onCompanyChange, onBeautify, onSave, speak
}) => {
  const [isBeautifying, setIsBeautifying] = useState(false);
  const [showBeautified, setShowBeautified] = useState(!!beautified);

  const detectCategory = (text: string): keyof typeof BEAUTIFY_TEMPLATES => {
    const lower = text.toLowerCase();
    if (lower.includes('furniture') || lower.includes('chair') || lower.includes('table') || lower.includes('sofa')) return 'furniture';
    if (lower.includes('light') || lower.includes('lamp') || lower.includes('chandelier')) return 'lighting';
    return 'general';
  };

  const beautifyProfile = () => {
    if (!profile.trim() && !companyName.trim()) {
      speak("Please enter your company name and what you sell first.");
      return;
    }

    setIsBeautifying(true);
    speak("Beautifying your profile with industry best practices...");

    // Simulate AI processing
    setTimeout(() => {
      const category = detectCategory(profile + ' ' + companyName);
      const template = BEAUTIFY_TEMPLATES[category];
      
      const name = companyName || 'Your Company';
      const originalInfo = profile || 'quality products';
      
      // Build beautified profile
      const beautifiedText = `
🏢 ${name}

${template.intro} specializing in ${originalInfo}.

✨ What Sets Us Apart:
• ${template.qualities[0].charAt(0).toUpperCase() + template.qualities[0].slice(1)}
• ${template.qualities[1].charAt(0).toUpperCase() + template.qualities[1].slice(1)}
• ${template.qualities[2].charAt(0).toUpperCase() + template.qualities[2].slice(1)}

📍 ${template.closing}

🌟 Trusted by homeowners and designers alike. Browse our curated collection on VistaView to discover the perfect pieces for your space.

📞 Contact us for custom orders and bulk pricing.
      `.trim();

      onBeautify(beautifiedText);
      setShowBeautified(true);
      setIsBeautifying(false);
      speak("Profile beautified! Your description now follows IKEA and Wayfair best practices.");
    }, 2000);
  };

  const displayProfile = showBeautified && beautified ? beautified : profile;

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '3.5em' }}>🏪</span>
      <h3 style={{ color: THEME.gold, marginTop: '16px', marginBottom: '24px' }}>Business Profile</h3>

      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <input
          type="text"
          value={companyName}
          onChange={(e) => onCompanyChange(e.target.value)}
          placeholder="Company Name"
          style={{
            width: '100%',
            padding: '14px 18px',
            marginBottom: '16px',
            borderRadius: '10px',
            border: `2px solid ${THEME.gold}50`,
            background: 'rgba(0,0,0,0.3)',
            color: '#fff',
            fontSize: '1.1em'
          }}
        />

        <textarea
          value={displayProfile}
          onChange={(e) => {
            onChange(e.target.value);
            if (showBeautified) {
              setShowBeautified(false);
              onBeautify('');
            }
          }}
          placeholder="What do you sell? Describe your products..."
          rows={showBeautified ? 12 : 5}
          style={{
            width: '100%',
            padding: '14px 18px',
            marginBottom: '16px',
            borderRadius: '10px',
            border: `2px solid ${showBeautified ? '#4CAF50' : THEME.gold}50`,
            background: showBeautified ? 'rgba(76,175,80,0.1)' : 'rgba(0,0,0,0.3)',
            color: '#fff',
            fontSize: '1em',
            resize: 'vertical',
            lineHeight: 1.6
          }}
        />

        {showBeautified && (
          <div style={{
            background: 'rgba(76,175,80,0.15)',
            border: '1px solid #4CAF50',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            textAlign: 'left'
          }}>
            <span style={{ color: '#4CAF50', fontWeight: 600 }}>✨ AI Enhanced</span>
            <span style={{ color: '#888', marginLeft: '8px', fontSize: '0.85em' }}>Following IKEA & Wayfair patterns</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={beautifyProfile}
            disabled={isBeautifying}
            style={{
              padding: '14px 28px',
              background: isBeautifying ? '#555' : 'transparent',
              color: isBeautifying ? '#888' : THEME.gold,
              border: `2px solid ${THEME.gold}`,
              borderRadius: '25px',
              cursor: isBeautifying ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isBeautifying ? (
              <>⏳ Beautifying...</>
            ) : (
              <>✨ Beautify</>
            )}
          </button>

          <button
            onClick={onSave}
            disabled={!companyName.trim()}
            style={{
              padding: '14px 32px',
              background: companyName.trim() ? THEME.gold : 'rgba(255,255,255,0.1)',
              color: companyName.trim() ? '#000' : '#555',
              border: 'none',
              borderRadius: '25px',
              cursor: companyName.trim() ? 'pointer' : 'not-allowed',
              fontWeight: 600
            }}
          >
            Save →
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
