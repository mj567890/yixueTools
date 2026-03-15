'use client';

import type { PalaceState } from '@/lib/qimen';
import { PALACE_INFO, GAN_WU_XING } from '@/lib/qimen';

interface PalaceCellProps {
  palace: PalaceState;
  isSelected?: boolean;
  showYinPan?: boolean;
  onClick?: () => void;
}

/** 天干五行配色 */
function stemColor(stem: string): string {
  const wx = GAN_WU_XING[stem];
  if (!wx) return '#333';
  const map: Record<string, string> = {
    '木': '#1B5E20', '火': '#C23B22', '土': '#BF360C', '金': '#E65100', '水': '#0D47A1',
  };
  return map[wx] || '#333';
}

export default function PalaceCell({ palace, isSelected, showYinPan, onClick }: PalaceCellProps) {
  const info = PALACE_INFO[palace.palaceId];
  const isCenterPalace = palace.palaceId === 5;
  const cellFontSize = '22px';

  if (isCenterPalace) {
    return (
      <div
        className="card-chinese p-2 flex flex-col items-center justify-center min-h-[140px] md:min-h-[160px]"
        style={{ backgroundColor: 'var(--color-parchment)', opacity: 0.7 }}
      >
        <span style={{ fontSize: cellFontSize, fontWeight: 700, color: 'var(--color-ink-light)' }}>
          {info.name}
        </span>
        <span className="text-xs mt-1" style={{ color: 'var(--color-ink-light)' }}>
          天禽寄坤二宫
        </span>
      </div>
    );
  }

  return (
    <div
      className="card-chinese p-1.5 md:p-2 flex flex-col justify-between min-h-[140px] md:min-h-[160px] cursor-pointer transition-all relative"
      style={{
        borderColor: isSelected ? 'var(--color-cinnabar)' : undefined,
        borderWidth: isSelected ? '2px' : undefined,
        boxShadow: isSelected ? '0 0 8px rgba(194, 59, 34, 0.3)' : undefined,
      }}
      onClick={onClick}
    >
      {/* 顶行：左=八神 右=空亡/马星 */}
      <div className="flex justify-between items-start">
        <span style={{ fontSize: cellFontSize, color: '#8B4513', lineHeight: 1.2 }}>
          {palace.spirit?.name || ''}
        </span>
        {(palace.isVoid || palace.isHorseStar) && (
          <div className="flex flex-col items-end">
            {palace.isVoid && (
              <span style={{ fontSize: '13px', color: '#666', lineHeight: 1.2 }}>空</span>
            )}
            {palace.isHorseStar && (
              <span style={{ fontSize: '13px', color: '#E65100', lineHeight: 1.2 }}>马</span>
            )}
          </div>
        )}
      </div>

      {/* 中间留白 */}
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
            {palace.star?.name || ''}
          </span>
          <span style={{ fontSize: cellFontSize, color: '#C23B22', lineHeight: 1.2 }}>
            {palace.gate?.name || ''}
          </span>

          {showYinPan && (
            <div className="flex flex-col items-end" style={{ fontSize: '12px', color: '#666', lineHeight: 1.2 }}>
              {palace.yinPanDarkStem && (
                <span>暗{palace.yinPanDarkStem}</span>
              )}
              {palace.yinPanHiddenStem && (
                <span>隐{palace.yinPanHiddenStem}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
