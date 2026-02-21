import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Truck,
    Users,
    Navigation,
    Wrench,
    Fuel,
    ShieldCheck,
    BarChart3,
    Search,
    Settings,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Command Center', path: '/' },
        { icon: <Truck size={20} />, label: 'Vehicle Registry', path: '/vehicles' },
        { icon: <Users size={20} />, label: 'Driver Profiles', path: '/drivers' },
        { icon: <Navigation size={20} />, label: 'Dispatcher', path: '/dispatch' },
        { icon: <Wrench size={20} />, label: 'Maintenance', path: '/maintenance' },
        { icon: <Fuel size={20} />, label: 'Fuel Logs', path: '/fuel' },
        { icon: <ShieldCheck size={20} />, label: 'Safety', path: '/safety' },
        { icon: <BarChart3 size={20} />, label: 'Analytics', path: '/analytics' },
    ];

    return (
        <aside className="sidebar" style={{
            width: 'var(--sidebar-width)',
            height: '100vh',
            backgroundColor: 'hsl(var(--card))',
            borderRight: '1px solid hsl(var(--border))',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem 1rem'
        }}>
            <div className="logo" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0 0.5rem 2rem 0.5rem',
                color: 'hsl(var(--primary))'
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'hsl(var(--primary))',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}>
                    <Navigation size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>FleetFlow</h2>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--secondary-foreground))',
                            backgroundColor: isActive ? 'hsla(var(--primary), 0.1)' : 'transparent',
                            fontWeight: isActive ? 600 : 500,
                            fontSize: '0.925rem',
                            transition: 'all 0.2s'
                        })}
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer" style={{
                padding: '1.5rem 0.5rem 0 0.5rem',
                borderTop: '1px solid hsl(var(--border))',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                <button
                    className="btn"
                    style={{ justifyContent: 'flex-start', color: 'hsl(var(--status-retired))', backgroundColor: 'hsla(var(--status-retired), 0.05)' }}
                    onClick={() => {
                        // Logout logic will be handled in Header mostly, but can be here too
                    }}
                >
                    <Settings size={20} /> Settings
                </button>
            </div>
        </aside>
    );
};

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header style={{
            height: 'var(--header-height)',
            backgroundColor: 'hsla(var(--card), 0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid hsl(var(--border))',
            padding: '0 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            marginLeft: 'var(--sidebar-width)'
        }}>
            <div className="search-bar" style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
            }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', color: 'hsl(215, 20%, 65%)' }} />
                <input
                    type="text"
                    placeholder="Search fleet, trips, or drivers..."
                    style={{
                        padding: '0.6rem 1rem 0.6rem 2.5rem',
                        borderRadius: '10px',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--background))',
                        width: '350px',
                        outline: 'none',
                        fontSize: '0.875rem'
                    }}
                />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.full_name || user?.username || 'Gani Admin'}</p>
                        <p style={{ fontSize: '0.75rem', color: 'hsl(215, 20%, 50%)' }}>{user?.role || 'Fleet Manager'}</p>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'hsl(var(--primary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 600
                    }}>
                        {(user?.full_name || user?.username || 'G')[0].toUpperCase()}
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    title="Sign Out"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'transparent',
                        color: 'hsl(var(--status-retired))',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'hsla(var(--status-retired), 0.05)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
};

const Layout = () => {
    return (
        <div className="layout-container">
            <Sidebar />
            <div style={{ flex: 1 }}>
                <Header />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
