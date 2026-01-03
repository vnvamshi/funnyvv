/**
 * AppWrapper.tsx
 * Wraps your entire app with AgentK features
 */
import React from 'react';
import AgentKOverlay from './components/agentk/AgentKOverlay';
import App from './App';

const AppWrapper: React.FC = () => {
  return (
    <AgentKOverlay>
      <App />
    </AgentKOverlay>
  );
};

export default AppWrapper;
