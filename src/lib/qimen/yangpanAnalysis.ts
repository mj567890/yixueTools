/**
 * 阳盘奇门遁甲 —— 分析引擎
 *
 * 三层分析：
 * 1. 格局检测（吉凶格 + 特殊格局）
 * 2. 宫位分析（星门神干旺衰、门迫、入墓、击刑）
 * 3. 场景化测算（6种场景）
 */

import type {
  PalaceId, YangpanPaiPanResult, YangpanAnalysisResult,
  YangpanPalaceAnalysis, PatternMatch, ScenarioType, ScenarioResult,
} from './types';
import {
  PALACE_INFO, NINE_STARS, EIGHT_GATES,
  GAN_WU_XING, WX_SHENG, WX_KE, PATTERN_DEFS,
  OPPOSITE_PALACE, STEM_MU_PALACE, LIUYI_JIXING,
  SCENARIO_CONFIG, BRANCH_TO_PALACE,
} from './constants';
import type { WuXing } from './types';

// ==================== 工具函数 ====================

/** 获取月令五行（根据月柱地支）*/
function getSeasonWX(monthZhi: string): WuXing {
  const map: Record<string, WuXing> = {
    '寅': '木', '卯': '木',
    '巳': '火', '午': '火',
    '申': '金', '酉': '金',
    '亥': '水', '子': '水',
    '辰': '土', '未': '土', '戌': '土', '丑': '土',
  };
  return map[monthZhi] || '土';
}

/** 五行旺衰（相对于月令） */
function getWangShuai(wx: WuXing, seasonWX: WuXing): string {
  if (wx === seasonWX) return '旺';
  if (WX_SHENG[seasonWX] === wx) return '相';
  if (WX_SHENG[wx] === seasonWX) return '休';
  if (WX_KE[wx] === seasonWX) return '囚';
  if (WX_KE[seasonWX] === wx) return '死';
  return '平';
}

/** 获取九星五行 */
function getStarWX(starName: string): WuXing {
  const star = NINE_STARS.find(s => s.name === starName);
  return star?.element || '土';
}

/** 获取八门五行 */
function getGateWX(gateName: string): WuXing {
  const gate = EIGHT_GATES.find(g => g.name === gateName);
  return gate?.element || '土';
}

/** 获取九星吉凶 */
function getStarAuspice(starName: string): string {
  const star = NINE_STARS.find(s => s.name === starName);
  return star?.auspice || '中';
}

/** 获取八门吉凶 */
function getGateAuspice(gateName: string): string {
  const gate = EIGHT_GATES.find(g => g.name === gateName);
  return gate?.auspice || '中';
}

/** 五行生克关系描述 */
function wxRelation(wx1: WuXing, wx2: WuXing): string {
  if (wx1 === wx2) return '比和';
  if (WX_SHENG[wx1] === wx2) return '生';
  if (WX_SHENG[wx2] === wx1) return '被生';
  if (WX_KE[wx1] === wx2) return '克';
  if (WX_KE[wx2] === wx1) return '被克';
  return '无';
}

/** 在排盘结果中找天干所在宫位 */
function findStemPalace(data: YangpanPaiPanResult, stem: string): number {
  // 先查天盘干
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const palace = data.palaces[p as PalaceId];
    if (palace.heavenStem.includes(stem)) return p;
  }
  // 查地盘干
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const palace = data.palaces[p as PalaceId];
    if (palace.earthStem.includes(stem)) return p;
  }
  return 0;
}

// ==================== 第一层：格局检测 ====================

