import { useAuth } from './AuthProvider';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: Props) => {
  const { isAuthenticated, isLoading } = useAuth();
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
    return <Navigate to="/auth" replace />; // Redirect to login page
  }

  return <>{children}</>;
};