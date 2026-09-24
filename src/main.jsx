import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AdminPortal from './admin/AdminPortal.jsx'
import './index.css'

function RootRouter() {
  const [isAdmin, setIsAdmin] = useState(() => {
    const p = window.location.pathname;
    const h = window.location.hash;
    const s = window.location.search;
    return p.startsWith('/admin') || h.includes('admin') || s.includes('page=admin');
  });

  useEffect(() => {
    const handleRouteChange = () => {
      const p = window.location.pathname;
      const h = window.location.hash;
      const s = window.location.search;
      setIsAdmin(p.startsWith('/admin') || h.includes('admin') || s.includes('page=admin'));
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  return isAdmin ? <AdminPortal /> : <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootRouter />
  </React.StrictMode>,
)
