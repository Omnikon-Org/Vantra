import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'emerald' | 'mint';
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '', style }) => {
  return (
    <span className={`badge badge-${variant} ${className}`} style={style}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className = '' }) => {
  const normalized = status.toUpperCase();
  
  if (['COMPLETED', 'MATCHED', 'RESOLVED', 'EXACT', 'BALANCED'].includes(normalized)) {
    return <Badge variant="success" className={className}>{status}</Badge>;
  }
  if (['CLEARED', 'SYNCHRONIZED', 'SYNCED', 'VERIFIED', 'OPTIMAL'].includes(normalized)) {
    return <Badge variant="mint" className={className}>{status}</Badge>;
  }
  if (['FAILED', 'DISCREPANT', 'DISCREPANCY', 'CRITICAL', 'CONFIRMED', 'RISK ALERT'].includes(normalized)) {
    return <Badge variant="danger" className={className}>{status}</Badge>;
  }
  if (['HIGH', 'MEDIUM', 'WARNING', 'FUZZY', 'UNMATCHED', 'OPEN', 'VARIANCE'].includes(normalized)) {
    return <Badge variant="warning" className={className}>{status}</Badge>;
  }
  if (['PENDING', 'IN_REVIEW', 'RECONCILED', 'MANUAL', 'BANK', 'LOW'].includes(normalized)) {
    return <Badge variant="emerald" className={className}>{status}</Badge>;
  }
  return <Badge variant="neutral" className={className}>{status}</Badge>;
};
