/**
 * 太乙神数 —— 五层分析引擎
 *
 * Layer 1: 格局检测
 * Layer 2: 主客胜负
 * Layer 3: 宫位深度分析
 * Layer 4: 场景测算
 * Layer 5: 综合断语
 */

import type {
  TaiyiResult, TaiyiAnalysis, TaiyiPattern,
  HostGuestResult, PalaceAnalysis, ScenarioResult,
  TaiyiVerdict, TaiyiPalaceId, ScenarioType, WuXing,
} from './types';
import {
  TAIYI_PALACE_INFO, AUSPICIOUS_PALACES, INAUSPICIOUS_PALACES,
  SEASON_WX, SCENARIO_CONFIGS,
} from './constants';
import { getMonthZhi } from './timeCalc';
import {
  detectPatterns, scorePalace, judgeHostGuest,
  getScenarioPalaces, judgeRelation,
} from './analysisRules';

/* ===== 主入口 ===== */

/**
 * 太乙排盘完整分析
 */
export function analyzeTaiyi(
  data: TaiyiResult,
  scenario?: ScenarioType,
): TaiyiAnalysis {
  // 获取月令五行
  const monthZhi = getMonthZhi(data.ganZhi.month);
  const seasonWX: WuXing = SEASON_WX[monthZhi] || '土';

  // ── Layer 1: 格局检测 ──
  const patterns = detectPatterns(data);

  // ── Layer 2: 主客胜负 ──
  const hostGuestRaw = judgeHostGuest(data, seasonWX);
  const hostGuestResult: HostGuestResult = {
    winner: hostGuestRaw.winner,
    reason: hostGuestRaw.reason,
    score: hostGuestRaw.score,
    beginnerText: generateBeginnerHostGuest(hostGuestRaw),
    professionalText: generateProfessionalHostGuest(hostGuestRaw, data),
  };

  // ── Layer 3: 宫位深度分析 ──
  const palaceAnalyses: Record<number, PalaceAnalysis> = {};
  for (let i = 1; i <= 9; i++) {
    const pid = i as TaiyiPalaceId;
    const { score, points, wangShuai } = scorePalace(pid, data, seasonWX);
    palaceAnalyses[pid] = {
      palaceId: pid,
      score,
      wangShuai,
      points,
      beginnerText: generateBeginnerPalace(pid, score, points),
      professionalText: generateProfessionalPalace(pid, score, wangShuai, points, data),
    };
  }

  // ── Layer 4: 场景测算 ──
  let scenarioResult: ScenarioResult | undefined;
  if (scenario) {
    scenarioResult = analyzeScenario(data, scenario, seasonWX, palaceAnalyses);
  }

  // ── Layer 5: 综合断语 ──
  const verdicts = generateVerdicts(data, patterns, hostGuestResult, palaceAnalyses, scenarioResult, seasonWX);

  // 综合评定
  const overall = computeOverall(patterns, hostGuestResult, verdicts, scenarioResult);

  // 双模式总结
  const beginnerSummary = generateBeginnerSummary(overall, patterns, hostGuestResult, scenarioResult);
  const professionalSummary = generateProfessionalSummary(data, overall, patterns, hostGuestResult, scenarioResult);

  return {
    patterns,
    hostGuestResult,
    palaceAnalyses,
    scenarioResult,
    verdicts,
    overall,
    beginnerSummary,
    professionalSummary,
  };
}

/* ===== Layer 2 双模式文案 ===== */

function generateBeginnerHostGuest(raw: {
  winner: string; score: number; reason: string;
}): string {
  if (raw.winner === '主胜') {
    return '当前形势对自己一方比较有利，可以主动出击，把握机会。';
  } else if (raw.winner === '客胜') {
    return '当前形势对外来一方比较有利，自己宜守不宜攻，避免冲动行事。';
  }
  return '当前双方势均力敌，局势胶着，建议静观其变，等待转机。';
}

