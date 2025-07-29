import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import Header from '../Header';
import Footer from '../Footer';
import Loading from '../Loading';
import './Home.css';
import '../../assets/fonts/fonts.css';

const Home = () => {
  const [showVideoLogo, setShowVideoLogo] = useState(false);
  const navigate = useNavigate();
  const { isLoading, navigateWithLoading } = useNavigationWithLoading();

  useEffect(() => {
    // Check if video was completed or if we're coming from intro
    const videoCompleted = sessionStorage.getItem('videoCompleted');
    const fromIntro = sessionStorage.getItem('fromIntro');
    
    if (videoCompleted || fromIntro) {
      setShowVideoLogo(true);
      // Set a flag that we've shown the logo
      sessionStorage.setItem('logoShown', 'true');
      // Clear the temporary flags
      sessionStorage.removeItem('videoCompleted');
      sessionStorage.removeItem('fromIntro');
    } else {
      // Check if logo was already shown in this session
      const logoShown = sessionStorage.getItem('logoShown');
      if (logoShown) {
        setShowVideoLogo(true);
      }
    }

    // SEO meta tags
    document.title = 'Kalakritam - Premier Art Gallery | Traditional & Contemporary Indian Art';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover Kalakritam - India\'s leading art gallery showcasing traditional kala, contemporary kritam, and cultural heritage. Explore masterpieces, join workshops, and connect with artists.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Discover Kalakritam - India\'s leading art gallery showcasing traditional kala, contemporary kritam, and cultural heritage. Explore masterpieces, join workshops, and connect with artists.';
      document.head.appendChild(meta);
    }

    // Keywords meta tag
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'Kalakritam, kala, kritam, Indian art, art gallery, traditional art, contemporary art, cultural heritage, art workshops, art community, Indian artists, art exhibitions');
    } else {
      const keywords = document.createElement('meta');
      keywords.name = 'keywords';
      keywords.content = 'Kalakritam, kala, kritam, Indian art, art gallery, traditional art, contemporary art, cultural heritage, art workshops, art community, Indian artists, art exhibitions';
      document.head.appendChild(keywords);
    }
  }, []);

  return (
    <div className="home-container">
      {/* Loading overlay */}
      {isLoading && <Loading />}
      
      {/* Video Logo in top-left corner */}
      {showVideoLogo && (
        <div className="video-logo-container">
          <video
            className="video-logo"
            muted
            loop
            autoPlay
            playsInline
          >
            <source src="/intro-video.mp4" type="video/mp4" />
          </video>
        </div>
      )}
      
      <Header currentPage="home" />
      
      <main className="home-content">
        <section className="hero-section">
          <div className="hero-text">
            <h2>Discover the Art of Creation </h2>
            <h3>Kalakritam Experience</h3>
            <p>
              Kalakritam is India's gateway to exploring the magnificent world of traditional <strong>kala</strong> (art) 
              and contemporary <strong>kritam</strong> (creation). Our gallery showcases the finest collection of 
              Indian artistic heritage, from ancient traditional paintings to modern contemporary masterpieces. 
              Join us on this extraordinary journey through India's rich cultural landscape and artistic evolution.
            </p>
            <button 
              className="cta-button" 
              aria-label="Start exploring Kalakritam art gallery"
              onClick={() => navigateWithLoading('/gallery')}
            >
              Explore Kalakritam Gallery
            </button>
          </div>
        </section>
        
        <section className="features-section">
          <h2 className="section-title">Experience Indian Art at Kalakritam</h2>
          <div className="features-grid">
            <article className="feature-card">
              <h3>Traditional Kala Gallery</h3>
              <p>Explore our curated collection of traditional Indian art forms including Madhubani, Warli, 
              Tanjore paintings, and classical sculptures. Each piece represents centuries of artistic heritage 
              and cultural significance in Indian art history.</p>
            </article>
            <article className="feature-card">
              <h3>Contemporary Kritam Workshops</h3>
              <p>Learn from master artists in our interactive workshops featuring modern art techniques, 
              digital art creation, and fusion styles. Perfect for beginners and advanced artists seeking 
              to explore contemporary Indian art expressions.</p>
            </article>
            <article className="feature-card">
              <h3>Kalakritam Community</h3>
              <p>Connect with fellow art enthusiasts, collectors, and creators in India's most vibrant 
              art community. Share your passion for Indian art, participate in exhibitions, and discover 
              emerging talents in the Kalakritam network.</p>
            </article>
          </div>
        </section>

        <section className="about-section">
          <h2>About Kalakritam - Preserving Indian Artistic Heritage</h2>
          <p>
            Kalakritam, derived from the Sanskrit words <em>kala</em> (art/skill) and <em>kritam</em> (creation/work), 
            represents our commitment to preserving and promoting Indian art forms. Founded with the vision of 
            bridging traditional Indian artistry with contemporary expressions, we serve as a cultural hub 
            for art lovers, collectors, and creators across India and beyond.
          </p>
          <p>
            Our gallery features over 500 masterpieces spanning various Indian art forms, regional styles, 
            and time periods. From ancient temple art to modern Indian contemporary works, Kalakritam 
            offers an immersive experience in India's artistic journey through the ages.
          </p>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
