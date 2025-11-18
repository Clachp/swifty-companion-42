import axios, { AxiosError, AxiosInstance } from 'axios';
import { ApiError, User42 } from '../types/api.types';
import authService from './AuthService';

const API_BASE = 'https://api.intra.42.fr/v2';

class Api42Service {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      timeout: 10000,
    });

    // Intercepteur : ajouter le token à chaque requête
    this.client.interceptors.request.use(
      async (config) => {
        const token = await authService.getValidToken();
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur : gérer les erreurs
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token invalide, on nettoie et on réessaie
          console.log('⚠️ Token invalide, nouvelle authentification...');
          await authService.clearTokens();
          const token = await authService.getValidToken();
          
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${token}`;
            return this.client.request(error.config);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Récupère les informations d'un utilisateur par son login
   */
  async getUserByLogin(login: string): Promise<User42> {
    try {
      console.log(`🔍 Recherche de l'utilisateur: ${login}`);
      const response = await this.client.get<User42>(`/users/${login}`);
      console.log('✅ Utilisateur trouvé !');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response?.status === 404) {
        throw this.createError('Utilisateur non trouvé', 404);
      }
      
      if (!axiosError.response) {
        throw this.createError('Erreur de connexion réseau', 0);
      }
      
      throw this.createError(
        'Erreur lors de la récupération des données',
        axiosError.response.status
      );
    }
  }

  /**
   * Recherche des utilisateurs (pour autocomplete futur)
   */
  async searchUsers(query: string, perPage: number = 10): Promise<User42[]> {
    try {
      const response = await this.client.get<User42[]>('/users', {
        params: {
          search: query,
          per_page: perPage,
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur de recherche:', error);
      return [];
    }
  }

  private createError(message: string, status: number): ApiError {
    return {
      message,
      status,
      code: `API_ERROR_${status}`,
    };
  }
}

export default new Api42Service();