import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Truck, LogIn, Shield, Activity, MapPin } from 'lucide-react';
import './Auth.css';

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
        setLoading(true);
        const result = await login(email, password, role);
        setLoading(false);
        if (result.success) {
            toast.success('Welcome back!');
            navigate('/dashboard');
        } else {
            toast.error(result.error || 'Login failed');
        }
    };

    return (
        <div className="auth-page signin-page">
            {/* Animated particle background */}
            <div className="auth-particles">
                {[...Array(20)].map((_, i) => <div key={i} className="particle" style={{ '--i': i }} />)}
            </div>

            <div className="auth-container">
                {/* Left panel */}
                <div className="auth-panel auth-panel--left">
                    <div className="auth-brand">
                        <div className="auth-logo-ring">
                            <Truck size={32} />
                        </div>
                        <h1>FleetFlow</h1>
                        <p>Fleet & Logistics Command Center</p>
                    </div>
                    <div className="auth-stats">
                        {[
                            { icon: <Truck size={20} />, label: 'Vehicles Tracked', val: '6+' },
                            { icon: <Activity size={20} />, label: 'Live Trips', val: '4' },
                            { icon: <MapPin size={20} />, label: 'Routes Optimized', val: '∞' },
                        ].map(s => (
                            <div key={s.label} className="auth-stat-card">
                                <div className="auth-stat-icon">{s.icon}</div>
                                <div>
                                    <div className="auth-stat-val">{s.val}</div>
                                    <div className="auth-stat-label">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <blockquote className="auth-quote">
                        "Optimize every mile, every driver, every rupee."
                    </blockquote>
                </div>

                {/* Right panel — form */}
                <div className="auth-panel auth-panel--right">
                    <div className="auth-form-header">
                        <div className="auth-form-icon signin-icon"><LogIn size={22} /></div>
                        <h2>Welcome back</h2>
                        <p>Sign in to your FleetFlow account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-role-toggle">
                            {['Manager', 'Dispatcher'].map(r => (
                                <button key={r} type="button"
                                    className={`auth-role-btn ${role === r ? 'active-signin' : ''}`}
                                    onClick={() => setRole(r)}>
                                    {r}
                                </button>
                            ))}
                        </div>

                        <div className="auth-field">
                            <label>Email Address</label>
                            <input type="email" placeholder="you@fleetflow.in"
                                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                        </div>

                        <div className="auth-field">
                            <label>Password</label>
                            <div className="auth-pw-wrap">
                                <input type={showPw ? 'text' : 'password'} placeholder="Your password"
                                    value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
                                <button type="button" onClick={() => setShowPw(!showPw)}>
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="auth-submit-btn signin-btn" disabled={loading}>
                            {loading
                                ? <span className="auth-spinner" />
                                : <><LogIn size={16} /> Sign In</>
                            }
                        </button>
                    </form>

                    <div className="auth-switch">
                        Don't have an account?&nbsp;
                        <Link to="/register" className="auth-switch-link">Create one →</Link>
                    </div>

                    <div className="auth-divider"><span>Secured by MongoDB + JWT</span></div>
                </div>
            </div>
        </div>
    );
}
