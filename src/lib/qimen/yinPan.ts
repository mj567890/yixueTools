/**
 * 奇门遁甲 —— 阴盘专属逻辑（暗干/隐干/移星换斗）
 *
 * 暗干计算：某宫天盘干 → 找该干在元旦盘的落宫 → 取该落宫的天盘干
 * 隐干计算：年命干 → 找该干在元旦盘的落宫 → 取该落宫的天盘干 = 全局隐干
 */

import type { PalaceId, QimenResult, SwapAction } from './types';
import { XUN_SHOU_MAP, TIAN_GAN, STEM_TO_PALACE } from './constants';

/**
 * 计算阴盘暗干
 * 规则：某宫天盘干 → 找到该天干在元旦盘的落宫(STEM_TO_PALACE) → 取该落宫的天盘干
 */
export function calculateDarkStems(result: QimenResult): Record<PalaceId, string> {
  const darkStems: Record<number, string> = {};
  const { palaces } = result;

  for (let p = 1; p <= 9; p++) {
    if (p === 5) {
      darkStems[p] = '';
      continue;
    }
    const pid = p as PalaceId;
    const heavenStem = palaces[pid].heavenStem;

    // 天盘干在元旦盘的落宫
    let refPalace = STEM_TO_PALACE[heavenStem];
    if (!refPalace) {
      darkStems[p] = '';
      continue;
    }
    if (refPalace === 5) refPalace = 2 as PalaceId;

    // 取该落宫的天盘干 = 暗干
    darkStems[p] = palaces[refPalace]?.heavenStem || '';
  }

  return darkStems as Record<PalaceId, string>;
}

/**
 * 计算阴盘隐干（基于年命干）
 *
 * 规则：年命干 → 找到该干在元旦盘的落宫(STEM_TO_PALACE) → 取该落宫的天盘干 = 全局隐干
 * 甲隐于六仪：年命干为甲时，用对应旬首六仪替代
 * 若未提供年命干，所有宫位隐干为空
 */
export function calculateHiddenStems(
  result: QimenResult,
  yearMing?: string,
): Record<PalaceId, string> {
  const hiddenStems: Record<number, string> = {};
  const { palaces } = result;

  // 未提供年命干 → 全部为空
  if (!yearMing || yearMing.length < 1) {
    for (let p = 1; p <= 9; p++) {
      hiddenStems[p] = '';
    }
    return hiddenStems as Record<PalaceId, string>;
  }

  // 提取年命干（首字）
  const yearMingGan = yearMing[0];

  // 校验是否为有效天干
  if (!TIAN_GAN.includes(yearMingGan)) {
    for (let p = 1; p <= 9; p++) {
      hiddenStems[p] = '';
    }
    return hiddenStems as Record<PalaceId, string>;
  }

  // 甲隐于六仪：年命干为甲时用对应六仪替代
  let effectiveYearGan = yearMingGan;
  if (yearMingGan === '甲') {
    const xunInfo = XUN_SHOU_MAP[yearMing];
    if (xunInfo) {
      effectiveYearGan = xunInfo.yinStem;
    }
  }

  // 在元旦盘找年命干所对应的宫位
  let yearMingPalace = STEM_TO_PALACE[effectiveYearGan];
  if (!yearMingPalace) {
    for (let p = 1; p <= 9; p++) {
      hiddenStems[p] = '';
    }
    return hiddenStems as Record<PalaceId, string>;
  }
  if (yearMingPalace === 5) yearMingPalace = 2 as PalaceId;

  // 年命干落宫的天盘干 = 全局隐干
  const hiddenStemValue = palaces[yearMingPalace]?.heavenStem || '';

  // 所有外宫共享同一隐干值
  for (let p = 1; p <= 9; p++) {
    if (p === 5) {
      hiddenStems[p] = '';
    } else {
      hiddenStems[p] = hiddenStemValue;
    }
  }

  return hiddenStems as Record<PalaceId, string>;
}

/**
 * 为阴盘结果附加暗干和隐干
 */
export function applyYinPanStems(result: QimenResult, yearMing?: string): QimenResult {
  const darkStems = calculateDarkStems(result);
  const hiddenStems = calculateHiddenStems(result, yearMing);

  const newPalaces = { ...result.palaces };
  for (let p = 1; p <= 9; p++) {
    const pid = p as PalaceId;
    newPalaces[pid] = {
      ...newPalaces[pid],
      yinPanDarkStem: darkStems[pid],
      yinPanHiddenStem: hiddenStems[pid],
    };
  }

  return { ...result, palaces: newPalaces };
}

/**
 * 移星换斗：交换两个宫位的星和天盘干
 * 门、神、地盘干不动
 * 交换后重新计算暗干和隐干
 */
export function applyStarSwap(result: QimenResult, action: SwapAction): QimenResult {
  const { sourcePalace, targetPalace } = action;

  if (sourcePalace === 5 || targetPalace === 5) {
    throw new Error('中五宫不能参与移星换斗');
  }

  const newPalaces = { ...result.palaces };
  const source = { ...newPalaces[sourcePalace] };
  const target = { ...newPalaces[targetPalace] };

  // 交换星
  const tempStar = source.star;
  source.star = target.star;
  target.star = tempStar;

  // 交换天盘干
  const tempHeavenStem = source.heavenStem;
  source.heavenStem = target.heavenStem;
  target.heavenStem = tempHeavenStem;

  newPalaces[sourcePalace] = source;
  newPalaces[targetPalace] = target;

  const newResult = { ...result, palaces: newPalaces };

  // 重新计算暗干和隐干
  return applyYinPanStems(newResult, newResult.config.yearMing);
}
