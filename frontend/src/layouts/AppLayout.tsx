import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  GitCompare,
  AlertOctagon,
  ScrollText,
  LogOut,
  Menu,
  X,
  Building,
  User as UserIcon,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Accounts', path: '/accounts', icon: Wallet },
    { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { label: 'Reconciliation', path: '/reconciliation', icon: GitCompare },
    { label: 'Exceptions', path: '/exceptions', icon: AlertOctagon },
    { label: 'Audit Logs', path: '/audit-logs', icon: ScrollText },
  ];

  return (
    <div className="app-container">
      {/* Sidebar Desktop */}
      <aside
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-primary)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          position: 'sticky',
          top: 0,
          height: '100vh',
          flexShrink: 0
        }}
        className="sidebar-desktop"
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                VANTRA
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                FinTech Platform
              </div>
            </div>
          </Link>
        </div>

        {/* Tenant Info Card */}
        <div style={{ padding: '14px 18px', background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.725rem', marginBottom: 4 }}>
            <Building size={13} />
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>ACTIVE TENANT</span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.tenant?.name || 'Default Organization'}
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          <div style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 10px 8px' }}>
            OPERATIONS
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(20, 184, 166, 0.12)' : 'transparent',
                  border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative'
                })}
              >
                <Icon size={18} style={{ color: 'inherit' }} />
                <span style={{ flex: 1 }}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer */}
        <div style={{ padding: '16px 18px', borderTop: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6, 11, 20, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(20, 184, 166, 0.15)',
                color: 'var(--accent-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
                border: '1px solid rgba(20, 184, 166, 0.3)',
                flexShrink: 0
              }}
            >
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || user?.email}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {user?.role || 'MEMBER'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 'var(--radius-sm)',
              transition: 'color 0.15s ease'
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="main-content">
        {/* Header */}
        <header
          style={{
            height: 'var(--header-height)',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            backdropFilter: 'blur(12px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'none'
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Organization Dashboard
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-secondary)',
                fontSize: '0.8rem'
              }}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} />
              <span style={{ color: 'var(--text-muted)' }}>Tenant:</span>
              <strong style={{ color: '#FFFFFF' }}>{user?.tenant?.name || 'Active'}</strong>
            </div>
          </div>
        </header>

        {/* Page Outlet */}
        <main style={{ flex: 1, minHeight: 'calc(100vh - var(--header-height))' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .sidebar-desktop {
            position: fixed;
            left: ${mobileMenuOpen ? '0' : '-100%'};
            transition: left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};
