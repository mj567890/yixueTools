/**
 * 阴盘奇门遁甲 —— 格局分析引擎
 *
 * 基于排盘结果，进行规则化格局识别与综合判断
 * 严格遵循阴盘体系，不使用阳盘技法（如三奇得使等）
 */

import type { PaipanData, PaipanPalace } from '@/components/qimen/YinpanPaipanBoard';

// ==================== 五行常量 ====================

const WU_XING = ['木', '火', '土', '金', '水'] as const;
type WuXing = (typeof WU_XING)[number];

/** 宫位五行 */
const PALACE_WX: Record<number, WuXing> = {
  1: '水', 2: '土', 3: '木', 4: '木', 5: '土', 6: '金', 7: '金', 8: '土', 9: '火',
};

/** 宫位名称 */
const PALACE_NAMES: Record<number, string> = {
  1: '坎一宫', 2: '坤二宫', 3: '震三宫', 4: '巽四宫',
  5: '中五宫', 6: '乾六宫', 7: '兑七宫', 8: '艮八宫', 9: '离九宫',
};

/** 九星五行 */
const STAR_WX: Record<string, WuXing> = {
  '天蓬': '水', '天芮': '土', '天冲': '木', '天辅': '木',
  '天禽': '土', '天心': '金', '天柱': '金', '天任': '土', '天英': '火',
};

/** 九星本宫 */
const STAR_HOME: Record<string, number> = {
  '天蓬': 1, '天芮': 2, '天冲': 3, '天辅': 4,
  '天禽': 5, '天心': 6, '天柱': 7, '天任': 8, '天英': 9,
};

/** 八门五行 */
const GATE_WX: Record<string, WuXing> = {
  '休门': '水', '死门': '土', '伤门': '木', '杜门': '木',
  '开门': '金', '惊门': '金', '生门': '土', '景门': '火',
};

/** 八门本宫 */
const GATE_HOME: Record<string, number> = {
  '休门': 1, '死门': 2, '伤门': 3, '杜门': 4,
  '开门': 6, '惊门': 7, '生门': 8, '景门': 9,
};

/** 天干五行 */
const GAN_WX: Record<string, WuXing> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};

/** 五行墓库所在宫位 */
const WX_TOMB: Record<WuXing, number> = {
  '木': 2,   // 未→坤2
  '火': 6,   // 戌→乾6
  '土': 6,   // 戌→乾6
  '金': 8,   // 丑→艮8
  '水': 4,   // 辰→巽4
};

/** 后天八卦环（对冲宫位配对） */
const OPPOSITE_PALACE: Record<number, number> = {
  1: 9, 9: 1, 2: 8, 8: 2, 3: 7, 7: 3, 4: 6, 6: 4,
};

/** 六仪击刑：六仪→被刑宫位 */
const JIXING_MAP: Record<string, number> = {
  '戊': 3,  // 甲子戊→子刑卯→震3
  '己': 2,  // 甲戌己→戌刑未→坤2
  '庚': 8,  // 甲申庚→申刑寅→艮8
  '辛': 9,  // 甲午辛→午午自刑→离9
  '壬': 4,  // 甲辰壬→辰辰自刑→巽4
  '癸': 4,  // 甲寅癸→寅刑巳→巽4
};

// ==================== 五行生克 ====================

function wxSheng(a: WuXing, b: WuXing): boolean {
  const map: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  return map[a] === b;
}

function wxKe(a: WuXing, b: WuXing): boolean {
  const map: Record<string, string> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
  return map[a] === b;
}

function wxRelation(a: WuXing, b: WuXing): string {
  if (a === b) return '比和';
  if (wxSheng(a, b)) return '生';
  if (wxSheng(b, a)) return '被生';
  if (wxKe(a, b)) return '克';
  if (wxKe(b, a)) return '被克';
  return '';
}

// ==================== 旬首工具 ====================

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

