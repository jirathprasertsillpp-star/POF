import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Make React available globally for i18n hooks
window.React = React;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
