import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { setAuthToken } from '@/lib/api';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const updateToken = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          setAuthToken(token || '');
        } catch (error) {
          console.error('Error setting auth token:', error);
        }
      } else {
        setAuthToken('');
      }
    };

    updateToken();
  }, [isSignedIn, getToken]);

  return <>{children}</>;
}