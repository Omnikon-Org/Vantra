import React, { useEffect, useState } from 'react';
import { exceptionsApi } from '../api/client';
import { ReconciliationException } from '../types';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { StatusBadge } from '../components/common/Badge';
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Check,
  AlertTriangle,
  FileText
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
      await exceptionsApi.resolve(resolvingException.id, { resolutionNotes });
      setIsResolveModalOpen(false);
      setSuccessMsg('Exception resolved successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
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

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Exception Management
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Investigate, review, and resolve reconciliation discrepancies and unmatched records
          </p>
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
      {error && !isResolveModalOpen && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--danger)', fontSize: '0.875rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs & Dropdowns */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(6, 11, 20, 0.5)', padding: 4, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)' }}>
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
                background: statusFilter === tab.value ? 'var(--accent-teal)' : 'transparent',
                color: statusFilter === tab.value ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                padding: '7px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.18s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Severity Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            className="select"
            style={{ width: 170 }}
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
        <div className="card skeleton" style={{ height: 380, borderRadius: 'var(--radius-lg)' }} />
      ) : exceptions.length === 0 ? (
        <EmptyState
          title="No Exceptions Found"
          description={statusFilter ? `No ${statusFilter.toLowerCase()} exceptions match the selected filter criteria.` : "All reconciliation sessions are clear with zero discrepancies."}
          icon={CheckCircle2}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Severity</th>
                <th>Type</th>
                <th>Description / Reason</th>
                <th>Status</th>
                <th>Created</th>
                <th>Resolution Info</th>
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
                  <td style={{ fontSize: '0.85rem', maxWidth: 320 }}>
                    <div style={{ fontWeight: 600 }}>{exc.description}</div>
                    {exc.transaction && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Tx: ${Number(exc.transaction.amount).toFixed(2)} ({exc.transaction.description || 'Transaction'})
                      </div>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={exc.status} />
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {new Date(exc.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {exc.status === 'RESOLVED' ? (
                      <div>
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>Resolved</span>
                        {exc.resolvedBy && <div>by {exc.resolvedBy.name || exc.resolvedBy.email}</div>}
                      </div>
                    ) : (
                      'Pending review'
                    )}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenDetail(exc)}
                      style={{ marginRight: 6 }}
                    >
                      <Eye size={13} />
                      View
                    </button>
                    {exc.status !== 'RESOLVED' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleOpenResolve(exc)}
                      >
                        <Check size={13} />
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />

      {/* Exception Detail Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Exception Details" maxWidth="640px">
        {selectedException && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, background: 'rgba(6, 11, 20, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)' }}>
              <div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>EXCEPTION TYPE</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                  {selectedException.exceptionType.replace(/_/g, ' ')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <StatusBadge status={selectedException.severity} />
                <StatusBadge status={selectedException.status} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Description & Discrepancy Cause
              </div>
              <div style={{ padding: 14, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', border: '1px solid var(--border-secondary)' }}>
                {selectedException.description}
              </div>
            </div>

            {selectedException.transaction && (
              <div style={{ padding: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)' }}>
                <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>
                  LINKED TRANSACTION
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span>{selectedException.transaction.description || 'Transaction'}</span>
                  <strong className="financial-figure">${Number(selectedException.transaction.amount).toFixed(2)}</strong>
                </div>
              </div>
            )}

            {selectedException.status === 'RESOLVED' ? (
              <div style={{ padding: 16, background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)', marginBottom: 4 }}>
                  Resolution Notes
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {selectedException.resolutionNotes || 'No notes provided'}
                </p>
                {selectedException.resolvedAt && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                    Resolved at {new Date(selectedException.resolvedAt).toLocaleString()}
                    {selectedException.resolvedBy && ` by ${selectedException.resolvedBy.name || selectedException.resolvedBy.email}`}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--border-secondary)' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {selectedException.status === 'OPEN' && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleUpdateStatus(selectedException.id, 'IN_REVIEW')}
                    >
                      <Clock size={13} />
                      Mark In Review
                    </button>
                  )}
                </div>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenResolve(selectedException);
                  }}
                >
                  <Check size={13} />
                  Resolve Exception
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Resolve Exception Modal */}
      <Modal isOpen={isResolveModalOpen} onClose={() => setIsResolveModalOpen(false)} title="Resolve Financial Exception">
        <form onSubmit={handleExecuteResolve} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Provide resolution notes explaining how this discrepancy or unmatched item was handled for audit compliance:
          </p>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Resolution Notes *
            </label>
            <textarea
              className="textarea"
              rows={4}
              placeholder="e.g. Surcharge credited via credit memo #402. Approved by lead accountant."
              required
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsResolveModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-teal" disabled={isSubmitting}>
              {isSubmitting ? 'Resolving...' : 'Confirm Resolution'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
