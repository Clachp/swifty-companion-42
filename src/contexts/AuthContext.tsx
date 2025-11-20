import AuthService from '@/src/services/AuthService';
import { useRouter } from 'expo-router';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import Api42Service from '../services/Api42Service';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userLogin: string | null;
  login: (code: string, redirectUri: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userLogin, setUserLogin] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const login = await AuthService.getUserLogin();
        setUserLogin(login);
      }
    } catch {
      setIsAuthenticated(false);
      setUserLogin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (code: string, redirectUri: string) => {
    try {
      await AuthService.exchangeCodeForToken(code, redirectUri);
      const login = await Api42Service.getCurrentUserLogin();
      await AuthService.setUserLogin(login);
      setUserLogin(login);
      setIsAuthenticated(true);
    } catch (error) {
      setUserLogin(null);
      throw error;
    }
  };

  const logout = async () => {
    await AuthService.clearTokens();
    setIsAuthenticated(false);
    setUserLogin(null);
    router.replace('/sign-in');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, userLogin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
