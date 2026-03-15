'use client';

import type { PalaceId, QimenResult } from '@/lib/qimen';
import PalaceCell from './PalaceCell';

interface QimenBoardProps {
  result: QimenResult;
  selectedPalaces?: PalaceId[];
  onPalaceClick?: (palaceId: PalaceId) => void;
  showYinPan?: boolean;
}

/**
 * 九宫盘面 3x3 布局
 * 洛书排列：
 *   巽4  离9  坤2
 *   震3  中5  兑7
 *   艮8  坎1  乾6
 */
const GRID_LAYOUT: PalaceId[][] = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

export default function QimenBoard({ result, selectedPalaces = [], onPalaceClick, showYinPan }: QimenBoardProps) {
  return (
    <div className="card-chinese p-3 md:p-4">
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {GRID_LAYOUT.flat().map(palaceId => (
          <PalaceCell
            key={palaceId}
            palace={result.palaces[palaceId]}
            isSelected={selectedPalaces.includes(palaceId)}
            showYinPan={showYinPan}
            onClick={() => onPalaceClick?.(palaceId)}
          />
        ))}
      </div>
    </div>
  );
}
