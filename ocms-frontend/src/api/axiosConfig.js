import axios from 'axios';

// Create a custom version of axios
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// This "interceptor" runs before every single request is sent
api.interceptors.request.use(
  (config) => {
    // Look in LocalStorage for the token we saved during login
    const token = localStorage.getItem('token');
    
    // If we have a token, attach it to the headers like a digital ID badge
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;