/**
 * 六爻排盘系统 —— 分析引擎
 *
 * 6 层分析:
 * 1. 定用神 → 确定分析焦点
 * 2. 查原忌仇 → 辅助力量
 * 3. 评旺衰 → 用神强弱
 * 4. 动爻分析 → 动变影响
 * 5. 综合判断 → 吉凶趋势
 * 6. 文案输出 → 白话/专业
 */

import type {
  LiuYaoResult, LiuYaoAnalysis, YaoLine, ScenarioType,
  YongShenInfo, ShenInfo, ScenarioAnalysis, AnalysisVerdict,
  SixRelative, WuXing,
} from './types';
import { SCENARIO_YONG_SHEN, WX_SHENG, WX_KE } from './constants';
import {
  SCENARIO_RULES, deriveHelperShen, evaluateYaoStrength,
  strengthToText,
} from './analysisRules';

// ==================== 主入口 ====================

/**
 * 执行完整分析
 */
export function performAnalysis(result: LiuYaoResult): LiuYaoAnalysis {
  const scenario = result.config.scenario as ScenarioType | undefined;

  // 世爻分析
  const shiYao = result.yaoLines.find(y => y.isShiYao)!;
  const shiStrength = evaluateYaoStrength(shiYao);

  // 动爻分析
  const movingYao = result.yaoLines.filter(y => y.isMoving);
  const movingAnalysis = analyzeMovingYao(movingYao, result);

  // 场景分析
  let scenarioResult: ScenarioAnalysis | undefined;
  if (scenario) {
    scenarioResult = analyzeScenario(result, scenario);
  }

  // 综合断语
  const verdicts = buildVerdicts(result, shiYao, shiStrength, movingYao, scenarioResult);

  // 关键提示
  const keyTips = buildKeyTips(result, shiYao, movingYao);

  // 警示
  const warnings = buildWarnings(result);

  // 综合评分
  const score = calcOverallScore(shiStrength, scenarioResult, movingAnalysis, result);

  // 总趋势
  const overallTendency = score >= 65 ? '吉' : score <= 35 ? '凶' : '平';

  // 文案
  const beginnerSummary = buildBeginnerSummary(result, scenarioResult, overallTendency, score);
  const professionalSummary = buildProfessionalSummary(result, scenarioResult, overallTendency, shiStrength);

  // 应期
  const yingQi = estimateYingQi(result, scenarioResult);

  return {
    overallTendency,
    score,
    scenarioResult,
    verdicts,
    keyTips,
    warnings,
    beginnerSummary,
    professionalSummary,
    yingQi,
  };
}

// ==================== 场景分析 ====================

