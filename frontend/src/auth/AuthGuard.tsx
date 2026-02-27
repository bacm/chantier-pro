import { useAuth } from './AuthProvider';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: Props) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setHasCheckedAuth(true);
    }
  }, [isLoading]);

  if (!hasCheckedAuth) {
    // Optionally render a loading spinner or skeleton while authentication status is being checked
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />; // Redirect to login page
  }

  return <>{children}</>;
};