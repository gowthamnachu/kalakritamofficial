import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import Header from '../Header';
import Footer from '../Footer';
import Loading from '../Loading';
import VideoLogo from '../VideoLogo';
import './Artists.css';

const Artists = () => {
  const navigate = useNavigate();
  const { isLoading, navigateWithLoading } = useNavigationWithLoading();

  const artists = [
    {
      id: 1,
      name: "Priya Sharma",
      specialty: "Traditional Madhubani",
      experience: "15+ years",
      location: "Bihar, India",
      bio: "Master artist specializing in traditional Madhubani paintings with expertise in natural pigments and ancient techniques.",
      achievements: ["National Art Award 2020", "UNESCO Cultural Heritage Recognition", "Featured in International Art Fair"]
    },
    {
      id: 2,
      name: "Rahul Kumar",
      specialty: "Contemporary Digital Art",
      experience: "8+ years",
      location: "Mumbai, India",
      bio: "Digital artist creating stunning contemporary pieces that blend traditional Indian motifs with modern technology.",
      achievements: ["Digital Art Excellence Award 2021", "Featured in Tech Art Magazine", "Solo Exhibition Mumbai 2022"]
    },
    {
      id: 3,
      name: "Anjali Devi",
      specialty: "Warli Tribal Art",
      experience: "20+ years",
      location: "Maharashtra, India",
      bio: "Traditional Warli artist preserving ancient tribal art forms through authentic techniques passed down through generations.",
      achievements: ["Tribal Art Preservation Award", "Cultural Heritage Ambassador", "International Folk Art Festival Winner"]
    }
  ];

  return (
    <div className="artists-container">
      {/* Loading overlay */}
      {isLoading && <Loading />}
      
      {/* Video Logo */}
      <VideoLogo />
      
      <Header currentPage="artists" />
      
      <div className="artists-page-content">
        <header className="artists-page-header">
          <h1 className="artists-title">Artists</h1>
          <p className="artists-subtitle">Meet Our Master Creators</p>
        </header>

        <main className="artists-content">
          <section className="artists-intro">
            <h2>Celebrating Artistic Excellence</h2>
            <p>Discover the talented artists who bring Kalakritam to life. Each artist in our community represents years of dedication, skill, and passion for their craft, carrying forward traditions while innovating for the future.</p>
          </section>

          <section className="artists-grid">
            {artists.map(artist => (
              <div key={artist.id} className="artist-card">
                <div className="artist-image">
                  <div className="artist-placeholder">
                    <span className="artist-initials">{artist.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                </div>
                <div className="artist-info">
                  <h3 className="artist-name">{artist.name}</h3>
                  <p className="artist-specialty">{artist.specialty}</p>
                  <div className="artist-details">
                    <span className="artist-experience">Experience: {artist.experience}</span>
                    <span className="artist-location">Location: {artist.location}</span>
                  </div>
                  <p className="artist-bio">{artist.bio}</p>
                  <div className="artist-achievements">
                    <h4>Achievements:</h4>
                    <ul>
                      {artist.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                  <button className="artist-contact-btn">Connect with Artist</button>
                </div>
              </div>
            ))}
          </section>

          <section className="become-artist">
            <div className="become-artist-content">
              <h2>Join Our Artist Community</h2>
              <p>Are you a passionate artist looking to showcase your work and connect with fellow creators? Join the Kalakritam artist community and be part of India's premier art gallery.</p>
              <button className="apply-btn">Apply to Showcase</button>
            </div>
          </section>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Artists;
