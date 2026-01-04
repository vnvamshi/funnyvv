import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useVoice } from '../common/useVoice';

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

// Beautification templates
const BEAUTIFY_TEMPLATES: Record<string, { intro: string; qualities: string[]; closing: string }> = {
  furniture: {
    intro: "Premium furniture solutions provider",
    qualities: ["Handcrafted excellence with attention to detail", "Sustainable and eco-friendly materials", "Timeless designs that complement any space"],
    closing: "Transforming homes with quality craftsmanship and exceptional service."
  },
  lighting: {
    intro: "Innovative lighting design specialists",
    qualities: ["Energy-efficient LED solutions", "Ambient atmosphere creation", "Smart home integration ready"],
    closing: "Illuminating spaces with cutting-edge technology and elegant design."
  },
  kitchen: {
    intro: "Complete kitchen solutions provider",
    qualities: ["Modern appliances and fixtures", "Space-efficient designs", "Professional-grade quality"],
    closing: "Creating dream kitchens that inspire culinary excellence."
  },
  general: {
    intro: "Quality home improvement solutions provider",
    qualities: ["Customer-focused approach", "Premium quality products", "Competitive pricing with value"],
    closing: "Dedicated to enhancing your living spaces with exceptional products."
  }
};

const VendorProfile: React.FC<Props> = ({
  profile, beautified, companyName, onChange, onCompanyChange, onBeautify, onSave, speak
}) => {
  const [isBeautifying, setIsBeautifying] = useState(false);
  const [showBeautified, setShowBeautified] = useState(!!beautified);
  const spokenRef = useRef(false);

  // Voice commands for this component
  const handleCommand = useCallback((cmd: string) => {
    const c = cmd.toLowerCase();
    console.log('[VendorProfile] Command:', c);
    
    if (c.includes('beautify') || c.includes('enhance') || c.includes('improve')) {
      beautifyProfile();
    }
    if (c.includes('save') || c.includes('next') || c.includes('continue')) {
      if (companyName.trim()) {
        onSave();
      } else {
        speak('Please enter your company name first.');
      }
    }
    if (c.includes('clear') || c.includes('reset')) {
      onChange('');
      onBeautify('');
      setShowBeautified(false);
      speak('Profile cleared.');
    }
  }, [companyName, onSave, speak]);

  // Voice for dictation
  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    // If user is dictating their profile, append to description
    if (isFinal && !text.toLowerCase().includes('beautify') && 
        !text.toLowerCase().includes('save') && 
        !text.toLowerCase().includes('clear')) {
      // Check if this looks like profile content (not a command)
      if (text.length > 20) {
        onChange(profile + (profile ? ' ' : '') + text);
        speak('Added to profile.');
      }
    }
  }, [profile, onChange, speak]);

  const voice = useVoice({
    onCommand: handleCommand,
    onTranscript: handleTranscript,
    autoStart: true
  });

  // Welcome message
  useEffect(() => {
    if (!spokenRef.current) {
      spokenRef.current = true;
      setTimeout(() => {
        speak('Tell me about your business. Enter your company name and describe what you sell.');
      }, 500);
    }
  }, [speak]);

  const detectCategory = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('furniture') || lower.includes('chair') || lower.includes('table') || lower.includes('sofa') || lower.includes('bed')) return 'furniture';
    if (lower.includes('light') || lower.includes('lamp') || lower.includes('chandelier') || lower.includes('led')) return 'lighting';
    if (lower.includes('kitchen') || lower.includes('appliance') || lower.includes('cabinet') || lower.includes('sink')) return 'kitchen';
    return 'general';
  };

  const beautifyProfile = () => {
    if (!profile.trim() && !companyName.trim()) {
      speak("Please enter your company name and what you sell first.");
      return;
    }

    setIsBeautifying(true);
    speak("Beautifying your profile...");

    // Simulate AI processing
    setTimeout(() => {
      const category = detectCategory(profile + ' ' + companyName);
      const template = BEAUTIFY_TEMPLATES[category];
      const name = companyName || 'Your Company';
      const originalInfo = profile || 'quality products';
      
      const beautifiedText = `🏢 ${name}

${template.intro} specializing in ${originalInfo.toLowerCase()}.

✨ What Sets Us Apart:
• ${template.qualities[0]}
• ${template.qualities[1]}
• ${template.qualities[2]}

📍 ${template.closing}

🌟 Trusted by homeowners and designers. Browse our collection on VistaView.

📞 Contact us for custom orders and bulk pricing.`.trim();

      onBeautify(beautifiedText);
      setShowBeautified(true);
      setIsBeautifying(false);
      speak("Profile beautified! Review and click Save to continue.");
    }, 1500);
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
            border: `2px solid ${companyName ? THEME.gold : 'rgba(184,134,11,0.4)'}`,
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
          rows={showBeautified ? 14 : 5}
          style={{
            width: '100%',
            padding: '14px 18px',
            marginBottom: '16px',
            borderRadius: '10px',
            border: `2px solid ${showBeautified ? '#4CAF50' : 'rgba(184,134,11,0.4)'}`,
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
            <span style={{ color: '#888', marginLeft: '8px', fontSize: '0.85em' }}>
              Using IKEA & Wayfair patterns
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={beautifyProfile}
            disabled={isBeautifying || (!profile.trim() && !companyName.trim())}
            style={{
              padding: '14px 28px',
              background: isBeautifying ? '#555' : 'transparent',
              color: isBeautifying ? '#888' : THEME.gold,
              border: `2px solid ${THEME.gold}`,
              borderRadius: '25px',
              cursor: isBeautifying ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              opacity: (!profile.trim() && !companyName.trim()) ? 0.5 : 1
            }}
          >
            {isBeautifying ? '⏳ Beautifying...' : '✨ Beautify'}
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
        
        {/* Voice status */}
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          background: 'rgba(0,0,0,0.2)', 
          borderRadius: '8px',
          fontSize: '0.85em'
        }}>
          <span style={{ color: voice.isListening ? '#4CAF50' : '#888' }}>
            {voice.isListening ? '🎤 Listening - say "beautify" or "save"' : '⏸️ Voice paused'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
