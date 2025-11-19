import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_BASE = 'https://api.intra.42.fr';
const TOKEN_KEY = 'access_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';
const REFRESH_TOKEN_KEY = 'refresh_token';

const API_UID = Constants.expoConfig?.extra?.apiClientId;
const API_SECRET = Constants.expoConfig?.extra?.apiClientSecret;

// Storage wrapper
const storage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },

  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
};

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  created_at: number;
}

class AuthService {
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
    try {
      if (!API_UID || !API_SECRET) {
        throw new Error('Configuration API manquante. Vérifiez votre .env');
      }

      const response = await axios.post<TokenResponse>(
        `${API_BASE}/oauth/token`,
        {
          grant_type: 'authorization_code',
          client_id: API_UID,
          client_secret: API_SECRET,
          code: code,
          redirect_uri: redirectUri,
        }
      );

      const { access_token, expires_in, refresh_token } = response.data;
      const expiryTime = Date.now() + expires_in * 1000;

      await storage.setItem(TOKEN_KEY, access_token);
      await storage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

      if (refresh_token) {
        await storage.setItem(REFRESH_TOKEN_KEY, refresh_token);
      }

      return access_token;
    } catch (error: any) {
      console.error('Erreur d\'authentification:', error.response?.data || error.message);
      throw new Error('Échec de l\'authentification avec l\'API 42');
    }
  }


  async refreshAccessToken(): Promise<string> {
    try {
      const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        throw new Error('Pas de refresh token disponible');
      }

      if (!API_UID || !API_SECRET) {
        throw new Error('Configuration API manquante');
      }

      const response = await axios.post<TokenResponse>(
        `${API_BASE}/oauth/token`,
        {
          grant_type: 'refresh_token',
          client_id: API_UID,
          client_secret: API_SECRET,
          refresh_token: refreshToken,
        }
      );

      const { access_token, expires_in, refresh_token: new_refresh_token } = response.data;
      const expiryTime = Date.now() + expires_in * 1000;

      await storage.setItem(TOKEN_KEY, access_token);
      await storage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

      if (new_refresh_token) {
        await storage.setItem(REFRESH_TOKEN_KEY, new_refresh_token);
      }

      return access_token;
    } catch (error: any) {
      console.error(' Erreur de rafraîchissement:', error.response?.data || error.message);
      await this.clearTokens();
      throw new Error('Session expirée, veuillez vous reconnecter');
    }
  }

  async getValidToken(): Promise<string> {
    try {
      const token = await storage.getItem(TOKEN_KEY);
      const expiry = await storage.getItem(TOKEN_EXPIRY_KEY);

      if (token && expiry) {
        const expiryTime = parseInt(expiry);
        const bufferTime = 5 * 60 * 1000; // 5 minutes de buffer

        if (Date.now() < expiryTime - bufferTime) {
          return token;
        }

        return await this.refreshAccessToken();
      }

      throw new Error('Pas de token disponible');
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await storage.getItem(TOKEN_KEY);
      return !!token;
    } catch {
      return false;
    }
  }

  async clearTokens(): Promise<void> {
    await storage.deleteItem(TOKEN_KEY);
    await storage.deleteItem(TOKEN_EXPIRY_KEY);
    await storage.deleteItem(REFRESH_TOKEN_KEY);
  }
}

export default new AuthService();
