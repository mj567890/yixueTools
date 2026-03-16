'use client';

import { useMemo } from 'react';
import { getDailyDress, getPersonalDailyDress, type PersonalBaziInput } from '@/lib/zeji';

interface DressColorProps {
  dayGan: string;
  targetYear: number;
  targetMonth: number;
  targetDay: number;
  bazi?: PersonalBaziInput | null;
}

const CATEGORY_ICONS: Record<string, string> = {
  '得时色': '☀️',
  '和谐色': '🤝',
  '进取色': '🚀',
  '消耗色': '💧',
  '不利色': '⚠️',
  '最佳色': '👑',
  '次吉色': '🌟',
  '可选色': '👍',
  '忌穿色': '⛔',
};

export default function DressColor({ dayGan, targetYear, targetMonth, targetDay, bazi }: DressColorProps) {
  const result = useMemo(() => {
    if (bazi) {
      return getPersonalDailyDress(bazi, targetYear, targetMonth, targetDay);
    }
    return getDailyDress(dayGan);
  }, [dayGan, targetYear, targetMonth, targetDay, bazi]);

  return (
    <div className="card-chinese p-4">
      <h4
        className="text-[17px] font-bold mb-3 flex items-center gap-2"
        style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
      >
        <span>👔</span>
        每日穿衣颜色
        {result.mode === 'personal' && (
          <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-[var(--color-cinnabar)]/10 text-[var(--color-cinnabar)]">
            个人定制
          </span>
        )}
      </h4>

      <div className="text-sm text-[var(--color-ink-light)] mb-3">
        {result.mode === 'personal' ? (
          <span>{result.modeLabel}</span>
        ) : (
          <span>
            今日流日五行：
            <span className="font-semibold" style={{ color: 'var(--color-primary-dark)' }}>{result.dayGan}({result.dayWuxing})</span>
            <span className="ml-2 text-xs">— 颜色为"我"，天时为"环境"</span>
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {result.categories.map((cat, i) => {
          const isAvoid = cat.category === '不利色' || cat.category === '忌穿色';
          const isDrain = cat.category === '消耗色';
          return (
            <div
              key={i}
              className={`flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-lg ${
                isAvoid ? 'bg-gray-50' : isDrain ? 'bg-gray-50/50' : 'bg-[var(--color-parchment)]/40'
              }`}
            >
              <div className="flex items-center gap-2 min-w-[120px]">
                <span className="text-sm">{CATEGORY_ICONS[cat.category] || '•'}</span>
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
