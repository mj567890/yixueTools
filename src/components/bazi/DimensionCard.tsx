'use client';

import { useState } from 'react';
import type { DimensionInterpretation } from '@/lib/lunar';
import { WU_XING_COLORS } from '@/lib/lunar';

interface DimensionCardProps {
  dim: DimensionInterpretation;
  defaultOpen?: boolean;
}

/** 高亮类型配色 */
const HIGHLIGHT_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  positive: { text: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
  negative: { text: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  neutral: { text: '#B8860B', bg: '#FFFBEB', border: '#FDE68A' },
};

/** 运期类型配色 */
const PERIOD_COLORS: Record<string, { text: string; bg: string }> = {
  opportunity: { text: '#15803D', bg: '#F0FDF4' },
  risk: { text: '#DC2626', bg: '#FEF2F2' },
  neutral: { text: '#6B7280', bg: '#F9FAFB' },
};

/**
 * 维度折叠卡片组件
 *
 * 每个维度解读的通用展示卡片，支持折叠/展开。
 * 包含：标题（五行配色）、核心结论、详细解读、关键结论（金色高亮）、运期参考。
 */
export default function DimensionCard({ dim, defaultOpen = false }: DimensionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const colors = WU_XING_COLORS[dim.colorElement] || { text: '#333', bg: '#f5f5f5' };

  return (
    <div
      className="rounded-xl border overflow-hidden transition-shadow hover:shadow-md"
      style={{ borderColor: 'var(--color-border-warm)' }}
    >
      {/* 标题栏 - 始终可见 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
        style={{
          backgroundColor: isOpen ? colors.bg : '#fff',
        }}
      >
        <span className="text-2xl shrink-0">{dim.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="font-bold text-base"
              style={{
                fontFamily: 'var(--font-family-kai)',
                color: colors.text,
              }}
            >
              {dim.title}
            </span>
            {/* 五行标签 */}
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ color: colors.text, backgroundColor: colors.bg }}
            >
              {dim.colorElement}
            </span>
          </div>
          {/* 折叠时显示结论摘要 */}
          {!isOpen && (
            <p
              className="text-xs mt-0.5 truncate"
              style={{ color: 'var(--color-ink-light)' }}
            >
              {dim.conclusion}
            </p>
          )}
        </div>
        {/* 展开/折叠指示器 */}
        <span
          className="text-sm shrink-0 transition-transform"
          style={{
            color: 'var(--color-ink-light)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ▼
        </span>
      </button>

      {/* 展开内容 */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          {/* 核心结论 */}
          <div
            className="p-3 rounded-lg border-l-4"
            style={{
              backgroundColor: 'var(--color-parchment)',
              borderLeftColor: colors.text,
            }}
          >
            <div
              className="text-[10px] font-bold mb-1"
              style={{ color: colors.text }}
            >
              核心结论
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{
                fontFamily: 'var(--font-family-kai)',
                color: 'var(--color-primary-dark)',
              }}
            >
              {dim.conclusion}
            </p>
          </div>

          {/* 关键结论（金色高亮） */}
          {dim.highlights.length > 0 && (
            <div className="space-y-1.5">
              {dim.highlights.map((h, i) => {
                const hc = HIGHLIGHT_COLORS[h.type] || HIGHLIGHT_COLORS.neutral;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs border"
                    style={{
                      color: h.type === 'neutral' ? '#B8860B' : hc.text,
                      backgroundColor: h.type === 'neutral' ? '#FFFBEB' : hc.bg,
                      borderColor: h.type === 'neutral' ? '#FDE68A' : hc.border,
                    }}
                  >
                    <span className="shrink-0 mt-px">
                      {h.type === 'positive' ? '★' : h.type === 'negative' ? '▲' : '◆'}
                    </span>
                    <span className="font-medium">{h.text}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 详细解读 */}
          <div className="space-y-2">
            {dim.details.map((text, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-ink)' }}
              >
                {text}
              </p>
            ))}
          </div>

          {/* 大运/流年参考 */}
          {dim.periodRefs.length > 0 && (
            <div>
              <div
                className="text-[10px] font-bold mb-2"
                style={{ color: 'var(--color-ink-light)' }}
              >
                大运时间参考
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dim.periodRefs.map((ref, i) => {
                  const pc = PERIOD_COLORS[ref.type] || PERIOD_COLORS.neutral;
                  return (
                    <div
                      key={i}
                      className="text-[11px] px-2 py-1 rounded-lg border"
                      style={{
                        color: pc.text,
                        backgroundColor: pc.bg,
                        borderColor: 'var(--color-border-warm)',
                      }}
                      title={ref.description}
                    >
                      <span className="font-bold">{ref.period}</span>{' '}
                      <span>{ref.ganZhi}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
