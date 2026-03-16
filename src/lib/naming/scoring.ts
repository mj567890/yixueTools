/**
 * 起名测名 —— 综合评分引擎
 * 五维加权评分：八字 + 五格 + 三才 + 音律 + 字义
 */

import type { ScoreBreakdown, ScoreWeights } from './types';

/** 默认权重 */
export const DEFAULT_WEIGHTS: ScoreWeights = {
  bazi: 0.30,
  wuge: 0.25,
  sancai: 0.15,
  phonetics: 0.15,
  meaning: 0.15,
};

/**
 * 计算加权总分
 * @param breakdown 五维分项评分 (各0-100)
 * @param weights 权重 (总和应为1)
 */
export function calcTotalScore(breakdown: ScoreBreakdown, weights?: ScoreWeights): number {
  const w = weights ?? DEFAULT_WEIGHTS;
  const raw = breakdown.bazi * w.bazi
    + breakdown.wuge * w.wuge
    + breakdown.sancai * w.sancai
    + breakdown.phonetics * w.phonetics
    + breakdown.meaning * w.meaning;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

/** 获取评分等级描述 */
export function getScoreLevel(score: number): string {
  if (score >= 90) return '极佳';
  if (score >= 80) return '优秀';
  if (score >= 70) return '良好';
  if (score >= 60) return '中等';
  if (score >= 50) return '一般';
  return '偏差';
}

/** 获取评分标签（用于推荐列表） */
export function getScoreTags(breakdown: ScoreBreakdown): string[] {
  const tags: string[] = [];
  if (breakdown.bazi >= 85) tags.push('八字契合');
  if (breakdown.wuge >= 85) tags.push('五格大吉');
  if (breakdown.sancai >= 85) tags.push('三才俱佳');
  if (breakdown.phonetics >= 85) tags.push('音律优美');
  if (breakdown.meaning >= 85) tags.push('寓意深远');
  if (breakdown.bazi >= 70 && breakdown.wuge >= 70 && breakdown.sancai >= 70) {
    tags.push('综合均衡');
  }
  return tags;
}
