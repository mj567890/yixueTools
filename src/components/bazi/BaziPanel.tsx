'use client';

import type { BaziResult } from '@/lib/lunar';
import { WU_XING_COLORS, WU_XING_MAP } from '@/lib/lunar';

interface BaziPanelProps {
  data: BaziResult;
}

/** 十神配色方案 */
const SHISHEN_COLORS: Record<string, { text: string; bg: string }> = {
  '日主': { text: '#6B3410', bg: '#F5E6D3' },
  '比肩': { text: '#6B3410', bg: '#F5E6D3' },
  '劫财': { text: '#6B3410', bg: '#F5E6D3' },
  '食神': { text: '#2E7D32', bg: '#E8F5E9' },
  '伤官': { text: '#1B5E20', bg: '#C8E6C9' },
  '偏财': { text: '#E65100', bg: '#FFF3E0' },
  '正财': { text: '#BF360C', bg: '#FBE9E7' },
  '七杀': { text: '#B71C1C', bg: '#FFCDD2' },
  '正官': { text: '#880E4F', bg: '#FCE4EC' },
  '偏印': { text: '#1A237E', bg: '#E8EAF6' },
  '正印': { text: '#0D47A1', bg: '#E3F2FD' },
};

/**
 * 八字排盘核心面板
 *
 * 布局（自上而下）：
 * ┌────────────────────────────────────────────────┐
 * │  日期信息栏 + 生肖 + 胎元/命宫               │
 * ├────────────────────────────────────────────────┤
 * │  年柱        月柱        日柱        时柱      │
 * │  [十神]      [十神]      [日主]      [十神]    │
 * │  ┌────┐     ┌────┐     ┌────┐     ┌────┐     │
 * │  │天干│     │天干│     │天干│     │天干│     │
 * │  │五行│     │五行│     │五行│     │五行│     │
 * │  ├────┤     ├────┤     ├────┤     ├────┤     │
 * │  │地支│     │地支│     │地支│     │地支│     │
 * │  │五行│     │五行│     │五行│     │五行│     │
 * │  └────┘     └────┘     └────┘     └────┘     │
 * │  [藏干列表]  [藏干列表]  [藏干列表]  [藏干列表] │
 * │  [纳音]      [纳音]      [纳音]      [纳音]    │
 * └────────────────────────────────────────────────┘
 */
export default function BaziPanel({ data }: BaziPanelProps) {
  return (
    <div className="card-chinese p-5 md:p-6">
      {/* 标题 + 基本信息 */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h3
            className="section-title mb-2"
            style={{ fontSize: '1.2rem' }}
          >
            四柱八字
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-ink-light)]">
            <span>公历：{data.solarDate}</span>
            <span>农历：{data.lunarDate}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <InfoTag label="生肖" value={data.shengXiao} />
          <InfoTag label="日主" value={`${data.dayMaster}${data.dayMasterWuxing}`} />
          <InfoTag label="胎元" value={data.taiYuan} />
          <InfoTag label="命宫" value={data.mingGong} />
        </div>
      </div>

      {/* 四柱主体 */}
      <div className="grid grid-cols-4 gap-2 md:gap-4">
        {data.pillars.map((pillar) => (
          <div key={pillar.label} className="flex flex-col items-center gap-1.5">
            {/* 柱名 */}
            <span
              className="text-xs font-bold tracking-wider"
              style={{ color: 'var(--color-ink-light)' }}
            >
              {pillar.label}
            </span>

            {/* 十神 */}
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                color: SHISHEN_COLORS[pillar.shiShen]?.text || '#6B3410',
                backgroundColor: SHISHEN_COLORS[pillar.shiShen]?.bg || '#F5E6D3',
              }}
            >
              {pillar.shiShen}
            </span>

            {/* 天干 + 地支卡片 */}
            <div
              className="w-full rounded-xl border overflow-hidden"
              style={{ borderColor: 'var(--color-border-warm)' }}
            >
              {/* 天干 */}
              <div
                className="flex flex-col items-center py-2.5 md:py-3"
                style={{ backgroundColor: WU_XING_COLORS[pillar.ganWuxing]?.bg || '#FFF' }}
              >
                <span
                  className="text-2xl md:text-3xl font-bold leading-none"
                  style={{
                    fontFamily: 'var(--font-family-kai)',
                    color: WU_XING_COLORS[pillar.ganWuxing]?.text || '#333',
                  }}
                >
                  {pillar.gan}
                </span>
                <span
                  className="text-[10px] mt-1 px-1.5 py-0.5 rounded font-medium"
                  style={{
                    color: WU_XING_COLORS[pillar.ganWuxing]?.text || '#333',
                    backgroundColor: 'rgba(255,255,255,0.6)',
                  }}
                >
                  {pillar.ganWuxing}
                </span>
              </div>

              {/* 分隔线 */}
              <div
                className="h-px"
                style={{ backgroundColor: 'var(--color-border-warm)' }}
              />

              {/* 地支 */}
              <div
                className="flex flex-col items-center py-2.5 md:py-3"
                style={{ backgroundColor: WU_XING_COLORS[pillar.zhiWuxing]?.bg || '#FFF' }}
              >
                <span
                  className="text-2xl md:text-3xl font-bold leading-none"
                  style={{
                    fontFamily: 'var(--font-family-kai)',
                    color: WU_XING_COLORS[pillar.zhiWuxing]?.text || '#333',
                  }}
                >
                  {pillar.zhi}
                </span>
                <span
                  className="text-[10px] mt-1 px-1.5 py-0.5 rounded font-medium"
                  style={{
                    color: WU_XING_COLORS[pillar.zhiWuxing]?.text || '#333',
                    backgroundColor: 'rgba(255,255,255,0.6)',
                  }}
                >
                  {pillar.zhiWuxing}
                </span>
              </div>
            </div>

            {/* 藏干 */}
            <div className="flex flex-col items-center gap-0.5 min-h-[48px]">
              <span className="text-[10px] text-[var(--color-ink-light)]">藏干</span>
              <div className="flex gap-0.5 flex-wrap justify-center">
                {pillar.cangGan.map((cg, i) => (
                  <span
                    key={i}
                    className="text-xs px-1 py-0.5 rounded leading-none"
                    style={{
                      color: WU_XING_COLORS[cg.wuxing]?.text || '#333',
                      backgroundColor: WU_XING_COLORS[cg.wuxing]?.bg || '#f5f5f5',
                    }}
                    title={`${cg.gan}${cg.wuxing} — ${cg.shiShen}`}
                  >
                    {cg.gan}
                  </span>
                ))}
              </div>
              <div className="flex gap-0.5 flex-wrap justify-center">
                {pillar.cangGan.map((cg, i) => (
                  <span
                    key={i}
                    className="text-[9px] leading-none"
                    style={{
                      color: SHISHEN_COLORS[cg.shiShen]?.text || '#6B3410',
                    }}
                  >
                    {cg.shiShen.slice(0, 2)}
                  </span>
                ))}
              </div>
            </div>

            {/* 纳音 */}
            <span
              className="text-xs text-center leading-tight"
              style={{ color: 'var(--color-gold)' }}
            >
              {pillar.naYin}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 信息标签小组件 */
function InfoTag({ label, value }: { label: string; value: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border"
      style={{
        borderColor: 'var(--color-border-warm)',
        backgroundColor: 'var(--color-parchment)',
      }}
    >
      <span style={{ color: 'var(--color-ink-light)' }}>{label}</span>
      <span
        className="font-bold"
        style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
      >
        {value}
      </span>
    </span>
  );
}
