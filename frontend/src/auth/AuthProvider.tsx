import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { User, OrganizationWithStats } from '@/types';
import { authApi } from '@/lib/api';

interface AuthContextProps {
  user: User | null;
  organizations: OrganizationWithStats[];
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  // register is handled directly by the API call, no specific context function needed
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationWithStats[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await authApi.getMe(); // Call without token argument
        setUser(data.user);
        setOrganizations(data.organizations);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('jwt_token');
        setToken(null);
        setUser(null);
        setOrganizations([]);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('jwt_token', newToken);
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
    // Organizations will be loaded by the useEffect hook after token is set
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
    setOrganizations([]);
    setIsAuthenticated(false);
  };

  const value: AuthContextProps = {
    user,
    organizations,
    isAuthenticated,
    isLoading,
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
