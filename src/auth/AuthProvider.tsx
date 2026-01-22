import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

interface AuthContextProps {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  roles: string[];
  loginWithRedirect: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const AuthContextProvider = ({children}: {children: ReactNode}) => {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      const rawRoles = (user as any)[`https://${domain}/roles`] ?? (user as any)['permissions'] ?? [];
      setRoles(Array.isArray(rawRoles) ? rawRoles : [rawRoles]);
    }
  }, [user]);

  const value = { user, isAuthenticated, isLoading, roles, loginWithRedirect, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
      }}
      onRedirectCallback={(appState) => {
        window.history.replaceState(null, document.title, appState?.returnTo ?? '/');
      }}
    >
      <AuthContextProvider>{children}</AuthContextProvider>
    </Auth0Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};