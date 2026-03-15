/**
 * 奇门遁甲 —— 常量数据表
 */

import type { PalaceId, PalaceInfo, NineStar, EightGate, Spirit, WuXing } from './types';

// ==================== 九宫 ====================

/** 九宫基础信息（洛书序） */
export const PALACE_INFO: Record<PalaceId, PalaceInfo> = {
  1: { id: 1, name: '坎一宫', direction: '正北', element: '水', branches: ['子'] },
  2: { id: 2, name: '坤二宫', direction: '西南', element: '土', branches: ['未', '申'] },
  3: { id: 3, name: '震三宫', direction: '正东', element: '木', branches: ['卯'] },
  4: { id: 4, name: '巽四宫', direction: '东南', element: '木', branches: ['辰', '巳'] },
  5: { id: 5, name: '中五宫', direction: '中央', element: '土', branches: [] },
  6: { id: 6, name: '乾六宫', direction: '西北', element: '金', branches: ['戌', '亥'] },
  7: { id: 7, name: '兑七宫', direction: '正西', element: '金', branches: ['酉'] },
  8: { id: 8, name: '艮八宫', direction: '东北', element: '土', branches: ['丑', '寅'] },
  9: { id: 9, name: '离九宫', direction: '正南', element: '火', branches: ['午'] },
};

// ==================== 九星 ====================

/** 九星（按本宫序排列） */
export const NINE_STARS: NineStar[] = [
  { name: '天蓬', originalPalace: 1, element: '水', auspice: '凶' },
  { name: '天芮', originalPalace: 2, element: '土', auspice: '凶' },
  { name: '天冲', originalPalace: 3, element: '木', auspice: '吉' },
  { name: '天辅', originalPalace: 4, element: '木', auspice: '吉' },
  { name: '天禽', originalPalace: 5, element: '土', auspice: '中' },
  { name: '天心', originalPalace: 6, element: '金', auspice: '吉' },
  { name: '天柱', originalPalace: 7, element: '金', auspice: '凶' },
  { name: '天任', originalPalace: 8, element: '土', auspice: '吉' },
  { name: '天英', originalPalace: 9, element: '火', auspice: '凶' },
];

/** 按本宫编号快速查找九星 */
export const STAR_BY_PALACE: Record<PalaceId, NineStar> = {} as Record<PalaceId, NineStar>;
for (const star of NINE_STARS) {
  STAR_BY_PALACE[star.originalPalace] = star;
}

// ==================== 八门 ====================

/** 八门（按本宫序排列，5宫无门） */
export const EIGHT_GATES: EightGate[] = [
  { name: '休门', originalPalace: 1, element: '水', auspice: '吉' },
  { name: '死门', originalPalace: 2, element: '土', auspice: '凶' },
  { name: '伤门', originalPalace: 3, element: '木', auspice: '凶' },
  { name: '杜门', originalPalace: 4, element: '木', auspice: '中' },
  { name: '开门', originalPalace: 6, element: '金', auspice: '吉' },
  { name: '惊门', originalPalace: 7, element: '金', auspice: '凶' },
  { name: '生门', originalPalace: 8, element: '土', auspice: '吉' },
  { name: '景门', originalPalace: 9, element: '火', auspice: '中' },
];

/** 按本宫编号快速查找八门 */
export const GATE_BY_PALACE: Record<number, EightGate> = {};
for (const gate of EIGHT_GATES) {
  GATE_BY_PALACE[gate.originalPalace] = gate;
}

// ==================== 八神 ====================

/** 阳遁八神顺序（转盘/飞盘用） */
export const SPIRITS_YANG: Spirit[] = [
  { name: '值符' },
  { name: '腾蛇' },
  { name: '太阴' },
  { name: '六合' },
  { name: '白虎' },
  { name: '玄武' },
  { name: '九地' },
  { name: '九天' },
];

/** 阴遁八神顺序（阴盘统一使用此序） */
export const SPIRITS_YIN: Spirit[] = [
  { name: '值符' },
  { name: '九天' },
  { name: '九地' },
  { name: '玄武' },
  { name: '白虎' },
  { name: '六合' },
  { name: '太阴' },
  { name: '腾蛇' },
];

// ==================== 阴盘元旦盘（固定不变） ====================

/**
 * 王凤麟阴盘：地盘元旦盘 —— 固定不变的核心基准
 * 每宫有固定的地盘干（含干支混合字符）、本位九星、本位八门
 * 此为所有阴盘计算的基准参照，不随时间变化
 */