interface XunInfo {
  xunShou: string;
  yinStem: string;
  voidPair: [string, string];
}

function getXunInfo(gz: string): XunInfo | null {
  const xuns = [
    { head: '甲子', yin: '戊', vp: ['戌', '亥'] as [string, string] },
    { head: '甲戌', yin: '己', vp: ['申', '酉'] as [string, string] },
    { head: '甲申', yin: '庚', vp: ['午', '未'] as [string, string] },
    { head: '甲午', yin: '辛', vp: ['辰', '巳'] as [string, string] },
    { head: '甲辰', yin: '壬', vp: ['寅', '卯'] as [string, string] },
    { head: '甲寅', yin: '癸', vp: ['子', '丑'] as [string, string] },
  ];
  for (const x of xuns) {
    const g0 = TIAN_GAN.indexOf(x.head[0]);
    const z0 = DI_ZHI.indexOf(x.head[1]);
    for (let i = 0; i < 10; i++) {
      const key = TIAN_GAN[(g0 + i) % 10] + DI_ZHI[(z0 + i) % 12];
      if (key === gz) return { xunShou: x.head, yinStem: x.yin, voidPair: x.vp };
    }
  }
  return null;
}

/** 获取天干的有效三奇六仪（甲→旬首六仪，其他原样） */
function effectiveStem(gan: string, gz: string): string {
  if (gan === '甲') {
    const info = getXunInfo(gz);
    return info ? info.yinStem : gan;
  }
  return gan;
}

// ==================== 季节与旺相休囚 ====================

type Strength = '旺' | '相' | '休' | '囚' | '死';

/** 根据月支判断当令五行 */
function getSeasonWX(monthGZ: string): WuXing {
  const monthZhi = monthGZ[1];
  const zhiMap: Record<string, WuXing> = {
    '寅': '木', '卯': '木',
    '巳': '火', '午': '火',
    '申': '金', '酉': '金',
    '亥': '水', '子': '水',
    '辰': '土', '未': '土', '戌': '土', '丑': '土',
  };
  return zhiMap[monthZhi] || '土';
}

/** 计算五行在当令下的旺相休囚死 */
function getStrength(wx: WuXing, seasonWX: WuXing): Strength {
  if (wx === seasonWX) return '旺';
  if (wxSheng(seasonWX, wx)) return '相';
  if (wxSheng(wx, seasonWX)) return '休';
  if (wxKe(wx, seasonWX)) return '囚';
  return '死';
}

// ==================== 九星解读 ====================

const STAR_DESC: Record<string, { nature: string; meaning: string }> = {
  '天蓬': { nature: '凶星', meaning: '智慧与谋略，但主暗昧、盗窃、阴谋；旺则足智多谋，衰则阴险狡诈' },
  '天芮': { nature: '凶星', meaning: '主疾病、灾祸、小人；旺则忠厚老实，衰则体弱多病' },
  '天冲': { nature: '吉星', meaning: '主勇猛果敢、行动力强；旺则奋发进取，衰则冲动莽撞' },
  '天辅': { nature: '吉星', meaning: '主文昌、学业、贵人；旺则文采飞扬，衰则优柔寡断' },
  '天禽': { nature: '中平', meaning: '主中正、稳定，百事皆宜；寄坤二宫，具土之厚重' },
  '天心': { nature: '吉星', meaning: '主医药、领导、决断力；旺则运筹帷幄，衰则刚愎自用' },
  '天柱': { nature: '凶星', meaning: '主口舌是非、破坏；旺则善辩利口，衰则搬弄是非' },
  '天任': { nature: '吉星', meaning: '主仁慈、稳重、田宅；旺则厚德载物，衰则固执保守' },
  '天英': { nature: '凶星', meaning: '主光明亦主血光、是非；旺则光明磊落，衰则虚浮躁动' },
};

// ==================== 八门解读 ====================

