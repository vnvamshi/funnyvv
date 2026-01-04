import React, { useState } from 'react';

interface Props {
  onVerified: () => void;
  speak: (text: string) => void;
}

const VendorOTP: React.FC<Props> = ({ onVerified, speak }) => {
  const [otp, setOtp] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(val);
    if (val === '123456') {
      speak("Verified! Welcome in.");
      setTimeout(onVerified, 1500);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '4em' }}>🔐</span>
      <h3 style={{ color: '#B8860B', marginTop: '16px' }}>Enter Verification Code</h3>
      <p style={{ color: '#888', marginBottom: '24px' }}>Demo code: <strong style={{ color: '#F5EC9B' }}>123456</strong></p>
      
      <input
        type="text"
        value={otp}
        onChange={handleChange}
        placeholder="••••••"
        maxLength={6}
        style={{ width: '180px', padding: '16px', fontSize: '2em', borderRadius: '12px', border: '2px solid #B8860B', background: 'rgba(0,0,0,0.3)', color: '#fff', textAlign: 'center', letterSpacing: '12px' }}
      />
    </div>
  );
};

export default VendorOTP;
