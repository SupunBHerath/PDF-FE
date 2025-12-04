import axios from 'axios';

// Use Vite proxy in development to avoid CORS issues
const API_URL = import.meta.env.VITE_API_URL || '/api';

console.log('🔧 API Client initialized with base URL:', API_URL);

// Create axios instance
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Flag to prevent multiple simultaneous redirects
let isRedirecting = false;
let requestCount = 0;
let lastLogoutTime = 0;

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        requestCount++;
        console.log(`📡 API Request #${requestCount}:`, config.method?.toUpperCase(), config.url);

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', response.config.url, '→', response.status);
        return response.data;
    },
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url;

        console.error(`❌ API Error: ${status} from ${url}`, error.response?.data);

        // Prevent logout loops - at most one logout per 5 seconds
        const now = Date.now();
        const timeSinceLastLogout = now - lastLogoutTime;

        // Check various conditions before auto-logout
        const hasToken = !!localStorage.getItem('token');
        const isLoginRequest = url?.includes('/auth/login');
        const isOnLoginPage = window.location.pathname.includes('/login');
        const canLogout = timeSinceLastLogout > 5000; // 5 seconds cooldown

        // Only auto-logout if:
        // 1. It's a 401 error
        // 2. Not already redirecting
        // 3. Not on login page
        // 4. Not a login request itself
        // 5. We actually have a token (so it became invalid)
        // 6. Haven't logged out recently
        if (
            status === 401 &&
            !isRedirecting &&
            !isOnLoginPage &&
            !isLoginRequest &&
            hasToken &&
            canLogout
        ) {
            console.warn('🚨 Token invalid - logging out (had token, now unauthorized)');
            isRedirecting = true;
            lastLogoutTime = now;

            // Clear all auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('auth-storage');

            // Redirect with delay
            setTimeout(() => {
                if (!window.location.pathname.includes('/login')) {
                    console.log('🔄 Redirecting to login page');
                    window.location.href = '/login';
                }
                // Reset after longer delay
                setTimeout(() => {
                    isRedirecting = false;
                }, 3000);
            }, 300);
        } else if (isLoginRequest && status === 401) {
            // Failed login - this is normal, don't auto-logout
            console.log('❌ Login failed - invalid credentials');
        } else if (status === 401 && !hasToken) {
            // No token and got 401 - this is expected, no need to logout
            console.log('ℹ️ Unauthorized (no token) - ignoring');
        }

        // Return error for the calling code to handle
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        return Promise.reject({
            message: errorMessage,
            status: status,
            data: error.response?.data
        });
    }
);

export default apiClient;
