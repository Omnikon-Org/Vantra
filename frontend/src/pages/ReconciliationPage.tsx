import React, { useEffect, useState } from 'react';
import { reconciliationApi, accountsApi, transactionsApi } from '../api/client';
import { Reconciliation, Account, ReconciliationItem, Transaction } from '../types';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { StatusBadge } from '../components/common/Badge';
import {
  GitCompare,
  Play,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon,
  Check,
  Plus,
  FileSpreadsheet
} from 'lucide-react';

export const ReconciliationPage: React.FC = () => {
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Run Modal State
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [toleranceDays, setToleranceDays] = useState(3);
  const [notes, setNotes] = useState('');
  const [externalRecords, setExternalRecords] = useState<Array<{ reference: string; amount: number; description: string; date: string }>>([
    { reference: 'STMT-001', amount: 100, description: 'AWS Hosting', date: new Date().toISOString().split('T')[0] }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Details Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentReconciliation, setCurrentReconciliation] = useState<Reconciliation | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Manual Match Modal State
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [matchingItem, setMatchingItem] = useState<ReconciliationItem | null>(null);
  const [unmatchedTransactions, setUnmatchedTransactions] = useState<Transaction[]>([]);
  const [selectedTxId, setSelectedTxId] = useState('');
  const [matchNotes, setMatchNotes] = useState('');

  // Discrepancy Resolve Modal State
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolvingItem, setResolvingItem] = useState<ReconciliationItem | null>(null);
  const [resolutionType, setResolutionType] = useState('ACCEPTED_DIFFERENCE');
  const [resolveNotes, setResolveNotes] = useState('');

  const fetchReconciliations = async () => {
    setIsLoading(true);
    try {
      const res = await reconciliationApi.list({ page, limit });
      setReconciliations(res.reconciliations || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reconciliation history');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await accountsApi.list();
      setAccounts(res.accounts || []);
      if (res.accounts?.length > 0 && !selectedAccountId) {
        setSelectedAccountId(res.accounts[0].id);
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    fetchReconciliations();
  }, [page]);

  const handleOpenRun = () => {
    if (accounts.length > 0) setSelectedAccountId(accounts[0].id);
    setError(null);
    setIsRunModalOpen(true);
  };

  const handleAddRecordLine = () => {
    setExternalRecords([
      ...externalRecords,
      { reference: '', amount: 0, description: '', date: new Date().toISOString().split('T')[0] }
    ]);
  };

  const handleRemoveRecordLine = (index: number) => {
    setExternalRecords(externalRecords.filter((_, i) => i !== index));
  };

  const handleRecordChange = (index: number, field: string, value: any) => {
    const updated = [...externalRecords];
    (updated[index] as any)[field] = value;
    setExternalRecords(updated);
  };

  const handleLoadSampleBatch = () => {
    setExternalRecords([
      { reference: 'STMT-AWS-01', amount: 150.00, description: 'Office Supplies', date: new Date().toISOString().split('T')[0] },
      { reference: 'STMT-FEE-02', amount: 45.00, description: 'Bank Wire Surcharge', date: new Date().toISOString().split('T')[0] },
      { reference: 'STMT-MISC-03', amount: 500.00, description: 'Consulting Retainer', date: new Date().toISOString().split('T')[0] },
    ]);
  };

  const handleRunReconciliation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) {
      setError('Please select an account to reconcile');
      return;
    }

    const validRecords = externalRecords
      .filter(r => Number(r.amount) > 0)
      .map(r => ({
        reference: r.reference || undefined,
        amount: Number(r.amount),
        description: r.description || undefined,
        date: r.date ? new Date(r.date).toISOString() : undefined
      }));

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await reconciliationApi.run({
        accountId: selectedAccountId,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        rules: { dateToleranceDays: toleranceDays, autoReconcileTransactions: true },
        notes: notes || undefined,
        externalRecords: validRecords
      });

      setIsRunModalOpen(false);
      setSuccessMsg('Reconciliation session executed successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
      setPage(1);
      fetchReconciliations();

      if (res.reconciliation) {
        handleViewDetails(res.reconciliation.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to run reconciliation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = async (id: string) => {
    setIsDetailLoading(true);
    setIsDetailModalOpen(true);
    try {
      const res = await reconciliationApi.getById(id);
      setCurrentReconciliation(res.reconciliation);
    } catch (err: any) {
      setError(err.message || 'Failed to load reconciliation details');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleOpenManualMatch = async (item: ReconciliationItem) => {
    setMatchingItem(item);
    setMatchNotes('');
    try {
      const txRes = await transactionsApi.list({ limit: 50 });
      setUnmatchedTransactions(txRes.transactions || []);
      if (txRes.transactions?.length > 0) {
        setSelectedTxId(txRes.transactions[0].id);
      }
      setIsMatchModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to load internal transactions');
    }
  };

  const handleExecuteManualMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReconciliation || !matchingItem || !selectedTxId) return;
    try {
      await reconciliationApi.manualMatch(currentReconciliation.id, {
        reconciliationItemId: matchingItem.id,
        transactionId: selectedTxId,
        notes: matchNotes || undefined
      });
      setIsMatchModalOpen(false);
      setSuccessMsg('Item manually matched');
      setTimeout(() => setSuccessMsg(null), 3000);
      handleViewDetails(currentReconciliation.id);
      fetchReconciliations();
    } catch (err: any) {
      alert(err.message || 'Failed to perform manual match');
    }
  };

  const handleOpenResolveDiscrepancy = (item: ReconciliationItem) => {
    setResolvingItem(item);
    setResolutionType('ACCEPTED_DIFFERENCE');
    setResolveNotes('');
    setIsResolveModalOpen(true);
  };

  const handleExecuteResolveDiscrepancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReconciliation || !resolvingItem) return;
    try {
      await reconciliationApi.resolveDiscrepancy(currentReconciliation.id, {
        itemId: resolvingItem.id,
        resolution: resolutionType,
        notes: resolveNotes || undefined
      });
      setIsResolveModalOpen(false);
      setSuccessMsg('Discrepancy marked as resolved');
      setTimeout(() => setSuccessMsg(null), 3000);
      handleViewDetails(currentReconciliation.id);
      fetchReconciliations();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve discrepancy');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this reconciliation session? Cascade items will be removed.')) return;
    try {
      await reconciliationApi.delete(id);
      setSuccessMsg('Reconciliation session deleted');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchReconciliations();
    } catch (err: any) {
      setError(err.message || 'Failed to delete reconciliation');
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Reconciliation Engine
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Execute multi-pass matching, flag discrepancies, and link unmatched records
          </p>
        </div>

        <button className="btn btn-teal" onClick={handleOpenRun} disabled={accounts.length === 0}>
          <Play size={16} />
          Run Reconciliation
        </button>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--success)', fontSize: '0.875rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Table */}
      {isLoading ? (
        <div className="card skeleton" style={{ height: 380, borderRadius: 'var(--radius-lg)' }} />
      ) : reconciliations.length === 0 ? (
        <EmptyState
          title="No Reconciliation Sessions"
          description="Execute your first reconciliation run by matching external statement feeds with your account ledger."
          icon={GitCompare}
          actionLabel="Run Reconciliation"
          onAction={handleOpenRun}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Run Date</th>
                <th>Account</th>
                <th>Records (Int / Ext)</th>
                <th>Matched</th>
                <th>Discrepancies</th>
                <th>Unmatched</th>
                <th>Matched Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reconciliations.map((recon) => (
                <tr key={recon.id}>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {new Date(recon.createdAt).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {recon.account?.name || 'Account'}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {recon.totalInternal} int / {recon.totalExternal} ext
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                      {recon.matchedCount}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: recon.discrepancyCount > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {recon.discrepancyCount}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: recon.unmatchedCount > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
                      {recon.unmatchedCount}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }} className="financial-figure">
                    ${Number(recon.matchedAmount).toFixed(2)}
                  </td>
                  <td>
                    <StatusBadge status={recon.status} />
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleViewDetails(recon.id)}
                      style={{ marginRight: 6 }}
                    >
                      <Eye size={13} />
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(recon.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 4 }}
                      title="Delete Run"
                    >
                      <Trash2 size={15} />
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

      {/* Run Reconciliation Modal */}
      <Modal isOpen={isRunModalOpen} onClose={() => setIsRunModalOpen(false)} title="New Reconciliation Session" maxWidth="680px">
        {error && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 16 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleRunReconciliation} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Target Account *
              </label>
              <select
                className="select"
                required
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Date Tolerance (Days)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                className="input"
                value={toleranceDays}
                onChange={(e) => setToleranceDays(parseInt(e.target.value, 10) || 0)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Period Start Date (Optional)
              </label>
              <input
                type="date"
                className="input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Period End Date (Optional)
              </label>
              <input
                type="date"
                className="input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* External Statement Line Entries */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                External Statement Records ({externalRecords.length})
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleLoadSampleBatch}>
                  <FileSpreadsheet size={13} />
                  Load Sample Batch
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddRecordLine}>
                  <Plus size={13} />
                  Add Line
                </button>
              </div>
            </div>

            <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, padding: 10, background: 'rgba(6, 11, 20, 0.4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)' }}>
              {externalRecords.map((rec, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr 1fr 30px', gap: 6, alignItems: 'center' }}>
                  <input
                    type="text"
                    className="input btn-sm"
                    placeholder="Ref (e.g. STMT-01)"
                    value={rec.reference}
                    onChange={(e) => handleRecordChange(idx, 'reference', e.target.value)}
                  />
                  <input
                    type="number"
                    step="0.01"
                    className="input btn-sm"
                    placeholder="Amount $"
                    required
                    value={rec.amount || ''}
                    onChange={(e) => handleRecordChange(idx, 'amount', parseFloat(e.target.value) || 0)}
                  />
                  <input
                    type="text"
                    className="input btn-sm"
                    placeholder="Description"
                    value={rec.description}
                    onChange={(e) => handleRecordChange(idx, 'description', e.target.value)}
                  />
                  <input
                    type="date"
                    className="input btn-sm"
                    value={rec.date}
                    onChange={(e) => handleRecordChange(idx, 'date', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveRecordLine(idx)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.1rem' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsRunModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-teal" disabled={isSubmitting}>
              {isSubmitting ? 'Executing Reconciliation...' : 'Run Matching Engine'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reconciliation Details Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Reconciliation Session Details" maxWidth="900px">
        {isDetailLoading || !currentReconciliation ? (
          <div className="skeleton" style={{ height: 320, borderRadius: 'var(--radius-md)' }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Stats Summary Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, padding: 16, background: 'rgba(6, 11, 20, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MATCHED</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--success)' }}>{currentReconciliation.matchedCount}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DISCREPANCIES</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: currentReconciliation.discrepancyCount > 0 ? 'var(--danger)' : '#FFFFFF' }}>{currentReconciliation.discrepancyCount}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>UNMATCHED</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--warning)' }}>{currentReconciliation.unmatchedCount}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MATCHED AMOUNT</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF' }} className="financial-figure">${Number(currentReconciliation.matchedAmount).toFixed(2)}</div>
              </div>
            </div>

            {/* Items Table */}
            <div className="table-container" style={{ maxHeight: 380, overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Match Type</th>
                    <th>External Statement</th>
                    <th>Internal Ledger</th>
                    <th>Status</th>
                    <th>Reason / Notes</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentReconciliation.items?.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <StatusBadge status={item.matchType} />
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>
                        {item.externalAmount !== null ? (
                          <>
                            <strong>${Number(item.externalAmount).toFixed(2)}</strong>
                            {item.externalReference && <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Ref: {item.externalReference}</div>}
                            {item.externalDescription && <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{item.externalDescription}</div>}
                          </>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>
                        {item.internalAmount !== null ? (
                          <>
                            <strong>${Number(item.internalAmount).toFixed(2)}</strong>
                            {item.transaction?.reference && <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Ref: {item.transaction.reference}</div>}
                            {item.transaction?.description && <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{item.transaction.description}</div>}
                          </>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: 220 }}>
                        {item.discrepancyReason || '—'}
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {item.status === 'UNMATCHED' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenManualMatch(item)}
                            title="Manually link with internal transaction"
                          >
                            <LinkIcon size={12} />
                            Link
                          </button>
                        )}
                        {item.status === 'DISCREPANT' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleOpenResolveDiscrepancy(item)}
                            title="Resolve discrepancy"
                          >
                            <Check size={12} />
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Manual Match Dialog */}
      <Modal isOpen={isMatchModalOpen} onClose={() => setIsMatchModalOpen(false)} title="Manual Match Linking">
        <form onSubmit={handleExecuteManualMatch} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Select an internal transaction to manually reconcile with this external statement record:
          </p>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Internal Transaction *
            </label>
            <select
              className="select"
              required
              value={selectedTxId}
              onChange={(e) => setSelectedTxId(e.target.value)}
            >
              {unmatchedTransactions.map(tx => (
                <option key={tx.id} value={tx.id}>
                  ${Number(tx.amount).toFixed(2)} — {tx.description || tx.reference || 'Transaction'} ({new Date(tx.transactionAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Audit Match Notes
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Verified against bank wire receipt"
              value={matchNotes}
              onChange={(e) => setMatchNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsMatchModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-teal">
              Confirm Manual Match
            </button>
          </div>
        </form>
      </Modal>

      {/* Discrepancy Resolve Dialog */}
      <Modal isOpen={isResolveModalOpen} onClose={() => setIsResolveModalOpen(false)} title="Resolve Discrepancy">
        <form onSubmit={handleExecuteResolveDiscrepancy} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Accept or adjust the flagged amount discrepancy for this record:
          </p>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Resolution Type
            </label>
            <select
              className="select"
              value={resolutionType}
              onChange={(e) => setResolutionType(e.target.value)}
            >
              <option value="ACCEPTED_DIFFERENCE">Accepted Difference (Fee / Surcharge)</option>
              <option value="ADJUSTED">Adjusted in Next Period</option>
              <option value="IGNORED">Ignored / Timing Variance</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Resolution Notes *
            </label>
            <textarea
              className="textarea"
              rows={3}
              placeholder="Explain why this difference is accepted for audit records..."
              required
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsResolveModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger">
              Confirm Resolution
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
