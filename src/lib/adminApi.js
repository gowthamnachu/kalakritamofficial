// API utility functions for admin operations
import { config } from '../config/environment.js';

// Common API call function with admin authentication
export const apiCall = async (endpoint, method = 'GET', data = null) => {
  try {
    const token = localStorage.getItem('adminToken');
    
    // Automatically prepend /admin/ to endpoints if not already present
    const apiEndpoint = endpoint.startsWith('admin/') ? endpoint : `admin/${endpoint}`;
    const url = `${config.apiBaseUrl}/${apiEndpoint}`;
    
    console.log('API Call Debug:', {
      endpoint: apiEndpoint,
      method,
      data,
      url
    });
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const requestOptions = {
      method,
      headers,
      mode: 'cors',
      credentials: 'omit',
      credentials: 'include', // Essential for CORS with credentials
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, requestOptions);
    const result = await response.json();
    
    console.log('API Response Debug:', {
      status: response.status,
      result
    });
    
    if (!response.ok) {
      throw new Error(result.error || result.message || 'API request failed');
    }
    
    return result;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Gallery API functions
export const galleryApi = {
  getArtworks: () => apiCall('gallery'),
  addArtwork: (artwork) => apiCall('gallery', 'POST', artwork),
  updateArtwork: (id, artwork) => apiCall(`gallery/${id}`, 'PUT', artwork),
  deleteArtwork: (id) => apiCall(`gallery/${id}`, 'DELETE'),
};

// Workshops API functions
export const workshopsApi = {
  getAll: () => apiCall('workshops'),
  create: (workshop) => apiCall('workshops', 'POST', workshop),
  update: (id, workshop) => apiCall(`workshops/${id}`, 'PUT', workshop),
  delete: (id) => apiCall(`workshops/${id}`, 'DELETE'),
};

// Events API functions
export const eventsApi = {
  getAll: () => apiCall('events'),
  addEvent: (event) => apiCall('events', 'POST', event),
  updateEvent: (id, event) => apiCall(`events/${id}`, 'PUT', event),
  deleteEvent: (id) => apiCall(`events/${id}`, 'DELETE'),
};

// Artists API functions
export const artistsApi = {
  getAll: () => apiCall('artists'),
  create: (artist) => apiCall('artists', 'POST', artist),
  update: (id, artist) => apiCall(`artists/${id}`, 'PUT', artist),
  delete: (id) => apiCall(`artists/${id}`, 'DELETE'),
};

// Blogs API functions
export const blogsApi = {
  getAll: () => apiCall('blogs'),
  create: (blog) => apiCall('blogs', 'POST', blog),
  update: (id, blog) => apiCall(`blogs/${id}`, 'PUT', blog),
  delete: (id) => apiCall(`blogs/${id}`, 'DELETE'),
};

// Contacts API functions (consolidated and fixed)
export const contactsApi = {
  getAll: () => apiCall('contacts'),
  update: (id, contact) => apiCall(`contacts/${id}`, 'PUT', contact),
  delete: (id) => apiCall(`contacts/${id}`, 'DELETE'),
  markAsRead: (id) => apiCall(`contacts/${id}/read`, 'PUT'),
  reply: (replyData) => apiCall('contacts/reply', 'POST', replyData),
};

// Tickets API functions
export const ticketsApi = {
  getAll: () => apiCall('tickets'),
  create: (ticket) => apiCall('tickets', 'POST', ticket),
  update: (id, ticket) => apiCall(`tickets/${id}`, 'PUT', ticket),
  delete: (id) => apiCall(`tickets/${id}`, 'DELETE'),
  verify: (ticketCode) => apiCall('tickets/verify', 'POST', { code: ticketCode }),
};

// Authentication API functions
export const authApi = {
  login: async (credentials) => {
    console.log('🔐 Login attempt starting...', { email: credentials.email, apiUrl: `${config.apiBaseUrl}/admin/login` });
    
    try {
      const response = await fetch(`${config.apiBaseUrl}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Essential for CORS with credentials
        body: JSON.stringify(credentials),
      });
      
      console.log('🌐 Login response received:', { 
        status: response.status, 
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });
      
      const result = await response.json();
      console.log('📄 Login response data:', result);
      
      if (!response.ok) {
        console.error('❌ Login failed - HTTP error:', { status: response.status, result });
        throw new Error(result.error || result.message || 'Login failed');
      }
      
      if (result.success && result.token) {
        console.log('✅ Login successful, storing token...');
        localStorage.setItem('adminToken', result.token);
        localStorage.setItem('adminUser', JSON.stringify(result.user));
      }
      
      return result;
    } catch (error) {
      console.error('💥 Login error:', error);
      console.error('🔍 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  },
  
  verifyToken: async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('No token found');
    }
    
    try {
      const response = await fetch(`${config.apiBaseUrl}/admin/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Token verification failed');
      }
      
      return result;
    } catch (error) {
      console.error('Token verification error:', error);
      // Remove invalid token
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },
  
  isAuthenticated: () => {
    return localStorage.getItem('adminToken') !== null;
  }
};
