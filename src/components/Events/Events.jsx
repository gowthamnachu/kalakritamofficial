import React, { useState } from 'react';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import Header from '../Header';
import Footer from '../Footer';
import Loading from '../Loading';
import VideoLogo from '../VideoLogo';
import './Events.css';

const Events = () => {
  const { isLoading } = useNavigationWithLoading();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const events = [
    {
      id: 1,
      title: "Traditional Madhubani Art Exhibition",
      date: "March 15-30, 2025",
      time: "10:00 AM - 6:00 PM",
      category: "exhibition",
      location: "Main Gallery Hall",
      description: "Explore the vibrant world of Madhubani paintings featuring works from renowned artists of Bihar.",
      image: "/events/madhubani-exhibition.jpg",
      price: "Free Entry"
    },
    {
      id: 2,
      title: "Contemporary Art Workshop",
      date: "April 5-7, 2025",
      time: "2:00 PM - 5:00 PM",
      category: "workshop",
      location: "Workshop Studio",
      description: "Learn modern art techniques from master artists in this intensive 3-day workshop.",
      image: "/events/contemporary-workshop.jpg",
      price: "₹4,500"
    },
    {
      id: 3,
      title: "Indian Classical Music & Art Evening",
      date: "April 12, 2025",
      time: "7:00 PM - 9:00 PM",
      category: "performance",
      location: "Amphitheater",
      description: "An enchanting evening combining classical Indian music with live painting performances.",
      image: "/events/music-art-evening.jpg",
      price: "₹800"
    },
    {
      id: 4,
      title: "Pottery & Ceramics Masterclass",
      date: "April 20-22, 2025",
      time: "10:00 AM - 4:00 PM",
      category: "workshop",
      location: "Ceramics Studio",
      description: "Master the ancient art of pottery with traditional wheel throwing techniques.",
      image: "/events/pottery-masterclass.jpg",
      price: "₹3,500"
    },
    {
      id: 5,
      title: "Digital Art in Indian Context",
      date: "May 1-3, 2025",
      time: "11:00 AM - 3:00 PM",
      category: "exhibition",
      location: "Digital Gallery",
      description: "Discover how digital tools are revolutionizing traditional Indian art forms.",
      image: "/events/digital-art.jpg",
      price: "₹200"
    },
    {
      id: 6,
      title: "Art Therapy for Wellness",
      date: "May 10, 2025",
      time: "4:00 PM - 6:00 PM",
      category: "workshop",
      location: "Wellness Studio",
      description: "Explore the healing power of art through guided therapy sessions.",
      image: "/events/art-therapy.jpg",
      price: "₹1,200"
    }
  ];

  const categories = ['all', 'exhibition', 'workshop', 'performance'];

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category === selectedCategory);

  return (
    <div className="events-container">
      {isLoading && <Loading />}
      
      {/* Video Logo */}
      <VideoLogo />
      
      <Header currentPage="events" />
      
      <main className="events-content">
        <section className="events-hero">
          <h1 className="events-title">Events</h1>
          <p className="events-subtitle">Discover Art Through Experiences</p>
        </section>

        <section className="events-filter">
          <div className="filter-buttons">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'All Events' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </section>

        <section className="events-grid">
          {filteredEvents.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-image">
                <div className="event-placeholder">
                  <span className="event-category">{event.category}</span>
                </div>
              </div>
              <div className="event-content">
                <h3 className="event-title">{event.title}</h3>
                <div className="event-details">
                  <div className="event-date">
                    <strong>Date:</strong> {event.date}
                  </div>
                  <div className="event-time">
                    <strong>Time:</strong> {event.time}
                  </div>
                  <div className="event-location">
                    <strong>Location:</strong> {event.location}
                  </div>
                  <div className="event-price">
                    <strong>Price:</strong> {event.price}
                  </div>
                </div>
                <p className="event-description">{event.description}</p>
                <div className="event-actions">
                  <button className="register-btn">Register Now</button>
                  <button className="learn-more-btn">Learn More</button>
                </div>
              </div>
            </div>
          ))}
        </section>

        {filteredEvents.length === 0 && (
          <div className="no-events">
            <p>No events found in this category.</p>
          </div>
        )}

        <section className="upcoming-highlights">
          <h2>Event Highlights</h2>
          <div className="highlights-content">
            <p>Join us for an exciting lineup of exhibitions, workshops, and cultural performances that celebrate the rich heritage of Indian art. Whether you're a seasoned artist or just beginning your artistic journey, our events offer something special for everyone.</p>
            <div className="highlight-features">
              <div className="feature">
                <h4>Expert Artists</h4>
                <p>Learn from master artists and renowned practitioners</p>
              </div>
              <div className="feature">
                <h4>Hands-on Experience</h4>
                <p>Interactive workshops and practical learning sessions</p>
              </div>
              <div className="feature">
                <h4>Cultural Immersion</h4>
                <p>Deep dive into Indian art traditions and contemporary expressions</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Events;
