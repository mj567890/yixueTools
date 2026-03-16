/**
 * 六爻排盘系统 —— 常量表
 *
 * 纳甲天干地支、六神、六亲、旺衰等核心查表数据
 * 主要依据：京房纳甲法（《增删卜易》《卜筮正宗》）
 */

import type { WuXing, SixRelative, SixSpirit, YaoStrength } from './types';
import { TIAN_GAN, DI_ZHI, WU_XING_MAP } from '../lunar';
import { WX_SHENG, WX_KE } from '../meihua/constants';

// ==================== 经卦基础 ====================

/** 八经卦名 (先天八卦序) */
export const JING_GUA_NAMES = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'] as const;

/** 经卦三爻 (自下而上: [初爻,二爻,三爻], true=阳) */
export const JING_GUA_LINES: Record<string, [boolean, boolean, boolean]> = {
  '乾': [true,  true,  true],
  '兑': [true,  true,  false],
  '离': [true,  false, true],
  '震': [true,  false, false],
  '巽': [false, true,  true],
  '坎': [false, true,  false],
  '艮': [false, false, true],
  '坤': [false, false, false],
};

/** 经卦二进制 → 卦名 反查 ('111'→'乾') */
export const JING_GUA_BINARY: Record<string, string> = {
  '111': '乾', '110': '兑', '101': '离', '100': '震',
  '011': '巽', '010': '坎', '001': '艮', '000': '坤',
};

/** 经卦五行 */
export const JING_GUA_WUXING: Record<string, WuXing> = {
  '乾': '金', '兑': '金', '离': '火', '震': '木',
  '巽': '木', '坎': '水', '艮': '土', '坤': '土',
};

// ==================== 纳甲天干 ====================

/**
 * 京房纳甲天干表
 * 每经卦对应: [内卦天干, 外卦天干]
 * 乾甲壬，坤乙癸，震庚庚，巽辛辛，坎戊戊，离己己，艮丙丙，兑丁丁
 */
export const NAJIA_GAN: Record<string, [string, string]> = {
  '乾': ['甲', '壬'],
  '坤': ['乙', '癸'],
  '震': ['庚', '庚'],
  '巽': ['辛', '辛'],
  '坎': ['戊', '戊'],
  '离': ['己', '己'],
  '艮': ['丙', '丙'],
  '兑': ['丁', '丁'],
};

// ==================== 纳甲地支 ====================

/**
 * 京房纳甲地支表
 * 每经卦对应 6 爻地支: [初爻, 二爻, 三爻, 四爻, 五爻, 上爻]
 * 内卦 = 位1-3, 外卦 = 位4-6
 *
 * 阳卦(乾震坎艮)顺排, 阴卦(坤巽离兑)逆排
 * 乾: 子寅辰 午申戌    坤: 未巳卯 丑亥酉
 * 震: 子寅辰 午申戌    巽: 丑亥酉 未巳卯
 * 坎: 寅辰午 申戌子    离: 卯丑亥 酉未巳
 * 艮: 辰午申 戌子寅    兑: 巳卯丑 亥酉未
 */
export const NAJIA_ZHI: Record<string, [string, string, string, string, string, string]> = {
  '乾': ['子', '寅', '辰', '午', '申', '戌'],
  '坤': ['未', '巳', '卯', '丑', '亥', '酉'],
  '震': ['子', '寅', '辰', '午', '申', '戌'],
  '巽': ['丑', '亥', '酉', '未', '巳', '卯'],
  '坎': ['寅', '辰', '午', '申', '戌', '子'],
  '离': ['卯', '丑', '亥', '酉', '未', '巳'],
  '艮': ['辰', '午', '申', '戌', '子', '寅'],
  '兑': ['巳', '卯', '丑', '亥', '酉', '未'],
};

// ==================== 六神 ====================

/** 六神固定顺序 (从初爻开始依次排列) */
export const LIU_SHEN_ORDER: SixSpirit[] = [
  '青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武',
];

/**
 * 日干 → 初爻六神 起始索引 (在 LIU_SHEN_ORDER 中的下标)
 * 甲乙→青龙(0), 丙丁→朱雀(1), 戊→勾陈(2), 己→螣蛇(3), 庚辛→白虎(4), 壬癸→玄武(5)
 */
export const LIU_SHEN_START: Record<string, number> = {
  '甲': 0, '乙': 0,
  '丙': 1, '丁': 1,
  '戊': 2,
  '己': 3,
  '庚': 4, '辛': 4,
  '壬': 5, '癸': 5,
};

/**
 * 根据日干获取六爻的六神分配
 * @returns 6 个六神 [初爻..上爻]
 */
