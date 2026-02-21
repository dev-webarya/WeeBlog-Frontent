import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth headers
api.interceptors.request.use(
    (config) => {
        // Admin Basic auth (for /api/admin routes)
        if (config.url?.includes('/api/admin')) {
            const auth = localStorage.getItem('adminAuth');
            if (auth) {
                const { username, password } = JSON.parse(auth);
                const credentials = btoa(`${username}:${password}`);
                config.headers.Authorization = `Basic ${credentials}`;
            }
        }
        // User JWT auth (for /api/account, /api/checkout, and other user-authenticated routes)
        else {
            const token = localStorage.getItem('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Admin unauthorized
            if (error.config?.url?.includes('/api/admin')) {
                localStorage.removeItem('adminAuth');
                if (window.location.pathname.startsWith('/admin')) {
                    window.location.href = '/admin/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
