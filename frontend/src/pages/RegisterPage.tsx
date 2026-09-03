import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  Building2,
  Lock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tenantName, setTenantName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Check for OAuth callback token or error in URL query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const err = params.get('error');

    if (err) {
      setError(decodeURIComponent(err));
    } else if (token) {
      setIsLoading(true);
      loginWithToken(token)
        .then(() => {
          navigate('/dashboard');
        })
        .catch((e: any) => {
          setError(e.message || 'Failed to complete Google registration');
          setIsLoading(false);
        });
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register({ email, password, name, tenantName });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setIsGoogleLoading(true);
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        background: 'var(--bg-primary)'
      }}
      className="auth-split"
    >
      {/* Left Brand Showcase */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0B1322 0%, #060B14 100%)',
          borderRight: '1px solid var(--border-primary)',
          padding: '60px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="auth-showcase"
      >
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(24, 201, 139, 0.10) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none'
          }}
        />

        {/* Logo */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#080B0A',
              boxShadow: '0 4px 16px rgba(24, 201, 139, 0.35)'
            }}
          >
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              VANTRA
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-mint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              FINANCIAL INFRASTRUCTURE
            </div>
          </div>
        </Link>

        {/* Value Proposition */}
        <div style={{ position: 'relative', zIndex: 1, margin: '40px 0' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-emerald-tint)',
              border: '1px solid rgba(24, 201, 139, 0.28)',
              color: 'var(--accent-mint)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: 20
            }}
          >
            <Sparkles size={14} />
            <span>Fast Tenant Onboarding</span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.3rem)', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 16 }}>
            Deploy your dedicated financial organization in minutes.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
            {[
              'Dedicated PostgreSQL tenant sandbox',
              'Automatic balanced double-entry accounting',
              'Instant reconciliation with bank statement feeds'
            ].map((text, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Lock size={14} style={{ color: 'var(--accent-emerald)' }} />
          <span>Zero cross-tenant data leakage guaranteed</span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 32px'
        }}
      >
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Create Tenant
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 6 }}>
              Choose your signup method to set up your organization
            </p>
          </div>

          {error && (
            <div
              style={{
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: 'var(--danger)',
                fontSize: '0.875rem',
                marginBottom: 20
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Google Signup Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading || isLoading}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-primary)',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: 'var(--shadow-sm)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.09)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'var(--border-primary)';
            }}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-teal)' }} />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Sign up with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '22px 0', gap: 14 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-primary)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              OR WITH EMAIL
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-primary)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Organization / Tenant Name
              </label>
              <input
                type="text"
                className="input"
                placeholder="Apex Capital Partners"
                required
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Lead Accountant Name
              </label>
              <input
                type="text"
                className="input"
                placeholder="Alex Mercer"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Work Email Address
              </label>
              <input
                type="email"
                className="input"
                placeholder="alex@apexcapital.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Password (min 8 characters)
              </label>
              <input
                type="password"
                className="input"
                placeholder="••••••••••••"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-teal btn-lg"
              disabled={isLoading || isGoogleLoading}
              style={{ width: '100%', marginTop: 8 }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Provisioning Tenant...
                </>
              ) : (
                <>
                  Create Organization Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--accent-teal)', fontWeight: 600, textDecoration: 'none' }}>
              Sign In here
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-split {
            grid-template-columns: 1fr !important;
          }
          .auth-showcase {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
