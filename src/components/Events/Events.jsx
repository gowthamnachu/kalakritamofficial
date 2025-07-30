import React, { useState } from 'react';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import Header from '../Header';
import Footer from '../Footer';
import VideoLogo from '../VideoLogo';
import './Events.css';

const Events = () => {
  const { navigateWithLoading } = useNavigationWithLoading();
  const [selectedView, setSelectedView] = useState('upcoming');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const upcomingEvents = [
    {
      id: 1,
      title: "Traditional Madhubani Art Workshop",
      date: "August 15, 2025",
      time: "10:00 AM - 4:00 PM",
      location: "Main Gallery Hall",
      description: "Immerse yourself in the vibrant world of Madhubani paintings. Learn traditional techniques from master artists of Bihar and create your own masterpiece.",
      instructor: "Artist Sita Devi",
      price: "₹2,500",
      duration: "6 hours",
      materials: "All materials provided including natural pigments, brushes, and handmade paper",
      maxParticipants: 20,
      poster: "/events/art poster.png",
      highlights: [
        "Learn traditional Madhubani techniques",
        "Natural pigment preparation",
        "Cultural storytelling through art",
        "Take home your completed artwork"
      ]
    },
    {
      id: 2,
      title: "Contemporary Fusion Art Exhibition",
      date: "August 22, 2025",
      time: "6:00 PM - 9:00 PM",
      location: "Contemporary Wing",
      description: "Experience the fusion of traditional Indian art with modern contemporary styles. This exhibition showcases works from emerging and established artists.",
      curator: "Dr. Rajesh Sharma",
      price: "₹300",
      duration: "3 hours",
      artworks: "Over 50 contemporary fusion pieces",
      artists: "25 featured artists",
      poster: "/events/fusion-exhibition-poster.jpg",
      highlights: [
        "Interactive artist talks",
        "Live demonstration sessions",
        "Networking with artists",
        "Art appreciation workshop"
      ]
    },
    {
      id: 3,
      title: "Pottery & Wheel Throwing Masterclass",
      date: "August 29, 2025",
      time: "2:00 PM - 6:00 PM",
      location: "Ceramics Studio",
      description: "Master the ancient art of pottery with traditional wheel throwing techniques. Learn from skilled artisans and create functional pottery pieces.",
      instructor: "Master Potter Ramesh Kumar",
      price: "₹3,500",
      duration: "4 hours",
      materials: "Clay, glazes, and firing included",
      maxParticipants: 12,
      poster: "/events/pottery-masterclass-poster.jpg",
      highlights: [
        "Traditional wheel throwing techniques",
        "Glazing and firing process",
        "Create 3-4 pottery pieces",
        "Ancient pottery traditions"
      ]
    }
  ];

  const monthlyCalendar = {
    august2025: [
      { date: 1, event: "Watercolor Basics", type: "workshop" },
      { date: 5, event: "Artist Meet & Greet", type: "social" },
      { date: 8, event: "Folk Art Exhibition Opens", type: "exhibition" },
      { date: 12, event: "Children's Art Camp", type: "workshop" },
      { date: 15, event: "Madhubani Workshop", type: "workshop" },
      { date: 18, event: "Art Therapy Session", type: "wellness" },
      { date: 22, event: "Fusion Art Exhibition", type: "exhibition" },
      { date: 25, event: "Sketching Workshop", type: "workshop" },
      { date: 29, event: "Pottery Masterclass", type: "workshop" }
    ]
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const year = 2025;
    const month = 7; // August (0-indexed)
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];
    const events = monthlyCalendar.august2025;

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = events.filter(event => event.date === day);
      days.push(
        <div key={day} className="calendar-day">
          <div className="day-number">{day}</div>
          {dayEvents.map((event, index) => (
            <div key={index} className={`day-event ${event.type}`}>
              {event.event}
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="events-container">
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
            <button
              className={`filter-btn ${selectedView === 'upcoming' ? 'active' : ''}`}
              onClick={() => setSelectedView('upcoming')}
            >
              Upcoming Events
            </button>
            <button
              className={`filter-btn ${selectedView === 'calendar' ? 'active' : ''}`}
              onClick={() => setSelectedView('calendar')}
            >
              Monthly Event Calendar
            </button>
          </div>
        </section>

        {selectedView === 'upcoming' && (
          <section className="upcoming-events">
            <div className="events-grid">
              {upcomingEvents.map(event => (
                <div key={event.id} className="event-card" onClick={() => handleEventClick(event)}>
                  <div className="event-poster">
                    <img 
                      src={event.poster} 
                      alt={event.title}
                      className="poster-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="poster-placeholder" style={{ display: 'none' }}>
                      <div className="kalakritam-logo-text">Kalakritam</div>
                      <div className="event-type">Event Poster</div>
                    </div>
                    <div className="event-date-badge">
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  <div className="event-content">
                    <h3 className="event-title">{event.title}</h3>
                    <div className="event-quick-details">
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
                      <button className="view-details-btn">View Details</button>
                      <button className="register-btn">Register Now</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {selectedView === 'calendar' && (
          <section className="calendar-view">
            <div className="calendar-header">
              <h2>August 2025</h2>
            </div>
            <div className="calendar-grid">
              <div className="calendar-weekdays">
                <div className="weekday">Sun</div>
                <div className="weekday">Mon</div>
                <div className="weekday">Tue</div>
                <div className="weekday">Wed</div>
                <div className="weekday">Thu</div>
                <div className="weekday">Fri</div>
                <div className="weekday">Sat</div>
              </div>
              <div className="calendar-days">
                {renderCalendar()}
              </div>
            </div>
            <div className="calendar-legend">
              <div className="legend-item">
                <span className="legend-color workshop"></span>
                <span>Workshop</span>
              </div>
              <div className="legend-item">
                <span className="legend-color exhibition"></span>
                <span>Exhibition</span>
              </div>
              <div className="legend-item">
                <span className="legend-color social"></span>
                <span>Social Event</span>
              </div>
              <div className="legend-item">
                <span className="legend-color wellness"></span>
                <span>Wellness</span>
              </div>
            </div>
          </section>
        )}

        {/* Event Detail Modal */}
        {isModalOpen && selectedEvent && (
          <div className="event-modal-overlay" onClick={closeModal}>
            <div className="event-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={closeModal}>
                <div className="close-icon-circle">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </div>
              </button>
              
              <div className="modal-content">
                <div className="modal-poster-section">
                  <img 
                    src={selectedEvent.poster} 
                    alt={selectedEvent.title}
                    className="modal-poster-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="poster-placeholder" style={{ display: 'none' }}>
                    <div className="kalakritam-logo-text">Kalakritam</div>
                    <div className="event-type">Event Poster</div>
                  </div>
                </div>

                <div className="modal-details-section">
                  <div className="modal-header">
                    <h2 className="modal-title">{selectedEvent.title}</h2>
                    <div className="modal-price-section">
                      <span className="price-label">Price</span>
                      <div className="modal-price">{selectedEvent.price}</div>
                    </div>
                  </div>

                  <div className="modal-description">
                    <h3>About This Event</h3>
                    <p>{selectedEvent.description}</p>
                  </div>

                  <div className="modal-specifications">
                    <h3>Event Details</h3>
                    <div className="spec-grid">
                      <div className="spec-item">
                        <span className="spec-label">Date</span>
                        <span className="spec-value">{selectedEvent.date}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Time</span>
                        <span className="spec-value">{selectedEvent.time}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Duration</span>
                        <span className="spec-value">{selectedEvent.duration}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Location</span>
                        <span className="spec-value">{selectedEvent.location}</span>
                      </div>
                      {selectedEvent.instructor && (
                        <div className="spec-item">
                          <span className="spec-label">Instructor</span>
                          <span className="spec-value">{selectedEvent.instructor}</span>
                        </div>
                      )}
                      {selectedEvent.curator && (
                        <div className="spec-item">
                          <span className="spec-label">Curator</span>
                          <span className="spec-value">{selectedEvent.curator}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="modal-highlights">
                    <h3>Event Highlights</h3>
                    <ul className="highlights-list">
                      {selectedEvent.highlights.map((highlight, index) => (
                        <li key={index}>{highlight}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="modal-actions">
                    <button className="register-modal-btn">Register Now</button>
                    <button className="share-btn">Share Event</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Events;
