/**
 * 起名测名 —— 八字匹配分析
 * 调用已有 getBaziResult() 获取八字信息，匹配姓名五行
 */

import type { BaziMatchResult, WuXing } from './types';
import { getBaziResult } from '../lunar';
import type { BaziResult } from '../lunar';
import { getCharEntry } from './charDatabase';
import { inferYongShen, wuxingRelation } from './constants';

const WX_LIST: WuXing[] = ['木', '火', '土', '金', '水'];

/**
 * 八字匹配分析
 * @param fullName 完整姓名
 * @param year 公历年
 * @param month 公历月
 * @param day 公历日
 * @param hour 出生时 (0-23)
 */
export function matchBazi(
  fullName: string,
  year: number, month: number, day: number, hour: number,
): BaziMatchResult {
  // 1. 排八字
  const bazi = getBaziResult(year, month, day, hour);

  // 2. 提取日主信息
  const dayMaster = bazi.dayMaster;
  const dayMasterWX = bazi.dayMasterWuxing as WuXing;
  const dayMasterStrength = bazi.wuxingAnalysis.dayMasterStrength;

  // 3. 推断喜用神
  const { yongShen, jiShen } = inferYongShen(dayMasterWX, dayMasterStrength);

  // 4. 分析姓名五行分布
  const nameWuxingDist = analyzeNameWuxing(fullName);

  // 5. 计算匹配度
  const { matchScore, matchDetails, suggestions } = calcMatchScore(
    nameWuxingDist, yongShen, jiShen, dayMasterWX, dayMasterStrength,
  );

  // 6. 八字摘要
  const baziSummary = buildBaziSummary(bazi);

  // 7. 生成文本
  const beginnerText = generateBeginnerBazi(
    dayMaster, dayMasterStrength, yongShen, matchScore, suggestions,
  );
  const professionalText = generateProfessionalBazi(
    bazi, dayMasterWX, dayMasterStrength,
    yongShen, jiShen, nameWuxingDist, matchScore, matchDetails,
  );

  return {
    baziSummary,
    dayMaster,
    dayMasterStrength,
    yongShen,
    jiShen,
    nameWuxingDist,
    matchScore,
    matchDetails,
    suggestions,
    beginnerText,
    professionalText,
  };
}

/** 八字匹配评分 */
export function scoreBaziMatch(result: BaziMatchResult): number {
  return result.matchScore;
}

/* ===== 内部函数 ===== */

/** 分析姓名各字五行分布 */
function analyzeNameWuxing(fullName: string): Record<string, number> {
  const dist: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

  for (const ch of fullName) {
    const entry = getCharEntry(ch);
    if (entry) {
      dist[entry.wuxing] = (dist[entry.wuxing] || 0) + 1;
    }
  }

  return dist;
}

