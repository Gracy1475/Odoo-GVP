import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// Add interceptor to include token from localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const vehicleService = {
    getVehicles: () => api.get('/vehicles'),
    addVehicle: (data) => api.post('/vehicles', data),
    getDetails: (id) => api.get(`/vehicles/${id}`),
    deleteVehicle: (id) => api.delete(`/vehicles/${id}`),
};

export const driverService = {
    getDrivers: () => api.get('/drivers'),
    addDriver: (data) => api.post('/drivers', data),
    updateStatus: (id, status) => api.patch(`/drivers/${id}/status`, { status }),
};

export const tripService = {
    getTrips: () => api.get('/trips'),
    createTrip: (data) => api.post('/trips', data),
    updateTrip: (id, data) => api.put(`/trips/${id}`, data),
    completeTrip: (id, end_odometer) => api.patch(`/trips/${id}/complete`, { end_odometer }),
    deleteTrip: (id) => api.delete(`/trips/${id}`),
};

export const maintenanceService = {
    getLogs: () => api.get('/maintenance'),
    createEntry: (data) => api.post('/maintenance', data),
    releaseVehicle: (id) => api.patch(`/maintenance/${id}/complete`),
};

export const fuelService = {
    getLogs: () => api.get('/fuel'),
    createEntry: (data) => api.post('/fuel', data),
};

export const dashboardService = {
    getStats: () => api.get('/dashboard/stats'),
};

export const analyticsService = {
    getReport: () => api.get('/analytics/report'),
    getCSVUrl: () => `${api.defaults.baseURL}/analytics/export/csv?token=${localStorage.getItem('token')}`,
};

export const safetyService = {
    getEvents: () => api.get('/safety/events'),
    getLeaderboard: () => api.get('/safety/leaderboard'),
    logEvent: (data) => api.post('/safety/events', data),
};

export default api;
