import React, { useEffect, useState } from 'react';
import { auditLogsApi } from '../api/client';
import { AuditLog } from '../types';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import {
  ScrollText,
  Filter,
  Eye,
  Clock,
  Shield,
  User as UserIcon,
  Calendar,
  Lock
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

  // Metadata Inspector Modal
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
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      });
      setAuditLogs(res.auditLogs || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit logs');
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

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            System Audit Trail
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Immutable, append-only security logs of all financial and administrative actions
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(20, 184, 166, 0.25)', padding: '6px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--accent-teal)', fontWeight: 600 }}>
          <Shield size={16} />
          <span>Append-Only Compliance Active</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
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
        <div className="card skeleton" style={{ height: 380, borderRadius: 'var(--radius-lg)' }} />
      ) : auditLogs.length === 0 ? (
        <EmptyState
          title="No Audit Logs Found"
          description="No administrative or financial audit records match your selected filter criteria."
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
              {auditLogs.map((log) => (
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
                        background: 'rgba(20, 184, 166, 0.12)',
                        color: 'var(--accent-teal)',
                        border: '1px solid var(--border-accent)'
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
                        <strong>{log.user.name || log.user.email}</strong>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.user.role}</div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>System</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenMetadata(log)}
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

      {/* Metadata Inspector Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Audit Event Metadata" maxWidth="600px">
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 14, background: 'rgba(6, 11, 20, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ACTION</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-teal)' }} className="mono">
                  {selectedLog.action}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>RECORDED AT</div>
                <div style={{ fontSize: '0.85rem', color: '#FFFFFF' }}>
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Contextual Payload (Sanitized)
              </div>
              <pre
                style={{
                  background: 'var(--bg-input)',
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-secondary)',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.8rem',
                  overflowX: 'auto',
                  maxHeight: 280
                }}
              >
                {JSON.stringify(selectedLog.metadata || {}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
