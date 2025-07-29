import React from 'react';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import Header from '../Header';
import Footer from '../Footer';
import Loading from '../Loading';
import VideoLogo from '../VideoLogo';
import './About.css';

const About = () => {
  const { isLoading } = useNavigationWithLoading();

  return (
    <div className="about-container">
      {isLoading && <Loading />}
      
      {/* Video Logo */}
      <VideoLogo />
      
      <Header currentPage="about" />
      
      <main className="about-content">
        <section className="about-hero">
          <h1 className="about-title">About Kalakritam</h1>
          <p className="about-subtitle">Preserving Indian Artistic Heritage</p>
        </section>

        <section className="about-story">
          <div className="story-content">
            <h2>Our Story</h2>
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
          </div>
        </section>

        <section className="mission-vision">
          <div className="mission-grid">
            <div className="mission-card">
              <h3>Our Mission</h3>
              <p>To preserve, promote, and celebrate Indian art forms while fostering a vibrant community of artists, collectors, and art enthusiasts who share a passion for cultural heritage and artistic innovation.</p>
            </div>
            <div className="mission-card">
              <h3>Our Vision</h3>
              <p>To be India's premier destination for art appreciation, education, and cultural exchange, bridging the gap between traditional artistry and contemporary expression for future generations.</p>
            </div>
          </div>
        </section>

        <section className="values-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-item">
              <h4>Authenticity</h4>
              <p>We honor the authentic traditions and techniques passed down through generations of master artists.</p>
            </div>
            <div className="value-item">
              <h4>Innovation</h4>
              <p>We embrace contemporary interpretations and new artistic expressions while respecting traditional roots.</p>
            </div>
            <div className="value-item">
              <h4>Community</h4>
              <p>We foster a inclusive community where artists and art lovers can connect, learn, and grow together.</p>
            </div>
            <div className="value-item">
              <h4>Excellence</h4>
              <p>We maintain the highest standards in curating, preserving, and presenting artworks to the public.</p>
            </div>
          </div>
        </section>

        <section className="team-section">
          <h2>Our Team</h2>
          <p className="team-intro">
            Our dedicated team of curators, art historians, and cultural experts work tirelessly to bring you the finest 
            in Indian art and cultural heritage. Together, we are committed to making art accessible and meaningful 
            for everyone who walks through our doors.
          </p>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
