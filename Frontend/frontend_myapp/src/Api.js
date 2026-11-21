import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
});

// Attach JWT token to every API request automatically
API.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('access_token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Response interceptor to handle 401 Unauthorized globally
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
                sessionStorage.removeItem('access_token');
                sessionStorage.removeItem('refresh_token');
            }
        }
        return Promise.reject(error);
    }
);

/* ==========================================================================
   AUTHENTICATION & PROFILE APIS
   ========================================================================== */

export const registerUser = (userData) => {
    return API.post('register/', userData);
};

export const loginUser = (credentials) => {
    return API.post('login/', credentials);
};

export const getProfile = () => {
    return API.get('profile/');
};

export const updateProfile = (profileData) => {
    return API.put('profile/', profileData);
};

export const changePassword = (passwordData) => {
    return API.post('change-password/', passwordData);
};

/* ==========================================================================
   TRANSACTIONS APIS
   ========================================================================== */

export const getTransactions = () => {
    return API.get('transactions/');
};

export const createTransaction = (transactionData) => {
    return API.post('transactions/', transactionData);
};

export const updateTransaction = (id, transactionData) => {
    return API.put(`transactions/${id}/`, transactionData);
};

export const deleteTransaction = (id) => {
    return API.delete(`transactions/${id}/`);
};

/* ==========================================================================
   BUDGETS APIS
   ========================================================================== */

export const getBudgets = () => {
    return API.get('budgets/');
};

export const createBudget = (budgetData) => {
    return API.post('budgets/', budgetData);
};

export const updateBudget = (id, budgetData) => {
    return API.put(`budgets/${id}/`, budgetData);
};

export const deleteBudget = (id) => {
    return API.delete(`budgets/${id}/`);
};

/* ==========================================================================
   SAVINGS GOALS APIS
   ========================================================================== */

export const getGoals = () => {
    return API.get('goals/');
};

export const createGoal = (goalData) => {
    return API.post('goals/', goalData);
};

export const updateGoal = (id, goalData) => {
    return API.put(`goals/${id}/`, goalData);
};

export const deleteGoal = (id) => {
    return API.delete(`goals/${id}/`);
};

export const addGoalSavings = (id, amount) => {
    return API.post(`goals/${id}/add_savings/`, { amount });
};

/* ==========================================================================
   DASHBOARD, REPORTS & ALERTS APIS
   ========================================================================== */

export const getDashboardData = () => {
    return API.get('dashboard/');
};

export const getReportsData = (params = {}) => {
    return API.get('reports/', { params });
};

export const getAlertsData = () => {
    return API.get('alerts/');
};

export default API;