export const YUAN_DAN_EARTH: Record<PalaceId, string> = {
  1: '癸',  // 坎一宫 正北
  2: '己',  // 坤二宫 西南
  3: '卯',  // 震三宫 正东
  4: '辰',  // 巽四宫 东南
  5: '戊',  // 中五宫 中央（天禽寄坤二）
  6: '亥',  // 乾六宫 西北
  7: '酉',  // 兑七宫 正西
  8: '丑',  // 艮八宫 东北
  9: '丙',  // 离九宫 正南
};

/**
 * 天干寄宫映射：每个天干在元旦盘中对应的固定宫位
 * 甲隐于六仪，不在此表中，调用方需先替换为旬首六仪
 * 戊→5宫（寄坤2），实际操作中等同于2宫
 */
export const STEM_TO_PALACE: Record<string, PalaceId> = {
  '乙': 3,  // 震三宫（卯木）
  '丙': 9,  // 离九宫（丙火）
  '丁': 4,  // 巽四宫（辰巳）
  '戊': 2,  // 中五宫寄坤二
  '己': 2,  // 坤二宫（己土）
  '庚': 8,  // 艮八宫（丑）
  '辛': 7,  // 兑七宫（酉金）
  '壬': 6,  // 乾六宫（亥水）
  '癸': 1,  // 坎一宫（癸水）
};

/**
 * 阴盘八神顺序（王凤麟体系）
 * 值符→螣蛇→太阴→六合→白虎→玄武→九地→九天
 * 从值符星最终落宫起，沿九宫顺行方向飞布
 */
export const SPIRITS_YINPAN: Spirit[] = [
  { name: '值符' },
  { name: '螣蛇' },
  { name: '太阴' },
  { name: '六合' },
  { name: '白虎' },
  { name: '玄武' },
  { name: '九地' },
  { name: '九天' },
];

// ==================== 王凤麟象意系统 ====================

/** 九星象意（王凤麟体系） */
export const STAR_MEANINGS: Record<string, string> = {
  '天蓬': '盗贼、暗昧、智谋、水灾、私密',
  '天芮': '疾病、阴暗、小人、寡妇、田宅',
  '天冲': '勇猛、急躁、战斗、出行、变动',
  '天辅': '文昌、文书、学业、温和、策划',
  '天禽': '中正、居中、调和、统领、大地',
  '天心': '医药、长者、领导、正直、宗教',
  '天柱': '口舌、破坏、言语、惊恐、毁折',
  '天任': '稳重、土地、慈善、艮止、果敢',
  '天英': '文明、光彩、血光、急躁、虚荣',
};

/** 八门象意（王凤麟体系） */
export const GATE_MEANINGS: Record<string, string> = {
  '休门': '休养生息、贵人、求财、安逸',
  '生门': '生发、求财、营生、土地、房产',
  '伤门': '伤灾、官司、竞争、运动、破财',
  '杜门': '阻隔、隐藏、防守、逃避、封闭',
  '景门': '光明、文书、血光、口舌、策划',
  '死门': '死亡、断绝、凶险、丧事、吊丧',
  '惊门': '惊恐、口舌、官司、是非、怪异',
  '开门': '开创、事业、领导、权威、出行',
};

/** 八神象意（王凤麟体系） */
export const SPIRIT_MEANINGS: Record<string, string> = {
  '值符': '领导、权威、贵人、天助、尊贵',
  '腾蛇': '虚惊、怪异、缠绕、变化、梦寐',
  '太阴': '阴私、暗助、女性、策划、隐秘',
  '六合': '合作、婚姻、媒介、中间人、和合',
  '白虎': '凶猛、血光、丧事、道路、武力',
  '玄武': '盗贼、暗昧、欺骗、失物、阴私',
  '九地': '坤顺、稳定、藏匿、母亲、大地',
  '九天': '刚健、向上、张扬、天空、远行',
};

/** 天干象意（王凤麟体系） */
export const GAN_MEANINGS: Record<string, string> = {
  '甲': '首领、大树、头部、胆、栋梁',
  '乙': '花草、妻财、肝、曲折、乙奇',
  '丙': '太阳、光明、权威、心、丙奇',
  '丁': '星光、文书、智慧、血脉、丁奇',
  '戊': '大地、城墙、资本、胃、六仪',
  '己': '田园、坟墓、脾、妻、六仪',
  '庚': '道路、阻隔、仇敌、肺、六仪',
  '辛': '错误、变革、过失、骨、六仪',
  '壬': '江河、流动、膀胱、盗、六仪',
  '癸': '暗流、地网、肾、女阴、六仪',
};

