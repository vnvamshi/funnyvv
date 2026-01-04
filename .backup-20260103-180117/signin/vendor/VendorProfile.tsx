// ═══════════════════════════════════════════════════════════════════════════════
// VISTAVIEW - VENDOR PROFILE v2.0
// Voice-first profile creation with AI beautification
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';

interface VendorProfileProps {
  profile: string;
  beautified: string;
  onChange: (text: string) => void;
  onBeautify: (text: string) => void;
  onSave: () => void;
  speak: (text: string) => void;
  onVoiceCommand?: (handler: (cmd: string) => boolean) => void;
}

interface ExtractedFields {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  category?: string;
  shippingRegions?: string[];
  country?: string;
}

const THEME = { gold: '#B8860B', goldLight: '#F5EC9B' };

// Categories for vendors
const CATEGORIES = [
  'Furniture', 'Appliances', 'Building Materials', 'Flooring', 
  'Lighting', 'Plumbing', 'Kitchen', 'Bath', 'Decor', 'Outdoor'
];

// Extract fields from spoken text
const extractFields = (text: string): ExtractedFields => {
  const lower = text.toLowerCase();
  const fields: ExtractedFields = {};
  
  // Extract name patterns
  const namePatterns = [
    /(?:my name is|i'm|i am|this is)\s+([a-z]+)/i,
    /^([a-z]+)\s+here/i
  ];
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      fields.firstName = match[1].charAt(0).toUpperCase() + match[1].slice(1);
      break;
    }
  }
  
  // Extract company
  const companyPatterns = [
    /(?:company|business|store|shop)\s+(?:is\s+)?(?:called\s+)?([a-z\s]+?)(?:\s+and|\s+we|\.|,|$)/i,
    /(?:from|at)\s+([a-z\s]+?)(?:\s+and|\s+we|\.|,|$)/i
  ];
  for (const pattern of companyPatterns) {
    const match = text.match(pattern);
    if (match) {
      fields.companyName = match[1].trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }
  
  // Extract category
  for (const cat of CATEGORIES) {
    if (lower.includes(cat.toLowerCase())) {
      fields.category = cat;
      break;
    }
  }
  
  // Extract regions
  const regions: string[] = [];
  const regionPatterns = [
    'texas', 'california', 'florida', 'new york', 'nationwide', 'worldwide',
    'usa', 'united states', 'india', 'uk', 'europe', 'asia'
  ];
  for (const region of regionPatterns) {
    if (lower.includes(region)) {
      regions.push(region.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    }
  }
  if (regions.length > 0) fields.shippingRegions = regions;
  
  // Extract country of origin
  const countries = ['vietnam', 'china', 'india', 'italy', 'usa', 'mexico', 'germany', 'japan'];
  for (const country of countries) {
    if (lower.includes(`from ${country}`) || lower.includes(`in ${country}`)) {
      fields.country = country.charAt(0).toUpperCase() + country.slice(1);
      break;
    }
  }
  
  return fields;
};

// Generate beautified profile (LinkedIn/WhatsApp style)
const beautifyProfile = (text: string, fields: ExtractedFields): string => {
  const name = fields.firstName || 'Vendor';
  const company = fields.companyName || '';
  const category = fields.category || 'products';
  const regions = fields.shippingRegions?.join(', ') || 'multiple regions';
  const origin = fields.country ? ` sourced from ${fields.country}` : '';
  
  return `🏪 **${company || name} - Premium Vendor on VistaView**

${name}${company ? ` from ${company}` : ''} specializes in curated ${category.toLowerCase()}${origin}, serving customers across ${regions} with fast, reliable delivery.

✨ **Why Choose Us:**
• Premium quality products with attention to detail
• Competitive pricing with transparent policies
• Fast shipping and excellent customer service

📦 Shipping: ${regions}
🔒 Secure transactions guaranteed
⭐ Customer satisfaction is our priority

---
_Verified VistaView Partner_`;
};

const VendorProfile: React.FC<VendorProfileProps> = ({ 
  profile, 
  beautified, 
  onChange, 
  onBeautify, 
  onSave, 
  speak,
  onVoiceCommand 
}) => {
  const [text, setText] = useState(profile);
  const [showBeautified, setShowBeautified] = useState(!!beautified);
  const [extractedFields, setExtractedFields] = useState<ExtractedFields>({});
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  // Handle voice commands
  const handleVoiceCommand = useCallback((cmd: string): boolean => {
    // Confirmation commands
    if (awaitingConfirmation) {
      if (cmd.includes('yes') || cmd.includes('save') || cmd.includes('confirm') || cmd.includes('looks good') || cmd.includes('perfect')) {
        onSave();
        return true;
      }
      if (cmd.includes('no') || cmd.includes('change') || cmd.includes('edit') || cmd.includes('wrong')) {
        setShowBeautified(false);
        setAwaitingConfirmation(false);
        speak("No problem. Tell me what you'd like to change.");
        return true;
      }
    }
    
    // If it's a long enough statement, treat it as profile input
    if (cmd.length > 30 && !cmd.includes('stop') && !cmd.includes('back') && !cmd.includes('close')) {
      setText(cmd);
      onChange(cmd);
      handleBeautify(cmd);
      return true;
    }
    
    return false;
  }, [awaitingConfirmation, onChange, onSave, speak]);

  // Register voice handler
  useEffect(() => {
    onVoiceCommand?.(handleVoiceCommand);
  }, [handleVoiceCommand, onVoiceCommand]);

  // Beautify the profile
  const handleBeautify = (inputText?: string) => {
    const profileText = inputText || text;
    const fields = extractFields(profileText);
    setExtractedFields(fields);
    
    const beautifiedText = beautifyProfile(profileText, fields);
    onBeautify(beautifiedText);
    setShowBeautified(true);
    setAwaitingConfirmation(true);
    
    speak("Here's your beautified profile. I've formatted it professionally. Does this look good? Say 'yes' to save, or 'no' to make changes.");
  };

  // Handle text input
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onChange(newText);
    setShowBeautified(false);
    setAwaitingConfirmation(false);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '3em' }}>✍️</span>
        <h3 style={{ color: THEME.gold, marginTop: '12px', marginBottom: '8px' }}>
          Tell Me About Your Business
        </h3>
        <p style={{ color: '#888', fontSize: '0.95em' }}>
          What do you sell? Where do you ship? Just speak naturally!
        </p>
      </div>

      {/* Input Section */}
      {!showBeautified && (
        <>
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Example: I'm Vamshi. I sell handcrafted furniture from Vietnam and ship to Texas and California..."
            style={{ 
              width: '100%', 
              minHeight: '120px', 
              padding: '16px', 
              borderRadius: '12px', 
              border: `2px solid rgba(184,134,11,0.4)`, 
              background: 'rgba(0,0,0,0.3)', 
              color: '#fff', 
              resize: 'vertical',
              fontSize: '1em',
              lineHeight: 1.6
            }}
          />

          {text.length > 20 && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button 
                onClick={() => handleBeautify()} 
                style={{ 
                  padding: '14px 36px', 
                  background: THEME.gold, 
                  color: '#000', 
                  border: 'none', 
                  borderRadius: '25px', 
                  cursor: 'pointer', 
                  fontWeight: 600,
                  fontSize: '1em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ✨ Beautify My Profile
              </button>
            </div>
          )}
        </>
      )}

      {/* Beautified Preview */}
      {showBeautified && beautified && (
        <div style={{ 
          background: 'rgba(184,134,11,0.1)', 
          borderRadius: '16px', 
          border: `1px solid ${THEME.gold}`,
          overflow: 'hidden'
        }}>
          {/* Preview Header */}
          <div style={{
            background: 'rgba(184,134,11,0.2)',
            padding: '12px 20px',
            borderBottom: `1px solid ${THEME.gold}40`
          }}>
            <h4 style={{ color: THEME.gold, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✨ Beautified Profile Preview
            </h4>
          </div>
          
          {/* Extracted Fields */}
          {Object.keys(extractedFields).length > 0 && (
            <div style={{ 
              padding: '12px 20px', 
              background: 'rgba(0,0,0,0.2)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {extractedFields.firstName && (
                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85em', color: '#ddd' }}>
                  👤 {extractedFields.firstName}
                </span>
              )}
              {extractedFields.companyName && (
                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85em', color: '#ddd' }}>
                  🏢 {extractedFields.companyName}
                </span>
              )}
              {extractedFields.category && (
                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85em', color: '#ddd' }}>
                  📦 {extractedFields.category}
                </span>
              )}
              {extractedFields.country && (
                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85em', color: '#ddd' }}>
                  🌍 {extractedFields.country}
                </span>
              )}
              {extractedFields.shippingRegions && (
                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85em', color: '#ddd' }}>
                  🚚 {extractedFields.shippingRegions.join(', ')}
                </span>
              )}
            </div>
          )}
          
          {/* Profile Content */}
          <div style={{ padding: '20px' }}>
            <pre style={{ 
              color: '#ddd', 
              whiteSpace: 'pre-wrap', 
              fontFamily: 'inherit',
              margin: 0,
              lineHeight: 1.7,
              fontSize: '0.95em'
            }}>
              {beautified}
            </pre>
          </div>
          
          {/* Action Buttons */}
          <div style={{ 
            padding: '16px 20px', 
            borderTop: `1px solid ${THEME.gold}40`,
            display: 'flex',
            gap: '12px',
            justifyContent: 'center'
          }}>
            <button 
              onClick={onSave} 
              style={{ 
                padding: '12px 32px', 
                background: THEME.gold, 
                color: '#000', 
                border: 'none', 
                borderRadius: '25px', 
                cursor: 'pointer', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ✓ Save Profile
            </button>
            <button 
              onClick={() => { setShowBeautified(false); setAwaitingConfirmation(false); }} 
              style={{ 
                padding: '12px 24px', 
                background: 'rgba(255,255,255,0.1)', 
                color: '#fff', 
                border: `1px solid ${THEME.gold}50`, 
                borderRadius: '25px', 
                cursor: 'pointer'
              }}
            >
              ✏️ Edit
            </button>
          </div>
        </div>
      )}

      {/* Voice Hint */}
      <p style={{ 
        color: '#666', 
        fontSize: '0.8em', 
        marginTop: '20px',
        textAlign: 'center'
      }}>
        💡 Just speak naturally about your business. I'll extract the key details!
      </p>
    </div>
  );
};

export default VendorProfile;
