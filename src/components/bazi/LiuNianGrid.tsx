'use client';

import type { LiuNianItem, DaYunItem, BaziResult, LiuNianAnalysis } from '@/lib/lunar';
import { WU_XING_COLORS, getLiuNianAnalysis } from '@/lib/lunar';
import { useState, useMemo, useCallback } from 'react';
import LiuNianDetailPanel from './LiuNianDetailPanel';

interface LiuNianGridProps {
  liuNianList: LiuNianItem[];
  daYun: DaYunItem;
  baziResult: BaziResult;
}

/** 运势等级配色（与 DaYunTimeline 一致） */
const GRADE_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  '上吉': { text: '#15803D', bg: '#DCFCE7', border: '#86EFAC' },
  '小吉': { text: '#1D4ED8', bg: '#DBEAFE', border: '#93C5FD' },
  '平':   { text: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
  '小凶': { text: '#C2410C', bg: '#FFF7ED', border: '#FDBA74' },
  '凶':   { text: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
};

/** 关系标签配色 */
const REL_COLORS: Record<string, { text: string; bg: string }> = {
  '合': { text: '#15803D', bg: '#DCFCE7' },
  '冲': { text: '#DC2626', bg: '#FEF2F2' },
};

function getRelColor(rel: string) {
  if (rel.includes('冲')) return REL_COLORS['冲'];
  if (rel.includes('合')) return REL_COLORS['合'];
  return { text: '#6B7280', bg: '#F3F4F6' };
}

/** 十神对应的简短断语（格子内展示，每句不超15字） */
const SHISHEN_BRIEF: Record<string, string> = {
  '比肩': '竞争增多，宜守不宜攻',
  '劫财': '社交活跃，防破财之象',
  '食神': '才华外显，创作好时机',
  '伤官': '创新突破，但防口舌',
  '正财': '正财入库，收入稳增',
  '偏财': '偏财可期，适度投资',
  '正官': '贵人提携，利升迁',
  '七杀': '压力并存，锻炼成长',
  '正印': '学业有利，贵人助力',
  '偏印': '沉淀期，宜思考钻研',
};

/**
 * 流年网格组件（增强版）
 *
 * 展示选定大运的 10 年流年详情，5x2 网格布局。
 * 每格显示：年份、干支、年龄、十神、运势等级、简洁断语。
 * 点击流年格子，下方展开详情面板。
 */
export default function LiuNianGrid({ liuNianList, daYun, baziResult }: LiuNianGridProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // 计算当前选中流年的联动分析
  const selectedAnalysis: LiuNianAnalysis | null = useMemo(() => {
    if (selectedYear === null) return null;
    const ln = liuNianList.find((l) => l.year === selectedYear);
    if (!ln) return null;
    return getLiuNianAnalysis(baziResult, daYun, ln);
  }, [selectedYear, liuNianList, baziResult, daYun]);

  const handleCellClick = useCallback((year: number) => {
    setSelectedYear((prev) => (prev === year ? null : year));
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedYear(null);
  }, []);

  return (
    <div className="card-chinese p-5 md:p-6">
      {/* 标题 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="section-title" style={{ fontSize: '1.2rem' }}>
          流年详情
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span
            className="px-2.5 py-1 rounded-lg border"
            style={{
              borderColor: 'var(--color-border-warm)',
              backgroundColor: 'var(--color-parchment)',
            }}
          >
            大运{' '}
            <span
              className="font-bold"
              style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
            >
              {daYun.ganZhi}
            </span>
          </span>
          <span
            className="px-2.5 py-1 rounded-lg border text-xs"
            style={{
              borderColor: 'var(--color-border-warm)',
              backgroundColor: 'var(--color-parchment)',
              color: 'var(--color-ink-light)',
            }}
          >
            {daYun.startAge}-{daYun.endAge}岁 / {daYun.startYear}-{daYun.endYear}
          </span>
        </div>
      </div>

      {/* 流年网格 5x2 */}
      <div className="grid grid-cols-5 gap-2 md:gap-3">
        {liuNianList.map((ln) => {
          const isCurrent = ln.year === currentYear;
          const isSelected = ln.year === selectedYear;
          const gradeColor = GRADE_COLORS[ln.grade] || GRADE_COLORS['平'];
          const brief = SHISHEN_BRIEF[ln.shiShen] || '';

          return (
            <button
              key={ln.year}
              onClick={() => handleCellClick(ln.year)}
              className="flex flex-col items-center rounded-xl p-2 md:p-3 transition-all cursor-pointer text-center"
              style={{
                border: isSelected
                  ? '2px solid var(--color-gold)'
                  : isCurrent
                    ? '2px solid var(--color-cinnabar)'
                    : '1px solid var(--color-border-warm)',
                backgroundColor: isSelected
                  ? '#FFFDF5'
                  : isCurrent
                    ? 'var(--color-parchment)'
                    : '#fff',
                boxShadow: isSelected
                  ? '0 0 0 2px rgba(184, 134, 11, 0.15), 0 4px 12px rgba(0,0,0,0.08)'
                  : isCurrent
                    ? '0 0 0 2px rgba(183, 28, 28, 0.12), 0 2px 8px rgba(0,0,0,0.06)'
                    : 'none',
                transform: isSelected ? 'scale(1.02)' : undefined,
              }}
              onMouseEnter={(e) => {
                if (!isSelected && !isCurrent) {
                  e.currentTarget.style.backgroundColor = 'var(--color-parchment)';
                  e.currentTarget.style.borderColor = 'var(--color-gold)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected && !isCurrent) {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.borderColor = 'var(--color-border-warm)';
                }
              }}
            >
              {/* 年份 */}
              <span className="text-[11px] font-medium" style={{ color: 'var(--color-ink-light)' }}>
                {ln.year}
              </span>

              {/* 天干 */}
              <span
                className="text-lg font-bold leading-none mt-1"
                style={{
                  fontFamily: 'var(--font-family-kai)',
                  color: WU_XING_COLORS[ln.ganWuxing]?.text || '#333',
                }}
              >
                {ln.gan}
              </span>

              {/* 地支 */}
              <span
                className="text-lg font-bold leading-none mt-0.5"
                style={{
                  fontFamily: 'var(--font-family-kai)',
                  color: WU_XING_COLORS[ln.zhiWuxing]?.text || '#333',
                }}
              >
                {ln.zhi}
              </span>

              {/* 十神 */}
              <span className="text-[10px] mt-1" style={{ color: 'var(--color-ink-light)' }}>
                {ln.shiShen}
              </span>

              {/* 年龄 */}
              <span
                className="text-[10px] mt-0.5 font-medium"
                style={{ color: 'var(--color-primary-dark)' }}
              >
                {ln.age}岁
              </span>

              {/* 运势等级 */}
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-medium mt-1"
                style={{
                  color: gradeColor.text,
                  backgroundColor: gradeColor.bg,
                  border: `1px solid ${gradeColor.border}`,
                }}
              >
                {ln.grade}
              </span>

              {/* 简洁断语 */}
              {brief && (
                <span
                  className="text-[9px] mt-1 leading-tight hidden md:block"
                  style={{ color: 'var(--color-gold)' }}
                >
                  {brief}
                </span>
              )}

              {/* 关系标签 */}
              {ln.relations.length > 0 && (
                <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                  {ln.relations.slice(0, 2).map((rel, i) => {
                    const relColor = getRelColor(rel);
                    return (
                      <span
                        key={i}
                        className="text-[8px] px-1 py-px rounded leading-tight"
                        style={{
                          color: relColor.text,
                          backgroundColor: relColor.bg,
                        }}
                        title={rel}
                      >
                        {rel.length > 5 ? rel.slice(0, 5) : rel}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* 当前年标记 */}
              {isCurrent && (
                <span
                  className="text-[8px] mt-1 px-1 py-px rounded font-medium text-white"
                  style={{ backgroundColor: 'var(--color-cinnabar)' }}
                >
                  今年
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 纳音一览 */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {liuNianList.map((ln) => (
          <span
            key={ln.year}
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              color: 'var(--color-gold)',
              backgroundColor: 'var(--color-parchment)',
            }}
          >
            {ln.year} {ln.naYin}
          </span>
        ))}
      </div>

      {/* 说明 */}
      <p className="text-[10px] mt-3 text-center opacity-50" style={{ color: 'var(--color-ink-light)' }}>
        * 点击流年格子查看「八字+大运+流年」联动详解
      </p>

      {/* 流年详情面板 */}
      {selectedAnalysis && (
        <LiuNianDetailPanel
          analysis={selectedAnalysis}
          onClose={handleClosePanel}
        />
      )}
    </div>
  );
}
