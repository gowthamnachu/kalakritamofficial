import React, { useState } from 'react';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import Header from '../Header';
import Footer from '../Footer';
import VideoLogo from '../VideoLogo';
import './Artists.css';

const Artists = () => {
  const { navigateWithLoading } = useNavigationWithLoading();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (artist) => {
    setSelectedArtist(artist);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArtist(null);
  };

  const artists = [
    {
      id: 1,
      name: "Priya Sharma",
      specialty: "Traditional Madhubani",
      category: "traditional",
      experience: "15+ years",
      location: "Bihar, India",
      image: "/artists/priya-sharma.jpg",
      bio: "Master artist specializing in traditional Madhubani paintings with expertise in natural pigments and ancient techniques. Her work has been exhibited in galleries across India and internationally.",
      achievements: ["National Art Award 2020", "UNESCO Cultural Heritage Recognition", "Featured in International Art Fair"],
      artworks: "50+ Traditional Paintings",
      students: "200+ Students Trained",
      exhibitions: "15 Solo Exhibitions",
      contact: "priya.sharma@kalakritam.com",
      portfolio: [
        "/portfolio/priya-1.jpg",
        "/portfolio/priya-2.jpg", 
        "/portfolio/priya-3.jpg",
        "/portfolio/priya-4.jpg"
      ]
    },
    {
      id: 2,
      name: "Rahul Kumar",
      specialty: "Contemporary Digital Art",
      category: "contemporary",
      experience: "8+ years",
      location: "Mumbai, India",
      image: "/artists/rahul-kumar.jpg",
      bio: "Digital artist creating stunning contemporary pieces that blend traditional Indian motifs with modern technology. Pioneer in digital art movement in India.",
      achievements: ["Digital Art Excellence Award 2021", "Featured in Tech Art Magazine", "Solo Exhibition Mumbai 2022"],
      artworks: "100+ Digital Artworks",
      students: "150+ Students Trained",
      exhibitions: "10 Digital Art Shows",
      contact: "rahul.kumar@kalakritam.com",
      portfolio: [
        "/portfolio/rahul-1.jpg",
        "/portfolio/rahul-2.jpg",
        "/portfolio/rahul-3.jpg", 
        "/portfolio/rahul-4.jpg"
      ]
    },
    {
      id: 3,
      name: "Anjali Devi",
      specialty: "Warli Tribal Art",
      category: "traditional",
      experience: "20+ years",
      location: "Maharashtra, India",
      image: "/artists/anjali-devi.jpg",
      bio: "Traditional Warli artist preserving ancient tribal art forms through authentic techniques passed down through generations. Cultural heritage ambassador for tribal arts.",
      achievements: ["Tribal Art Preservation Award", "Cultural Heritage Ambassador", "International Folk Art Festival Winner"],
      artworks: "80+ Warli Paintings",
      students: "300+ Students Trained",
      exhibitions: "20 Cultural Exhibitions",
      contact: "anjali.devi@kalakritam.com",
      portfolio: [
        "/portfolio/anjali-1.jpg",
        "/portfolio/anjali-2.jpg",
        "/portfolio/anjali-3.jpg",
        "/portfolio/anjali-4.jpg"
      ]
    },
    {
      id: 4,
      name: "Vikram Singh",
      specialty: "Rajasthani Miniature",
      category: "traditional",
      experience: "12+ years",
      location: "Rajasthan, India",
      image: "/artists/vikram-singh.jpg",
      bio: "Master of Rajasthani miniature painting with expertise in intricate brushwork and royal themes. Preserving the royal art traditions of Rajasthan.",
      achievements: ["Royal Art Heritage Award", "Miniature Art Championship", "Featured in National Geographic"],
      artworks: "60+ Miniature Paintings",
      students: "120+ Students Trained", 
      exhibitions: "12 Heritage Exhibitions",
      contact: "vikram.singh@kalakritam.com",
      portfolio: [
        "/portfolio/vikram-1.jpg",
        "/portfolio/vikram-2.jpg",
        "/portfolio/vikram-3.jpg",
        "/portfolio/vikram-4.jpg"
      ]
    },
    {
      id: 5,
      name: "Meera Patel",
      specialty: "Abstract Fusion",
      category: "contemporary", 
      experience: "10+ years",
      location: "Bangalore, India",
      image: "/artists/meera-patel.jpg",
      bio: "Contemporary artist creating abstract fusion art that combines traditional Indian elements with modern abstract techniques. Known for vibrant color palettes.",
      achievements: ["Contemporary Art Award 2023", "Fusion Art Pioneer", "International Abstract Art Festival"],
      artworks: "75+ Abstract Paintings",
      students: "180+ Students Trained",
      exhibitions: "8 Contemporary Shows",
      contact: "meera.patel@kalakritam.com",
      portfolio: [
        "/portfolio/meera-1.jpg",
        "/portfolio/meera-2.jpg",
        "/portfolio/meera-3.jpg",
        "/portfolio/meera-4.jpg"
      ]
    },
    {
      id: 6,
      name: "Suresh Reddy",
      specialty: "Sculpture & Bronze Work",
      category: "sculpture",
      experience: "18+ years",
      location: "Hyderabad, India",
      image: "/artists/suresh-reddy.jpg",
      bio: "Master sculptor specializing in bronze work and traditional Indian sculpture. His work bridges ancient techniques with contemporary forms.",
      achievements: ["National Sculpture Award", "Bronze Art Excellence", "Cultural Ministry Recognition"],
      artworks: "40+ Sculptures",
      students: "90+ Students Trained",
      exhibitions: "15 Sculpture Exhibitions",
      contact: "suresh.reddy@kalakritam.com",
      portfolio: [
        "/portfolio/suresh-1.jpg",
        "/portfolio/suresh-2.jpg",
        "/portfolio/suresh-3.jpg",
        "/portfolio/suresh-4.jpg"
      ]
    }
  ];

  const categories = [
    'all',
    'traditional',
    'contemporary', 
    'sculpture'
  ];

  const filteredArtists = selectedCategory === 'all'
    ? artists
    : artists.filter(artist => artist.category === selectedCategory);

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
                    src={artist.image} 
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
                      <p>{artist.specialty}</p>
                      <span className="artist-experience">{artist.experience}</span>
                    </div>
                  </div>
                </div>
                
                <div className="artist-info">
                  <h4 className="artist-name">{artist.name}</h4>
                  <p className="artist-specialty">{artist.specialty}</p>
                  <p className="artist-bio">{artist.bio}</p>
                  
                  <div className="artist-details">
                    <div className="detail-row">
                      <span className="detail-label">Experience:</span>
                      <span className="detail-value">{artist.experience}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{artist.location}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Artworks:</span>
                      <span className="detail-value">{artist.artworks}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Students:</span>
                      <span className="detail-value">{artist.students}</span>
                    </div>
                  </div>
                  
                  <div className="artist-actions">
                    <button 
                      className="btn-details"
                      onClick={() => handleViewDetails(artist)}
                    >
                      View Profile
                    </button>
                    <button className="btn-contact">Connect</button>
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
            <h2>About Our Artists</h2>
            <p>
              Our artists are the heart of Kalakritam, representing diverse art forms and cultural traditions from across India. 
              Each artist brings decades of expertise, cultural knowledge, and passionate dedication to preserving and evolving 
              artistic heritage. They serve as mentors, creators, and cultural ambassadors in our artistic community.
            </p>
            <div className="artists-stats">
              <div className="stat-item">
                <span className="stat-number">25+</span>
                <span className="stat-label">Master Artists</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">15+</span>
                <span className="stat-label">Art Forms</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1000+</span>
                <span className="stat-label">Students Trained</span>
              </div>
            </div>
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
                  src={selectedArtist.image} 
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
                  <div className="artwork-category-badge">{selectedArtist.category}</div>
                </div>
              </div>

              <div className="modal-details-section">
                <div className="modal-header">
                  <div className="modal-title-section">
                    <h2 className="modal-title">{selectedArtist.name}</h2>
                    <p className="modal-artist">{selectedArtist.specialty}</p>
                  </div>
                  <div className="modal-price-section">
                    <span className="price-label">Experience</span>
                    <div className="modal-price">{selectedArtist.experience}</div>
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
                      <span className="spec-label">Specialty</span>
                      <span className="spec-value">{selectedArtist.specialty}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Experience</span>
                      <span className="spec-value">{selectedArtist.experience}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Location</span>
                      <span className="spec-value">{selectedArtist.location}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Artworks</span>
                      <span className="spec-value">{selectedArtist.artworks}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Students</span>
                      <span className="spec-value">{selectedArtist.students}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Exhibitions</span>
                      <span className="spec-value">{selectedArtist.exhibitions}</span>
                    </div>
                  </div>
                </div>

                <div className="modal-additional-info">
                  <div className="artwork-authenticity">
                    <h4>Achievements</h4>
                    <ul>
                      {selectedArtist.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="artwork-care">
                    <h4>Contact Information</h4>
                    <p>Connect with {selectedArtist.name.split(' ')[0]} for collaborations, workshops, or art inquiries.</p>
                    <p>Email: {selectedArtist.contact}</p>
                  </div>
                </div>
              </div>

              <div className="learning-showcase">
                <h3>Portfolio Showcase</h3>
                <p className="learning-description">Explore some of {selectedArtist.name.split(' ')[0]}'s finest works</p>
                
                <div className="learning-collage">
                  {selectedArtist.portfolio.map((imageSrc, index) => (
                    <div key={index} className="learning-image-container">
                      <img 
                        src={imageSrc} 
                        alt={`Portfolio piece ${index + 1}`}
                        className="learning-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="learning-image-placeholder" style={{ display: 'none' }}>
                        <div className="kalakritam-logo-small">Kalakritam</div>
                      </div>
                    </div>
                  ))}
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
