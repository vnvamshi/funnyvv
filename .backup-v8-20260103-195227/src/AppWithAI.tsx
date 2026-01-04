import React from 'react';
import App from './App';
import MrVOverlay from './components/MrV/MrVOverlay';
import AnimatedCursor from './components/cursor/AnimatedCursor';
import { useNavigate } from 'react-router-dom';

// Wrapper component that adds AI features
const AppWithAIContent: React.FC = () => {
  let navigate: any;
  
  try {
    navigate = useNavigate();
  } catch (e) {
    // Not inside Router yet
    navigate = null;
  }

  const handleNavigate = (path: string) => {
    if (navigate) {
      navigate(path);
    } else {
      window.location.href = path;
    }
  };

  return (
    <>
      <App />
      <MrVOverlay onNavigate={handleNavigate} />
      <AnimatedCursor enabled={true} />
    </>
  );
};

const AppWithAI: React.FC = () => {
  return <AppWithAIContent />;
};

export default AppWithAI;
