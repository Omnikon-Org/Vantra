import React, { useEffect, useState } from 'react';
import { auditLogsApi } from '../api/client';
import { AuditLog } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { renderFormattedStatValue } from '../components/common/MetricCard';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { SkeletonTable } from '../components/common/Skeleton';
import {
  ScrollText,
  Shield,
  ShieldCheck,
  Eye,
  Calendar,
  UserCheck,
  AlertTriangle,
  Code
} from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Metadata Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const res = await auditLogsApi.list({
        page,
        limit,
        action: actionFilter || undefined,
        entityType: entityFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      setAuditLogs(res.auditLogs || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page, actionFilter, entityFilter, startDate, endDate]);

  const handleOpenMetadata = (log: AuditLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('DELETED')) return { bg: 'var(--danger-bg)', text: 'var(--danger)', border: 'var(--danger-border)' };
    if (action.includes('CREATED')) return { bg: 'var(--accent-gold-tint)', text: 'var(--accent-gold)', border: 'rgba(212, 165, 72, 0.28)' };
    if (action.includes('RESOLVED') || action.includes('MATCH')) return { bg: 'var(--success-bg)', text: 'var(--success)', border: 'var(--success-border)' };
    return { bg: 'var(--accent-gold-tint)', text: 'var(--accent-gold-dim)', border: 'rgba(212, 165, 72, 0.22)' };
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <PageHeader
        eyebrow="COMPLIANCE PROTOCOL"
        title={<>Immutable <em>Audit</em> Trail</>}
        subtitle="Cryptographic append-only compliance ledger tracking all administrative, transaction, and reconciliation events"
        badge={
          <span
            style={{
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-gold-tint)',
              border: '1px solid rgba(212, 165, 72, 0.28)',
              color: 'var(--accent-gold)',
              fontSize: '0.725rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <ShieldCheck size={14} />
            <span>APPEND-ONLY COMPLIANCE ACTIVE</span>
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
          <div className="meta-label">TOTAL AUDIT EVENTS</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }} className="financial-figure">
            {renderFormattedStatValue(`${total} Records`)}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Zero mutations permitted
          </div>
        </div>

        <div className="card" style={{ padding: '24px 28px' }}>
          <div className="meta-label">RECORDING STATUS</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: 4 }} className="financial-figure">
            Continuous
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Synchronous ledger journaling
          </div>
        </div>

        <div className="card" style={{ padding: '24px 28px' }}>
          <div className="meta-label">TENANT SCOPE</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--success)', marginTop: 4 }} className="financial-figure">
            Isolated
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Row-level security active
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && !isModalOpen && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--danger)', fontSize: '0.875rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        {/* Action Filter */}
        <div style={{ flex: '1 1 200px' }}>
          <select
            className="select"
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Action Types</option>
            <option value="ACCOUNT_CREATED">ACCOUNT_CREATED</option>
            <option value="ACCOUNT_UPDATED">ACCOUNT_UPDATED</option>
            <option value="ACCOUNT_DELETED">ACCOUNT_DELETED</option>
            <option value="TRANSACTION_CREATED">TRANSACTION_CREATED</option>
            <option value="TRANSACTION_UPDATED">TRANSACTION_UPDATED</option>
            <option value="TRANSACTION_DELETED">TRANSACTION_DELETED</option>
            <option value="RECONCILIATION_CREATED">RECONCILIATION_CREATED</option>
            <option value="RECONCILIATION_MANUAL_MATCH">RECONCILIATION_MANUAL_MATCH</option>
            <option value="RECONCILIATION_DISCREPANCY_RESOLVED">RECONCILIATION_DISCREPANCY_RESOLVED</option>
            <option value="EXCEPTION_STATUS_UPDATED">EXCEPTION_STATUS_UPDATED</option>
            <option value="EXCEPTION_RESOLVED">EXCEPTION_RESOLVED</option>
          </select>
        </div>

        {/* Entity Filter */}
        <div style={{ flex: '1 1 180px' }}>
          <select
            className="select"
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Entity Types</option>
            <option value="Account">Account</option>
            <option value="Transaction">Transaction</option>
            <option value="Reconciliation">Reconciliation</option>
            <option value="ReconciliationItem">ReconciliationItem</option>
            <option value="ReconciliationException">ReconciliationException</option>
          </select>
        </div>

        {/* Date Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 240px' }}>
          <input
            type="date"
            className="input"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            title="Start Date"
          />
          <span style={{ color: 'var(--text-muted)' }}>-</span>
          <input
            type="date"
            className="input"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            title="End Date"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      {isLoading ? (
        <SkeletonTable rows={8} columns={6} />
      ) : auditLogs.length === 0 ? (
        <EmptyState
          title="No Audit Logs Found"
          description={actionFilter || entityFilter || startDate || endDate ? "No administrative or financial audit records match your selected filter criteria." : "All ledger operations will be recorded here in immutable chronological order."}
          icon={ScrollText}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Entity Type</th>
                <th>Entity ID</th>
                <th>Initiated By</th>
                <th style={{ textAlign: 'right' }}>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => {
                const color = getActionBadgeColor(log.action);
                return (
                  <tr key={log.id}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: '#FFFFFF' }}>
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: color.bg,
                          color: color.text,
                          border: `1px solid ${color.border}`
                        }}
                        className="mono"
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {log.entityType}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }} className="mono">
                      {log.entityId ? `${log.entityId.slice(0, 8)}...` : '—'}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {log.user ? (
                        <div>
                          <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{log.user.name || 'User'}</div>
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{log.user.email}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Automated System</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenMetadata(log)}
                        style={{ padding: '5px 10px' }}
                      >
                        <Code size={13} />
                        <span>Payload</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
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

      {/* Payload Inspection Modal */}
      {selectedLog && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Audit Log Event Payload"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '12px 14px', background: 'rgba(4, 8, 17, 0.65)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)' }}>
              <div>
                <span className="meta-label">ACTION</span>
                <div style={{ color: '#FFFFFF', fontWeight: 700, marginTop: 2 }} className="mono">{selectedLog.action}</div>
              </div>
              <div>
                <span className="meta-label">ENTITY</span>
                <div style={{ color: '#FFFFFF', marginTop: 2 }}>{selectedLog.entityType}</div>
              </div>
            </div>

            <div>
              <span className="meta-label">RECORDED JSON PAYLOAD</span>
              <pre
                style={{
                  marginTop: 6,
                  padding: '14px 16px',
                  background: 'rgba(4, 8, 17, 0.85)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-secondary)',
                  fontSize: '0.7875rem',
                  color: 'var(--accent-teal)',
                  overflowX: 'auto',
                  maxHeight: 280,
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {JSON.stringify(selectedLog.metadata || {}, null, 2)}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
