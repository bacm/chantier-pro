import { ReactNode, createContext, useContext } from 'react';

const DEV_USER = {
  id: 'dev-user-1',
  email: 'dev@chantier-pro.fr',
  name: 'Utilisateur Dev',
  picture: undefined,
};

interface AuthContextProps {
  user: typeof DEV_USER;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const value: AuthContextProps = {
    user: DEV_USER,
    isAuthenticated: true,
    isLoading: false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
