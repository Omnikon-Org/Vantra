import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  GitMerge,
  AlertOctagon,
  ShieldAlert,
  ScrollText,
  PlusCircle,
  Play,
  Command,
  LucideIcon
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  category: 'Navigation' | 'Actions';
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewTransaction?: () => void;
  onOpenRunRecon?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenNewTransaction,
  onOpenRunRecon
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'nav-dashboard',
      title: 'Go to Financial Overview',
      subtitle: 'Dashboard KPI command center and cash flow',
      icon: LayoutDashboard,
      category: 'Navigation',
      action: () => { navigate('/dashboard'); onClose(); }
    },
    {
      id: 'nav-accounts',
      title: 'View Accounts & Ledgers',
      subtitle: 'Inspect bank, credit, and cash accounts',
      icon: Wallet,
      category: 'Navigation',
      action: () => { navigate('/accounts'); onClose(); }
    },
    {
      id: 'nav-transactions',
      title: 'Search Transactions',
      subtitle: 'View double-entry journal entries and records',
      icon: ArrowLeftRight,
      category: 'Navigation',
      action: () => { navigate('/transactions'); onClose(); }
    },
    {
      id: 'nav-recon',
      title: 'Open Reconciliation Center',
      subtitle: 'Run multi-pass matching and review sessions',
      icon: GitMerge,
      category: 'Navigation',
      action: () => { navigate('/reconciliation'); onClose(); }
    },
    {
      id: 'nav-exceptions',
      title: 'View Discrepancy Exceptions',
      subtitle: 'Resolve variance risks and unmatched records',
      icon: AlertOctagon,
      category: 'Navigation',
      action: () => { navigate('/exceptions'); onClose(); }
    },
    {
      id: 'nav-fraud',
      title: 'Open Fraud Detection Center',
      subtitle: 'Monitor suspicious transactions and risk scores',
      icon: ShieldAlert,
      category: 'Navigation',
      action: () => { navigate('/fraud'); onClose(); }
    },
    {
      id: 'nav-audit',
      title: 'Inspect System Audit Logs',
      subtitle: 'Immutable compliance trail and event metadata',
      icon: ScrollText,
      category: 'Navigation',
      action: () => { navigate('/audit-logs'); onClose(); }
    },
    {
      id: 'act-new-tx',
      title: 'Record New Transaction',
      subtitle: 'Ingest a balanced debit/credit transaction',
      icon: PlusCircle,
      category: 'Actions',
      action: () => {
        navigate('/transactions');
        onClose();
        if (onOpenNewTransaction) onOpenNewTransaction();
      }
    },
    {
      id: 'act-run-recon',
      title: 'Execute Reconciliation Session',
      subtitle: 'Compare ledger entries with statement feed',
      icon: Play,
      category: 'Actions',
      action: () => {
        navigate('/reconciliation');
        onClose();
        if (onOpenRunRecon) onOpenRunRecon();
      }
    },
    {
      id: 'act-run-fraud-scan',
      title: 'Execute Fraud Risk Scan',
      subtitle: 'Run rule-based anomaly detection on transactions',
      icon: ShieldAlert,
      category: 'Actions',
      action: () => {
        navigate('/fraud');
        onClose();
      }
    }
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(3, 7, 18, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        zIndex: 9999,
        paddingLeft: 16,
        paddingRight: 16
      }}
      onClick={onClose}
    >
      <div
        className="command-palette-modal card"
        style={{
          width: '100%',
          maxWidth: 620,
          background: 'var(--bg-card)',
          border: '1px solid rgba(20, 184, 166, 0.3)',
          boxShadow: 'var(--shadow-lg), 0 0 35px rgba(20, 184, 166, 0.12)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-primary)',
            background: 'rgba(6, 11, 20, 0.7)'
          }}
        >
          <Search size={18} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or jump to page (e.g. 'Fraud', 'Reconciliation', 'Transactions')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.95rem',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.06)',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--text-muted)'
            }}
          >
            <span>ESC</span>
          </div>
        </div>

        {/* Command List */}
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: 8 }}>
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No commands found for "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(20, 184, 166, 0.12)' : 'transparent',
                    border: isSelected ? '1px solid rgba(20, 184, 166, 0.28)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'var(--accent-teal)' : 'rgba(255, 255, 255, 0.05)',
                        color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.12s ease'
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: isSelected ? '#FFFFFF' : 'var(--text-primary)' }}>
                        {cmd.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {cmd.subtitle}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    {cmd.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 18px',
            borderTop: '1px solid var(--border-secondary)',
            background: 'rgba(6, 11, 20, 0.5)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Command size={12} />
            <span>Vantra Instant Command</span>
          </div>
        </div>
      </div>
    </div>
  );
};
