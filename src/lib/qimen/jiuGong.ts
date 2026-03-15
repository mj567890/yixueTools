/**
 * 奇门遁甲 —— 九宫坐标系工具函数
 */

import type { PalaceId } from './types';
import { FORWARD_PALACE_ORDER, BACKWARD_PALACE_ORDER, OPPOSITE_PALACE, BRANCH_TO_PALACE } from './constants';

/**
 * 从指定宫位出发，按指定方向遍历九宫序列（跳过5宫）
 * @param startPalace 起始宫位
 * @param direction 方向：'forward' 顺行, 'backward' 逆行
 * @param count 需要的宫位数量
 * @returns 宫位 ID 数组
 */
export function getPalaceSequence(
  startPalace: PalaceId,
  direction: 'forward' | 'backward',
  count: number,
): PalaceId[] {
  const order = direction === 'forward' ? FORWARD_PALACE_ORDER : BACKWARD_PALACE_ORDER;
  const startIndex = order.indexOf(startPalace as PalaceId);
  if (startIndex === -1) {
    // 如果是5宫，按寄2宫处理
    const fallback = direction === 'forward' ? FORWARD_PALACE_ORDER : BACKWARD_PALACE_ORDER;
    const idx = fallback.indexOf(2 as PalaceId);
    const result: PalaceId[] = [];
    for (let i = 0; i < count; i++) {
      result.push(fallback[(idx + i) % 8]);
    }
    return result;
  }
  const result: PalaceId[] = [];
  for (let i = 0; i < count; i++) {
    result.push(order[(startIndex + i) % 8]);
  }
  return result;
}

/**
 * 计算两个宫位在给定方向上的步数偏移
 * @returns 从 fromPalace 到 toPalace 的步数（0-7）
 */
export function getOffsetBetween(
  fromPalace: PalaceId,
  toPalace: PalaceId,
  direction: 'forward' | 'backward',
): number {
  const order = direction === 'forward' ? FORWARD_PALACE_ORDER : BACKWARD_PALACE_ORDER;
  const fromIdx = order.indexOf(fromPalace);
  const toIdx = order.indexOf(toPalace);
  if (fromIdx === -1 || toIdx === -1) return 0;
  return (toIdx - fromIdx + 8) % 8;
}

/**
 * 获取对冲宫
 */
export function getOppositePalace(palace: PalaceId): PalaceId {
  return OPPOSITE_PALACE[palace];
}

/**
 * 地支→宫位映射
 */
export function branchToPalace(branch: string): PalaceId {
  return BRANCH_TO_PALACE[branch] || (1 as PalaceId);
}

/**
 * 通过步数偏移获取目标宫位
 * @param startPalace 起始宫位
 * @param offset 偏移步数
 * @param direction 方向
 */
export function getTargetPalace(
  startPalace: PalaceId,
  offset: number,
  direction: 'forward' | 'backward',
): PalaceId {
  const order = direction === 'forward' ? FORWARD_PALACE_ORDER : BACKWARD_PALACE_ORDER;
  const startIdx = order.indexOf(startPalace);
  if (startIdx === -1) return 2 as PalaceId; // 5宫寄2宫
  return order[(startIdx + offset) % 8];
}
