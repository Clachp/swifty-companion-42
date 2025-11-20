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

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
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

  async getCurrentUser(): Promise<User42> {
    try {
      const response = await this.client.get<User42>(`/me`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 404) {
        throw this.createError('User not found', 404);
      }

      if (!axiosError.response) {
        throw this.createError('Network error', 0);
      }

      throw this.createError(
        'Error retrieving data',
        axiosError.response.status
      );
    }
  }

  async getCurrentUserLogin(): Promise<string> {
    try {
      const response = await this.client.get<{ login: string }>(`/me`, {
        params: {
          fields: 'login'
        }
      });
      return response.data.login;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 404) {
        throw this.createError('User not found', 404);
      }

      if (!axiosError.response) {
        throw this.createError('Network error', 0);
      }

      throw this.createError(
        'Error retrieving user login',
        axiosError.response.status
      );
    }
  }

  async getUserByLogin(login: string): Promise<User42> {
    try {
      const response = await this.client.get<User42>(`/users/${login}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 404) {
        throw this.createError('User not found', 404);
      }

      if (!axiosError.response) {
        throw this.createError('Network error', 0);
      }

      throw this.createError(
        'Error retrieving data',
        axiosError.response.status
      );
    }
  }

  async searchUsers(query: string, perPage: number = 10): Promise<User42[]> {
    try {
      const response = await this.client.get<User42[]>('/users', {
        params: {
          search: query,
          per_page: perPage,
        },
      });
      return response.data;
    } catch {
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