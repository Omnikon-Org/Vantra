import React from 'react';
import { LucideIcon } from 'lucide-react';
import { renderFormattedStatValue } from './MetricCard';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  accentColor?: 'gold' | 'blue' | 'violet' | 'teal' | 'emerald' | 'cyan' | 'amber' | 'red';
  trend?: string;
  isLoading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'primary',
  accentColor = 'gold',
  trend,
  isLoading
}) => {
  const getColor = () => {
    switch (accentColor) {
      case 'emerald': return { color: 'var(--success)', bg: 'var(--success-bg)', border: 'var(--success-border)' };
      case 'amber': return { color: 'var(--warning)', bg: 'var(--warning-bg)', border: 'var(--warning-border)' };
      case 'red': return { color: 'var(--danger)', bg: 'var(--danger-bg)', border: 'var(--danger-border)' };
      case 'gold':
      case 'blue':
      case 'teal':
      case 'cyan':
      case 'violet':
      default: return { color: 'var(--accent-gold)', bg: 'var(--accent-gold-tint)', border: 'rgba(212, 165, 72, 0.28)' };
    }
  };

  const scheme = getColor();

  if (isLoading) {
    return <div className="card skeleton" style={{ height: 150, borderRadius: 'var(--radius-xl)' }} />;
  }

  return (
    <div
      className="card card-hover"
      style={{
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="meta-label">
          {title}
        </span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            background: scheme.bg,
            color: scheme.color,
            border: `1px solid ${scheme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon size={18} />
        </div>
      </div>

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span
          style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            lineHeight: 1.1
          }}
          className="financial-figure"
        >
          {renderFormattedStatValue(value)}
        </span>
        {trend && (
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)' }}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: 6 }}>
          {subtitle}
        </span>
      )}
    </div>
  );
};
