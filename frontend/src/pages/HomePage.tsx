import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  GitCompare,
  ArrowLeftRight,
  AlertOctagon,
  ScrollText,
  Lock,
  Building2,
  CheckCircle2,
  TrendingUp,
  Layers,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Database,
  Cpu,
  Fingerprint,
  Wallet
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cycle interactive reconciliation flow
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      {/* Navigation Bar */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 72,
          zIndex: 100,
          background: scrolled ? 'rgba(6, 11, 20, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border-primary)' : '1px solid transparent',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)'
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
              VANTRA
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="desktop-links" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>Features</a>
          <a href="#reconciliation-engine" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>Reconciliation</a>
          <a href="#security" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>Security</a>
          <a href="#preview" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>Product Preview</a>
        </div>

        {/* Action Buttons */}
        <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/login" className="btn btn-ghost btn-sm">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-teal btn-sm">
            Get Started
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="mobile-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', display: 'none' }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 72,
            left: 0,
            right: 0,
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-primary)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            zIndex: 99
          }}
        >
          <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '1rem' }}>Features</a>
          <a href="#reconciliation-engine" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '1rem' }}>Reconciliation</a>
          <a href="#security" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '1rem' }}>Security</a>
          <a href="#preview" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '1rem' }}>Product Preview</a>
          <hr style={{ borderColor: 'var(--border-secondary)', margin: '8px 0' }} />
          <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>Sign In</Link>
          <Link to="/register" className="btn btn-teal" style={{ width: '100%' }}>Get Started</Link>
        </div>
      )}

      {/* Hero Section */}
      <section
        style={{
          paddingTop: 160,
          paddingBottom: 90,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          paddingLeft: 24,
          paddingRight: 24
        }}
      >
        {/* Glow ambient background */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, rgba(6, 182, 212, 0.08) 50%, transparent 80%)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900 }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(20, 184, 166, 0.1)',
              border: '1px solid rgba(20, 184, 166, 0.25)',
              color: 'var(--accent-teal)',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: 24
            }}
          >
            <Sparkles size={14} />
            <span>Next-Generation Financial Infrastructure</span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              marginBottom: 20
            }}
          >
            Financial Operations,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Reconciled.
            </span>
          </h1>

          {/* Supporting Subtext */}
          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              maxWidth: 720,
              margin: '0 auto 36px',
              lineHeight: 1.6
            }}
          >
            Vantra gives businesses a secure, multi-tenant financial platform to manage transactions,
            reconcile records, track exceptions, and maintain a complete audit trail.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-teal btn-lg">
              Get Started
              <ArrowRight size={18} />
            </Link>
            <a href="#reconciliation-engine" className="btn btn-secondary btn-lg">
              Explore Platform
              <ChevronRight size={18} />
            </a>
          </div>
        </div>

        {/* Pipeline Architecture Visual Strip */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: 70,
            width: '100%',
            maxWidth: 1080,
            padding: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg), var(--shadow-teal-glow)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
            Unified Architectural Dataflow
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
              alignItems: 'center'
            }}
          >
            {[
              { title: '1. Financial Data', desc: 'Accounts & Statements', icon: Database, color: '#38BDF8' },
              { title: '2. Transaction Processing', desc: 'Ledger Ingestion', icon: ArrowLeftRight, color: '#06B6D4' },
              { title: '3. Multi-Pass Reconciliation', desc: 'Fuzzy & Exact Match', icon: GitCompare, color: '#10B981' },
              { title: '4. Exceptions Layer', desc: 'Variance Resolution', icon: AlertOctagon, color: '#F59E0B' },
              { title: '5. Immutable Audit', desc: 'Compliance Logs', icon: ScrollText, color: '#14B8A6' }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  style={{
                    padding: '16px 14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: `${step.color}18`, color: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>{step.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{step.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & Value Strip */}
      <section
        style={{
          borderTop: '1px solid var(--border-primary)',
          borderBottom: '1px solid var(--border-primary)',
          background: 'rgba(11, 19, 34, 0.5)',
          padding: '36px 24px'
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
            textAlign: 'center'
          }}
        >
          {[
            { label: 'Multi-Tenant Isolation', desc: 'Zero data cross-leakage', icon: Building2 },
            { label: 'Bank-Grade Security', desc: 'JWT + BCrypt Cryptography', icon: Lock },
            { label: 'Automated Reconciliation', desc: '5-pass high-accuracy engine', icon: CheckCircle2 },
            { label: 'Immutable Audit Trail', desc: 'Tamper-proof compliance logs', icon: ScrollText }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(20, 184, 166, 0.1)', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>{item.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Core Capabilities
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Built for Serious Financial Operations
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 640, margin: '10px auto 0' }}>
            Everything required to run reliable, accurate, and auditable accounting operations across your entire organization.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {[
            {
              title: '1. Transaction Management',
              desc: 'Centralize and manage multi-currency financial transactions with balanced double-entry ledger enforcement.',
              icon: ArrowLeftRight,
              tag: 'Ledger Engine'
            },
            {
              title: '2. Automated Reconciliation',
              desc: 'Match internal ledger records with external statements using exact references, date tolerances, and amount comparisons.',
              icon: GitCompare,
              tag: '5-Pass Matching'
            },
            {
              title: '3. Exception Management',
              desc: 'Identify, investigate, and resolve discrepancies with recorded resolver timestamps and mandatory audit reasoning.',
              icon: AlertOctagon,
              tag: 'Lifecycle Workflow'
            },
            {
              title: '4. Complete Audit Trail',
              desc: 'Maintain an immutable, append-only history of every financial and administrative action for SOC2 and regulatory compliance.',
              icon: ScrollText,
              tag: 'Append-Only'
            },
            {
              title: '5. Multi-Tenant Security',
              desc: 'Strict tenant-level isolation ensuring Tenant A can never query, infer, or alter Tenant B financial datasets.',
              icon: Fingerprint,
              tag: 'Tenant Boundaries'
            },
            {
              title: '6. Dynamic Financial Visibility',
              desc: 'Understand calculated account balances, live cash flows, income inflows, and expense outflows in real time.',
              icon: TrendingUp,
              tag: 'Real-Time Insights'
            }
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="card card-interactive"
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(20, 184, 166, 0.12)',
                      border: '1px solid rgba(20, 184, 166, 0.25)',
                      color: 'var(--accent-teal)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
                    {feat.tag}
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reconciliation Interactive Visual Section */}
      <section id="reconciliation-engine" style={{ padding: '90px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Intelligent Reconciliation
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              How the Multi-Pass Matching Engine Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 620, margin: '10px auto 0' }}>
              From statement ingestion to automated discrepancy flagging and manual override resolution.
            </p>
          </div>

          {/* Interactive Steps Display */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              {
                step: '01',
                title: 'Internal Ledger Records',
                desc: 'Transactions posted by your accounting teams or automated ingestion webhooks.',
                activeColor: 'var(--accent-cyan)'
              },
              {
                step: '02',
                title: 'Matching Engine Analysis',
                desc: 'Executes exact reference match, exact amount/date, and fuzzy date tolerance scans.',
                activeColor: 'var(--accent-teal)'
              },
              {
                step: '03',
                title: 'Discrepancy Flagging',
                desc: 'Surfaces amount variances, missing external records, and unmatched internal txns.',
                activeColor: 'var(--warning)'
              },
              {
                step: '04',
                title: 'Resolution & Audit Lock',
                desc: 'Exceptions are verified, resolved with notes, and locked into the tamper-proof audit trail.',
                activeColor: 'var(--success)'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                style={{
                  padding: '24px 20px',
                  background: activeStep === idx ? 'rgba(20, 184, 166, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  border: activeStep === idx ? '1px solid var(--accent-teal)' : '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
              >
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: item.activeColor, marginBottom: 8 }} className="mono">
                  {item.step}
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" style={{ padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }} className="security-split">
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Enterprise Architecture
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
              Security Embedded at Every Layer
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 28 }}>
              Vantra treats financial data with absolute isolation and zero trust. Every request is verified,
              every secret is redacted, and every modification generates an immutable audit record.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { title: 'JWT Claims & Role-Based Access Control', desc: 'Stateless, cryptographically signed tokens with strict role enforcement.' },
                { title: 'Strict PostgreSQL Multi-Tenancy', desc: 'Automatic tenant isolation across all Prisma queries and ledger tables.' },
                { title: 'Automatic Sensitive Secret Redaction', desc: 'Credentials and auth tokens are scrubbed before reaching audit logs.' },
                { title: 'Double-Entry Balance Verification', desc: 'Ledger integrity verified via balance aggregation with 0 rounding errors.' }
              ].map((sec, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 }}>
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#FFFFFF' }}>{sec.title}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sec.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: '32px',
              border: '1px solid rgba(20, 184, 166, 0.25)',
              background: 'linear-gradient(145deg, rgba(11, 19, 34, 0.95) 0%, rgba(6, 11, 20, 0.95) 100%)',
              boxShadow: 'var(--shadow-teal-glow)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Lock size={20} style={{ color: 'var(--accent-teal)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>Vantra Security Shield</span>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.4)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-secondary)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tenant Isolation</span>
                <span style={{ color: 'var(--success)', fontWeight: 700 }}>ACTIVE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Audit Log Immutability</span>
                <span style={{ color: 'var(--success)', fontWeight: 700 }}>ENFORCED</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Hash Algorithm</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }} className="mono">BCrypt (10 rounds)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Token Specification</span>
                <span style={{ color: 'var(--accent-teal)', fontWeight: 700 }} className="mono">JWT HS256</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section (UI Demonstration) */}
      <section id="preview" style={{ padding: '90px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-primary)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Interactive Demonstration Preview
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
            The Vantra Command Center
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 640, margin: '0 auto 40px' }}>
            A unified interface for financial teams to ingest transactions, resolve discrepancies, and maintain audit records.
          </p>

          {/* Interactive UI Demo Card */}
          <div
            className="card"
            style={{
              padding: '28px',
              textAlign: 'left',
              border: '1px solid var(--border-accent)',
              boxShadow: 'var(--shadow-lg), var(--shadow-teal-glow)',
              background: 'rgba(11, 19, 34, 0.95)'
            }}
          >
            {/* Header Mock */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-primary)', paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Apex Capital Partners</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', background: 'rgba(20, 184, 166, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>ENTERPRISE TENANT</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DEMO PREVIEW</span>
            </div>

            {/* KPI Cards Demo */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
              <div style={{ padding: '14px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NET BALANCE</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFF' }} className="financial-figure">$142,850.00</div>
              </div>
              <div style={{ padding: '14px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RECONCILIATION MATCH</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--success)' }} className="financial-figure">98.4% Matched</div>
              </div>
              <div style={{ padding: '14px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OPEN EXCEPTIONS</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--warning)' }} className="financial-figure">2 In Review</div>
              </div>
            </div>

            {/* Table Mock */}
            <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ color: 'var(--text-secondary)' }}>2026-08-30</td>
                    <td>AWS Cloud Services (US-East)</td>
                    <td style={{ fontWeight: 700 }} className="financial-figure">-$1,450.00</td>
                    <td><span className="badge badge-success">RECONCILED</span></td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-secondary)' }}>2026-08-29</td>
                    <td>Client Wire Retainer #842</td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }} className="financial-figure">+$18,000.00</td>
                    <td><span className="badge badge-success">MATCHED</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Bring Clarity to Your Financial Operations.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: 36 }}>
            Set up your organization tenant in less than 2 minutes and experience multi-pass reconciliation today.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Link to="/register" className="btn btn-teal btn-lg">
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-primary)', padding: '48px 32px 32px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
              <ShieldCheck size={18} />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>VANTRA</span>
          </div>

          <div style={{ display: 'flex', gap: 24, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Product</a>
            <a href="#security" style={{ color: 'inherit', textDecoration: 'none' }}>Security</a>
            <a href="#reconciliation-engine" style={{ color: 'inherit', textDecoration: 'none' }}>Reconciliation</a>
            <a href="#preview" style={{ color: 'inherit', textDecoration: 'none' }}>Audit</a>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            © 2026 Vantra Inc. All rights reserved.
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .desktop-links, .desktop-actions {
            display: none !important;
          }
          .mobile-btn {
            display: block !important;
          }
          .security-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
