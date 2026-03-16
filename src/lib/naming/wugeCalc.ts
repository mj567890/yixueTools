/**
 * 起名测名 —— 五格数理计算引擎
 * 支持单姓单名、单姓双名、复姓单名、复姓双名四种模式
 */

import type { WuGeResult, WuGeGrid, WuXing, Auspice } from './types';
import { getKangxiStrokes } from './charDatabase';
import {
  getWuxingByNumber, normalizeShuli,
  SHULI_TABLE, isCompoundSurname,
} from './constants';

/* ===== 核心计算 ===== */

/**
 * 计算五格数理
 * @param fullName 完整姓名（如"诸葛亮"、"张三丰"、"李白"、"张伟"）
 */
export function calcWuGe(fullName: string): WuGeResult {
  if (fullName.length < 2) {
    throw new Error('姓名至少需要两个字');
  }

  // 1. 判断姓氏类型（复姓/单姓）
  const compound = isCompoundSurname(fullName);
  const surnameLen = compound ? 2 : 1;
  const surname = fullName.substring(0, surnameLen);
  const givenName = fullName.substring(surnameLen);

  if (givenName.length === 0) {
    throw new Error('名字部分不能为空');
  }

  // 2. 获取每个字的康熙笔画
  const surnameStrokes: number[] = [];
  for (const ch of surname) {
    const s = getKangxiStrokes(ch);
    surnameStrokes.push(s || 1); // 兜底1画
  }
  const givenNameStrokes: number[] = [];
  for (const ch of givenName) {
    const s = getKangxiStrokes(ch);
    givenNameStrokes.push(s || 1);
  }

  // 3. 计算五格数值
  let tianGeNum: number;
  let renGeNum: number;
  let diGeNum: number;
  let zongGeNum: number;
  let waiGeNum: number;

  const totalStrokes = surnameStrokes.reduce((a, b) => a + b, 0)
    + givenNameStrokes.reduce((a, b) => a + b, 0);

  if (compound) {
    // 复姓
    const s1 = surnameStrokes[0];
    const s2 = surnameStrokes[1];

    tianGeNum = s1 + s2; // 复姓天格 = 姓氏二字之和

    if (givenName.length === 1) {
      // 复姓单名
      const g1 = givenNameStrokes[0];
      renGeNum = s2 + g1;
      diGeNum = g1 + 1; // 单名 +1
      zongGeNum = totalStrokes;
      waiGeNum = s1 + 1; // 复姓单名外格
    } else {
      // 复姓双名
      const g1 = givenNameStrokes[0];
      const g2 = givenNameStrokes[1];
      renGeNum = s2 + g1;
      diGeNum = g1 + g2;
      zongGeNum = totalStrokes;
      waiGeNum = zongGeNum - renGeNum + 1;
    }
  } else {
    // 单姓
    const s1 = surnameStrokes[0];

    tianGeNum = s1 + 1; // 单姓天格 = 姓笔画 + 1

    if (givenName.length === 1) {
      // 单姓单名
      const g1 = givenNameStrokes[0];
      renGeNum = s1 + g1;
      diGeNum = g1 + 1; // 单名 +1
      zongGeNum = totalStrokes;
      waiGeNum = 2; // 单姓单名外格固定为2
    } else {
      // 单姓双名
      const g1 = givenNameStrokes[0];
      const g2 = givenNameStrokes[1];
      renGeNum = s1 + g1;
      diGeNum = g1 + g2;
      zongGeNum = totalStrokes;
      waiGeNum = zongGeNum - renGeNum + 1;
    }
  }

  // 确保外格最小为2
  if (waiGeNum < 2) waiGeNum = 2;

  // 4. 构建五格详情
  const tianGe = buildGrid('天格', tianGeNum);
  const renGe = buildGrid('人格', renGeNum);
  const diGe = buildGrid('地格', diGeNum);
  const zongGe = buildGrid('总格', zongGeNum);
  const waiGe = buildGrid('外格', waiGeNum);

  // 5. 推算过程记录
  const debugLines: string[] = [];
  debugLines.push(`姓名：${fullName}（${compound ? '复姓' : '单姓'}${givenName.length === 1 ? '单名' : '双名'}）`);
  debugLines.push(`姓笔画：${surname.split('').map((c, i) => `${c}(${surnameStrokes[i]})`).join('+')}`);
  debugLines.push(`名笔画：${givenName.split('').map((c, i) => `${c}(${givenNameStrokes[i]})`).join('+')}`);
  debugLines.push(`天格=${tianGeNum} 人格=${renGeNum} 地格=${diGeNum} 总格=${zongGeNum} 外格=${waiGeNum}`);

  return {
    tianGe,
    renGe,
    diGe,
    zongGe,
    waiGe,
    surnameStrokes,
    givenNameStrokes,
    isCompound: compound,
    debugInfo: debugLines.join('\n'),
  };
}