function generateProfessionalHostGuest(
  raw: { winner: string; score: number; reason: string },
  data: TaiyiResult,
): string {
  return `主客胜负：${raw.winner}（评分${raw.score > 0 ? '+' : ''}${raw.score}）\n` +
    `主算${data.zhuSuan} / 客算${data.keSuan} / 定算${data.dingSuan}\n` +
    `主将${data.zhuJiang.name}(${data.zhuJiang.element})临${data.zhuJiang.palace}宫 / ` +
    `客将${data.keJiang.name}(${data.keJiang.element})临${data.keJiang.palace}宫\n` +
    `判断依据：${raw.reason}`;
}

/* ===== Layer 3 双模式文案 ===== */

function generateBeginnerPalace(palaceId: TaiyiPalaceId, score: number, points: string[]): string {
  const info = TAIYI_PALACE_INFO[palaceId];
  const tendency = score >= 1 ? '较好' : score <= -1 ? '不太好' : '一般';
  return `${info.direction}方位(${info.name})的运势${tendency}。`;
}

function generateProfessionalPalace(
  palaceId: TaiyiPalaceId, score: number, wangShuai: string,
  points: string[], data: TaiyiResult,
): string {
  const info = TAIYI_PALACE_INFO[palaceId];
  const state = data.palaces[palaceId];
  const spiritNames = state.spirits.map(s => s.name).join('、') || '无';
  return `${info.name}(${info.direction}/${info.element}): 得分${score > 0 ? '+' : ''}${score}  旺衰:${wangShuai}\n` +
    `  入宫星神: ${spiritNames}\n` +
    `  ${state.hasTaiyi ? '【太乙】' : ''}${state.hasJiShen ? '【计神】' : ''}` +
    `${state.hasWenChang ? '【文昌】' : ''}${state.hasShiJi ? '【始击】' : ''}` +
    `${state.isVoid ? '【空亡】' : ''}\n` +
    `  ${points.join('；')}`;
}

/* ===== Layer 4 场景测算 ===== */

function analyzeScenario(
  data: TaiyiResult,
  scenario: ScenarioType,
  seasonWX: WuXing,
  palaceAnalyses: Record<number, PalaceAnalysis>,
): ScenarioResult {
  const config = SCENARIO_CONFIGS.find(c => c.type === scenario)!;
  const { tiPalace, yongPalace } = getScenarioPalaces(data, scenario);
  const tiElement = TAIYI_PALACE_INFO[tiPalace].element;
  const yongElement = TAIYI_PALACE_INFO[yongPalace].element;
  const { relation, tendency, score } = judgeRelation(tiElement, yongElement);

  // 综合体宫和用宫的各自评分
  const tiScore = palaceAnalyses[tiPalace]?.score || 0;
  const yongScore = palaceAnalyses[yongPalace]?.score || 0;
  const adjustedScore = score + (tiScore - yongScore) * 0.3;

  const finalTendency = adjustedScore >= 1 ? '吉' : adjustedScore <= -1 ? '凶' : '平';

  return {
    scenario,
    scenarioLabel: config.label,
    tiPalace,
    yongPalace,
    relation,
    score: Math.round(adjustedScore * 10) / 10,
    tendency: finalTendency,
    beginnerText: generateBeginnerScenario(config.label, relation, finalTendency),
    professionalText: generateProfessionalScenario(config, tiPalace, yongPalace, tiElement, yongElement, relation, adjustedScore),
  };
}

function generateBeginnerScenario(label: string, relation: string, tendency: '吉' | '平' | '凶'): string {
  const tendencyText = tendency === '吉' ? '比较顺利，前景乐观' : tendency === '凶' ? '有一定阻碍，需要谨慎应对' : '不好不坏，中规中矩';
  return `关于${label}的问题：整体来看${tendencyText}。`;
}

function generateProfessionalScenario(
  config: { label: string; tiSource: string; yongSource: string },
  tiPalace: TaiyiPalaceId, yongPalace: TaiyiPalaceId,
  tiElement: WuXing, yongElement: WuXing,
  relation: string, score: number,
): string {
  return `场景[${config.label}]: 体宫(${config.tiSource})=${TAIYI_PALACE_INFO[tiPalace].name}(${tiElement}) / ` +
    `用宫(${config.yongSource})=${TAIYI_PALACE_INFO[yongPalace].name}(${yongElement})\n` +
    `体用关系: ${relation}  综合评分: ${score > 0 ? '+' : ''}${Math.round(score * 10) / 10}`;
}