function analyzeScenario(result: LiuYaoResult, scenario: ScenarioType): ScenarioAnalysis {
  const rule = SCENARIO_RULES[scenario];
  const yongShenLiuQin = SCENARIO_YONG_SHEN[scenario] || rule.yongShen;

  // 查找用神爻
  const yongShenYao = findYongShenYao(result, yongShenLiuQin);
  const isFuShen = !yongShenYao;
  const fuShenInfo = isFuShen
    ? result.fuShenList.find(f => f.liuQin === yongShenLiuQin)
    : undefined;

  // 用神信息
  const yongShen: YongShenInfo = yongShenYao ? {
    liuQin: yongShenLiuQin,
    position: yongShenYao.position,
    zhi: yongShenYao.zhi,
    wuXing: yongShenYao.zhiWuXing,
    status: strengthToText(evaluateYaoStrength(yongShenYao)),
    isFuShen: false,
    isXunKong: yongShenYao.isXunKong,
    isYuePo: yongShenYao.isYuePo,
    isMoving: yongShenYao.isMoving,
  } : {
    liuQin: yongShenLiuQin,
    position: fuShenInfo?.position ?? 0,
    zhi: fuShenInfo?.zhi ?? '',
    wuXing: fuShenInfo?.zhiWuXing ?? '土',
    status: '伏藏不现',
    isFuShen: true,
    isXunKong: false,
    isYuePo: false,
    isMoving: false,
  };

  // 推导辅助神
  const helpers = deriveHelperShen(yongShenLiuQin);
  const yuanShenYao = findYongShenYao(result, helpers.yuanShen);
  const jiShenYao = findYongShenYao(result, helpers.jiShen);
  const chouShenYao = findYongShenYao(result, helpers.chouShen);

  const yuanShen = yuanShenYao ? buildShenInfo('原神', helpers.yuanShen, yuanShenYao) : undefined;
  const jiShen = jiShenYao ? buildShenInfo('忌神', helpers.jiShen, jiShenYao) : undefined;
  const chouShen = chouShenYao ? buildShenInfo('仇神', helpers.chouShen, chouShenYao) : undefined;

  // 用神强弱评分
  const yongScore = yongShenYao ? evaluateYaoStrength(yongShenYao) : -2;
  const yuanScore = yuanShenYao ? evaluateYaoStrength(yuanShenYao) : 0;
  const jiScore = jiShenYao ? evaluateYaoStrength(jiShenYao) : 0;

  // 判断趋势
  let tendency: '吉' | '凶' | '平' = '平';
  const keyFindings: string[] = [];

  if (yongScore >= 1) {
    keyFindings.push(`用神${yongShenLiuQin}旺相有力`);
    tendency = '吉';
  } else if (yongScore <= -1) {
    keyFindings.push(`用神${yongShenLiuQin}衰弱无力`);
    tendency = '凶';
  }

  if (isFuShen) {
    keyFindings.push(`用神${yongShenLiuQin}伏藏不现`);
    if (tendency === '吉') tendency = '平';
  }

  if (yongShenYao?.isXunKong) {
    keyFindings.push(`用神旬空`);
    if (tendency === '吉') tendency = '平';
  }
  if (yongShenYao?.isYuePo) {
    keyFindings.push(`用神月破`);
    tendency = '凶';
  }

  // 原神发动生用 → 更吉
  if (yuanShenYao?.isMoving && yuanScore >= 0) {
    keyFindings.push(`原神${helpers.yuanShen}发动生用神`);
    if (tendency === '平') tendency = '吉';
  }

  // 忌神发动克用 → 更凶
  if (jiShenYao?.isMoving && jiScore >= 0) {
    keyFindings.push(`忌神${helpers.jiShen}发动克用神`);
    if (tendency === '平') tendency = '凶';
  }

  // 结论和建议
  const conclusion = tendency === '吉' ? rule.proJi
    : tendency === '凶' ? rule.proXiong : rule.proPing;

  const advice: string[] = [];
  if (tendency === '吉') {
    advice.push('整体趋势良好，可以积极行动。');
  } else if (tendency === '凶') {
    advice.push('当前形势不太有利，建议暂缓行动或调整策略。');
  } else {
    advice.push('形势尚不明朗，宜观望等待时机。');
  }

  return {
    scenarioName: rule.name,
    yongShen,
    yuanShen,
    jiShen,
    chouShen,
    keyFindings,
    conclusion,
    advice,
    tendency,
  };
}

// ==================== 辅助函数 ====================

function findYongShenYao(result: LiuYaoResult, liuQin: SixRelative): YaoLine | undefined {
  // 优先找世爻持用神
  const shiYao = result.yaoLines.find(y => y.isShiYao && y.liuQin === liuQin);
  if (shiYao) return shiYao;

  // 优先找动爻中的用神
  const movingYong = result.yaoLines.find(y => y.isMoving && y.liuQin === liuQin);
  if (movingYong) return movingYong;

  // 取所有同六亲中最旺的
  const candidates = result.yaoLines.filter(y => y.liuQin === liuQin);
  if (candidates.length === 0) return undefined;
  return candidates.sort((a, b) => evaluateYaoStrength(b) - evaluateYaoStrength(a))[0];
}

function buildShenInfo(
  role: '原神' | '忌神' | '仇神',
  liuQin: SixRelative,
  yao: YaoLine,
): ShenInfo {
  return {
    role,
    liuQin,
    position: yao.position,
    zhi: yao.zhi,
    wuXing: yao.zhiWuXing,
    status: strengthToText(evaluateYaoStrength(yao)),
  };
}

function analyzeMovingYao(movingYao: YaoLine[], result: LiuYaoResult): number {
  if (movingYao.length === 0) return 0;
  // 简单评分: 动爻对世爻的影响
  const shiYao = result.yaoLines.find(y => y.isShiYao);
  if (!shiYao) return 0;

  let effect = 0;
  for (const yao of movingYao) {
    if (yao.zhiWuXing === shiYao.zhiWuXing) effect += 0.5; // 比和
    else if (WX_SHENG[yao.zhiWuXing] === shiYao.zhiWuXing) effect += 1; // 生世
    else if (WX_KE[yao.zhiWuXing] === shiYao.zhiWuXing) effect -= 1; // 克世
  }
  return effect;
}

// ==================== 断语构建 ====================

