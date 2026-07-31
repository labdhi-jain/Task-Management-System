import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CheckSquare,
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  ListTodo,
  User as UserIcon,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--bg-glass-border)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0.9rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Brand Logo */}
        <Link
          to={user ? '/dashboard' : '/login'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--color-primary), hsl(320, 80%, 65%))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          <CheckSquare
            size={26}
            style={{ color: 'var(--color-primary)' }}
          />
          <span>TaskFlow</span>
        </Link>

        {/* Navigation Links (Visible when logged in) */}
        {user && (
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Link
              to="/dashboard"
              className={`btn btn-ghost btn-sm ${
                location.pathname === '/dashboard' ? 'active-nav' : ''
              }`}
              style={{
                background:
                  location.pathname === '/dashboard'
                    ? 'var(--bg-tertiary)'
                    : 'transparent',
                color:
                  location.pathname === '/dashboard'
                    ? 'var(--color-primary)'
                    : 'var(--text-secondary)',
              }}
            >
              <LayoutDashboard size={18} />
              <span className="hide-on-mobile">Dashboard</span>
            </Link>

            <Link
              to="/tasks"
              className={`btn btn-ghost btn-sm ${
                location.pathname === '/tasks' ? 'active-nav' : ''
              }`}
              style={{
                background:
                  location.pathname === '/tasks'
                    ? 'var(--bg-tertiary)'
                    : 'transparent',
                color:
                  location.pathname === '/tasks'
                    ? 'var(--color-primary)'
                    : 'var(--text-secondary)',
              }}
            >
              <ListTodo size={18} />
              <span className="hide-on-mobile">My Tasks</span>
            </Link>
          </nav>
        )}

        {/* Actions Right (Theme Switcher + User Profile / Logout) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Dark / Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-sm"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            style={{ padding: '0.45rem', borderRadius: '50%' }}
          >
            {theme === 'dark' ? (
              <Sun size={20} style={{ color: 'hsl(38, 92%, 60%)' }} />
            ) : (
              <Moon size={20} style={{ color: 'hsl(230, 25%, 35%)' }} />
            )}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  background: location.pathname === '/profile' ? 'var(--bg-tertiary)' : 'transparent',
                }}
                title="View & Edit Profile"
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--color-primary-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hide-on-mobile">{user.name}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Logout"
              >
                <LogOut size={16} />
                <span className="hide-on-mobile">Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