/* ===== Layer 5 断语 ===== */

function generateVerdicts(
  data: TaiyiResult,
  patterns: TaiyiPattern[],
  hostGuest: HostGuestResult,
  palaceAnalyses: Record<number, PalaceAnalysis>,
  scenarioResult: ScenarioResult | undefined,
  seasonWX: WuXing,
): TaiyiVerdict[] {
  const verdicts: TaiyiVerdict[] = [];

  // 1. 格局断语
  for (const p of patterns) {
    const level = p.type === '吉格' ? '吉' : p.type === '凶格' ? '凶' : '平';
    verdicts.push({
      category: '格局',
      level,
      conclusion: `现${p.name}格：${p.description}`,
      advice: level === '吉' ? '宜积极把握机遇' : level === '凶' ? '宜谨慎行事，避免冲动' : '宜审时度势',
      beginnerText: level === '吉'
        ? `出现了好的局势组合（${p.name}格），适合积极行动。`
        : level === '凶'
          ? `出现了不太好的局势组合（${p.name}格），建议谨慎小心。`
          : `局势出现特殊组合（${p.name}格），需要灵活应对。`,
      professionalText: `${p.name}格成立：${p.description}。${p.classicalRef || ''}`,
      classicalCitation: p.classicalRef,
    });
  }

  // 2. 太乙临宫断语
  const taiyiInfo = TAIYI_PALACE_INFO[data.taiyiPalace];
  const taiyiInAuspicious = AUSPICIOUS_PALACES.includes(data.taiyiPalace);
  const taiyiInInauspicious = INAUSPICIOUS_PALACES.includes(data.taiyiPalace);
  verdicts.push({
    category: '太乙临宫',
    level: taiyiInAuspicious ? '吉' : taiyiInInauspicious ? '凶' : '平',
    conclusion: `太乙临${taiyiInfo.name}(${taiyiInfo.direction}/${taiyiInfo.element})`,
    advice: taiyiInAuspicious ? '天时有利' : taiyiInInauspicious ? '天时不利，宜守' : '天时中平',
    beginnerText: taiyiInAuspicious
      ? `大的运势走向偏好，${taiyiInfo.direction}方位比较吉利。`
      : taiyiInInauspicious
        ? `大的运势走向偏弱，${taiyiInfo.direction}方位需要注意。`
        : `大的运势走向平稳，无大起大落。`,
    professionalText: `太乙临${taiyiInfo.name}(${taiyiInfo.direction}，五行${taiyiInfo.element})，${taiyiInAuspicious ? '吉宫' : taiyiInInauspicious ? '凶宫' : '中性宫'}`,
  });

  // 3. 阳九百六断语（仅年计）
  if (data.yangJiuBaiLiu && data.yangJiuBaiLiu.limitType !== '正常') {
    verdicts.push({
      category: '运限',
      level: '凶',
      conclusion: `当前处于${data.yangJiuBaiLiu.cycleName}(${data.yangJiuBaiLiu.limitType})`,
      advice: '灾限年份，宜防天灾人祸，行事加倍谨慎',
      beginnerText: `这段时期属于特殊的运限周期，整体运势波动较大，各方面需要格外注意安全和稳妥。`,
      professionalText: `${data.yangJiuBaiLiu.cycleName}·${data.yangJiuBaiLiu.limitType}，第${data.yangJiuBaiLiu.positionInCycle}年。${data.yangJiuBaiLiu.description}`,
      classicalCitation: '《太乙统宗宝鉴》阳九百六篇',
    });
  }

  // 4. 场景断语
  if (scenarioResult) {
    verdicts.push({
      category: `场景·${scenarioResult.scenarioLabel}`,
      level: scenarioResult.tendency,
      conclusion: `${scenarioResult.scenarioLabel}：${scenarioResult.relation}`,
      advice: scenarioResult.tendency === '吉' ? '此事可为' : scenarioResult.tendency === '凶' ? '此事不宜' : '此事可观望',
      beginnerText: scenarioResult.beginnerText,
      professionalText: scenarioResult.professionalText,
    });
  }

  return verdicts;
}

