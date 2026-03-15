'use client';

/**
 * 卦画 SVG 绘制组件
 * 支持三爻（经卦）和六爻（重卦）绘制
 */

interface GuaSymbolProps {
  /** 爻画数组（自下而上），true=阳爻，false=阴爻 */
  lines: boolean[];
  /** 动爻位置 1-6（可选，高亮标记） */
  movingLine?: number;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CONFIG = {
  sm: { width: 56, yaoHeight: 6, gap: 9, gutter: 4 },
  md: { width: 80, yaoHeight: 8, gap: 12, gutter: 6 },
  lg: { width: 110, yaoHeight: 10, gap: 14, gutter: 8 },
};

export default function GuaSymbol({ lines, movingLine, size = 'md' }: GuaSymbolProps) {
  const cfg = SIZE_CONFIG[size];
  const count = lines.length;
  // 上下卦之间增加额外间距（仅下卦下移，上卦不动，避免顶部爻条被裁切）
  const extraGap = count === 6 ? cfg.gap * 0.6 : 0;
  const padTop = 4;
  const padBottom = 4;
  const totalHeight = padTop + count * cfg.yaoHeight + (count - 1) * cfg.gap + extraGap + padBottom;
  // 动爻标记在右侧需要额外宽度
  const svgWidth = cfg.width + (movingLine !== undefined ? 12 : 0);

  return (
    <svg
      width={svgWidth}
      height={totalHeight}
      viewBox={`0 0 ${svgWidth} ${totalHeight}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="卦象"
    >
      {lines.map((isYang, index) => {
        // SVG y 轴向下，但爻画自下而上，所以反转
        const reversedIndex = count - 1 - index;
        let y = padTop + reversedIndex * (cfg.yaoHeight + cfg.gap);
        // 六爻时，下卦（index 0-2）整体下移 extraGap，在上下卦之间形成视觉间隔
        if (count === 6 && index < 3) {
          y += extraGap;
        }

        const isMoving = movingLine !== undefined && movingLine === index + 1;
        const color = isMoving ? 'var(--color-gold)' : 'var(--color-cinnabar)';

        if (isYang) {
          // 阳爻：一条完整横线
          return (
            <rect
              key={index}
              x={0}
              y={y}
              width={cfg.width}
              height={cfg.yaoHeight}
              rx={cfg.yaoHeight / 4}
              fill={color}
            />
          );
        }
        // 阴爻：两段横线
        const segWidth = (cfg.width - cfg.gutter) / 2;
        return (
          <g key={index}>
            <rect
              x={0}
              y={y}
              width={segWidth}
              height={cfg.yaoHeight}
              rx={cfg.yaoHeight / 4}
              fill={color}
            />
            <rect
              x={segWidth + cfg.gutter}
              y={y}
              width={segWidth}
              height={cfg.yaoHeight}
              rx={cfg.yaoHeight / 4}
              fill={color}
            />
          </g>
        );
      })}

      {/* 动爻标记：右侧小圆点 */}
      {movingLine !== undefined && movingLine >= 1 && movingLine <= count && (
        (() => {
          const reversedIndex = count - movingLine;
          let y = padTop + reversedIndex * (cfg.yaoHeight + cfg.gap) + cfg.yaoHeight / 2;
          // 下卦动爻（1-3爻）同步下移
          if (count === 6 && movingLine < 4) y += extraGap;
          return (
            <circle
              cx={cfg.width + 6}
              cy={y}
              r={3}
              fill="var(--color-gold)"
            />
          );
        })()
      )}
    </svg>
  );
}