/* ===== 辅助函数 ===== */

/** 根据数理值构建单格详情 */
function buildGrid(name: string, rawNumber: number): WuGeGrid {
  const number = normalizeShuli(rawNumber);
  const wuxing: WuXing = getWuxingByNumber(number);
  const entry = SHULI_TABLE[number];

  const auspice: Auspice = entry?.auspice ?? '凶';
  const category = entry?.category ?? '';
  const shuliName = entry?.name ?? '';
  const interpretation = entry?.interpretation ?? '';

  return {
    name,
    number: rawNumber, // 原始值（可能 > 81）
    wuxing,
    auspice,
    category,
    interpretation,
    beginnerText: generateBeginnerText(name, rawNumber, auspice, shuliName, interpretation),
    professionalText: generateProfessionalText(name, rawNumber, number, wuxing, auspice, category, shuliName, interpretation),
  };
}

/** 白话模式文本 */
function generateBeginnerText(
  gridName: string, num: number, auspice: Auspice,
  shuliName: string, interpretation: string,
): string {
  const emoji = auspice === '吉' ? '好' : auspice === '半吉' ? '中等' : '不太好';
  return `${gridName}数理为${num}（${shuliName}），运势${emoji}。${simplifyInterpretation(interpretation)}`;
}

/** 专业模式文本 */
function generateProfessionalText(
  gridName: string, rawNum: number, normalized: number,
  wuxing: WuXing, auspice: Auspice, category: string,
  shuliName: string, interpretation: string,
): string {
  const parts: string[] = [];
  parts.push(`${gridName}：${rawNum}画`);
  if (rawNum !== normalized) {
    parts.push(`（取模后${normalized}）`);
  }
  parts.push(`，五行属${wuxing}，数理「${shuliName}」（${category}），${auspice}。`);
  parts.push(interpretation);
  return parts.join('');
}

/** 简化解读文本（去掉太专业的表述） */
function simplifyInterpretation(text: string): string {
  return text
    .replace(/之象/g, '')
    .replace(/须慎防/g, '需注意')
    .replace(/须防/g, '需注意');
}

/* ===== 五格评分 ===== */

/** 计算五格综合评分（0-100） */
export function scoreWuGe(result: WuGeResult): number {
  // 各格权重：人格最重要，其次地格、总格、天格（天格不可变权重低）、外格
  const weights = {
    tianGe: 0.10,
    renGe: 0.35,
    diGe: 0.25,
    zongGe: 0.20,
    waiGe: 0.10,
  };

  const score = (grid: WuGeGrid): number => {
    switch (grid.auspice) {
      case '吉': return 95;
      case '半吉': return 65;
      case '凶': return 25;
      default: return 50;
    }
  };

  return Math.round(
    score(result.tianGe) * weights.tianGe +
    score(result.renGe) * weights.renGe +
    score(result.diGe) * weights.diGe +
    score(result.zongGe) * weights.zongGe +
    score(result.waiGe) * weights.waiGe
  );
}

/** 获取所有五格的五行列表（用于三才配置） */
export function getWuGeWuxing(result: WuGeResult): {
  tianWX: WuXing;
  renWX: WuXing;
  diWX: WuXing;
} {
  return {
    tianWX: result.tianGe.wuxing,
    renWX: result.renGe.wuxing,
    diWX: result.diGe.wuxing,
  };
}
