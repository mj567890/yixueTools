'use client';

/**
 * 太乙九宫单元格
 */

import type { TaiyiPalaceState, TaiyiPalaceId } from '@/lib/taiyi/types';
import { TAIYI_PALACE_INFO } from '@/lib/taiyi/constants';

const WX_COLOR: Record<string, string> = {
  '木': '#1B5E20',
  '火': '#B71C1C',
  '土': '#BF360C',
  '金': '#E65100',
  '水': '#0D47A1',
};

const WX_BG: Record<string, string> = {
  '木': '#E8F5E9',
  '火': '#FFEBEE',
  '土': '#FFF3E0',
  '金': '#FFF8E1',
  '水': '#E3F2FD',
};

interface PalaceCellProps {
  palace: TaiyiPalaceState;
  isCenter?: boolean;
  compact?: boolean;
}

export default function PalaceCell({ palace, isCenter, compact }: PalaceCellProps) {
  const info = TAIYI_PALACE_INFO[palace.palaceId];
  const wxColor = WX_COLOR[info.element] || '#333';
  const wxBg = WX_BG[info.element] || '#fff';

  // 关键标记（太乙/计神/文昌/始击）
  const markers: string[] = [];
  if (palace.hasTaiyi) markers.push('太乙');
  if (palace.hasJiShen) markers.push('计神');
  if (palace.hasWenChang) markers.push('文昌');
  if (palace.hasShiJi) markers.push('始击');

  return (
    <div
      className={`card-chinese flex flex-col justify-between ${compact ? 'p-1 min-h-[90px]' : 'p-1.5 md:p-2 min-h-[120px] md:min-h-[150px]'}`}
      style={{
        borderColor: palace.hasTaiyi ? 'var(--color-cinnabar)' : undefined,
        borderWidth: palace.hasTaiyi ? '2px' : undefined,
        background: isCenter ? 'var(--color-parchment)' : undefined,
        opacity: palace.isVoid ? 0.6 : 1,
      }}
    >
      {/* 顶部：宫名 + 方位 */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-bold"
          style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
        >
          {info.name}
        </span>
        <span
          className="text-xs px-1 rounded"
          style={{ background: wxBg, color: wxColor, fontSize: '10px' }}
        >
          {info.element}
        </span>
      </div>

      {/* 中部：关键标记 */}
      <div className="flex flex-wrap gap-0.5 my-1">
        {markers.map(m => (
          <span
            key={m}
            className="text-xs px-1 rounded font-medium"
            style={{
              background: m === '太乙' ? 'var(--color-cinnabar)' : 'var(--color-gold)',
              color: '#fff',
              fontSize: '10px',
            }}
          >
            {m}
          </span>
        ))}
      </div>

      {/* 十六神 */}
      {palace.spirits.length > 0 && (
        <div className="flex flex-wrap gap-0.5">
          {palace.spirits.map(s => (
            <span
              key={s.name}
              className="text-xs px-0.5"
              style={{
                color: s.auspice === '吉' ? '#1B5E20' : s.auspice === '凶' ? '#B71C1C' : '#666',
                fontSize: '10px',
              }}
            >
              {s.name}
            </span>
          ))}
        </div>
      )}

      {/* 底部：大将 + 空亡 */}
      <div className="flex items-center justify-between mt-auto pt-1" style={{ borderTop: '1px dashed var(--color-border-warm)' }}>
        <div className="flex gap-1">
          {palace.zhuJiang && (
            <span className="text-xs" style={{ color: '#1565C0', fontSize: '10px' }}>
              主将:{palace.zhuJiang}
            </span>
          )}
          {palace.keJiang && (
            <span className="text-xs" style={{ color: '#C62828', fontSize: '10px' }}>
              客将:{palace.keJiang}
            </span>
          )}
        </div>
        {palace.isVoid && (
          <span className="text-xs" style={{ color: '#999', fontSize: '10px' }}>空</span>
        )}
      </div>
    </div>
  );
}
