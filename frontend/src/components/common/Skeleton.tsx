import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 'var(--radius-md)',
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
};

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5
}) => {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height={18} width={`${100 / columns}%`} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {Array.from({ length: rows }).map((_, r) => (
          <Skeleton key={r} height={38} borderRadius="var(--radius-sm)" />
        ))}
      </div>
    </div>
  );
};

export const SkeletonCards: React.FC<{ count?: number; height?: number }> = ({
  count = 4,
  height = 120
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`,
        gap: 16
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card skeleton" style={{ height, borderRadius: 'var(--radius-lg)' }} />
      ))}
    </div>
  );
};
