// Toast notification utility for global notifications
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading'
};

export const NOTIFICATION_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center'
};

class NotificationManager {
  constructor() {
    this.notifications = [];
    this.listeners = [];
    this.idCounter = 0;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  add(notification) {
    const id = ++this.idCounter;
    const newNotification = {
      id,
      timestamp: Date.now(),
      position: NOTIFICATION_POSITIONS.TOP_RIGHT,
      duration: 5000,
      dismissible: true,
      ...notification
    };

    this.notifications.push(newNotification);
    this.emit();

    // Auto remove after duration (if not persistent)
    if (newNotification.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newNotification.duration);
    }

    return id;
  }

  remove(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.emit();
  }

  clear() {
    this.notifications = [];
    this.emit();
  }

  // Convenience methods
  success(message, options = {}) {
    return this.add({
      type: NOTIFICATION_TYPES.SUCCESS,
      message,
      ...options
    });
  }

  error(message, options = {}) {
    return this.add({
      type: NOTIFICATION_TYPES.ERROR,
      message,
      duration: 7000, // Error messages stay longer
      ...options
    });
  }

  warning(message, options = {}) {
    return this.add({
      type: NOTIFICATION_TYPES.WARNING,
      message,
      ...options
    });
  }

  info(message, options = {}) {
    return this.add({
      type: NOTIFICATION_TYPES.INFO,
      message,
      ...options
    });
  }

  loading(message, options = {}) {
    return this.add({
      type: NOTIFICATION_TYPES.LOADING,
      message,
      duration: 0, // Loading notifications are persistent
      dismissible: false,
      ...options
    });
  }

  // Server connection specific notifications
  serverConnecting(message = 'Connecting to server...') {
    return this.loading(message, {
      id: 'server-connecting',
      icon: '🔄'
    });
  }

  serverConnected(message = 'Connected to server successfully!') {
    this.remove('server-connecting'); // Remove connecting notification
    return this.success(message, {
      icon: '✅',
      duration: 3000
    });
  }

  serverDisconnected(message = 'Connection to server lost') {
    return this.error(message, {
      icon: '🔌',
      duration: 0, // Persistent until reconnected
      dismissible: true
    });
  }

  serverError(message = 'Server error occurred') {
    return this.error(message, {
      icon: '⚠️',
      duration: 8000
    });
  }

  // API specific notifications
  apiRequest(message = 'Processing request...') {
    return this.loading(message, {
      icon: '📡'
    });
  }

  apiSuccess(message = 'Request completed successfully!') {
    return this.success(message, {
      icon: '✅',
      duration: 3000
    });
  }

  apiError(message = 'Request failed') {
    return this.error(message, {
      icon: '❌',
      duration: 6000
    });
  }

  // Data operations
  dataSaving(message = 'Saving data...') {
    return this.loading(message, {
      icon: '💾'
    });
  }

  dataSaved(message = 'Data saved successfully!') {
    return this.success(message, {
      icon: '✅',
      duration: 3000
    });
  }

  dataLoading(message = 'Loading data...') {
    return this.loading(message, {
      icon: '📥'
    });
  }

  dataLoaded(message = 'Data loaded successfully!') {
    return this.success(message, {
      icon: '✅',
      duration: 2000
    });
  }

  // File operations
  fileUploading(message = 'Uploading file...') {
    return this.loading(message, {
      icon: '📤'
    });
  }

  fileUploaded(message = 'File uploaded successfully!') {
    return this.success(message, {
      icon: '✅',
      duration: 3000
    });
  }

  fileDeleting(message = 'Deleting file...') {
    return this.loading(message, {
      icon: '🗑️'
    });
  }

  fileDeleted(message = 'File deleted successfully!') {
    return this.success(message, {
      icon: '✅',
      duration: 3000
    });
  }

  // Authentication notifications
  authLoading(message = 'Authenticating...') {
    return this.loading(message, {
      icon: '🔐'
    });
  }

  authSuccess(message = 'Authentication successful!') {
    return this.success(message, {
      icon: '✅',
      duration: 3000
    });
  }

  authError(message = 'Authentication failed') {
    return this.error(message, {
      icon: '🚫',
      duration: 5000
    });
  }

  // Form operations
  formSubmitting(message = 'Submitting form...') {
    return this.loading(message, {
      icon: '📋'
    });
  }

  formSubmitted(message = 'Form submitted successfully!') {
    return this.success(message, {
      icon: '✅',
      duration: 3000
    });
  }

  formError(message = 'Form submission failed') {
    return this.error(message, {
      icon: '❌',
      duration: 5000
    });
  }

  // Validation notifications
  validationError(message = 'Please check your input') {
    return this.warning(message, {
      icon: '⚠️',
      duration: 4000
    });
  }

  // Copy to clipboard
  copied(message = 'Copied to clipboard!') {
    return this.success(message, {
      icon: '📋',
      duration: 2000
    });
  }
}

// Create global instance
export const notificationManager = new NotificationManager();

// Export convenience methods
export const toast = {
  success: (message, options) => notificationManager.success(message, options),
  error: (message, options) => notificationManager.error(message, options),
  warning: (message, options) => notificationManager.warning(message, options),
  info: (message, options) => notificationManager.info(message, options),
  loading: (message, options) => notificationManager.loading(message, options),
  
  // Server connection methods
  serverConnecting: (message) => notificationManager.serverConnecting(message),
  serverConnected: (message) => notificationManager.serverConnected(message),
  serverDisconnected: (message) => notificationManager.serverDisconnected(message),
  serverError: (message) => notificationManager.serverError(message),
  
  // API methods
  apiRequest: (message) => notificationManager.apiRequest(message),
  apiSuccess: (message) => notificationManager.apiSuccess(message),
  apiError: (message) => notificationManager.apiError(message),
  
  // Data operations
  dataSaving: (message) => notificationManager.dataSaving(message),
  dataSaved: (message) => notificationManager.dataSaved(message),
  dataLoading: (message) => notificationManager.dataLoading(message),
  dataLoaded: (message) => notificationManager.dataLoaded(message),
  
  // File operations
  fileUploading: (message) => notificationManager.fileUploading(message),
  fileUploaded: (message) => notificationManager.fileUploaded(message),
  fileDeleting: (message) => notificationManager.fileDeleting(message),
  fileDeleted: (message) => notificationManager.fileDeleted(message),
  
  // Authentication
  authLoading: (message) => notificationManager.authLoading(message),
  authSuccess: (message) => notificationManager.authSuccess(message),
  authError: (message) => notificationManager.authError(message),
  
  // Form operations
  formSubmitting: (message) => notificationManager.formSubmitting(message),
  formSubmitted: (message) => notificationManager.formSubmitted(message),
  formError: (message) => notificationManager.formError(message),
  
  // Validation
  validationError: (message) => notificationManager.validationError(message),
  
  // Utility
  copied: (message) => notificationManager.copied(message),
  
  // Utility methods
  dismiss: (id) => notificationManager.remove(id),
  clear: () => notificationManager.clear()
};

export default notificationManager;
