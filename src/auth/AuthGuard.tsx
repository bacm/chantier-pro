import { useAuth } from './AuthProvider';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const AuthGuard = ({ children, requiredRoles = [] }: Props) => {
  const { isAuthenticated, isLoading, roles } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (requiredRoles.length && !requiredRoles.some(r => roles.includes(r))) {
        navigate('/forbidden');
      }
    }
  }, [isAuthenticated, isLoading, roles, requiredRoles, navigate]);

  if (isLoading) return <div>Loading…</div>;
  return <>{children}</>;
};