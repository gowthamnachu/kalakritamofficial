import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './IntroVideo.css';

const IntroVideo = () => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [showFallback, setShowFallback] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    
    const handleVideoEnd = () => {
      // Start transition animation
      setIsTransitioning(true);
      
      // Store video completion state
      sessionStorage.setItem('videoCompleted', 'true');
      
      // Redirect to home page after transition
      setTimeout(() => {
        navigate('/home');
      }, 2000); // 2 seconds for smoother transition
    };

    const handleTimeUpdate = () => {
      // Start transition at exactly 5 seconds
      if (video.currentTime >= 4.8) { // Start slightly before 5s for smooth transition
        setIsTransitioning(true);
        sessionStorage.setItem('videoCompleted', 'true');
        
        // Complete transition after 2 seconds
        setTimeout(() => {
          navigate('/home');
        }, 2000);
      }
    };

    const handleVideoError = () => {
      // Show fallback content if video fails to load
      setShowFallback(true);
      // Auto-redirect after 3 seconds if no video
      setTimeout(() => {
        navigate('/home');
      }, 3000);
    };

    if (video) {
      video.addEventListener('ended', handleVideoEnd);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('error', handleVideoError);
      
      // Auto-play the video
      video.play().catch(() => {
        // If autoplay fails, show fallback
        setShowFallback(true);
        setTimeout(() => {
          navigate('/home');
        }, 3000);
      });
    } else {
      // If no video element, show fallback and redirect
      setShowFallback(true);
      setTimeout(() => {
        navigate('/home');
      }, 3000);
    }

    // Cleanup event listeners
    return () => {
      if (video) {
        video.removeEventListener('ended', handleVideoEnd);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('error', handleVideoError);
      }
    };
  }, [navigate]);

  const handleSkip = () => {
    navigate('/home');
  };

  return (
    <div className={`intro-video-container ${isTransitioning ? 'transitioning' : ''}`}>
      {!showFallback ? (
        <div className={`video-wrapper ${isTransitioning ? 'transition-to-logo' : ''}`}>
          <video
            ref={videoRef}
            className={`intro-video ${isTransitioning ? 'shrinking' : ''}`}
            muted
            playsInline
            preload="auto"
          >
            <source src="/intro-video.mp4" type="video/mp4" />
          </video>
        </div>
      ) : null}
      
      <div className={`video-fallback ${showFallback ? 'show' : ''}`}>
        <div className="logo-animation">
          <h1>Kalakritam</h1>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <p>Welcome to the world of art and creativity</p>
      </div>
    </div>
  );
};

export default IntroVideo;
