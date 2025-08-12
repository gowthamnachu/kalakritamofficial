import React, { Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LoadingProvider, useLoading } from './contexts/LoadingContext.jsx'
import Loading from './components/Loading'
import { measureLazyLoadTime } from './hooks/usePerformanceTracking'
import { seoManager } from './utils/seoManager.js'
import './App.css'

// Lazy load all components for better performance with performance tracking
const IntroVideo = React.lazy(() => {
  const measure = measureLazyLoadTime('IntroVideo');
  return import('./components/IntroVideo').then(module => {
    measure();
    return module;
  });
});

const Home = React.lazy(() => {
  const measure = measureLazyLoadTime('Home');
  return import('./components/Home').then(module => {
    measure();
    return module;
  });
});

const Gallery = React.lazy(() => {
  const measure = measureLazyLoadTime('Gallery');
  return import('./components/Gallery').then(module => {
    measure();
    return module;
  });
});

const Workshops = React.lazy(() => {
  const measure = measureLazyLoadTime('Workshops');
  return import('./components/Workshops').then(module => {
    measure();
    return module;
  });
});

const Artists = React.lazy(() => {
  const measure = measureLazyLoadTime('Artists');
  return import('./components/Artists').then(module => {
    measure();
    return module;
  });
});

const Contact = React.lazy(() => {
  const measure = measureLazyLoadTime('Contact');
  return import('./components/Contact').then(module => {
    measure();
    return module;
  });
});

const About = React.lazy(() => {
  const measure = measureLazyLoadTime('About');
  return import('./components/About').then(module => {
    measure();
    return module;
  });
});

const Events = React.lazy(() => {
  const measure = measureLazyLoadTime('Events');
  return import('./components/Events').then(module => {
    measure();
    return module;
  });
});

const ArtBlogs = React.lazy(() => {
  const measure = measureLazyLoadTime('ArtBlogs');
  return import('./components/ArtBlogs').then(module => {
    measure();
    return module;
  });
});

const AdminLogin = React.lazy(() => {
  const measure = measureLazyLoadTime('AdminLogin');
  return import('./components/AdminLogin').then(module => {
    measure();
    return module;
  });
});

const AdminPortal = React.lazy(() => {
  const measure = measureLazyLoadTime('AdminPortal');
  return import('./components/AdminPortal').then(module => {
    measure();
    return module;
  });
});

const AdminGallery = React.lazy(() => {
  const measure = measureLazyLoadTime('AdminGallery');
  return import('./components/AdminGallery').then(module => {
    measure();
    return module;
  });
});

const AdminWorkshops = React.lazy(() => {
  const measure = measureLazyLoadTime('AdminWorkshops');
  return import('./components/AdminWorkshops').then(module => {
    measure();
    return module;
  });
});

const AdminEvents = React.lazy(() => {
  const measure = measureLazyLoadTime('AdminEvents');
  return import('./components/AdminEvents').then(module => {
    measure();
    return module;
  });
});

const AdminArtists = React.lazy(() => {
  const measure = measureLazyLoadTime('AdminArtists');
  return import('./components/AdminArtists').then(module => {
    measure();
    return module;
  });
});

const AdminBlogs = React.lazy(() => {
  const measure = measureLazyLoadTime('AdminBlogs');
  return import('./components/AdminBlogs').then(module => {
    measure();
    return module;
  });
});

const AdminContact = React.lazy(() => {
  const measure = measureLazyLoadTime('AdminContact');
  return import('./components/AdminContact').then(module => {
    measure();
    return module;
  });
});

const AdminTickets = React.lazy(() => {
  const measure = measureLazyLoadTime('AdminTickets');
  return import('./components/AdminTickets').then(module => {
    measure();
    return module;
  });
});

const TicketVerification = React.lazy(() => {
  const measure = measureLazyLoadTime('TicketVerification');
  return import('./components/TicketVerification').then(module => {
    measure();
    return module;
  });
});



// Preload commonly visited components for better UX
const preloadComponent = (componentImport) => {
  const componentImportFunc = componentImport;
  componentImportFunc();
};

// Smart preloading strategy - preload Home and Gallery after initial load
setTimeout(() => {
  preloadComponent(() => import('./components/Home'));
  preloadComponent(() => import('./components/Gallery'));
}, 3000);

// Preload on user interaction hints
if (typeof window !== 'undefined') {
  window.addEventListener('mouseover', (e) => {
    // Preload components when user hovers over navigation links
    const target = e.target.closest('a');
    if (target) {
      const href = target.getAttribute('href');
      switch (href) {
        case '/workshops':
          preloadComponent(() => import('./components/Workshops'));
          break;
        case '/artists':
          preloadComponent(() => import('./components/Artists'));
          break;
        case '/about':
          preloadComponent(() => import('./components/About'));
          break;
        case '/events':
          preloadComponent(() => import('./components/Events'));
          break;
        case '/artblogs':
          preloadComponent(() => import('./components/ArtBlogs'));
          break;
        case '/contact':
          preloadComponent(() => import('./components/Contact'));
          break;
      }
    }
  }, { once: true });
}

// Lazy loading fallback component
const LazyLoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#002f2f',
    color: '#c38f21',
    fontSize: '1.2rem',
    fontFamily: 'Samarkan, serif'
  }}>
    Loading Kalakritam...
  </div>
)

// Error boundary for lazy loading errors
class LazyLoadingErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#002f2f',
          color: '#c38f21',
          textAlign: 'center',
          fontFamily: 'Samarkan, serif'
        }}>
          <h2>Something went wrong loading this page</h2>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: '#c38f21',
              color: '#002f2f',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent = () => {
  const { isLoading } = useLoading();

  return (
    <>
      {isLoading && <Loading />}
      <Router>
        <div className="app">
          <LazyLoadingErrorBoundary>
            <Suspense fallback={<LazyLoadingFallback />}>
              <Routes>
                <Route path="/" element={<IntroVideo />} />
                <Route path="/home" element={<Home />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/workshops" element={<Workshops />} />
                <Route path="/artists" element={<Artists />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/events" element={<Events />} />
                <Route path="/artblogs" element={<ArtBlogs />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/portal" element={<AdminPortal />} />
                <Route path="/admin/gallery" element={<AdminGallery />} />
                <Route path="/admin/workshops" element={<AdminWorkshops />} />
                <Route path="/admin/events" element={<AdminEvents />} />
                <Route path="/admin/artists" element={<AdminArtists />} />
                <Route path="/admin/blogs" element={<AdminBlogs />} />
                <Route path="/admin/contact" element={<AdminContact />} />
                <Route path="/admin/tickets" element={<AdminTickets />} />
                
                {/* Public Ticket Verification Route */}
                <Route path="/verify-ticket/:ticketId" element={<TicketVerification />} />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </LazyLoadingErrorBoundary>
        </div>
      </Router>
    </>
  );
};

function App() {
  // Initialize SEO manager on app load
  useEffect(() => {
    seoManager.init();
  }, []);

  return (
    <LoadingProvider>
      <AppContent />
    </LoadingProvider>
  )
}

export default App
