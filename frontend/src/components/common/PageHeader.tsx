import React from 'react';

interface PageHeaderProps {
  title: React.ReactNode;
  eyebrow?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  eyebrow,
  subtitle,
  badge,
  actions,
  className = ''
}) => {
  return (
    <div
      className={`page-header ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        paddingBottom: 4
      }}
    >
      <div style={{ maxWidth: 780 }}>
        {eyebrow && (
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 6
            }}
          >
            <span style={{ color: 'var(--accent-emerald)', fontSize: '0.65rem' }}>●</span>
            <span>{eyebrow}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.025em',
              lineHeight: 1.15
            }}
          >
            {title}
          </h1>
          {badge}
        </div>

        {subtitle && (
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              marginTop: 5,
              lineHeight: 1.55
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
};
