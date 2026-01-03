import React, { useState } from 'react';
import AboutUsModal from './AboutUsModal';

const AboutUsTest: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div style={{ padding: '20px' }}>
      <button 
        onClick={() => setShowModal(true)}
        style={{
          background: '#B8860B',
          color: 'white',
          padding: '15px 30px',
          borderRadius: '10px',
          border: 'none',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Open About Us Modal
      </button>
      <AboutUsModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default AboutUsTest;
