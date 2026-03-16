/**
 * 起名测名 —— 三才配置分析
 * 根据天格、人格、地格的五行组合查表分析
 */

import type { SanCaiResult, WuXing, Auspice } from './types';
import type { WuGeResult } from './types';
import { SANCAI_TABLE, getWuxingByNumber, wuxingRelation } from './constants';

/**
 * 计算三才配置
 * @param wugeResult 五格计算结果
 */
export function calcSanCai(wugeResult: WuGeResult): SanCaiResult {
  // 1. 提取天/人/地格的五行
  const tianCai = getWuxingByNumber(wugeResult.tianGe.number);
  const renCai = getWuxingByNumber(wugeResult.renGe.number);
  const diCai = getWuxingByNumber(wugeResult.diGe.number);

  // 2. 查三才配置表
  const combination = `${tianCai}${renCai}${diCai}`;
  const tableEntry = SANCAI_TABLE[combination];

  let auspice: Auspice;
  let score: number;
  let description: string;

  if (tableEntry) {
    auspice = tableEntry.auspice;
    score = tableEntry.score;
    description = tableEntry.description;
  } else {
    // 表中未覆盖时的兜底逻辑
    auspice = '半吉';
    score = 50;
    description = '三才配置中等，尚可';
  }

  // 3. 生成性格/事业/健康描述
  const personality = generatePersonality(tianCai, renCai, diCai, auspice);
  const career = generateCareer(tianCai, renCai, diCai, auspice);
  const health = generateHealth(tianCai, renCai, diCai, auspice);

  // 4. 生成双模式文本
  const beginnerText = generateBeginnerSanCai(combination, auspice, score, description);
  const professionalText = generateProfessionalSanCai(
    tianCai, renCai, diCai, combination, auspice, score,
    description, personality, career, health,
  );

  return {
    tianCai,
    renCai,
    diCai,
    combination,
    auspice,
    score,
    personality,
    career,
    health,
    beginnerText,
    professionalText,
  };
}

/** 三才配置评分（0-100） */
export function scoreSanCai(result: SanCaiResult): number {
  return result.score;
}

/* ===== 文本生成 ===== */

function generatePersonality(tian: WuXing, ren: WuXing, di: WuXing, auspice: Auspice): string {
  const traits: string[] = [];

  // 基于人才（人格五行）判断核心性格
  switch (ren) {
    case '木': traits.push('性格仁慈温和，有进取心'); break;
    case '火': traits.push('性格热情积极，有领导力'); break;
    case '土': traits.push('性格稳重踏实，有耐心'); break;
    case '金': traits.push('性格果断刚毅，有决断力'); break;
    case '水': traits.push('性格聪慧灵活，有适应力'); break;
  }

  // 天人关系影响
  const tianRen = wuxingRelation(tian, ren);
  if (tianRen === 'sheng') {
    traits.push('得长辈扶持，内心安定');
  } else if (tianRen === 'ke') {
    traits.push('与长辈关系需注意，易有压力');
  }

  // 人地关系影响
  const renDi = wuxingRelation(ren, di);
  if (renDi === 'sheng') {
    traits.push('基础稳固，做事有根基');
  } else if (renDi === 'ke') {
    traits.push('基础运较弱，需加倍努力');
  }

  if (auspice === '凶') {
    traits.push('整体运势偏弱，须多注意调整心态');
  }

  return traits.join('。') + '。';
}

function generateCareer(tian: WuXing, ren: WuXing, di: WuXing, auspice: Auspice): string {
  const parts: string[] = [];

  if (auspice === '吉') {
    parts.push('事业运势良好，有向上发展的潜力');
  } else if (auspice === '半吉') {
    parts.push('事业运势中等，发展需要把握时机');
  } else {
    parts.push('事业运势偏弱，发展中可能遇到较多困难');
  }

  // 天人关系 → 成功运
  const tianRen = wuxingRelation(tian, ren);
  if (tianRen === 'sheng' || tianRen === 'same') {
    parts.push('成功运佳，努力容易获得回报');
  } else if (tianRen === 'besheng') {
    parts.push('成功运良好，能得到环境助力');
  } else {
    parts.push('成功运需要加强，付出可能大于回报');
  }

  // 人地关系 → 基础运
  const renDi = wuxingRelation(ren, di);
  if (renDi === 'sheng' || renDi === 'same') {
    parts.push('基础运稳固，事业根基扎实');
  } else {
    parts.push('基础运一般，需注意巩固根基');
  }

  return parts.join('。') + '。';
}

function generateHealth(tian: WuXing, ren: WuXing, di: WuXing, auspice: Auspice): string {
  const parts: string[] = [];

  if (auspice === '吉') {
    parts.push('身心安泰，健康状况良好');
  } else if (auspice === '半吉') {
    parts.push('健康状况尚可，注意劳逸结合');
  } else {
    parts.push('需特别注意身体健康，避免过度劳累');
  }

  // 根据五行组合提示易受影响的器官
  const wxHealth: Record<WuXing, string> = {
    '木': '肝胆',
    '火': '心脏血管',
    '土': '脾胃消化',
    '金': '肺呼吸',
    '水': '肾泌尿',
  };

  // 检查被克的五行
  const renDi = wuxingRelation(ren, di);
  if (renDi === 'beke') {
    parts.push(`注意${wxHealth[ren]}方面的保养`);
  }

  const tianRen = wuxingRelation(tian, ren);
  if (tianRen === 'ke') {
    parts.push(`注意${wxHealth[ren]}方面的调养`);
  }

  return parts.join('。') + '。';
}

/** 白话模式 */
function generateBeginnerSanCai(
  combination: string, auspice: Auspice, score: number, description: string,
): string {
  const level = auspice === '吉' ? '很好' : auspice === '半吉' ? '中等' : '偏差';
  return `三才配置（${combination}）整体评价${level}（${score}分）。${description}。`;
}

/** 专业模式 */
function generateProfessionalSanCai(
  tian: WuXing, ren: WuXing, di: WuXing,
  combination: string, auspice: Auspice, score: number,
  description: string, personality: string, career: string, health: string,
): string {
  const lines: string[] = [];
  lines.push(`三才配置：天才${tian} · 人才${ren} · 地才${di}（${combination}），${auspice}，${score}分。`);
  lines.push(`概述：${description}`);

  // 天人关系
  const tianRen = wuxingRelation(tian, ren);
  lines.push(`成功运（天→人）：${tian}${relationLabel(tianRen)}${ren}，${tianRen === 'sheng' || tianRen === 'same' ? '顺畅' : tianRen === 'ke' ? '受克制' : '一般'}`);

  // 人地关系
  const renDi = wuxingRelation(ren, di);
  lines.push(`基础运（人→地）：${ren}${relationLabel(renDi)}${di}，${renDi === 'sheng' || renDi === 'same' ? '稳固' : renDi === 'ke' ? '不稳' : '一般'}`);

  lines.push(`性格：${personality}`);
  lines.push(`事业：${career}`);
  lines.push(`健康：${health}`);

  return lines.join('\n');
}

/** 五行关系标签 */
function relationLabel(rel: string): string {
  switch (rel) {
    case 'sheng': return '→生→';
    case 'ke': return '→克→';
    case 'besheng': return '←生←';
    case 'beke': return '←克←';
    case 'same': return '＝同＝';
    default: return '→';
  }
}
