/**
 * 起名测名 —— 测名分析引擎
 * 综合五格、三才、八字、字义分析生成完整报告
 */

import type {
  NamingAnalysis, NamingVerdict, ScoreBreakdown,
} from './types';
import { calcWuGe, scoreWuGe } from './wugeCalc';
import { calcSanCai, scoreSanCai } from './sancaiCalc';
import { analyzeChars, scoreCharAnalysis } from './charAnalysis';
import { matchBazi, scoreBaziMatch } from './baziMatch';
import { calcTotalScore, getScoreLevel, DEFAULT_WEIGHTS } from './scoring';
import { isCompoundSurname } from './constants';

/**
 * 测名分析主入口
 * @param fullName 完整姓名
 * @param birthYear 公历年（可选）
 * @param birthMonth 公历月（可选）
 * @param birthDay 公历日（可选）
 * @param birthHour 出生时 (0-23)（可选）
 */
export function analyzeNaming(
  fullName: string,
  birthYear?: number,
  birthMonth?: number,
  birthDay?: number,
  birthHour?: number,
): NamingAnalysis {
  // 解析姓名
  const compound = isCompoundSurname(fullName);
  const surnameLen = compound ? 2 : 1;
  const surname = fullName.substring(0, surnameLen);
  const givenName = fullName.substring(surnameLen);

  // 1. 五格计算
  const wugeResult = calcWuGe(fullName);
  const wugeScore = scoreWuGe(wugeResult);

  // 2. 三才配置
  const sancaiResult = calcSanCai(wugeResult);
  const sancaiScore = scoreSanCai(sancaiResult);

  // 3. 字义分析
  const charAnalysis = analyzeChars(fullName);
  const { phonetics, meaning } = scoreCharAnalysis(charAnalysis);

  // 4. 八字匹配（可选）
  let baziMatch;
  let baziScore = 70;
  const hasBirth = birthYear !== undefined && birthMonth !== undefined
    && birthDay !== undefined && birthHour !== undefined;

  if (hasBirth) {
    baziMatch = matchBazi(fullName, birthYear!, birthMonth!, birthDay!, birthHour!);
    baziScore = scoreBaziMatch(baziMatch);
  }

  // 5. 综合评分
  const scoreBreakdown: ScoreBreakdown = {
    bazi: baziScore,
    wuge: wugeScore,
    sancai: sancaiScore,
    phonetics,
    meaning,
  };
  const totalScore = calcTotalScore(scoreBreakdown);

  // 6. 生成断语
  const verdicts = generateVerdicts(wugeScore, sancaiScore, baziScore, phonetics, meaning, hasBirth);

  // 7. 生成摘要
  const beginnerSummary = generateBeginnerSummary(fullName, totalScore, verdicts);
  const professionalSummary = generateProfessionalSummary(
    fullName, totalScore, scoreBreakdown, verdicts,
  );

  return {
    fullName,
    surname,
    givenName,
    wugeResult,
    sancaiResult,
    baziMatch,
    charAnalysis,
    totalScore,
    scoreBreakdown,
    verdicts,
    beginnerSummary,
    professionalSummary,
  };
}

/* ===== 断语生成 ===== */

