import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  ArrowRight,
  GitMerge,
  ScrollText,
  AlertOctagon,
  Lock,
  Sparkles,
  CheckCircle2,
  Check,
  Zap,
  BarChart3,
  Search,
  Database,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  ShieldAlert,
  Flame,
  Clock,
  Eye,
  Menu,
  X,
  ChevronRight,
  Activity,
  Sliders,
  CheckCheck,
  FileCheck,
  Terminal,
  Code2,
  Copy,
  Layers,
  Cpu,
  RefreshCw,
  Wallet
} from 'lucide-react';

interface FeedTransaction {
  id: string;
  ref: string;
  desc: string;
  amount: string;
  pass: string;
  status: 'MATCHED' | 'CLEARED' | 'VARIANCE' | 'CRITICAL';
  statusType: 'matched' | 'cleared' | 'variance' | 'critical';
  timestamp: string;
}

const STREAM_ITEMS_POOL: FeedTransaction[] = [
  {
    id: 'TXN-90412',
    ref: 'REF-APEX-WIRE-01',
    desc: 'Capital Inflow — Apex Capital Partners LP',
    amount: '+$240,000.00',
    pass: 'Pass 1: Exact Ref',
    status: 'MATCHED',
    statusType: 'matched',
    timestamp: '01:48:19.201'
  },
  {
    id: 'TXN-90413',
    ref: 'REF-AWS-INFRA-88',
    desc: 'Cloud Infrastructure — Facility Sweep',
    amount: '-$5,842.10',
    pass: 'Pass 2: Amount & Date',
    status: 'MATCHED',
    statusType: 'matched',
    timestamp: '01:48:21.842'
  },
  {
    id: 'TXN-90414',
    ref: 'REF-STRIPE-PAY-44',
    desc: 'Merchant Settlement — Stripe Inflow',
    amount: '+$89,420.00',
    pass: 'Pass 1: Exact Ref',
    status: 'CLEARED',
    statusType: 'cleared',
    timestamp: '01:48:24.119'
  },
  {
    id: 'TXN-90415',
    ref: 'REF-CUSTODY-VAR-19',
    desc: 'Custody Settlement — BNY Mellon Fee',
    amount: '-$42.50',
    pass: 'Pass 4: Tolerance Variance',
    status: 'VARIANCE',
    statusType: 'variance',
    timestamp: '01:48:26.502'
  },
  {
    id: 'TXN-90416',
    ref: 'REF-SWIFT-CROSS-92',
    desc: 'Treasury Distribution — High-Velocity Wire',
    amount: '-$14,200.00',
    pass: 'Pass 5: Risk Anomaly Spike',
    status: 'CRITICAL',
    statusType: 'critical',
    timestamp: '01:48:28.910'
  },
  {
    id: 'TXN-90417',
    ref: 'REF-DIVIDEND-Q3-09',
    desc: 'Treasury Distribution — Yield Allocation',
    amount: '+$312,500.00',
    pass: 'Pass 1: Exact Ref',
    status: 'MATCHED',
    statusType: 'matched',
    timestamp: '01:48:31.405'
  }
];

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeProductTab, setActiveProductTab] = useState<'overview' | 'transactions' | 'reconciliation' | 'exceptions' | 'fraud' | 'audit'>('overview');
  const [activePipelineStage, setActivePipelineStage] = useState<number>(2);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'response' | 'audit'>('response');
  const [copied, setCopied] = useState(false);

  // Live telemetry counter state
  const [liveCounter, setLiveCounter] = useState(15229);

  // Real-time ticking feed state
  const [visibleFeed, setVisibleFeed] = useState<FeedTransaction[]>(STREAM_ITEMS_POOL.slice(0, 5));
  const poolIndexRef = useRef(5);

  // Scroll listener for compact sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Increment live transaction counter every 3 seconds to simulate production throughput
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveCounter(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Feed rotation effect
  useEffect(() => {
    const feedTimer = setInterval(() => {
      setVisibleFeed(prev => {
        const nextItem = STREAM_ITEMS_POOL[poolIndexRef.current % STREAM_ITEMS_POOL.length];
        poolIndexRef.current += 1;
        const now = new Date();
        const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
        const updatedItem = { ...nextItem, timestamp, id: `TXN-${Math.floor(Math.random() * 90000 + 10000)}` };
        return [updatedItem, ...prev.slice(0, 4)];
      });
    }, 3600);
    return () => clearInterval(feedTimer);
  }, []);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pipelineStages = [
    {
      id: 0,
      name: 'TRANSACTIONS',
      title: 'Raw Journal Ingestion',
      subtitle: 'Double-Entry Ingestion',
      icon: Database,
      protocol: 'Zero Balance Drift Ledger',
      details: 'Continuous ingestion of raw ledger entries, payment processor webhooks, and core banking feeds with balanced debits and credits.'
    },
    {
      id: 1,
      name: 'LEDGER',
      title: 'Double-Entry Ledgering',
      subtitle: 'Mathematical Balance',
      icon: Layers,
      protocol: 'Guaranteed Debit/Credit Parity',
      details: 'Every posted item writes immutable double-entry ledger records. Account balances compute in sub-millisecond real time directly from entry sums.'
    },
    {
      id: 2,
      name: 'MATCH ENGINE',
      title: '5-Pass Match Engine',
      subtitle: 'Algorithmic Execution',
      icon: GitMerge,
      protocol: 'Sub-4.2ms Matching Passes',
      details: 'Executes exact reference, exact amount/date, and fuzzy date tolerance passes comparing bank records with internal journal lines.'
    },
    {
      id: 3,
      name: 'VARIANCE DETECTION',
      title: 'Variance Isolation',
      subtitle: 'Discrepancy Triage',
      icon: AlertOctagon,
      protocol: 'Automated Threshold Filtering',
      details: 'Isolates amount mismatches, unrepresented fees, and date lag discrepancies into severity queues with microsecond tolerance scans.'
    },
    {
      id: 4,
      name: 'EXCEPTION REVIEW',
      title: 'Exception Resolution',
      subtitle: 'Controller Sign-Off',
      icon: FileCheck,
      protocol: 'Atomic Resolution Workflow',
      details: 'Controllers review isolated variances, attach settlement adjustments or manual journal entries, and atomically sign off resolution queues.'
    },
    {
      id: 5,
      name: 'AUDIT TRAIL',
      title: 'Immutable Audit Lock',
      subtitle: 'Cryptographic Ledger',
      icon: ScrollText,
      protocol: 'Append-Only Hash Verification',
      details: 'Permanent immutable audit history tracking every user action, resolution note, and system telemetry event with cryptographic chain verification.'
    }
  ];

  const codeSnippets = {
    curl: `curl -X POST https://api.vantra.financial/v1/reconciliation/run \\
  -H "Authorization: Bearer sec_live_948a1c900e2b..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "tenantId": "tenant_apex_capital_01",
    "accountId": "acc_operating_chase_881",
    "period": "2026-Q1",
    "tolerance": {
      "amount": 0.00,
      "dateDays": 2
    },
    "passes": ["EXACT_REF", "AMOUNT_DATE", "FUZZY_DESC", "VARIANCE_SCAN"]
  }'`,
    response: `{
  "status": "COMPLETED",
  "reconciliationId": "rec_live_89104",
  "executionTimeMs": 3.8,
  "metrics": {
    "totalInternalRecords": 4820,
    "totalStatementRecords": 4820,
    "matchedRecords": 4819,
    "matchRate": "99.98%",
    "unmatchedCount": 0,
    "exceptionsCreated": 1
  },
  "exceptionSummary": {
    "id": "exc_variance_041",
    "type": "AMOUNT_MISMATCH",
    "varianceAmount": 42.50,
    "currency": "USD",
    "severity": "LOW",
    "actionRequired": "CONTROLLER_REVIEW"
  },
  "auditLock": {
    "blockHash": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    "immutable": true
  }
}`,
    audit: `{
  "eventId": "evt_audit_991823",
  "tenantId": "tenant_apex_capital_01",
  "action": "RECONCILIATION_MATCH_LOCKED",
  "entityType": "RECONCILIATION",
  "entityId": "rec_live_89104",
  "userId": "usr_controller_hussain",
  "userEmail": "alex@apexcapital.com",
  "ipAddress": "198.51.100.42",
  "userAgent": "Vantra-Institutional-Client/2.4",
  "timestamp": "2026-09-03T01:48:22.184Z",
  "hashChain": {
    "previousHash": "sha256:4a88f01b7a2d9...",
    "currentHash": "sha256:7f83b1657ff1f...",
    "verified": true
  }
}`
  };

  const getStatusBadgeStyle = (statusType: FeedTransaction['statusType']) => {
    switch (statusType) {
      case 'matched':
        return {
          bg: 'var(--accent-emerald-tint)',
          color: 'var(--accent-emerald)',
          border: 'rgba(24, 201, 139, 0.32)'
        };
      case 'cleared':
        return {
          bg: 'var(--accent-mint-tint)',
          color: 'var(--accent-mint)',
          border: 'rgba(99, 230, 178, 0.32)'
        };
      case 'variance':
        return {
          bg: 'var(--warning-bg)',
          color: 'var(--warning)',
          border: 'var(--warning-border)'
        };
      case 'critical':
        return {
          bg: 'var(--danger-bg)',
          color: 'var(--danger)',
          border: 'var(--danger-border)'
        };
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.05)',
          color: 'var(--text-secondary)',
          border: 'var(--border-subtle)'
        };
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      {/* 1. NAVBAR */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          transition: 'all 0.2s ease',
          background: isScrolled ? 'rgba(8, 11, 10, 0.94)' : 'rgba(8, 11, 10, 0.75)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: isScrolled ? '12px 24px' : '16px 24px'
        }}
      >
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Brand Logo with Emerald/Mint Identity */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#080B0A',
                boxShadow: '0 2px 10px rgba(24, 201, 139, 0.35)',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                VANTRA
              </div>
              <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--accent-mint)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                FINANCIAL INFRASTRUCTURE
              </div>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="desktop-nav">
            <a href="#capabilities" className="nav-link" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}>
              Capabilities
            </a>
            <a href="#engine" className="nav-link" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}>
              Engine
            </a>
            <a href="#api" className="nav-link" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}>
              API &amp; Schema
            </a>
            <a href="#security" className="nav-link" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}>
              Security
            </a>
            <a href="#preview" className="nav-link" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}>
              Product Demo
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-sm">
                <span>Go to Dashboard</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link to="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', padding: '6px 10px', transition: 'color 0.15s' }} className="nav-link">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  <span>Deploy Sandbox</span>
                  <ArrowRight size={14} />
                </Link>
              </>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-secondary btn-sm mobile-menu-btn"
              style={{ display: 'none', padding: '6px 8px' }}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '20px 24px',
              background: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14
            }}
          >
            <a href="#capabilities" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              Capabilities
            </a>
            <a href="#engine" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              Engine
            </a>
            <a href="#api" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              API &amp; Schema
            </a>
            <a href="#security" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              Security
            </a>
            <a href="#preview" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              Product Demo
            </a>
          </div>
        )}
      </header>

      {/* 2 & 3. HERO SECTION & HERO BACKGROUND */}
      <section
        style={{
          position: 'relative',
          padding: '64px 24px 84px 24px',
          overflow: 'hidden'
        }}
        className="hero-technical-mesh"
      >
        <div
          style={{
            maxWidth: 1320,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.05fr 1fr',
            gap: 48,
            alignItems: 'center',
            position: 'relative',
            zIndex: 2
          }}
          className="hero-split-grid"
        >
          {/* Left Column: Left-aligned headline, live status counter, subcopy, CTAs */}
          <div style={{ textAlign: 'left' }}>
            {/* 5. LIVE INDICATOR */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-emerald-tint)',
                border: '1px solid rgba(24, 201, 139, 0.28)',
                color: 'var(--accent-mint)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                marginBottom: 22
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--accent-emerald)'
                }}
                className="node-pulse"
              />
              <span className="mono" style={{ letterSpacing: '0.02em', color: 'var(--text-primary)' }}>
                ● LIVE <span style={{ color: 'var(--text-muted)' }}>|</span> {liveCounter.toLocaleString()} transactions reconciled today
              </span>
            </div>

            {/* 2. Headline with Clean High-Contrast Sans-Serif and Emerald-to-Mint Emphasis */}
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 4.4vw, 3.85rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                marginBottom: 20
              }}
            >
              Autonomous Financial Operations, Reconciled in{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #18C98B 0%, #63E6B2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800
                }}
              >
                Real Time
              </span>
              .
            </h1>

            {/* Subcopy */}
            <p
              style={{
                fontSize: 'clamp(1rem, 1.3vw, 1.125rem)',
                color: 'var(--text-secondary)',
                lineHeight: 1.62,
                maxWidth: 580,
                marginBottom: 32
              }}
            >
              The programmatic control layer for institutional financial teams. Unify balanced double-entry ledgering, multi-pass reconciliation with variance triage, deterministic risk telemetry, and tamper-resistant audit trails.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 36 }}>
              <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">
                <span>{isAuthenticated ? 'Go to Dashboard' : 'Deploy Sandbox'}</span>
                <ArrowRight size={17} />
              </Link>
              <a href="#api" className="btn btn-secondary btn-lg">
                <Terminal size={16} style={{ color: 'var(--accent-emerald)' }} />
                <span>API Architecture</span>
              </a>
            </div>

            {/* Technical Proof Specs in Monospace */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                paddingTop: 18,
                borderTop: '1px solid var(--border-subtle)'
              }}
              className="mono"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--accent-emerald)' }}>✓</span>
                <span style={{ color: 'var(--text-secondary)' }}>p99 &lt; 4.2ms</span>
              </div>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border-default)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--accent-emerald)' }}>✓</span>
                <span style={{ color: 'var(--text-secondary)' }}>Zero Ledger Drift</span>
              </div>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border-default)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--accent-emerald)' }}>✓</span>
                <span style={{ color: 'var(--text-secondary)' }}>ISO 20022 Ready</span>
              </div>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border-default)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--accent-emerald)' }}>✓</span>
                <span style={{ color: 'var(--text-secondary)' }}>Cryptographic RBAC</span>
              </div>
            </div>
          </div>

          {/* 4. HERO PRODUCT VISUAL: Real Reconciliation Stream Centerpiece */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(180deg, #0D1311 0%, #080B0A 100%)',
              border: '1px solid rgba(24, 201, 139, 0.28)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.75), 0 0 28px rgba(24, 201, 139, 0.08)',
              overflow: 'hidden'
            }}
          >
            {/* Terminal Header Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                background: '#0F1714',
                borderBottom: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)' }} className="node-pulse" />
                <span style={{ fontSize: '0.725rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-primary)' }} className="mono">
                  RECONCILIATION STREAM
                </span>
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    color: 'var(--accent-mint)',
                    background: 'var(--accent-mint-tint)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid rgba(99, 230, 178, 0.28)'
                  }}
                  className="mono"
                >
                  ● LIVE
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.6875rem', color: 'var(--text-muted)' }} className="mono">
                <span>p99: 3.8ms</span>
                <span style={{ color: 'var(--border-default)' }}>|</span>
                <span>TOL: ±$0.00</span>
              </div>
            </div>

            {/* Key Metrics Strip inside Panel */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                padding: '12px 18px',
                background: 'rgba(8, 11, 10, 0.75)',
                borderBottom: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 700 }} className="mono">MATCH RATE</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-emerald)' }} className="mono">99.98%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 700 }} className="mono">ACTIVE TOLERANCE</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }} className="mono">±$0.00</div>
              </div>
              <div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 700 }} className="mono">LEDGER STATUS</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-mint)' }} className="mono">BALANCED</div>
              </div>
            </div>

            {/* Live Ticking Transaction Rows */}
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 330 }}>
              {visibleFeed.map((txn, index) => {
                const isNewest = index === 0;
                const badgeStyle = getStatusBadgeStyle(txn.statusType);
                return (
                  <div
                    key={txn.id}
                    className={isNewest ? 'row-tick-in' : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: isNewest ? 'rgba(24, 201, 139, 0.08)' : 'rgba(13, 18, 16, 0.75)',
                      border: isNewest ? '1px solid rgba(24, 201, 139, 0.32)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.25s ease',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: isNewest ? 'var(--accent-emerald)' : 'var(--text-muted)'
                        }}
                      />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {txn.desc}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, fontSize: '0.65rem', color: 'var(--text-muted)' }} className="mono">
                          <span>{txn.ref}</span>
                          <span>•</span>
                          <span>{txn.pass}</span>
                          <span>•</span>
                          <span>{txn.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: txn.amount.startsWith('+') ? 'var(--accent-emerald)' : 'var(--text-primary)'
                        }}
                        className="mono"
                      >
                        {txn.amount}
                      </span>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-xs)',
                          background: badgeStyle.bg,
                          color: badgeStyle.color,
                          border: `1px solid ${badgeStyle.border}`,
                          letterSpacing: '0.04em'
                        }}
                        className="mono"
                      >
                        {txn.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ticker Footer Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 18px',
                background: '#0B110F',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.6875rem',
                color: 'var(--text-muted)'
              }}
              className="mono"
            >
              <span>SHA-256: 7f83b1...26d9 (APPEND-ONLY LOCKED)</span>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>● SYNCHRONIZED</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST METRICS STRIP */}
      <section
        style={{
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(13, 18, 16, 0.65)',
          padding: '36px 24px'
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 24,
            alignItems: 'center'
          }}
          className="technical-stats-grid"
        >
          {[
            { value: 'Sub-2s', label: 'Response Latency', sub: 'p99 engine response under 4.2ms' },
            { value: '±$0.00', label: 'Zero Ledger Drift', sub: 'Double-entry balance parity guarantee' },
            { value: 'ISO 20022', label: 'Financial Standard', sub: 'Universal messaging schema compatible' },
            { value: 'RBAC', label: 'Cryptographic Security', sub: 'Strict row-level tenant boundary' },
            { value: '100%', label: 'Append-Only Audit Trail', sub: 'Immutable cryptographic compliance lock' }
          ].map((item, idx, arr) => (
            <div
              key={idx}
              style={{
                textAlign: 'left',
                borderRight: idx < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                paddingRight: 20
              }}
              className="stat-cell"
            >
              <div
                style={{
                  fontSize: 'clamp(1.75rem, 2.6vw, 2.35rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1
                }}
                className="mono"
              >
                {item.value}
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-mint)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--accent-emerald)', fontSize: '0.7rem' }}>●</span>
                <span>{item.label}</span>
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {item.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FINANCIAL OPERATIONS PROBLEM & FINANCIAL KPI SECTION */}
      <section id="engine" style={{ padding: '84px 24px', maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', marginBottom: 48 }} className="engine-split-grid">
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 10
              }}
            >
              <span style={{ color: 'var(--accent-emerald)' }}>●</span>
              <span>THE FINANCIAL OPERATIONS PROBLEM</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              Legacy Financial Systems Are Fragile and Opaque.
            </h2>
          </div>
          <div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              Traditional finance teams rely on disconnected bank portal exports, error-prone manual spreadsheets, and post-facto monthly closing routines. As transaction volume scales, ledger drift accumulates unnoticed, variances trigger compliance breaches, and audits require weeks of retrospective data reconstruction.
            </p>
          </div>
        </div>

        {/* Financial KPI Panels */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
            gap: 16
          }}
          className="kpi-financial-strip"
        >
          {/* Dominant Net Balance */}
          <div
            className="card card-hover"
            style={{
              padding: '24px 28px',
              background: 'linear-gradient(135deg, rgba(13, 18, 16, 0.98) 0%, rgba(23, 32, 27, 0.92) 100%)',
              borderColor: 'rgba(24, 201, 139, 0.28)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="meta-label">NET LEDGER BALANCE</span>
              <span className="badge badge-mint">BALANCED</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }} className="financial-figure">
              $284,920.50
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--accent-mint)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--accent-emerald)' }}>●</span>
              <span>Double-entry mathematical equilibrium verified</span>
            </div>
          </div>

          {/* Total Inflow */}
          <div className="card card-hover" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="meta-label">TOTAL INFLOW (30D)</span>
              <ArrowDownLeft size={16} style={{ color: 'var(--accent-emerald)' }} />
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--accent-emerald)' }} className="financial-figure">
              +$148,210.00
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 6 }}>
              Operating wires &amp; settlements
            </div>
          </div>

          {/* Total Outflow */}
          <div className="card card-hover" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="meta-label">TOTAL OUTFLOW (30D)</span>
              <ArrowUpRight size={16} style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)' }} className="financial-figure">
              -$39,410.00
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 6 }}>
              Vendor disbursements &amp; cloud
            </div>
          </div>

          {/* Reconciliation Health */}
          <div className="card card-hover" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="meta-label">RECONCILIATION HEALTH</span>
              <Activity size={16} style={{ color: 'var(--accent-emerald)' }} />
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--accent-mint)' }} className="financial-figure">
              99.98%
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 6 }}>
              12,482 matched • 1 variance open
            </div>
          </div>
        </div>
      </section>

      {/* 8. RECONCILIATION VISUALIZATION (Pipeline Flow: TRANSACTIONS → LEDGER → MATCH ENGINE → VARIANCE DETECTION → EXCEPTION REVIEW → AUDIT TRAIL) */}
      <section id="capabilities" style={{ padding: '80px 24px', background: 'rgba(13, 18, 16, 0.5)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'left', marginBottom: 36 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 10
              }}
            >
              <span style={{ color: 'var(--accent-emerald)' }}>●</span>
              <span>RECONCILIATION ENGINE PIPELINE</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
              Vantra Is an Engine, Not Simply a Dashboard.
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: 680, marginTop: 8 }}>
              Every financial event moves deterministically through a 6-stage algorithmic pipeline designed for sub-millisecond execution, automated variance containment, and permanent compliance locking.
            </p>
          </div>

          {/* 6-Stage Visual Pipeline */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))',
              gap: 12,
              marginBottom: 20
            }}
          >
            {pipelineStages.map((stage) => {
              const StageIcon = stage.icon;
              const isSelected = activePipelineStage === stage.id;
              return (
                <div
                  key={stage.id}
                  onClick={() => setActivePipelineStage(stage.id)}
                  className="card"
                  style={{
                    padding: '20px 18px',
                    background: isSelected ? 'var(--accent-emerald-tint)' : 'var(--bg-surface)',
                    borderColor: isSelected ? 'var(--accent-emerald)' : 'var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'var(--accent-emerald)' : 'rgba(24, 201, 139, 0.12)',
                        color: isSelected ? '#080B0A' : 'var(--accent-emerald)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(24, 201, 139, 0.28)'
                      }}
                    >
                      <StageIcon size={17} />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: isSelected ? 'var(--accent-mint)' : 'var(--text-muted)' }} className="mono">
                      0{stage.id + 1}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.675rem', fontWeight: 800, color: isSelected ? 'var(--accent-mint)' : 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }} className="mono">
                    {stage.name}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, marginBottom: 4 }}>
                    {stage.title}
                  </div>
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      color: isSelected ? 'var(--accent-emerald)' : 'var(--text-muted)',
                      fontWeight: 600
                    }}
                    className="mono"
                  >
                    {stage.protocol}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Stage Deep Dive */}
          <div
            className="card"
            style={{
              padding: '24px 30px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 20
            }}
          >
            <div style={{ maxWidth: 760 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-mint)', fontWeight: 700, marginBottom: 4 }} className="mono">
                STAGE 0{activePipelineStage + 1}: {pipelineStages[activePipelineStage].name} SPECIFICATION
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {pipelineStages[activePipelineStage].title} — {pipelineStages[activePipelineStage].subtitle}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.6 }}>
                {pipelineStages[activePipelineStage].details}
              </p>
            </div>
            <Link to="/reconciliation" className="btn btn-primary btn-sm">
              <span>Inspect Match Center</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 9. FRAUD DETECTION SECTION */}
      <section style={{ padding: '84px 24px', maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 48, alignItems: 'center' }} className="fraud-split-grid">
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 10
              }}
            >
              <ShieldAlert size={13} style={{ color: 'var(--accent-emerald)' }} />
              <span>FRAUD INTELLIGENCE &amp; RISK TELEMETRY</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.5rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              Deterministic Anomaly Detection Before Settlement.
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginTop: 14 }}>
              Vantra evaluates transactions in flight with 7 deterministic risk rules. High velocity surges, duplicate reference replay attacks, off-hours execution spikes, and anomalous debit amounts are flagged and held before posting to ledger records.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
              {[
                { rule: 'Velocity Burst Filter', status: 'Optimal (<3/min)', color: 'var(--accent-emerald)' },
                { rule: 'Duplicate Reference Hash Lock', status: 'Zero collisions', color: 'var(--accent-emerald)' },
                { rule: 'Amount Outlier Threshold (3.5σ)', status: 'Active monitoring', color: 'var(--accent-mint)' },
                { rule: 'Cross-Border High Risk Flagging', status: 'Isolated queue', color: 'var(--warning)' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.rule}</span>
                  </div>
                  <span style={{ fontSize: '0.725rem', color: item.color, fontWeight: 700 }} className="mono">{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fraud Metrics Card Panel */}
          <div
            className="card"
            style={{
              padding: '32px 30px',
              background: 'linear-gradient(135deg, rgba(13, 18, 16, 0.95) 0%, rgba(8, 11, 10, 0.98) 100%)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span className="meta-label">RISK INTELLIGENCE QUEUE</span>
              <span className="badge badge-emerald">TELEMETRY ACTIVE</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div style={{ padding: '16px 18px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div className="meta-label">AVG RISK SCORE</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: 2 }} className="mono">12 / 100</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>Low operational risk tier</div>
              </div>
              <div style={{ padding: '16px 18px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div className="meta-label">OPEN RISK ALERTS</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }} className="mono">0 Active</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>Zero unhandled anomalies</div>
              </div>
            </div>

            <div style={{ padding: '16px 18px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span className="meta-label">RISK SEVERITY SPECTRUM</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)' }} className="mono">HEALTHY</span>
              </div>
              <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', gap: 2 }}>
                <div style={{ flex: 8, background: 'var(--accent-emerald)' }} />
                <div style={{ flex: 1.5, background: 'var(--warning)' }} />
                <div style={{ flex: 0.5, background: 'var(--danger)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: 6 }} className="mono">
                <span>0-29 Low (Clean)</span>
                <span>30-79 Medium</span>
                <span>80-100 Critical</span>
              </div>
            </div>

            <Link to="/fraud" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
              <ShieldAlert size={14} style={{ color: 'var(--accent-emerald)' }} />
              <span>Open Fraud Telemetry Center</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. IMMUTABLE AUDIT TRAIL & EXCEPTION RESOLUTION */}
      <section style={{ padding: '80px 24px', background: 'rgba(13, 18, 16, 0.45)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'left', marginBottom: 36 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 10
              }}
            >
              <ScrollText size={13} style={{ color: 'var(--accent-emerald)' }} />
              <span>TRACEABILITY ARCHITECTURE</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
              Every Financial Action Is Permanent and Traceable.
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: 680, marginTop: 8 }}>
              From initial debit posting to algorithmic matching, variance isolation, controller review, and final audit lock—every transition is stamped into an immutable append-only ledger.
            </p>
          </div>

          {/* Audit Chain Lifecycle Flow: TRANSACTION → RECONCILIATION → EXCEPTION → RESOLUTION → AUDIT RECORD */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 14,
              marginBottom: 28
            }}
            className="audit-chain-grid"
          >
            {[
              { step: 'TRANSACTION', desc: 'Raw entry posted with debits and credits', meta: 'Journal lock', icon: Database },
              { step: 'RECONCILIATION', desc: '5-pass matching execution evaluated', meta: 'p99 3.8ms', icon: GitMerge },
              { step: 'EXCEPTION', desc: 'Tolerance variance isolated into queue', meta: 'Amount delta', icon: AlertOctagon },
              { step: 'RESOLUTION', desc: 'Controller signs off atomic adjustments', meta: 'Dual approval', icon: FileCheck },
              { step: 'AUDIT RECORD', desc: 'Permanent SHA-256 hash locked into block', meta: 'Append-only', icon: ScrollText }
            ].map((node, i) => {
              const Icon = node.icon;
              return (
                <div
                  key={i}
                  className="card"
                  style={{
                    padding: '18px 16px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--accent-emerald-tint)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={14} />
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--accent-mint)', fontWeight: 700 }} className="mono">0{i + 1}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.04em' }} className="mono">
                    {node.step}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    {node.desc}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 8 }} className="mono">
                    ● {node.meta}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Audit Log Payload Preview */}
          <div
            className="terminal-window"
            style={{ maxWidth: 900, margin: '0 auto' }}
          >
            <div className="terminal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="terminal-dots">
                  <div className="terminal-dot" style={{ background: '#F87171' }} />
                  <div className="terminal-dot" style={{ background: '#F5B942' }} />
                  <div className="terminal-dot" style={{ background: '#35D399' }} />
                </div>
                <span className="mono" style={{ fontSize: '0.725rem' }}>audit_chain_record_991823.json</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)' }} className="mono">
                SHA-256 HASH VERIFIED ✓
              </span>
            </div>
            <pre style={{ padding: '18px 20px', margin: 0, fontSize: '0.775rem', lineHeight: 1.6, overflowX: 'auto' }}>
              <code>{codeSnippets.audit}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* 5. CODE / API ARCHITECTURE SECTION */}
      <section id="api" style={{ padding: '84px 24px', maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 44, alignItems: 'center' }} className="api-preview-grid">
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 10
              }}
            >
              <Code2 size={13} style={{ color: 'var(--accent-emerald)' }} />
              <span>API-FIRST INFRASTRUCTURE</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.5rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              Programmatic Control Layer for Financial Engineers
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 14 }}>
              Every action in Vantra — from statement uploads and reconciliation runs to exception resolutions — is fully exposed via REST APIs with deterministic schemas and immutable audit payloads.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
              {[
                'Atomic reconciliation execution with configurable date/amount tolerances',
                'JSON-formatted audit trail events with cryptographic previous-hash chains',
                'Strict row-level tenant boundary isolation guaranteed at query time'
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <Link to="/register" className="btn btn-primary btn-sm">
                <span>Get API Credentials</span>
                <ArrowRight size={14} />
              </Link>
              <a href="#preview" className="btn btn-secondary btn-sm">
                <span>View Interactive Demo</span>
              </a>
            </div>
          </div>

          {/* Right Terminal Card with Code Highlighting */}
          <div className="terminal-window">
            <div className="terminal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="terminal-dots">
                  <div className="terminal-dot" style={{ background: '#F87171' }} />
                  <div className="terminal-dot" style={{ background: '#F5B942' }} />
                  <div className="terminal-dot" style={{ background: '#35D399' }} />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => setActiveCodeTab('response')}
                    style={{
                      background: activeCodeTab === 'response' ? 'var(--accent-emerald-tint)' : 'transparent',
                      color: activeCodeTab === 'response' ? 'var(--accent-mint)' : 'var(--text-muted)',
                      border: 'none',
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    className="mono"
                  >
                    ReconciliationSession.json
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('curl')}
                    style={{
                      background: activeCodeTab === 'curl' ? 'var(--accent-emerald-tint)' : 'transparent',
                      color: activeCodeTab === 'curl' ? 'var(--accent-mint)' : 'var(--text-muted)',
                      border: 'none',
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    className="mono"
                  >
                    run_reconciliation.sh
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleCopyCode(codeSnippets[activeCodeTab])}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: '0.7rem'
                }}
                title="Copy to clipboard"
              >
                {copied ? <Check size={13} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre
              style={{
                padding: '18px 20px',
                margin: 0,
                fontSize: '0.775rem',
                lineHeight: 1.6,
                color: 'var(--text-primary)',
                overflowX: 'auto',
                maxHeight: 340
              }}
            >
              <code>{codeSnippets[activeCodeTab]}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* 11. ENTERPRISE SECURITY (Tenant Boundary Diagram) */}
      <section id="security" style={{ padding: '84px 24px', maxWidth: 1320, margin: '0 auto' }}>
        <div
          className="card"
          style={{
            padding: '44px 40px',
            background: 'linear-gradient(135deg, rgba(13, 18, 16, 0.95) 0%, rgba(8, 11, 10, 0.98) 100%)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 48, alignItems: 'center' }} className="security-grid">
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 10
                }}
              >
                <Lock size={13} style={{ color: 'var(--accent-emerald)' }} />
                <span>TENANT ISOLATION ARCHITECTURE</span>
              </div>

              <h2 style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: 14 }}>
                Cryptographic Data Boundary Between Every Organization
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                Engineered for strict institutional audits. Vantra enforces row-level tenant boundary constraints, append-only logs, and tamper-resistant audit trails with zero chance of cross-organization leakage.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  'Strict Tenant UUID Isolation',
                  'Stateless JWT Bearer Auth',
                  'Encrypted Sandbox Sessions',
                  'Immutable Append-Only Audit',
                  'Zero Ledger Drift Guarantee',
                  'Role-Based Authorization (RBAC)'
                ].map((sec, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={15} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-primary)', fontWeight: 600 }}>{sec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Tenant Isolation Diagram */}
            <div
              style={{
                background: '#090E0C',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 22,
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--accent-mint)', textTransform: 'uppercase', letterSpacing: '0.075em' }}>
                Logical Tenant Sandboxing Boundary
              </div>

              <div style={{ padding: 14, background: 'rgba(24, 201, 139, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(24, 201, 139, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  <span>TENANT A (Apex Capital Management)</span>
                  <span style={{ color: 'var(--accent-emerald)', fontSize: '0.6875rem' }} className="mono">ISOLATED</span>
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: 4 }} className="mono">
                  scope: tenantId = 'apex-capital-uuid'
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {['Accounts', 'Transactions', 'Reconciliation', 'Audit'].map(tag => (
                    <span key={tag} style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(0,0,0,0.5)', fontSize: '0.65rem', color: 'var(--text-secondary)' }} className="mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--danger)', fontSize: '0.6875rem', fontWeight: 700 }} className="mono">
                <div style={{ height: 1, flex: 1, background: 'rgba(248, 113, 113, 0.3)' }} />
                <span>CRYPTOGRAPHIC TENANT BARRIER</span>
                <div style={{ height: 1, flex: 1, background: 'rgba(248, 113, 113, 0.3)' }} />
              </div>

              <div style={{ padding: 14, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  <span>TENANT B (Horizon Institutional Fund)</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }} className="mono">ISOLATED</span>
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: 4 }} className="mono">
                  scope: tenantId = 'horizon-fund-uuid'
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {['Accounts', 'Transactions', 'Reconciliation', 'Audit'].map(tag => (
                    <span key={tag} style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(0,0,0,0.5)', fontSize: '0.65rem', color: 'var(--text-secondary)' }} className="mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }} className="mono">
                Cross-tenant queries permanently blocked at Prisma query layer
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. INTERACTIVE PRODUCT PREVIEW SHOWCASE */}
      <section id="preview" style={{ padding: '80px 24px 100px 24px', maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ textAlign: 'left', marginBottom: 36 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 10
            }}
          >
            <Sliders size={13} style={{ color: 'var(--accent-emerald)' }} />
            <span>MODULE EXPLORER</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            Interactive Financial Command Center
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: 6 }}>
            Switch between production modules to preview real-time double-entry ledgers, reconciliation passes, and audit compliance feeds.
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'transactions', label: 'Transactions' },
            { id: 'reconciliation', label: 'Reconciliation' },
            { id: 'exceptions', label: 'Exceptions' },
            { id: 'fraud', label: 'Fraud Telemetry' },
            { id: 'audit', label: 'Audit Trail' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveProductTab(tab.id as any)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.825rem',
                fontWeight: 600,
                border: activeProductTab === tab.id ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                background: activeProductTab === tab.id ? 'var(--accent-emerald-tint)' : 'var(--bg-surface)',
                color: activeProductTab === tab.id ? 'var(--accent-mint)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Browser Frame Mockup */}
        <div
          className="card"
          style={{
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-lg), 0 0 32px rgba(24, 201, 139, 0.08)',
            overflow: 'hidden',
            background: 'var(--bg-surface)'
          }}
        >
          {/* Top Bar */}
          <div
            style={{
              padding: '10px 18px',
              background: '#090E0C',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F87171' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F5B942' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#35D399' }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8 }} className="mono">
                https://app.vantra.financial/{activeProductTab}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--accent-emerald)' }} className="mono">
              <Lock size={12} />
              <span>TLS 1.3 ENCRYPTED</span>
            </div>
          </div>

          {/* Module View Body */}
          <div style={{ padding: '28px 32px' }}>
            {activeProductTab === 'overview' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <div style={{ padding: '20px 24px', background: '#0A0F0D', borderRadius: 'var(--radius-md)', border: '1px solid rgba(24, 201, 139, 0.28)' }}>
                    <div className="meta-label">NET LEDGER BALANCE</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }} className="mono">$284,920.50</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-mint)', marginTop: 2 }}>Balanced Double-Entry Journal</div>
                  </div>
                  <div style={{ padding: '20px 24px', background: '#0A0F0D', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div className="meta-label">30D INFLOW VOLUME</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: 4 }} className="mono">+$148,210.00</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Operating wires &amp; deposits</div>
                  </div>
                  <div style={{ padding: '20px 24px', background: '#0A0F0D', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div className="meta-label">RECONCILIATION ACCURACY</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-mint)', marginTop: 4 }} className="mono">99.98%</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>12,482 matched • 0 drift</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#0A0F0D', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Want full access to all charts, accounts, and transaction ingestion?</span>
                  <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn btn-primary btn-sm">
                    <span>Open Live Dashboard</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {activeProductTab === 'transactions' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Double-Entry Journal Feed</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} className="mono">SHOWING RECENT 4 TRANSACTIONS</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {STREAM_ITEMS_POOL.slice(0, 4).map((tx) => (
                    <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#0A0F0D', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{tx.desc}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }} className="mono">{tx.ref}</div>
                      </div>
                      <span style={{ fontWeight: 800, color: tx.amount.startsWith('+') ? 'var(--accent-emerald)' : 'var(--text-primary)' }} className="mono">
                        {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeProductTab === 'reconciliation' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>5-Pass Algorithmic Matching Execution</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-mint)' }} className="mono">PASS 1-5 COMPLETED</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                  <div style={{ padding: '12px 14px', background: '#0A0F0D', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div className="meta-label">PASS 1 (EXACT REF)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: 2 }} className="mono">4,120 Records</div>
                  </div>
                  <div style={{ padding: '12px 14px', background: '#0A0F0D', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div className="meta-label">PASS 2 (AMOUNT &amp; DATE)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-mint)', marginTop: 2 }} className="mono">698 Records</div>
                  </div>
                  <div style={{ padding: '12px 14px', background: '#0A0F0D', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div className="meta-label">PASS 3 (FUZZY MATCH)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }} className="mono">1 Record</div>
                  </div>
                  <div style={{ padding: '12px 14px', background: '#0A0F0D', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div className="meta-label">VARIANCE DETECTED</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--warning)', marginTop: 2 }} className="mono">1 Exception</div>
                  </div>
                </div>
              </div>
            )}

            {activeProductTab === 'exceptions' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Variance Exception Review Queue</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--warning)' }} className="mono">1 OPEN DISCREPANCY</span>
                </div>
                <div style={{ padding: '14px 18px', background: '#0A0F0D', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 185, 66, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>Custody Settlement Fee Variance</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: 2 }}>Expected: $0.00 • Statement: -$42.50 • Variance: -$42.50</div>
                  </div>
                  <span style={{ padding: '3px 8px', borderRadius: 'var(--radius-xs)', background: 'var(--warning-bg)', color: 'var(--warning)', fontSize: '0.7rem', fontWeight: 800 }} className="mono">
                    REQUIRES SIGN-OFF
                  </span>
                </div>
              </div>
            )}

            {activeProductTab === 'fraud' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Deterministic Risk Telemetry Engine</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }} className="mono">ALL PASSES CLEARED</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <div style={{ padding: '14px 16px', background: '#0A0F0D', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div className="meta-label">AVERAGE RISK SCORE</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: 2 }} className="mono">12 / 100</div>
                  </div>
                  <div style={{ padding: '14px 16px', background: '#0A0F0D', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div className="meta-label">CRITICAL ANOMALIES</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }} className="mono">0 Active</div>
                  </div>
                  <div style={{ padding: '14px 16px', background: '#0A0F0D', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div className="meta-label">VELOCITY THRESHOLD</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-mint)', marginTop: 2 }} className="mono">Optimal</div>
                  </div>
                </div>
              </div>
            )}

            {activeProductTab === 'audit' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Cryptographic Append-Only Compliance Trail</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-mint)' }} className="mono">ZERO MUTATIONS PERMITTED</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { action: 'RECONCILIATION_MATCH_LOCKED', user: 'admin@vantra.internal', time: '14s ago' },
                    { action: 'TRANSACTION_RECORDED', user: 'system_daemon', time: '2m ago' },
                    { action: 'ACCOUNT_CREATED', user: 'controller@apexcapital.com', time: '12m ago' }
                  ].map((log, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0A0F0D', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--accent-mint)' }} className="mono">{log.action}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>by {log.user}</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }} className="mono">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 13. INSTITUTIONAL FINAL CTA SECTION */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--accent-mint)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 14
            }}
          >
            <span style={{ color: 'var(--accent-emerald)' }}>●</span>
            <span>PRODUCTION READY ARCHITECTURE</span>
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.9rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: 16 }}>
            Ready to Streamline Your Financial Infrastructure?
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 28px auto', lineHeight: 1.6 }}>
            Deploy your dedicated multi-tenant sandbox in seconds. Experience automated double-entry accounting, 5-pass reconciliation, and cryptographic audit security.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              <span>Deploy Production Sandbox</span>
              <ArrowRight size={17} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              <span>Sign In to Existing Tenant</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 14. MINIMAL TECHNICAL FOOTER */}
      <footer style={{ padding: '24px', background: 'var(--bg-base)', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>VANTRA</span>
            <span>• Financial Operations &amp; Reconciliation Engine</span>
          </div>
          <div style={{ display: 'flex', gap: 18 }} className="mono">
            <span>SOC 2 Type II Certified Schema</span>
            <span>•</span>
            <span>ISO 20022 Ready</span>
            <span>•</span>
            <span>AES-256 Tenant Encryption</span>
          </div>
        </div>
      </footer>

      {/* Responsive Styles */}
      <style>{`
        .nav-link:hover {
          color: var(--accent-mint) !important;
        }
        @media (max-width: 1024px) {
          .hero-split-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .technical-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .kpi-financial-strip {
            grid-template-columns: 1fr 1fr !important;
          }
          .engine-split-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .fraud-split-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .audit-chain-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .api-preview-grid {
            grid-template-columns: 1fr !important;
          }
          .security-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: inline-flex !important;
          }
          .technical-stats-grid {
            grid-template-columns: 1fr !important;
          }
          .kpi-financial-strip {
            grid-template-columns: 1fr !important;
          }
          .audit-chain-grid {
            grid-template-columns: 1fr !important;
          }
          .stat-cell {
            border-right: none !important;
            border-bottom: 1px solid var(--border-subtle) !important;
            padding-bottom: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};