const GATE_DESC: Record<string, { auspice: '吉' | '凶' | '中'; meaning: string }> = {
  '开门': { auspice: '吉', meaning: '主开创、通达、事业，利求职、开业、出行' },
  '休门': { auspice: '吉', meaning: '主休养、贵人、安逸，利求见、上书、谒贵' },
  '生门': { auspice: '吉', meaning: '主生发、财利、产业，利求财、经营、置产' },
  '伤门': { auspice: '凶', meaning: '主伤害、争斗、损伤，主口舌官非、行车出行需谨慎' },
  '杜门': { auspice: '凶', meaning: '主阻塞、隐藏、堵塞，主事不通达、宜守不宜攻' },
  '景门': { auspice: '中', meaning: '主光明、文书、讯息，利考试文书、但防虚名虚利' },
  '死门': { auspice: '凶', meaning: '主死气、沉闷、不通，诸事不宜、宜吊丧凭吊' },
  '惊门': { auspice: '凶', meaning: '主惊恐、口舌、官非，主惊吓不安、防意外惊扰' },
};

// ==================== 八神解读 ====================

const SPIRIT_DESC: Record<string, { nature: string; meaning: string }> = {
  '值符': { nature: '吉神', meaning: '贵人庇护、权威加持，所临之宫事物得贵人扶助' },
  '腾蛇': { nature: '凶神', meaning: '虚惊怪异、口舌缠绕，所临之宫多虚假、惊恐、牵扯不清' },
  '太阴': { nature: '吉神', meaning: '暗助阴扶、贵人暗中相助，利密谋筹划、暗中行事' },
  '六合': { nature: '吉神', meaning: '合作和谐、婚姻交易，所临之宫利合作、谈判、婚恋' },
  '白虎': { nature: '凶神', meaning: '凶险刚烈、血光破坏，所临之宫防意外伤害、强权压制' },
  '玄武': { nature: '凶神', meaning: '暗昧欺骗、盗窃小人，所临之宫防欺诈、失窃、暗箭' },
  '九地': { nature: '吉神', meaning: '稳重守成、坚固不动，所临之宫宜静守、利防御、积蓄' },
  '九天': { nature: '吉神', meaning: '刚强向上、远行高升，所临之宫利进取、出行、拓展' },
};

// ==================== 干落宫定位 ====================

export interface StemPalaceInfo {
  label: string;       // 如 "日干" "时干"
  stem: string;        // 原始天干
  effectStem: string;  // 有效天干（甲→六仪）
  palace: number;      // 落宫编号
  palaceName: string;  // 落宫名称
  palaceWX: WuXing;    // 落宫五行
  stemWX: WuXing;      // 天干五行
  relation: string;    // 干与宫五行关系
}

/** 在地盘中查找天干落宫（中5宫寄坤2） */
function findStemPalace(data: PaipanData, stem: string): number {
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const es = data.palaces[p].earthStem;
    if (es && es.includes(stem)) return p;
  }
  return 0;
}

function buildStemPalaceInfo(label: string, gan: string, gz: string, data: PaipanData): StemPalaceInfo {
  const eStem = effectiveStem(gan, gz);
  const palace = findStemPalace(data, eStem);
  const palaceName = palace > 0 ? PALACE_NAMES[palace] : '未找到';
  const palaceWX = palace > 0 ? PALACE_WX[palace] : '土';
  const stemWX = GAN_WX[gan] || '土';
  const relation = palace > 0 ? wxRelation(stemWX, palaceWX) : '';

  return { label, stem: gan, effectStem: eStem, palace, palaceName, palaceWX, stemWX, relation };
}

// ==================== 格局检测 ====================

export interface PatternInfo {
  name: string;
  type: '凶格' | '中性';
  palace: number;
  target: string;        // 受影响的对象（如星名、门名、天干）
  description: string;
}

