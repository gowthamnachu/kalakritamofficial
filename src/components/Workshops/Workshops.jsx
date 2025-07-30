import React, { useState } from 'react';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import Header from '../Header';
import Footer from '../Footer';
import VideoLogo from '../VideoLogo';
import './Workshops.css';

const Workshops = () => {
  const { navigateWithLoading } = useNavigationWithLoading();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Enhanced workshops data with Indian art themes
  const workshops = [
    {
      id: 1,
      title: "Traditional Madhubani Painting",
      instructor: "Master Priya Sharma",
      category: "upcoming",
      level: "Beginner to Intermediate",
      duration: "3 Days",
      price: "₹4,500",
      startDate: "August 15, 2025",
      endDate: "August 17, 2025",
      time: "10:00 AM - 4:00 PM",
      venue: "Kalakritam Art Studio, Delhi",
      image: "/workshops/madhubani-workshop.jpg",
      description: "Learn the ancient art of Madhubani painting with traditional techniques, natural pigments, and authentic patterns from Bihar's cultural heritage.",
      materials: "All materials provided including natural pigments, brushes, and handmade paper",
      maxStudents: 15,
      prerequisites: "None - suitable for beginners"
    },
    {
      id: 2,
      title: "Kerala Mural Painting Masterclass",
      instructor: "Guru Ramesh Nair",
      category: "upcoming",
      level: "Intermediate to Advanced",
      duration: "5 Days",
      price: "₹8,500",
      startDate: "September 1, 2025",
      endDate: "September 5, 2025",
      time: "9:00 AM - 5:00 PM",
      venue: "Heritage Art Center, Kochi",
      image: "/workshops/kerala-mural-workshop.jpg",
      description: "Master the classical Kerala mural painting techniques with gold leaf application, traditional mineral colors, and temple art iconography.",
      materials: "Canvas, brushes, mineral pigments, gold leaf, and binding agents included",
      maxStudents: 10,
      prerequisites: "Basic painting experience recommended"
    },
    {
      id: 3,
      title: "Warli Tribal Art Workshop",
      instructor: "Artist Anjali Devi",
      category: "past",
      level: "Beginner",
      duration: "2 Days",
      price: "₹3,200",
      startDate: "June 25, 2025",
      endDate: "June 26, 2025",
      time: "10:00 AM - 3:00 PM",
      venue: "Tribal Art Museum, Mumbai",
      image: "/workshops/warli-workshop.jpg",
      description: "Explore the beautiful Warli tribal art form using traditional white pigments on terracotta and learn about the cultural significance of each motif.",
      materials: "Terracotta surfaces, white pigments, brushes, and reference materials provided",
      maxStudents: 20,
      prerequisites: "None - perfect for beginners"
    },
    {
      id: 4,
      title: "Digital Art with Traditional Motifs",
      instructor: "Artist Rahul Kumar",
      category: "upcoming",
      level: "Intermediate",
      duration: "4 Days",
      price: "₹6,800",
      startDate: "September 10, 2025",
      endDate: "September 13, 2025",
      time: "11:00 AM - 5:00 PM",
      venue: "Digital Arts Hub, Bangalore",
      image: "/workshops/digital-art-workshop.jpg",
      description: "Blend traditional Indian motifs with modern digital art techniques using professional software and create contemporary art pieces.",
      materials: "Digital tablets, software licenses, and styluses provided",
      maxStudents: 12,
      prerequisites: "Basic computer skills required"
    },
    {
      id: 5,
      title: "Rajasthani Miniature Painting",
      instructor: "Master Meera Rajput",
      category: "upcoming",
      level: "Advanced",
      duration: "6 Days",
      price: "₹12,000",
      startDate: "October 1, 2025",
      endDate: "October 6, 2025",
      time: "9:00 AM - 4:00 PM",
      venue: "Royal Arts Academy, Jaipur",
      image: "/workshops/miniature-workshop.jpg",
      description: "Learn the intricate art of Rajasthani miniature painting with fine brushwork, detailed compositions, and traditional royal themes.",
      materials: "Fine brushes, watercolors, gold paint, and specialized paper included",
      maxStudents: 8,
      prerequisites: "Previous painting experience essential"
    },
    {
      id: 6,
      title: "Bronze Sculpture Basics",
      instructor: "Sculptor Suresh Patel",
      category: "past",
      level: "Beginner to Intermediate",
      duration: "7 Days",
      price: "₹15,500",
      startDate: "May 20, 2025",
      endDate: "May 26, 2025",
      time: "10:00 AM - 6:00 PM",
      venue: "Sculpture Workshop, Chennai",
      image: "/workshops/bronze-sculpture-workshop.jpg",
      description: "Introduction to bronze sculpture techniques including modeling, molding, and casting using traditional lost-wax methods.",
      materials: "Clay, wax, bronze, tools, and safety equipment provided",
      maxStudents: 6,
      prerequisites: "Physical ability to work with heavy materials"
    },
    {
      id: 7,
      title: "Tanjore Painting with Gold Work",
      instructor: "Artist Lakshmi Venkat",
      category: "upcoming",
      level: "Intermediate",
      duration: "4 Days",
      price: "₹7,200",
      startDate: "August 30, 2025",
      endDate: "September 2, 2025",
      time: "10:00 AM - 4:00 PM",
      venue: "Traditional Arts Center, Thanjavur",
      image: "/workshops/tanjore-workshop.jpg",
      description: "Learn the classical Tanjore painting style with gold foil work, gem inlaying, and traditional South Indian iconography.",
      materials: "Wood panels, gold foil, gems, paints, and adhesives included",
      maxStudents: 12,
      prerequisites: "Basic painting skills recommended"
    },
    {
      id: 8,
      title: "Contemporary Mandala Art",
      instructor: "Artist Vikram Singh",
      category: "past",
      level: "Beginner to Intermediate",
      duration: "3 Days",
      price: "₹4,800",
      startDate: "July 15, 2025",
      endDate: "July 17, 2025",
      time: "10:00 AM - 3:00 PM",
      venue: "Modern Art Studio, Pune",
      image: "/workshops/mandala-workshop.jpg",
      description: "Create beautiful mandala art combining traditional spiritual symbols with contemporary design aesthetics and color theories.",
      materials: "Canvas, acrylic paints, brushes, and geometric tools provided",
      maxStudents: 18,
      prerequisites: "None - suitable for all levels"
    }
  ];

  const categories = [
    'all',
    'upcoming',
    'past'
  ];

  const filteredWorkshops = selectedCategory === 'all'
    ? workshops
    : workshops.filter(workshop => workshop.category === selectedCategory);

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

        <section className="workshops-filters">
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

        <main className="workshops-content">
          <div className="workshops-count">
            <p>Showing {filteredWorkshops.length} workshop{filteredWorkshops.length !== 1 ? 's' : ''}</p>
          </div>
          
          <div className="workshops-grid">
            {filteredWorkshops.map(workshop => (
              <div key={workshop.id} className="workshop-card">
                <div className="workshop-image-container">
                  <img 
                    src={workshop.image} 
                    alt={workshop.title}
                    className="workshop-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const placeholder = e.target.parentNode.querySelector('.workshop-image-placeholder');
                      if (placeholder) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="workshop-image-placeholder" style={{ display: 'none' }}>
                    <div className="kalakritam-logo-text">Kalakritam</div>
                    <div className="image-not-available-small">Image not available</div>
                  </div>
                  <div className="workshop-overlay">
                    <div className="workshop-overlay-content">
                      <h3>{workshop.title}</h3>
                      <p>by {workshop.instructor}</p>
                      <span className="workshop-price">{workshop.price}</span>
                    </div>
                  </div>
                </div>
                
                <div className="workshop-info">
                  <h4 className="workshop-title">{workshop.title}</h4>
                  <p className="workshop-instructor">by {workshop.instructor}</p>
                  <p className="workshop-description">{workshop.description}</p>
                  
                  <div className="workshop-details">
                    <div className="detail-row">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{workshop.duration}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Level:</span>
                      <span className="detail-value">{workshop.level}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Venue:</span>
                      <span className="detail-value">{workshop.venue}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Dates:</span>
                      <span className="detail-value">{workshop.startDate} - {workshop.endDate}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">{workshop.time}</span>
                    </div>
                  </div>
                  
                  <div className="workshop-actions">
                    <span className="workshop-price-display">{workshop.price}</span>
                    <div className="action-buttons">
                      <button className="btn-details">View Details</button>
                      <button className="btn-enroll">Enroll Now</button>
                    </div>
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
            <h2>About Our Workshops</h2>
            <p>
              Our workshops are designed to preserve and promote India's rich artistic heritage while fostering innovation in contemporary art forms. 
              Each workshop is led by master artists and experienced instructors who bring decades of expertise and cultural knowledge. 
              We provide all necessary materials and maintain small class sizes to ensure personalized attention and hands-on learning.
            </p>
            <div className="workshops-stats">
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Workshops</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">25+</span>
                <span className="stat-label">Master Artists</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Students Trained</span>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default Workshops;
