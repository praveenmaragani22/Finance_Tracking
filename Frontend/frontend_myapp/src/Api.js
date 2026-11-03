import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
});

// Attach JWT token to every API request
API.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('access_token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Dashboard API
export const getDashboardData = () => {
    return API.get('dashboard/');
};

export default API;