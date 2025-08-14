# Toast Notification System Documentation

## Overview

The Kalakritam website now includes a comprehensive toast notification system that provides real-time feedback to users for various actions and server connectivity status. The system is built with React and provides a clean, accessible, and responsive notification experience.

## Features

- ✅ **Multiple Notification Types**: Success, Error, Warning, Info, Loading
- ✅ **Server Connection Monitoring**: Automatic server connectivity checks with user feedback
- ✅ **Auto-dismiss**: Configurable auto-dismiss duration for notifications
- ✅ **Manual Dismiss**: Users can manually close notifications
- ✅ **Multiple Positioning**: Support for different screen positions
- ✅ **Responsive Design**: Works seamlessly on desktop and mobile
- ✅ **Progress Indicators**: Visual progress bars for timed notifications
- ✅ **Accessibility**: ARIA labels and screen reader support
- ✅ **Dark Mode Support**: Automatic adaptation to user's theme preference
- ✅ **API Integration**: Built-in integration with API requests

## Architecture

### Core Components

1. **NotificationManager** (`src/utils/notifications.js`)
   - Central notification management system
   - Handles notification lifecycle (add, remove, clear)
   - Provides convenience methods for different notification types

2. **NotificationContext** (`src/contexts/NotificationContext.jsx`)
   - React context for sharing notification state
   - Provides hooks for components to interact with notifications

3. **NotificationMessage** (`src/components/NotificationMessage/`)
   - UI component for rendering individual notifications
   - Handles animations, progress bars, and user interactions

4. **GlobalToastContainer** (`src/components/GlobalToastContainer/`)
   - Container component that renders all active notifications
   - Manages positioning and grouping

5. **useServerConnection** (`src/hooks/useServerConnection.js`)
   - Custom hook for monitoring server connectivity
   - Automatically shows connection status notifications

6. **ApiClient** (`src/utils/apiClient.js`)
   - Enhanced fetch wrapper with automatic notification integration
   - Shows loading states and error handling

## Usage

### Basic Toast Notifications

```javascript
import { toast } from '../utils/notifications.js';

// Success notification
toast.success('Operation completed successfully!');

// Error notification
toast.error('Something went wrong!');

// Warning notification
toast.warning('This action cannot be undone');

// Info notification
toast.info('New update available');

// Loading notification (persistent until dismissed)
const loadingId = toast.loading('Processing...');
// Later dismiss it
toast.dismiss(loadingId);
```

### Advanced Notifications with Options

```javascript
toast.success('Data saved successfully!', {
  description: 'Your changes have been applied.',
  duration: 5000, // 5 seconds
  position: 'top-right',
  icon: '✅',
  dismissible: true
});
```

### Server Connection Notifications

```javascript
// These are automatically handled by useServerConnection hook
toast.serverConnecting('Connecting to server...');
toast.serverConnected('Connected successfully!');
toast.serverDisconnected('Connection lost');
toast.serverError('Server error occurred');
```

### API Integration

```javascript
import { apiClient } from '../utils/apiClient.js';

// API request with automatic loading and error notifications
try {
  const result = await apiClient.post('/api/data', {
    name: 'John Doe'
  }, {
    showLoading: true,
    loadingMessage: 'Saving data...',
    showSuccess: true,
    successMessage: 'Data saved successfully!',
    errorMessage: 'Failed to save data'
  });
} catch (error) {
  // Error notification is automatically shown
}
```

### Using the Notification Context

```javascript
import { useNotifications } from '../contexts/NotificationContext.jsx';

const MyComponent = () => {
  const { notifications, addNotification, removeNotification } = useNotifications();

  const handleClick = () => {
    addNotification({
      type: 'success',
      message: 'Custom notification',
      duration: 3000
    });
  };

  return (
    <div>
      <button onClick={handleClick}>Show Notification</button>
      <p>Active notifications: {notifications.length}</p>
    </div>
  );
};
```

### Server Connection Monitoring

```javascript
import useServerConnection from '../hooks/useServerConnection.js';

const MyComponent = () => {
  const {
    isConnected,
    isChecking,
    lastChecked,
    forceCheck
  } = useServerConnection({
    checkInterval: 30000, // Check every 30 seconds
    timeout: 8000,
    retryAttempts: 3,
    endpoints: ['/api/health', '/api/status']
  });

  return (
    <div>
      <p>Connection status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={forceCheck}>Force Check</button>
    </div>
  );
};
```

