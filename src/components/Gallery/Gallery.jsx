import React, { useState } from 'react';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import Header from '../Header';
import Footer from '../Footer';
import Loading from '../Loading';
import VideoLogo from '../VideoLogo';
import './Gallery.css';

const Gallery = () => {
  const { isLoading } = useNavigationWithLoading();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Enhanced gallery data with Indian art themes
  const artworks = [
    {
      id: 1,
      title: "Madhubani Peacock",
      artist: "Priya Sharma",
      category: "traditional",
      image: "/gallery/madhubani-peacock.jpg",
      description: "Traditional Madhubani painting featuring a vibrant peacock with intricate patterns and natural colors.",
      price: "₹15,000",
      year: "2024",
      medium: "Natural pigments on handmade paper"
    },
    {
      id: 2,
      title: "Kerala Mural Goddess",
      artist: "Ramesh Nair",
      category: "traditional",
      image: "/gallery/kerala-mural.jpg",
      description: "Classical Kerala mural painting depicting a goddess with traditional gold and mineral colors.",
      price: "₹25,000",
      year: "2023",
      medium: "Natural pigments on canvas"
    },
    {
      id: 3,
      title: "Warli Village Life",
      artist: "Anjali Devi",
      category: "tribal",
      image: "/gallery/warli-village.jpg",
      description: "Authentic Warli tribal art depicting daily village life with traditional white pigments.",
      price: "₹8,500",
      year: "2024",
      medium: "White pigment on terracotta"
    },
    {
      id: 4,
      title: "Contemporary Lotus",
      artist: "Rahul Kumar",
      category: "contemporary",
      image: "/gallery/contemporary-lotus.jpg",
      description: "Modern interpretation of the sacred lotus using digital art techniques and traditional motifs.",
      price: "₹12,000",
      year: "2024",
      medium: "Digital art print on canvas"
    },
    {
      id: 5,
      title: "Rajasthani Miniature",
      artist: "Meera Rajput",
      category: "miniature",
      image: "/gallery/rajasthani-miniature.jpg",
      description: "Exquisite Rajasthani miniature painting with fine details and royal themes.",
      price: "₹18,500",
      year: "2023",
      medium: "Watercolor on paper"
    },
    {
      id: 6,
      title: "Ganesha Bronze",
      artist: "Suresh Patel",
      category: "sculpture",
      image: "/gallery/ganesha-bronze.jpg",
      description: "Traditional bronze sculpture of Lord Ganesha crafted using ancient lost-wax technique.",
      price: "₹35,000",
      year: "2024",
      medium: "Bronze sculpture"
    },
    {
      id: 7,
      title: "Tanjore Radha Krishna",
      artist: "Lakshmi Venkat",
      category: "traditional",
      image: "/gallery/tanjore-painting.jpg",
      description: "Classical Tanjore painting with gold foil work depicting Radha Krishna.",
      price: "₹22,000",
      year: "2023",
      medium: "Gold foil and gems on wood"
    },
    {
      id: 8,
      title: "Abstract Mandala",
      artist: "Vikram Singh",
      category: "contemporary",
      image: "/gallery/abstract-mandala.jpg",
      description: "Contemporary mandala art blending traditional spiritual symbols with modern aesthetics.",
      price: "₹14,000",
      year: "2024",
      medium: "Acrylic on canvas"
    }
  ];

  const categories = [
    'all', 
    'traditional', 
    'contemporary', 
    'tribal', 
    'miniature', 
    'sculpture'
  ];

  const filteredArtworks = selectedCategory === 'all' 
    ? artworks 
    : artworks.filter(artwork => artwork.category === selectedCategory);

  return (
    <div className="gallery-container">
      {/* Loading overlay */}
      {isLoading && <Loading />}
      
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
                {category.charAt(0).toUpperCase() + category.slice(1)}
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
                    src={artwork.image} 
                    alt={artwork.title}
                    className="artwork-image"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjNmM2YzIi8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzEyNy45MDkgMTAwIDExMCAxMTcuOTA5IDExMCAxNDBDMTEwIDE2Mi4wOTEgMTI3LjkwOSAxODAgMTUwIDE4MEMxNzIuMDkxIDE4MCAxOTAgMTYyLjA5MSAxOTAgMTQwQzE5MCAxMTcuOTA5IDE3Mi4wOTEgMTAwIDE1MCAxMDBaTTE1MCAyMDBDMTE2LjY2MyAyMDAgOTAgMTczLjMzNyA5MDE0MEM5MCAxMDYuNjYzIDExNi42NjMgODAgMTUwIDgwQzE4My4zMzcgODAgMjEwIDEwNi42NjMgMjEwIDE0MEMyMTAgMTczLjMzNyAxODMuMzM3IDIwMCAxNTAgMjAwWiIgZmlsbD0iI2M4YzhjOCIvPgo8L3N2Zz4K';
                    }}
                  />
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
                      <button className="btn-view">View Details</button>
                      <button className="btn-inquiry">Inquire</button>
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
            <h2>About Our Collection</h2>
            <p>
              Our gallery features over 200 carefully curated artworks from renowned Indian artists. 
              Each piece represents the rich cultural heritage and artistic traditions of India, 
              from ancient techniques passed down through generations to contemporary interpretations 
              that bridge the gap between tradition and modernity.
            </p>
            <div className="gallery-stats">
              <div className="stat-item">
                <span className="stat-number">200+</span>
                <span className="stat-label">Artworks</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Artists</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">15+</span>
                <span className="stat-label">Art Forms</span>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default Gallery;
