import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CustomCursor from './components/CustomCursor';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CustomCursor />
    <App />
  </React.StrictMode>
);
