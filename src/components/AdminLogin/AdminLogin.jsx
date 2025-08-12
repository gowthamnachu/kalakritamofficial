import React, { useState, useEffect } from 'react';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import { authApi } from '../../lib/adminApi';
import VideoLogo from '../VideoLogo';
import './AdminLogin.css';

const AdminLogin = () => {
  const { navigateWithLoading } = useNavigationWithLoading();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // Verify token validity
      verifyToken(token);
    }
    
    // Clear any browser stored form data
    setFormData({
      email: '',
      password: ''
    });
  }, []);

  const verifyToken = async (token) => {
    try {
      const result = await authApi.verifyToken();
      if (result.success) {
        // Token is valid, redirect to portal
        navigateWithLoading('/admin/portal');
      }
    } catch (error) {
      // Token is invalid, remove it
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convert email to lowercase to prevent capitalization
    const processedValue = name === 'email' ? value.toLowerCase() : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleEmailInput = (e) => {
    // Force lowercase immediately on input
    e.target.value = e.target.value.toLowerCase();
    handleInputChange(e);
  };

  const handleInputBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors)[0]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { email: formData.email });
      
      const result = await authApi.login(formData);
      console.log('Login result:', result);

      if (result.success) {
        // Store token and user data
        localStorage.setItem('adminToken', result.token);
        localStorage.setItem('adminUser', JSON.stringify(result.user));
        
        console.log('Login successful, stored token and user data');
        
        // Redirect to admin portal home page
        navigateWithLoading('/admin/portal');
      } else {
        // Handle specific error messages
        setError(result.error || 'Login failed. Please check your credentials and try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message.includes('429')) {
        setError('Too many login attempts. Please wait a moment before trying again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="admin-login-container">
      {/* Video Logo */}
      <VideoLogo />
      
      <div className="admin-login-content">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <h1 className="admin-title">Kalakritam</h1>
            <h2 className="admin-subtitle">Admin Portal</h2>
            <p className="admin-description">Access the administrative dashboard</p>
          </div>

          <form className="admin-login-form" onSubmit={handleSubmit} autoComplete="off">
            {error && (
              <div className="error-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleEmailInput}
                  onInput={handleEmailInput}
                  onBlur={handleInputBlur}
                  required
                  placeholder="Enter your admin email"
                  className="form-input"
                  disabled={isLoading}
                  autoFocus
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  style={{ textTransform: 'none' }}
                  inputMode="email"
                  data-form-type="other"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <circle cx="12" cy="16" r="1"></circle>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  required
                  placeholder="Enter your password"
                  className="form-input"
                  disabled={isLoading}
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  style={{ textTransform: 'none' }}
                  inputMode="text"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`login-submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="loading-spinner" width="20" height="20" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                      <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                      <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="form-footer">
              <p className="login-info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Use your admin credentials to access the dashboard
              </p>
            </div>
          </form>

          <div className="admin-login-footer">
            <button 
              onClick={() => navigateWithLoading('/home')} 
              className="back-to-home-btn"
              disabled={isLoading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5"></path>
                <polyline points="12,19 5,12 12,5"></polyline>
              </svg>
              Back to Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
