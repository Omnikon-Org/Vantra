import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: 'gold' | 'blue' | 'violet' | 'teal' | 'emerald' | 'cyan' | 'amber' | 'red';
  trend?: string;
  isPositive?: boolean;
  isLoading?: boolean;
  isDominant?: boolean;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const renderFormattedStatValue = (val: string | number): React.ReactNode => {
  if (val === undefined || val === null) return '0';
  const str = String(val).trim();

  // Pattern A: Percentage e.g. "100.0%"
  if (str.endsWith('%')) {
    const num = str.slice(0, -1);
    return (
      <>
        <span>{num}</span>
        <span
          style={{
            color: 'var(--accent-gold)',
            fontSize: '0.6em',
            verticalAlign: 'super',
            fontWeight: 700,
            marginLeft: 2
          }}
        >
          %
        </span>
      </>
    );
  }

  // Pattern B: Plussed number e.g. "2,500+" or "100+"
  if (str.endsWith('+')) {
    const num = str.slice(0, -1);
    return (
      <>
        <span>{num}</span>
        <span
          style={{
            color: 'var(--accent-gold)',
            fontSize: '0.62em',
            verticalAlign: 'super',
            fontWeight: 700,
            marginLeft: 2
          }}
        >
          +
        </span>
      </>
    );
  }

  // Pattern C: Suffix like "0 Records" or "12 Items"
  const suffixMatch = str.match(/^([\$\+\-]?[\d\.,]+)\s+(Records|Items|Accounts)$/i);
  if (suffixMatch) {
    const num = suffixMatch[1];
    const suffix = suffixMatch[2];
    return (
      <>
        <span>{num}</span>
        <span
          style={{
            color: 'var(--accent-gold)',
            fontSize: '0.45em',
            verticalAlign: 'super',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginLeft: 4
          }}
        >
          {suffix}
        </span>
      </>
    );
  }

  // Pattern D: Ratio like "45/100"
  if (str.includes('/100')) {
    const [score] = str.split('/100');
    return (
      <>
        <span>{score}</span>
        <span
          style={{
            color: 'var(--accent-gold)',
            fontSize: '0.5em',
            verticalAlign: 'super',
            fontWeight: 700,
            marginLeft: 3
          }}
        >
          /100
        </span>
      </>
    );
  }

  return <span>{str}</span>;
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = 'gold',
  trend,
  isPositive,
  isLoading,
  isDominant = false,
  badge,
  footer,
  className = ''
}) => {
  const getColorScheme = () => {
    switch (accentColor) {
      case 'emerald':
        return {
          color: 'var(--success)',
          bg: 'var(--success-bg)',
          border: 'var(--success-border)',
          glow: 'rgba(34, 197, 94, 0.15)'
        };
      case 'amber':
        return {
          color: 'var(--warning)',
          bg: 'var(--warning-bg)',
          border: 'var(--warning-border)',
          glow: 'rgba(245, 166, 35, 0.15)'
        };
      case 'red':
        return {
          color: 'var(--danger)',
          bg: 'var(--danger-bg)',
          border: 'var(--danger-border)',
          glow: 'rgba(239, 68, 68, 0.18)'
        };
      case 'gold':
      case 'blue':
      case 'teal':
      case 'cyan':
      case 'violet':
      default:
        return {
          color: 'var(--accent-gold)',
          bg: 'var(--accent-gold-tint)',
          border: 'rgba(212, 165, 72, 0.28)',
          glow: 'rgba(212, 165, 72, 0.16)'
        };
    }
  };

  const scheme = getColorScheme();

  if (isLoading) {
    return (
      <div
        className="card skeleton"
        style={{
          height: isDominant ? 180 : 150,
          borderRadius: 'var(--radius-xl)'
        }}
      />
    );
  }

  if (isDominant) {
    return (
      <div
        className={`card card-hover ${className}`}
        style={{
          padding: '28px 32px',
          background: 'linear-gradient(135deg, rgba(18, 20, 26, 0.98) 0%, rgba(28, 31, 41, 0.92) 100%)',
          borderColor: 'rgba(212, 165, 72, 0.32)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45), 0 0 24px rgba(212, 165, 72, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-gold-tint)',
                color: 'var(--accent-gold)',
                border: '1px solid rgba(212, 165, 72, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(212, 165, 72, 0.18)'
              }}
            >
              <Icon size={20} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.09em'
                }}
              >
                {title}
              </div>
            </div>
          </div>
          {badge}
        </div>

        <div>
          <div
            style={{
              fontSize: 'clamp(2.25rem, 3.8vw, 2.75rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              lineHeight: 1.05
            }}
            className="financial-figure"
          >
            {renderFormattedStatValue(value)}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 10,
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}
          >
            <span>{subtitle}</span>
            {trend && (
              <span
                style={{
                  color: isPositive ? 'var(--success)' : 'var(--danger)',
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}
              >
                {trend}
              </span>
            )}
          </div>
        </div>

        {footer}
      </div>
    );
  }

  // Standard KPI Card
  return (
    <div
      className={`card card-hover ${className}`}
      style={{
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.09em'
          }}
        >
          {title}
        </div>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-sm)',
            background: scheme.bg,
            color: scheme.color,
            border: `1px solid ${scheme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon size={16} />
        </div>
      </div>

      <div>
        <div
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
        </div>

        {subtitle && (
          <div
            style={{
              fontSize: '0.775rem',
              color: 'var(--text-secondary)',
              marginTop: 6
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {footer}
    </div>
  );
};
