import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus, Shield, Zap, BarChart2 } from 'lucide-react';
import './Auth.css';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [role, setRole] = useState('Manager');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const strength = !password ? 0 : password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 3 : password.length >= 8 ? 2 : 1;
    const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
    const strengthColor = ['', 'var(--accent-red)', 'var(--accent-amber)', 'var(--accent-green)'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) { toast.error('All fields are required'); return; }
        if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        if (password !== confirm) { toast.error('Passwords do not match'); return; }
        setLoading(true);
        const result = await register(email, password, name, role);
        setLoading(false);
        if (result.success) {
            toast.success('Account created! Welcome to FleetFlow 🚛');
            navigate('/dashboard');
        } else {
            toast.error(result.error || 'Registration failed');
        }
    };

    return (
        <div className="auth-page register-page">
            <div className="auth-particles register-particles">
                {[...Array(20)].map((_, i) => <div key={i} className="particle particle--green" style={{ '--i': i }} />)}
            </div>

            <div className="auth-container">
                {/* Left panel */}
                <div className="auth-panel auth-panel--left register-left">
                    <div className="auth-brand">
                        <div className="auth-logo-ring register-logo-ring">
                            <Shield size={32} />
                        </div>
                        <h1>Join FleetFlow</h1>
                        <p>Start managing your fleet smarter</p>
                    </div>
                    <div className="register-features">
                        {[
                            { icon: <Zap size={18} />, title: 'Instant Setup', desc: 'Demo fleet data loaded automatically' },
                            { icon: <Shield size={18} />, title: 'Secure & Private', desc: 'JWT-protected, MongoDB-backed' },
                            { icon: <BarChart2 size={18} />, title: 'Full Analytics', desc: 'ROI, fuel efficiency & more' },
                        ].map(f => (
                            <div key={f.title} className="register-feature-row">
                                <div className="register-feature-icon">{f.icon}</div>
                                <div>
                                    <div className="register-feature-title">{f.title}</div>
                                    <div className="register-feature-desc">{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right panel — form */}
                <div className="auth-panel auth-panel--right">
                    <div className="auth-form-header">
                        <div className="auth-form-icon register-icon"><UserPlus size={22} /></div>
                        <h2>Create Account</h2>
                        <p>Set up your fleet management account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-role-toggle">
                            {['Manager', 'Dispatcher'].map(r => (
                                <button key={r} type="button"
                                    className={`auth-role-btn ${role === r ? 'active-register' : ''}`}
                                    onClick={() => setRole(r)}>
                                    {r}
                                </button>
                            ))}
                        </div>

                        <div className="auth-field">
                            <label>Full Name</label>
                            <input type="text" placeholder="Arjun Sharma"
                                value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
                        </div>

                        <div className="auth-field">
                            <label>Email Address</label>
                            <input type="email" placeholder="you@fleetflow.in"
                                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                        </div>

                        <div className="auth-field">
                            <label>Password</label>
                            <div className="auth-pw-wrap">
                                <input type={showPw ? 'text' : 'password'} placeholder="Min 6 characters"
                                    value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
                                <button type="button" onClick={() => setShowPw(!showPw)}>
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {password && (
                                <div className="pw-strength-bar">
                                    <div className="pw-strength-track">
                                        <div className="pw-strength-fill" style={{ width: `${(strength / 3) * 100}%`, background: strengthColor[strength] }} />
                                    </div>
                                    <span style={{ color: strengthColor[strength], fontSize: 11 }}>{strengthLabel[strength]}</span>
                                </div>
                            )}
                        </div>

                        <div className="auth-field">
                            <label>Confirm Password</label>
                            <input type="password" placeholder="Repeat your password"
                                value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password"
                                style={confirm && confirm !== password ? { borderColor: 'var(--accent-red)' } : {}} />
                            {confirm && confirm !== password && <span className="auth-field-error">Passwords don't match</span>}
                        </div>

                        <button type="submit" className="auth-submit-btn register-btn" disabled={loading}>
                            {loading
                                ? <span className="auth-spinner" />
                                : <><UserPlus size={16} /> Create Account</>
                            }
                        </button>
                    </form>

                    <div className="auth-switch">
                        Already have an account?&nbsp;
                        <Link to="/" className="auth-switch-link register-switch-link">Sign in →</Link>
                    </div>

                    <div className="auth-divider"><span>Secured by MongoDB + JWT</span></div>
                </div>
            </div>
        </div>
    );
}
