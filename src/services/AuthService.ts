import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_BASE = 'https://api.intra.42.fr';
const TOKEN_KEY = 'access_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_LOGIN_KEY = 'user_login';

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
        throw new Error('Missing API configuration. Check your .env file');
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
      console.error('[AuthService] Token exchange failed:', error.response?.data || error.message);
      throw new Error('Authentication failed with 42 API');
    }
  }

  async refreshAccessToken(): Promise<string> {
    try {
      const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      if (!API_UID || !API_SECRET) {
        throw new Error('Missing API configuration');
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
    } catch {
      await this.clearTokens();
      throw new Error('Session expired, please login again');
    }
  }

  async getValidToken(): Promise<string> {
    try {
      const token = await storage.getItem(TOKEN_KEY);
      const expiry = await storage.getItem(TOKEN_EXPIRY_KEY);

      // Force reduce token's expiry time to test refresh token functionality :
      // const expiredTime = Date.now() - 1000;
      // const expiry = await storage.setItem(TOKEN_EXPIRY_KEY, expiredTime.toString());

      if (token && expiry) {
        const expiryTime = parseInt(expiry);
        const bufferTime = 5 * 60 * 1000;
    
        // console.log('[AuthService] Time until expiry:', (expiryTime - Date.now()) / 1000, 'seconds');

        if (Date.now() < expiryTime - bufferTime) {
          // console.log('[AuthService] Token still valid');
          return token;
        }

        return await this.refreshAccessToken();
      }

      throw new Error('No token available');
    } catch (error) {
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

  async setUserLogin(login: string): Promise<void> {
    await storage.setItem(USER_LOGIN_KEY, login);
  }

  async getUserLogin(): Promise<string | null> {
    try {
      return await storage.getItem(USER_LOGIN_KEY);
    } catch {
      return null;
    }
  }

  async clearTokens(): Promise<void> {
    await storage.deleteItem(TOKEN_KEY);
    await storage.deleteItem(TOKEN_EXPIRY_KEY);
    await storage.deleteItem(REFRESH_TOKEN_KEY);
    await storage.deleteItem(USER_LOGIN_KEY);
  }
}

export default new AuthService();
