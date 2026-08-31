import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountsApi, transactionsApi, reconciliationApi, exceptionsApi, auditLogsApi, fraudApi } from '../api/client';
import { Account, Transaction, Reconciliation, ReconciliationException, AuditLog, FraudStats } from '../types';
import { KPICard } from '../components/common/KPICard';
import { StatusBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  GitMerge,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  Clock,
  Shield,
  ShieldAlert,
  Flame,
  PlusCircle,
  Play,
  Building2,
  ScrollText,
  Activity,
  DollarSign
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
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [accRes, txRes, reconRes, excRes, auditRes, fraudRes] = await Promise.all([
          accountsApi.list(),
          transactionsApi.list({ limit: 6 }),
          reconciliationApi.list({ limit: 5 }),
          exceptionsApi.list({ status: 'OPEN', limit: 5 }),
          auditLogsApi.list({ limit: 5 }),
          fraudApi.getStats()
        ]);

        setAccounts(accRes.accounts || []);
        setRecentTransactions(txRes.transactions || []);
        setReconciliations(reconRes.reconciliations || []);
        setOpenExceptions(excRes.exceptions || []);
        setRecentAuditLogs(auditRes.auditLogs || []);
        setFraudStats(fraudRes.stats || null);
      } catch (err) {
        console.error('Failed to load dashboard telemetry:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute Financial Aggregates
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
      {/* Top Header Command Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              {getGreeting()}, {user?.name || user?.email?.split('@')[0]}
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(20, 184, 166, 0.12)',
                border: '1px solid rgba(20, 184, 166, 0.3)',
                color: 'var(--accent-teal)',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-teal)' }} />
              <span>{user?.tenant?.name || 'Acme Finance Corp'}</span>
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Institutional command center — double-entry ledgers, automated reconciliation, and fraud risk telemetry
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/transactions" className="btn btn-secondary btn-sm">
            <PlusCircle size={15} style={{ color: 'var(--accent-teal)' }} />
            <span>+ New Transaction</span>
          </Link>
          <Link to="/reconciliation" className="btn btn-teal btn-sm">
            <Play size={14} />
            <span>Run Reconciliation</span>
          </Link>
        </div>
      </div>

      {/* Critical Fraud Risk Alert Banner */}
      {fraudStats && (fraudStats.criticalCount > 0 || fraudStats.highCount > 0) && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.16) 0%, rgba(245, 158, 11, 0.16) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 'var(--radius-lg)',
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
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--danger)'
              }}
            >
              <ShieldAlert size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>
                {fraudStats.criticalCount + fraudStats.highCount} High/Critical Fraud Risk Alert{fraudStats.criticalCount + fraudStats.highCount > 1 ? 's' : ''} Detected
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {fraudStats.criticalCount} Critical and {fraudStats.highCount} High-risk anomalies require immediate officer review.
              </div>
            </div>
          </div>
          <Link to="/fraud" className="btn btn-sm btn-danger">
            View Fraud Center →
          </Link>
        </div>
      )}

      {/* Discrepancy Exception Alert Banner */}
      {openExceptions.length > 0 && (!fraudStats || (fraudStats.criticalCount === 0 && fraudStats.highCount === 0)) && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(239, 68, 68, 0.12) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: 'var(--radius-lg)',
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
                background: 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F59E0B'
              }}
            >
              <AlertOctagon size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>
                {openExceptions.length} Unresolved Reconciliation Exception{openExceptions.length > 1 ? 's' : ''} Detected
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Differences require accountant approval to ensure ledger consistency and audit closure.
              </div>
            </div>
          </div>
          <Link to="/exceptions" className="btn btn-sm btn-secondary" style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#FFFFFF' }}>
            Review Exceptions →
          </Link>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20
        }}
      >
        <KPICard
          title="Net Ledger Balance"
          value={isLoading ? '$0.00' : `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Aggregated across active accounts"
          icon={Wallet}
          accentColor="teal"
          isLoading={isLoading}
        />
        <KPICard
          title="Total Inflow (30D)"
          value={isLoading ? '$0.00' : `+$${totalInflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Operating credits & receipts"
          icon={ArrowDownLeft}
          accentColor="emerald"
          isLoading={isLoading}
        />
        <KPICard
          title="Total Outflow (30D)"
          value={isLoading ? '$0.00' : `-$${totalOutflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Operating expenses & wires"
          icon={ArrowUpRight}
          accentColor="cyan"
          isLoading={isLoading}
        />
        <KPICard
          title="Reconciliation Health"
          value={isLoading ? '100.0%' : `${reconHealthPercent}%`}
          subtitle={`${openExceptions.length} active variance exceptions`}
          icon={GitMerge}
          accentColor="teal"
          isLoading={isLoading}
        />
      </div>

      {/* Cash Flow Movement & Telemetry Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 24
        }}
        className="dashboard-two-col"
      >
        {/* Left Column: Cash Flow Overview & Recent Ledger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Cash Flow Movement Card */}
          <div className="card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Cash Flow Movement
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Net capital velocity and double-entry balance distribution
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', fontWeight: 600 }}>
                Real-Time Settlement
              </span>
            </div>

            {/* Inflow vs Outflow Visual Progress Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Operating Inflow</span>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>+${totalInflow.toFixed(2)}</span>
                </div>
                <div style={{ height: 8, width: '100%', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: totalInflow > 0 ? '75%' : '0%', background: 'linear-gradient(90deg, #10B981, #14B8A6)', borderRadius: 'var(--radius-full)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Operating Outflow</span>
                  <span style={{ color: '#FFFFFF', fontWeight: 700 }}>-${totalOutflow.toFixed(2)}</span>
                </div>
                <div style={{ height: 8, width: '100%', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: totalOutflow > 0 ? '35%' : '0%', background: 'linear-gradient(90deg, #06B6D4, #38BDF8)', borderRadius: 'var(--radius-full)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions Card */}
          <div className="card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Recent Transactions
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Latest balanced journal entries posted to tenant ledgers
                </p>
              </div>
              <Link to="/transactions" style={{ fontSize: '0.8125rem', color: 'var(--accent-teal)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>View all ledger</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {isLoading ? (
              <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-md)' }} />
            ) : recentTransactions.length === 0 ? (
              <EmptyState
                title="No Transactions Recorded"
                description="Your financial activity will appear here once transactions are recorded to the ledger."
                icon={TrendingUp}
                actionLabel="Record Transaction"
                onAction={() => navigate('/transactions')}
              />
            ) : (
              <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
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
                          <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.875rem' }}>
                            {tx.description || 'Transaction'}
                          </div>
                          {tx.category && (
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                              {tx.category.name}
                            </div>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                          {tx.account?.name || 'Account'}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              color: tx.type === 'INCOME' ? 'var(--success)' : '#FFFFFF'
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

        {/* Right Column: Fraud Risk Telemetry, Reconciliation Health & Live Audit Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Fraud Risk Telemetry Widget */}
          <div className="card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={18} style={{ color: 'var(--danger)' }} />
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Fraud Risk Telemetry
                </h2>
              </div>
              <Link to="/fraud" style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', textDecoration: 'none', fontWeight: 600 }}>
                Fraud Center →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
              <div style={{ padding: '10px 8px', background: 'rgba(6, 11, 20, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CRITICAL</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: (fraudStats?.criticalCount || 0) > 0 ? 'var(--danger)' : '#FFFFFF', marginTop: 2 }}>
                  {fraudStats?.criticalCount || 0}
                </div>
              </div>
              <div style={{ padding: '10px 8px', background: 'rgba(6, 11, 20, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>HIGH</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: (fraudStats?.highCount || 0) > 0 ? '#F97316' : '#FFFFFF', marginTop: 2 }}>
                  {fraudStats?.highCount || 0}
                </div>
              </div>
              <div style={{ padding: '10px 8px', background: 'rgba(6, 11, 20, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MEDIUM</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: (fraudStats?.mediumCount || 0) > 0 ? 'var(--warning)' : '#FFFFFF', marginTop: 2 }}>
                  {fraudStats?.mediumCount || 0}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-secondary)', paddingTop: 10 }}>
              <span>Total Open Alerts:</span>
              <strong style={{ color: (fraudStats?.openCount || 0) > 0 ? 'var(--warning)' : 'var(--success)' }}>
                {fraudStats?.openCount || 0} alerts
              </strong>
            </div>
          </div>

          {/* Reconciliation Health Card */}
          <div className="card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
                Reconciliation Health
              </h2>
              <GitMerge size={18} style={{ color: 'var(--accent-teal)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div style={{ padding: 10, background: 'rgba(6, 11, 20, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)' }}>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MATCHED RATIO</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-teal)', marginTop: 2 }}>
                  {reconHealthPercent}%
                </div>
              </div>
              <div style={{ padding: 10, background: 'rgba(6, 11, 20, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)' }}>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>EXCEPTIONS</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: openExceptions.length > 0 ? 'var(--warning)' : 'var(--success)', marginTop: 2 }}>
                  {openExceptions.length}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-secondary)', paddingTop: 10 }}>
              <span>Last Reconciliation:</span>
              <strong style={{ color: 'var(--text-secondary)' }}>{lastReconDate}</strong>
            </div>
          </div>

          {/* Live Audit Activity Stream */}
          <div className="card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ScrollText size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Live Audit Activity
                </h2>
              </div>
              <Link to="/audit-logs" style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', textDecoration: 'none', fontWeight: 600 }}>
                View all →
              </Link>
            </div>

            {isLoading ? (
              <div className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-md)' }} />
            ) : recentAuditLogs.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No audit events recorded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      padding: '10px 12px',
                      background: 'rgba(6, 11, 20, 0.5)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-secondary)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: 'var(--accent-teal)'
                        }}
                        className="mono"
                      >
                        {log.action}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      by <strong style={{ color: '#FFFFFF' }}>{log.user?.name || log.user?.email || 'System'}</strong> ({log.entityType})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .dashboard-two-col {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