// ==================== 天干序列 ====================

/**
 * 地盘天干布局序列
 * 甲隐于六仪之下，排盘用9个干：戊己庚辛壬癸丁丙乙
 */
export const STEM_SEQUENCE = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];

/** 天干列表 */
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/** 地支列表 */
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// ==================== 九宫遍历序 ====================

/** 九宫顺行序（跳过5宫） */
export const FORWARD_PALACE_ORDER: PalaceId[] = [1, 8, 3, 4, 9, 2, 7, 6];

/** 九宫逆行序（跳过5宫） */
export const BACKWARD_PALACE_ORDER: PalaceId[] = [9, 4, 3, 8, 1, 6, 7, 2];

// ==================== 局数表 ====================

/**
 * 节气定局表
 * key: 节气名, value: { 上元: 局数, 中元: 局数, 下元: 局数 }
 * 阳遁（冬至 → 芒种）使用正数局
 * 阴遁（夏至 → 大雪）使用正数局
 */
export const JU_TABLE: Record<string, { dunType: '阳遁' | '阴遁'; 上元: number; 中元: number; 下元: number }> = {
  // ===== 阳遁（冬至后） =====
  '冬至': { dunType: '阳遁', 上元: 1, 中元: 7, 下元: 4 },
  '小寒': { dunType: '阳遁', 上元: 2, 中元: 8, 下元: 5 },
  '大寒': { dunType: '阳遁', 上元: 3, 中元: 9, 下元: 6 },
  '立春': { dunType: '阳遁', 上元: 8, 中元: 5, 下元: 2 },
  '雨水': { dunType: '阳遁', 上元: 9, 中元: 6, 下元: 3 },
  '惊蛰': { dunType: '阳遁', 上元: 1, 中元: 7, 下元: 4 },
  '春分': { dunType: '阳遁', 上元: 3, 中元: 9, 下元: 6 },
  '清明': { dunType: '阳遁', 上元: 4, 中元: 1, 下元: 7 },
  '谷雨': { dunType: '阳遁', 上元: 5, 中元: 2, 下元: 8 },
  '立夏': { dunType: '阳遁', 上元: 4, 中元: 1, 下元: 7 },
  '小满': { dunType: '阳遁', 上元: 5, 中元: 2, 下元: 8 },
  '芒种': { dunType: '阳遁', 上元: 6, 中元: 3, 下元: 9 },
  // ===== 阴遁（夏至后） =====
  '夏至': { dunType: '阴遁', 上元: 9, 中元: 3, 下元: 6 },
  '小暑': { dunType: '阴遁', 上元: 8, 中元: 2, 下元: 5 },
  '大暑': { dunType: '阴遁', 上元: 7, 中元: 1, 下元: 4 },
  '立秋': { dunType: '阴遁', 上元: 7, 中元: 1, 下元: 4 },
  '处暑': { dunType: '阴遁', 上元: 1, 中元: 4, 下元: 7 },
  '白露': { dunType: '阴遁', 上元: 9, 中元: 3, 下元: 6 },
  '秋分': { dunType: '阴遁', 上元: 7, 中元: 1, 下元: 4 },
  '寒露': { dunType: '阴遁', 上元: 6, 中元: 9, 下元: 3 },
  '霜降': { dunType: '阴遁', 上元: 5, 中元: 8, 下元: 2 },
  '立冬': { dunType: '阴遁', 上元: 6, 中元: 9, 下元: 3 },
  '小雪': { dunType: '阴遁', 上元: 5, 中元: 8, 下元: 2 },
  '大雪': { dunType: '阴遁', 上元: 4, 中元: 7, 下元: 1 },
};

/**
 * 24节气按时间顺序排列（从冬至开始）
 * 用于确定当前所在节气区间
 */
export const JIEQI_ORDER = [
  '冬至', '小寒', '大寒', '立春', '雨水', '惊蛰',
  '春分', '清明', '谷雨', '立夏', '小满', '芒种',
  '夏至', '小暑', '大暑', '立秋', '处暑', '白露',
  '秋分', '寒露', '霜降', '立冬', '小雪', '大雪',
];

// ==================== 旬首映射 ====================

