'use client';

import { useState } from 'react';
import type { PalaceId, QimenResult, SwapAction } from '@/lib/qimen';
import { PALACE_INFO } from '@/lib/qimen';

interface StarSwapPanelProps {
  result: QimenResult;
  onSwap: (action: SwapAction) => void;
  swapHistory: SwapAction[];
  onReset: () => void;
}

const OUTER_PALACES: PalaceId[] = [1, 2, 3, 4, 6, 7, 8, 9];

export default function StarSwapPanel({ result, onSwap, swapHistory, onReset }: StarSwapPanelProps) {
  const [sourcePalace, setSourcePalace] = useState<PalaceId | null>(null);
  const [targetPalace, setTargetPalace] = useState<PalaceId | null>(null);

  const handleSwap = () => {
    if (!sourcePalace || !targetPalace) return;
    if (sourcePalace === targetPalace) return;
    onSwap({ sourcePalace, targetPalace });
    setSourcePalace(null);
    setTargetPalace(null);
  };

  return (
    <div className="card-chinese p-4 space-y-3">
      <h3
        className="text-sm font-bold"
        style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
      >
        移星换斗（阴盘专属）
      </h3>

      <p className="text-xs" style={{ color: 'var(--color-ink-light)' }}>
        选择两个宫位，交换其九星和天盘天干
      </p>

      {/* 源宫选择 */}
      <div>
        <label className="form-label">源宫</label>
        <div className="flex flex-wrap gap-1.5">
          {OUTER_PALACES.map(pid => {
            const palace = result.palaces[pid];
            const isActive = sourcePalace === pid;
            return (
              <button
                key={`src-${pid}`}
                className="px-2 py-1 text-xs rounded-md border transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--color-cinnabar)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--color-ink)',
                  borderColor: isActive ? 'var(--color-cinnabar)' : 'var(--color-border-warm)',
                }}
                onClick={() => setSourcePalace(pid)}
              >
                {PALACE_INFO[pid].direction} {palace.star?.name || ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* 目标宫选择 */}
      <div>
        <label className="form-label">目标宫</label>
        <div className="flex flex-wrap gap-1.5">
          {OUTER_PALACES.filter(p => p !== sourcePalace).map(pid => {
            const palace = result.palaces[pid];
            const isActive = targetPalace === pid;
            return (
              <button
                key={`tgt-${pid}`}
                className="px-2 py-1 text-xs rounded-md border transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--color-gold)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--color-ink)',
                  borderColor: isActive ? 'var(--color-gold)' : 'var(--color-border-warm)',
                }}
                onClick={() => setTargetPalace(pid)}
              >
                {PALACE_INFO[pid].direction} {palace.star?.name || ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button
          className="btn-primary text-sm py-1.5 px-4"
          disabled={!sourcePalace || !targetPalace}
          onClick={handleSwap}
          style={{ opacity: (!sourcePalace || !targetPalace) ? 0.5 : 1 }}
        >
          交换
        </button>
        <button className="btn-outline text-sm py-1.5 px-4" onClick={onReset}>
          重置
        </button>
      </div>

      {/* 操作历史 */}
      {swapHistory.length > 0 && (
        <div>
          <label className="form-label">操作记录</label>
          <div className="space-y-1">
            {swapHistory.map((action, i) => (
              <div key={i} className="text-xs" style={{ color: 'var(--color-ink-light)' }}>
                {i + 1}. {PALACE_INFO[action.sourcePalace].name} ↔ {PALACE_INFO[action.targetPalace].name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