function buildVerdicts(
  result: LiuYaoResult,
  shiYao: YaoLine,
  shiStrength: number,
  movingYao: YaoLine[],
  scenarioResult?: ScenarioAnalysis,
): AnalysisVerdict[] {
  const verdicts: AnalysisVerdict[] = [];

  // 世爻断语
  const shiLevel = shiStrength >= 1 ? '吉' : shiStrength <= -1 ? '凶' : '平';
  verdicts.push({
    category: '世爻',
    level: shiLevel as '吉' | '平' | '凶',
    conclusion: `世爻${shiYao.ganZhi}(${shiYao.liuQin})，${strengthToText(shiStrength)}`,
    advice: shiLevel === '吉' ? '自身状态不错' : shiLevel === '凶' ? '自身状态不佳，需注意' : '自身状态一般',
    beginnerText: shiLevel === '吉' ? '你目前状态不错，精力充沛。' : shiLevel === '凶' ? '你目前状态不太好，需多加注意。' : '你目前状态一般。',
    professionalText: `世爻${shiYao.ganZhi}临${shiYao.liuQin}，月${shiYao.strength.monthRelation}，${shiYao.strength.dayEffect}，${strengthToText(shiStrength)}。`,
  });

  // 动爻断语
  if (movingYao.length > 0) {
    const movDesc = movingYao.map(y => `${y.positionName}(${y.liuQin})`).join('、');
    verdicts.push({
      category: '动爻',
      level: '平',
      conclusion: `${movingYao.length}个动爻: ${movDesc}`,
      advice: '动爻代表变化力量，需重点关注。',
      beginnerText: `卦中有${movingYao.length}个变化的爻，说明事情正在发展变化中。`,
      professionalText: `动爻: ${movDesc}。动爻主变化，需详察其生克方向及变爻情况。`,
    });
  } else {
    verdicts.push({
      category: '动爻',
      level: '平',
      conclusion: '无动爻(静卦)',
      advice: '静卦主不变，事情维持现状。',
      beginnerText: '目前情况较为稳定，短期内不会有大的变化。',
      professionalText: '六爻皆静，事主安稳，短期无大变化。以日月为主要判断依据。',
    });
  }

  // 场景断语
  if (scenarioResult) {
    verdicts.push({
      category: scenarioResult.scenarioName,
      level: scenarioResult.tendency,
      conclusion: scenarioResult.conclusion,
      advice: scenarioResult.advice.join(' '),
      beginnerText: scenarioResult.tendency === '吉'
        ? SCENARIO_RULES[result.config.scenario as ScenarioType]?.beginnerJi || '趋势良好。'
        : scenarioResult.tendency === '凶'
          ? SCENARIO_RULES[result.config.scenario as ScenarioType]?.beginnerXiong || '需谨慎。'
          : SCENARIO_RULES[result.config.scenario as ScenarioType]?.beginnerPing || '形势尚可。',
      professionalText: scenarioResult.conclusion,
    });
  }

  return verdicts;
}

function buildKeyTips(
  result: LiuYaoResult,
  shiYao: YaoLine,
  movingYao: YaoLine[],
): string[] {
  const tips: string[] = [];

  if (shiYao.isXunKong) {
    tips.push('世爻旬空: 自身心意不实，或暂时没有行动力。');
  }
  if (shiYao.isYuePo) {
    tips.push('世爻月破: 自身力量严重受损，此事短期难成。');
  }

  // 动爻化进退
  for (const yao of movingYao) {
    if (yao.changedLiuQin) {
      tips.push(`${yao.positionName}(${yao.liuQin})动化${yao.changedLiuQin}。`);
    }
  }

  // 六爻安静
  if (movingYao.length === 0) {
    tips.push('静卦以世爻和日月为主进行分析。');
  }

  // 六冲卦 / 六合卦判断
  if (result.benGuaName.includes('乾') || result.benGuaName.includes('坤') ||
      result.benGuaName.includes('坎') || result.benGuaName.includes('离') ||
      result.benGuaName.includes('震') || result.benGuaName.includes('巽') ||
      result.benGuaName.includes('艮') || result.benGuaName.includes('兑')) {
    // 简化处理 - 八纯卦为六冲卦
    if (result.guaSequence === '八纯') {
      tips.push('八纯卦(六冲卦): 事情多有反复变化，难以持久。');
    }
  }

  return tips;
}

