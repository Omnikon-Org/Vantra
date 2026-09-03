import React, { useState } from 'react';
import { Transaction } from '../../types';
import { TrendingUp } from 'lucide-react';

interface CashFlowChartProps {
  transactions: Transaction[];
  onRecordTransaction?: () => void;
  isLoading?: boolean;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({
  transactions,
  onRecordTransaction,
  isLoading
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="card" style={{ padding: '28px 32px' }}>
        <div className="skeleton" style={{ height: 260, borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  // If no transactions exist, render a clean, contextual empty state
  if (!transactions || transactions.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: '48px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: 280,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)'
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
            boxShadow: '0 0 20px rgba(24, 201, 139, 0.16)'
          }}
        >
          <TrendingUp size={22} />
        </div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          No Cash Flow Telemetry Yet
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 360, marginBottom: 20, lineHeight: 1.55 }}>
          Record your first income or expense transaction to establish your organization's cash velocity chart.
        </p>
        {onRecordTransaction && (
          <button className="btn btn-primary btn-sm" onClick={onRecordTransaction}>
            + Record Transaction
          </button>
        )}
      </div>
    );
  }

  // Sort chronological for telemetry visualization
  const sortedTxns = [...transactions].reverse();
  const totalInflow = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalOutflow = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const netFlow = totalInflow - totalOutflow;

  // Compute SVG chart coordinates
  const width = 580;
  const height = 180;
  const paddingX = 30;
  const paddingY = 25;

  const amounts = sortedTxns.map(t => (t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount)));
  const maxAbs = Math.max(...amounts.map(Math.abs), 100);

  const points = sortedTxns.map((t, i) => {
    const x = paddingX + (i / Math.max(sortedTxns.length - 1, 1)) * (width - paddingX * 2);
    const normalized = (amounts[i] / maxAbs) * ((height - paddingY * 2) / 2);
    const y = height / 2 - normalized;
    return { x, y, txn: t, val: amounts[i] };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`, '');

  return (
    <div className="card" style={{ padding: '28px 32px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Cash Flow Velocity
            </h2>
            <span
              style={{
                fontSize: '0.675rem',
                fontWeight: 700,
                color: 'var(--accent-mint)',
                background: 'var(--accent-mint-tint)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(99, 230, 178, 0.28)'
              }}
              className="mono"
            >
              REAL-TIME
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            Net double-entry cash flow generated from {sortedTxns.length} recent transactions
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)' }} />
            <span style={{ color: 'var(--text-muted)' }}>Inflow:</span>
            <strong style={{ color: 'var(--accent-emerald)' }} className="financial-figure">+${totalInflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-primary)' }} />
            <span style={{ color: 'var(--text-muted)' }}>Outflow:</span>
            <strong style={{ color: 'var(--text-primary)' }} className="financial-figure">-${totalOutflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart Container */}
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          {/* Zero baseline grid line at --border-subtle */}
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="var(--border-subtle)"
            strokeDasharray="4 4"
          />

          {/* Area under curve gradient (Emerald) */}
          <defs>
            <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-emerald)" stopOpacity="0.22" />
              <stop offset="80%" stopColor="var(--accent-emerald)" stopOpacity="0.02" />
              <stop offset="100%" stopColor="var(--accent-emerald)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path
            d={`${pathD} L ${points[points.length - 1]?.x || width - paddingX},${height} L ${points[0]?.x || paddingX},${height} Z`}
            fill="url(#flowGradient)"
          />

          {/* Flow Line Path with Emerald Accent */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--accent-emerald)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Points */}
          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;
            const isPositive = p.val >= 0;
            return (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  fill={isPositive ? 'var(--accent-emerald)' : 'var(--text-primary)'}
                  stroke="var(--bg-surface)"
                  strokeWidth="2"
                  style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            style={{
              position: 'absolute',
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / height) * 100}%`,
              transform: 'translate(-50%, -120%)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.55)',
              borderRadius: 'var(--radius-sm)',
              padding: '7px 12px',
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {points[hoveredIndex].txn.description || 'Transaction'}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
              <span
                style={{
                  fontWeight: 700,
                  color: points[hoveredIndex].val >= 0 ? 'var(--accent-emerald)' : 'var(--text-primary)'
                }}
                className="financial-figure"
              >
                {points[hoveredIndex].val >= 0 ? '+' : '-'}$
                {Math.abs(points[hoveredIndex].val).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                {new Date(points[hoveredIndex].txn.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 16,
          paddingTop: 14,
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}
      >
        <span>
          Net Operating Delta: <strong style={{ color: netFlow >= 0 ? 'var(--accent-emerald)' : 'var(--danger)' }} className="financial-figure">{netFlow >= 0 ? '+' : '-'}${Math.abs(netFlow).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
        </span>
        <span className="mono" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>CHRONOLOGICAL DISBURSEMENT STREAM</span>
      </div>
    </div>
  );
};
