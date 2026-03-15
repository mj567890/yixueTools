'use client';

import { useMemo } from 'react';
import { getWuxingClass } from '@/lib/lunar';
import { getLuckyDirections } from '@/lib/zeji';

interface LuckyDirectionProps {
  dayGan: string;
}

const LEVEL_STYLE: Record<string, string> = {
  '大吉': 'bg-red-100 text-red-700 border-red-200',
  '吉': 'bg-green-100 text-green-700 border-green-200',
  '小吉': 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

export default function LuckyDirection({ dayGan }: LuckyDirectionProps) {
  const result = useMemo(() => getLuckyDirections(dayGan), [dayGan]);

  return (
    <div className="card-chinese p-4">
      <h4
        className="text-[17px] font-bold mb-3 flex items-center gap-2"
        style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
      >
        <span>🧭</span>
        每日吉祥方位
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        {result.directions.map((dir, i) => (
          <div
            key={i}
            className="flex flex-col gap-1.5 p-3 rounded-lg bg-[var(--color-parchment)]/50"
          >
            <div className="flex items-center gap-2">
              <span
                className="text-xl font-bold"
                style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
              >
                {dir.name}方
              </span>
              <span className={`tag-element ${getWuxingClass(dir.wuxing)}`}>{dir.wuxing}</span>
              <span className={`inline-block px-1.5 py-0.5 rounded text-xs border ${LEVEL_STYLE[dir.level] || ''}`}>
                {dir.level}
              </span>
            </div>
            <span className="text-sm text-[var(--color-ink-light)]">{dir.scene}</span>
          </div>
        ))}
      </div>

      {/* 财神方位 */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-gold)]/10">
        <span className="text-lg">🏮</span>
        <span className="text-base font-medium" style={{ color: 'var(--color-gold)' }}>
          财神方位：{result.caiShen}
        </span>
      </div>
    </div>
  );
}
