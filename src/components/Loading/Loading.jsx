import React, { useState, useEffect } from 'react';
import './Loading.css';

const Loading = () => {
  const [progress, setProgress] = useState(0);
  
  const loadingMessages = [
    "Loading Kalakritam...",
    "Preparing your artistic journey...",
    "Almost ready..."
  ];

  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % loadingMessages.length);
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-logo">
          <h1 className="loading-title">Kalakritam</h1>
          <p className="loading-subtitle">Manifesting Through Arts</p>
          
          <div className="loading-progress">
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <div className="progress-percentage">
                {Math.round(Math.min(progress, 100))}%
              </div>
            </div>
            
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
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
