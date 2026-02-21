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
    const [forgotOpen, setForgotOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const { login, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) { toast.error('Please fill in all fields'); return; }
        setLoading(true);
        const result = await login(email, password, role);
        setLoading(false);
        if (result.success) {
            toast.success(result.created ? `Account created & signed in as ${role}!` : `Welcome back! Signed in as ${role}`);
            navigate('/dashboard');
        } else {
            toast.error(result.error || 'Login failed. Check your credentials.');
        }
    };

    const handleReset = async () => {
        if (!resetEmail) { toast.error('Enter your email'); return; }
        try {
            await resetPassword(resetEmail);
            toast.success('Password reset email sent!');
            setForgotOpen(false);
        } catch {
            toast.error('Could not send reset email.');
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
                <p className="login-hint" style={{ marginTop: 'auto', textAlign: 'left', color: 'var(--text-muted)', fontSize: 12 }}>
                    🔥 Powered by Google Firebase · New users are auto-registered on first login.
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

                        <button type="button" className="forgot-link" onClick={() => setForgotOpen(true)}>
                            Forgot password?
                        </button>

                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                            {loading ? <span className="spinner" /> : null}
                            {loading ? 'Signing in…' : 'Sign In to Dashboard'}
                        </button>
                    </form>

                    <p className="login-hint">New user? Just enter any email + password (≥6 chars) to auto-register.</p>
                </div>
            </div>

            {forgotOpen && (
                <div className="modal-overlay" onClick={() => setForgotOpen(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div className="modal-header"><h2>Reset Password</h2></div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input className="form-input" type="email" placeholder="your@email.com"
                                value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost btn-sm" onClick={() => setForgotOpen(false)}>Cancel</button>
                            <button className="btn btn-primary btn-sm" onClick={handleReset}>Send Reset Link</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