/** 检测伏吟（星/门回到本宫） */
function detectFuyin(data: PaipanData): PatternInfo[] {
  const patterns: PatternInfo[] = [];

  // 星伏吟：检查多少星回到本宫
  let starFuyinCount = 0;
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const star = data.palaces[p].star;
    if (star && STAR_HOME[star] === p) starFuyinCount++;
  }
  if (starFuyinCount >= 6) {
    patterns.push({
      name: '星盘伏吟',
      type: '凶格',
      palace: 0,
      target: '九星',
      description: '九星多数回归本宫，主事情拖延、反复难决、进退两难，宜守不宜攻',
    });
  }

  // 门伏吟：检查多少门回到本宫
  let gateFuyinCount = 0;
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const gate = data.palaces[p].gate;
    if (gate && GATE_HOME[gate] === p) gateFuyinCount++;
  }
  if (gateFuyinCount >= 6) {
    patterns.push({
      name: '门盘伏吟',
      type: '凶格',
      palace: 0,
      target: '八门',
      description: '八门多数回归本宫，主事情停滞、纠结、原地踏步，难有突破',
    });
  }

  return patterns;
}

/** 检测反吟（星/门到对冲宫位） */
function detectFanyin(data: PaipanData): PatternInfo[] {
  const patterns: PatternInfo[] = [];

  let starFanyinCount = 0;
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const star = data.palaces[p].star;
    if (star) {
      const home = STAR_HOME[star];
      if (home !== 5 && OPPOSITE_PALACE[home] === p) starFanyinCount++;
    }
  }
  if (starFanyinCount >= 6) {
    patterns.push({
      name: '星盘反吟',
      type: '凶格',
      palace: 0,
      target: '九星',
      description: '九星多数落入对冲宫位，主事情反复无常、变动剧烈、动荡不安',
    });
  }

  let gateFanyinCount = 0;
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const gate = data.palaces[p].gate;
    if (gate) {
      const home = GATE_HOME[gate];
      if (home && OPPOSITE_PALACE[home] === p) gateFanyinCount++;
    }
  }
  if (gateFanyinCount >= 6) {
    patterns.push({
      name: '门盘反吟',
      type: '凶格',
      palace: 0,
      target: '八门',
      description: '八门多数落入对冲宫位，主事情大起大落、颠覆反转、行动受阻',
    });
  }

  return patterns;
}

/** 检测六仪击刑（地盘干落在刑宫） */
function detectJiXing(data: PaipanData): PatternInfo[] {
  const patterns: PatternInfo[] = [];

  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const es = data.palaces[p].earthStem;
    if (!es) continue;
    for (const ch of es) {
      if (JIXING_MAP[ch] === p) {
        patterns.push({
          name: '六仪击刑',
          type: '凶格',
          palace: p,
          target: ch,
          description: `${ch}落${PALACE_NAMES[p]}形成击刑，主刑伤、冲突、突发阻碍，此宫事务需特别注意`,
        });
      }
    }
  }

  return patterns;
}

/** 检测入墓（星/门/天干入墓库宫位） */
function detectRuMu(data: PaipanData): PatternInfo[] {
  const patterns: PatternInfo[] = [];

  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const palace = data.palaces[p];

    // 星入墓
    if (palace.star) {
      const starWx = STAR_WX[palace.star];
      if (starWx && WX_TOMB[starWx] === p) {
        patterns.push({
          name: '星入墓',
          type: '凶格',
          palace: p,
          target: palace.star,
          description: `${palace.star}（${starWx}）落${PALACE_NAMES[p]}入墓，星力受困，此宫能量受限、事物隐藏难显`,
        });
      }
    }

    // 门入墓
    if (palace.gate) {
      const gateWx = GATE_WX[palace.gate];
      if (gateWx && WX_TOMB[gateWx] === p) {
        patterns.push({
          name: '门入墓',
          type: '凶格',
          palace: p,
          target: palace.gate,
          description: `${palace.gate}（${gateWx}）落${PALACE_NAMES[p]}入墓，门力受困，行动受阻、事与愿违`,
        });
      }
    }

    // 天盘干入墓
    if (palace.heavenStem) {
      for (const ch of palace.heavenStem) {
        const ganWx = GAN_WX[ch];
        if (ganWx && WX_TOMB[ganWx] === p) {
          patterns.push({
            name: '天干入墓',
            type: '凶格',
            palace: p,
            target: ch,
            description: `天盘${ch}（${ganWx}）落${PALACE_NAMES[p]}入墓，代表对应人事被困、停滞、受制`,
          });
        }
      }
    }
  }

  return patterns;
}

