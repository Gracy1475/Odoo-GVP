import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Truck, Navigation, Wrench, Fuel,
    Users, BarChart2, LogOut, ChevronRight, Shield
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Command Center' },
    { to: '/vehicles', icon: Truck, label: 'Vehicle Registry' },
    { to: '/trips', icon: Navigation, label: 'Trip Dispatcher' },
    { to: '/maintenance', icon: Wrench, label: 'Maintenance Logs' },
    { to: '/expenses', icon: Fuel, label: 'Expenses & Fuel' },
    { to: '/drivers', icon: Users, label: 'Driver Profiles' },
    { to: '/analytics', icon: BarChart2, label: 'Analytics' },
];

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    const handleLogout = () => { logout(); navigate('/'); };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon"><Shield size={20} /></div>
                <div className="logo-text">
                    <span className="logo-brand">FleetFlow</span>
                    <span className="logo-tagline">Fleet OS</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(({ to, icon: Icon, label }) => {
                    const active = location.pathname === to;
                    return (
                        <Link key={to} to={to} className={`nav-item${active ? ' active' : ''}`}>
                            <Icon size={18} />
                            <span>{label}</span>
                            {active && <ChevronRight size={14} className="nav-arrow" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="user-pill">
                    <div className="user-avatar">{currentUser?.name?.[0]?.toUpperCase() || 'U'}</div>
                    <div className="user-info">
                        <span className="user-name">{currentUser?.name || 'User'}</span>
                        <span className="user-role">{currentUser?.role || 'Guest'}</span>
                    </div>
                </div>
                <button className="btn btn-ghost btn-sm btn-icon logout-btn" onClick={handleLogout} title="Logout">
                    <LogOut size={16} />
                </button>
            </div>
        </aside>
    );
}
