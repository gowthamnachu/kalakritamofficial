import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../utils/notifications.js';
import './IntroVideo.css';

const IntroVideo = () => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [showFallback, setShowFallback] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    
    const handleVideoEnd = () => {
      // Start transition animation
      setIsTransitioning(true);
      
      // Store video completion state
      sessionStorage.setItem('videoCompleted', 'true');
      
      // Show welcome toast
      toast.success('Welcome to Kalakritam!', {
        description: 'Discover the art of creation',
        duration: 3000
      });
      
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

    const handleVideoError = (error) => {
      console.warn('Video loading error:', error);
      // Show fallback content if video fails to load
      setShowFallback(true);
      // Auto-redirect after 3 seconds if no video
      setTimeout(() => {
        sessionStorage.setItem('videoCompleted', 'true');
        navigate('/home');
      }, 3000);
    };

    const handleVideoLoad = () => {
      setVideoLoaded(true);
      console.log('Video loaded successfully');
    };

    const handleCanPlay = () => {
      console.log('Video can start playing');
      setVideoLoaded(true);
    };

    if (video) {
      video.addEventListener('ended', handleVideoEnd);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('error', handleVideoError);
      video.addEventListener('loadeddata', handleVideoLoad);
      video.addEventListener('canplay', handleCanPlay);
      
      // Set a timeout for video loading
      const loadingTimeout = setTimeout(() => {
        if (!videoLoaded) {
          console.warn('Video loading timeout - showing fallback');
          setShowFallback(true);
          setTimeout(() => {
            sessionStorage.setItem('videoCompleted', 'true');
            navigate('/home');
          }, 3000);
        }
      }, 5000); // 5 second timeout
      
      // Auto-play the video
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('Video autoplay failed:', error);
          // If autoplay fails, show fallback
          setShowFallback(true);
          setTimeout(() => {
            sessionStorage.setItem('videoCompleted', 'true');
            navigate('/home');
          }, 3000);
        });
      }

      // Cleanup
      return () => {
        clearTimeout(loadingTimeout);
        if (video) {
          video.removeEventListener('ended', handleVideoEnd);
          video.removeEventListener('timeupdate', handleTimeUpdate);
          video.removeEventListener('error', handleVideoError);
          video.removeEventListener('loadeddata', handleVideoLoad);
          video.removeEventListener('canplay', handleCanPlay);
        }
      };
    } else {
      // If no video element, show fallback and redirect
      setShowFallback(true);
      setTimeout(() => {
        sessionStorage.setItem('videoCompleted', 'true');
        navigate('/home');
      }, 3000);
    }
  }, [navigate, videoLoaded]);

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
            autoPlay={false}
            crossOrigin="anonymous"
          >
            <source src="/intro-video.mp4" type="video/mp4" />
            <p>Your browser does not support the video tag.</p>
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