/** 检测门迫（宫克门） */
function detectMenPo(data: PaipanData): PatternInfo[] {
  const patterns: PatternInfo[] = [];

  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const gate = data.palaces[p].gate;
    if (!gate) continue;
    const gateWx = GATE_WX[gate];
    const palaceWx = PALACE_WX[p];
    if (gateWx && palaceWx && wxKe(palaceWx, gateWx)) {
      patterns.push({
        name: '门迫',
        type: '凶格',
        palace: p,
        target: gate,
        description: `${gate}（${gateWx}）被${PALACE_NAMES[p]}（${palaceWx}）所克，门力受制，行动受限、能量受阻`,
      });
    }
  }

  return patterns;
}

// ==================== 各宫综合分析 ====================

export interface PalaceAnalysis {
  palace: number;
  palaceName: string;
  palaceWX: WuXing;
  // 星
  star: string;
  starWX: WuXing;
  starStrength: Strength;
  starNature: string;
  starMeaning: string;
  starRelation: string;  // 星与宫关系
  // 门
  gate: string;
  gateWX: WuXing;
  gateAuspice: '吉' | '凶' | '中';
  gateMeaning: string;
  gateRelation: string;  // 门与宫关系
  // 神
  spirit: string;
  spiritNature: string;
  spiritMeaning: string;
  // 天地盘干
  heavenStem: string;
  earthStem: string;
  // 状态标记
  isMenPo: boolean;
  isStarRuMu: boolean;
  isGateRuMu: boolean;
  isVoid: boolean;
  isHorse: boolean;
  // 综合评分（-10 到 10）
  score: number;
}

function analyzePalace(data: PaipanData, palace: number, seasonWX: WuXing): PalaceAnalysis {
  const p = data.palaces[palace];
  const palaceWX = PALACE_WX[palace];

  // 星分析
  const starWX = STAR_WX[p.star] || '土';
  const starStrength = getStrength(starWX, seasonWX);
  const starInfo = STAR_DESC[p.star] || { nature: '', meaning: '' };
  const starRelation = wxRelation(starWX, palaceWX);

  // 门分析
  const gateWX = GATE_WX[p.gate] || '土';
  const gateInfo = GATE_DESC[p.gate] || { auspice: '中' as const, meaning: '' };
  const gateRelation = wxRelation(gateWX, palaceWX);

  // 神分析
  const spiritInfo = SPIRIT_DESC[p.spirit] || { nature: '', meaning: '' };

  // 状态检测
  const isMenPo = !!(p.gate && GATE_WX[p.gate] && wxKe(palaceWX, GATE_WX[p.gate]));
  const isStarRuMu = !!(p.star && STAR_WX[p.star] && WX_TOMB[STAR_WX[p.star]] === palace);
  const isGateRuMu = !!(p.gate && GATE_WX[p.gate] && WX_TOMB[GATE_WX[p.gate]] === palace);
  const isVoid = data.voidPalaces.includes(palace);
  const isHorse = data.horsePalace === palace;

  // 综合评分
  let score = 0;

  // 门吉凶基础分
  if (gateInfo.auspice === '吉') score += 3;
  else if (gateInfo.auspice === '凶') score -= 3;

  // 星旺衰分
  if (starStrength === '旺') score += 2;
  else if (starStrength === '相') score += 1;
  else if (starStrength === '囚') score -= 1;
  else if (starStrength === '死') score -= 2;

  // 星性质分
  if (starInfo.nature === '吉星') score += 1;
  else if (starInfo.nature === '凶星') score -= 1;

  // 神吉凶分
  if (spiritInfo.nature === '吉神') score += 1;
  else if (spiritInfo.nature === '凶神') score -= 1;

  // 格局减分
  if (isMenPo) score -= 2;
  if (isStarRuMu) score -= 2;
  if (isGateRuMu) score -= 2;
  if (isVoid) score -= 2;

  // 马星加分（动象，非吉凶但有变动意）
  if (isHorse) score += 0;

  // 星生宫/宫生星
  if (starRelation === '生') score += 1;
  else if (starRelation === '被克') score -= 1;

  return {
    palace,
    palaceName: PALACE_NAMES[palace],
    palaceWX,
    star: p.star,
    starWX,
    starStrength,
    starNature: starInfo.nature,
    starMeaning: starInfo.meaning,
    starRelation,
    gate: p.gate,
    gateWX,
    gateAuspice: gateInfo.auspice,
    gateMeaning: gateInfo.meaning,
    gateRelation,
    spirit: p.spirit,
    spiritNature: spiritInfo.nature,
    spiritMeaning: spiritInfo.meaning,
    heavenStem: p.heavenStem,
    earthStem: p.earthStem,
    isMenPo,
    isStarRuMu,
    isGateRuMu,
    isVoid,
    isHorse,
    score,
  };
}

