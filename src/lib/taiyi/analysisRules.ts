/**
 * 太乙神数 —— 分析规则引擎
 * 格局检测、五行生克、旺衰判定的底层规则函数
 */

import type {
  TaiyiResult, TaiyiPattern, TaiyiPalaceId, WuXing,
} from './types';
import {
  TAIYI_PATTERN_DEFS, TAIYI_PALACE_INFO,
  AUSPICIOUS_PALACES, INAUSPICIOUS_PALACES,
  OPPOSITE_PALACE, WX_SHENG, WX_KE,
  SEASON_WX, getWangShuai, isDingSuanAuspicious,
  GAN_WX,
} from './constants';
import { getMonthZhi } from './timeCalc';

/* ===== 格局检测 ===== */

/**
 * 检测所有格局
 */
export function detectPatterns(data: TaiyiResult): TaiyiPattern[] {
  const patterns: TaiyiPattern[] = [];

  // 1. 掩格：客算>主算 且 客将五行克主将五行
  if (data.keSuan > data.zhuSuan && doesKe(data.keJiang.element, data.zhuJiang.element)) {
    patterns.push({
      name: '掩',
      type: '凶格',
      description: `客算(${data.keSuan})大于主算(${data.zhuSuan})，客将${data.keJiang.name}(${data.keJiang.element})克主将${data.zhuJiang.name}(${data.zhuJiang.element})，客掩主`,
      involvedPalaces: [data.keJiang.palace, data.zhuJiang.palace],
      classicalRef: '《太乙金镜式经》：客掩主，兵来犯我，大凶。',
    });
  }

  // 2. 迫格：主算>客算 且 主将克客将 且 太乙临凶宫
  if (data.zhuSuan > data.keSuan
    && doesKe(data.zhuJiang.element, data.keJiang.element)
    && INAUSPICIOUS_PALACES.includes(data.taiyiPalace)) {
    patterns.push({
      name: '迫',
      type: '凶格',
      description: `主算(${data.zhuSuan})大于客算(${data.keSuan})，主将克客将，但太乙临凶宫${data.taiyiPalace}宫，势逼之格`,
      involvedPalaces: [data.taiyiPalace, data.zhuJiang.palace],
      classicalRef: '《太乙统宗宝鉴》：迫者，势逼而不得已也。',
    });
  }

  // 3. 击格：始击宫与太乙宫对冲
  if (OPPOSITE_PALACE[data.shiJiPalace] === data.taiyiPalace) {
    patterns.push({
      name: '击',
      type: '凶格',
      description: `始击在${data.shiJiPalace}宫与太乙在${data.taiyiPalace}宫对冲，攻伐之象`,
      involvedPalaces: [data.shiJiPalace, data.taiyiPalace],
      classicalRef: '《太乙金镜式经》：击者，攻伐之象也。',
    });
  }

  // 4. 关格：关神与太乙同宫
  const guanSpirit = data.spirits.find(s => s.name === '关');
  if (guanSpirit && guanSpirit.palace === data.taiyiPalace) {
    patterns.push({
      name: '关',
      type: '凶格',
      description: `关神与太乙同在${data.taiyiPalace}宫，阻隔不通`,
      involvedPalaces: [data.taiyiPalace],
      classicalRef: '《太乙统宗宝鉴》：关者，闭塞之义，事多阻滞。',
    });
  }

  // 5. 囚格：囚神与太乙同宫
  const qiuSpirit = data.spirits.find(s => s.name === '囚');
  if (qiuSpirit && qiuSpirit.palace === data.taiyiPalace) {
    patterns.push({
      name: '囚',
      type: '凶格',
      description: `囚神与太乙同在${data.taiyiPalace}宫，困顿受制`,
      involvedPalaces: [data.taiyiPalace],
      classicalRef: '《太乙金镜式经》：囚者，幽闭之象，百事不宜。',
    });
  }

  // 6. 对格：主算等于客算
  if (data.zhuSuan === data.keSuan) {
    patterns.push({
      name: '对',
      type: '中性',
      description: `主算(${data.zhuSuan})等于客算(${data.keSuan})，势均力敌`,
      involvedPalaces: [data.zhuJiang.palace, data.keJiang.palace],
      classicalRef: '《太乙统宗宝鉴》：对者，两相当也。',
    });
  }

  // 7. 和格：主客大将五行相生
  if (doesSheng(data.zhuJiang.element, data.keJiang.element)
    || doesSheng(data.keJiang.element, data.zhuJiang.element)) {
    patterns.push({
      name: '和',
      type: '吉格',
      description: `主将${data.zhuJiang.name}(${data.zhuJiang.element})与客将${data.keJiang.name}(${data.keJiang.element})五行相生，和睦之象`,
      involvedPalaces: [data.zhuJiang.palace, data.keJiang.palace],
      classicalRef: '《太乙金镜式经》：和者，阴阳调和，万事顺遂。',
    });
  }

  // 8. 格格：主客大将五行相克且定算为凶数
  if (doesKe(data.zhuJiang.element, data.keJiang.element)
    && isDingSuanAuspicious(data.dingSuan) === '凶') {
    patterns.push({
      name: '格',
      type: '凶格',
      description: `主将克客将，定算${data.dingSuan}为凶数，格斗之象`,
      involvedPalaces: [data.zhuJiang.palace, data.keJiang.palace],
      classicalRef: '《太乙统宗宝鉴》：格者，格斗之象。',
    });
  }

  // 9. 飞格：太乙/计神/文昌皆在吉宫
  if (AUSPICIOUS_PALACES.includes(data.taiyiPalace)
    && AUSPICIOUS_PALACES.includes(data.jiShenPalace)
    && AUSPICIOUS_PALACES.includes(data.wenChangPalace)) {
    patterns.push({
      name: '飞',
      type: '吉格',
      description: `太乙(${data.taiyiPalace}宫)、计神(${data.jiShenPalace}宫)、文昌(${data.wenChangPalace}宫)皆在吉宫，升腾之象`,
      involvedPalaces: [data.taiyiPalace, data.jiShenPalace, data.wenChangPalace],
      classicalRef: '《太乙金镜式经》：飞者，变动升腾之象。',
    });
  }

  // 10. 重审格：太乙与计神同宫
  if (data.taiyiPalace === data.jiShenPalace) {
    patterns.push({
      name: '重审',
      type: '凶格',
      description: `太乙与计神同在${data.taiyiPalace}宫，事多反复，当重新审视`,
      involvedPalaces: [data.taiyiPalace],
      classicalRef: '《太乙统宗宝鉴》：重审者，当重新审视，不可轻动。',
    });
  }

  return patterns;
}

