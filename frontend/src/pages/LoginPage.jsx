import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogIn, Shield, User, Lock, AlertCircle } from 'lucide-react';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/auth/login', { username, password });
            login(response.data.user, response.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at top left, hsla(var(--primary), 0.05), transparent), radial-gradient(circle at bottom right, hsla(var(--primary), 0.05), transparent)',
            backgroundColor: 'hsl(210, 40%, 98%)'
        }}>
            <div className="card glass" style={{ width: '400px', padding: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: 'hsl(var(--primary))',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: 'white',
                        boxShadow: '0 10px 20px hsla(var(--primary), 0.3)'
                    }}>
                        <Shield size={32} />
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', marginBottom: '0.5rem' }}>FleetFlow Secure</h1>
                    <p style={{ color: 'hsl(215, 20%, 50%)', fontSize: '0.875rem' }}>Enter your credentials to manage the fleet.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                    {error && (
                        <div style={{
                            padding: '0.75rem 1rem',
                            backgroundColor: 'hsla(var(--status-retired), 0.1)',
                            color: 'hsl(var(--status-retired))',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: '1px solid hsla(var(--status-retired), 0.2)'
                        }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            <User size={14} /> Username
                        </label>
                        <input
                            type="text"
                            required
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid hsl(var(--border))' }}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            <Lock size={14} /> Password
                        </label>
                        <input
                            type="password"
                            required
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid hsl(var(--border))' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}
                    >
                        {loading ? 'Authenticating...' : (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <LogIn size={18} /> Sign In
                            </span>
                        )}
                    </button>

                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.75rem', color: 'hsl(215, 20%, 60%)' }}>
                            Demo Crew: <strong>admin / admin123</strong>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