// ==================== 干支关系分析 ====================

export interface StemRelation {
  from: StemPalaceInfo;
  to: StemPalaceInfo;
  palaceRelation: string;    // 宫与宫的五行关系
  description: string;
}

function analyzeStemRelation(from: StemPalaceInfo, to: StemPalaceInfo): StemRelation {
  let palaceRelation = '';
  let desc = '';

  if (from.palace > 0 && to.palace > 0) {
    if (from.palace === to.palace) {
      palaceRelation = '同宫';
      desc = `${from.label}与${to.label}同落${from.palaceName}，关系紧密、相互纠缠`;
    } else {
      const rel = wxRelation(from.palaceWX, to.palaceWX);
      palaceRelation = rel;
      if (rel === '生') {
        desc = `${from.label}宫（${from.palaceWX}）生${to.label}宫（${to.palaceWX}），${from.label}助力${to.label}`;
      } else if (rel === '被生') {
        desc = `${to.label}宫（${to.palaceWX}）生${from.label}宫（${from.palaceWX}），${to.label}助力${from.label}`;
      } else if (rel === '克') {
        desc = `${from.label}宫（${from.palaceWX}）克${to.label}宫（${to.palaceWX}），${from.label}对${to.label}构成压制`;
      } else if (rel === '被克') {
        desc = `${to.label}宫（${to.palaceWX}）克${from.label}宫（${from.palaceWX}），${from.label}受${to.label}压制`;
      } else {
        desc = `${from.label}宫与${to.label}宫五行${rel}，能量平衡互不干扰`;
      }
    }
  }

  return { from, to, palaceRelation, description: desc };
}

// ==================== 综合判断 ====================

export interface OverallAssessment {
  tendency: '吉' | '凶' | '平';
  score: number;            // -100 到 100
  summary: string;
  keyPoints: string[];      // 核心要点
  advice: string[];         // 行动建议
  warnings: string[];       // 注意事项
}

