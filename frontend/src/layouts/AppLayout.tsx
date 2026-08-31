import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CommandPalette } from '../components/common/CommandPalette';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  GitMerge,
  AlertOctagon,
  ShieldAlert,
  ScrollText,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Building2,
  Search,
  Command,
  ChevronDown
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global ⌘K / Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Accounts', path: '/accounts', icon: Wallet },
    { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { label: 'Reconciliation', path: '/reconciliation', icon: GitMerge },
    { label: 'Exceptions', path: '/exceptions', icon: AlertOctagon },
    { label: 'Fraud Detection', path: '/fraud', icon: ShieldAlert },
    { label: 'Audit Logs', path: '/audit-logs', icon: ScrollText },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Desktop Sidebar */}
      <aside
        style={{
          width: 260,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-primary)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 16px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40
        }}
        className="desktop-sidebar"
      >
        <div>
          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px 20px 8px', borderBottom: '1px solid var(--border-secondary)' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                VANTRA
              </div>
              <div style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                FINTECH PLATFORM
              </div>
            </div>
          </div>

          {/* Tenant / Organization Pill */}
          <div
            style={{
              margin: '16px 0',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(6, 11, 20, 0.6)',
              border: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease'
            }}
            onClick={() => setCommandPaletteOpen(true)}
            title="Switch Organization or search"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-teal)', boxShadow: '0 0 8px var(--accent-teal)' }} />
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.tenant?.name || 'Vantra Organization'}
                </div>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                  Production Sandbox
                </div>
              </div>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </div>

          {/* Quick Search / ⌘K Trigger Button */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              marginBottom: 20,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-primary)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={14} style={{ color: 'var(--accent-teal)' }} />
              <span>Search commands...</span>
            </div>
            <span
              style={{
                fontSize: '0.675rem',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-muted)',
                fontWeight: 600
              }}
            >
              ⌘K
            </span>
          </button>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(20, 184, 166, 0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(20, 184, 166, 0.3)' : '1px solid transparent',
                    boxShadow: isActive ? '0 0 16px rgba(20, 184, 166, 0.12)' : 'none',
                    textDecoration: 'none',
                    transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                  })}
                >
                  <Icon size={18} style={{ color: 'inherit' }} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div style={{ borderTop: '1px solid var(--border-secondary)', paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#FFFFFF',
                  flexShrink: 0
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.name || user?.email?.split('@')[0]}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', fontWeight: 600 }}>
                  {user?.role || 'MEMBER'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{ padding: 6, borderRadius: 'var(--radius-sm)' }}
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile Header Bar */}
        <header
          style={{
            height: 60,
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-primary)',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            position: 'sticky',
            top: 0,
            zIndex: 30
          }}
          className="mobile-header"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <ShieldCheck size={18} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
              VANTRA
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCommandPaletteOpen(true)}
              style={{ padding: '6px 10px' }}
            >
              <Search size={16} />
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ padding: '6px 10px' }}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              position: 'fixed',
              top: 60,
              left: 0,
              width: '100%',
              height: 'calc(100vh - 60px)',
              background: 'var(--bg-secondary)',
              zIndex: 35,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-primary)'
            }}
            className="mobile-drawer"
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '1rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                      background: isActive ? 'rgba(20, 184, 166, 0.15)' : 'transparent',
                      border: isActive ? '1px solid var(--accent-teal)' : '1px solid transparent',
                      textDecoration: 'none'
                    })}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div style={{ borderTop: '1px solid var(--border-secondary)', paddingTop: 18 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                Signed in as <strong style={{ color: '#FFFFFF' }}>{user?.email}</strong>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-danger"
                style={{ width: '100%' }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }} className="main-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-header {
            display: flex !important;
          }
          .main-content {
            padding: 20px 16px !important;
          }
        }
      `}</style>
    </div>
  );
};
