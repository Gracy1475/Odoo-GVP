import { createContext, useContext, useState, useEffect } from 'react';
import { apiLogin, apiGetMe } from '../api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Re-hydrate session from localStorage token on page load
    useEffect(() => {
        const token = localStorage.getItem('fleetflow_token');
        if (!token) { setAuthLoading(false); return; }
        apiGetMe()
            .then(user => setCurrentUser(user))
            .catch(() => { localStorage.removeItem('fleetflow_token'); })
            .finally(() => setAuthLoading(false));
    }, []);

    const login = async (email, password, role) => {
        try {
            const { token, user } = await apiLogin(email, password, role);
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
        <AuthContext.Provider value={{ currentUser, authLoading, login, logout, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
