'use client';

/**
 * 太乙九宫盘面
 */

import type { TaiyiResult, TaiyiPalaceId } from '@/lib/taiyi/types';
import { PALACE_GRID_LAYOUT } from '@/lib/taiyi/constants';
import PalaceCell from './PalaceCell';

interface TaiyiBoardProps {
  result: TaiyiResult;
}

export default function TaiyiBoard({ result }: TaiyiBoardProps) {
  return (
    <div className="card-chinese p-3 md:p-4">
      <h3
        className="text-base font-bold mb-3"
        style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
      >
        太乙九宫盘
      </h3>

      {/* 盘面信息摘要 */}
      <div className="flex flex-wrap gap-2 mb-3 text-xs" style={{ color: 'var(--color-ink-light)' }}>
        <span>太乙:{result.taiyiPalace}宫</span>
        <span>计神:{result.jiShenPalace}宫</span>
        <span>文昌:{result.wenChangPalace}宫</span>
        <span>始击:{result.shiJiPalace}宫</span>
      </div>

      {/* 3x3 九宫格 */}
      <div className="grid grid-cols-3 gap-1.5 md:gap-2">
        {PALACE_GRID_LAYOUT.flat().map(palaceId => {
          const pid = palaceId as TaiyiPalaceId;
          return (
            <PalaceCell
              key={pid}
              palace={result.palaces[pid]}
              isCenter={pid === 5}
            />
          );
        })}
      </div>

      {/* 底部数值摘要 */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="card-chinese p-2">
          <div className="text-xs" style={{ color: 'var(--color-ink-light)' }}>主算</div>
          <div className="text-lg font-bold" style={{ color: '#1565C0' }}>{result.zhuSuan}</div>
        </div>
        <div className="card-chinese p-2">
          <div className="text-xs" style={{ color: 'var(--color-ink-light)' }}>定算</div>
          <div className="text-lg font-bold" style={{ color: 'var(--color-primary-dark)' }}>{result.dingSuan}</div>
        </div>
        <div className="card-chinese p-2">
          <div className="text-xs" style={{ color: 'var(--color-ink-light)' }}>客算</div>
          <div className="text-lg font-bold" style={{ color: '#C62828' }}>{result.keSuan}</div>
        </div>
      </div>

      {/* 大将信息 */}
      <div className="mt-2 flex gap-2">
        <div className="flex-1 card-chinese p-2 text-center">
          <div className="text-xs" style={{ color: 'var(--color-ink-light)' }}>主大将</div>
          <div className="text-sm font-bold" style={{ color: '#1565C0' }}>
            {result.zhuJiang.name}({result.zhuJiang.element})→{result.zhuJiang.palace}宫
          </div>
        </div>
        <div className="flex-1 card-chinese p-2 text-center">
          <div className="text-xs" style={{ color: 'var(--color-ink-light)' }}>客大将</div>
          <div className="text-sm font-bold" style={{ color: '#C62828' }}>
            {result.keJiang.name}({result.keJiang.element})→{result.keJiang.palace}宫
          </div>
        </div>
      </div>
    </div>
  );
}
