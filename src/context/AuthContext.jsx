import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// Map Firebase UID → role using localStorage (or extend to Firestore user docs)
const getRoleFromStorage = (uid) => localStorage.getItem(`fleetflow_role_${uid}`) || 'Manager';
const setRoleInStorage = (uid, role) => localStorage.setItem(`fleetflow_role_${uid}`, role);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [userRole, setUserRole] = useState('Manager');

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                const role = getRoleFromStorage(user.uid);
                setUserRole(role);
                setCurrentUser({ uid: user.uid, email: user.email, name: user.email.split('@')[0], role });
            } else {
                setCurrentUser(null);
            }
            setAuthLoading(false);
        });
        return unsub;
    }, []);

    const login = async (email, password, role) => {
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            setRoleInStorage(cred.user.uid, role);
            setUserRole(role);
            return { success: true };
        } catch (err) {
            // If user doesn't exist yet, auto-create for demo convenience
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
                try {
                    const cred = await createUserWithEmailAndPassword(auth, email, password);
                    setRoleInStorage(cred.user.uid, role);
                    setUserRole(role);
                    return { success: true, created: true };
                } catch (createErr) {
                    return { success: false, error: createErr.message };
                }
            }
            return { success: false, error: err.message };
        }
    };

    const logout = async () => {
        await signOut(auth);
        setCurrentUser(null);
    };

    const resetPassword = async (email) => {
        await sendPasswordResetEmail(auth, email);
    };

    const hasRole = (role) => currentUser?.role === role;

    return (
        <AuthContext.Provider value={{ currentUser, authLoading, login, logout, resetPassword, hasRole, userRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