function buildOverallAssessment(
  stemPalaces: { dayGan: StemPalaceInfo; timeGan: StemPalaceInfo },
  dayPalaceAnalysis: PalaceAnalysis | null,
  timePalaceAnalysis: PalaceAnalysis | null,
  patterns: PatternInfo[],
  dayTimeRelation: StemRelation,
): OverallAssessment {
  let score = 0;
  const keyPoints: string[] = [];
  const advice: string[] = [];
  const warnings: string[] = [];

  // 日干宫评分
  if (dayPalaceAnalysis) {
    score += dayPalaceAnalysis.score * 3;  // 日干权重高
    if (dayPalaceAnalysis.score >= 3) {
      keyPoints.push(`求测人状态良好：${dayPalaceAnalysis.star}+${dayPalaceAnalysis.gate}在${dayPalaceAnalysis.palaceName}，能量充沛`);
    } else if (dayPalaceAnalysis.score <= -3) {
      keyPoints.push(`求测人处境受限：${dayPalaceAnalysis.star}+${dayPalaceAnalysis.gate}在${dayPalaceAnalysis.palaceName}，需注意调整`);
    }
    if (dayPalaceAnalysis.isVoid) {
      warnings.push('日干落空亡宫，求测人心志不坚或事情难以落实，需等待时机');
    }
  }

  // 时干宫评分
  if (timePalaceAnalysis) {
    score += timePalaceAnalysis.score * 2;
    if (timePalaceAnalysis.score >= 3) {
      keyPoints.push(`事体发展向好：${timePalaceAnalysis.star}+${timePalaceAnalysis.gate}在${timePalaceAnalysis.palaceName}，态势积极`);
    } else if (timePalaceAnalysis.score <= -3) {
      keyPoints.push(`事体发展受阻：${timePalaceAnalysis.star}+${timePalaceAnalysis.gate}在${timePalaceAnalysis.palaceName}，存在障碍`);
    }
    if (timePalaceAnalysis.isVoid) {
      warnings.push('时干落空亡宫，所求之事可能落空或延迟，暂时难以达成');
    }
  }

  // 日干-时干关系
  if (dayTimeRelation.palaceRelation) {
    if (dayTimeRelation.palaceRelation === '生' || dayTimeRelation.palaceRelation === '被生') {
      score += 5;
    } else if (dayTimeRelation.palaceRelation === '克') {
      score -= 3;
    } else if (dayTimeRelation.palaceRelation === '被克') {
      score -= 5;
    } else if (dayTimeRelation.palaceRelation === '同宫') {
      score += 2;
    }
    if (dayTimeRelation.description) {
      keyPoints.push(dayTimeRelation.description);
    }
  }

  // 格局影响
  for (const p of patterns) {
    if (p.type === '凶格') {
      score -= 5;
      warnings.push(`${p.name}：${p.description}`);
    }
  }

  // 门迫/入墓在日干、时干宫的影响
  if (dayPalaceAnalysis?.isMenPo) {
    warnings.push(`日干宫${dayPalaceAnalysis.gate}受门迫，求测人行动受阻、能量受限`);
    advice.push('当前状态受限，建议调整策略、避免强行推进');
  }
  if (timePalaceAnalysis?.isMenPo) {
    warnings.push(`时干宫${timePalaceAnalysis.gate}受门迫，事情推进困难`);
    advice.push('事情发展受阻，建议寻找替代方案或等待时机转变');
  }

  // 马星建议
  if (dayPalaceAnalysis?.isHorse) {
    advice.push('日干宫临马星，求测人有变动之象，宜主动出击、把握变化机会');
  }
  if (timePalaceAnalysis?.isHorse) {
    advice.push('时干宫临马星，事情有转机变化之象，注意把握关键节点');
  }

  // 基于门给建议
  if (dayPalaceAnalysis) {
    const dayGate = dayPalaceAnalysis.gate;
    if (dayGate === '开门') advice.push('日干临开门，利于开创新局面、积极行动');
    else if (dayGate === '休门') advice.push('日干临休门，宜休整调理、寻求贵人帮助');
    else if (dayGate === '生门') advice.push('日干临生门，利于求财经营、开拓资源');
    else if (dayGate === '杜门') advice.push('日干临杜门，宜低调守成、避免高调行事');
    else if (dayGate === '死门') advice.push('日干临死门，诸事宜缓、保守为上');
    else if (dayGate === '惊门') advice.push('日干临惊门，防口舌是非、小心应对突发');
  }

  // 归一化分数
  const normalized = Math.max(-100, Math.min(100, score * 2));
  let tendency: '吉' | '凶' | '平';
  if (normalized >= 15) tendency = '吉';
  else if (normalized <= -15) tendency = '凶';
  else tendency = '平';

  // 总结
  let summary = '';
  if (tendency === '吉') {
    summary = '整体格局偏吉，核心宫位能量较好，事情发展顺遂的概率较大。';
  } else if (tendency === '凶') {
    summary = '整体格局偏凶，核心宫位存在不利因素，事情推进面临较大阻力。';
  } else {
    summary = '整体格局平稳，吉凶参半，事情发展取决于应对策略和时机把握。';
  }

  if (keyPoints.length === 0) {
    keyPoints.push('当前局势较为平淡，无明显吉凶倾向');
  }
  if (advice.length === 0) {
    advice.push('保持平常心态，顺势而为，关注核心宫位的变化');
  }

  return { tendency, score: normalized, summary, keyPoints, advice, warnings };
}

