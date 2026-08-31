import React, { useEffect, useState } from 'react';
import { transactionsApi, accountsApi, categoriesApi, merchantsApi } from '../api/client';
import { Transaction, Account, Category, Merchant } from '../types';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { StatusBadge } from '../components/common/Badge';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Filter,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 15;

  // Filters
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formAccountId, setFormAccountId] = useState('');
  const [formAmount, setFormAmount] = useState<number | ''>('');
  const [formType, setFormType] = useState<'INCOME' | 'EXPENSE' | 'TRANSFER'>('EXPENSE');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formMerchantId, setFormMerchantId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await transactionsApi.list({
        page,
        limit,
        accountId: selectedAccount || undefined,
        type: selectedType || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      });
      setTransactions(res.transactions || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuxData = async () => {
    try {
      const [accRes, catRes, merRes] = await Promise.all([
        accountsApi.list().catch(() => ({ success: true, accounts: [] })),
        categoriesApi.list().catch(() => ({ success: true, categories: [] })),
        merchantsApi.list().catch(() => ({ success: true, merchants: [] }))
      ]);
      setAccounts(accRes.accounts || []);
      setCategories(catRes.categories || []);
      setMerchants(merRes.merchants || []);
      if (accRes.accounts?.length > 0 && !formAccountId) {
        setFormAccountId(accRes.accounts[0].id);
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchAuxData();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, selectedAccount, selectedType, startDate, endDate]);

  const handleOpenCreate = () => {
    setFormAmount('');
    setFormDescription('');
    setFormType('EXPENSE');
    setFormCategoryId('');
    setFormMerchantId('');
    if (accounts.length > 0) setFormAccountId(accounts[0].id);
    setError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAccountId || !formAmount || Number(formAmount) <= 0) {
      setError('Please provide a valid account and positive amount');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await transactionsApi.create({
        accountId: formAccountId,
        amount: Number(formAmount),
        type: formType,
        description: formDescription || undefined,
        categoryId: formCategoryId || undefined,
        merchantId: formMerchantId || undefined,
        transactionAt: new Date(formDate).toISOString()
      });

      setIsCreateModalOpen(false);
      setSuccessMsg('Transaction created & posted to ledger');
      setTimeout(() => setSuccessMsg(null), 3000);
      setPage(1);
      fetchTransactions();
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction? Its double-entry ledger entries will be reversed.')) return;
    try {
      await transactionsApi.delete(id);
      setSuccessMsg('Transaction deleted and ledger rolled back');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchTransactions();
    } catch (err: any) {
      setError(err.message || 'Failed to delete transaction');
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (tx.description && tx.description.toLowerCase().includes(term)) ||
      (tx.reference && tx.reference.toLowerCase().includes(term))
    );
  });

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Transactions Ledger
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Search, filter, and ingest multi-currency double-entry ledger records
          </p>
        </div>

        <button className="btn btn-teal" onClick={handleOpenCreate} disabled={accounts.length === 0}>
          <Plus size={18} />
          New Transaction
        </button>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--success)', fontSize: '0.875rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Search description or ref..."
            style={{ paddingLeft: 36 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Account Filter */}
        <div style={{ flex: '1 1 180px' }}>
          <select
            className="select"
            value={selectedAccount}
            onChange={(e) => { setSelectedAccount(e.target.value); setPage(1); }}
          >
            <option value="">All Accounts</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div style={{ flex: '1 1 140px' }}>
          <select
            className="select"
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
          >
            <option value="">All Types</option>
            <option value="INCOME">Income (+)</option>
            <option value="EXPENSE">Expense (-)</option>
            <option value="TRANSFER">Transfer</option>
          </select>
        </div>

        {/* Date Filters */}
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

      {/* Transactions Table */}
      {isLoading ? (
        <div className="card skeleton" style={{ height: 380, borderRadius: 'var(--radius-lg)' }} />
      ) : filteredTransactions.length === 0 ? (
        <EmptyState
          title="No Transactions Found"
          description={accounts.length === 0 ? "You need to create an account first before posting transactions." : "No transactions match your filter criteria. Create a new transaction to post to the ledger."}
          icon={ArrowLeftRight}
          actionLabel={accounts.length > 0 ? "New Transaction" : "Create Account"}
          onAction={accounts.length > 0 ? handleOpenCreate : () => window.location.href = '/accounts'}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Description</th>
                <th>Category / Merchant</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {new Date(tx.transactionAt).toLocaleDateString()}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }} className="mono">
                    {tx.reference || '—'}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {tx.description || 'Transaction'}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {tx.category?.name || '—'} {tx.merchant ? `• ${tx.merchant.name}` : ''}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: tx.type === 'INCOME' ? 'var(--success)' : tx.type === 'EXPENSE' ? 'var(--danger)' : 'var(--info)' }}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, fontSize: '0.95rem' }} className="financial-figure">
                    <span style={{ color: tx.type === 'INCOME' ? 'var(--success)' : '#FFFFFF' }}>
                      {tx.type === 'INCOME' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={tx.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      title="Delete Transaction"
                      style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 4 }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        total={total}
        limit={limit}
        onPageChange={setPage}
      />

      {/* Ingest / Create Transaction Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Record New Transaction">
        {error && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 16 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Target Account *
            </label>
            <select
              className="select"
              required
              value={formAccountId}
              onChange={(e) => setFormAccountId(e.target.value)}
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.type} • {acc.currency})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Amount ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input"
                placeholder="100.00"
                required
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Transaction Type
              </label>
              <select
                className="select"
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
              >
                <option value="EXPENSE">Expense (Debit)</option>
                <option value="INCOME">Income (Credit)</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Description
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. AWS Cloud Hosting Subscription"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Transaction Date
            </label>
            <input
              type="date"
              className="input"
              required
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-teal" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post to Ledger'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
