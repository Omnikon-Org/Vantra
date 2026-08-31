import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading financial data...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        gap: 16,
        color: 'var(--text-muted)'
      }}
    >
      <Loader2
        size={36}
        style={{
          animation: 'spin 1s linear infinite',
          color: 'var(--accent-primary)'
        }}
      />
      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message}</span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
