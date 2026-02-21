import { createContext, useContext, useState, useEffect } from 'react';
import { apiGetMe } from '../api';

// ─── Extend api.js inline helpers ────────────────────────────────────────────
const BASE = 'http://localhost:5000/api';
const post = async (endpoint, body) => {
    const res = await fetch(`${BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Re-hydrate session from localStorage JWT on page load
    useEffect(() => {
        const token = localStorage.getItem('fleetflow_token');
        if (!token) { setAuthLoading(false); return; }
        apiGetMe()
            .then(user => setCurrentUser(user))
            .catch(() => localStorage.removeItem('fleetflow_token'))
            .finally(() => setAuthLoading(false));
    }, []);

    /** Sign In — requires existing account */
    const login = async (email, password, role) => {
        try {
            const { token, user } = await post('/auth/login', { email, password, role, mode: 'login' });
            localStorage.setItem('fleetflow_token', token);
            setCurrentUser(user);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    /** Sign Up — create a new account */
    const register = async (email, password, name, role) => {
        try {
            const { token, user } = await post('/auth/register', { email, password, name, role });
            localStorage.setItem('fleetflow_token', token);
            setCurrentUser(user);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('fleetflow_token');
        setCurrentUser(null);
    };

    const hasRole = (role) => currentUser?.role === role;

    return (
        <AuthContext.Provider value={{ currentUser, authLoading, login, register, logout, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
