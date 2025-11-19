import AuthService from '@/src/services/AuthService';
import { useRouter } from 'expo-router';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import Api42Service from '../services/Api42Service';
import { User42 } from '../types/api.types';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser?: User42;
  login: (code: string, redirectUri: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User42 | undefined>(undefined);
  const router = useRouter();

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Erreur lors de la vérification du statut d\'authentification:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (code: string, redirectUri: string) => {
    try {
      await AuthService.exchangeCodeForToken(code, redirectUri);
      const currentUser = await Api42Service.getCurrentUser();
      setCurrentUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const logout = async () => {
    await AuthService.clearTokens();
    setIsAuthenticated(false);
    router.replace('/sign-in');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}
