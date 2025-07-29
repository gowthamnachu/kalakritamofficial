import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useNavigationWithLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const navigateWithLoading = (path) => {
    setIsLoading(true);
    
    // Show loading for at least 800ms for smooth transition
    setTimeout(() => {
      navigate(path);
      // Hide loading after navigation
      setTimeout(() => {
        setIsLoading(false);
      }, 200);
    }, 800);
  };

  return { isLoading, navigateWithLoading };
};
