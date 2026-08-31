import React, { useEffect, useState } from 'react';
import { fraudApi } from '../api/client';
import { FraudAlert, FraudStats } from '../types';
import { KPICard } from '../components/common/KPICard';
import { StatusBadge, Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
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
  Lock
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
      setSuccessMsg('Alert marked as in review');
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
      setError('Please provide resolution notes before resolving or dismissing an alert.');
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
    if (score >= 60) return '#F97316'; // Orange / High
    if (score >= 30) return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Fraud Detection
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Monitor suspicious financial activity, high-velocity transactions, and explainable risk scores
          </p>
        </div>

        <button className="btn btn-teal" onClick={handleRunBatchScan} disabled={isScanning}>
          <Scan size={15} />
          <span>{isScanning ? 'Running Scan...' : 'Run Fraud Scan'}</span>
        </button>
      </div>

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

      {/* 4 KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <KPICard
          title="Active Fraud Alerts"
          value={stats ? stats.openCount : 0}
          subtitle="Open risk investigations"
          icon={ShieldAlert}
          accentColor="amber"
          isLoading={isLoading}
        />
        <KPICard
          title="Critical Risk"
          value={stats ? stats.criticalCount : 0}
          subtitle="Scores 80–100 require action"
          icon={Flame}
          accentColor="amber"
          isLoading={isLoading}
        />
        <KPICard
          title="High Risk"
          value={stats ? stats.highCount : 0}
          subtitle="Scores 60–79 under review"
          icon={AlertTriangle}
          accentColor="amber"
          isLoading={isLoading}
        />
        <KPICard
          title="Under Review"
          value={stats ? stats.inReviewCount : 0}
          subtitle="Assigned to analysts"
          icon={Clock}
          accentColor="cyan"
          isLoading={isLoading}
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
        {/* Search */}
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Search alert ID, transaction description, account..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ width: 170 }}>
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="CONFIRMED">Confirmed Fraud</option>
            <option value="DISMISSED">Dismissed</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div style={{ width: 170 }}>
          <select
            className="select"
            value={severityFilter}
            onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical (80–100)</option>
            <option value="HIGH">High (60–79)</option>
            <option value="MEDIUM">Medium (30–59)</option>
            <option value="LOW">Low (0–29)</option>
          </select>
        </div>
      </div>

      {/* Fraud Alert Table */}
      {isLoading ? (
        <div className="card skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
      ) : alerts.length === 0 ? (
        <EmptyState
          title="No Suspicious Activity Detected"
          description="Vantra has not identified any transactions requiring fraud review."
          icon={ShieldCheck}
          actionLabel="Run Fraud Scan"
          onAction={handleRunBatchScan}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Transaction</th>
                <th>Account</th>
                <th>Amount</th>
                <th>Risk Score</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Date Flagged</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id}>
                  <td style={{ fontWeight: 700, color: 'var(--accent-teal)', fontSize: '0.825rem' }} className="mono">
                    #{alert.id.slice(0, 8)}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.875rem' }}>
                      {alert.transaction?.description || 'Transaction'}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {alert.reasons.length} risk factor{alert.reasons.length > 1 ? 's' : ''} triggered
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {alert.transaction?.account?.name || 'Account'}
                  </td>
                  <td style={{ fontWeight: 700 }} className="financial-figure">
                    ${Number(alert.transaction?.amount || 0).toFixed(2)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 48,
                          height: 6,
                          background: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            width: `${alert.riskScore}%`,
                            height: '100%',
                            background: getScoreColor(alert.riskScore),
                            borderRadius: 'var(--radius-full)'
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '0.875rem',
                          color: getScoreColor(alert.riskScore)
                        }}
                        className="financial-figure"
                      >
                        {alert.riskScore}
                      </span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={alert.severity} />
                  </td>
                  <td>
                    <StatusBadge status={alert.status} />
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenAlert(alert)}
                    >
                      <Eye size={13} />
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />

      {/* Fraud Alert Details Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Fraud Risk Investigation #${selectedAlert?.id.slice(0, 8)}`} maxWidth="760px">
        {selectedAlert && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {error && (
              <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--danger)', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            {/* Top Score Banner */}
            <div
              style={{
                background: 'rgba(6, 11, 20, 0.75)',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 'var(--radius-md)',
                    background: `${getScoreColor(selectedAlert.riskScore)}15`,
                    border: `1px solid ${getScoreColor(selectedAlert.riskScore)}40`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: getScoreColor(selectedAlert.riskScore)
                  }}
                >
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, lineHeight: 1 }} className="financial-figure">
                    {selectedAlert.riskScore}
                  </span>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', marginTop: 2 }}>
                    SCORE
                  </span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                      {selectedAlert.severity} RISK ALERT
                    </h3>
                    <StatusBadge status={selectedAlert.status} />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Flagged on {new Date(selectedAlert.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  TRANSACTION AMOUNT
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF' }} className="financial-figure">
                  ${Number(selectedAlert.transaction?.amount || 0).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Explainable Reasons Section */}
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={16} style={{ color: getScoreColor(selectedAlert.riskScore) }} />
                <span>Explainable Fraud Indicators ({selectedAlert.reasons.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedAlert.reasons.map((reason, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-secondary)',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8
                    }}
                  >
                    <span style={{ color: getScoreColor(selectedAlert.riskScore), fontWeight: 800 }}>•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction Metadata Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, padding: 14, background: 'rgba(6, 11, 20, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ACCOUNT</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>{selectedAlert.transaction?.account?.name || 'Account'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TYPE</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>{selectedAlert.transaction?.type}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>VALUE DATE</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>
                  {new Date(selectedAlert.transaction?.transactionAt || selectedAlert.transaction?.createdAt || '').toLocaleDateString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>STATUS</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>{selectedAlert.transaction?.status}</div>
              </div>
            </div>

            {/* Review Notes / Resolution Box */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Auditor Resolution & Investigation Notes
              </label>
              <textarea
                className="textarea"
                rows={3}
                placeholder="Enter justification, customer verification confirmation, or false-positive notes..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, borderTop: '1px solid var(--border-secondary)', paddingTop: 16 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleReviewAlert}
                  disabled={isSubmittingAction || selectedAlert.status === 'IN_REVIEW'}
                >
                  <Clock size={14} />
                  Mark In Review
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleResolveAlert('DISMISSED')}
                  disabled={isSubmittingAction}
                >
                  <XCircle size={14} />
                  Dismiss (False Positive)
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleResolveAlert('CONFIRMED')}
                  disabled={isSubmittingAction}
                >
                  <Flame size={14} />
                  Confirm Fraud
                </button>
                <button
                  type="button"
                  className="btn btn-teal btn-sm"
                  onClick={() => handleResolveAlert('RESOLVED')}
                  disabled={isSubmittingAction}
                >
                  <CheckCircle2 size={14} />
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
