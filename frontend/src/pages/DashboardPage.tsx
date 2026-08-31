import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  accountsApi,
  transactionsApi,
  reconciliationApi,
  exceptionsApi,
  auditLogsApi
} from '../api/client';
import {
  Account,
  Transaction,
  Reconciliation,
  ReconciliationException,
  AuditLog
} from '../types';
import { KPICard } from '../components/common/KPICard';
import { StatusBadge } from '../components/common/Badge';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  GitCompare,
  AlertOctagon,
  ScrollText,
  PlusCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [exceptions, setExceptions] = useState<ReconciliationException[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [accRes, txRes, reconRes, excRes, auditRes] = await Promise.all([
          accountsApi.list().catch(() => ({ success: true, accounts: [] })),
          transactionsApi.list({ limit: 8 }).catch(() => ({ success: true, transactions: [], total: 0, page: 1, limit: 8 })),
          reconciliationApi.list({ limit: 5 }).catch(() => ({ success: true, reconciliations: [], total: 0, page: 1, limit: 5 })),
          exceptionsApi.list({ limit: 5 }).catch(() => ({ success: true, exceptions: [], total: 0, page: 1, limit: 5 })),
          auditLogsApi.list({ limit: 6 }).catch(() => ({ success: true, auditLogs: [], total: 0, page: 1, limit: 6 }))
        ]);

        setAccounts(accRes.accounts || []);
        setTransactions(txRes.transactions || []);
        setReconciliations(reconRes.reconciliations || []);
        setExceptions(excRes.exceptions || []);
        setAuditLogs(auditRes.auditLogs || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load financial dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Financial Metrics safely derived from verified API data
  const totalBalance = accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
  
  const totalInflow = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalOutflow = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const openExceptions = exceptions.filter(e => e.status === 'OPEN');
  const latestRecon = reconciliations[0];

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Top Greeting & Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            {getGreeting()}, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Accountant'}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Here's what's happening across your financial operations.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/transactions" className="btn btn-teal btn-sm">
            <PlusCircle size={15} />
            New Transaction
          </Link>
          <Link to="/reconciliation" className="btn btn-secondary btn-sm">
            <GitCompare size={15} />
            Run Reconciliation
          </Link>
        </div>
      </div>

      {/* Real-time Exception Alert Banner if open exceptions exist */}
      {openExceptions.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.04) 100%)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--danger-bg)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#FFFFFF' }}>
                {openExceptions.length} Reconciliation Exception{openExceptions.length > 1 ? 's' : ''} Require Review
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Amount variances or unmatched statement records detected in your ledger.
              </div>
            </div>
          </div>
          <Link to="/exceptions" className="btn btn-danger btn-sm">
            Review Exceptions
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card skeleton" style={{ height: 140 }} />
            ))}
          </>
        ) : (
          <>
            <KPICard
              title="Net Ledger Balance"
              value={`$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle={`Across ${accounts.length} active account${accounts.length !== 1 ? 's' : ''}`}
              icon={Wallet}
              variant={totalBalance >= 0 ? 'success' : 'danger'}
            />

            <KPICard
              title="Total Inflow (Income)"
              value={`+$${totalInflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle="Recent ledger credits"
              icon={ArrowDownLeft}
              variant="success"
            />

            <KPICard
              title="Total Outflow (Expenses)"
              value={`-$${totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle="Recent ledger debits"
              icon={ArrowUpRight}
              variant="danger"
            />

            <KPICard
              title="Reconciliation Health"
              value={latestRecon ? `${latestRecon.matchedCount} Matched` : 'No Runs Yet'}
              subtitle={latestRecon ? `${latestRecon.discrepancyCount} variances, ${latestRecon.unmatchedCount} unmatched` : 'Run your first session'}
              icon={GitCompare}
              variant={latestRecon && latestRecon.discrepancyCount > 0 ? 'warning' : 'info'}
            />
          </>
        )}
      </div>

      {/* Split Section: Recent Transactions & Live Audit Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }} className="dashboard-split">
        {/* Recent Transactions Table */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ArrowLeftRight size={18} style={{ color: 'var(--accent-teal)' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
                Recent Transactions
              </h2>
            </div>
            <Link to="/transactions" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-teal)', textDecoration: 'none' }}>
              View Ledger →
            </Link>
          </div>

          {isLoading ? (
            <div className="skeleton" style={{ height: 220, borderRadius: 'var(--radius-md)' }} />
          ) : transactions.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No transactions recorded in the ledger yet. Click 'New Transaction' to begin.
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 6).map((tx) => (
                    <tr key={tx.id}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {new Date(tx.transactionAt).toLocaleDateString()}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {tx.description || 'Transaction'}
                        {tx.reference && (
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                            Ref: {tx.reference}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: tx.type === 'INCOME' ? 'var(--success)' : 'var(--danger)' }}>
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }} className="financial-figure">
                        <span style={{ color: tx.type === 'INCOME' ? 'var(--success)' : '#FFFFFF' }}>
                          {tx.type === 'INCOME' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={tx.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Real-time System Audit Activity */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ScrollText size={18} style={{ color: 'var(--accent-cyan)' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
                Audit Activity
              </h2>
            </div>
            <Link to="/audit-logs" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)', textDecoration: 'none' }}>
              All Logs →
            </Link>
          </div>

          {isLoading ? (
            <div className="skeleton" style={{ height: 220, borderRadius: 'var(--radius-md)' }} />
          ) : auditLogs.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No audit logs captured yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {auditLogs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-teal)' }} className="mono">
                      {log.action}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} />
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {log.entityType} {log.entityId ? `(${log.entityId.slice(0, 8)}...)` : ''}
                  </div>
                  {log.user && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      by {log.user.name || log.user.email}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .dashboard-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
