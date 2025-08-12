import React, { useState, useEffect } from 'react';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import Header from '../Header';
import Footer from '../Footer';
import VideoLogo from '../VideoLogo';
import { config } from '../../config/environment';
import './Artists.css';
import '../Gallery/Gallery.css'; // Import Gallery CSS for modal styles

const Artists = () => {
  const { navigateWithLoading } = useNavigationWithLoading();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiBaseUrl}/artists`);
      const data = await response.json();
      
      if (data.success) {
        setArtists(data.data);
      } else {
        setError('Failed to load artists');
      }
    } catch (err) {
      console.error('Error fetching artists:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (artist) => {
    setSelectedArtist(artist);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArtist(null);
  };

  // Extract unique categories from artists
  const categories = ['all', ...new Set(artists.map(artist => artist.specialization || 'general'))];

  const filteredArtists = selectedCategory === 'all' 
    ? artists 
    : artists.filter(artist => (artist.specialization || 'general') === selectedCategory);

  if (loading) {
    return (
      <div className="artists-container">
        <VideoLogo />
        <Header currentPage="artists" />
        <div className="artists-page-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading artists...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="artists-container">
        <VideoLogo />
        <Header currentPage="artists" />
        <div className="artists-page-content">
          <div className="error-container">
            <h2>Unable to load artists</h2>
            <p>{error}</p>
            <button onClick={fetchArtists} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="artists-container">
      {/* Video Logo */}
      <VideoLogo />
      
      <Header currentPage="artists" />
      
      <div className="artists-page-content">
        <header className="artists-page-header">
          <h1 className="artists-title">Artists</h1>
          <p className="artists-subtitle">Meet Our Master Creators & Cultural Guardians</p>
          <div className="artists-description">
            <p>Discover the talented artists who bring Kalakritam to life. Each artist in our community represents years of dedication, skill, and passion for their craft, carrying forward traditions while innovating for the future.</p>
          </div>
        </header>

        <section className="artists-filters">
          <h3>Filter by Category</h3>
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </section>

        <main className="artists-content">
          <div className="artists-count">
            <p>Showing {filteredArtists.length} artist{filteredArtists.length !== 1 ? 's' : ''}</p>
          </div>
          
          <div className="artists-grid">
            {filteredArtists.map(artist => (
              <div key={artist.id} className="artist-card">
                <div className="artist-image-container">
                  <img 
                    src={artist.imageUrl} 
                    alt={artist.name}
                    className="artist-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const placeholder = e.target.parentNode.querySelector('.artist-image-placeholder');
                      if (placeholder) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="artist-image-placeholder" style={{ display: 'none' }}>
                    <div className="kalakritam-logo-text">Kalakritam</div>
                    <div className="image-not-available-small">Image not available</div>
                  </div>
                  <div className="artist-overlay">
                    <div className="artist-overlay-content">
                      <h3>{artist.name}</h3>
                      <p>{artist.specialization}</p>
                      <span className="artist-experience">{artist.achievements ? artist.achievements.length + '+ Awards' : 'Established Artist'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="artist-info">
                  <h4 className="artist-name">{artist.name}</h4>
                  <p className="artist-specialty">{artist.specialization}</p>
                  <p className="artist-bio">{artist.bio}</p>
                  
                  <div className="artist-details">
                    <div className="detail-row">
                      <span className="detail-label">Specialization:</span>
                      <span className="detail-value">{artist.specialization}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value">{artist.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Featured:</span>
                      <span className="detail-value">{artist.isFeatured ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  
                  <div className="artist-actions">
                    <button 
                      className="btn-details btn-full-width"
                      onClick={() => handleViewDetails(artist)}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredArtists.length === 0 && (
            <div className="no-results">
              <div className="no-results-content">
                <h3>No artists found</h3>
                <p>Try selecting a different category to explore more artists.</p>
                <button 
                  className="reset-filter-btn"
                  onClick={() => setSelectedCategory('all')}
                >
                  Show All Artists
                </button>
              </div>
            </div>
          )}
        </main>

        <section className="artists-info">
          <div className="info-content">
            <h2>Workshop Instructors - Art Teachers Hyderabad</h2>
            <p>
              Meet our passionate <strong>art instructors in Hyderabad</strong> who bring creativity to life in our weekend workshop sessions. 
              Our instructors specialize in various traditional and contemporary art forms, creating engaging experiences in the unique 
              ambiance of cafes and restaurants across the city. Each instructor is dedicated to sharing their artistic knowledge and 
              cultural heritage through hands-on workshop experiences, making art accessible and enjoyable for participants of all skill levels. 
              Discover the artists who make our weekend workshops truly special and inspiring.
            </p>
          </div>
        </section>
      </div>

      {/* Artist Detail Modal */}
      {isModalOpen && selectedArtist && (
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
                  src={selectedArtist.imageUrl} 
                  alt={selectedArtist.name}
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
                  <div className="image-quality-badge">Artist</div>
                  <div className="artwork-category-badge">{selectedArtist.specialization}</div>
                </div>
              </div>

              <div className="modal-details-section">
                <div className="modal-header">
                  <div className="modal-title-section">
                    <h2 className="modal-title">{selectedArtist.name}</h2>
                    <p className="modal-artist">{selectedArtist.specialization}</p>
                  </div>
                  <div className="modal-price-section">
                    <span className="price-label">Featured</span>
                    <div className="modal-price">{selectedArtist.featured ? 'Yes' : 'No'}</div>
                  </div>
                </div>

                <div className="modal-description">
                  <h3>About This Artist</h3>
                  <p>{selectedArtist.bio}</p>
                </div>

                <div className="modal-specifications">
                  <h3>Artist Details</h3>
                  <div className="spec-grid">
                    <div className="spec-item">
                      <span className="spec-label">Specialization</span>
                      <span className="spec-value">{selectedArtist.specialization}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Email</span>
                      <span className="spec-value">{selectedArtist.email}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Phone</span>
                      <span className="spec-value">{selectedArtist.phone}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Website</span>
                      <span className="spec-value">
                        <a href={selectedArtist.website} target="_blank" rel="noopener noreferrer">
                          {selectedArtist.website}
                        </a>
                      </span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Status</span>
                      <span className="spec-value">{selectedArtist.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>

                <div className="modal-additional-info">
                  <div className="artwork-authenticity">
                    <h4>Social Links</h4>
                    {selectedArtist.socialLinks && Object.keys(selectedArtist.socialLinks).length > 0 ? (
                      <div className="social-links">
                        {Object.entries(selectedArtist.socialLinks).map(([platform, link]) => (
                          <div key={platform} className="social-link">
                            <span className="platform">{platform.charAt(0).toUpperCase() + platform.slice(1)}:</span>
                            <span className="link">{link}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No social links available</p>
                    )}
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="contact-artist-btn">Contact Artist</button>
                  <button className="view-portfolio-btn">View Portfolio</button>
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

export default Artists;