/* ===== 五行生克工具 ===== */

/** A生B？ */
function doesSheng(a: WuXing, b: WuXing): boolean {
  return WX_SHENG[a] === b;
}

/** A克B？ */
function doesKe(a: WuXing, b: WuXing): boolean {
  return WX_KE[a] === b;
}

/* ===== 宫位评分 ===== */

/**
 * 评估单个宫位的吉凶得分
 * @returns -5 ~ +5
 */
export function scorePalace(
  palaceId: TaiyiPalaceId,
  data: TaiyiResult,
  seasonWX: WuXing,
): { score: number; points: string[]; wangShuai: string } {
  const info = TAIYI_PALACE_INFO[palaceId];
  const palaceState = data.palaces[palaceId];
  let score = 0;
  const points: string[] = [];

  // 1. 宫位本身吉凶
  if (AUSPICIOUS_PALACES.includes(palaceId)) {
    score += 1;
    points.push(`${info.name}为吉宫(+1)`);
  } else if (INAUSPICIOUS_PALACES.includes(palaceId)) {
    score -= 1;
    points.push(`${info.name}为凶宫(-1)`);
  }

  // 2. 旺衰
  const ws = getWangShuai(info.element, seasonWX);
  if (ws === '旺' || ws === '相') {
    score += 1;
    points.push(`宫位五行${info.element}当令${ws}(+1)`);
  } else if (ws === '囚' || ws === '死') {
    score -= 1;
    points.push(`宫位五行${info.element}当令${ws}(-1)`);
  }
  const wangShuai = ws;

  // 3. 吉神加分
  const auspiciousSpirits = palaceState.spirits.filter(s => s.auspice === '吉');
  const inauspiciousSpirits = palaceState.spirits.filter(s => s.auspice === '凶');
  if (auspiciousSpirits.length > 0) {
    score += auspiciousSpirits.length * 0.5;
    points.push(`吉神${auspiciousSpirits.map(s => s.name).join('、')}入宫(+${auspiciousSpirits.length * 0.5})`);
  }
  if (inauspiciousSpirits.length > 0) {
    score -= inauspiciousSpirits.length * 0.5;
    points.push(`凶神${inauspiciousSpirits.map(s => s.name).join('、')}入宫(-${inauspiciousSpirits.length * 0.5})`);
  }

  // 4. 太乙临此宫
  if (palaceState.hasTaiyi) {
    if (AUSPICIOUS_PALACES.includes(palaceId)) {
      score += 1;
      points.push('太乙临吉宫(+1)');
    } else if (INAUSPICIOUS_PALACES.includes(palaceId)) {
      score -= 1;
      points.push('太乙临凶宫(-1)');
    }
  }

  // 5. 空亡
  if (palaceState.isVoid) {
    score -= 0.5;
    points.push('宫位空亡(-0.5)');
  }

  // 钳制分数范围
  score = Math.max(-5, Math.min(5, Math.round(score * 10) / 10));

  return { score, points, wangShuai };
}

/* ===== 主客胜负判断 ===== */

/**
 * 判断主客胜负
 */
