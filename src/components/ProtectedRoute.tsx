// src/components/ProtectedRoute.tsx
import { ReactNode } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Guards protected routes by ensuring the user is signed in.
 * While Clerk is initializing, shows a loader. If not signed in,
 * redirects to /signin, preserving the original location for post-login redirect.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();

  // 1) While Clerk is initializing, show full-screen loader
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // 2) If user is not signed in, redirect to Sign In page
  if (!isSignedIn) {
    return (
      <Navigate
        to="/signin"
        state={{ from: location }}
        replace
      />
    );
  }

  // 3) Otherwise, render the protected content
  return <>{children}</>;
}
