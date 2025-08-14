import React, { useState, useEffect } from 'react';
import './Loading.css';

const Loading = () => {
  const loadingMessages = [
    "Loading Kalakritam...",
    "Preparing your artistic journey...",
    "Almost ready..."
  ];

  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => {
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-logo">
          <h1 className="loading-title">Kalakritam</h1>
          <p className="loading-subtitle">Manifesting Through Arts</p>
          
          <div className="loader">
            <div className="loader-square"></div>
            <div className="loader-square"></div>
            <div className="loader-square"></div>
            <div className="loader-square"></div>
            <div className="loader-square"></div>
            <div className="loader-square"></div>
            <div className="loader-square"></div>
            <div className="loader-square"></div>
          </div>
        </div>
        
        <div className="loading-status">
          <p className="loading-text">{loadingMessages[currentMessage]}</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
