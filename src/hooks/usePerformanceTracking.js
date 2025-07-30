import { useEffect } from 'react';

export const usePerformanceTracking = (componentName) => {
  useEffect(() => {
    // Track component mount time for performance monitoring
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Log performance metrics (can be sent to analytics service)
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} loaded in ${loadTime.toFixed(2)}ms`);
      }
      
      // You can also track to analytics services here
      // analytics.track('component_load_time', {
      //   component: componentName,
      //   loadTime: loadTime
      // });
    };
  }, [componentName]);
};

export const measureLazyLoadTime = (componentName) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const lazyLoadTime = endTime - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} lazy loaded in ${lazyLoadTime.toFixed(2)}ms`);
    }
  };
};
