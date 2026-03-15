'use client';

import type { FourDimensionAnalysis, DimensionResult } from '@/lib/lunar';

interface AnalysisPanelProps {
  analysis: FourDimensionAnalysis;
}

/** 维度等级配色 */
const GRADE_COLORS: Record<string, { text: string; bg: string; bar: string }> = {
  '上吉': { text: '#15803D', bg: '#DCFCE7', bar: '#22C55E' },
  '吉':   { text: '#1D4ED8', bg: '#DBEAFE', bar: '#3B82F6' },
  '中':   { text: '#7C3AED', bg: '#EDE9FE', bar: '#8B5CF6' },
  '平':   { text: '#6B7280', bg: '#F3F4F6', bar: '#9CA3AF' },
  '不利': { text: '#DC2626', bg: '#FEF2F2', bar: '#EF4444' },
};

function DimensionCard({ dim }: { dim: DimensionResult }) {
  const gradeColor = GRADE_COLORS[dim.grade] || GRADE_COLORS['平'];
  const barWidth = Math.max(dim.score, 5);

  return (
    <div
      className="rounded-xl p-4 border transition-all hover:shadow-md"
      style={{ borderColor: 'var(--color-border-warm)', backgroundColor: '#fff' }}
    >
      {/* 头部：图标 + 标签 + 等级 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{dim.icon}</span>
          <span
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
          >
            {dim.label}
          </span>
        </div>
        {/* text-xs→text-sm(14px) */}
        <span
          className="text-sm px-2 py-0.5 rounded-full font-medium"
          style={{
            color: gradeColor.text,
            backgroundColor: gradeColor.bg,
          }}
        >
          {dim.grade}
        </span>
      </div>

      {/* 分数进度条 */}
      <div className="mb-3">
        {/* text-[10px]→text-sm(14px) */}
        <div className="flex items-center justify-between text-sm mb-1">
          <span style={{ color: 'var(--color-ink-light)' }}>综合评分</span>
          <span className="font-bold" style={{ color: gradeColor.text }}>{dim.score}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F5F0EB' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${barWidth}%`,
              backgroundColor: gradeColor.bar,
            }}
          />
        </div>
      </div>

      {/* 关键词标签 — text-[10px]→text-sm(14px) */}
      {dim.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {dim.keywords.slice(0, 4).map((kw, i) => (
            <span
              key={i}
              className="text-sm px-2 py-0.5 rounded"
              style={{
                color: 'var(--color-primary-dark)',
                backgroundColor: 'var(--color-parchment)',
              }}
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* 解读文字 — text-xs→text-base(16px) */}
      <p
        className="text-base leading-relaxed"
        style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-ink-light)' }}
      >
        {dim.summary}
      </p>
    </div>
  );
}

/**
 * 四维分析面板组件
 */
export default function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  const dimensions: DimensionResult[] = [
    analysis.career,
    analysis.wealth,
    analysis.marriage,
    analysis.health,
  ];

  // 综合评分
  const avgScore = Math.round(
    dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length,
  );

  return (
    <div className="card-chinese p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="section-title">
          四维分析
        </h3>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
          style={{
            borderColor: 'var(--color-border-warm)',
            backgroundColor: 'var(--color-parchment)',
          }}
        >
          {/* text-xs→text-sm(14px) */}
          <span className="text-sm" style={{ color: 'var(--color-ink-light)' }}>综合</span>
          <span
            className="text-xl font-bold"
            style={{
              fontFamily: 'var(--font-family-kai)',
              color: avgScore >= 70 ? '#15803D' : avgScore >= 55 ? '#1D4ED8' : '#C2410C',
            }}
          >
            {avgScore}
          </span>
          {/* text-[10px]→text-sm(14px) */}
          <span className="text-sm" style={{ color: 'var(--color-ink-light)' }}>/100</span>
        </div>
      </div>

      {/* 四维卡片 2x2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {dimensions.map((dim) => (
          <DimensionCard key={dim.label} dim={dim} />
        ))}
      </div>

      {/* 免责声明 — text-[10px]→14px */}
      <p className="text-disclaimer mt-4">
        * 四维分析基于八字原局十神分布和五行平衡进行粗略评估，仅供学习参考，不构成任何人生决策建议
      </p>
    </div>
  );
}
