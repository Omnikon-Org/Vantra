import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  trend?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'primary',
  trend
}) => {
  const getIconColor = () => {
    switch (variant) {
      case 'success': return 'var(--success)';
      case 'danger': return 'var(--danger)';
      case 'warning': return 'var(--warning)';
      case 'info': return 'var(--info)';
      default: return 'var(--accent-primary)';
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case 'success': return 'var(--success-bg)';
      case 'danger': return 'var(--danger-bg)';
      case 'warning': return 'var(--warning-bg)';
      case 'info': return 'var(--info-bg)';
      default: return 'var(--accent-primary-glow)';
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{title}</span>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-md)',
            background: getIconBg(),
            color: getIconColor(),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon size={20} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }} className="financial-figure">
          {value}
        </span>
        {trend && (
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: variant === 'danger' ? 'var(--danger)' : 'var(--success)' }}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
};
