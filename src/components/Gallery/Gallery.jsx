import React, { useState, useEffect } from 'react';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import { config } from '../../config/environment';
import Header from '../Header';
import Footer from '../Footer';
import VideoLogo from '../VideoLogo';
import './Gallery.css';

const Gallery = () => {
  const { navigateWithLoading } = useNavigationWithLoading();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      console.log('Fetching artworks from:', `${config.apiBaseUrl}/gallery`);
      const response = await fetch(`${config.apiBaseUrl}/gallery`);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        // Transform image URLs to handle localhost URLs
        const transformedData = data.data.map(artwork => ({
          ...artwork,
          imageUrl: config.transformImageUrl(artwork.image_url || artwork.imageUrl)
        }));
        setArtworks(transformedData);
      } else {
        setError('Failed to load artworks');
      }
    } catch (err) {
      console.error('Error fetching artworks:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (artwork) => {
    setSelectedArtwork(artwork);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArtwork(null);
  };

  // Extract unique categories from artworks, filtering out null/undefined values
  const categories = ['all', ...new Set(
    artworks
      .map(artwork => artwork.category)
      .filter(category => category != null && category !== '')
  )];

  const filteredArtworks = selectedCategory === 'all' 
    ? artworks 
    : artworks.filter(artwork => artwork.category === selectedCategory);

  if (loading) {
    return (
      <div className="gallery-container">
        <VideoLogo />
        <Header currentPage="gallery" />
        <div className="gallery-page-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading artworks...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-container">
        <VideoLogo />
        <Header currentPage="gallery" />
        <div className="gallery-page-content">
          <div className="error-container">
            <h2>Unable to load gallery</h2>
            <p>{error}</p>
            <button onClick={fetchArtworks} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="gallery-container">
      {/* Video Logo */}
      <VideoLogo />
      
      <Header currentPage="gallery" />
      
      <div className="gallery-page-content">
        <header className="gallery-page-header">
          <h1 className="gallery-title">Art Gallery</h1>
          <p className="gallery-subtitle">Discover India's Artistic Heritage</p>
          <div className="gallery-description">
            <p>Explore our curated collection of traditional and contemporary Indian art. From ancient temple murals to modern interpretations, each piece tells a story of India's rich cultural heritage.</p>
          </div>
        </header>

        <section className="gallery-filters">
          <h3>Filter by Category</h3>
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category && typeof category === 'string' 
                  ? category.charAt(0).toUpperCase() + category.slice(1)
                  : 'Unknown'
                }
              </button>
            ))}
          </div>
        </section>

        <main className="gallery-content">
          <div className="artworks-count">
            <p>Showing {filteredArtworks.length} artwork{filteredArtworks.length !== 1 ? 's' : ''}</p>
          </div>
          
          <div className="gallery-grid">
            {filteredArtworks.map(artwork => (
              <div key={artwork.id} className="artwork-card">
                <div className="artwork-image-container">
                  <img 
                    src={artwork.imageUrl} 
                    alt={artwork.title}
                    className="artwork-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const placeholder = e.target.parentNode.querySelector('.artwork-image-placeholder');
                      if (placeholder) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="artwork-image-placeholder" style={{ display: 'none' }}>
                    <div className="kalakritam-logo-text">Kalakritam</div>
                    <div className="image-not-available-small">Image not available</div>
                  </div>
                  <div className="artwork-overlay">
                    <div className="artwork-overlay-content">
                      <h3>{artwork.title}</h3>
                      <p>by {artwork.artist}</p>
                      <span className="artwork-price">{artwork.price}</span>
                    </div>
                  </div>
                </div>
                
                <div className="artwork-info">
                  <h4 className="artwork-title">{artwork.title}</h4>
                  <p className="artwork-artist">by {artwork.artist}</p>
                  <p className="artwork-description">{artwork.description}</p>
                  
                  <div className="artwork-details">
                    <div className="detail-row">
                      <span className="detail-label">Medium:</span>
                      <span className="detail-value">{artwork.medium}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Year:</span>
                      <span className="detail-value">{artwork.year}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Category:</span>
                      <span className="detail-value">{artwork.category}</span>
                    </div>
                  </div>
                  
                  <div className="artwork-actions">
                    <span className="artwork-price-display">{artwork.price}</span>
                    <div className="action-buttons">
                      <button 
                        className="btn-view"
                        onClick={() => handleViewDetails(artwork)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredArtworks.length === 0 && (
            <div className="no-results">
              <div className="no-results-content">
                <h3>No artworks found</h3>
                <p>Try selecting a different category to explore more artworks.</p>
                <button 
                  className="reset-filter-btn"
                  onClick={() => setSelectedCategory('all')}
                >
                  Show All Artworks
                </button>
              </div>
            </div>
          )}
        </main>

        <section className="gallery-info">
          <div className="info-content">
            <h2>Art Gallery Hyderabad - Kalakritam's Workshop Creations</h2>
            <p>
              Discover the inspiring creations from our <strong>art workshops in Hyderabad</strong> at Kalakritam's gallery. 
              Our collection showcases artwork created during our weekend workshops held in cafes and restaurants across the city. 
              Each piece represents the creative journey of our workshop participants, featuring traditional Indian art techniques 
              and contemporary expressions learned through our hands-on workshop experiences. Explore the artistic growth and 
              cultural heritage celebrated in every workshop creation.
            </p>
          </div>
        </section>
      </div>

      {/* Artwork Detail Modal */}
      {isModalOpen && selectedArtwork && (
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
                  src={selectedArtwork.imageUrl} 
                  alt={selectedArtwork.title}
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
                  <div className="image-quality-badge">High Resolution</div>
                  <div className="artwork-category-badge">{selectedArtwork.category}</div>
                </div>
              </div>

              <div className="modal-details-section">
                <div className="modal-header">
                  <div className="modal-title-section">
                    <h2 className="modal-title">{selectedArtwork.title}</h2>
                    <p className="modal-artist">by {selectedArtwork.artist}</p>
                  </div>
                  <div className="modal-price-section">
                    <span className="price-label">Price</span>
                    <div className="modal-price">{selectedArtwork.price}</div>
                  </div>
                </div>

                <div className="modal-description">
                  <h3>About This Artwork</h3>
                  <p>{selectedArtwork.description}</p>
                </div>

                <div className="modal-specifications">
                  <h3>Specifications</h3>
                  <div className="spec-grid">
                    <div className="spec-item">
                      <span className="spec-label">Medium</span>
                      <span className="spec-value">{selectedArtwork.medium}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Year Created</span>
                      <span className="spec-value">{selectedArtwork.year}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Category</span>
                      <span className="spec-value">{selectedArtwork.category}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Artist</span>
                      <span className="spec-value">{selectedArtwork.artist}</span>
                    </div>
                  </div>
                </div>

                <div className="modal-additional-info">
                  <div className="artwork-authenticity">
                    <h4>Authenticity Guaranteed</h4>
                    <p>This artwork comes with a certificate of authenticity from Kalakritam Gallery.</p>
                  </div>
                  
                  <div className="artwork-care">
                    <h4>Care Instructions</h4>
                    <p>Keep away from direct sunlight. Clean gently with a soft, dry cloth. Frame with UV-protective glass for long-term preservation.</p>
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

export default Gallery;
