import React from 'react';
import './Loading.css';

const Loading = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-logo">
          <h1 className="loading-title">Kalakritam</h1>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <p className="loading-text">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
