import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

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
  getAccessToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const AuthContextProvider = ({children}: {children: ReactNode}) => {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout, getAccessTokenSilently } = useAuth0();
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      const rawRoles = (user as any)[`https://${domain}/roles`] ?? (user as any)['permissions'] ?? [];
      setRoles(Array.isArray(rawRoles) ? rawRoles : [rawRoles]);
    }
  }, [user]);

  // Store token in cookie when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      getAccessTokenSilently()
        .then(token => {
          if (token) {
            // Store token in cookie (expires in 24h)
            Cookies.set('auth_token', token, {
              expires: 1,
              sameSite: 'strict',
              secure: window.location.protocol === 'https:',
            });
          }
        })
        .catch(err => {
          console.error('Failed to get access token:', err);
        });
    } else if (!isAuthenticated) {
      // Remove token cookie when logged out
      Cookies.remove('auth_token');
    }
  }, [isAuthenticated, user, getAccessTokenSilently]);

  const getAccessToken = async () => {
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      console.error('Failed to get access token:', error);
      return undefined;
    }
  };

  const value = { user, isAuthenticated, isLoading, roles, loginWithRedirect, logout, getAccessToken };
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