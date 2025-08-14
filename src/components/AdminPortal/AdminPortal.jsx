import React, { useState, useEffect } from 'react';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import AdminHeader from '../AdminHeader';
import Footer from '../Footer';
import VideoLogo from '../VideoLogo';
import { galleryApi, workshopsApi, eventsApi, artistsApi } from '../../lib/adminApi';
import './AdminPortal.css';

const AdminPortal = () => {
  const { navigateWithLoading } = useNavigationWithLoading();
  const [stats, setStats] = useState({
    artworks: 0,
    workshops: 0,
    events: 0,
    artists: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [artworksRes, workshopsRes, eventsRes, artistsRes] = await Promise.allSettled([
        galleryApi.getAll(),
        workshopsApi.getAll(),
        eventsApi.getAll(),
        artistsApi.getAll()
      ]);

      // Extract counts from successful responses
      const newStats = {
        artworks: artworksRes.status === 'fulfilled' ? (artworksRes.value?.data?.length || 0) : 0,
        workshops: workshopsRes.status === 'fulfilled' ? (workshopsRes.value?.data?.length || 0) : 0,
        events: eventsRes.status === 'fulfilled' ? (eventsRes.value?.data?.length || 0) : 0,
        artists: artistsRes.status === 'fulfilled' ? (artistsRes.value?.data?.length || 0) : 0
      };

      setStats(newStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

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
          {loading ? (
            <div className="stats-loading">
              <div className="loading-spinner"></div>
              <p>Loading dashboard statistics...</p>
            </div>
          ) : (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🖼️</div>
                <div className="stat-info">
                  <span className="stat-number">{stats.artworks}</span>
                  <span className="stat-label">Artworks</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎨</div>
                <div className="stat-info">
                  <span className="stat-number">{stats.workshops}</span>
                  <span className="stat-label">Workshops</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <span className="stat-number">{stats.events}</span>
                  <span className="stat-label">Events</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👨‍🎨</div>
                <div className="stat-info">
                  <span className="stat-number">{stats.artists}</span>
                  <span className="stat-label">Artists</span>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminPortal;
