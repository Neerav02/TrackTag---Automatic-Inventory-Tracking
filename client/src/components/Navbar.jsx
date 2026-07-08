// client/src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import socket from '../socket';

export default function Navbar() {
  const location = useLocation();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/alerts', label: 'Alerts Log' },
    { path: '/about', label: 'Architecture' },
  ];

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        <svg xmlns="http://www.w3.org/2000/svg" className="navbar__logo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span className="navbar__title">TrackTag</span>
      </Link>

      <ul className="navbar__menu">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`navbar__link ${location.pathname === item.path ? 'navbar__link--active' : ''}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
        <li>
          <div className="navbar__status">
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isConnected ? 'var(--color-success)' : 'var(--color-alert)',
                display: 'inline-block',
                boxShadow: isConnected ? '0 0 6px var(--color-success)' : 'none',
              }}
            />
            <span>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
          </div>
        </li>
      </ul>
    </nav>
  );
}