/** 计算匹配评分 */
function calcMatchScore(
  nameWuxing: Record<string, number>,
  yongShen: WuXing[],
  jiShen: WuXing[],
  dayMasterWX: WuXing,
  strength: string,
): { matchScore: number; matchDetails: string[]; suggestions: string[] } {
  let score = 60; // 基础分
  const details: string[] = [];
  const suggestions: string[] = [];

  const nameTotal = Object.values(nameWuxing).reduce((a, b) => a + b, 0);
  if (nameTotal === 0) {
    return { matchScore: 50, matchDetails: ['无法分析姓名五行'], suggestions: ['建议输入完整姓名'] };
  }

  // 名字部分（去掉姓，因为姓不可选）
  // 但全名五行也有影响，所以全名分析
  const yongCount = yongShen.reduce((sum, wx) => sum + (nameWuxing[wx] || 0), 0);
  const jiCount = jiShen.reduce((sum, wx) => sum + (nameWuxing[wx] || 0), 0);

  // 喜用神占比
  const yongRatio = yongCount / nameTotal;
  const jiRatio = jiCount / nameTotal;

  if (yongRatio >= 0.6) {
    score += 25;
    details.push(`姓名五行中喜用神（${yongShen.join('、')}）占比高（${Math.round(yongRatio * 100)}%），补益效果好`);
  } else if (yongRatio >= 0.4) {
    score += 15;
    details.push(`姓名五行中喜用神占比适中（${Math.round(yongRatio * 100)}%）`);
  } else {
    score -= 5;
    details.push(`姓名五行中喜用神占比偏低（${Math.round(yongRatio * 100)}%），补益不足`);
    suggestions.push(`建议选用五行属${yongShen.join('或')}的字`);
  }

  // 忌神占比
  if (jiRatio >= 0.5) {
    score -= 15;
    details.push(`忌神五行（${jiShen.join('、')}）在姓名中占比过高，不利`);
    suggestions.push(`避免使用五行属${jiShen.join('或')}的字`);
  } else if (jiRatio <= 0.2) {
    score += 10;
    details.push('忌神五行占比低，搭配合理');
  }

  // 五行平衡度
  const wxValues = WX_LIST.map(wx => nameWuxing[wx] || 0);
  const hasZero = wxValues.some(v => v === 0);
  if (!hasZero && nameTotal >= 3) {
    score += 5;
    details.push('姓名五行齐全，配置均衡');
  }

  // 关键位置（名字首字）五行匹配
  // 这里简化为全名分析

  // 日主强弱针对性建议
  if (strength === '偏弱') {
    if (nameWuxing[dayMasterWX] > 0) {
      score += 5;
      details.push(`名字含日主同类（${dayMasterWX}），有助扶身`);
    }
    // 查是否有生日主的五行
    for (const wx of WX_LIST) {
      if (wuxingRelation(wx, dayMasterWX) === 'sheng' && nameWuxing[wx] > 0) {
        score += 3;
        details.push(`名字含生日主的${wx}，有助扶身`);
        break;
      }
    }
  } else if (strength === '偏强') {
    // 偏强需要克泄耗
    for (const wx of WX_LIST) {
      const rel = wuxingRelation(dayMasterWX, wx);
      if ((rel === 'sheng' || rel === 'ke') && nameWuxing[wx] > 0) {
        score += 3;
        details.push(`名字含${wx}，有助泄耗旺气`);
        break;
      }
    }
  }

  score = Math.max(0, Math.min(100, score));

  if (suggestions.length === 0 && score >= 70) {
    suggestions.push('当前姓名与八字搭配良好');
  }

  return { matchScore: score, matchDetails: details, suggestions };
}

/** 构建八字摘要 */
function buildBaziSummary(bazi: BaziResult): string {
  const pillarsStr = bazi.pillars.map(p => p.ganZhi).join(' ');
  return `${pillarsStr}（${bazi.solarDate}）`;
}

/* ===== 文本生成 ===== */

function generateBeginnerBazi(
  dayMaster: string, strength: string,
  yongShen: WuXing[], matchScore: number, suggestions: string[],
): string {
  const lines: string[] = [];
  const strengthLabel = strength === '偏强' ? '偏旺' : strength === '偏弱' ? '偏弱' : '中和';

  lines.push(`您的八字日主为${dayMaster}，命局${strengthLabel}。`);
  lines.push(`取名宜用五行属${yongShen.join('、')}的字，以补益命理。`);

  if (matchScore >= 80) {
    lines.push('当前姓名与八字搭配很好！');
  } else if (matchScore >= 60) {
    lines.push('当前姓名与八字搭配尚可。');
  } else {
    lines.push('当前姓名与八字搭配有待优化。');
  }

  if (suggestions.length > 0) {
    lines.push(`建议：${suggestions[0]}`);
  }

  return lines.join('');
}

function generateProfessionalBazi(
  bazi: BaziResult, dayMasterWX: WuXing, strength: string,
  yongShen: WuXing[], jiShen: WuXing[],
  nameWuxing: Record<string, number>,
  matchScore: number, matchDetails: string[],
): string {
  const lines: string[] = [];

  // 八字信息
  lines.push(`四柱：${bazi.pillars.map(p => `${p.label}${p.ganZhi}`).join(' ')}`);
  lines.push(`日主：${bazi.dayMaster}（${dayMasterWX}），${strength}`);
  lines.push(`五行分布：${JSON.stringify(bazi.wuxingAnalysis.counts)}`);
  if (bazi.wuxingAnalysis.missing.length > 0) {
    lines.push(`缺失五行：${bazi.wuxingAnalysis.missing.join('、')}`);
  }
  lines.push(`喜用神：${yongShen.join('、')}　忌神：${jiShen.join('、')}`);

  // 姓名五行
  const wxStr = Object.entries(nameWuxing).filter(([, v]) => v > 0).map(([k, v]) => `${k}${v}`).join(' ');
  lines.push(`姓名五行：${wxStr}`);

  // 匹配详情
  lines.push(`匹配评分：${matchScore}分`);
  for (const d of matchDetails) {
    lines.push(`· ${d}`);
  }

  return lines.join('\n');
}
