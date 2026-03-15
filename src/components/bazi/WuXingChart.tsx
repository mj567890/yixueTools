'use client';

import { useMemo } from 'react';
import type { DynamicWuxingData } from '@/lib/lunar';
import { WU_XING_COLORS } from '@/lib/lunar';

interface WuXingChartProps {
  data: DynamicWuxingData;
  /** 当前显示层级：original | withDaYun | withLiuNian */
  activeLayer: 'original' | 'withDaYun' | 'withLiuNian';
  onLayerChange: (layer: 'original' | 'withDaYun' | 'withLiuNian') => void;
  hasDaYun: boolean;
  hasLiuNian: boolean;
}

const ELEMENTS = ['木', '火', '土', '金', '水'] as const;

/** 五角雷达图角度配置（从顶部开始，顺时针） */
const ANGLES = [
  -90,   // 木 - 上
  -18,   // 火 - 右上
  54,    // 土 - 右下
  126,   // 金 - 左下
  198,   // 水 - 左上
];

/** 角度转弧度 */
function deg2rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** 计算多边形顶点坐标 */
function getPoint(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = deg2rad(angleDeg);
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

/**
 * 五行力量雷达图组件
 */
export default function WuXingChart({
  data,
  activeLayer,
  onLayerChange,
  hasDaYun,
  hasLiuNian,
}: WuXingChartProps) {
  const cx = 140;
  const cy = 140;
  const maxRadius = 100;
  const levels = 5;

  // 获取当前层级数据
  const activeData = data[activeLayer];

  // 计算最大值用于归一化
  const maxVal = useMemo(() => {
    const allVals = [
      ...Object.values(data.original),
      ...Object.values(data.withDaYun),
      ...Object.values(data.withLiuNian),
    ];
    return Math.max(...allVals, 1);
  }, [data]);

  // 归一化后的雷达顶点
  const radarPoints = useMemo(() => {
    return ELEMENTS.map((el, i) => {
      const val = activeData[el] || 0;
      const ratio = val / maxVal;
      const r = ratio * maxRadius;
      return getPoint(cx, cy, r, ANGLES[i]);
    });
  }, [activeData, maxVal, cx, cy, maxRadius]);

  // 雷达多边形路径
  const radarPath = radarPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';

  // 网格线（5层）
  const gridPaths = useMemo(() => {
    return Array.from({ length: levels }, (_, level) => {
      const r = ((level + 1) / levels) * maxRadius;
      const points = ANGLES.map((angle) => getPoint(cx, cy, r, angle));
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';
    });
  }, [cx, cy, maxRadius, levels]);

  // 标签位置（稍微偏移到外侧）
  const labelPoints = ANGLES.map((angle) => getPoint(cx, cy, maxRadius + 22, angle));

  const LAYER_OPTIONS: { key: 'original' | 'withDaYun' | 'withLiuNian'; label: string; enabled: boolean }[] = [
    { key: 'original', label: '原局', enabled: true },
    { key: 'withDaYun', label: '+大运', enabled: hasDaYun },
    { key: 'withLiuNian', label: '+流年', enabled: hasLiuNian },
  ];

  return (
    <div className="card-chinese p-5 md:p-6">
      <h3 className="section-title mb-4">
        五行力量图
      </h3>

      {/* 层级切换 — text-xs→text-sm(14px) */}
      <div className="flex items-center gap-2 mb-4">
        {LAYER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            disabled={!opt.enabled}
            onClick={() => onLayerChange(opt.key)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              activeLayer === opt.key
                ? 'text-white'
                : opt.enabled
                  ? 'hover:bg-[var(--color-parchment)]'
                  : 'opacity-40 cursor-not-allowed'
            }`}
            style={{
              borderColor: activeLayer === opt.key ? 'var(--color-primary-dark)' : 'var(--color-border-warm)',
              backgroundColor: activeLayer === opt.key ? 'var(--color-primary-dark)' : 'transparent',
              color: activeLayer === opt.key ? '#fff' : 'var(--color-ink-light)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* SVG 雷达图 */}
        <div className="flex-shrink-0">
          <svg width="280" height="280" viewBox="0 0 280 280">
            {/* 网格线 */}
            {gridPaths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="var(--color-border-warm)"
                strokeWidth={i === levels - 1 ? 1.5 : 0.5}
                opacity={0.6}
              />
            ))}

            {/* 轴线 */}
            {ANGLES.map((angle, i) => {
              const p = getPoint(cx, cy, maxRadius, angle);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={p.x}
                  y2={p.y}
                  stroke="var(--color-border-warm)"
                  strokeWidth={0.5}
                  opacity={0.6}
                />
              );
            })}

            {/* 数据区域 */}
            <path
              d={radarPath}
              fill="rgba(183, 28, 28, 0.12)"
              stroke="var(--color-cinnabar)"
              strokeWidth={2}
            />

            {/* 数据点 */}
            {radarPoints.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={4}
                fill={WU_XING_COLORS[ELEMENTS[i]]?.text || '#666'}
                stroke="#fff"
                strokeWidth={1.5}
              />
            ))}

            {/* 标签 — fontSize 14→16 */}
            {ELEMENTS.map((el, i) => {
              const lp = labelPoints[i];
              const colors = WU_XING_COLORS[el];
              const val = activeData[el] || 0;
              return (
                <g key={el}>
                  <text
                    x={lp.x}
                    y={lp.y - 6}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={colors?.text || '#333'}
                    fontSize="16"
                    fontWeight="bold"
                    fontFamily="var(--font-family-kai)"
                  >
                    {el}
                  </text>
                  {/* fontSize 10→14 */}
                  <text
                    x={lp.x}
                    y={lp.y + 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="var(--color-ink-light)"
                    fontSize="14"
                  >
                    {val.toFixed(1)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 五行力量数值列表 */}
        <div className="flex-1 w-full space-y-2">
          {ELEMENTS.map((el) => {
            const val = activeData[el] || 0;
            const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
            const colors = WU_XING_COLORS[el];
            const origVal = data.original[el] || 0;
            const diff = val - origVal;

            return (
              <div key={el} className="flex items-center gap-2">
                {/* 五行标签 — text-xs→text-sm(14px) */}
                <span
                  className="w-8 h-8 flex items-center justify-center rounded text-sm font-bold shrink-0"
                  style={{ color: colors?.text, backgroundColor: colors?.bg }}
                >
                  {el}
                </span>
                <div className="flex-1 h-6 rounded overflow-hidden relative" style={{ backgroundColor: '#F5F0EB' }}>
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{
                      width: `${Math.max(pct, 4)}%`,
                      backgroundColor: colors?.text || '#999',
                      opacity: 0.7,
                    }}
                  />
                  {/* text-[10px]→text-sm(14px) */}
                  <span
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-bold"
                    style={{ color: 'var(--color-ink)' }}
                  >
                    {val.toFixed(1)}
                  </span>
                </div>
                {/* 差值 — text-[10px]→text-sm(14px) */}
                {activeLayer !== 'original' && diff !== 0 && (
                  <span
                    className="text-sm w-12 text-right shrink-0 font-medium"
                    style={{ color: diff > 0 ? '#15803D' : '#DC2626' }}
                  >
                    {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                  </span>
                )}
              </div>
            );
          })}

          {/* 层级说明 — text-[10px]→text-sm(14px) */}
          <div className="pt-2 text-sm" style={{ color: 'var(--color-ink-light)' }}>
            <div>原局：天干×1.0 + 地支×0.8 + 藏干加权</div>
            {activeLayer !== 'original' && <div>大运/流年按影响权重叠加</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
