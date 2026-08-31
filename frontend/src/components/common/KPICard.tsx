import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  accentColor?: 'teal' | 'emerald' | 'cyan' | 'amber';
  trend?: string;
  isLoading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'primary',
  accentColor = 'teal',
  trend,
  isLoading
}) => {
  const getColor = () => {
    switch (accentColor) {
      case 'emerald': return { color: 'var(--success)', bg: 'var(--success-bg)', border: 'var(--success-border)' };
      case 'cyan': return { color: 'var(--accent-cyan)', bg: 'rgba(6, 182, 212, 0.1)', border: 'var(--border-cyan)' };
      case 'amber': return { color: 'var(--warning)', bg: 'var(--warning-bg)', border: 'var(--warning-border)' };
      default: return { color: 'var(--accent-teal)', bg: 'rgba(20, 184, 166, 0.1)', border: 'var(--border-accent)' };
    }
  };

  const scheme = getColor();

  if (isLoading) {
    return <div className="card skeleton" style={{ height: 130, borderRadius: 'var(--radius-lg)' }} />;
  }

  return (
    <div
      className="card card-hover"
      style={{
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'var(--bg-card)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span
          style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}
          className="financial-figure"
        >
          {value}
        </span>
        {trend && (
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)' }}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          {subtitle}
        </span>
      )}
    </div>
  );
};
