import React from 'react';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import './AdminHeader.css';

const AdminHeader = ({ currentPage = 'portal' }) => {
  const { navigateWithLoading } = useNavigationWithLoading();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigateWithLoading('/admin/login');
    }
  };

  const adminNavItems = [
    { path: '/admin/portal', label: 'Dashboard', icon: '🏠' },
    { path: '/admin/gallery', label: 'Gallery', icon: '🖼️' },
    { path: '/admin/workshops', label: 'Workshops', icon: '🎨' },
    { path: '/admin/events', label: 'Events', icon: '📅' },
    { path: '/admin/artists', label: 'Artists', icon: '👨‍🎨' },
    { path: '/admin/blogs', label: 'Blogs', icon: '📝' },
    { path: '/admin/contact', label: 'Contact', icon: '📞' },
    { path: '/admin/tickets', label: 'Tickets', icon: '🎫' }
  ];

  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <div className="admin-header-brand">
          <div className="admin-brand-badge">ADMIN</div>
          <div className="admin-brand-info">
            <h1 className="admin-title">Kalakritam</h1>
            <div className="admin-subtitle">Content Management System</div>
          </div>
        </div>
        
        <nav className="admin-navigation">
          <div className="admin-nav-links">
            {adminNavItems.map(item => (
              <button 
                key={item.path}
                onClick={() => navigateWithLoading(item.path)} 
                className={`admin-nav-link ${currentPage === item.path ? 'active' : ''}`}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </div>
          
          <div className="admin-header-actions">
            <button onClick={handleLogout} className="admin-logout-btn">
              <span className="logout-icon">🚪</span>
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;