function detectPatterns(data: YangpanPaiPanResult): PatternMatch[] {
  const patterns: PatternMatch[] = [];

  // 1. 检测 PATTERN_DEFS 中的吉凶格
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const palace = data.palaces[p as PalaceId];
    const h = palace.heavenStem[0] || '';
    const e = palace.earthStem[0] || '';
    const s = palace.star;
    const g = palace.gate;
    const sp = palace.spirit;

    for (const def of PATTERN_DEFS) {
      if (def.check(h, e, s, g, sp)) {
        patterns.push({
          name: def.name,
          type: def.type,
          palace: p as PalaceId,
          description: def.description,
        });
      }
    }
  }

  // 2. 检测伏吟（值符星回本宫）
  const zhiFuStar = data.zhiFuStar;
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const palace = data.palaces[p as PalaceId];
    if (palace.star === zhiFuStar) {
      const starInfo = NINE_STARS.find(s => s.name === zhiFuStar);
      if (starInfo && starInfo.originalPalace === p) {
        patterns.push({
          name: '伏吟',
          type: '凶格',
          palace: p as PalaceId,
          description: `值符${zhiFuStar}回本宫，事情反复、犹豫不决`,
        });
      }
      break;
    }
  }

  // 3. 检测反吟（值符星到对冲宫）
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const palace = data.palaces[p as PalaceId];
    if (palace.star === zhiFuStar) {
      const starInfo = NINE_STARS.find(s => s.name === zhiFuStar);
      if (starInfo && OPPOSITE_PALACE[starInfo.originalPalace] === p) {
        patterns.push({
          name: '反吟',
          type: '凶格',
          palace: p as PalaceId,
          description: `值符${zhiFuStar}到对冲宫，事与愿违、反复无常`,
        });
      }
      break;
    }
  }

  // 4. 检测入墓
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const palace = data.palaces[p as PalaceId];
    const h = palace.heavenStem[0] || '';
    if (h && STEM_MU_PALACE[h] === p) {
      patterns.push({
        name: '入墓',
        type: '凶格',
        palace: p as PalaceId,
        description: `天盘${h}入墓于${PALACE_INFO[p as PalaceId].name}，困顿受阻`,
      });
    }
  }

  // 5. 检测六仪击刑
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const palace = data.palaces[p as PalaceId];
    const h = palace.heavenStem[0] || '';
    if (h && LIUYI_JIXING[h] === p) {
      patterns.push({
        name: '六仪击刑',
        type: '凶格',
        palace: p as PalaceId,
        description: `${h}在${PALACE_INFO[p as PalaceId].name}受击刑，灾祸临身`,
      });
    }
  }

  // 6. 检测门迫（宫克门：宫位五行克八门五行）
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const palace = data.palaces[p as PalaceId];
    if (!palace.gate) continue;
    const palaceWX = PALACE_INFO[p as PalaceId].element;
    const gateWX = getGateWX(palace.gate);
    if (WX_KE[palaceWX] === gateWX) {
      patterns.push({
        name: '门迫',
        type: '凶格',
        palace: p as PalaceId,
        description: `${palace.gate}（${gateWX}）受${PALACE_INFO[p as PalaceId].name}（${palaceWX}）所克，门迫不利`,
      });
    }
  }

  return patterns;
}

// ==================== 第二层：宫位分析 ====================

function analyzePalaces(
  data: YangpanPaiPanResult,
  patterns: PatternMatch[],
  seasonWX: WuXing,
): Record<number, YangpanPalaceAnalysis> {
  const result: Record<number, YangpanPalaceAnalysis> = {};

  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const palace = data.palaces[p as PalaceId];
    const info = PALACE_INFO[p as PalaceId];

    const starWX = getStarWX(palace.star);
    const gateWX = getGateWX(palace.gate);
    const starAuspice = getStarAuspice(palace.star);
    const gateAuspice = getGateAuspice(palace.gate);

    // 门迫检测
    const isMenPo = WX_KE[info.element] === gateWX;

    // 入墓检测
    const h = palace.heavenStem[0] || '';
    const isRuMu = !!(h && STEM_MU_PALACE[h] === p);

    // 综合评分
    let score = 0;
    // 星吉凶
    if (starAuspice === '吉') score += 1;
    else if (starAuspice === '凶') score -= 1;
    // 门吉凶
    if (gateAuspice === '吉') score += 1;
    else if (gateAuspice === '凶') score -= 1;
    // 旺衰
    const starWangShuai = getWangShuai(starWX, seasonWX);
    if (starWangShuai === '旺' || starWangShuai === '相') score += 0.5;
    else if (starWangShuai === '囚' || starWangShuai === '死') score -= 0.5;
    // 门迫减分
    if (isMenPo) score -= 1;
    // 入墓减分
    if (isRuMu) score -= 1;
    // 空亡减分
    if (palace.isVoid) score -= 1;
    // 马星加分（活力）
    if (palace.isHorse) score += 0.5;
    // 格局加减分
    const palacePatterns = patterns.filter(pt => pt.palace === p);
    for (const pt of palacePatterns) {
      if (pt.type === '吉格') score += 1;
      else score -= 1;
    }

    // 评语
    const comments: string[] = [];
    comments.push(`${palace.star}（${starWX}${starAuspice}）${starWangShuai}`);
    comments.push(`${palace.gate}（${gateWX}${gateAuspice}）`);
    if (isMenPo) comments.push('门迫');
    if (isRuMu) comments.push('入墓');
    if (palace.isVoid) comments.push('空亡');
    if (palace.isHorse) comments.push('驿马');

    result[p] = {
      palaceId: p as PalaceId,
      palaceName: info.name,
      palaceWX: info.element,
      star: palace.star,
      starWX,
      starAuspice,
      gate: palace.gate,
      gateWX,
      gateAuspice,
      spirit: palace.spirit,
      heavenStem: palace.heavenStem,
      earthStem: palace.earthStem,
      isVoid: palace.isVoid,
      isHorse: palace.isHorse,
      isMenPo,
      isRuMu,
      score: Math.round(score * 10) / 10,
      comment: comments.join('，'),
    };
  }

  return result;
}