function buildWarnings(result: LiuYaoResult): string[] {
  const warnings: string[] = [];

  const xunKongYao = result.yaoLines.filter(y => y.isXunKong);
  if (xunKongYao.length >= 2) {
    warnings.push(`多爻旬空(${xunKongYao.map(y => y.positionName).join('、')})，卦象不实。`);
  }

  const yuePoYao = result.yaoLines.filter(y => y.isYuePo);
  if (yuePoYao.length > 0) {
    warnings.push(`月破爻: ${yuePoYao.map(y => `${y.positionName}(${y.zhi})`).join('、')}。`);
  }

  return warnings;
}

// ==================== 评分 ====================

function calcOverallScore(
  shiStrength: number,
  scenarioResult: ScenarioAnalysis | undefined,
  movingEffect: number,
  result: LiuYaoResult,
): number {
  let score = 50; // 基线

  // 世爻强弱 (±15)
  score += shiStrength * 5;

  // 场景结果 (±20)
  if (scenarioResult) {
    if (scenarioResult.tendency === '吉') score += 20;
    else if (scenarioResult.tendency === '凶') score -= 20;
  }

  // 动爻影响 (±10)
  score += movingEffect * 5;

  // 旬空月破惩罚
  const shiYao = result.yaoLines.find(y => y.isShiYao);
  if (shiYao?.isXunKong) score -= 5;
  if (shiYao?.isYuePo) score -= 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ==================== 文案 ====================

function buildBeginnerSummary(
  result: LiuYaoResult,
  scenarioResult: ScenarioAnalysis | undefined,
  tendency: '吉' | '凶' | '平',
  score: number,
): string {
  const parts: string[] = [];

  parts.push(`你所问的「${result.config.question || '此事'}」`);

  if (scenarioResult) {
    const rule = SCENARIO_RULES[result.config.scenario as ScenarioType];
    if (rule) {
      parts.push(tendency === '吉' ? rule.beginnerJi : tendency === '凶' ? rule.beginnerXiong : rule.beginnerPing);
    }
  } else {
    if (tendency === '吉') parts.push('整体趋势良好，可以放心前行。');
    else if (tendency === '凶') parts.push('目前时机不太合适，建议暂缓或调整方向。');
    else parts.push('情况不明朗，建议谨慎行事，多观察再做决定。');
  }

  return parts.join('，');
}

function buildProfessionalSummary(
  result: LiuYaoResult,
  scenarioResult: ScenarioAnalysis | undefined,
  tendency: '吉' | '凶' | '平',
  shiStrength: number,
): string {
  const parts: string[] = [];
  const shiYao = result.yaoLines.find(y => y.isShiYao)!;

  parts.push(`${result.benGuaName}，${result.palace}宫${result.palaceWuXing}，${result.guaSequence}卦。`);
  parts.push(`世爻${shiYao.ganZhi}临${shiYao.liuQin}，月${shiYao.strength.monthRelation}，${shiYao.strength.dayEffect}。`);

  if (result.hasChanged) {
    parts.push(`变${result.bianGuaName}。`);
  }

  const movingYao = result.yaoLines.filter(y => y.isMoving);
  if (movingYao.length > 0) {
    parts.push(`动爻: ${movingYao.map(y => `${y.positionName}${y.ganZhi}(${y.liuQin})`).join('、')}。`);
  }

  if (scenarioResult) {
    parts.push(scenarioResult.conclusion);
    if (scenarioResult.keyFindings.length > 0) {
      parts.push(scenarioResult.keyFindings.join('，') + '。');
    }
  }

  return parts.join('');
}

// ==================== 应期推测 ====================

function estimateYingQi(
  result: LiuYaoResult,
  scenarioResult?: ScenarioAnalysis,
): string | undefined {
  if (!scenarioResult) return undefined;

  const yongShenInfo = scenarioResult.yongShen;

  if (yongShenInfo.isXunKong) {
    return `用神旬空，出空之日(逢冲之日)应事。`;
  }

  if (yongShenInfo.isYuePo) {
    return `用神月破，过月或合月之时应事。`;
  }

  if (yongShenInfo.isFuShen) {
    return `用神伏藏，需待透出之时(冲飞神或合用神之日)应事。`;
  }

  if (scenarioResult.tendency === '吉') {
    return `用神${yongShenInfo.zhi}旺相，近期可应。逢生合之日为应期。`;
  } else if (scenarioResult.tendency === '凶') {
    return `用神衰弱，事恐难遂。若逢旺相之月可有转机。`;
  }

  return `需综合日月动爻变化判断应期。`;
}
