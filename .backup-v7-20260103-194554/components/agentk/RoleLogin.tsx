/**
 * RoleLogin.tsx
 * Enhanced sign-in with role selection
 * 
 * TEST CREDENTIALS:
 * vendor1/vendor123, builder1/builder123, agent1/agent123, user1/user123, admin/admin123
 */
import React, { useState } from 'react';

const USERS: Record<string, { password: string; role: string; name: string }> = {
  vendor1: { password: 'vendor123', role: 'vendor', name: 'Test Vendor' },
  builder1: { password: 'builder123', role: 'builder', name: 'Test Builder' },
  agent1: { password: 'agent123', role: 'agent', name: 'Test Agent' },
  user1: { password: 'user123', role: 'customer', name: 'Test Customer' },
  admin: { password: 'admin123', role: 'admin', name: 'Administrator' },
};

interface RoleLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { username: string; role: string; name: string }) => void;
}

const RoleLogin: React.FC<RoleLoginProps> = ({ isOpen, onClose, onLogin }) => {
  const [role, setRole] = useState('customer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = USERS[username];
    if (!user) { setError('User not found'); return; }
    if (user.password !== password) { setError('Invalid password'); return; }
    onLogin({ username, role: user.role, name: user.name });
    onClose();
    // Speak greeting
    if (window.speechSynthesis) {
      const msg = new SpeechSynthesisUtterance(`Welcome back, ${user.name}! You are signed in as a ${user.role}.`);
      window.speechSynthesis.speak(msg);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10001,
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        width: '100%',
        maxWidth: '400px',
        margin: '20px',
      }}>
        <h2 style={{ margin: '0 0 20px', color: '#003B32', textAlign: 'center' }}>
          Welcome to VistaView
        </h2>
        
        {/* Role Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            Select Your Role
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['customer', 'vendor', 'builder', 'agent', 'admin'].map(r => (
              <button key={r} type="button" onClick={() => setRole(r)} style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                background: role === r ? '#003B32' : '#e5e7eb',
                color: role === r ? 'white' : '#333',
                cursor: 'pointer',
                fontWeight: role === r ? 'bold' : 'normal',
              }}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
              placeholder="Enter username"
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
              placeholder="Enter password"
            />
          </div>
          
          {error && (
            <div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '15px' }}>
              {error}
            </div>
          )}
          
          <button type="submit" style={{
            width: '100%',
            padding: '14px',
            background: '#003B32',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '16px',
          }}>Sign In</button>
        </form>
        
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center',
        }}>
          Test: vendor1/vendor123, builder1/builder123, user1/user123
        </div>
        
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          color: '#999',
        }}>×</button>
      </div>
    </div>
  );
};

export default RoleLogin;