// ==================== 第三层：场景化测算 ====================

function analyzeScenario(
  data: YangpanPaiPanResult,
  palaceAnalyses: Record<number, YangpanPalaceAnalysis>,
  scenario: ScenarioType,
  seasonWX: WuXing,
): ScenarioResult {
  const config = SCENARIO_CONFIG[scenario];
  if (!config) {
    return {
      scenarioName: '未知',
      tiPalace: 0, tiDesc: '', yongPalace: 0, yongDesc: '',
      relation: '', keyFindings: [], conclusion: '场景不存在', advice: [],
      tendency: '平',
    };
  }

  // 体宫：日干落宫
  const dayGan = data.ganZhi.day[0];
  const effectiveDayGan = dayGan === '甲' ? data.xunShouYin : dayGan;
  const tiPalace = findStemPalace(data, effectiveDayGan) || findStemPalace(data, dayGan);

  // 用宫：根据场景类型
  let yongPalace = 0;
  if (config.yongKey === '马星') {
    yongPalace = data.horsePalace;
  } else {
    // 查找门/星/神所在宫位
    for (let p = 1; p <= 9; p++) {
      if (p === 5) continue;
      const palace = data.palaces[p as PalaceId];
      if (palace.gate === config.yongKey || palace.star === config.yongKey || palace.spirit === config.yongKey) {
        yongPalace = p;
        break;
      }
    }
  }

  const tiAnalysis = tiPalace ? palaceAnalyses[tiPalace] : null;
  const yongAnalysis = yongPalace ? palaceAnalyses[yongPalace] : null;

  // 体用关系
  let relation = '无法判定';
  let tendency: '吉' | '凶' | '平' = '平';
  const keyFindings: string[] = [];
  const advice: string[] = [];

  if (tiAnalysis && yongAnalysis) {
    const tiWX = tiAnalysis.palaceWX;
    const yongWX = yongAnalysis.palaceWX;
    const rel = wxRelation(tiWX, yongWX);

    if (rel === '生') {
      relation = `体宫（${tiWX}）生用宫（${yongWX}），体泄气于用`;
      keyFindings.push('体生用：需付出努力，但有回报可能');
    } else if (rel === '被生') {
      relation = `用宫（${yongWX}）生体宫（${tiWX}），用助体`;
      keyFindings.push('用生体：外力助我，事半功倍');
      tendency = '吉';
    } else if (rel === '克') {
      relation = `体宫（${tiWX}）克用宫（${yongWX}），体制用`;
      keyFindings.push('体克用：可控制局面，主动权在我');
      tendency = '吉';
    } else if (rel === '被克') {
      relation = `用宫（${yongWX}）克体宫（${tiWX}），用制体`;
      keyFindings.push('用克体：受外力压制，阻碍较大');
      tendency = '凶';
    } else if (rel === '比和') {
      relation = `体用比和（同为${tiWX}），势均力敌`;
      keyFindings.push('体用比和：竞争态势，需要更多条件判断');
    }

    // 额外判断
    if (tiAnalysis.isVoid) {
      keyFindings.push('体宫空亡：求测人意志不坚、信心不足');
      tendency = tendency === '吉' ? '平' : '凶';
    }
    if (yongAnalysis.isVoid) {
      keyFindings.push('用宫空亡：所求之事虚假、难以落实');
      tendency = tendency === '吉' ? '平' : '凶';
    }
    if (tiAnalysis.isMenPo) keyFindings.push('体宫门迫：自身困境');
    if (yongAnalysis.isMenPo) keyFindings.push('用宫门迫：事物不顺');
    if (tiAnalysis.isHorse) keyFindings.push('体宫驿马：求测人处于变动中');
    if (yongAnalysis.isHorse) keyFindings.push('用宫驿马：事情有变化可能');

    // 综合评分
    const totalScore = tiAnalysis.score + yongAnalysis.score;
    if (totalScore >= 3 && tendency !== '凶') tendency = '吉';
    else if (totalScore <= -3 && tendency !== '吉') tendency = '凶';

    // 建议
    if (tendency === '吉') {
      advice.push('整体形势有利，可积极行动');
      advice.push('注意把握时机，顺势而为');
    } else if (tendency === '凶') {
      advice.push('整体形势不利，宜谨慎行事');
      advice.push('建议暂缓决定，等待时机转变');
    } else {
      advice.push('形势尚不明朗，宜观望等待');
      advice.push('多方了解信息后再做决定');
    }
  } else {
    relation = tiPalace ? `体宫：${PALACE_INFO[tiPalace as PalaceId]?.name || '未知'}` : '体宫不明';
    keyFindings.push('用宫信息不足，无法进行完整分析');
  }

  const conclusionParts: string[] = [];
  conclusionParts.push(`${config.name}方面`);
  if (tendency === '吉') conclusionParts.push('总体趋势向好');
  else if (tendency === '凶') conclusionParts.push('总体趋势不利');
  else conclusionParts.push('总体趋势平平');
  if (keyFindings.length > 0) conclusionParts.push(keyFindings[0]);

  return {
    scenarioName: config.name,
    tiPalace,
    tiDesc: tiPalace ? `日干${dayGan}落${PALACE_INFO[tiPalace as PalaceId]?.name || ''}` : '日干落宫不明',
    yongPalace,
    yongDesc: yongPalace ? `${config.yongKey}落${PALACE_INFO[yongPalace as PalaceId]?.name || ''}` : `${config.yongKey}落宫不明`,
    relation,
    keyFindings,
    conclusion: conclusionParts.join('。'),
    advice,
    tendency,
  };
}

