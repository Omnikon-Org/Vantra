import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const normalized = status.toUpperCase();
  
  if (['COMPLETED', 'MATCHED', 'RESOLVED', 'EXACT'].includes(normalized)) {
    return <Badge variant="success">{status}</Badge>;
  }
  if (['FAILED', 'DISCREPANT', 'DISCREPANCY', 'CRITICAL', 'HIGH'].includes(normalized)) {
    return <Badge variant="danger">{status}</Badge>;
  }
  if (['PENDING', 'IN_REVIEW', 'MEDIUM', 'FUZZY', 'UNMATCHED'].includes(normalized)) {
    return <Badge variant="warning">{status}</Badge>;
  }
  if (['RECONCILED', 'MANUAL', 'BANK', 'LOW', 'OPEN'].includes(normalized)) {
    return <Badge variant="info">{status}</Badge>;
  }
  return <Badge variant="neutral">{status}</Badge>;
};
