'use client';

/**
 * 起名测名 —— 五格展示面板
 */

import type { WuGeResult, WuGeGrid } from '@/lib/naming/types';

interface WuGeDisplayProps {
  result: WuGeResult;
}

export default function WuGeDisplay({ result }: WuGeDisplayProps) {
  const grids: WuGeGrid[] = [
    result.tianGe, result.renGe, result.diGe, result.zongGe, result.waiGe,
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[var(--color-ink)]">五格数理</h3>

      <div className="grid grid-cols-5 gap-2">
        {grids.map(g => (
          <GridCard key={g.name} grid={g} />
        ))}
      </div>

      {result.debugInfo && (
        <div className="text-xs text-[var(--color-ink-light)] mt-2 p-3 rounded bg-[var(--color-parchment)]">
          <p className="font-medium mb-1">推算过程</p>
          <pre className="whitespace-pre-wrap">{result.debugInfo}</pre>
        </div>
      )}
    </div>
  );
}

function GridCard({ grid }: { grid: WuGeGrid }) {
  const auspiceColor = grid.auspice === '吉'
    ? 'text-green-600'
    : grid.auspice === '半吉'
      ? 'text-yellow-600'
      : 'text-red-600';

  const wxColor: Record<string, string> = {
    '木': '#22c55e', '火': '#ef4444', '土': '#d97706',
    '金': '#f59e0b', '水': '#3b82f6',
  };

  return (
    <div
      className="rounded-lg p-2 text-center border border-[var(--color-border-warm)]"
      style={{ backgroundColor: 'var(--color-bg-card)' }}
    >
      <div className="text-xs text-[var(--color-ink-light)]">{grid.name}</div>
      <div className="text-xl font-bold text-[var(--color-ink)]">{grid.number}</div>
      <div
        className="text-xs font-medium"
        style={{ color: wxColor[grid.wuxing] || 'inherit' }}
      >
        {grid.wuxing}
      </div>
      <div className={`text-xs font-medium ${auspiceColor}`}>
        {grid.auspice}
      </div>
      {grid.category && (
        <div className="text-xs text-[var(--color-ink-light)] mt-1 leading-tight">
          {grid.category}
        </div>
      )}
    </div>
  );
}
