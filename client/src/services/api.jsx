import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const cleanBaseURL = rawBaseURL.endsWith('/') ? rawBaseURL.slice(0, -1) : rawBaseURL;

const API = axios.create({
    baseURL: `${cleanBaseURL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Read the best error text from the server response
// (the server sends { error } from the error middleware and { message } from controllers)
export const getErrorMessage = (error) => {
    const data = error.response?.data;
    const msg = data?.error || data?.message || error.message;
    return typeof msg === 'object' ? JSON.stringify(msg) : msg;
};

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// An expired or revoked token sends the admin back to the login page
API.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        if (error.response?.status === 401 && localStorage.getItem('token') && !isLoginRequest) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;
