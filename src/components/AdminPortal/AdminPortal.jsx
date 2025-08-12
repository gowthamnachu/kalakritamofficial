import React from 'react';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import AdminHeader from '../AdminHeader';
import Footer from '../Footer';
import VideoLogo from '../VideoLogo';
import './AdminPortal.css';

const AdminPortal = () => {
  const { navigateWithLoading } = useNavigationWithLoading();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigateWithLoading('/admin/login');
    }
  };

  const adminModules = [
    {
      title: 'Gallery Management',
      description: 'Manage artworks, categories, and gallery content',
      path: '/admin/gallery',
      icon: '🖼️',
      color: '#c38f21'
    },
    {
      title: 'Workshop Management',
      description: 'Create and manage workshops, instructors, and enrollment',
      path: '/admin/workshops',
      icon: '🎨',
      color: '#d4af85'
    },
    {
      title: 'Event Management',
      description: 'Organize events, manage schedules and registrations',
      path: '/admin/events',
      icon: '📅',
      color: '#c38f21'
    },
    {
      title: 'Artist Management',
      description: 'Manage artist profiles, portfolios, and information',
      path: '/admin/artists',
      icon: '👨‍🎨',
      color: '#d4af85'
    },
    {
      title: 'Blog Management',
      description: 'Create and publish art blogs, manage content',
      path: '/admin/blogs',
      icon: '📝',
      color: '#c38f21'
    },
    {
      title: 'Contact Management',
      description: 'Manage contact inquiries and communication',
      path: '/admin/contact',
      icon: '📞',
      color: '#d4af85'
    },
    {
      title: 'Ticket Management',
      description: 'Generate tickets and verify ticket authenticity',
      path: '/admin/tickets',
      icon: '🎫',
      color: '#c38f21'
    }
  ];

  return (
    <div className="admin-portal-container">
      <VideoLogo />
      <AdminHeader currentPage="portal" />
      
      <main className="admin-portal-content">
        <section className="admin-portal-hero">
          <div className="admin-portal-badge">Admin Portal</div>
          <div className="admin-header-actions">
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
          <h1 className="admin-portal-title">Kalakritam Content Management</h1>
          <p className="admin-portal-subtitle">Comprehensive Administration Dashboard</p>
          <div className="admin-portal-description">
            <p>Manage all aspects of the Kalakritam website from this central dashboard. Access full CRUD operations for all content areas while maintaining the same beautiful design as the main website.</p>
          </div>
        </section>

        <section className="admin-modules-section">
          <h2>Administration Modules</h2>
          <div className="admin-modules-grid">
            {adminModules.map((module, index) => (
              <div 
                key={index}
                className="admin-module-card"
                onClick={() => navigateWithLoading(module.path)}
              >
                <div className="module-icon" style={{ color: module.color }}>
                  {module.icon}
                </div>
                <h3 className="module-title">{module.title}</h3>
                <p className="module-description">{module.description}</p>
                <button 
                  className="module-action-btn"
                  style={{ borderColor: module.color, color: module.color }}
                >
                  Manage →
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-quick-stats">
          <h2>Quick Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🖼️</div>
              <div className="stat-info">
                <span className="stat-number">200+</span>
                <span className="stat-label">Artworks</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎨</div>
              <div className="stat-info">
                <span className="stat-number">50+</span>
                <span className="stat-label">Workshops</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <span className="stat-number">25+</span>
                <span className="stat-label">Events</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👨‍🎨</div>
              <div className="stat-info">
                <span className="stat-number">30+</span>
                <span className="stat-label">Artists</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminPortal;
