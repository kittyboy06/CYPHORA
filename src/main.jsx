import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AdminPortal from './admin/AdminPortal.jsx'
import Round2Page from './round2/Round2Page.jsx'
import './index.css'

function RootRouter() {
  const getRoute = () => {
    const p = window.location.pathname;
    const h = window.location.hash;
    const s = window.location.search;

    if (p.startsWith('/admin') || h.includes('admin') || s.includes('page=admin')) {
      return 'admin';
    }
    if (p.startsWith('/round2') || h.includes('round2') || s.includes('page=round2') || s.includes('round=2')) {
      return 'round2';
    }
    return 'app';
  };

  const [currentRoute, setCurrentRoute] = useState(getRoute);

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(getRoute());
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  if (currentRoute === 'admin') return <AdminPortal />;
  if (currentRoute === 'round2') {
    return (
      <Round2Page
        onReturnToHub={() => {
          window.history.pushState({}, '', '/');
          setCurrentRoute('app');
        }}
      />
    );
  }
  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootRouter />
  </React.StrictMode>,
)
