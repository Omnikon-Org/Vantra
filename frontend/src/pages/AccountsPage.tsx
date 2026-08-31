import React, { useEffect, useState } from 'react';
import { accountsApi } from '../api/client';
import { Account } from '../types';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { StatusBadge } from '../components/common/Badge';
import {
  Wallet,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Building,
  CreditCard,
  Coins,
  CheckCircle,
  CheckCircle2
} from 'lucide-react';

export const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals state
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
      setError(err.message || 'Failed to fetch accounts');
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
    setFormType(acc.type);
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
    setIsSubmitting(true);
    setError(null);
    try {
      await accountsApi.create({ name: formName, type: formType, currency: formCurrency });
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

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Financial Accounts
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Manage operating bank accounts, credit facilities, and dynamic balance calculations
          </p>
        </div>

        <button className="btn btn-teal" onClick={handleOpenCreate}>
          <Plus size={18} />
          Create Account
        </button>
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
            <div key={i} className="card skeleton" style={{ height: 210 }} />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          title="No Accounts Configured"
          description="Create your first bank or operating account to start ingesting transactions and running reconciliation."
          icon={Wallet}
          actionLabel="Create Account"
          onAction={handleOpenCreate}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {accounts.map((acc) => {
            const Icon = getAccountIcon(acc.type);
            const balance = Number(acc.balance || 0);

            return (
              <div key={acc.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(20, 184, 166, 0.12)',
                        border: '1px solid var(--border-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-teal)'
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
                        {acc.name}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {acc.currency} • Added {new Date(acc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <StatusBadge status={acc.type} />
                </div>

                <div style={{ padding: '14px 16px', background: 'rgba(6, 11, 20, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)' }}>
                  <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Calculated Ledger Balance
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: balance >= 0 ? '#FFFFFF' : 'var(--danger)', marginTop: 4 }} className="financial-figure">
                    ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border-secondary)' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpenEdit(acc)}
                  >
                    <Edit2 size={13} />
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleOpenDelete(acc)}
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Account Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Account">
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
              placeholder="e.g. SVB Operating Checking"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Account Type
              </label>
              <select
                className="select"
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
              >
                <option value="BANK">Bank Account</option>
                <option value="CREDIT">Credit Facility</option>
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
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-teal" disabled={isSubmitting}>
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
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Account Type
              </label>
              <select
                className="select"
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
              >
                <option value="BANK">Bank Account</option>
                <option value="CREDIT">Credit Facility</option>
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
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-teal" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Account Deletion">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--danger)', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Are you sure you want to delete account <strong>{selectedAccount?.name}</strong>?
          </p>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            ⚠️ Accounts containing transactions or ledger entries cannot be deleted without first removing or reversing those transactions.
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
