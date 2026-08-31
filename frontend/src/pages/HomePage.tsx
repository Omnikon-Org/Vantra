import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  ArrowRight,
  GitMerge,
  ScrollText,
  AlertOctagon,
  Lock,
  Layers,
  Sparkles,
  CheckCircle2,
  Check,
  TrendingUp,
  Cpu,
  RefreshCw,
  Server,
  Zap,
  BarChart3,
  Search,
  Database,
  ArrowUpRight,
  DollarSign
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeProductTab, setActiveProductTab] = useState<'overview' | 'transactions' | 'reconciliation' | 'exceptions' | 'audit'>('overview');

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Sticky Blurred Institutional Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(6, 11, 20, 0.82)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-primary)',
          padding: '16px 24px'
        }}
      >
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
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
              <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                VANTRA
              </div>
              <div style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                FINANCIAL PLATFORM
              </div>
            </div>
          </Link>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="desktop-nav-links">
            <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.15s ease' }}>
              Capabilities
            </a>
            <a href="#reconciliation" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.15s ease' }}>
              Engine
            </a>
            <a href="#security" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.15s ease' }}>
              Security
            </a>
            <a href="#preview" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.15s ease' }}>
              Product Demo
            </a>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-teal">
                <span>Go to Dashboard</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-teal btn-sm">
                  <span>Get Started</span>
                  <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ position: 'relative', padding: '100px 24px 70px 24px', overflow: 'hidden' }}>
        {/* Glow ambient background */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '900px',
            height: '450px',
            background: 'radial-gradient(ellipse at center, rgba(20, 184, 166, 0.16) 0%, rgba(6, 182, 212, 0.08) 40%, transparent 70%)',
            filter: 'blur(70px)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(20, 184, 166, 0.08)',
              border: '1px solid rgba(20, 184, 166, 0.25)',
              color: 'var(--accent-teal)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: 24
            }}
          >
            <Sparkles size={15} />
            <span>Next-Gen Financial Infrastructure</span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)',
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              marginBottom: 24,
              maxWidth: 960,
              margin: '0 auto 24px auto'
            }}
          >
            Financial Operations, <br />
            <span style={{ background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 60%, #38BDF8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Reconciled in Real Time.
            </span>
          </h1>

          {/* Supporting Subtext */}
          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              maxWidth: 760,
              margin: '0 auto 36px auto',
              lineHeight: 1.6
            }}
          >
            Vantra is the financial control layer for modern organizations — connecting transactions, reconciliation, exceptions, and audit intelligence in one secure platform.
          </p>

          {/* Hero CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn btn-teal btn-lg">
              <span>Get Started</span>
              <ArrowRight size={18} />
            </Link>
            <a href="#reconciliation" className="btn btn-secondary btn-lg">
              <span>Explore Platform</span>
              <ArrowUpRight size={18} />
            </a>
          </div>

          {/* Interactive Financial Node Pipeline Visualization */}
          <div
            className="card"
            style={{
              marginTop: 64,
              padding: '32px 24px',
              background: 'linear-gradient(180deg, rgba(14, 23, 38, 0.85) 0%, rgba(6, 11, 20, 0.95) 100%)',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-teal)', boxShadow: '0 0 10px var(--accent-teal)' }} className="node-pulse" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Live Financial Execution Pipeline
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} className="mono">
                TOLERANCE: ±0.00 • PASSES: 5 • COMPLIANCE: APPEND-ONLY
              </span>
            </div>

            {/* Connected Pipeline Nodes */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 16,
                position: 'relative'
              }}
            >
              {[
                { step: '01', title: 'Financial Data', desc: 'Bank & ERP Feeds', icon: Database, color: '#06B6D4' },
                { step: '02', title: 'Transaction Processing', desc: 'Double-Entry Ledger', icon: Cpu, color: '#14B8A6' },
                { step: '03', title: 'Multi-Pass Recon', desc: 'Exact & Fuzzy Matching', icon: GitMerge, color: '#10B981' },
                { step: '04', title: 'Exception Detection', desc: 'Variance Isolation', icon: AlertOctagon, color: '#F59E0B' },
                { step: '05', title: 'Immutable Audit', desc: 'Tamper-Proof Trail', icon: ScrollText, color: '#38BDF8' },
              ].map((node, i) => {
                const NodeIcon = node.icon;
                return (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(6, 11, 20, 0.7)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 18,
                      textAlign: 'left',
                      position: 'relative',
                      transition: 'all 0.2s ease'
                    }}
                    className="card-hover"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 'var(--radius-sm)',
                          background: `${node.color}1A`,
                          color: node.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${node.color}33`
                        }}
                      >
                        <NodeIcon size={16} />
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }} className="mono">
                        {node.step}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
                      {node.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {node.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Trust / Metrics Section */}
      <section
        style={{
          borderTop: '1px solid var(--border-primary)',
          borderBottom: '1px solid var(--border-primary)',
          background: 'rgba(11, 19, 34, 0.45)',
          padding: '48px 24px'
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 32,
            textAlign: 'center'
          }}
        >
          {[
            { metric: '99.99%', label: 'Ledger Integrity', sub: 'Balanced double-entry accounting' },
            { metric: 'Real-Time', label: 'Reconciliation', sub: '5-pass automated variance scanner' },
            { metric: '256-bit', label: 'Encrypted Sessions', sub: 'Zero cross-tenant data leakage' },
            { metric: 'Append-Only', label: 'Audit Trail', sub: 'Tamper-proof compliance history' },
          ].map((item, idx) => (
            <div key={idx} style={{ padding: '8px 16px' }}>
              <div
                style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#FFFFFF',
                  lineHeight: 1.1
                }}
                className="financial-figure"
              >
                {item.metric}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-teal)', marginTop: 8 }}>
                {item.label}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {item.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Platform Features (6 Cards) */}
      <section id="features" style={{ padding: '96px 24px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(20, 184, 166, 0.08)',
              border: '1px solid rgba(20, 184, 166, 0.2)',
              color: 'var(--accent-teal)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: 16
            }}
          >
            <Zap size={14} />
            <span>Built for Modern Financial Infrastructure</span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Comprehensive Financial Control Layer
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: 640, margin: '12px auto 0 auto' }}>
            Six dedicated subsystems architected for institutional precision, automated reconciliation, and audit perfection.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 24
          }}
        >
          {[
            {
              icon: Cpu,
              title: 'Transaction Intelligence',
              desc: 'Balanced double-entry journal ingestion with multi-currency support, category tags, and dynamic balance calculations.',
              tag: 'Core Ledger'
            },
            {
              icon: GitMerge,
              title: 'Automated Reconciliation',
              desc: '5-pass algorithm matching exact references, amount timestamps, and customizable date settlement tolerances.',
              tag: '5-Pass Engine'
            },
            {
              icon: AlertOctagon,
              title: 'Exception Management',
              desc: 'Real-time discrepancy detection with severity categorization (Low to Critical) and atomic resolution workflows.',
              tag: 'Risk Control'
            },
            {
              icon: ScrollText,
              title: 'Immutable Audit Logs',
              desc: 'Append-only system logs documenting every financial change with actor context, timestamp, and sanitized JSON payloads.',
              tag: 'Compliance'
            },
            {
              icon: Layers,
              title: 'Multi-Tenant Isolation',
              desc: 'Dedicated logical sandboxing per tenant guaranteeing strict zero cross-organization data leakage at the query layer.',
              tag: 'Enterprise Security'
            },
            {
              icon: BarChart3,
              title: 'Financial Analytics',
              desc: 'Instant cash flow overview, net ledger calculations, reconciliation health scoring, and active variance alerts.',
              tag: 'Command Center'
            }
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="card card-hover"
                style={{
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'var(--bg-card)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(20, 184, 166, 0.1)',
                        border: '1px solid rgba(20, 184, 166, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-teal)'
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 255, 255, 0.04)',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {card.tag}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 10 }}>
                    {card.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {card.desc}
                  </p>
                </div>

                <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-teal)', fontSize: '0.8125rem', fontWeight: 600 }}>
                  <span>Enterprise ready</span>
                  <Check size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: Realistic Reconciliation Pipeline Visual */}
      <section
        id="reconciliation"
        style={{
          background: 'linear-gradient(180deg, rgba(11, 19, 34, 0.5) 0%, rgba(6, 11, 20, 0.8) 100%)',
          borderTop: '1px solid var(--border-primary)',
          borderBottom: '1px solid var(--border-primary)',
          padding: '96px 24px'
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.6rem)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Multi-Pass Reconciliation Pipeline
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: 620, margin: '10px auto 0 auto' }}>
              Every statement record moves through sequential passes to isolate matches, settlement variances, and exceptions.
            </p>
          </div>

          {/* Pipeline Stage Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 28,
              overflowX: 'auto',
              gap: 12
            }}
          >
            {[
              'Internal Ledger',
              'Statement Feed',
              'Exact Match',
              'Fuzzy Match',
              'Variance Detection',
              'Resolution',
              'Audit Lock'
            ].map((stage, idx, arr) => (
              <React.Fragment key={idx}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: idx < 4 ? 'var(--accent-teal)' : 'rgba(255, 255, 255, 0.1)',
                      color: idx < 4 ? '#060B14' : 'var(--text-muted)',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {idx + 1}
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: idx < 4 ? '#FFFFFF' : 'var(--text-muted)' }}>
                    {stage}
                  </span>
                </div>
                {idx < arr.length - 1 && (
                  <div style={{ width: 24, height: 1, background: 'var(--border-primary)', flexShrink: 0 }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Pipeline Live Simulated Records */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 16
            }}
          >
            {[
              { amount: '$12,450.00', status: 'MATCHED', type: 'Wire Inflow (Apex Corp)', pass: 'Pass 1: Exact Ref', statusColor: 'var(--success)', statusBg: 'var(--success-bg)' },
              { amount: '$8,720.40', status: 'MATCHED', type: 'Vendor Payment (AWS)', pass: 'Pass 2: Amount & Date', statusColor: 'var(--success)', statusBg: 'var(--success-bg)' },
              { amount: '$2,430.00', status: 'VARIANCE', type: 'Brokerage Fee Discrepancy', pass: 'Pass 4: Amount Mismatch ($30)', statusColor: 'var(--warning)', statusBg: 'var(--warning-bg)' },
              { amount: '$920.00', status: 'PENDING REVIEW', type: 'Unmatched External Debit', pass: 'Pass 5: Unmatched Item', statusColor: 'var(--danger)', statusBg: 'var(--danger-bg)' }
            ].map((rec, i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: 20,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        background: rec.statusBg,
                        color: rec.statusColor,
                        border: `1px solid ${rec.statusColor}40`
                      }}
                      className="mono"
                    >
                      {rec.status}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {rec.pass}
                    </span>
                  </div>

                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }} className="financial-figure">
                    {rec.amount}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {rec.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Enterprise Security Section */}
      <section id="security" style={{ padding: '96px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div
          className="card"
          style={{
            padding: '48px 40px',
            background: 'linear-gradient(135deg, #0B1322 0%, #060B14 100%)',
            border: '1px solid rgba(20, 184, 166, 0.3)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 48, alignItems: 'center' }} className="security-grid">
            <div>
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
                  textTransform: 'uppercase',
                  marginBottom: 18
                }}
              >
                <Lock size={14} />
                <span>Zero-Trust Architecture</span>
              </div>

              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 18 }}>
                Security Embedded at Every Layer
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28 }}>
                Designed for institutional accounting compliance. Vantra enforces cryptographic tenant isolation, append-only logs, and tamper-resistant audit trails.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  'Tenant Isolation',
                  'Encrypted Sessions',
                  'Role-Based Access',
                  'Immutable Audit Logs',
                  'Append-Only Compliance',
                  'Complete Activity Traceability'
                ].map((sec, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{sec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Tenant Isolation Diagram */}
            <div
              style={{
                background: 'rgba(6, 11, 20, 0.8)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Logical Tenant Sandboxing
              </div>

              <div style={{ padding: 14, background: 'rgba(20, 184, 166, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(20, 184, 166, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>
                  <span>Tenant A (Fund Alpha)</span>
                  <span style={{ color: 'var(--accent-teal)' }}>ISOLATED</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Schema scope: `tenantId = 'fund-alpha-uuid'`
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 2, height: 16, background: 'rgba(255,255,255,0.1)' }} />
              </div>

              <div style={{ padding: 14, background: 'rgba(6, 182, 212, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>
                  <span>Tenant B (Apex Capital)</span>
                  <span style={{ color: 'var(--accent-cyan)' }}>ISOLATED</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Schema scope: `tenantId = 'apex-capital-uuid'`
                </div>
              </div>

              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                Cross-tenant queries permanently blocked at ORM layer
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Interactive Product Showcase */}
      <section id="preview" style={{ padding: '80px 24px 100px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Interactive Platform Preview
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: 8 }}>
            Switch between views to explore Vantra's financial command center
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { id: 'overview', label: 'Financial Overview' },
            { id: 'transactions', label: 'Double-Entry Ledger' },
            { id: 'reconciliation', label: 'Reconciliation Engine' },
            { id: 'exceptions', label: 'Exception Console' },
            { id: 'audit', label: 'Audit Trail' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveProductTab(tab.id as any)}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: activeProductTab === tab.id ? '1px solid var(--accent-teal)' : '1px solid var(--border-primary)',
                background: activeProductTab === tab.id ? 'rgba(20, 184, 166, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                color: activeProductTab === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Browser Frame */}
        <div
          className="card"
          style={{
            borderRadius: 'var(--radius-xl)',
            border: '1px solid rgba(20, 184, 166, 0.3)',
            boxShadow: 'var(--shadow-lg), 0 0 35px rgba(20, 184, 166, 0.1)',
            overflow: 'hidden'
          }}
        >
          {/* Browser Window Header */}
          <div
            style={{
              padding: '12px 18px',
              background: 'rgba(6, 11, 20, 0.9)',
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
            </div>

            <div
              style={{
                padding: '3px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.05)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}
              className="mono"
            >
              https://app.vantra.io/{activeProductTab}
            </div>

            <div style={{ width: 40 }} />
          </div>

          {/* Simulated Interface Body */}
          <div style={{ padding: 28, background: 'var(--bg-secondary)', minHeight: 340 }}>
            {activeProductTab === 'overview' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                  <div className="card" style={{ padding: 18 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>NET LEDGER BALANCE</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginTop: 4 }}>$2,845,920.50</div>
                  </div>
                  <div className="card" style={{ padding: 18 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>TOTAL INFLOW (30D)</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>+$482,100.00</div>
                  </div>
                  <div className="card" style={{ padding: 18 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>RECON HEALTH</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-teal)', marginTop: 4 }}>98.7%</div>
                  </div>
                </div>
                <div style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Cash flow trend: Inflow tracking +14.2% over previous settlement period with zero reconciliation drift.
                </div>
              </div>
            )}

            {activeProductTab === 'transactions' && (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Account</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>2026-08-31</td>
                      <td>Quarterly LP Management Fee</td>
                      <td>Prime Bank</td>
                      <td style={{ color: 'var(--success)', fontWeight: 700 }}>+$75,000.00</td>
                      <td><span style={{ padding: '2px 6px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: 4, fontSize: '0.7rem' }}>COMPLETED</span></td>
                    </tr>
                    <tr>
                      <td>2026-08-30</td>
                      <td>Bloomberg Terminal Subscription</td>
                      <td>Operating Account</td>
                      <td style={{ color: '#FFFFFF', fontWeight: 700 }}>-$2,400.00</td>
                      <td><span style={{ padding: '2px 6px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: 4, fontSize: '0.7rem' }}>COMPLETED</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeProductTab === 'reconciliation' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>Session #REC-2026-08</div>
                  <span style={{ padding: '4px 10px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>98.7% MATCHED</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MATCHED RECORDS</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 4 }}>1,482 Items</div>
                  </div>
                  <div style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>VARIANCE EXCEPTIONS</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--warning)', marginTop: 4 }}>2 Discrepancies</div>
                  </div>
                </div>
              </div>
            )}

            {activeProductTab === 'exceptions' && (
              <div style={{ padding: 18, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '0.85rem' }}>VARIANCE DETECTED (AMOUNT MISMATCH)</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SEVERITY: MEDIUM</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Internal record shows $2,400.00 whereas bank statement posted $2,430.00 (Variance: $30.00 fee difference).
                </p>
              </div>
            )}

            {activeProductTab === 'audit' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { action: 'RECONCILIATION_RUN_COMPLETED', user: 'system', time: '14:30:10 UTC' },
                  { action: 'EXCEPTION_RESOLVED', user: 'elena@vertexquant.com', time: '14:28:44 UTC' },
                  { action: 'TRANSACTION_CREATED', user: 'elena@vertexquant.com', time: '14:15:02 UTC' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', border: '1px solid var(--border-secondary)' }}>
                    <span style={{ color: 'var(--accent-teal)', fontWeight: 700 }} className="mono">{item.action}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{item.user} • {item.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Final High-Impact CTA */}
      <section
        style={{
          borderTop: '1px solid var(--border-primary)',
          background: 'linear-gradient(180deg, #0B1322 0%, #060B14 100%)',
          padding: '80px 24px',
          textAlign: 'center'
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: 16 }}>
            Ready to Automate Your Financial Operations?
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: 32 }}>
            Deploy your dedicated multi-tenant organization sandbox and start reconciling in minutes.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-teal btn-lg">
              <span>Create Organization Account</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In to Existing Tenant
            </Link>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer style={{ borderTop: '1px solid var(--border-primary)', padding: '40px 24px', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={20} style={{ color: 'var(--accent-teal)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>VANTRA</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>— Enterprise Financial Infrastructure</span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Vantra Inc. All rights reserved. 256-bit encrypted multi-tenant platform.
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav-links {
            display: none !important;
          }
          .security-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
