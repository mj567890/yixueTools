'use client';

import type { BaziResult } from '@/lib/lunar';
import { WU_XING_COLORS, WU_XING_MAP } from '@/lib/lunar';

interface BaziPanelProps {
  data: BaziResult;
}

/** 十神配色方案（提升饱和度确保对比度） */
const SHISHEN_COLORS: Record<string, { text: string; bg: string }> = {
  '日主': { text: '#5A2E1A', bg: '#F5E6D3' },
  '比肩': { text: '#5A2E1A', bg: '#F5E6D3' },
  '劫财': { text: '#5A2E1A', bg: '#F0DCC8' },
  '食神': { text: '#1B5E20', bg: '#E8F5E9' },
  '伤官': { text: '#1B5E20', bg: '#C8E6C9' },
  '偏财': { text: '#BF360C', bg: '#FFF3E0' },
  '正财': { text: '#BF360C', bg: '#FBE9E7' },
  '七杀': { text: '#B71C1C', bg: '#FFCDD2' },
  '正官': { text: '#880E4F', bg: '#FCE4EC' },
  '偏印': { text: '#1A237E', bg: '#E8EAF6' },
  '正印': { text: '#0D47A1', bg: '#E3F2FD' },
};

/**
 * 八字排盘核心面板
 *
 * 字体层级：
 * - 柱名（年柱/月柱/日柱/时柱）：13px, weight 700, 深棕 #5A2E1A
 * - 十神标签：13px, weight 600, 对应十神色
 * - 天干地支：28-36px, weight 700, 楷体, 五行色（加深）
 * - 五行小标签：12px, weight 600
 * - 藏干：14px, weight 600, 五行色
 * - 藏干十神：12px, weight 500
 * - 纳音：13px, weight 500, 金色
 */
export default function BaziPanel({ data }: BaziPanelProps) {
  return (
    <div className="card-chinese p-5 md:p-6">
      {/* 标题 + 基本信息 */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="section-title mb-2">
            四柱八字
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" style={{ color: '#666' }}>
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
      <div className="grid grid-cols-4 gap-3 md:gap-5">
        {data.pillars.map((pillar) => {
          const ganColor = WU_XING_COLORS[pillar.ganWuxing];
          const zhiColor = WU_XING_COLORS[pillar.zhiWuxing];

          return (
            <div key={pillar.label} className="flex flex-col items-center gap-2">
              {/* 柱名 */}
              <span className="pillar-label">
                {pillar.label}
              </span>

              {/* 十神 */}
              <span
                className="shishen-tag"
                style={{
                  color: SHISHEN_COLORS[pillar.shiShen]?.text || '#5A2E1A',
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
                  className="flex flex-col items-center py-3 md:py-4"
                  style={{ backgroundColor: ganColor?.bg || '#FFF' }}
                >
                  <span
                    className="ganzhi-char text-[28px] md:text-[36px]"
                    style={{ color: ganColor?.text || '#333' }}
                  >
                    {pillar.gan}
                  </span>
                  <span
                    className="text-xs mt-1.5 px-2 py-0.5 rounded font-semibold"
                    style={{
                      color: ganColor?.text || '#333',
                      backgroundColor: 'rgba(255,255,255,0.7)',
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
                  className="flex flex-col items-center py-3 md:py-4"
                  style={{ backgroundColor: zhiColor?.bg || '#FFF' }}
                >
                  <span
                    className="ganzhi-char text-[28px] md:text-[36px]"
                    style={{ color: zhiColor?.text || '#333' }}
                  >
                    {pillar.zhi}
                  </span>
                  <span
                    className="text-xs mt-1.5 px-2 py-0.5 rounded font-semibold"
                    style={{
                      color: zhiColor?.text || '#333',
                      backgroundColor: 'rgba(255,255,255,0.7)',
                    }}
                  >
                    {pillar.zhiWuxing}
                  </span>
                </div>
              </div>

              {/* 藏干 */}
              <div className="flex flex-col items-center gap-1 min-h-[52px] mt-0.5">
                <span className="text-xs font-medium" style={{ color: '#888' }}>藏干</span>
                <div className="flex gap-1 flex-wrap justify-center">
                  {pillar.cangGan.map((cg, i) => (
                    <span
                      key={i}
                      className="text-sm px-1.5 py-0.5 rounded font-semibold leading-none"
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
                <div className="flex gap-1 flex-wrap justify-center">
                  {pillar.cangGan.map((cg, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium leading-none"
                      style={{
                        color: SHISHEN_COLORS[cg.shiShen]?.text || '#5A2E1A',
                      }}
                    >
                      {cg.shiShen.slice(0, 2)}
                    </span>
                  ))}
                </div>
              </div>

              {/* 纳音 */}
              <span
                className="text-[13px] font-medium text-center leading-tight"
                style={{ color: 'var(--color-gold)' }}
              >
                {pillar.naYin}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 信息标签小组件 */
function InfoTag({ label, value }: { label: string; value: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-lg border"
      style={{
        borderColor: 'var(--color-border-warm)',
        backgroundColor: 'var(--color-parchment)',
      }}
    >
      <span style={{ color: '#888' }}>{label}</span>
      <span
        className="font-bold"
        style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
      >
        {value}
      </span>
    </span>
  );
}