export function judgeHostGuest(data: TaiyiResult, seasonWX: WuXing): {
  winner: '主胜' | '客胜' | '和局';
  score: number;
  reason: string;
} {
  let score = 0;
  const reasons: string[] = [];

  // 1. 主算vs客算
  if (data.zhuSuan > data.keSuan) {
    score += 2;
    reasons.push(`主算${data.zhuSuan}>客算${data.keSuan}，主方数值占优`);
  } else if (data.keSuan > data.zhuSuan) {
    score -= 2;
    reasons.push(`客算${data.keSuan}>主算${data.zhuSuan}，客方数值占优`);
  } else {
    reasons.push(`主算=客算=${data.zhuSuan}，势均力敌`);
  }

  // 2. 主将vs客将五行
  if (doesKe(data.zhuJiang.element, data.keJiang.element)) {
    score += 2;
    reasons.push(`主将${data.zhuJiang.name}(${data.zhuJiang.element})克客将${data.keJiang.name}(${data.keJiang.element})`);
  } else if (doesKe(data.keJiang.element, data.zhuJiang.element)) {
    score -= 2;
    reasons.push(`客将${data.keJiang.name}(${data.keJiang.element})克主将${data.zhuJiang.name}(${data.zhuJiang.element})`);
  } else if (doesSheng(data.zhuJiang.element, data.keJiang.element)) {
    score += 1;
    reasons.push(`主将生客将，主方稍优`);
  } else if (doesSheng(data.keJiang.element, data.zhuJiang.element)) {
    score -= 1;
    reasons.push(`客将生主将，客方稍优`);
  }

  // 3. 主将旺衰
  const zhuWS = getWangShuai(data.zhuJiang.element, seasonWX);
  const keWS = getWangShuai(data.keJiang.element, seasonWX);
  if (zhuWS === '旺' || zhuWS === '相') score += 1;
  if (zhuWS === '囚' || zhuWS === '死') score -= 1;
  if (keWS === '旺' || keWS === '相') score -= 1;
  if (keWS === '囚' || keWS === '死') score += 1;
  reasons.push(`主将${zhuWS}，客将${keWS}`);

  // 4. 定算奇偶
  const dingAuspice = isDingSuanAuspicious(data.dingSuan);
  if (dingAuspice === '吉') {
    score += 1;
    reasons.push(`定算${data.dingSuan}为奇数(阳)，偏吉`);
  } else if (dingAuspice === '凶') {
    score -= 1;
    reasons.push(`定算${data.dingSuan}为零，大凶`);
  }

  score = Math.max(-10, Math.min(10, score));

  let winner: '主胜' | '客胜' | '和局';
  if (score >= 2) winner = '主胜';
  else if (score <= -2) winner = '客胜';
  else winner = '和局';

  return { winner, score, reason: reasons.join('；') };
}

/* ===== 场景体用关系 ===== */

/**
 * 根据场景获取体宫和用宫
 */
export function getScenarioPalaces(
  data: TaiyiResult,
  scenario: string,
): { tiPalace: TaiyiPalaceId; yongPalace: TaiyiPalaceId } {
  switch (scenario) {
    case 'guoyun':
      return { tiPalace: data.taiyiPalace, yongPalace: data.zhuJiang.palace };
    case 'zhanzheng':
      return { tiPalace: data.zhuJiang.palace, yongPalace: data.keJiang.palace };
    case 'tianshi':
      return { tiPalace: data.taiyiPalace, yongPalace: data.wenChangPalace };
    case 'renshi':
      return { tiPalace: data.jiShenPalace, yongPalace: data.shiJiPalace };
    case 'jibing':
      return { tiPalace: data.zhuJiang.palace, yongPalace: data.keJiang.palace };
    case 'zayi':
      return { tiPalace: data.taiyiPalace, yongPalace: data.shiJiPalace };
    default:
      return { tiPalace: data.taiyiPalace, yongPalace: data.zhuJiang.palace };
  }
}

/**
 * 判断体用关系
 */
export function judgeRelation(tiElement: WuXing, yongElement: WuXing): {
  relation: string;
  tendency: '吉' | '平' | '凶';
  score: number;
} {
  if (tiElement === yongElement) {
    return { relation: '体用比和', tendency: '平', score: 0 };
  }
  if (doesSheng(tiElement, yongElement)) {
    return { relation: '体生用（泄气）', tendency: '凶', score: -2 };
  }
  if (doesSheng(yongElement, tiElement)) {
    return { relation: '用生体（得助）', tendency: '吉', score: 2 };
  }
  if (doesKe(tiElement, yongElement)) {
    return { relation: '体克用（耗力）', tendency: '平', score: 1 };
  }
  if (doesKe(yongElement, tiElement)) {
    return { relation: '用克体（受制）', tendency: '凶', score: -3 };
  }
  return { relation: '未知关系', tendency: '平', score: 0 };
}
