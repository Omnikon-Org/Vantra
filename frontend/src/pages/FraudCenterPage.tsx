import React, { useEffect, useState } from 'react';
import { fraudApi } from '../api/client';
import { FraudAlert, FraudStats } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge, Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { SkeletonTable } from '../components/common/Skeleton';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Clock,
  Eye,
  CheckCircle2,
  Scan,
  Sparkles,
  Search,
  Filter,
  Check,
  XCircle,
  ShieldCheck,
  Building2,
  Lock,
  ArrowRight
} from 'lucide-react';

export const FraudCenterPage: React.FC = () => {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [stats, setStats] = useState<FraudStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 15;

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [search, setSearch] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Selected Alert for Details Modal
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [alertsRes, statsRes] = await Promise.all([
        fraudApi.listAlerts({
          page,
          limit,
          status: statusFilter || undefined,
          severity: severityFilter || undefined,
        }),
        fraudApi.getStats()
      ]);

      let list = alertsRes.alerts || [];
      if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter(a =>
          a.id.toLowerCase().includes(q) ||
          (a.transaction?.description && a.transaction.description.toLowerCase().includes(q)) ||
          (a.transaction?.account?.name && a.transaction.account.name.toLowerCase().includes(q)) ||
          a.reasons.some(r => r.toLowerCase().includes(q))
        );
      }

      setAlerts(list);
      setTotal(alertsRes.total || 0);
      setStats(statsRes.stats || null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch fraud telemetry');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, statusFilter, severityFilter, search]);

  const handleRunBatchScan = async () => {
    setIsScanning(true);
    setError(null);
    try {
      const res = await fraudApi.analyzeBatch();
      setSuccessMsg(`Fraud batch scan completed: Analyzed ${res.analyzedCount} transactions, flagged ${res.alertsCreated} alerts.`);
      setTimeout(() => setSuccessMsg(null), 5000);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to execute batch fraud scan');
    } finally {
      setIsScanning(false);
    }
  };

  const handleOpenAlert = async (alert: FraudAlert) => {
    try {
      const res = await fraudApi.getAlertById(alert.id);
      setSelectedAlert(res.alert);
      setReviewNotes(res.alert.reviewNotes || '');
      setIsDetailModalOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load alert details');
    }
  };

  const handleReviewAlert = async () => {
    if (!selectedAlert) return;
    setIsSubmittingAction(true);
    try {
      const res = await fraudApi.reviewAlert(selectedAlert.id, { notes: reviewNotes });
      setSelectedAlert(res.alert);
      setSuccessMsg('Alert status moved to In Review');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to update alert');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleResolveAlert = async (resolutionStatus: 'CONFIRMED' | 'DISMISSED' | 'RESOLVED') => {
    if (!selectedAlert) return;
    if (!reviewNotes.trim()) {
      setError('Please provide resolution notes before closing an alert.');
      return;
    }

    setIsSubmittingAction(true);
    setError(null);
    try {
      const res = await fraudApi.resolveAlert(selectedAlert.id, {
        status: resolutionStatus,
        resolutionNotes: reviewNotes.trim()
      });
      setSelectedAlert(res.alert);
      setSuccessMsg(`Alert marked as ${resolutionStatus}`);
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to resolve alert');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--danger)';
    if (score >= 60) return '#F97316';
    if (score >= 30) return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <PageHeader
        eyebrow="RISK INTELLIGENCE"
        title={<>Fraud <em>Telemetry</em> Center</>}
        subtitle="Deterministic risk scoring, velocity rule triggers, and active transaction anomaly queue"
        badge={
          <span
            style={{
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              background: (stats?.criticalCount || 0) > 0 ? 'var(--danger-bg)' : 'var(--accent-gold-tint)',
              color: (stats?.criticalCount || 0) > 0 ? 'var(--danger)' : 'var(--accent-gold)',
              fontSize: '0.725rem',
              fontWeight: 700,
              border: `1px solid ${(stats?.criticalCount || 0) > 0 ? 'var(--danger-border)' : 'rgba(212, 165, 72, 0.28)'}`
            }}
            className="mono"
          >
            {stats?.openCount || 0} OPEN ALERTS
          </span>
        }
        actions={
          <button className="btn btn-primary" onClick={handleRunBatchScan} disabled={isScanning}>
            <Scan size={15} />
            <span>{isScanning ? 'Running Scan...' : 'Run Fraud Scan'}</span>
          </button>
        }
      />

      {/* Success / Error Banners */}
      {successMsg && (
        <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--success)', fontSize: '0.875rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && !isDetailModalOpen && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--danger)', fontSize: '0.875rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Risk KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        <MetricCard
          title="Active Fraud Alerts"
          value={stats ? stats.openCount : 0}
          subtitle="Open risk investigations"
          icon={ShieldAlert}
          accentColor="amber"
          isLoading={isLoading}
        />
        <MetricCard
          title="Critical Risk"
          value={stats ? stats.criticalCount : 0}
          subtitle="Scores 80–100 require action"
          icon={Flame}
          accentColor="red"
          isLoading={isLoading}
        />
        <MetricCard
          title="High Risk"
          value={stats ? stats.highCount : 0}
          subtitle="Scores 60–79 under review"
          icon={AlertTriangle}
          accentColor="amber"
          isLoading={isLoading}
        />
        <MetricCard
          title="Avg Risk Score"
          value={stats ? `${stats.avgRiskScore.toFixed(0)}/100` : '0/100'}
          subtitle="Evaluated across all accounts"
          icon={ShieldCheck}
          accentColor="gold"
          isLoading={isLoading}
        />
      </div>

      {/* Severity Scale Legend Bar */}
      <div
        className="card"
        style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="meta-label">RISK SEVERITY SPECTRUM:</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Low (0–29)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warning)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Medium (30–59)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F97316' }} />
            <span style={{ color: 'var(--text-secondary)' }}>High (60–79)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)' }} />
            <span style={{ color: 'var(--danger)', fontWeight: 700 }}>Critical (80–100)</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: 34, fontSize: '0.825rem' }}
            placeholder="Search alert ID, transaction description, account name, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ width: 160 }}>
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>

        <div style={{ width: 170 }}>
          <select
            className="select"
            value={severityFilter}
            onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      {isLoading ? (
        <SkeletonTable rows={7} columns={6} />
      ) : alerts.length === 0 ? (
        <EmptyState
          title="No Suspicious Activity Detected"
          description={search || statusFilter || severityFilter ? "No alerts match the selected filter criteria." : "All transactions have cleared deterministic fraud rules with zero compound risks."}
          icon={ShieldCheck}
          actionLabel="Run Scan Now"
          onAction={handleRunBatchScan}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Risk Score</th>
                <th>Severity</th>
                <th>Transaction</th>
                <th>Account</th>
                <th>Rule Reasons</th>
                <th>Status</th>
                <th>Detected At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          fontWeight: 900,
                          fontSize: '0.95rem',
                          color: getScoreColor(alert.riskScore)
                        }}
                        className="financial-figure"
                      >
                        {alert.riskScore}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ 100</span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={alert.severity} />
                  </td>
                  <td>
                    {alert.transaction ? (
                      <div>
                        <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.85rem' }}>
                          ${Number(alert.transaction.amount).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          {alert.transaction.description || 'Transaction'}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {alert.transaction?.account?.name || 'Account'}
                  </td>
                  <td style={{ fontSize: '0.7875rem', maxWidth: 280 }}>
                    <div style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {alert.reasons.slice(0, 2).map((r, i) => (
                        <div key={i} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          • {r}
                        </div>
                      ))}
                      {alert.reasons.length > 2 && (
                        <span style={{ fontSize: '0.675rem', color: 'var(--accent-teal)' }}>
                          +{alert.reasons.length - 2} more rules
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={alert.status} />
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.775rem', whiteSpace: 'nowrap' }}>
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenAlert(alert)}
                    >
                      <Eye size={13} />
                      <span>Investigate</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && total > limit && (
        <Pagination
          page={page}
          total={total}
          limit={limit}
          onPageChange={(p) => setPage(p)}
        />
      )}

      {/* Alert Investigation & Resolution Modal */}
      {selectedAlert && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Fraud Risk Investigation"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Risk Header Strip */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(4, 8, 17, 0.7)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)' }}>
              <div>
                <span className="meta-label">RISK SCORE</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: getScoreColor(selectedAlert.riskScore), marginTop: 2 }} className="financial-figure">
                  {selectedAlert.riskScore} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="meta-label">SEVERITY LEVEL</span>
                <div style={{ marginTop: 4 }}><StatusBadge status={selectedAlert.severity} /></div>
              </div>
            </div>

            {/* Triggered Reasons Breakdown */}
            <div>
              <span className="meta-label">TRIGGERED DETERMINISTIC RULES</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                {selectedAlert.reasons.map((r, i) => (
                  <div key={i} style={{ padding: '8px 12px', background: 'rgba(4, 8, 17, 0.5)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-secondary)', fontSize: '0.8rem', color: '#FFFFFF' }}>
                    {r}
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction Data */}
            {selectedAlert.transaction && (
              <div style={{ padding: '12px 14px', background: 'rgba(4, 8, 17, 0.45)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)' }}>
                <span className="meta-label">TRANSACTION TELEMETRY</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {selectedAlert.transaction.description || 'Transaction'}
                  </span>
                  <strong style={{ color: '#FFFFFF' }} className="financial-figure">
                    ${Number(selectedAlert.transaction.amount).toFixed(2)}
                  </strong>
                </div>
              </div>
            )}

            {/* Review Notes Area */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Investigation Notes & Resolution Audit
              </label>
              <textarea
                className="textarea"
                rows={3}
                placeholder="Document your compliance review, authorization notes, or false-positive rationale..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, flexWrap: 'wrap', gap: 8 }}>
              {selectedAlert.status === 'OPEN' && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleReviewAlert}
                  disabled={isSubmittingAction}
                >
                  Mark In Review
                </button>
              )}

              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleResolveAlert('DISMISSED')}
                  disabled={isSubmittingAction}
                >
                  Dismiss (False Positive)
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleResolveAlert('RESOLVED')}
                  disabled={isSubmittingAction}
                >
                  Confirm & Resolve
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