/** 六甲隐仪：旬首→隐于哪个六仪之下 */
export const JIA_YIN_MAP: Record<string, string> = {
  '甲子': '戊', '甲戌': '己', '甲申': '庚',
  '甲午': '辛', '甲辰': '壬', '甲寅': '癸',
};

/**
 * 六十甲子 → 旬首信息
 * xunShou: 所属旬首
 * yinStem: 甲所隐的六仪
 * voidPair: 空亡地支对
 */
export interface XunShouInfo {
  xunShou: string;
  yinStem: string;
  voidPair: [string, string];
}

/** 构建60甲子旬首映射表 */
function buildXunShouMap(): Record<string, XunShouInfo> {
  const map: Record<string, XunShouInfo> = {};
  const xunList: Array<{ head: string; yinStem: string; voidPair: [string, string] }> = [
    { head: '甲子', yinStem: '戊', voidPair: ['戌', '亥'] },
    { head: '甲戌', yinStem: '己', voidPair: ['申', '酉'] },
    { head: '甲申', yinStem: '庚', voidPair: ['午', '未'] },
    { head: '甲午', yinStem: '辛', voidPair: ['辰', '巳'] },
    { head: '甲辰', yinStem: '壬', voidPair: ['寅', '卯'] },
    { head: '甲寅', yinStem: '癸', voidPair: ['子', '丑'] },
  ];

  for (const xun of xunList) {
    const ganStart = TIAN_GAN.indexOf(xun.head[0]);
    const zhiStart = DI_ZHI.indexOf(xun.head[1]);
    for (let i = 0; i < 10; i++) {
      const gan = TIAN_GAN[(ganStart + i) % 10];
      const zhi = DI_ZHI[(zhiStart + i) % 12];
      map[gan + zhi] = { xunShou: xun.head, yinStem: xun.yinStem, voidPair: xun.voidPair };
    }
  }
  return map;
}

export const XUN_SHOU_MAP: Record<string, XunShouInfo> = buildXunShouMap();

// ==================== 马星 ====================

/**
 * 日支 → 马星地支
 * 三合局冲方为马星
 */
export const MA_STAR_MAP: Record<string, string> = {
  '寅': '申', '午': '申', '戌': '申',
  '申': '寅', '子': '寅', '辰': '寅',
  '巳': '亥', '酉': '亥', '丑': '亥',
  '亥': '巳', '卯': '巳', '未': '巳',
};

// ==================== 地支→宫位 ====================

/** 地支到宫位映射 */
export const BRANCH_TO_PALACE: Record<string, PalaceId> = {
  '子': 1,
  '丑': 8, '寅': 8,
  '卯': 3,
  '辰': 4, '巳': 4,
  '午': 9,
  '未': 2, '申': 2,
  '酉': 7,
  '戌': 6, '亥': 6,
};

// ==================== 五行生克 ====================

/** 五行相生 */
export const WX_SHENG: Record<WuXing, WuXing> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
};

/** 五行相克 */
export const WX_KE: Record<WuXing, WuXing> = {
  '木': '土', '土': '水', '水': '火', '火': '金', '金': '木',
};

/** 天干→五行 */
export const GAN_WU_XING: Record<string, WuXing> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};

// ==================== 九宫对冲 ====================

/** 洛书对冲宫 */
export const OPPOSITE_PALACE: Record<PalaceId, PalaceId> = {
  1: 9, 9: 1,
  2: 8, 8: 2,
  3: 7, 7: 3,
  4: 6, 6: 4,
  5: 5,
};

// ==================== 格局定义 ====================

/** 格局检测规则 */
export interface PatternDef {
  name: string;
  type: '吉格' | '凶格';
  description: string;
  /** 检测函数：传入天盘干、地盘干、星名、门名、神名，返回是否匹配 */
  check: (heavenStem: string, earthStem: string, starName: string, gateName: string, spiritName: string) => boolean;
}

