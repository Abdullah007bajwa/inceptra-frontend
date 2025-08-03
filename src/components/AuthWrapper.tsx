import { useAuth } from '@clerk/clerk-react';
import { useEffect, useCallback } from 'react';
import { setAuthToken } from '@/lib/api';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  const updateToken = useCallback(async () => {
    if (isSignedIn && isLoaded) {
      try {
        // Get a fresh token with proper options for backend API
        const token = await getToken({
          template: 'default', // Use default template
          skipCache: false, // Allow caching for better performance
        });
        
        if (token) {
          setAuthToken(token);
          console.log('✅ Auth token set successfully');
        } else {
          console.warn('⚠️ No token received from Clerk');
          setAuthToken('');
        }
      } catch (error) {
        console.error('❌ Error setting auth token:', error);
        setAuthToken('');
      }
    } else {
      setAuthToken('');
    }
  }, [isSignedIn, isLoaded, getToken]);

  // Update token when auth state changes
  useEffect(() => {
    updateToken();
  }, [updateToken]);

  // Set up token refresh interval (every 5 minutes)
  useEffect(() => {
    if (isSignedIn && isLoaded) {
      const interval = setInterval(updateToken, 5 * 60 * 1000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [isSignedIn, isLoaded, updateToken]);

  return <>{children}</>;
}