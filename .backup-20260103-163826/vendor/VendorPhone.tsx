import React, { useState } from 'react';

interface Props {
  value: string;
  onChange: (phone: string) => void;
  onNext: () => void;
  speak: (text: string) => void;
}

const VendorPhone: React.FC<Props> = ({ value, onChange, onNext, speak }) => {
  const [phone, setPhone] = useState(value);

  const formatPhone = (input: string) => {
    const digits = input.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    onChange(formatted.replace(/-/g, ''));
  };

  const handleSubmit = () => {
    if (phone.replace(/-/g, '').length >= 10) {
      speak(`Got it. Your number is ${phone.split('').join(' ')}. Sending OTP now.`);
      setTimeout(onNext, 1500);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ fontSize: '4em' }}>📱</span>
      <h3 style={{ color: '#B8860B', marginTop: '16px' }}>Enter Your Phone Number</h3>
      <p style={{ color: '#888', marginBottom: '24px' }}>Say it or type below (digits only, formatted automatically)</p>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <span style={{ color: '#fff', fontSize: '1.2em' }}>+1</span>
        <input
          type="tel"
          value={phone}
          onChange={handleChange}
          placeholder="703-338-4931"
          style={{ width: '200px', padding: '16px', fontSize: '1.3em', borderRadius: '12px', border: '2px solid #B8860B', background: 'rgba(0,0,0,0.3)', color: '#fff', textAlign: 'center', letterSpacing: '2px' }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={phone.replace(/-/g, '').length < 10}
        style={{ padding: '14px 40px', background: phone.replace(/-/g, '').length >= 10 ? '#B8860B' : '#444', color: phone.replace(/-/g, '').length >= 10 ? '#000' : '#888', border: 'none', borderRadius: '25px', cursor: phone.replace(/-/g, '').length >= 10 ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '1em' }}
      >
        Send OTP →
      </button>
    </div>
  );
};

export default VendorPhone;
