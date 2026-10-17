// utils/axiosInstance.js
import axios from 'axios';
import toast from 'react-hot-toast';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_DOMAIN_URL,
    withCredentials: false, // keep as-is; tokens ride in the Authorization header
});

// Request interceptor to add token to headers
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');

                if (!refreshToken) {
                    clearUserDataAndRedirect();
                    return Promise.reject(error);
                }

                const response = await axios.post(
                    `${import.meta.env.VITE_DOMAIN_URL}/api/v1/users/refresh-token`,
                    { refreshToken },
                    {
                        headers: { 'Content-Type': 'application/json' },
                        // ← FIX B: accept Set-Cookie from the refresh endpoint too
                        withCredentials: true,
                    }
                );

                if (response.data.success) {
                    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                    localStorage.setItem('accessToken', accessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }

                    // ← FIX A: keep the socket's handshake token in sync.
                    // We do NOT reconnect — the current socket is already
                    // authenticated on the server, and the next reconnect
                    // (network blip, watchdog, tab wake) will pick up the
                    // new token from `socket.auth`.
                    import('./socket')
                        .then(({ updateSocketAuth }) => updateSocketAuth(accessToken))
                        .catch(() => { });

                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return axiosInstance(originalRequest);
                } else {
                    clearUserDataAndRedirect();
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                clearUserDataAndRedirect();
                return Promise.reject(refreshError);
            }
        } else if (error.response?.status === 401 && originalRequest._retry) {
            clearUserDataAndRedirect();
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

// Helper function to clear user data and redirect
const clearUserDataAndRedirect = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // ← FIX C: drop socket auth so any pending server-side state is cleared
    import('./socket')
        .then(({ updateSocketAuth }) => updateSocketAuth(null, { reconnect: true }))
        .catch(() => { });

    toast.error('Session expired. Please log in again.');

    if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/signup'
    ) {
        window.location.href = '/login';
    }
};

export default axiosInstance;