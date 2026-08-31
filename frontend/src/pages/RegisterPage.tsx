import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const { register } = useAuth();
  const navigate = useNavigate();
  const [tenantName, setTenantName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, transparent 70%)',
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
              background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)'
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
              VANTRA
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Financial Engine
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
              background: 'rgba(20, 184, 166, 0.1)',
              border: '1px solid rgba(20, 184, 166, 0.25)',
              color: 'var(--accent-teal)',
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

          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.3rem)', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', color: '#FFFFFF', marginBottom: 16 }}>
            Deploy your dedicated financial organization in minutes.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
            {[
              'Dedicated PostgreSQL tenant sandbox',
              'Automatic balanced double-entry accounting',
              'Instant reconciliation with bank statement feeds'
            ].map((text, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Lock size={14} style={{ color: 'var(--accent-teal)' }} />
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
              Set up your organization on Vantra's financial platform
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
              disabled={isLoading}
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
