import React from 'react';
import { LucideIcon, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = FolderOpen,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = ''
}) => {
  return (
    <div
      className={`card ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '52px 24px',
        textAlign: 'center',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px dashed var(--border-subtle)',
        margin: '16px 0'
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--accent-emerald-tint)',
          color: 'var(--accent-emerald)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          border: '1px solid rgba(24, 201, 139, 0.28)',
          boxShadow: '0 0 18px rgba(24, 201, 139, 0.14)'
        }}
      >
        <Icon size={22} />
      </div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.01em' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 420, lineHeight: 1.55, marginBottom: (actionLabel || secondaryActionLabel) ? 20 : 0 }}>
        {description}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {actionLabel && onAction && (
          <button className="btn btn-primary btn-sm" onClick={onAction}>
            {actionLabel}
          </button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <button className="btn btn-secondary btn-sm" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
