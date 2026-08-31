import React, { useEffect, useState } from 'react';
import { transactionsApi, accountsApi } from '../api/client';
import { Transaction, Account } from '../types';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { StatusBadge } from '../components/common/Badge';
import {
  ArrowLeftRight,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Building2,
  Trash2
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
        description: formData.description || undefined,
        transactionAt: new Date(formData.date).toISOString()
      });

      setIsModalOpen(false);
      setSuccessMsg('Transaction posted to double-entry ledger successfully');
      setFormData(prev => ({
        ...prev,
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      }));
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to post transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await transactionsApi.delete(id);
      setSuccessMsg('Transaction deleted from ledger');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete transaction');
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Journal & Transactions
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Double-entry balanced records, counterparty postings, and ledger journal history
          </p>
        </div>

        <button className="btn btn-teal" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={16} />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--success)', fontSize: '0.875rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && !isModalOpen && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--danger)', fontSize: '0.875rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Institutional Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
        {/* Search */}
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Search description, reference..."
            style={{ paddingLeft: 36 }}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
        <div className="card skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No Transactions Found"
          description={search || typeFilter ? "No transactions match the selected filter criteria." : "Start recording transactions to establish your organization's double-entry ledger."}
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
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {new Date(tx.transactionAt || tx.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.875rem' }}>
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
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {tx.category?.name || 'General'}
                  </td>
                  <td>
                    <StatusBadge status={tx.status || 'COMPLETED'} />
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.925rem',
                        color: tx.type === 'INCOME' ? 'var(--success)' : '#FFFFFF'
                      }}
                      className="financial-figure"
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDeleteTransaction(tx.id)}
                      style={{ padding: 6, borderRadius: 'var(--radius-sm)' }}
                      title="Delete Transaction"
                    >
                      <Trash2 size={14} style={{ color: 'var(--danger)' }} />
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

      {/* Ingest Transaction Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Financial Transaction" maxWidth="560px">
        <form onSubmit={handleCreateTransaction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && isModalOpen && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--danger)', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Target Account *
            </label>
            <select
              className="select"
              required
              value={formData.accountId}
              onChange={(e) => setFormData(prev => ({ ...prev, accountId: e.target.value }))}
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.type} • {acc.currency})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Transaction Type *
              </label>
              <select
                className="select"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              >
                <option value="INCOME">Income / Credit Inflow</option>
                <option value="EXPENSE">Expense / Debit Outflow</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Amount ($ USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input"
                placeholder="1500.00"
                required
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Description / Counterparty Reference
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. AWS Cloud Infrastructure Billing #4801"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Value Date *
            </label>
            <input
              type="date"
              className="input"
              required
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-teal" disabled={isSubmitting}>
              {isSubmitting ? 'Posting Ledger...' : 'Post to Ledger'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
