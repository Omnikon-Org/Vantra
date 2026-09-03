import React, { useEffect, useState } from 'react';
import { reconciliationApi, accountsApi, transactionsApi } from '../api/client';
import { Reconciliation, ReconciliationItem, Account, Transaction } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { renderFormattedStatValue } from '../components/common/MetricCard';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { StatusBadge } from '../components/common/Badge';
import {
  GitMerge,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Eye,
  Plus,
  Trash2,
  Sparkles,
  Search,
  Lock
} from 'lucide-react';

interface StatementEntryInput {
  reference: string;
  amount: string;
  date: string;
  description: string;
}

export const ReconciliationPage: React.FC = () => {
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Reconciliation Run Modal
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [targetAccountId, setTargetAccountId] = useState('');
  const [dateToleranceDays, setDateToleranceDays] = useState(1);
  const [statementFeed, setStatementFeed] = useState<StatementEntryInput[]>([
    { reference: '', amount: '', date: new Date().toISOString().split('T')[0], description: '' }
  ]);
  const [isSubmittingRun, setIsSubmittingRun] = useState(false);

  // Session Items Detail Modal
  const [selectedRecon, setSelectedRecon] = useState<Reconciliation | null>(null);
  const [reconItems, setReconItems] = useState<ReconciliationItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Manual Match Modal
  const [manualMatchItem, setManualMatchItem] = useState<ReconciliationItem | null>(null);
  const [availableTxns, setAvailableTxns] = useState<Transaction[]>([]);
  const [selectedTxId, setSelectedTxId] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Discrepancy Resolution Modal
  const [resolveItem, setResolveItem] = useState<ReconciliationItem | null>(null);
  const [resolveReason, setResolveReason] = useState('');
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [reconRes, accRes] = await Promise.all([
        reconciliationApi.list({ page, limit }),
        accountsApi.list()
      ]);
      setReconciliations(reconRes.reconciliations || []);
      setTotal(reconRes.total || 0);
      setAccounts(accRes.accounts || []);
      if (accRes.accounts?.length > 0 && !targetAccountId) {
        setTargetAccountId(accRes.accounts[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reconciliation records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleOpenRunModal = () => {
    setError(null);
    setStatementFeed([
      { reference: '', amount: '', date: new Date().toISOString().split('T')[0], description: '' }
    ]);
    setIsRunModalOpen(true);
  };

  const handleAddFeedRow = () => {
    setStatementFeed(prev => [
      ...prev,
      { reference: '', amount: '', date: new Date().toISOString().split('T')[0], description: '' }
    ]);
  };

  const handleRemoveFeedRow = (index: number) => {
    if (statementFeed.length <= 1) return;
    setStatementFeed(prev => prev.filter((_, i) => i !== index));
  };

  const handleFeedChange = (index: number, field: keyof StatementEntryInput, val: string) => {
    setStatementFeed(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleLoadSampleData = () => {
    setStatementFeed([
      { reference: 'REF-001', amount: '15000.00', date: new Date().toISOString().split('T')[0], description: 'Funding LP Wire' },
      { reference: 'REF-002', amount: '1200.00', date: new Date().toISOString().split('T')[0], description: 'Office Equipment Supplier' },
      { reference: 'REF-VAR-99', amount: '2430.00', date: new Date().toISOString().split('T')[0], description: 'Brokerage Commission Surcharge' },
      { reference: 'UNMATCHED-BANK-402', amount: '920.00', date: new Date().toISOString().split('T')[0], description: 'Direct Debit Service Fee' }
    ]);
  };

  const handleExecuteReconciliation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAccountId) {
      setError('Please select an account for reconciliation.');
      return;
    }

    const cleanedItems = statementFeed
      .filter(row => row.amount && !isNaN(Number(row.amount)))
      .map(row => ({
        reference: row.reference.trim() || undefined,
        amount: Number(row.amount),
        date: new Date(row.date).toISOString(),
        description: row.description.trim() || undefined
      }));

    if (cleanedItems.length === 0) {
      setError('Please provide at least one valid statement item with amount.');
      return;
    }

    setIsSubmittingRun(true);
    setError(null);
    try {
      const res = await reconciliationApi.run({
        accountId: targetAccountId,
        externalRecords: cleanedItems,
        rules: {
          dateToleranceDays: Number(dateToleranceDays)
        }
      });

      setIsRunModalOpen(false);
      setSuccessMsg(`Reconciliation run #${res.reconciliation.id.slice(0, 8)} executed successfully (${res.reconciliation.matchedCount} matched, ${res.reconciliation.discrepancyCount} discrepancies)`);
      setTimeout(() => setSuccessMsg(null), 5000);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to execute reconciliation session');
    } finally {
      setIsSubmittingRun(false);
    }
  };

  const handleViewReconciliation = async (recon: Reconciliation) => {
    setSelectedRecon(recon);
    setIsDetailModalOpen(true);
    setIsLoadingItems(true);
    try {
      const res = await reconciliationApi.getById(recon.id);
      setReconItems(res.reconciliation.items || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load session details');
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleOpenManualMatch = async (item: ReconciliationItem) => {
    setManualMatchItem(item);
    setSelectedTxId('');
    setManualNotes('');
    setIsManualModalOpen(true);
    try {
      const txRes = await transactionsApi.list({ limit: 50 });
      setAvailableTxns(txRes.transactions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteManualMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecon || !manualMatchItem || !selectedTxId) return;

    try {
      await reconciliationApi.manualMatch(selectedRecon.id, {
        reconciliationItemId: manualMatchItem.id,
        transactionId: selectedTxId,
        notes: manualNotes || 'Manually linked by accountant'
      });

      setIsManualModalOpen(false);
      setSuccessMsg('Record manually matched successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
      const res = await reconciliationApi.getById(selectedRecon.id);
      setReconItems(res.reconciliation.items || []);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to complete manual match');
    }
  };

  const handleOpenResolve = (item: ReconciliationItem) => {
    setResolveItem(item);
    setResolveReason('');
    setIsResolveModalOpen(true);
  };

  const handleExecuteResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecon || !resolveItem || !resolveReason.trim()) return;

    try {
      await reconciliationApi.resolveDiscrepancy(selectedRecon.id, {
        itemId: resolveItem.id,
        resolution: resolveReason
      });

      setIsResolveModalOpen(false);
      setSuccessMsg('Discrepancy item marked as resolved');
      setTimeout(() => setSuccessMsg(null), 3000);
      const res = await reconciliationApi.getById(selectedRecon.id);
      setReconItems(res.reconciliation.items || []);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to resolve discrepancy');
    }
  };

  // Top Summary Computations
  const totalMatched = reconciliations.reduce((acc, r) => acc + (r.matchedCount || 0), 0);
  const totalDiscrepancies = reconciliations.reduce((acc, r) => acc + (r.discrepancyCount || 0), 0);
  const totalUnmatched = reconciliations.reduce((acc, r) => acc + (r.unmatchedCount || 0), 0);
  const aggregateHealth = (totalMatched + totalDiscrepancies + totalUnmatched) > 0
    ? ((totalMatched / (totalMatched + totalDiscrepancies + totalUnmatched)) * 100).toFixed(1)
    : '100.0';

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <PageHeader
        eyebrow="MATCHING PIPELINE"
        title={<>Reconciliation <em>Engine</em></>}
        subtitle="Match internal ledger records against external bank statements with automated multi-pass precision"
        actions={
          <button className="btn btn-primary" onClick={handleOpenRunModal}>
            <Play size={15} />
            <span>Run Reconciliation</span>
          </button>
        }
      />

      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        <div className="card" style={{ padding: '24px 28px' }}>
          <div className="meta-label">
            RECONCILIATION HEALTH
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }} className="financial-figure">
            {renderFormattedStatValue(`${aggregateHealth}%`)}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: 6 }}>
            Overall matched accuracy
          </div>
        </div>

        <div className="card" style={{ padding: '24px 28px' }}>
          <div className="meta-label">
            MATCHED RECORDS
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--success)', marginTop: 4 }} className="financial-figure">
            {totalMatched}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: 6 }}>
            Zero-variance items
          </div>
        </div>

        <div className="card" style={{ padding: '24px 28px' }}>
          <div className="meta-label">
            EXCEPTIONS DETECTED
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: totalDiscrepancies > 0 ? 'var(--warning)' : 'var(--text-primary)', marginTop: 4 }} className="financial-figure">
            {totalDiscrepancies}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: 6 }}>
            Amount/timing variances
          </div>
        </div>

        <div className="card" style={{ padding: '24px 28px' }}>
          <div className="meta-label">
            PENDING UNMATCHED
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: totalUnmatched > 0 ? 'var(--danger)' : 'var(--text-primary)', marginTop: 4 }} className="financial-figure">
            {totalUnmatched}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: 6 }}>
            Missing journal entries
          </div>
        </div>
      </div>

      {/* Reconciliation Pipeline Visual Bar */}
      <div
        className="card"
        style={{
          padding: '18px 24px',
          background: 'rgba(10, 12, 16, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflowX: 'auto',
          gap: 12
        }}
      >
        {[
          'Statement Feed',
          'Exact Match',
          'Fuzzy Match',
          'Variance Scan',
          'Exception Review',
          'Audit Lock'
        ].map((step, idx, arr) => (
          <React.Fragment key={idx}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'var(--accent-emerald-tint)',
                  border: '1px solid var(--accent-emerald)',
                  color: 'var(--accent-mint)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {idx + 1}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{step}</span>
            </div>
            {idx < arr.length - 1 && (
              <div style={{ width: 24, height: 1, background: 'var(--border-subtle)', flexShrink: 0 }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Alerts */}
      {successMsg && (
        <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--success)', fontSize: '0.875rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && !isRunModalOpen && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--danger)', fontSize: '0.875rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Sessions Table */}
      {isLoading ? (
        <div className="card skeleton" style={{ height: 380, borderRadius: 'var(--radius-lg)' }} />
      ) : reconciliations.length === 0 ? (
        <EmptyState
          title="No reconciliation sessions yet."
          description="Run your first reconciliation to compare internal ledger records against external statement data."
          icon={GitMerge}
          actionLabel="Run Reconciliation"
          onAction={handleOpenRunModal}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Account</th>
                <th>Date Executed</th>
                <th>Matched</th>
                <th>Discrepancies</th>
                <th>Unmatched</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reconciliations.map((recon) => (
                <tr key={recon.id}>
                  <td style={{ fontWeight: 700, color: 'var(--accent-teal)', fontSize: '0.85rem' }} className="mono">
                    #{recon.id.slice(0, 8)}
                  </td>
                  <td style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
                    {recon.account?.name || 'Account'}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {new Date(recon.createdAt).toLocaleString()}
                  </td>
                  <td style={{ color: 'var(--success)', fontWeight: 700 }}>
                    {recon.matchedCount}
                  </td>
                  <td style={{ color: recon.discrepancyCount > 0 ? 'var(--warning)' : 'var(--text-muted)', fontWeight: 700 }}>
                    {recon.discrepancyCount}
                  </td>
                  <td style={{ color: recon.unmatchedCount > 0 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 700 }}>
                    {recon.unmatchedCount}
                  </td>
                  <td>
                    <StatusBadge status={recon.status} />
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleViewReconciliation(recon)}
                    >
                      <Eye size={13} />
                      Inspect Session
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

      {/* Run Reconciliation Session Modal */}
      <Modal isOpen={isRunModalOpen} onClose={() => setIsRunModalOpen(false)} title="Execute Multi-Pass Reconciliation Session" maxWidth="720px">
        <form onSubmit={handleExecuteReconciliation} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {error && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--danger)', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {/* Account Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Target Account for Matching *
            </label>
            <select
              className="select"
              required
              value={targetAccountId}
              onChange={(e) => setTargetAccountId(e.target.value)}
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.type} • {acc.currency})</option>
              ))}
            </select>
          </div>

          {/* Tolerance Config */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Date Settlement Tolerance (± Days)
            </label>
            <input
              type="number"
              min="0"
              max="30"
              className="input"
              value={dateToleranceDays}
              onChange={(e) => setDateToleranceDays(Number(e.target.value))}
            />
          </div>

          {/* Statement Feed Inputs Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>
              Bank Statement Feed Items ({statementFeed.length})
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleLoadSampleData}
              style={{ fontSize: '0.75rem' }}
            >
              <Sparkles size={13} style={{ color: 'var(--accent-teal)' }} />
              Load Sample Batch
            </button>
          </div>

          {/* Statement Feed Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 240, overflowY: 'auto', paddingRight: 4 }}>
            {statementFeed.map((row, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Ref (e.g. REF-001)"
                  value={row.reference}
                  onChange={(e) => handleFeedChange(idx, 'reference', e.target.value)}
                />
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="Amount"
                  required
                  value={row.amount}
                  onChange={(e) => handleFeedChange(idx, 'amount', e.target.value)}
                />
                <input
                  type="date"
                  className="input"
                  value={row.date}
                  onChange={(e) => handleFeedChange(idx, 'date', e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleRemoveFeedRow(idx)}
                  disabled={statementFeed.length <= 1}
                  style={{ padding: 8 }}
                >
                  <Trash2 size={13} style={{ color: 'var(--danger)' }} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleAddFeedRow}
            style={{ width: 'fit-content' }}
          >
            <Plus size={14} />
            Add Feed Item
          </button>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsRunModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmittingRun}>
              {isSubmittingRun ? 'Executing Matching Algorithm...' : 'Run Matching Engine'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Session Details / Breakdown Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Reconciliation Session #${selectedRecon?.id.slice(0, 8)}`} maxWidth="840px">
        {selectedRecon && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, padding: 16, background: 'rgba(6, 11, 20, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ACCOUNT</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>{selectedRecon.account?.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MATCHED</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--success)' }}>{selectedRecon.matchedCount} records</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DISCREPANCIES</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--warning)' }}>{selectedRecon.discrepancyCount} items</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>UNMATCHED</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--danger)' }}>{selectedRecon.unmatchedCount} items</div>
              </div>
            </div>

            {isLoadingItems ? (
              <div className="skeleton" style={{ height: 260, borderRadius: 'var(--radius-md)' }} />
            ) : reconItems.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No item breakdown available.</div>
            ) : (
              <div className="table-container" style={{ maxHeight: 360, overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Match Method</th>
                      <th>Ref / Details</th>
                      <th>Amount</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reconItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <StatusBadge status={item.status} />
                        </td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} className="mono">
                          {item.matchType || 'MANUAL'}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          <div style={{ fontWeight: 600 }}>{item.externalReference || 'No Ref'}</div>
                          {item.discrepancyAmount && Number(item.discrepancyAmount) !== 0 && (
                            <div style={{ fontSize: '0.725rem', color: 'var(--warning)' }}>
                              Variance: ${Number(item.discrepancyAmount).toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td style={{ fontWeight: 700 }} className="financial-figure">
                          ${Number(item.externalAmount || item.internalAmount || 0).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {item.status === 'UNMATCHED' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenManualMatch(item)}
                            >
                              Match
                            </button>
                          )}
                          {item.status === 'DISCREPANT' && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleOpenResolve(item)}
                            >
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
          </div>
        )}
      </Modal>

      {/* Manual Match Modal */}
      <Modal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} title="Manual Transaction Match">
        <form onSubmit={handleExecuteManualMatch} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Link unmatched statement item (${manualMatchItem ? Number(manualMatchItem.externalAmount || 0).toFixed(2) : '0.00'}) with an internal ledger transaction:
          </p>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Select Internal Ledger Transaction *
            </label>
            <select
              className="select"
              required
              value={selectedTxId}
              onChange={(e) => setSelectedTxId(e.target.value)}
            >
              <option value="">Choose transaction...</option>
              {availableTxns.map(tx => (
                <option key={tx.id} value={tx.id}>
                  {tx.description || 'Tx'} — ${Number(tx.amount).toFixed(2)} ({new Date(tx.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Auditor Notes
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Cleared via alternate reference code"
              value={manualNotes}
              onChange={(e) => setManualNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsManualModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Manual Match
            </button>
          </div>
        </form>
      </Modal>

      {/* Discrepancy Resolution Modal */}
      <Modal isOpen={isResolveModalOpen} onClose={() => setIsResolveModalOpen(false)} title="Resolve Discrepancy Item">
        <form onSubmit={handleExecuteResolve} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Provide resolution rationale for variance difference (${resolveItem ? Number(resolveItem.discrepancyAmount || 0).toFixed(2) : '0.00'}):
          </p>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Resolution Reason *
            </label>
            <textarea
              className="textarea"
              rows={3}
              placeholder="e.g. Surcharge verified and accepted per merchant schedule."
              required
              value={resolveReason}
              onChange={(e) => setResolveReason(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsResolveModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Resolution
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