// ==================== 综合分析入口 ====================

/**
 * 阳盘分析主入口
 */
export function analyzeYangpan(
  data: YangpanPaiPanResult,
  scenario?: ScenarioType,
): YangpanAnalysisResult {
  const monthZhi = data.ganZhi.month[1];
  const seasonWX = getSeasonWX(monthZhi);

  // 1. 格局检测
  const patterns = detectPatterns(data);

  // 2. 宫位分析
  const palaceAnalyses = analyzePalaces(data, patterns, seasonWX);

  // 3. 四柱干落宫
  const dayGan = data.ganZhi.day[0];
  const timeGan = data.ganZhi.time[0];
  const yearGan = data.ganZhi.year[0];
  const monthGan = data.ganZhi.month[0];

  const stemLocations = {
    dayGan: { stem: dayGan, palace: findStemPalace(data, dayGan) },
    timeGan: { stem: timeGan, palace: findStemPalace(data, timeGan) },
    yearGan: { stem: yearGan, palace: findStemPalace(data, yearGan) },
    monthGan: { stem: monthGan, palace: findStemPalace(data, monthGan) },
  };

  // 4. 场景分析
  let scenarioResult: ScenarioResult | undefined;
  if (scenario) {
    scenarioResult = analyzeScenario(data, palaceAnalyses, scenario, seasonWX);
  }

  // 5. 综合判断
  const jiCount = patterns.filter(p => p.type === '吉格').length;
  const xiongCount = patterns.filter(p => p.type === '凶格').length;

  let overallTendency: '吉' | '凶' | '平' = '平';
  if (jiCount > xiongCount + 1) overallTendency = '吉';
  else if (xiongCount > jiCount + 1) overallTendency = '凶';

  const tips: string[] = [];
  const warnings: string[] = [];

  // 空亡提示
  if (data.voidPalaces.length > 0) {
    const voidNames = data.voidPalaces.map(p => PALACE_INFO[p as PalaceId]?.name || '').join('、');
    warnings.push(`空亡：${voidNames}（${data.voidPair.join('')}空）`);
  }
  // 马星提示
  if (data.horsePalace > 0) {
    tips.push(`驿马在${PALACE_INFO[data.horsePalace as PalaceId]?.name || ''}，主动态变化`);
  }
  // 值符值使
  tips.push(`值符${data.zhiFuStar}值使${data.zhiShiGate}：为当前时段主导力量`);
  // 吉格
  const jiPatterns = patterns.filter(p => p.type === '吉格');
  if (jiPatterns.length > 0) {
    tips.push(`吉格：${jiPatterns.map(p => p.name).join('、')}`);
  }
  // 凶格
  const xiongPatterns = patterns.filter(p => p.type === '凶格');
  if (xiongPatterns.length > 0) {
    warnings.push(`凶格：${xiongPatterns.map(p => p.name).join('、')}`);
  }

  // 总分
  let totalScore = 0;
  for (const pa of Object.values(palaceAnalyses)) {
    totalScore += pa.score;
  }
  totalScore = Math.round(totalScore * 10) / 10;

  let summary = '';
  if (overallTendency === '吉') {
    summary = '当前时盘整体格局偏吉，吉格多于凶格，宜积极进取、把握时机。';
  } else if (overallTendency === '凶') {
    summary = '当前时盘整体格局偏凶，凶格多于吉格，宜谨慎保守、避免冒进。';
  } else {
    summary = '当前时盘吉凶参半，需根据具体所求事项综合判断。';
  }

  return {
    patterns,
    palaceAnalyses,
    stemLocations,
    scenarioResult,
    overall: {
      tendency: overallTendency,
      score: totalScore,
      summary,
      tips,
      warnings,
    },
  };
}
