import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CommandPalette } from '../components/common/CommandPalette';
import { exceptionsApi, fraudApi } from '../api/client';
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
  ChevronDown,
  Activity,
  UserCheck
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [openExceptionsCount, setOpenExceptionsCount] = useState<number | null>(null);
  const [openFraudCount, setOpenFraudCount] = useState<number | null>(null);

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

  // Fetch real contextual counts for sidebar badges
  useEffect(() => {
    let isMounted = true;
    const fetchBadgeCounts = async () => {
      try {
        const [excRes, fraudRes] = await Promise.all([
          exceptionsApi.list({ status: 'OPEN', limit: 1 }).catch(() => null),
          fraudApi.getStats().catch(() => null)
        ]);

        if (isMounted) {
          if (excRes && typeof excRes.total === 'number') {
            setOpenExceptionsCount(excRes.total);
          }
          if (fraudRes && fraudRes.stats && typeof fraudRes.stats.openCount === 'number') {
            setOpenFraudCount(fraudRes.stats.openCount);
          }
        }
      } catch {
        // Silently preserve UI state
      }
    };

    fetchBadgeCounts();
    return () => { isMounted = false; };
  }, []);

  const navSections = [
    {
      group: 'OPERATIONS',
      items: [
        { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Accounts', path: '/accounts', icon: Wallet },
        { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
        { label: 'Reconciliation', path: '/reconciliation', icon: GitMerge },
      ]
    },
    {
      group: 'INTELLIGENCE & AUDIT',
      items: [
        {
          label: 'Exceptions',
          path: '/exceptions',
          icon: AlertOctagon,
          badge: openExceptionsCount !== null && openExceptionsCount > 0 ? openExceptionsCount : undefined,
          badgeColor: 'var(--warning)',
          badgeBg: 'var(--warning-bg)'
        },
        {
          label: 'Fraud Detection',
          path: '/fraud',
          icon: ShieldAlert,
          badge: openFraudCount !== null && openFraudCount > 0 ? openFraudCount : undefined,
          badgeColor: 'var(--danger)',
          badgeBg: 'var(--danger-bg)'
        },
        { label: 'Audit Logs', path: '/audit-logs', icon: ScrollText },
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Desktop Institutional Sidebar */}
      <aside
        style={{
          width: 264,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px 14px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
          boxShadow: 'var(--shadow-sm)'
        }}
        className="desktop-sidebar"
      >
        <div>
          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 16px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-gold-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0A0C10',
                boxShadow: '0 4px 14px rgba(212, 165, 72, 0.35)',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                VANTRA
              </div>
              <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                FINANCIAL PLATFORM
              </div>
            </div>
          </div>

          {/* Organization Switcher Pill */}
          <div
            style={{
              margin: '14px 0 16px 0',
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(10, 12, 16, 0.75)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.16s ease'
            }}
            onClick={() => setCommandPaletteOpen(true)}
            title="Switch Organization or Search Commands (⌘K)"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-gold)', boxShadow: '0 0 8px var(--accent-gold)' }} />
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: '0.7875rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.tenant?.name || 'Vantra Organization'}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  Production Sandbox
                </div>
              </div>
            </div>
            <ChevronDown size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </div>

          {/* Quick Search Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 11px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.775rem',
              cursor: 'pointer',
              marginBottom: 16,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(212, 165, 72, 0.35)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={13} style={{ color: 'var(--accent-gold)' }} />
              <span>Search commands...</span>
            </div>
            <span
              style={{
                fontSize: '0.65rem',
                padding: '1px 5px',
                borderRadius: 'var(--radius-xs)',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-muted)',
                fontWeight: 700
              }}
              className="mono"
            >
              ⌘K
            </span>
          </button>

          {/* Grouped Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {navSections.map((sec, sIdx) => (
              <div key={sIdx}>
                {/* Section Eyebrow with gold dot */}
                <div
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    padding: '0 10px',
                    marginBottom: 7,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span style={{ color: 'var(--accent-gold)', fontSize: '0.55rem' }}>●</span>
                  <span>{sec.group}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.825rem',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                          background: isActive ? 'var(--accent-gold-tint)' : 'transparent',
                          borderLeft: isActive ? '3px solid var(--accent-gold)' : '3px solid transparent',
                          textDecoration: 'none',
                          transition: 'all 0.15s ease'
                        })}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Icon size={16} style={{ color: 'inherit', opacity: 0.95 }} />
                          <span>{item.label}</span>
                        </div>

                        {/* Real-time Contextual Badge */}
                        {item.badge !== undefined && (
                          <span
                            style={{
                              fontSize: '0.675rem',
                              fontWeight: 700,
                              color: item.badgeColor || 'var(--warning)',
                              background: item.badgeBg || 'var(--warning-bg)',
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-full)',
                              lineHeight: 1.2
                            }}
                            className="mono"
                          >
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--accent-gold-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  color: '#0A0C10',
                  flexShrink: 0
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.name || user?.email?.split('@')[0]}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', fontWeight: 700 }} className="mono">
                    {user?.role || 'ADMIN'}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>• Tenant</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{ padding: 6, borderRadius: 'var(--radius-sm)' }}
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile Header Bar */}
        <header
          style={{
            height: 58,
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 18px',
            position: 'sticky',
            top: 0,
            zIndex: 30
          }}
          className="mobile-header"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-gold-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0A0C10'
              }}
            >
              <ShieldCheck size={16} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              VANTRA
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCommandPaletteOpen(true)}
              style={{ padding: '5px 8px' }}
            >
              <Search size={15} />
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ padding: '5px 8px' }}
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </header>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              position: 'fixed',
              top: 58,
              left: 0,
              width: '100%',
              height: 'calc(100vh - 58px)',
              background: 'var(--bg-surface)',
              zIndex: 35,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-subtle)',
              overflowY: 'auto'
            }}
            className="mobile-drawer"
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {navSections.map((sec, sIdx) => (
                <div key={sIdx}>
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <span style={{ color: 'var(--accent-gold)', fontSize: '0.55rem' }}>●</span>
                    <span>{sec.group}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.925rem',
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                            background: isActive ? 'var(--accent-gold-tint)' : 'transparent',
                            borderLeft: isActive ? '3px solid var(--accent-gold)' : '3px solid transparent',
                            textDecoration: 'none'
                          })}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Icon size={18} />
                            <span>{item.label}</span>
                          </div>
                          {item.badge !== undefined && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                color: item.badgeColor,
                                background: item.badgeBg,
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)'
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                Signed in as <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-danger"
                style={{ width: '100%' }}
              >
                <LogOut size={15} />
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
