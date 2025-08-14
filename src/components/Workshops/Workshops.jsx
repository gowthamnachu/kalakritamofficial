import React, { useState, useEffect, useRef } from 'react';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import { toast } from '../../utils/notifications.js';
import Header from '../Header';
import Footer from '../Footer';
import VideoLogo from '../VideoLogo';
import { config } from '../../config/environment';
import './Workshops.css';
import '../Gallery/Gallery.css';

const Workshops = () => {
  const { navigateWithLoading } = useNavigationWithLoading();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchCalled = useRef(false);

  useEffect(() => {
    if (!fetchCalled.current) {
      fetchWorkshops();
      fetchCalled.current = true;
    }
  }, []);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const loadingId = toast.dataLoading('Loading workshops...');
      
      console.log('Fetching workshops from:', `${config.apiBaseUrl}/workshops`);
      const response = await fetch(`${config.apiBaseUrl}/workshops`);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      toast.dismiss(loadingId);
      
      if (data.success) {
        setWorkshops(data.data);
        toast.dataLoaded(`Loaded ${data.data.length} workshops`);
      } else {
        setError('Failed to load workshops');
        toast.error('Failed to load workshops');
      }
    } catch (err) {
      console.error('Error fetching workshops:', err);
      setError('Failed to connect to server');
      toast.serverError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (workshop) => {
    setSelectedWorkshop(workshop);
    setIsModalOpen(true);
    toast.info(`Viewing details for: ${workshop.title}`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedWorkshop(null);
  };

  // Since the API doesn't return categories, show all workshops
  const filteredWorkshops = workshops;

  if (loading) {
    return (
      <div className="workshops-container">
        <VideoLogo />
        <Header currentPage="workshops" />
        <div className="workshops-page-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading workshops...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="workshops-container">
        <VideoLogo />
        <Header currentPage="workshops" />
        <div className="workshops-page-content">
          <div className="error-container">
            <h2>Unable to load workshops</h2>
            <p>{error}</p>
            <button onClick={fetchWorkshops} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="workshops-container">
      {/* Video Logo */}
      <VideoLogo />
      
      <Header currentPage="workshops" />
      
      <div className="workshops-page-content">
        <header className="workshops-page-header">
          <h1 className="workshops-title">Workshops</h1>
          <p className="workshops-subtitle">Learn from Master Artists & Preserve Cultural Heritage</p>
          <div className="workshops-description">
            <p>Join our expert-led workshops and immerse yourself in the world of traditional and contemporary Indian art forms. Learn techniques passed down through generations from master artists and explore modern artistic expressions.</p>
          </div>
        </header>

        <main className="workshops-content">
          <div className="workshops-count">
            <p>Showing {filteredWorkshops.length} workshop{filteredWorkshops.length !== 1 ? 's' : ''}</p>
          </div>
          
          <div className="workshops-grid">
            {filteredWorkshops.map(workshop => (
              <div key={workshop.id} className="workshop-card universal-card">
                <div className="workshop-image-container universal-card-image-container">
                  <img 
                    src={workshop.imageUrl} 
                    alt={workshop.title}
                    className="workshop-image universal-card-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const placeholder = e.target.parentNode.querySelector('.workshop-image-placeholder');
                      if (placeholder) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="workshop-image-placeholder universal-card-image-placeholder" style={{ display: 'none' }}>
                    <div className="universal-card-logo-text">Kalakritam</div>
                    <div className="universal-card-image-not-available">Image not available</div>
                  </div>
                  <div className="workshop-overlay universal-card-overlay">
                    <div className="workshop-overlay-content universal-card-overlay-content">
                      <h3>{workshop.title}</h3>
                      <p>by {workshop.instructor}</p>
                      <span className="highlight-text">₹{workshop.price}</span>
                    </div>
                  </div>
                </div>
                
                <div className="workshop-info universal-card-content">
                  <h4 className="workshop-title universal-card-title">{workshop.title}</h4>
                  <p className="workshop-instructor universal-card-subtitle">by {workshop.instructor}</p>
                  <p className="workshop-description universal-card-description">{workshop.description}</p>
                  
                  <div className="workshop-details universal-card-details">
                    <div className="detail-row universal-card-detail-row">
                      <span className="detail-label universal-card-detail-label">Duration:</span>
                      <span className="detail-value universal-card-detail-value">{workshop.duration}</span>
                    </div>
                    <div className="detail-row universal-card-detail-row">
                      <span className="detail-label universal-card-detail-label">Start Date:</span>
                      <span className="detail-value universal-card-detail-value">{new Date(workshop.startDate).toLocaleDateString('en-US', { 
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="detail-row universal-card-detail-row">
                      <span className="detail-label universal-card-detail-label">End Date:</span>
                      <span className="detail-value universal-card-detail-value">{new Date(workshop.endDate).toLocaleDateString('en-US', { 
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="detail-row universal-card-detail-row">
                      <span className="detail-label universal-card-detail-label">Max Participants:</span>
                      <span className="detail-value universal-card-detail-value">{workshop.maxParticipants}</span>
                    </div>
                    <div className="detail-row universal-card-detail-row">
                      <span className="detail-label universal-card-detail-label">Available Spots:</span>
                      <span className="detail-value universal-card-detail-value">{workshop.maxParticipants - workshop.currentParticipants}</span>
                    </div>
                  </div>
                  
                  <div className="workshop-actions universal-card-actions">
                    <button 
                      className="btn-details universal-card-btn"
                      onClick={() => handleViewDetails(workshop)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredWorkshops.length === 0 && (
            <div className="no-results">
              <div className="no-results-content">
                <h3>No workshops found</h3>
                <p>Try selecting a different category to explore more workshops.</p>
                <button 
                  className="reset-filter-btn"
                  onClick={() => setSelectedCategory('all')}
                >
                  Show All Workshops
                </button>
              </div>
            </div>
          )}
        </main>

        <section className="workshops-info">
          <div className="info-content">
            <h2>Weekend Art Workshops in Hyderabad - Cafes & Restaurants</h2>
            <p>
              Experience unique <strong>art workshops in Hyderabad</strong> at Kalakritam, where creativity meets the cozy ambiance 
              of cafes and restaurants. Our weekend workshops focus on traditional Indian art techniques and contemporary expressions, 
              providing a relaxed and inspiring environment for artistic learning. Join our community of art enthusiasts who gather 
              every weekend to explore creativity, learn new skills, and connect with fellow artists in beautiful, social settings 
              across Hyderabad. Each workshop includes all materials and offers personalized guidance for all skill levels.
            </p>
          </div>
        </section>
      </div>

      {/* Workshop Detail Modal */}
      {isModalOpen && selectedWorkshop && (
        <div className="artwork-modal-overlay" onClick={closeModal}>
          <div className="artwork-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>
              <div className="close-icon-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </div>
            </button>
            
            <div className="modal-content">
              <div className="modal-image-section">
                <img 
                  src={selectedWorkshop.imageUrl} 
                  alt={selectedWorkshop.title}
                  className="modal-artwork-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="image-placeholder" style={{ display: 'none' }}>
                  <div className="kalakritam-logo-text">Kalakritam</div>
                  <div className="image-not-available">Image not available</div>
                </div>
                <div className="modal-image-info">
                  <div className="image-quality-badge">Workshop</div>
                </div>
              </div>

              <div className="modal-details-section">
                <div className="modal-header">
                  <div className="modal-title-section">
                    <h2 className="modal-title">{selectedWorkshop.title}</h2>
                    <p className="modal-artist">Instructor: {selectedWorkshop.instructor}</p>
                  </div>
                  <div className="modal-price-section">
                    <span className="price-label">Price</span>
                    <div className="modal-price">₹{selectedWorkshop.price}</div>
                  </div>
                </div>

                <div className="modal-description">
                  <h3>About This Workshop</h3>
                  <p>{selectedWorkshop.description}</p>
                </div>

                <div className="modal-specifications">
                  <h3>Workshop Details</h3>
                  <div className="spec-grid">
                    <div className="spec-item">
                      <span className="spec-label">Duration</span>
                      <span className="spec-value">{selectedWorkshop.duration}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Start Date</span>
                      <span className="spec-value">{new Date(selectedWorkshop.startDate).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">End Date</span>
                      <span className="spec-value">{new Date(selectedWorkshop.endDate).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Start Time</span>
                      <span className="spec-value">{new Date(selectedWorkshop.startDate).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true 
                      })}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Max Participants</span>
                      <span className="spec-value">{selectedWorkshop.maxParticipants}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Available Spots</span>
                      <span className="spec-value">{selectedWorkshop.maxParticipants - selectedWorkshop.currentParticipants}</span>
                    </div>
                  </div>
                </div>

                <div className="modal-additional-info">
                  <div className="artwork-authenticity">
                    <h4>Workshop Information</h4>
                    <p>This workshop provides hands-on learning experience with expert guidance from {selectedWorkshop.instructor}. All necessary materials and guidance will be provided during the session.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Workshops;