// ==================== 主分析函数 ====================

export interface AnalysisResult {
  // 一、基础信息锚定
  seasonWX: WuXing;
  seasonDesc: string;

  // 二、核心宫位：干落宫
  stemPalaces: {
    dayGan: StemPalaceInfo;
    timeGan: StemPalaceInfo;
    yearGan: StemPalaceInfo;
    monthGan: StemPalaceInfo;
  };
  dayTimeRelation: StemRelation;

  // 三、各宫分析
  palaceAnalyses: Record<number, PalaceAnalysis>;

  // 四、格局
  patterns: PatternInfo[];

  // 五、综合判断
  overall: OverallAssessment;
}

export function analyzeQimen(data: PaipanData): AnalysisResult {
  // 季节五行
  const seasonWX = getSeasonWX(data.ganZhi.month);
  const seasonNames: Record<WuXing, string> = {
    '木': '春季木旺', '火': '夏季火旺', '金': '秋季金旺', '水': '冬季水旺', '土': '季月土旺',
  };
  const seasonDesc = seasonNames[seasonWX];

  // 干落宫
  const dayGan = data.ganZhi.day[0];
  const timeGan = data.ganZhi.time[0];
  const yearGan = data.ganZhi.year[0];
  const monthGan = data.ganZhi.month[0];

  const stemPalaces = {
    dayGan: buildStemPalaceInfo('日干', dayGan, data.ganZhi.day, data),
    timeGan: buildStemPalaceInfo('时干', timeGan, data.ganZhi.time, data),
    yearGan: buildStemPalaceInfo('年干', yearGan, data.ganZhi.year, data),
    monthGan: buildStemPalaceInfo('月干', monthGan, data.ganZhi.month, data),
  };

  // 日干-时干关系
  const dayTimeRelation = analyzeStemRelation(stemPalaces.dayGan, stemPalaces.timeGan);

  // 各宫分析
  const palaceAnalyses: Record<number, PalaceAnalysis> = {};
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    palaceAnalyses[p] = analyzePalace(data, p, seasonWX);
  }

  // 格局检测
  const patterns: PatternInfo[] = [
    ...detectFuyin(data),
    ...detectFanyin(data),
    ...detectJiXing(data),
    ...detectRuMu(data),
    ...detectMenPo(data),
  ];

  // 综合判断
  const dayPA = stemPalaces.dayGan.palace > 0 ? palaceAnalyses[stemPalaces.dayGan.palace] || null : null;
  const timePA = stemPalaces.timeGan.palace > 0 ? palaceAnalyses[stemPalaces.timeGan.palace] || null : null;
  const overall = buildOverallAssessment(stemPalaces, dayPA, timePA, patterns, dayTimeRelation);

  return {
    seasonWX,
    seasonDesc,
    stemPalaces,
    dayTimeRelation,
    palaceAnalyses,
    patterns,
    overall,
  };
}
