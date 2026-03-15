'use client';

import { useMemo } from 'react';
import { getDailyDress } from '@/lib/zeji';

interface DressColorProps {
  dayGan: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  '贵人色': '👑',
  '进取色': '🚀',
  '求财色': '💰',
  '消耗色': '💧',
  '不利色': '⚠️',
};

export default function DressColor({ dayGan }: DressColorProps) {
  const result = useMemo(() => getDailyDress(dayGan), [dayGan]);

  return (
    <div className="card-chinese p-4">
      <h4
        className="text-[17px] font-bold mb-3 flex items-center gap-2"
        style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
      >
        <span>👔</span>
        每日穿衣颜色
      </h4>

      <div className="text-sm text-[var(--color-ink-light)] mb-3">
        今日日主五行：<span className="font-semibold" style={{ color: 'var(--color-primary-dark)' }}>{result.dayWuxing}</span>
      </div>

      <div className="space-y-2.5">
        {result.categories.map((cat, i) => {
          const isAvoid = cat.category === '不利色';
          const isDrain = cat.category === '消耗色';
          return (
            <div
              key={i}
              className={`flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-lg ${
                isAvoid ? 'bg-gray-50' : isDrain ? 'bg-gray-50/50' : 'bg-[var(--color-parchment)]/40'
              }`}
            >
              <div className="flex items-center gap-2 min-w-[120px]">
                <span className="text-sm">{CATEGORY_ICONS[cat.category] || ''}</span>
                <span className={`text-sm font-semibold ${isAvoid ? 'text-gray-500' : ''}`}>
                  {cat.category}
                </span>
                <span className="text-xs text-[var(--color-ink-light)]">({cat.relation})</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {cat.colors.map((color, j) => (
                  <span
                    key={j}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm border ${
                      isAvoid ? 'border-gray-200 text-gray-500 line-through' : 'border-[var(--color-border-warm)]'
                    }`}
                  >
                    <span
                      className="inline-block w-3 h-3 rounded-full border border-gray-200"
                      style={{ backgroundColor: cat.hexColors[j] || '#ccc' }}
                    />
                    {color}
                  </span>
                ))}
              </div>

              <span className={`text-xs ${isAvoid ? 'text-gray-400' : 'text-[var(--color-ink-light)]'} sm:ml-auto whitespace-nowrap`}>
                {cat.description}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
