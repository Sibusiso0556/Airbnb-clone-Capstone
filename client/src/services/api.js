import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('airbnb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('airbnb_token');
      localStorage.removeItem('airbnb_user');
      // Let AuthContext (and anything else listening) know the session just
      // died, so the UI's "logged in" state doesn't go stale and keep
      // showing authenticated actions with nothing to back them up.
      window.dispatchEvent(new Event('airbnb:auth-expired'));
    }
    return Promise.reject(error);
  }
);

export default api;