/* ===== 综合评定 ===== */

function computeOverall(
  patterns: TaiyiPattern[],
  hostGuest: HostGuestResult,
  verdicts: TaiyiVerdict[],
  scenarioResult?: ScenarioResult,
): TaiyiAnalysis['overall'] {
  const jiCount = patterns.filter(p => p.type === '吉格').length;
  const xiongCount = patterns.filter(p => p.type === '凶格').length;

  let totalScore = hostGuest.score;
  totalScore += jiCount * 2;
  totalScore -= xiongCount * 2;
  if (scenarioResult) totalScore += scenarioResult.score;

  const tendency: '吉' | '平' | '凶' =
    totalScore >= 3 ? '吉' : totalScore <= -3 ? '凶' : '平';

  const tips: string[] = [];
  const warnings: string[] = [];

  if (jiCount > 0) tips.push(`有${jiCount}个吉格，形势偏好`);
  if (hostGuest.winner === '主胜') tips.push('主方占优，可主动进取');
  if (hostGuest.winner === '客胜') warnings.push('客方占优，宜守不宜攻');
  if (xiongCount > 0) warnings.push(`有${xiongCount}个凶格，需多加注意`);

  const summary = tendency === '吉'
    ? '综合来看形势较好，利于行动。'
    : tendency === '凶'
      ? '综合来看形势偏弱，宜谨慎观望。'
      : '综合来看形势中平，无大起大落。';

  return { tendency, score: Math.round(totalScore * 10) / 10, summary, tips, warnings };
}

/* ===== 双模式总结 ===== */

function generateBeginnerSummary(
  overall: TaiyiAnalysis['overall'],
  patterns: TaiyiPattern[],
  hostGuest: HostGuestResult,
  scenarioResult?: ScenarioResult,
): string {
  const parts: string[] = [];
  parts.push(overall.summary);
  if (hostGuest.beginnerText) parts.push(hostGuest.beginnerText);
  if (scenarioResult) parts.push(scenarioResult.beginnerText);
  if (overall.tips.length > 0) parts.push(`有利因素：${overall.tips.join('、')}。`);
  if (overall.warnings.length > 0) parts.push(`注意事项：${overall.warnings.join('、')}。`);
  return parts.join('\n');
}

function generateProfessionalSummary(
  data: TaiyiResult,
  overall: TaiyiAnalysis['overall'],
  patterns: TaiyiPattern[],
  hostGuest: HostGuestResult,
  scenarioResult?: ScenarioResult,
): string {
  const parts: string[] = [];
  parts.push(`【太乙排盘分析】 流派: ${data.config.school === 'tongzong' ? '统宗宝鉴' : '金镜式经'} / ${data.config.calcType === 'year' ? '年' : data.config.calcType === 'month' ? '月' : data.config.calcType === 'day' ? '日' : '时'}计`);
  parts.push(`积年: ${data.jiNianResult.jiNian}  ${data.jiNianResult.yuan}第${data.jiNianResult.ji}纪`);
  parts.push(`太乙: ${data.taiyiPalace}宫  计神: ${data.jiShenPalace}宫  文昌: ${data.wenChangPalace}宫  始击: ${data.shiJiPalace}宫`);
  parts.push(`主算: ${data.zhuSuan}  客算: ${data.keSuan}  定算: ${data.dingSuan}`);

  if (patterns.length > 0) {
    parts.push(`格局: ${patterns.map(p => `${p.name}(${p.type})`).join('、')}`);
  } else {
    parts.push('格局: 无特殊格局');
  }

  parts.push(hostGuest.professionalText);
  if (scenarioResult) parts.push(scenarioResult.professionalText);
  parts.push(`综合: ${overall.tendency}(${overall.score > 0 ? '+' : ''}${overall.score}) ${overall.summary}`);

  return parts.join('\n');
}
