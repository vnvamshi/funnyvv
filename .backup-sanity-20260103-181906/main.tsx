import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import MrVAssistant from './components/MrV/MrVAssistant';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <MrVAssistant />
  </React.StrictMode>
);