export function getLiuShen(dayGan: string): SixSpirit[] {
  const start = LIU_SHEN_START[dayGan] ?? 0;
  return Array.from({ length: 6 }, (_, i) => LIU_SHEN_ORDER[(start + i) % 6]);
}

// ==================== 六亲 ====================

/**
 * 根据宫五行和爻五行推导六亲
 *
 * 同我 → 兄弟
 * 生我 → 父母 (爻五行生宫五行)
 * 我生 → 子孙 (宫五行生爻五行)
 * 克我 → 官鬼 (爻五行克宫五行)
 * 我克 → 妻财 (宫五行克爻五行)
 */
export function getLiuQin(palaceWuXing: WuXing, yaoWuXing: WuXing): SixRelative {
  if (palaceWuXing === yaoWuXing) return '兄弟';
  if (WX_SHENG[yaoWuXing] === palaceWuXing) return '父母';
  if (WX_SHENG[palaceWuXing] === yaoWuXing) return '子孙';
  if (WX_KE[yaoWuXing] === palaceWuXing) return '官鬼';
  if (WX_KE[palaceWuXing] === yaoWuXing) return '妻财';
  return '兄弟'; // fallback (理论上不会走到这里)
}

/**
 * 六亲二维查表 (预计算, 提升性能)
 * LIU_QIN_TABLE[宫五行][爻五行] → 六亲
 */
export const LIU_QIN_TABLE: Record<WuXing, Record<WuXing, SixRelative>> = (() => {
  const wuXings: WuXing[] = ['木', '火', '土', '金', '水'];
  const table = {} as Record<WuXing, Record<WuXing, SixRelative>>;
  for (const palace of wuXings) {
    table[palace] = {} as Record<WuXing, SixRelative>;
    for (const yao of wuXings) {
      table[palace][yao] = getLiuQin(palace, yao);
    }
  }
  return table;
})();

// ==================== 地支五行 ====================

/** 地支 → 五行 (从 WU_XING_MAP 中提取地支部分) */
export const ZHI_WUXING: Record<string, WuXing> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// ==================== 旺衰 ====================

/**
 * 月建旺衰表
 * 月支 → 各五行的旺衰等级
 * 旺 > 相 > 休 > 囚 > 死
 */
type StrengthLevel = '旺' | '相' | '休' | '囚' | '死';

const MONTH_WX_STRENGTH: Record<string, Record<WuXing, StrengthLevel>> = {
  // 寅卯月 — 木旺
  '寅': { '木': '旺', '火': '相', '水': '休', '金': '囚', '土': '死' },
  '卯': { '木': '旺', '火': '相', '水': '休', '金': '囚', '土': '死' },
  // 巳午月 — 火旺
  '巳': { '火': '旺', '土': '相', '木': '休', '水': '囚', '金': '死' },
  '午': { '火': '旺', '土': '相', '木': '休', '水': '囚', '金': '死' },
  // 申酉月 — 金旺
  '申': { '金': '旺', '水': '相', '土': '休', '火': '囚', '木': '死' },
  '酉': { '金': '旺', '水': '相', '土': '休', '火': '囚', '木': '死' },
  // 亥子月 — 水旺
  '亥': { '水': '旺', '木': '相', '金': '休', '土': '囚', '火': '死' },
  '子': { '水': '旺', '木': '相', '金': '休', '土': '囚', '火': '死' },
  // 辰戌丑未月 — 土旺
  '辰': { '土': '旺', '金': '相', '火': '休', '木': '囚', '水': '死' },
  '戌': { '土': '旺', '金': '相', '火': '休', '木': '囚', '水': '死' },
  '丑': { '土': '旺', '金': '相', '火': '休', '木': '囚', '水': '死' },
  '未': { '土': '旺', '金': '相', '火': '休', '木': '囚', '水': '死' },
};

/**
 * 获取某爻在月建中的旺衰
 */
export function getMonthStrength(monthZhi: string, yaoWuXing: WuXing): StrengthLevel {
  return MONTH_WX_STRENGTH[monthZhi]?.[yaoWuXing] ?? '休';
}

/**
 * 获取日辰对爻的作用描述
 *
 * 日辰地支与爻地支的关系:
 * - 五行相同且地支相同 → 日比(日扶)
 * - 日辰生爻 → 日生
 * - 日辰克爻 → 日克
 * - 爻生日辰 → 日泄
 * - 爻克日辰 → 日耗
 * - 地支六冲 → 日冲 (暗动/月破依赖旺衰)
 * - 地支六合 → 日合
 */
