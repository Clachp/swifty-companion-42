import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_BASE = 'https://api.intra.42.fr';
const TOKEN_KEY = 'access_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

const API_UID = Constants.expoConfig?.extra?.apiClientId;
const API_SECRET = Constants.expoConfig?.extra?.apiClientSecret;

// Storage wrapper compatible avec toutes les plateformes
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
  scope: string;
  created_at: number;
}

class AuthService {

  async authenticate(): Promise<string> {
    try {
      if (!API_UID || !API_SECRET) {
        throw new Error('Configuration API manquante. Verifiez votre .env');
      }

      console.log('Authentification aupres de l\'API 42...');

      const response = await axios.post<TokenResponse>(
        `${API_BASE}/oauth/token`,
        {
          grant_type: 'client_credentials',
          client_id: API_UID,
          client_secret: API_SECRET,
        }
      );

      const { access_token, expires_in } = response.data;
      const expiryTime = Date.now() + expires_in * 1000;

      await storage.setItem(TOKEN_KEY, access_token);
      await storage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

      console.log('Authentification reussie');
      return access_token;
    } catch (error: any) {
      console.error('Erreur d\'authentification:', error.response?.data || error.message);
      throw new Error('Echec de l\'authentification avec l\'API 42');
    }
  }

  async getValidToken(): Promise<string> {
    try {
      const token = await storage.getItem(TOKEN_KEY);
      const expiry = await storage.getItem(TOKEN_EXPIRY_KEY);

      if (token && expiry) {
        const expiryTime = parseInt(expiry);
        const bufferTime = 5 * 60 * 1000;

        if (Date.now() < expiryTime - bufferTime) {
          console.log('Token valide');
          return token;
        }
      }

      console.log('Token expire ou manquant, rafraichissement...');
      return await this.authenticate();
    } catch (error) {
      console.error('Erreur lors de la recuperation du token:', error);
      return await this.authenticate();
    }
  }


  async clearTokens(): Promise<void> {
    await storage.deleteItem(TOKEN_KEY);
    await storage.deleteItem(TOKEN_EXPIRY_KEY);
    console.log('Tokens supprimes');
  }
}

export default new AuthService();