export const PATTERN_DEFS: PatternDef[] = [
  // ===== 吉格 =====
  {
    name: '乙奇得使',
    type: '吉格',
    description: '天盘乙奇配合开门，万事可为',
    check: (h, _e, _s, g) => h === '乙' && g === '开门',
  },
  {
    name: '丙奇得使',
    type: '吉格',
    description: '天盘丙奇配合开门或休门，威权显赫',
    check: (h, _e, _s, g) => h === '丙' && (g === '开门' || g === '休门'),
  },
  {
    name: '丁奇得使',
    type: '吉格',
    description: '天盘丁奇配合开门或景门，文书有喜',
    check: (h, _e, _s, g) => h === '丁' && (g === '开门' || g === '景门'),
  },
  {
    name: '天遁',
    type: '吉格',
    description: '天盘丙加地盘戊配合生门，天助神佑',
    check: (h, e, _s, g) => h === '丙' && e === '戊' && g === '生门',
  },
  {
    name: '地遁',
    type: '吉格',
    description: '天盘乙加地盘己配合开门，稳如泰山',
    check: (h, e, _s, g) => h === '乙' && e === '己' && g === '开门',
  },
  {
    name: '人遁',
    type: '吉格',
    description: '天盘丁加地盘己配合休门，贵人扶持',
    check: (h, e, _s, g) => h === '丁' && e === '己' && g === '休门',
  },
  {
    name: '神遁',
    type: '吉格',
    description: '天盘丙配合九天和生门，神助得利',
    check: (h, _e, _s, g, sp) => h === '丙' && sp === '九天' && g === '生门',
  },
  {
    name: '三奇得门（乙+吉门）',
    type: '吉格',
    description: '乙奇临吉门（开休生景），诸事遂意',
    check: (h, _e, _s, g) => h === '乙' && ['开门', '休门', '生门', '景门'].includes(g),
  },
  {
    name: '三奇得门（丙+吉门）',
    type: '吉格',
    description: '丙奇临吉门（开休生景），光明磊落',
    check: (h, _e, _s, g) => h === '丙' && ['开门', '休门', '生门', '景门'].includes(g),
  },
  {
    name: '三奇得门（丁+吉门）',
    type: '吉格',
    description: '丁奇临吉门（开休生景），暗中有助',
    check: (h, _e, _s, g) => h === '丁' && ['开门', '休门', '生门', '景门'].includes(g),
  },
  {
    name: '飞鸟跌穴',
    type: '吉格',
    description: '天盘丙奇落离九宫，如日中天',
    check: (_h, _e, _s, _g) => false, // 需要宫位信息，在 analysis.ts 中特殊处理
  },
  // ===== 凶格 =====
  {
    name: '大格',
    type: '凶格',
    description: '天盘庚加地盘癸，阻碍重重',
    check: (h, e) => h === '庚' && e === '癸',
  },
  {
    name: '小格',
    type: '凶格',
    description: '天盘庚加地盘壬，小有阻碍',
    check: (h, e) => h === '庚' && e === '壬',
  },
  {
    name: '刑格',
    type: '凶格',
    description: '天盘庚加地盘庚，行事受阻，进退两难',
    check: (h, e) => h === '庚' && e === '庚',
  },
  {
    name: '悖格',
    type: '凶格',
    description: '天盘辛加地盘壬或壬加辛，是非颠倒',
    check: (h, e) => (h === '辛' && e === '壬') || (h === '壬' && e === '辛'),
  },
  {
    name: '飞干格',
    type: '凶格',
    description: '天盘庚加地盘辛，移动奔波',
    check: (h, e) => h === '庚' && e === '辛',
  },
  {
    name: '伏干格',
    type: '凶格',
    description: '天盘辛加地盘庚，隐忍不发',
    check: (h, e) => h === '辛' && e === '庚',
  },
  {
    name: '天网四张',
    type: '凶格',
    description: '天盘辛加地盘己，网罗密布',
    check: (h, e) => h === '辛' && e === '己',
  },
  {
    name: '青龙逃走',
    type: '凶格',
    description: '天盘丙加地盘辛，贵人远遁',
    check: (h, e) => h === '丙' && e === '辛',
  },
  {
    name: '白虎猖狂',
    type: '凶格',
    description: '天盘辛加地盘丙，小人得势',
    check: (h, e) => h === '辛' && e === '丙',
  },
  {
    name: '螣蛇夭矫',
    type: '凶格',
    description: '天盘丁加地盘癸，虚惊怪异',
    check: (h, e) => h === '丁' && e === '癸',
  },
  {
    name: '朱雀投江',
    type: '凶格',
    description: '天盘丁加地盘壬，文书落空',
    check: (h, e) => h === '丁' && e === '壬',
  },
  {
    name: '太白入荧',
    type: '凶格',
    description: '天盘庚加地盘丙，客不利',
    check: (h, e) => h === '庚' && e === '丙',
  },
  {
    name: '荧入太白',
    type: '凶格',
    description: '天盘丙加地盘庚，主不利',
    check: (h, e) => h === '丙' && e === '庚',
  },
];
