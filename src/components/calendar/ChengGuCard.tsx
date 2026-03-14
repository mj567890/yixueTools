'use client';

import { ChengGuResult } from '@/lib/lunar';

interface ChengGuCardProps {
  data: ChengGuResult;
}

export default function ChengGuCard({ data }: ChengGuCardProps) {
  // 根据总重量映射等级
  const getLevel = (weight: number) => {
    if (weight < 3.0) return { label: '偏轻', color: '#78909C' };
    if (weight < 4.0) return { label: '中等', color: '#F57F17' };
    if (weight < 5.0) return { label: '偏重', color: '#2E7D32' };
    if (weight < 6.0) return { label: '较重', color: '#1565C0' };
    return { label: '极重', color: '#6A1B9A' };
  };

  const level = getLevel(data.totalWeight);

  return (
    <div className="card-chinese p-5">
      <h3
        className="section-title mb-5"
        style={{ fontSize: '1.1rem' }}
      >
        称骨论命
      </h3>

      {/* 骨重展示 */}
      <div className="flex items-center justify-center mb-5">
        <div className="text-center">
          <div
            className="text-4xl font-bold mb-1"
            style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-cinnabar)' }}
          >
            {data.totalWeightStr}
          </div>
          <div className="text-sm text-[var(--color-ink-light)]">
            总骨重 {data.totalWeight.toFixed(1)} 两
          </div>
          <span
            className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs text-white"
            style={{ backgroundColor: level.color }}
          >
            {level.label}
          </span>
        </div>
      </div>

      {/* 各柱重量 */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: '年', weight: data.yearWeight },
          { label: '月', weight: data.monthWeight },
          { label: '日', weight: data.dayWeight },
          { label: '时', weight: data.hourWeight },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <div className="text-xs text-[var(--color-ink-light)] mb-1">{item.label}</div>
            <div className="bg-[var(--color-parchment)] rounded-lg py-2">
              <span
                className="text-lg font-bold"
                style={{ color: 'var(--color-primary-dark)' }}
              >
                {item.weight.toFixed(1)}
              </span>
              <span className="text-xs text-[var(--color-ink-light)]"> 两</span>
            </div>
          </div>
        ))}
      </div>

      {/* 批语 */}
      <div className="bg-[var(--color-parchment)] rounded-lg p-4 text-center">
        <div className="text-xs text-[var(--color-ink-light)] mb-2">批语</div>
        <p
          className="text-base leading-relaxed"
          style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
        >
          {data.comment}
        </p>
      </div>

      <p className="text-xs text-[var(--color-ink-light)] mt-3 text-center opacity-60">
        * 称骨论命源自唐代袁天罡，仅供文化研究参考，请勿迷信
      </p>
    </div>
  );
}