export function getDayEffect(dayZhi: string, yaoZhi: string): string {
  const dayWx = ZHI_WUXING[dayZhi];
  const yaoWx = ZHI_WUXING[yaoZhi];

  const effects: string[] = [];

  // 六冲判断
  if (ZHI_CHONG_MAP[dayZhi] === yaoZhi) {
    effects.push('日冲');
  }
  // 六合判断
  if (ZHI_HE_MAP[dayZhi] === yaoZhi) {
    effects.push('日合');
  }
  // 五行生克
  if (dayWx === yaoWx) {
    effects.push('日扶');
  } else if (WX_SHENG[dayWx] === yaoWx) {
    effects.push('日生');
  } else if (WX_KE[dayWx] === yaoWx) {
    effects.push('日克');
  } else if (WX_SHENG[yaoWx] === dayWx) {
    effects.push('日泄');
  } else if (WX_KE[yaoWx] === dayWx) {
    effects.push('日耗');
  }

  return effects.join('、') || '无';
}

/**
 * 综合计算爻的旺衰
 */
export function calcYaoStrength(monthZhi: string, dayZhi: string, yaoZhi: string): YaoStrength {
  const yaoWx = ZHI_WUXING[yaoZhi];
  return {
    monthRelation: getMonthStrength(monthZhi, yaoWx),
    dayEffect: getDayEffect(dayZhi, yaoZhi),
  };
}

// ==================== 旬空 ====================

/**
 * 六甲旬空表
 * 日干支 → 旬空地支对
 */
const XUN_KONG_DATA: Array<{ head: string; voidPair: [string, string] }> = [
  { head: '甲子', voidPair: ['戌', '亥'] },
  { head: '甲戌', voidPair: ['申', '酉'] },
  { head: '甲申', voidPair: ['午', '未'] },
  { head: '甲午', voidPair: ['辰', '巳'] },
  { head: '甲辰', voidPair: ['寅', '卯'] },
  { head: '甲寅', voidPair: ['子', '丑'] },
];

/** 日干支 → 旬空地支对 */
export const XUN_KONG_MAP: Record<string, [string, string]> = (() => {
  const map: Record<string, [string, string]> = {};
  for (const xun of XUN_KONG_DATA) {
    const ganStart = TIAN_GAN.indexOf(xun.head[0]);
    const zhiStart = DI_ZHI.indexOf(xun.head[1]);
    for (let i = 0; i < 10; i++) {
      const gz = TIAN_GAN[(ganStart + i) % 10] + DI_ZHI[(zhiStart + i) % 12];
      map[gz] = xun.voidPair;
    }
  }
  return map;
})();

/**
 * 判断某地支是否旬空
 */
export function isXunKong(dayGanZhi: string, zhi: string): boolean {
  const pair = XUN_KONG_MAP[dayGanZhi];
  if (!pair) return false;
  return pair[0] === zhi || pair[1] === zhi;
}

// ==================== 月破 ====================

/**
 * 判断某地支是否月破
 * 月破 = 月建所冲之地支
 */
export function isYuePo(monthZhi: string, yaoZhi: string): boolean {
  return ZHI_CHONG_MAP[monthZhi] === yaoZhi;
}

// ==================== 地支六冲六合 ====================

/** 地支六冲 */
export const ZHI_CHONG_MAP: Record<string, string> = {
  '子': '午', '丑': '未', '寅': '申', '卯': '酉', '辰': '戌', '巳': '亥',
  '午': '子', '未': '丑', '申': '寅', '酉': '卯', '戌': '辰', '亥': '巳',
};

/** 地支六合 */
export const ZHI_HE_MAP: Record<string, string> = {
  '子': '丑', '丑': '子', '寅': '亥', '卯': '戌', '辰': '酉', '巳': '申',
  '午': '未', '未': '午', '申': '巳', '酉': '辰', '戌': '卯', '亥': '寅',
};

/** 地支三合局 */
export const ZHI_SAN_HE: Record<string, { group: string[]; wuXing: WuXing }> = {
  '申': { group: ['申', '子', '辰'], wuXing: '水' },
  '子': { group: ['申', '子', '辰'], wuXing: '水' },
  '辰': { group: ['申', '子', '辰'], wuXing: '水' },
  '寅': { group: ['寅', '午', '戌'], wuXing: '火' },
  '午': { group: ['寅', '午', '戌'], wuXing: '火' },
  '戌': { group: ['寅', '午', '戌'], wuXing: '火' },
  '亥': { group: ['亥', '卯', '未'], wuXing: '木' },
  '卯': { group: ['亥', '卯', '未'], wuXing: '木' },
  '未': { group: ['亥', '卯', '未'], wuXing: '木' },
  '巳': { group: ['巳', '酉', '丑'], wuXing: '金' },
  '酉': { group: ['巳', '酉', '丑'], wuXing: '金' },
  '丑': { group: ['巳', '酉', '丑'], wuXing: '金' },
};

// ==================== 爻位 ====================

