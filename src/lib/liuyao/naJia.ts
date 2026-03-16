/**
 * 六爻排盘系统 —— 纳甲策略
 *
 * 使用策略模式支持多流派:
 * - 京房纳甲 (jingfang): 标准纳甲法，依《增删卜易》《卜筮正宗》
 * - 藏山卜 (cangshanbu): 骨架预留，Phase 4 填充规则
 */

import type { SchoolType, WuXing } from './types';
import { NAJIA_GAN, NAJIA_ZHI, ZHI_WUXING, JING_GUA_BINARY, JING_GUA_WUXING } from './constants';

// ==================== 策略接口 ====================

export interface NaJiaStrategy {
  /** 流派标识 */
  readonly school: SchoolType;
  /** 为指定爻位分配天干 */
  assignGan(jingGuaName: string, isOuter: boolean): string;
  /** 为指定爻位分配地支 (position: 1-6 中实际的经卦内位置 1-3) */
  assignZhi(jingGuaName: string, posInTrigram: number, isOuter: boolean): string;
}

// ==================== 京房纳甲 ====================

class JingFangNaJia implements NaJiaStrategy {
  readonly school: SchoolType = 'jingfang';

  assignGan(jingGuaName: string, isOuter: boolean): string {
    const pair = NAJIA_GAN[jingGuaName];
    if (!pair) throw new Error(`未知经卦: ${jingGuaName}`);
    return isOuter ? pair[1] : pair[0];
  }

  assignZhi(jingGuaName: string, posInTrigram: number, isOuter: boolean): string {
    const zhiArr = NAJIA_ZHI[jingGuaName];
    if (!zhiArr) throw new Error(`未知经卦: ${jingGuaName}`);
    // NAJIA_ZHI 已按 [初爻..上爻] 排好，直接用全局 position 索引
    // 内卦: position 1-3 → index 0-2
    // 外卦: position 4-6 → index 3-5
    const idx = isOuter ? (posInTrigram - 1 + 3) : (posInTrigram - 1);
    return zhiArr[idx];
  }
}

// ==================== 藏山卜 (骨架) ====================

class CangShanBuNaJia implements NaJiaStrategy {
  readonly school: SchoolType = 'cangshanbu';

  /**
   * 藏山卜纳甲天干
   * 目前使用京房规则作为默认值，Phase 4 将替换为藏山卜独有规则
   * 藏山卜主要差异在于: 部分经卦的外卦天干不同
   */
  assignGan(jingGuaName: string, isOuter: boolean): string {
    // TODO: Phase 4 - 替换为藏山卜专有纳甲天干
    const pair = NAJIA_GAN[jingGuaName];
    if (!pair) throw new Error(`未知经卦: ${jingGuaName}`);
    return isOuter ? pair[1] : pair[0];
  }

  /**
   * 藏山卜纳甲地支
   * 目前使用京房规则，Phase 4 将调整排列顺序
   */
  assignZhi(jingGuaName: string, posInTrigram: number, isOuter: boolean): string {
    // TODO: Phase 4 - 替换为藏山卜专有纳甲地支排列
    const zhiArr = NAJIA_ZHI[jingGuaName];
    if (!zhiArr) throw new Error(`未知经卦: ${jingGuaName}`);
    const idx = isOuter ? (posInTrigram - 1 + 3) : (posInTrigram - 1);
    return zhiArr[idx];
  }
}

// ==================== 策略工厂 ====================

const strategies: Record<SchoolType, NaJiaStrategy> = {
  jingfang: new JingFangNaJia(),
  cangshanbu: new CangShanBuNaJia(),
};

/** 获取纳甲策略实例 */
export function getNaJiaStrategy(school: SchoolType): NaJiaStrategy {
  return strategies[school];
}

// ==================== 装卦工具函数 ====================

/**
 * 从六爻阴阳数组提取上下经卦名
 * @param lines 六爻 [初爻..上爻], true=阳
 * @returns [下卦名, 上卦名]
 */
export function extractTrigrams(lines: boolean[]): [string, string] {
  const lowerBin = lines.slice(0, 3).map(l => l ? '1' : '0').join('');
  const upperBin = lines.slice(3, 6).map(l => l ? '1' : '0').join('');
  const lower = JING_GUA_BINARY[lowerBin];
  const upper = JING_GUA_BINARY[upperBin];
  if (!lower || !upper) throw new Error(`无法识别经卦: 下${lowerBin} 上${upperBin}`);
  return [lower, upper];
}

/**
 * 为六爻装纳甲 (核心)
 *
 * @param lines 六爻阴阳 [初..上]
 * @param school 流派
 * @returns 每爻的 [天干, 地支, 地支五行]
 */
export function assignNaJia(
  lines: boolean[],
  school: SchoolType = 'jingfang',
): Array<{ gan: string; zhi: string; zhiWuXing: WuXing }> {
  const strategy = getNaJiaStrategy(school);
  const [lowerName, upperName] = extractTrigrams(lines);

  return lines.map((_, i) => {
    const position = i + 1; // 1-6
    const isOuter = position > 3;
    const jingGuaName = isOuter ? upperName : lowerName;
    const posInTrigram = isOuter ? position - 3 : position;

    const gan = strategy.assignGan(jingGuaName, isOuter);
    const zhi = strategy.assignZhi(jingGuaName, posInTrigram, isOuter);
    const zhiWuXing = ZHI_WUXING[zhi] as WuXing;

    return { gan, zhi, zhiWuXing };
  });
}

/**
 * 获取经卦五行
 */
export function getTrigramWuXing(trigramName: string): WuXing {
  return JING_GUA_WUXING[trigramName] ?? '土';
}
