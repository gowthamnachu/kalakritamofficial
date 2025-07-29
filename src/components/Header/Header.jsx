import React from 'react';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import './Header.css';
import Artists from '../Artists';

const Header = ({ currentPage = 'home' }) => {
  const { navigateWithLoading } = useNavigationWithLoading();

  const navItems = [
    { path: '/home', label: 'Home' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/workshops', label: 'Workshops' },
    { path: '/events', label: 'Events' },
    { path: '/artists', label: 'Artists' },
    { path: '/artblogs', label: 'Art Blogs' },
    { path: '/contact', label: 'Contact' },
    { path: '/about', label: 'About Us' }
  ];

  return (
    <header className="shared-header">
      <div className="header-content">
        <div className="header-brand" onClick={() => navigateWithLoading('/home')}>
          <h1 className="kalakritam-title">Kalakritam</h1>
          <div className="header-subtitle">Manifesting Through Arts</div>
        </div>
        
        <nav className="header-navigation">
          <div className="nav-links">
            {navItems.map(item => (
              <button 
                key={item.path}
                onClick={() => navigateWithLoading(item.path)} 
                className={`nav-link ${currentPage === item.path.slice(1) ? 'active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
