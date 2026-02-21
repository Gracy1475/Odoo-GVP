import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Shield, Eye, EyeOff, Truck, Navigation, BarChart2 } from 'lucide-react';
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Manager');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) { toast.error('Please fill in all fields'); return; }
        if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        const result = await login(email, password, role);
        setLoading(false);
        if (result.success) {
            toast.success(`Welcome! Signed in as ${role}`);
            navigate('/dashboard');
        } else {
            toast.error(result.error || 'Login failed. Check your credentials.');
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="bg-icon" style={{ '--i': i }}><Truck size={24} /></div>
                ))}
            </div>

            <div className="login-left">
                <div className="login-brand">
                    <div className="login-logo"><Shield size={28} /></div>
                    <div>
                        <h1 className="brand-name">FleetFlow</h1>
                        <p className="brand-sub">Fleet &amp; Logistics Management OS</p>
                    </div>
                </div>
                <div className="login-features">
                    {[
                        { icon: Truck, text: 'Real-time Fleet Monitoring' },
                        { icon: Navigation, text: 'Smart Trip Dispatch' },
                        { icon: BarChart2, text: 'Advanced Analytics & ROI' },
                    ].map(({ icon: Icon, text }) => (
                        <div key={text} className="feature-item">
                            <div className="feature-icon"><Icon size={16} /></div>
                            <span>{text}</span>
                        </div>
                    ))}
                </div>
                <p className="login-tagline">"Optimize every mile, every driver, every rupee."</p>
                <p style={{ marginTop: 'auto', color: 'var(--text-muted)', fontSize: 12 }}>
                    🍃 Powered by MongoDB Atlas · New users are auto-registered on first login.
                </p>
            </div>

            <div className="login-right">
                <div className="login-card">
                    <div className="login-card-header">
                        <h2>Sign In</h2>
                        <p>Access your fleet command center</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <div className="role-toggle">
                                {['Manager', 'Dispatcher'].map(r => (
                                    <button key={r} type="button" className={`role-btn${role === r ? ' active' : ''}`} onClick={() => setRole(r)}>{r}</button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input className="form-input" type="email" placeholder="manager@fleetflow.in"
                                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="pw-wrap">
                                <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="min 6 characters"
                                    value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
                                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                            {loading ? <span className="spinner" /> : null}
                            {loading ? 'Signing in…' : 'Sign In to Dashboard'}
                        </button>
                    </form>

                    <p className="login-hint">New user? Just enter any email + password (≥ 6 chars) to auto-register.</p>
                </div>
            </div>
        </div>
    );
}
