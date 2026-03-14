'use client';

import type { DaYunResult } from '@/lib/lunar';
import { WU_XING_COLORS } from '@/lib/lunar';

interface DaYunTimelineProps {
  data: DaYunResult;
  selectedIndex?: number;
  onSelect?: (index: number) => void;
}

/** 运势等级配色 */
const GRADE_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  '上吉': { text: '#15803D', bg: '#DCFCE7', border: '#86EFAC' },
  '小吉': { text: '#1D4ED8', bg: '#DBEAFE', border: '#93C5FD' },
  '平':   { text: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
  '小凶': { text: '#C2410C', bg: '#FFF7ED', border: '#FDBA74' },
  '凶':   { text: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
};

/**
 * 大运时间轴组件
 *
 * 展示 8 步大运，每步 10 年，横向可滚动卡片布局。
 * 支持点击选中查看流年详情，当前大运高亮。
 */
export default function DaYunTimeline({ data, selectedIndex, onSelect }: DaYunTimelineProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="card-chinese p-5 md:p-6">
      {/* 标题 + 起运信息 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="section-title" style={{ fontSize: '1.2rem' }}>
          大运排盘
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span
            className="px-2.5 py-1 rounded-lg border"
            style={{
              borderColor: 'var(--color-border-warm)',
              backgroundColor: 'var(--color-parchment)',
            }}
          >
            起运{' '}
            <span
              className="font-bold"
              style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
            >
              {data.startAgeDesc}
            </span>
          </span>
          <span
            className="px-2.5 py-1 rounded-lg border"
            style={{
              borderColor: 'var(--color-border-warm)',
              backgroundColor: 'var(--color-parchment)',
            }}
          >
            <span style={{ color: 'var(--color-primary-dark)' }}>
              {data.direction === '顺' ? '顺排' : '逆排'}
            </span>
          </span>
        </div>
      </div>

      {/* 提示：点击大运卡片查看流年 */}
      <p className="text-[11px] mb-3" style={{ color: 'var(--color-ink-light)' }}>
        点击大运卡片查看该十年流年详情
      </p>

      {/* 大运卡片列表 - 横向可滚动 */}
      <div className="overflow-x-auto pb-2 -mx-1">
        <div className="flex gap-2 md:gap-3 px-1" style={{ minWidth: 'max-content' }}>
          {data.daYunList.map((dy) => {
            const isCurrent = currentYear >= dy.startYear && currentYear <= dy.endYear;
            const isSelected = selectedIndex === dy.index;
            const gradeColor = GRADE_COLORS[dy.grade] || GRADE_COLORS['平'];

            // 确定边框样式优先级：选中 > 当前 > 默认
            let borderStyle = '2px solid var(--color-border-warm)';
            if (isSelected) borderStyle = '2px solid var(--color-primary-dark)';
            else if (isCurrent) borderStyle = '2px solid var(--color-cinnabar)';

            let bgColor = '#fff';
            if (isSelected) bgColor = 'var(--color-parchment)';
            else if (isCurrent) bgColor = 'var(--color-parchment)';

            return (
              <div
                key={dy.index}
                className="flex flex-col items-center rounded-xl p-3 transition-all cursor-pointer hover:shadow-md"
                style={{
                  minWidth: '88px',
                  border: borderStyle,
                  backgroundColor: bgColor,
                  boxShadow: isSelected
                    ? '0 0 0 3px rgba(107, 52, 16, 0.2), 0 4px 12px rgba(0,0,0,0.08)'
                    : isCurrent
                      ? '0 0 0 3px rgba(183, 28, 28, 0.15), 0 4px 12px rgba(0,0,0,0.08)'
                      : 'none',
                  transform: isSelected || isCurrent ? 'scale(1.05)' : 'none',
                }}
                onClick={() => onSelect?.(dy.index)}
              >
                {/* 运势等级标签 */}
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium mb-2"
                  style={{
                    color: gradeColor.text,
                    backgroundColor: gradeColor.bg,
                    border: `1px solid ${gradeColor.border}`,
                  }}
                >
                  {dy.grade}
                </span>

                {/* 天干 */}
                <span
                  className="text-xl font-bold leading-none"
                  style={{
                    fontFamily: 'var(--font-family-kai)',
                    color: WU_XING_COLORS[dy.ganWuxing]?.text || '#333',
                  }}
                >
                  {dy.gan}
                </span>

                {/* 地支 */}
                <span
                  className="text-xl font-bold leading-none mt-0.5"
                  style={{
                    fontFamily: 'var(--font-family-kai)',
                    color: WU_XING_COLORS[dy.zhiWuxing]?.text || '#333',
                  }}
                >
                  {dy.zhi}
                </span>

                {/* 十神 */}
                <span className="text-[10px] mt-1.5" style={{ color: 'var(--color-ink-light)' }}>
                  {dy.shiShen}
                </span>

                {/* 年龄范围 */}
                <span
                  className="text-xs font-medium mt-1.5"
                  style={{ color: 'var(--color-primary-dark)' }}
                >
                  {dy.startAge}-{dy.endAge}岁
                </span>

                {/* 年份范围 */}
                <span className="text-[10px]" style={{ color: 'var(--color-ink-light)' }}>
                  {dy.startYear}-{dy.endYear}
                </span>

                {/* 纳音 */}
                {dy.naYin && (
                  <span className="text-[9px] mt-1" style={{ color: 'var(--color-gold)' }}>
                    {dy.naYin}
                  </span>
                )}

                {/* 当前/选中标记 */}
                {isCurrent && (
                  <span
                    className="text-[9px] mt-1 px-1.5 py-0.5 rounded font-medium text-white"
                    style={{ backgroundColor: 'var(--color-cinnabar)' }}
                  >
                    当前
                  </span>
                )}
                {isSelected && !isCurrent && (
                  <span
                    className="text-[9px] mt-1 px-1.5 py-0.5 rounded font-medium text-white"
                    style={{ backgroundColor: 'var(--color-primary-dark)' }}
                  >
                    查看中
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap items-center gap-2 mt-4 text-[10px]">
        <span style={{ color: 'var(--color-ink-light)' }}>运势等级：</span>
        {Object.entries(GRADE_COLORS).map(([grade, colors]) => (
          <span
            key={grade}
            className="px-1.5 py-0.5 rounded-full"
            style={{
              color: colors.text,
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
            }}
          >
            {grade}
          </span>
        ))}
      </div>
    </div>
  );
}
