'use client';

import type { YangpanPaiPanResult, YangpanPalaceState } from '@/lib/qimen/types';

// ==================== 配色工具 ====================

const GAN_WX: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};
const WX_COLOR: Record<string, string> = {
  '木': '#1B5E20', '火': '#C23B22', '土': '#BF360C', '金': '#E65100', '水': '#0D47A1',
};

function stemColor(stem: string): string {
  if (!stem) return '#333';
  const wx = GAN_WX[stem.charAt(0)];
  return wx ? (WX_COLOR[wx] || '#333') : '#333';
}

// ==================== 信息行组件（与阴盘一致） ====================

const infoFontSize = '18px';

function InfoTag({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline gap-1">
      <span style={{ fontSize: '15px', color: 'var(--color-ink-light)' }}>{label}</span>
      <span
        className="font-medium"
        style={{
          fontSize: infoFontSize,
          fontFamily: 'var(--font-family-kai)',
          color: highlight ? 'var(--color-cinnabar)' : 'var(--color-ink)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ==================== 九宫格子组件（仿阴盘布局） ====================

const cellFontSize = '22px';

function PalaceCell({ palace, jiGong }: { palace: YangpanPalaceState; jiGong: number }) {
  const p = palace.palaceId;

  if (p === 5) {
    return (
      <div
        className="p-2 flex flex-col items-center justify-center min-h-[140px] md:min-h-[160px]"
        style={{
          background: 'var(--color-bg-card)',
          fontFamily: 'var(--font-family-kai)',
          color: 'var(--color-ink-light)',
          fontSize: cellFontSize,
        }}
      >
        天禽寄{jiGong === 2 ? '坤' : '艮'}
      </div>
    );
  }

  return (
    <div
      className="p-1.5 md:p-2 flex flex-col justify-between min-h-[140px] md:min-h-[160px]"
      style={{ background: 'var(--color-bg-card)' }}
    >
      {/* 顶行：左=八神 右=空亡/马星 */}
      <div className="flex justify-between items-start">
        <span style={{ fontSize: cellFontSize, color: '#8B4513', lineHeight: 1.2 }}>
          {palace.spirit}
        </span>
        {(palace.isVoid || palace.isHorse) && (
          <div className="flex flex-col items-end">
            {palace.isVoid && (
              <span style={{ fontSize: cellFontSize, color: '#666', lineHeight: 1.2 }}>空</span>
            )}
            {palace.isHorse && (
              <span style={{ fontSize: cellFontSize, color: '#E65100', lineHeight: 1.2 }}>马</span>
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* 底行：左=天地盘干 右=九星(上)+八门(下) */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col" style={{ lineHeight: 1.3 }}>
          <span style={{ fontSize: cellFontSize, fontWeight: 600, color: stemColor(palace.heavenStem) }}>
            {palace.heavenStem}
          </span>
          <span style={{ fontSize: cellFontSize, color: stemColor(palace.earthStem) }}>
            {palace.earthStem}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span style={{ fontSize: cellFontSize, color: '#B8860B', lineHeight: 1.2 }}>
            {palace.star}
          </span>
          <span style={{ fontSize: cellFontSize, color: '#C23B22', lineHeight: 1.2 }}>
            {palace.gate}
          </span>
        </div>
      </div>
    </div>
  );
}

// ==================== 主组件 ====================

interface YangpanBoardProps {
  data: YangpanPaiPanResult;
}

export default function YangpanBoard({ data }: YangpanBoardProps) {
  const ju = data.juResult;
  const methodLabel = ju.method === 'chaiBu' ? '拆补法' : ju.method === 'zhiRun' ? '置闰法' : '茅山法';
  const pad = (n: number) => String(n).padStart(2, '0');

  const palaceGrid = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];

  return (
    <div className="space-y-4">
      {/* 基本信息卡片 */}
      <div className="card-chinese p-4 space-y-4">
        {/* 四柱干支 */}
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: '年柱', value: data.ganZhi.year },
            { label: '月柱', value: data.ganZhi.month },
            { label: '日柱', value: data.ganZhi.day },
            { label: '时柱', value: data.ganZhi.time },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: '16px', color: 'var(--color-ink-light)', fontFamily: 'var(--font-family-kai)' }}>
                {item.label}
              </div>
              <div className="ganzhi-char mt-1" style={{ fontSize: '26px', fontWeight: 600 }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* 排盘信息（InfoTag 风格） */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-2">
          <InfoTag label="公元" value={`${data.config.year}年${data.config.month}月${data.config.day}日${data.config.hour}时${pad(data.config.minute || 0)}分`} />
          <InfoTag label="农历" value={data.lunarDesc} />
          <InfoTag label="遁局" value={`${ju.dunType}${ju.juNumber}局`} highlight />
          <InfoTag label="值符" value={data.zhiFuStar} />
          <InfoTag label="值使" value={data.zhiShiGate} />
          <InfoTag label="旬首" value={`${data.xunShou}（${data.xunShouYin}）`} />
          <InfoTag label="空亡" value={`${data.voidPair[0]}${data.voidPair[1]}`} />
          <InfoTag label="定局" value={`${methodLabel} ${ju.yuan}${ju.isRunJu ? '（闰）' : ''}`} />
          <InfoTag label="寄宫" value={`天禽寄${data.jiGong === 2 ? '坤二' : '艮八'}`} />
        </div>
      </div>

      {/* 九宫格（封闭边框 + 正方形，与阴盘一致） */}
      <div className="card-chinese p-3 md:p-4">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gridTemplateRows: '1fr 1fr 1fr',
            border: '2px solid var(--color-border-warm)',
            borderRadius: '4px',
            overflow: 'hidden',
            maxWidth: 540,
            margin: '0 auto',
          }}
        >
          {palaceGrid.flat().map((p, idx) => {
            const col = idx % 3;
            const row = Math.floor(idx / 3);
            const borderRight = col < 2 ? '1px solid var(--color-border-warm)' : 'none';
            const borderBottom = row < 2 ? '1px solid var(--color-border-warm)' : 'none';

            return (
              <div key={`cell-${p}`} style={{ borderRight, borderBottom }}>
                <PalaceCell
                  palace={data.palaces[p as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9]}
                  jiGong={data.jiGong}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
