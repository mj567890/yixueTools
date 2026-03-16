/**
 * 起名测名 —— 起名推荐引擎
 * 三阶段管线：筛选字 → 枚举笔画组合 → 排名推荐
 */

import type {
  NamingConfig, NameCandidate, ScoreBreakdown,
  WuXing,
} from './types';
import { getCharsByWuxingAndStrokes, filterByGender, excludeChars, getCharEntry } from './charDatabase';
import { calcWuGe, scoreWuGe, getWuGeWuxing } from './wugeCalc';
import { calcSanCai, scoreSanCai } from './sancaiCalc';
import { analyzeChars, scoreCharAnalysis } from './charAnalysis';
import { matchBazi, scoreBaziMatch } from './baziMatch';
import { calcTotalScore, getScoreTags, DEFAULT_WEIGHTS } from './scoring';
import {
  getWuxingByNumber, normalizeShuli, SHULI_TABLE, SANCAI_TABLE,
  isCompoundSurname, inferYongShen,
} from './constants';
import { getKangxiStrokes } from './charDatabase';
import { getBaziResult } from '../lunar';

/** 最大推荐数量 */
const MAX_CANDIDATES = 50;
/** 每种笔画组合最多尝试的字组合数 */
const MAX_COMBO_PER_STROKE = 200;

/**
 * 起名推荐主入口
 * @param config 起名配置
 * @returns 排序后的推荐名字列表
 */
export function generateNames(config: NamingConfig): NameCandidate[] {
  // 1. 准备信息
  const compound = isCompoundSurname(config.surname);
  const surnameStrokes: number[] = [];
  for (const ch of config.surname) {
    surnameStrokes.push(getKangxiStrokes(ch) || 1);
  }

  // 获取八字喜用神（如果有出生信息）
  const hasBirth = config.birthYear && config.birthMonth && config.birthDay;
  let yongShen: WuXing[] = [];

  if (hasBirth) {
    const bazi = getBaziResult(
      config.birthYear!, config.birthMonth!, config.birthDay!, config.birthHour ?? 12,
    );
    const dayMasterWX = bazi.dayMasterWuxing as WuXing;
    const strength = bazi.wuxingAnalysis.dayMasterStrength;
    yongShen = inferYongShen(dayMasterWX, strength).yongShen;
  }

  // 2. 枚举吉利的笔画组合
  const strokeCombos = findAuspiciousStrokeCombos(surnameStrokes, compound, config.nameLength);

  // 3. 为每种笔画组合筛选候选字
  const candidates: NameCandidate[] = [];

  for (const combo of strokeCombos) {
    if (candidates.length >= MAX_CANDIDATES) break;

    const comboNames = generateFromCombo(
      config, surnameStrokes, compound, combo, yongShen,
    );
    candidates.push(...comboNames);
  }

  // 4. 排序并截取
  candidates.sort((a, b) => b.totalScore - a.totalScore);
  return candidates.slice(0, MAX_CANDIDATES);
}

/* ===== 阶段一：枚举吉利笔画组合 ===== */

interface StrokeCombo {
  strokes: number[]; // 名字各字笔画
  wugeScore: number; // 五格预估分
}

/** 枚举产生吉利五格+三才的笔画组合 */
function findAuspiciousStrokeCombos(
  surnameStrokes: number[], compound: boolean, nameLength: 1 | 2,
): StrokeCombo[] {
  const results: StrokeCombo[] = [];
  const sTotal = surnameStrokes.reduce((a, b) => a + b, 0);

  // 笔画范围 1-30
  const range = Array.from({ length: 30 }, (_, i) => i + 1);

  if (nameLength === 1) {
    // 单名
    for (const g1 of range) {
      const score = evaluateStrokeCombo(surnameStrokes, compound, [g1]);
      if (score >= 60) {
        results.push({ strokes: [g1], wugeScore: score });
      }
    }
  } else {
    // 双名
    for (const g1 of range) {
      for (const g2 of range) {
        const score = evaluateStrokeCombo(surnameStrokes, compound, [g1, g2]);
        if (score >= 60) {
          results.push({ strokes: [g1, g2], wugeScore: score });
        }
      }
    }
  }

  // 按五格预估分排序
  results.sort((a, b) => b.wugeScore - a.wugeScore);
  return results.slice(0, 100); // 取top100组合
}

/** 评估一组笔画的五格+三才预估分 */
function evaluateStrokeCombo(
  surnameStrokes: number[], compound: boolean, givenStrokes: number[],
): number {
  const s1 = surnameStrokes[0];
  const s2 = compound ? surnameStrokes[1] : 0;

  let tianGe: number, renGe: number, diGe: number, zongGe: number;

  if (compound) {
    tianGe = s1 + s2;
    renGe = s2 + givenStrokes[0];
    if (givenStrokes.length === 1) {
      diGe = givenStrokes[0] + 1;
    } else {
      diGe = givenStrokes[0] + givenStrokes[1];
    }
    zongGe = s1 + s2 + givenStrokes.reduce((a, b) => a + b, 0);
  } else {
    tianGe = s1 + 1;
    renGe = s1 + givenStrokes[0];
    if (givenStrokes.length === 1) {
      diGe = givenStrokes[0] + 1;
    } else {
      diGe = givenStrokes[0] + givenStrokes[1];
    }
    zongGe = s1 + givenStrokes.reduce((a, b) => a + b, 0);
  }

  // 检查五格数理吉凶
  let score = 0;
  const grids = [
    { num: tianGe, weight: 10 },
    { num: renGe, weight: 35 },
    { num: diGe, weight: 25 },
    { num: zongGe, weight: 20 },
  ];

  for (const g of grids) {
    const n = normalizeShuli(g.num);
    const entry = SHULI_TABLE[n];
    if (entry) {
      if (entry.auspice === '吉') score += g.weight;
      else if (entry.auspice === '半吉') score += g.weight * 0.65;
      else score += g.weight * 0.25;
    }
  }

  // 检查三才配置
  const tianWX = getWuxingByNumber(tianGe);
  const renWX = getWuxingByNumber(renGe);
  const diWX = getWuxingByNumber(diGe);
  const scKey = `${tianWX}${renWX}${diWX}`;
  const scEntry = SANCAI_TABLE[scKey];
  if (scEntry) {
    if (scEntry.auspice === '吉') score += 10;
    else if (scEntry.auspice === '半吉') score += 5;
  }

  return score;
}

