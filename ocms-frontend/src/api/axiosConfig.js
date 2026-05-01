/**
 * @file axiosConfig.js
 * @description Pre-configured Axios instance for all authenticated API calls.
 *              Automatically attaches the JWT Bearer token from localStorage
 *              to every outgoing request via a request interceptor.
 */

import axios from 'axios';

/**
 * Axios instance with the backend base URL pre-configured.
 * All component-level API calls should import and use this instead of
 * the raw `axios` object to ensure authentication headers are included.
 */
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

/**
 * Request interceptor — runs before every outgoing request.
 * Reads the JWT token from localStorage and, if present, sets the
 * `Authorization: Bearer <token>` header.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;