import React, { useEffect, useState } from 'react';
import { exceptionsApi } from '../api/client';
import { ReconciliationException } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { renderFormattedStatValue } from '../components/common/MetricCard';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { StatusBadge } from '../components/common/Badge';
import { SkeletonTable } from '../components/common/Skeleton';
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Check,
  AlertTriangle,
  FileText,
  ShieldCheck
} from 'lucide-react';

export const ExceptionsPage: React.FC = () => {
  const [exceptions, setExceptions] = useState<ReconciliationException[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 15;

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Detail Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedException, setSelectedException] = useState<ReconciliationException | null>(null);

  // Resolve Modal
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolvingException, setResolvingException] = useState<ReconciliationException | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExceptions = async () => {
    setIsLoading(true);
    try {
      const res = await exceptionsApi.list({
        page,
        limit,
        status: statusFilter || undefined,
        severity: severityFilter || undefined
      });
      setExceptions(res.exceptions || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch exceptions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExceptions();
  }, [page, statusFilter, severityFilter]);

  const handleOpenDetail = (exc: ReconciliationException) => {
    setSelectedException(exc);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = async (id: string, newStatus: 'OPEN' | 'IN_REVIEW' | 'RESOLVED') => {
    try {
      await exceptionsApi.updateStatus(id, { status: newStatus, notes: `Status set to ${newStatus}` });
      setSuccessMsg(`Exception marked as ${newStatus}`);
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchExceptions();
      if (selectedException?.id === id) {
        setIsDetailModalOpen(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleOpenResolve = (exc: ReconciliationException) => {
    setResolvingException(exc);
    setResolutionNotes('');
    setIsResolveModalOpen(true);
  };

  const handleExecuteResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingException || !resolutionNotes.trim()) return;

    setIsSubmitting(true);
    try {
      await exceptionsApi.resolve(resolvingException.id, { resolutionNotes: resolutionNotes.trim() });
      setIsResolveModalOpen(false);
      setSuccessMsg('Exception resolved successfully and recorded to immutable audit log.');
      setTimeout(() => setSuccessMsg(null), 3500);
      fetchExceptions();
      if (selectedException?.id === resolvingException.id) {
        setIsDetailModalOpen(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resolve exception');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCount = exceptions.filter(e => e.status === 'OPEN').length;
  const criticalCount = exceptions.filter(e => e.severity === 'CRITICAL').length;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <PageHeader
        eyebrow="VARIANCE AUDIT"
        title={<>Variance <em>Exceptions</em></>}
        subtitle="Prioritized financial discrepancies, settlement variances, and atomic audit resolutions"
        badge={
          <span
            style={{
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-gold-tint)',
              color: 'var(--accent-gold)',
              fontSize: '0.725rem',
              fontWeight: 700,
              border: '1px solid rgba(212, 165, 72, 0.28)'
            }}
            className="mono"
          >
            {openCount} OPEN QUEUE
          </span>
        }
      />

      {/* Summary KPI Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20
        }}
      >
        <div className="card" style={{ padding: '24px 28px' }}>
          <div className="meta-label">CRITICAL EXCEPTIONS</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: criticalCount > 0 ? 'var(--danger)' : 'var(--text-primary)', marginTop: 4 }} className="financial-figure">
            {criticalCount}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Requires immediate controller review
          </div>
        </div>

        <div className="card" style={{ padding: '24px 28px' }}>
          <div className="meta-label">TOTAL QUEUE VOLUME</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }} className="financial-figure">
            {renderFormattedStatValue(`${total} Items`)}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Filtered variance records
          </div>
        </div>

        <div className="card" style={{ padding: '24px 28px' }}>
          <div className="meta-label">RESOLUTION COMPLIANCE</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--success)', marginTop: 4 }} className="financial-figure">
            {renderFormattedStatValue('100%')}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Mandatory resolution audit notes
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--success)', fontSize: '0.875rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && !isResolveModalOpen && !isDetailModalOpen && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--danger)', fontSize: '0.875rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs & Severity Selector */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(10, 12, 16, 0.75)', padding: 4, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          {[
            { label: 'All Exceptions', value: '' },
            { label: 'Open', value: 'OPEN' },
            { label: 'In Review', value: 'IN_REVIEW' },
            { label: 'Resolved', value: 'RESOLVED' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1); }}
              style={{
                background: statusFilter === tab.value ? 'var(--accent-gold)' : 'transparent',
                color: statusFilter === tab.value ? '#0A0C10' : 'var(--text-secondary)',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.7875rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.16s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Severity Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Filter size={15} style={{ color: 'var(--text-muted)' }} />
          <select
            className="select"
            style={{ width: 170, fontSize: '0.8125rem' }}
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

      {/* Exceptions Table */}
      {isLoading ? (
        <SkeletonTable rows={7} columns={6} />
      ) : exceptions.length === 0 ? (
        <EmptyState
          title="No Exceptions in Queue"
          description={statusFilter || severityFilter ? "No reconciliation exceptions match your active filter parameters." : "All statement runs are balanced with zero pending discrepancy exceptions."}
          icon={CheckCircle2}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Severity</th>
                <th>Exception Type</th>
                <th>Description / Reason</th>
                <th>Variance Amount</th>
                <th>Status</th>
                <th>Date Logged</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exceptions.map((exc) => (
                <tr key={exc.id}>
                  <td>
                    <StatusBadge status={exc.severity} />
                  </td>
                  <td style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF' }}>
                    {exc.exceptionType.replace(/_/g, ' ')}
                  </td>
                  <td style={{ fontSize: '0.825rem', maxWidth: 300 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{exc.description}</div>
                    {exc.transaction && (
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Ref Tx: {exc.transaction.description || 'Transaction'}
                      </div>
                    )}
                  </td>
                  <td>
                    {exc.transaction ? (
                      <span style={{ fontWeight: 800, color: 'var(--warning)', fontSize: '0.875rem' }} className="financial-figure">
                        ${Number(exc.transaction.amount).toFixed(2)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={exc.status} />
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.7875rem', whiteSpace: 'nowrap' }}>
                    {new Date(exc.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenDetail(exc)}
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>

                      {exc.status !== 'RESOLVED' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenResolve(exc)}
                        >
                          <Check size={13} />
                          <span>Resolve</span>
                        </button>
                      )}
                    </div>
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

      {/* Exception Detail Modal */}
      {selectedException && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Exception Investigation"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(4, 8, 17, 0.65)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)' }}>
              <div>
                <span className="meta-label">SEVERITY LEVEL</span>
                <div style={{ marginTop: 4 }}><StatusBadge status={selectedException.severity} /></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="meta-label">STATUS</span>
                <div style={{ marginTop: 4 }}><StatusBadge status={selectedException.status} /></div>
              </div>
            </div>

            <div>
              <span className="meta-label">DESCRIPTION & ROOT CAUSE</span>
              <p style={{ fontSize: '0.9rem', color: '#FFFFFF', marginTop: 4, lineHeight: 1.5 }}>
                {selectedException.description}
              </p>
            </div>

            {selectedException.transaction && (
              <div style={{ padding: '12px 14px', background: 'rgba(4, 8, 17, 0.5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)' }}>
                <span className="meta-label">ASSOCIATED TRANSACTION</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {selectedException.transaction.description || 'Transaction'}
                  </span>
                  <span style={{ fontWeight: 800, color: '#FFFFFF' }} className="financial-figure">
                    ${Number(selectedException.transaction.amount).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {selectedException.status === 'RESOLVED' && selectedException.resolutionNotes && (
              <div style={{ padding: '12px 14px', background: 'var(--success-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--success-border)' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase' }}>
                  RESOLUTION AUDIT NOTES
                </span>
                <p style={{ fontSize: '0.85rem', color: '#FFFFFF', marginTop: 4 }}>
                  {selectedException.resolutionNotes}
                </p>
              </div>
            )}

            {/* Status Change Buttons */}
            {selectedException.status !== 'RESOLVED' && (
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                {selectedException.status === 'OPEN' && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleUpdateStatus(selectedException.id, 'IN_REVIEW')}
                  >
                    Move to In Review
                  </button>
                )}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleOpenResolve(selectedException)}
                >
                  Resolve Exception
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Resolve Exception Modal */}
      {resolvingException && (
        <Modal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          title="Resolve Exception"
        >
          <form onSubmit={handleExecuteResolve} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Resolving this exception will mark the discrepancy variance as reconciled and record a tamper-proof audit log with your account signature.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Resolution Notes (Mandatory for Audit Compliance)
              </label>
              <textarea
                className="textarea"
                rows={4}
                placeholder="Explain the settlement adjustment, fee authorization, or offsetting transaction ID..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsResolveModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Resolving...' : 'Confirm Resolution'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