/* ===== 阶段二：从笔画组合生成候选名 ===== */

function generateFromCombo(
  config: NamingConfig,
  surnameStrokes: number[],
  compound: boolean,
  combo: StrokeCombo,
  yongShen: WuXing[],
): NameCandidate[] {
  const candidates: NameCandidate[] = [];
  const avoidChars = config.avoidChars ?? [];

  if (combo.strokes.length === 1) {
    // 单名
    const strokes1 = combo.strokes[0];
    const targetWX = yongShen.length > 0 ? yongShen : (['木', '火', '土', '金', '水'] as WuXing[]);

    for (const wx of targetWX) {
      let chars1 = getCharsByWuxingAndStrokes(wx, strokes1);
      chars1 = filterByGender(chars1, config.gender);
      chars1 = excludeChars(chars1, avoidChars);

      // 固定字检查
      if (config.fixedFirstChar) {
        chars1 = chars1.filter(c => c.char === config.fixedFirstChar);
      }

      for (const c1 of chars1.slice(0, MAX_COMBO_PER_STROKE)) {
        const fullName = config.surname + c1.char;
        const candidate = evaluateCandidate(fullName, config);
        if (candidate) candidates.push(candidate);
      }
    }
  } else {
    // 双名
    const strokes1 = combo.strokes[0];
    const strokes2 = combo.strokes[1];
    const targetWX = yongShen.length > 0 ? yongShen : (['木', '火', '土', '金', '水'] as WuXing[]);

    for (const wx1 of targetWX) {
      let chars1 = getCharsByWuxingAndStrokes(wx1, strokes1);
      chars1 = filterByGender(chars1, config.gender);
      chars1 = excludeChars(chars1, avoidChars);
      if (config.fixedFirstChar) {
        chars1 = chars1.filter(c => c.char === config.fixedFirstChar);
      }

      for (const wx2 of targetWX) {
        let chars2 = getCharsByWuxingAndStrokes(wx2, strokes2);
        chars2 = filterByGender(chars2, config.gender);
        chars2 = excludeChars(chars2, avoidChars);
        if (config.fixedSecondChar) {
          chars2 = chars2.filter(c => c.char === config.fixedSecondChar);
        }

        // 限制组合数
        const c1Slice = chars1.slice(0, 15);
        const c2Slice = chars2.slice(0, 15);

        for (const c1 of c1Slice) {
          for (const c2 of c2Slice) {
            if (c1.char === c2.char) continue;
            const fullName = config.surname + c1.char + c2.char;
            const candidate = evaluateCandidate(fullName, config);
            if (candidate) candidates.push(candidate);
          }
        }
      }
    }
  }

  return candidates;
}

/* ===== 阶段三：评估单个候选名 ===== */

function evaluateCandidate(fullName: string, config: NamingConfig): NameCandidate | null {
  try {
    const surname = config.surname;
    const givenName = fullName.substring(surname.length);

    // 计算五格
    const wugeResult = calcWuGe(fullName);
    const wugeScore = scoreWuGe(wugeResult);

    // 计算三才
    const sancaiResult = calcSanCai(wugeResult);
    const sancaiScore = scoreSanCai(sancaiResult);

    // 字义分析
    const charAnalysis = analyzeChars(fullName);
    const { phonetics, meaning } = scoreCharAnalysis(charAnalysis);

    // 谐音检查：有不雅谐音直接过滤
    if (charAnalysis.homophoneWarnings.length > 0) return null;

    // 八字匹配（如果有出生信息）
    let baziMatch;
    let baziScore = 70; // 默认中等分
    if (config.birthYear && config.birthMonth && config.birthDay) {
      baziMatch = matchBazi(
        fullName,
        config.birthYear!, config.birthMonth!, config.birthDay!, config.birthHour ?? 12,
      );
      baziScore = scoreBaziMatch(baziMatch);
    }

    // 综合评分
    const breakdown: ScoreBreakdown = {
      bazi: baziScore,
      wuge: wugeScore,
      sancai: sancaiScore,
      phonetics,
      meaning,
    };
    const weights = config.weightConfig ?? DEFAULT_WEIGHTS;
    const totalScore = calcTotalScore(breakdown, weights);

    // 生成标签
    const tags = getScoreTags(breakdown);

    return {
      fullName,
      givenName,
      totalScore,
      scoreBreakdown: breakdown,
      wugeResult,
      sancaiResult,
      charAnalysis,
      baziMatch,
      tags,
    };
  } catch {
    return null;
  }
}
