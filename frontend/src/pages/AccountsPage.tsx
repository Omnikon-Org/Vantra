import React, { useEffect, useState } from 'react';
import { accountsApi } from '../api/client';
import { Account } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { StatusBadge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import {
  Wallet,
  Plus,
  Building,
  CreditCard,
  Coins,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'BANK' | 'CREDIT' | 'CASH'>('BANK');
  const [formCurrency, setFormCurrency] = useState('USD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await accountsApi.list();
      setAccounts(res.accounts || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch financial accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleOpenCreate = () => {
    setFormName('');
    setFormType('BANK');
    setFormCurrency('USD');
    setError(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setSelectedAccount(acc);
    setFormName(acc.name);
    setFormType(acc.type as any);
    setFormCurrency(acc.currency);
    setError(null);
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (acc: Account) => {
    setSelectedAccount(acc);
    setError(null);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError('Account name is required');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await accountsApi.create({ name: formName.trim(), type: formType, currency: formCurrency });
      setIsCreateModalOpen(false);
      setSuccessMsg('Account created successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchAccounts();
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await accountsApi.update(selectedAccount.id, { name: formName, type: formType, currency: formCurrency });
      setIsEditModalOpen(false);
      setSuccessMsg('Account updated successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchAccounts();
    } catch (err: any) {
      setError(err.message || 'Failed to update account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAccount) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await accountsApi.delete(selectedAccount.id);
      setIsDeleteModalOpen(false);
      setSuccessMsg('Account deleted successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchAccounts();
    } catch (err: any) {
      setError(err.message || 'Cannot delete account with existing transactions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'CREDIT': return CreditCard;
      case 'CASH': return Coins;
      default: return Building;
    }
  };

  const totalAssets = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
  const bankAccounts = accounts.filter(a => a.type === 'BANK').length;
  const creditAccounts = accounts.filter(a => a.type === 'CREDIT').length;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Standardized Header */}
      <PageHeader
        eyebrow="TREASURY & BALANCES"
        title={<>Financial <em>Accounts</em></>}
        subtitle="Manage operating bank accounts, credit facilities, and dynamic double-entry ledger balances"
        actions={
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Create Account</span>
          </button>
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
          <div className="meta-label">TOTAL LEDGER BALANCE</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: totalAssets >= 0 ? 'var(--text-primary)' : 'var(--danger)', marginTop: 4 }} className="financial-figure">
            ${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Aggregated across {accounts.length} configured accounts
          </div>
        </div>

        <div className="card" style={{ padding: '24px 28px' }}>
          <div className="meta-label">OPERATING BANK ACCOUNTS</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-mint)', marginTop: 4 }} className="financial-figure">
            {bankAccounts}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Primary operating cash reserves
          </div>
        </div>

        <div className="card" style={{ padding: '24px 28px' }}>
          <div className="meta-label">CREDIT & CASH FACILITIES</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-mint)', marginTop: 4 }} className="financial-figure">
            {creditAccounts + accounts.filter(a => a.type === 'CASH').length}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Sub-ledger accounts configured
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
      {error && !isCreateModalOpen && !isEditModalOpen && !isDeleteModalOpen && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--danger)', fontSize: '0.875rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid Content */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card skeleton" style={{ height: 220, borderRadius: 'var(--radius-xl)' }} />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          title="No Financial Accounts Configured"
          description="Create your first bank or operating cash account to start ingesting transactions and running automated reconciliation."
          icon={Wallet}
          actionLabel="Create First Account"
          onAction={handleOpenCreate}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {accounts.map((acc) => {
            const Icon = getAccountIcon(acc.type);
            const balance = Number(acc.balance || 0);

            return (
              <div
                key={acc.id}
                className="card card-hover"
                style={{
                  padding: '28px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                  background: 'var(--bg-surface)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--accent-emerald-tint)',
                        border: '1px solid rgba(24, 201, 139, 0.28)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-emerald)'
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                        {acc.name}
                      </h3>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {acc.currency} • Added {new Date(acc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <StatusBadge status={acc.type} />
                </div>

                <div style={{ padding: '16px 18px', background: 'rgba(10, 12, 16, 0.75)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div className="meta-label">
                    Calculated Ledger Balance
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 700, color: balance >= 0 ? 'var(--text-primary)' : 'var(--danger)', marginTop: 4 }} className="financial-figure">
                    ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpenEdit(acc)}
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleOpenDelete(acc)}
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Account Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Financial Account">
        {error && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 16 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Account Name
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Operating Treasury, Main Chase Bank"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Account Type
            </label>
            <select
              className="select"
              value={formType}
              onChange={(e) => setFormType(e.target.value as any)}
            >
              <option value="BANK">Bank Account (Operating)</option>
              <option value="CREDIT">Credit Line / Facility</option>
              <option value="CASH">Cash Reserve</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Currency
            </label>
            <select
              className="select"
              value={formCurrency}
              onChange={(e) => setFormCurrency(e.target.value)}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Account Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Account">
        {error && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 16 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Account Name
            </label>
            <input
              type="text"
              className="input"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Account Type
            </label>
            <select
              className="select"
              value={formType}
              onChange={(e) => setFormType(e.target.value as any)}
            >
              <option value="BANK">Bank Account (Operating)</option>
              <option value="CREDIT">Credit Line / Facility</option>
              <option value="CASH">Cash Reserve</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Currency
            </label>
            <select
              className="select"
              value={formCurrency}
              onChange={(e) => setFormCurrency(e.target.value)}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Account">
        <div style={{ marginBottom: 20 }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Are you sure you want to delete <strong style={{ color: '#FFFFFF' }}>{selectedAccount?.name}</strong>?
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 8 }}>
            Accounts with active transactions or ledger balances cannot be deleted to preserve financial audit compliance.
          </p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={isSubmitting}>
            {isSubmitting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </Modal>
    </div>
  );
};
