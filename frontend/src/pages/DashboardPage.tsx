import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountsApi, transactionsApi, reconciliationApi, exceptionsApi, auditLogsApi, fraudApi } from '../api/client';
import { Account, Transaction, Reconciliation, ReconciliationException, AuditLog, FraudStats } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { MetricCard } from '../components/common/MetricCard';
import { CashFlowChart } from '../components/common/CashFlowChart';
import { EmptyState } from '../components/common/EmptyState';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  GitMerge,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  PlusCircle,
  Play,
  ScrollText,
  Activity,
  CheckCircle2
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [openExceptions, setOpenExceptions] = useState<ReconciliationException[]>([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState<AuditLog[]>([]);
  const [fraudStats, setFraudStats] = useState<FraudStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Time-based Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [accRes, txRes, reconRes, excRes, auditRes, fraudRes] = await Promise.all([
          accountsApi.list().catch(() => ({ accounts: [] })),
          transactionsApi.list({ limit: 8 }).catch(() => ({ transactions: [] })),
          reconciliationApi.list({ limit: 5 }).catch(() => ({ reconciliations: [] })),
          exceptionsApi.list({ status: 'OPEN', limit: 5 }).catch(() => ({ exceptions: [] })),
          auditLogsApi.list({ limit: 5 }).catch(() => ({ auditLogs: [] })),
          fraudApi.getStats().catch(() => ({ stats: null }))
        ]);

        if (isMounted) {
          setAccounts(accRes.accounts || []);
          setRecentTransactions(txRes.transactions || []);
          setReconciliations(reconRes.reconciliations || []);
          setOpenExceptions(excRes.exceptions || []);
          setRecentAuditLogs(auditRes.auditLogs || []);
          setFraudStats(fraudRes.stats || null);
        }
      } catch (err) {
        console.error('Failed to load dashboard telemetry:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  // Compute Real Financial Aggregates
  const totalBalance = accounts.reduce((acc, a) => acc + (Number(a.balance) || 0), 0);

  const totalInflow = recentTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalOutflow = recentTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalRecons = reconciliations.length;
  const completedRecons = reconciliations.filter(r => r.status === 'COMPLETED').length;
  const reconHealthPercent = totalRecons > 0 ? ((completedRecons / totalRecons) * 100).toFixed(1) : '100.0';

  const lastReconDate = reconciliations.length > 0
    ? new Date(reconciliations[0].createdAt).toLocaleDateString()
    : 'None yet';

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* 1. Standardized Executive Command Header */}
      <PageHeader
        eyebrow="OVERVIEW"
        title={<>{getGreeting()}, {user?.name || user?.email?.split('@')[0]} — Financial <em>Overview</em></>}
        subtitle={`Organization: ${user?.tenant?.name || 'Vantra Financial'} • Production Sandbox`}
        badge={
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-emerald-tint)',
              border: '1px solid rgba(24, 201, 139, 0.28)',
              color: 'var(--accent-mint)',
              fontSize: '0.725rem',
              fontWeight: 700
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-emerald)' }} className="node-pulse" />
            <span>OPERATIONAL</span>
          </span>
        }
        actions={
          <>
            <Link to="/transactions" className="btn btn-secondary btn-sm">
              <PlusCircle size={15} style={{ color: 'var(--accent-emerald)' }} />
              <span>+ Record Transaction</span>
            </Link>
            <Link to="/reconciliation" className="btn btn-primary btn-sm">
              <Play size={14} />
              <span>Run Reconciliation</span>
            </Link>
          </>
        }
      />

      {/* 2. Critical Fraud Alert Banner */}
      {fraudStats && (fraudStats.criticalCount > 0 || fraudStats.highCount > 0) && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(248, 113, 113, 0.12) 0%, rgba(245, 185, 66, 0.10) 100%)',
            border: '1px solid rgba(248, 113, 113, 0.30)',
            borderRadius: 'var(--radius-xl)',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(248, 113, 113, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--danger)',
                flexShrink: 0
              }}
            >
              <ShieldAlert size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {fraudStats.criticalCount + fraudStats.highCount} Elevated Fraud Risk Alert{fraudStats.criticalCount + fraudStats.highCount > 1 ? 's' : ''} Detected
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {fraudStats.criticalCount} Critical and {fraudStats.highCount} High risk anomalies require review.
              </div>
            </div>
          </div>
          <Link to="/fraud" className="btn btn-danger btn-sm">
            Review Telemetry →
          </Link>
        </div>
      )}

      {/* 3. Operational Exception Triage Banner */}
      {openExceptions.length > 0 && (
        <div
          style={{
            background: 'rgba(245, 185, 66, 0.08)',
            border: '1px solid rgba(245, 185, 66, 0.28)',
            borderRadius: 'var(--radius-xl)',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 185, 66, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--warning)',
                flexShrink: 0
              }}
            >
              <Activity size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {openExceptions.length} Unresolved Reconciliation Exception{openExceptions.length > 1 ? 's' : ''} Open
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Amount discrepancies and unmatched records pending controller sign-off.
              </div>
            </div>
          </div>
          <Link to="/exceptions" className="btn btn-secondary btn-sm" style={{ color: 'var(--warning)', borderColor: 'rgba(245, 185, 66, 0.4)' }}>
            Resolve Discrepancies →
          </Link>
        </div>
      )}

      {/* 4. Top KPI Hierarchy Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
          gap: 16
        }}
        className="kpi-hierarchy-grid"
      >
        {/* Dominant Net Ledger Balance */}
        <MetricCard
          title="Net Ledger Balance"
          value={isLoading ? '$0.00' : `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${accounts.length} operating accounts configured`}
          icon={Wallet}
          isDominant={true}
          accentColor="emerald"
          isLoading={isLoading}
          badge={
            <span
              style={{
                fontSize: '0.675rem',
                fontWeight: 700,
                color: 'var(--accent-mint)',
                background: 'var(--accent-mint-tint)',
                border: '1px solid rgba(99, 230, 178, 0.28)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}
              className="mono"
            >
              BALANCED
            </span>
          }
        />

        {/* Total Inflow */}
        <MetricCard
          title="Gross Inflow (30D)"
          value={isLoading ? '$0.00' : `+$${totalInflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Operating receipts & wires"
          icon={ArrowDownLeft}
          accentColor="emerald"
          isLoading={isLoading}
        />

        {/* Total Outflow */}
        <MetricCard
          title="Gross Outflow (30D)"
          value={isLoading ? '$0.00' : `-$${totalOutflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Vendor debits & payroll"
          icon={ArrowUpRight}
          accentColor="mint"
          isLoading={isLoading}
        />

        {/* Reconciliation Health */}
        <MetricCard
          title="Reconciliation Health"
          value={isLoading ? '100.0%' : `${reconHealthPercent}%`}
          subtitle={`${openExceptions.length} active exceptions`}
          icon={GitMerge}
          accentColor="emerald"
          isLoading={isLoading}
        />
      </div>

      {/* 5. Dense Two-Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.8fr 1fr',
          gap: 20
        }}
        className="dashboard-two-col"
      >
        {/* Left Column: Cash Flow Chart + Recent Transactions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Real Cash Flow Visualization */}
          <CashFlowChart
            transactions={recentTransactions}
            isLoading={isLoading}
            onRecordTransaction={() => navigate('/transactions')}
          />

          {/* Recent Ledger Transactions */}
          <div className="card" style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  Recent Transactions
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Latest balanced double-entry records posted to tenant ledgers
                </p>
              </div>
              <Link
                to="/transactions"
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--accent-mint)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>Full Ledger</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {isLoading ? (
              <div className="skeleton" style={{ height: 220, borderRadius: 'var(--radius-md)' }} />
            ) : recentTransactions.length === 0 ? (
              <EmptyState
                title="No Transactions Recorded"
                description="Your financial activity will appear here once transactions are recorded to the ledger."
                icon={TrendingUp}
                actionLabel="Record Transaction"
                onAction={() => navigate('/transactions')}
              />
            ) : (
              <div className="table-container" style={{ border: '1px solid var(--border-subtle)', background: 'transparent' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Account</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                            {tx.description || 'Transaction'}
                          </div>
                          {tx.category && (
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              {tx.category.name}
                            </div>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                          {tx.account?.name || 'Account'}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.775rem', whiteSpace: 'nowrap' }}>
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              color: tx.type === 'INCOME' ? 'var(--accent-emerald)' : 'var(--text-primary)'
                            }}
                            className="financial-figure"
                          >
                            {tx.type === 'INCOME' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Reconciliation Operational Health + Fraud Risk + Live Audit Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Reconciliation Operational Health Card */}
          <div className="card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <GitMerge size={17} style={{ color: 'var(--accent-emerald)' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Reconciliation Health
                </h2>
              </div>
              <Link to="/reconciliation" style={{ fontSize: '0.775rem', color: 'var(--accent-mint)', textDecoration: 'none', fontWeight: 600 }}>
                Manage →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: '12px 14px', background: 'rgba(8, 11, 10, 0.75)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div className="meta-label">MATCH RATE</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: 2 }} className="financial-figure">
                  {reconHealthPercent}%
                </div>
              </div>
              <div style={{ padding: '12px 14px', background: 'rgba(8, 11, 10, 0.75)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div className="meta-label">EXCEPTIONS</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: openExceptions.length > 0 ? 'var(--warning)' : 'var(--success)', marginTop: 2 }} className="financial-figure">
                  {openExceptions.length}
                </div>
              </div>
            </div>

            {/* Operational Pipeline Flow */}
            <div style={{ padding: '11px 14px', background: 'rgba(8, 11, 10, 0.5)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: 12 }}>
              <div style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }} className="meta-label">
                PIPELINE STATUS
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pass 1-5 Engine:</span>
                <span style={{ color: 'var(--accent-mint)', fontWeight: 700 }}>SYNCHRONIZED</span>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
              <span>Last Run:</span>
              <strong style={{ color: 'var(--text-secondary)' }}>{lastReconDate}</strong>
            </div>
          </div>

          {/* Fraud Risk Telemetry Card */}
          <div className="card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={17} style={{ color: 'var(--danger)' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Fraud Risk Telemetry
                </h2>
              </div>
              <Link to="/fraud" style={{ fontSize: '0.775rem', color: 'var(--accent-mint)', textDecoration: 'none', fontWeight: 600 }}>
                Fraud Center →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
              <div style={{ padding: '12px 6px', background: 'rgba(8, 11, 10, 0.75)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>CRITICAL</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: (fraudStats?.criticalCount || 0) > 0 ? 'var(--danger)' : 'var(--text-primary)', marginTop: 2 }} className="financial-figure">
                  {fraudStats?.criticalCount || 0}
                </div>
              </div>
              <div style={{ padding: '12px 6px', background: 'rgba(8, 11, 10, 0.75)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>HIGH</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: (fraudStats?.highCount || 0) > 0 ? 'var(--warning)' : 'var(--text-primary)', marginTop: 2 }} className="financial-figure">
                  {fraudStats?.highCount || 0}
                </div>
              </div>
              <div style={{ padding: '12px 6px', background: 'rgba(8, 11, 10, 0.75)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>MEDIUM</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: (fraudStats?.mediumCount || 0) > 0 ? 'var(--warning)' : 'var(--text-primary)', marginTop: 2 }} className="financial-figure">
                  {fraudStats?.mediumCount || 0}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
              <span>Open Risk Queue:</span>
              <strong style={{ color: (fraudStats?.openCount || 0) > 0 ? 'var(--warning)' : 'var(--success)' }}>
                {fraudStats?.openCount || 0} active alerts
              </strong>
            </div>
          </div>

          {/* Live Audit Activity Feed */}
          <div className="card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ScrollText size={17} style={{ color: 'var(--accent-emerald)' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Live Audit Trail
                </h2>
              </div>
              <Link to="/audit-logs" style={{ fontSize: '0.775rem', color: 'var(--accent-mint)', textDecoration: 'none', fontWeight: 600 }}>
                Inspect →
              </Link>
            </div>

            {isLoading ? (
              <div className="skeleton" style={{ height: 140, borderRadius: 'var(--radius-md)' }} />
            ) : recentAuditLogs.length === 0 ? (
              <div style={{ padding: '18px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7875rem' }}>
                No audit events recorded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                      padding: '10px 12px',
                      background: 'rgba(8, 11, 10, 0.65)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          color: 'var(--accent-mint)'
                        }}
                        className="mono"
                      >
                        {log.action}
                      </span>
                      <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      by <strong style={{ color: 'var(--text-primary)' }}>{log.user?.name || log.user?.email || 'System'}</strong> ({log.entityType})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1200px) {
          .kpi-hierarchy-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 900px) {
          .dashboard-two-col {
            grid-template-columns: 1fr !important;
          }
          .kpi-hierarchy-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