/** 爻位名称 [初爻..上爻] */
export const YAO_POSITION_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'] as const;

/** 爻位对应的传统名称 (阳爻/阴爻 + 位置) */
export function getYaoPositionName(position: number, isYang: boolean): string {
  const yangNames = ['初九', '九二', '九三', '九四', '九五', '上九'];
  const yinNames  = ['初六', '六二', '六三', '六四', '六五', '上六'];
  const idx = position - 1;
  if (idx < 0 || idx > 5) return '';
  return isYang ? yangNames[idx] : yinNames[idx];
}

// ==================== 场景对应用神 ====================

/**
 * 场景 → 用神六亲映射
 * 这是最核心的分析起点
 */
export const SCENARIO_YONG_SHEN: Record<string, SixRelative> = {
  'qiucai':  '妻财',  // 求财 → 用神取妻财
  'wenbing': '官鬼',  // 问病 → 用神取官鬼 (测自己病)
  'kaoshi':  '父母',  // 考试 → 用神取父母 (文书)
  'hunlian': '妻财',  // 婚恋 (男测) → 用神取妻财; 女测取官鬼 (需再判断)
  'shiye':   '官鬼',  // 事业 → 用神取官鬼
  'shiwu':   '妻财',  // 失物 → 用神取妻财
  'guansi':  '官鬼',  // 官司 → 用神取官鬼
  'chuxing': '子孙',  // 出行 → 用神取子孙 (世爻亦参考)
  'zhaizang':'父母',  // 宅葬 → 用神取父母 (宅)
  'qiuqian': '兄弟',  // 杂占 → 默认兄弟 (实际需灵活选取)
};

/** 场景中文名 */
export const SCENARIO_NAMES: Record<string, string> = {
  'qiucai':  '求财',
  'wenbing': '问病',
  'kaoshi':  '考试',
  'hunlian': '婚恋',
  'shiye':   '事业',
  'shiwu':   '失物',
  'guansi':  '官司',
  'chuxing': '出行',
  'zhaizang':'宅葬',
  'qiuqian': '杂占',
};

// ==================== 五行颜色 (UI 用) ====================

/** 五行对应 Tailwind 颜色类名 */
export const WX_COLORS: Record<WuXing, string> = {
  '木': 'text-green-600',
  '火': 'text-red-500',
  '土': 'text-yellow-600',
  '金': 'text-amber-400',
  '水': 'text-blue-500',
};

/** 六神对应 Tailwind 颜色类名 */
export const SHEN_COLORS: Record<SixSpirit, string> = {
  '青龙': 'text-green-600',
  '朱雀': 'text-red-500',
  '勾陈': 'text-yellow-700',
  '螣蛇': 'text-purple-500',
  '白虎': 'text-gray-100',
  '玄武': 'text-blue-800',
};

/** 六亲对应 Tailwind 颜色类名 */
export const LIUQIN_COLORS: Record<SixRelative, string> = {
  '父母': 'text-amber-600',
  '兄弟': 'text-emerald-500',
  '子孙': 'text-teal-500',
  '妻财': 'text-yellow-500',
  '官鬼': 'text-red-600',
};

// ==================== 铜钱数值 → 爻类型 ====================

import type { YaoType, CoinFace } from './types';

/**
 * 铜钱数值映射爻类型
 * 6 = 老阴 (三背), 7 = 少阳 (二背一字), 8 = 少阴 (二字一背), 9 = 老阳 (三字)
 */
export const COIN_TOTAL_TO_YAO: Record<number, YaoType> = {
  6: 'laoYin',
  7: 'shaoYang',
  8: 'shaoYin',
  9: 'laoYang',
};

/** 铜钱面值 (字=阳=3, 背=阴=2) */
export const COIN_FACE_VALUE: Record<CoinFace, number> = {
  'yang': 3,  // 字面 (有字的一面)
  'yin': 2,   // 背面 (无字的一面)
};

/** 爻类型判断：是否阳爻 */
export function isYangYao(yaoType: YaoType): boolean {
  return yaoType === 'laoYang' || yaoType === 'shaoYang';
}

/** 爻类型判断：是否动爻 */
export function isMovingYao(yaoType: YaoType): boolean {
  return yaoType === 'laoYang' || yaoType === 'laoYin';
}

/** 爻变后阴阳：老阳→阴, 老阴→阳 */
export function getChangedYang(yaoType: YaoType): boolean {
  if (yaoType === 'laoYang') return false; // 阳变阴
  if (yaoType === 'laoYin') return true;   // 阴变阳
  return isYangYao(yaoType); // 不动，保持原样
}

// ==================== 导出重复引用的外部常量 ====================

export { TIAN_GAN, DI_ZHI, WU_XING_MAP, WX_SHENG, WX_KE };
