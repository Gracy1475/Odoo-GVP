// Central API utility — all requests go through here
// The JWT token is stored in localStorage after login

const BASE_URL = 'http://localhost:5000/api';

function getToken() {
    return localStorage.getItem('fleetflow_token');
}

export async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
    return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const apiLogin = (email, password, role) =>
    apiFetch('/auth/login', { method: 'POST', body: { email, password, role } });

export const apiGetMe = () => apiFetch('/auth/me');

// ─── Vehicles ─────────────────────────────────────────────────────────────────
export const apiGetVehicles = () => apiFetch('/vehicles');
export const apiAddVehicle = (data) => apiFetch('/vehicles', { method: 'POST', body: data });
export const apiUpdateVehicle = (id, data) => apiFetch(`/vehicles/${id}`, { method: 'PUT', body: data });
export const apiDeleteVehicle = (id) => apiFetch(`/vehicles/${id}`, { method: 'DELETE' });

// ─── Drivers ──────────────────────────────────────────────────────────────────
export const apiGetDrivers = () => apiFetch('/drivers');
export const apiAddDriver = (data) => apiFetch('/drivers', { method: 'POST', body: data });
export const apiUpdateDriver = (id, data) => apiFetch(`/drivers/${id}`, { method: 'PUT', body: data });
export const apiDeleteDriver = (id) => apiFetch(`/drivers/${id}`, { method: 'DELETE' });

// ─── Trips ────────────────────────────────────────────────────────────────────
export const apiGetTrips = () => apiFetch('/trips');
export const apiAddTrip = (data) => apiFetch('/trips', { method: 'POST', body: data });
export const apiUpdateTripStatus = (id, status, odometerEnd) =>
    apiFetch(`/trips/${id}/status`, { method: 'PUT', body: { status, odometerEnd } });
export const apiDeleteTrip = (id) => apiFetch(`/trips/${id}`, { method: 'DELETE' });

// ─── Maintenance ──────────────────────────────────────────────────────────────
export const apiGetMaintenance = () => apiFetch('/maintenance');
export const apiAddMaintenance = (d) => apiFetch('/maintenance', { method: 'POST', body: d });
export const apiCompleteMaintenance = (id) => apiFetch(`/maintenance/${id}/complete`, { method: 'PUT', body: {} });
export const apiDeleteMaintenance = (id) => apiFetch(`/maintenance/${id}`, { method: 'DELETE' });

// ─── Fuel ─────────────────────────────────────────────────────────────────────
export const apiGetFuel = () => apiFetch('/fuel');
export const apiAddFuel = (d) => apiFetch('/fuel', { method: 'POST', body: d });
export const apiDeleteFuel = (id) => apiFetch(`/fuel/${id}`, { method: 'DELETE' });
