import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('launchpad-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export const messageFrom = error => error.response?.data?.message || 'Something went wrong. Please try again.';
export default api;
