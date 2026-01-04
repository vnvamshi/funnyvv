/**
 * V2HodginsFeatured.tsx
 * Featured property card for V2 Hodgins 173 Acres
 */
import React from 'react';

const V2HodginsFeatured: React.FC = () => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      border: '2px solid transparent',
      transition: 'all 0.3s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderImage = 'linear-gradient(90deg, #905E26, #F5EC9B, #905E26) 1';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderImage = 'none';
    }}
    >
      {/* Header */}
      <div style={{
        height: '200px',
        background: 'linear-gradient(135deg, #003B32 0%, #005544 50%, #003B32 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        position: 'relative',
      }}>
        <span style={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          background: '#F5EC9B',
          color: '#905E26',
          padding: '5px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
        }}>✨ FEATURED</span>
        <span style={{ fontSize: '60px' }}>🏡</span>
        <h3 style={{ margin: '10px 0 0', fontSize: '24px', fontWeight: 'bold' }}>173 ACRES</h3>
        <p style={{ margin: '5px 0 0', opacity: 0.8 }}>Van Alstyne, Texas</p>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <h4 style={{ margin: '0 0 10px', color: '#003B32', fontSize: '18px' }}>
          V2 Exclusive at Hodgins
        </h4>
        
        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginBottom: '15px',
          textAlign: 'center',
        }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#003B32' }}>113</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Lots</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#003B32' }}>$300K</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Per Lot</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#003B32' }}>1 Acre</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Each</div>
          </div>
        </div>

        {/* Amenities */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
          {['🎾 5 Tennis', '🏀 5 Basketball', '🏊 2 Pools', '🚶 3.2mi Trails'].map((a, i) => (
            <span key={i} style={{
              background: '#e8f5f2',
              color: '#003B32',
              padding: '5px 10px',
              borderRadius: '15px',
              fontSize: '12px',
            }}>{a}</span>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{
            flex: 1,
            padding: '12px',
            background: '#003B32',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}>View Lots</button>
          <button style={{
            flex: 1,
            padding: '12px',
            background: 'white',
            color: '#003B32',
            border: '2px solid #003B32',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}>Schedule Tour</button>
        </div>
      </div>
    </div>
  );
};

export default V2HodginsFeatured;
