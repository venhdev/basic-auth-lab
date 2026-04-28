import axios from 'axios';
import { useAuthStore } from './auth-store';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Refresh token is automatically sent via cookie
        const response = await axios.post('http://localhost:3001/auth/refresh', {}, {
          withCredentials: true,
        });
        
        const { access_token } = response.data;
        useAuthStore.getState().setAccessToken(access_token);
        
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