## Configuration Options

### Notification Types
- `success`: Green, checkmark icon
- `error`: Red, X icon  
- `warning`: Orange, warning icon
- `info`: Blue, info icon
- `loading`: Purple, spinning icon

### Notification Positions
- `top-right` (default)
- `top-left`
- `top-center`
- `bottom-right`
- `bottom-left`
- `bottom-center`

### Notification Options
```javascript
{
  message: 'Notification message', // Required
  description: 'Additional details', // Optional
  type: 'success', // success, error, warning, info, loading
  duration: 5000, // Auto-dismiss time in ms (0 = persistent)
  position: 'top-right', // Position on screen
  icon: '✅', // Custom icon (overrides type icon)
  dismissible: true, // Whether user can manually close
  id: 'unique-id' // Custom ID for programmatic control
}
```

### Server Connection Options
```javascript
{
  checkInterval: 30000, // How often to check (ms)
  timeout: 10000, // Request timeout (ms)
  retryAttempts: 3, // Number of retry attempts
  retryDelay: 2000, // Delay between retries (ms)
  endpoints: ['/api/health'], // Health check endpoints
  onConnect: () => {}, // Callback when connected
  onDisconnect: (error) => {}, // Callback when disconnected
  onError: (error) => {} // Callback on error
}
```

## Integration in Your Components

### 1. Wrap your app with NotificationProvider (already done in App.jsx)
```javascript
import { NotificationProvider } from './contexts/NotificationContext.jsx';

function App() {
  return (
    <NotificationProvider>
      <YourAppContent />
    </NotificationProvider>
  );
}
```

### 2. Add GlobalToastContainer (already done in App.jsx)
```javascript
import GlobalToastContainer from './components/GlobalToastContainer';

function AppContent() {
  return (
    <div>
      <GlobalToastContainer />
      {/* Your app content */}
    </div>
  );
}
```

### 3. Use notifications in any component
```javascript
import { toast } from '../utils/notifications.js';

const MyComponent = () => {
  const handleSubmit = async () => {
    try {
      const loadingId = toast.loading('Submitting form...');
      
      await submitForm();
      
      toast.dismiss(loadingId);
      toast.success('Form submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit form');
    }
  };

  return <button onClick={handleSubmit}>Submit</button>;
};
```

## Testing

Visit `/toast-demo` in your development environment to test all notification types and features.

## Styling and Customization

### CSS Variables (can be customized in NotificationMessage.css)
- Notification background, borders, shadows
- Animation timing and easing
- Color schemes for different types
- Mobile responsive breakpoints
- Dark mode support

### Custom Icons
You can override default icons by providing an `icon` property:
```javascript
toast.success('Success!', { icon: '🎉' });
toast.error('Error!', { icon: '💥' });
```

## Performance Considerations

- Notifications are automatically cleaned up to prevent memory leaks
- Server connection checks are throttled and use abort signals
- Animations use CSS transforms for optimal performance
- Component lazy loading minimizes initial bundle size

## Accessibility

- All notifications have proper ARIA labels
- Screen reader announcements for new notifications
- Keyboard navigation support for dismiss buttons
- High contrast support for visibility
- Respects user's reduced motion preferences

## Browser Support

- Modern browsers with ES6+ support
- Works with React 18+
- Uses Fetch API (with polyfill support for older browsers)
- CSS Grid and Flexbox for layouts

## Troubleshooting

### Notifications not appearing
1. Ensure NotificationProvider wraps your app
2. Check that GlobalToastContainer is rendered
3. Verify no console errors are blocking execution

### Server connection monitoring not working
1. Check that health check endpoints exist and return 200 status
2. Verify CORS settings allow the requests
3. Check browser network tab for failed requests

### Styling issues
1. Ensure CSS file is properly imported
2. Check for CSS conflicts with existing styles
3. Verify z-index values for proper layering

## Future Enhancements

- Sound notifications (optional)
- Notification history/logging
- Batch notification management
- Custom notification templates
- Analytics integration
- Push notification support
