import React, { useEffect, useState } from 'react';
import { transactionsApi, accountsApi } from '../api/client';
import { Transaction, Account } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { renderFormattedStatValue } from '../components/common/MetricCard';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { StatusBadge } from '../components/common/Badge';
import { SkeletonTable } from '../components/common/Skeleton';
import {
  ArrowLeftRight,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Building2,
  Trash2,
  Eye,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 15;

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [accountIdFilter, setAccountIdFilter] = useState('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Ingestion Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    accountId: '',
    amount: '',
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Selected Transaction for Detail Modal
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [txRes, accRes] = await Promise.all([
        transactionsApi.list({
          page,
          limit,
          type: typeFilter || undefined,
          accountId: accountIdFilter || undefined
        }),
        accountsApi.list()
      ]);

      let list = txRes.transactions || [];
      if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter(t =>
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.reference && t.reference.toLowerCase().includes(q)) ||
          (t.merchant && t.merchant.name.toLowerCase().includes(q))
        );
      }

      setTransactions(list);
      setTotal(txRes.total || 0);
      setAccounts(accRes.accounts || []);
      if (accRes.accounts?.length > 0 && !formData.accountId) {
        setFormData(prev => ({ ...prev, accountId: accRes.accounts[0].id }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, typeFilter, accountIdFilter, search]);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId || !formData.amount) {
      setError('Please select an account and enter a valid amount.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await transactionsApi.create({
        accountId: formData.accountId,
        amount: Number(formData.amount),
        type: formData.type,
        description: formData.description.trim() || undefined,
        transactionAt: new Date(formData.date).toISOString()
      });

      setIsModalOpen(false);
      setFormData({
        accountId: accounts.length > 0 ? accounts[0].id : '',
        amount: '',
        type: 'INCOME',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      setSuccessMsg('Transaction successfully ingested and posted to double-entry ledger.');
      setTimeout(() => setSuccessMsg(null), 3500);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction record?')) return;
    try {
      await transactionsApi.delete(id);
      setSuccessMsg('Transaction deleted.');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete transaction');
    }
  };

  const totalInflow = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalOutflow = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <PageHeader
        eyebrow="JOURNAL ENTRIES"
        title={<>Double-Entry <em>Ledger</em></>}
        subtitle="Real-time balanced journal entries, operating inflows, and multi-currency disbursements"
        actions={
          <button className="btn btn-primary" onClick={() => { setError(null); setIsModalOpen(true); }}>
            <PlusCircle size={16} />
            <span>Record Transaction</span>
          </button>
        }
      />

      {/* Financial Summary Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20
        }}
      >
        <div className="card" style={{ padding: '24px 28px' }}>
          <div className="meta-label">PAGE INFLOW VOLUME</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--success)', marginTop: 4 }} className="financial-figure">
            +${totalInflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Credits posted on current page
          </div>
        </div>

        <div className="card" style={{ padding: '24px 28px' }}>
          <div className="meta-label">PAGE OUTFLOW VOLUME</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }} className="financial-figure">
            -${totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Debits posted on current page
          </div>
        </div>

        <div className="card" style={{ padding: '24px 28px' }}>
          <div className="meta-label">TOTAL LEDGER RECORDS</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }} className="financial-figure">
            {renderFormattedStatValue(`${total} Records`)}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Mathematically balanced entries
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--success)', fontSize: '0.875rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && !isModalOpen && !isDetailModalOpen && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--danger)', fontSize: '0.875rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

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
        {/* Search */}
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: 34, fontSize: '0.825rem' }}
            placeholder="Search description, reference code, counterparty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <div style={{ width: 160 }}>
          <select
            className="select"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Types</option>
            <option value="INCOME">Income (Credit)</option>
            <option value="EXPENSE">Expense (Debit)</option>
          </select>
        </div>

        {/* Account Filter */}
        <div style={{ width: 220 }}>
          <select
            className="select"
            value={accountIdFilter}
            onChange={(e) => { setAccountIdFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Accounts</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      {isLoading ? (
        <SkeletonTable rows={8} columns={6} />
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No Transactions Found"
          description={search || typeFilter || accountIdFilter ? "No ledger entries match the selected filter criteria." : "Start recording transactions to build your organization's double-entry financial ledger."}
          icon={ArrowLeftRight}
          actionLabel="Record Transaction"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction Description</th>
                <th>Account</th>
                <th>Category</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.7875rem', whiteSpace: 'nowrap' }}>
                    {new Date(tx.transactionAt || tx.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.85rem' }}>
                      {tx.description || 'Transaction'}
                    </div>
                    {tx.merchant && (
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Counterparty: {tx.merchant.name}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {tx.account?.name || 'Account'}
                  </td>
                  <td style={{ fontSize: '0.7875rem', color: 'var(--text-muted)' }}>
                    {tx.category?.name || 'General'}
                  </td>
                  <td>
                    <StatusBadge status={tx.status || 'COMPLETED'} />
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: '0.925rem',
                        color: tx.type === 'INCOME' ? 'var(--success)' : '#FFFFFF'
                      }}
                      className="financial-figure"
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => { setSelectedTx(tx); setIsDetailModalOpen(true); }}
                        style={{ padding: 6, borderRadius: 'var(--radius-sm)' }}
                        title="View Details"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDeleteTransaction(tx.id)}
                        style={{ padding: 6, borderRadius: 'var(--radius-sm)' }}
                        title="Delete Transaction"
                      >
                        <Trash2 size={13} style={{ color: 'var(--danger)' }} />
                      </button>
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

      {/* Ingestion Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Ledger Transaction">
        {error && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleCreateTransaction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Target Account
            </label>
            <select
              className="select"
              value={formData.accountId}
              onChange={(e) => setFormData(prev => ({ ...prev, accountId: e.target.value }))}
              required
            >
              <option value="" disabled>Select Operating Account</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Transaction Type
              </label>
              <select
                className="select"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              >
                <option value="INCOME">Income (Credit +)</option>
                <option value="EXPENSE">Expense (Debit -)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Description
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Q3 Investor Wire, AWS Infrastructure"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Transaction Date
            </label>
            <input
              type="date"
              className="input"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post to Ledger'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Inspection Modal */}
      {selectedTx && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Transaction Details"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '16px 18px', background: 'rgba(4, 8, 17, 0.65)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)' }}>
              <div className="meta-label">TRANSACTION AMOUNT</div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 900,
                  color: selectedTx.type === 'INCOME' ? 'var(--success)' : '#FFFFFF',
                  marginTop: 4
                }}
                className="financial-figure"
              >
                {selectedTx.type === 'INCOME' ? '+' : '-'}${Number(selectedTx.amount).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                {selectedTx.description || 'Unreferenced Transaction'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.85rem' }}>
              <div>
                <span className="meta-label">TRANSACTION ID</span>
                <div style={{ color: '#FFFFFF', marginTop: 2 }} className="mono">{selectedTx.id}</div>
              </div>
              <div>
                <span className="meta-label">STATUS</span>
                <div style={{ marginTop: 2 }}><StatusBadge status={selectedTx.status || 'COMPLETED'} /></div>
              </div>
              <div>
                <span className="meta-label">ACCOUNT</span>
                <div style={{ color: '#FFFFFF', marginTop: 2 }}>{selectedTx.account?.name || 'Operating'}</div>
              </div>
              <div>
                <span className="meta-label">DATE RECORDED</span>
                <div style={{ color: '#FFFFFF', marginTop: 2 }}>{new Date(selectedTx.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