function generateVerdicts(
  wuge: number, sancai: number, bazi: number,
  phonetics: number, meaning: number, hasBirth: boolean,
): NamingVerdict[] {
  const verdicts: NamingVerdict[] = [];

  // 五格断语
  verdicts.push({
    category: '五格数理',
    level: wuge >= 75 ? '吉' : wuge >= 55 ? '平' : '凶',
    conclusion: `五格数理${getScoreLevel(wuge)}（${wuge}分）`,
    advice: wuge < 60 ? '建议调整用字笔画以改善五格配置' : '五格配置良好',
    beginnerText: `名字的笔画组合${wuge >= 75 ? '很好' : wuge >= 55 ? '还行' : '有待改善'}`,
    professionalText: `五格数理评分${wuge}分，${getScoreLevel(wuge)}。人格、地格为核心参考格。`,
  });

  // 三才断语
  verdicts.push({
    category: '三才配置',
    level: sancai >= 75 ? '吉' : sancai >= 55 ? '平' : '凶',
    conclusion: `三才配置${getScoreLevel(sancai)}（${sancai}分）`,
    advice: sancai < 60 ? '三才配置偏差，建议调整笔画使天人地五行协调' : '三才搭配和谐',
    beginnerText: `天地人三者关系${sancai >= 75 ? '和谐' : sancai >= 55 ? '尚可' : '不太协调'}`,
    professionalText: `三才配置评分${sancai}分，${getScoreLevel(sancai)}。影响成功运与基础运。`,
  });

  // 八字断语
  if (hasBirth) {
    verdicts.push({
      category: '八字匹配',
      level: bazi >= 75 ? '吉' : bazi >= 55 ? '平' : '凶',
      conclusion: `八字匹配${getScoreLevel(bazi)}（${bazi}分）`,
      advice: bazi < 60 ? '姓名五行与八字喜用神不够契合，建议调整' : '姓名五行与八字搭配合理',
      beginnerText: `名字与您的生辰八字${bazi >= 75 ? '很搭配' : bazi >= 55 ? '搭配尚可' : '搭配度不高'}`,
      professionalText: `八字匹配评分${bazi}分，考量喜用神五行与姓名五行的契合度。`,
    });
  }

  // 音律断语
  verdicts.push({
    category: '音律搭配',
    level: phonetics >= 75 ? '吉' : phonetics >= 55 ? '平' : '凶',
    conclusion: `音律搭配${getScoreLevel(phonetics)}（${phonetics}分）`,
    advice: phonetics < 60 ? '声调搭配可优化，建议选择平仄交替的读音' : '读音朗朗上口',
    beginnerText: `名字读起来${phonetics >= 75 ? '很好听' : phonetics >= 55 ? '还不错' : '可以更好'}`,
    professionalText: `音律评分${phonetics}分，分析平仄搭配、声母韵母避重。`,
  });

  // 字义断语
  verdicts.push({
    category: '字义寓意',
    level: meaning >= 75 ? '吉' : meaning >= 55 ? '平' : '凶',
    conclusion: `字义寓意${getScoreLevel(meaning)}（${meaning}分）`,
    advice: meaning < 60 ? '建议选用寓意更积极美好的字' : '用字寓意良好',
    beginnerText: `名字的意思${meaning >= 75 ? '很美好' : meaning >= 55 ? '不错' : '可以改善'}`,
    professionalText: `字义评分${meaning}分，分析用字寓意、字形结构。`,
  });

  return verdicts;
}

/* ===== 摘要文本 ===== */

function generateBeginnerSummary(fullName: string, score: number, verdicts: NamingVerdict[]): string {
  const level = getScoreLevel(score);
  const parts: string[] = [];

  parts.push(`「${fullName}」综合评分 ${score} 分（${level}）。`);

  const goodPoints = verdicts.filter(v => v.level === '吉').map(v => v.category);
  const badPoints = verdicts.filter(v => v.level === '凶').map(v => v.category);

  if (goodPoints.length > 0) {
    parts.push(`优势：${goodPoints.join('、')}表现出色。`);
  }
  if (badPoints.length > 0) {
    parts.push(`可改进：${badPoints.join('、')}方面有提升空间。`);
  }

  if (score >= 80) {
    parts.push('总体来说这是一个很好的名字！');
  } else if (score >= 60) {
    parts.push('名字整体不错，部分方面可以进一步优化。');
  } else {
    parts.push('建议考虑调整用字以获得更好的综合评价。');
  }

  return parts.join('');
}

function generateProfessionalSummary(
  fullName: string, score: number,
  breakdown: ScoreBreakdown, verdicts: NamingVerdict[],
): string {
  const lines: string[] = [];

  lines.push(`【${fullName}】测名报告`);
  lines.push(`综合评分：${score}分（${getScoreLevel(score)}）`);
  lines.push(`分项评分：八字${breakdown.bazi} | 五格${breakdown.wuge} | 三才${breakdown.sancai} | 音律${breakdown.phonetics} | 字义${breakdown.meaning}`);
  lines.push(`权重配比：${DEFAULT_WEIGHTS.bazi}×八字 + ${DEFAULT_WEIGHTS.wuge}×五格 + ${DEFAULT_WEIGHTS.sancai}×三才 + ${DEFAULT_WEIGHTS.phonetics}×音律 + ${DEFAULT_WEIGHTS.meaning}×字义`);
  lines.push('');

  for (const v of verdicts) {
    lines.push(`${v.category}：${v.professionalText}`);
  }

  return lines.join('\n');
}
