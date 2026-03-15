'use client';

import { useMemo } from 'react';
import { getWeekDress } from '@/lib/zeji';

interface WeekDressTableProps {
  year: number;
  month: number;
  day: number;
}

export default function WeekDressTable({ year, month, day }: WeekDressTableProps) {
  const weekData = useMemo(() => getWeekDress(year, month, day), [year, month, day]);

  return (
    <div className="card-chinese p-4">
      <h4
        className="text-[17px] font-bold mb-3 flex items-center gap-2"
        style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
      >
        <span>📅</span>
        近7日穿衣颜色预测
      </h4>

      {/* 桌面端表格 */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-warm)]">
              <th className="text-left py-2 px-2 text-[var(--color-ink-light)] font-medium">日期</th>
              <th className="text-center py-2 px-2 text-[var(--color-ink-light)] font-medium">日干</th>
              <th className="text-center py-2 px-2 text-[var(--color-ink-light)] font-medium">日主五行</th>
              <th className="text-left py-2 px-2 text-[var(--color-ink-light)] font-medium">推荐颜色</th>
              <th className="text-left py-2 px-2 text-[var(--color-ink-light)] font-medium">避免颜色</th>
            </tr>
          </thead>
          <tbody>
            {weekData.map((item, i) => (
              <tr
                key={i}
                className={`border-b border-[var(--color-border-warm)]/50 ${
                  i === 0 ? 'bg-[var(--color-cinnabar)]/5' : ''
                }`}
              >
                <td className="py-2 px-2">
                  <span className={i === 0 ? 'font-semibold text-[var(--color-cinnabar)]' : ''}>
                    {item.date}
                  </span>
                  {i === 0 && <span className="ml-1 text-xs text-[var(--color-cinnabar)]">(今日)</span>}
                </td>
                <td className="py-2 px-2 text-center font-semibold" style={{ fontFamily: 'var(--font-family-kai)' }}>
                  {item.dayGan}
                </td>
                <td className="py-2 px-2 text-center">{item.dayWuxing}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.bestColors.map((c, j) => (
                      <span key={j} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border border-green-200 bg-green-50 text-green-700">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full border border-gray-200"
                          style={{ backgroundColor: item.bestHex[j] || '#ccc' }}
                        />
                        {c}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.avoidColors.map((c, j) => (
                      <span key={j} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border border-gray-200 bg-gray-50 text-gray-500 line-through">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full border border-gray-200"
                          style={{ backgroundColor: item.avoidHex[j] || '#ccc' }}
                        />
                        {c}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 移动端卡片 */}
      <div className="md:hidden space-y-2">
        {weekData.map((item, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg border ${
              i === 0
                ? 'border-[var(--color-cinnabar)] bg-[var(--color-cinnabar)]/5'
                : 'border-[var(--color-border-warm)]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${i === 0 ? 'font-semibold text-[var(--color-cinnabar)]' : ''}`}>
                {item.date}
                {i === 0 && <span className="ml-1 text-xs">(今日)</span>}
              </span>
              <span className="text-sm">
                <span className="font-semibold" style={{ fontFamily: 'var(--font-family-kai)' }}>{item.dayGan}</span>
                <span className="text-[var(--color-ink-light)] ml-1">{item.dayWuxing}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-xs text-green-600">宜:</span>
                {item.bestColors.map((c, j) => (
                  <span key={j} className="inline-flex items-center gap-0.5 text-xs text-green-700">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full border border-gray-200"
                      style={{ backgroundColor: item.bestHex[j] || '#ccc' }}
                    />
                    {c}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-xs text-gray-400">忌:</span>
                {item.avoidColors.map((c, j) => (
                  <span key={j} className="inline-flex items-center gap-0.5 text-xs text-gray-400 line-through">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full border border-gray-200"
                      style={{ backgroundColor: item.avoidHex[j] || '#ccc' }}
                    />
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
