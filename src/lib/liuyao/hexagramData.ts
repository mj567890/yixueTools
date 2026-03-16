/**
 * 六爻排盘系统 —— 八宫六十四卦数据表
 *
 * 按八宫分类，每宫8卦（本宫/一世~五世/游魂/归魂）
 * 含世应位置、上下经卦、六爻阴阳
 *
 * 数据依据：京房八宫纳甲体系
 */

import type { BaGongHexagram, WuXing } from './types';

// ==================== 世应位置规则 ====================

/** 世序名 → [世爻位, 应爻位] */
export const SHI_YING_TABLE: Record<string, [number, number]> = {
  '八纯': [6, 3],
  '一世': [1, 4],
  '二世': [2, 5],
  '三世': [3, 6],
  '四世': [4, 1],
  '五世': [5, 2],
  '游魂': [4, 1],
  '归魂': [3, 6],
};

// ==================== 辅助构建函数 ====================

function h(
  name: string,
  alias: string,
  palace: string,
  palaceWuXing: WuXing,
  sequence: string,
  upperTrigram: string,
  lowerTrigram: string,
  lines: [boolean, boolean, boolean, boolean, boolean, boolean],
): BaGongHexagram {
  const [shi, ying] = SHI_YING_TABLE[sequence];
  return { name, alias, palace, palaceWuXing, sequence, shiPosition: shi, yingPosition: ying, upperTrigram, lowerTrigram, lines };
}

// ==================== 八宫六十四卦 ====================

/** 乾宫 (金) */
const QIAN_GONG: BaGongHexagram[] = [
  h('乾为天',   '乾',   '乾', '金', '八纯', '乾', '乾', [true,  true,  true,  true,  true,  true]),
  h('天风姤',   '姤',   '乾', '金', '一世', '乾', '巽', [false, true,  true,  true,  true,  true]),
  h('天山遁',   '遁',   '乾', '金', '二世', '乾', '艮', [false, false, true,  true,  true,  true]),
  h('天地否',   '否',   '乾', '金', '三世', '乾', '坤', [false, false, false, true,  true,  true]),
  h('风地观',   '观',   '乾', '金', '四世', '巽', '坤', [false, false, false, false, true,  true]),
  h('山地剥',   '剥',   '乾', '金', '五世', '艮', '坤', [false, false, false, false, false, true]),
  h('火地晋',   '晋',   '乾', '金', '游魂', '离', '坤', [false, false, false, true,  false, true]),
  h('火天大有', '大有', '乾', '金', '归魂', '离', '乾', [true,  true,  true,  true,  false, true]),
];

/** 兑宫 (金) */
const DUI_GONG: BaGongHexagram[] = [
  h('兑为泽',   '兑',   '兑', '金', '八纯', '兑', '兑', [true,  true,  false, true,  true,  false]),
  h('泽水困',   '困',   '兑', '金', '一世', '兑', '坎', [false, true,  false, true,  true,  false]),
  h('泽地萃',   '萃',   '兑', '金', '二世', '兑', '坤', [false, false, false, true,  true,  false]),
  h('泽山咸',   '咸',   '兑', '金', '三世', '兑', '艮', [false, false, true,  true,  true,  false]),
  h('水山蹇',   '蹇',   '兑', '金', '四世', '坎', '艮', [false, false, true,  false, true,  false]),
  h('地山谦',   '谦',   '兑', '金', '五世', '坤', '艮', [false, false, true,  false, false, false]),
  h('雷山小过', '小过', '兑', '金', '游魂', '震', '艮', [false, false, true,  true,  false, false]),
  h('雷泽归妹', '归妹', '兑', '金', '归魂', '震', '兑', [true,  true,  false, true,  false, false]),
];

/** 离宫 (火) */
const LI_GONG: BaGongHexagram[] = [
  h('离为火',   '离',   '离', '火', '八纯', '离', '离', [true,  false, true,  true,  false, true]),
  h('火山旅',   '旅',   '离', '火', '一世', '离', '艮', [false, false, true,  true,  false, true]),
  h('火风鼎',   '鼎',   '离', '火', '二世', '离', '巽', [false, true,  true,  true,  false, true]),
  h('火水未济', '未济', '离', '火', '三世', '离', '坎', [false, true,  false, true,  false, true]),
  h('山水蒙',   '蒙',   '离', '火', '四世', '艮', '坎', [false, true,  false, false, false, true]),
  h('风水涣',   '涣',   '离', '火', '五世', '巽', '坎', [false, true,  false, false, true,  true]),
  h('天水讼',   '讼',   '离', '火', '游魂', '乾', '坎', [false, true,  false, true,  true,  true]),
  h('天火同人', '同人', '离', '火', '归魂', '乾', '离', [true,  false, true,  true,  true,  true]),
];

/** 震宫 (木) */
const ZHEN_GONG: BaGongHexagram[] = [
  h('震为雷',   '震',   '震', '木', '八纯', '震', '震', [true,  false, false, true,  false, false]),
  h('雷地豫',   '豫',   '震', '木', '一世', '震', '坤', [false, false, false, true,  false, false]),
  h('雷水解',   '解',   '震', '木', '二世', '震', '坎', [false, true,  false, true,  false, false]),
  h('雷风恒',   '恒',   '震', '木', '三世', '震', '巽', [false, true,  true,  true,  false, false]),
  h('地风升',   '升',   '震', '木', '四世', '坤', '巽', [false, true,  true,  false, false, false]),
  h('水风井',   '井',   '震', '木', '五世', '坎', '巽', [false, true,  true,  false, true,  false]),
  h('泽风大过', '大过', '震', '木', '游魂', '兑', '巽', [false, true,  true,  true,  true,  false]),
  h('泽雷随',   '随',   '震', '木', '归魂', '兑', '震', [true,  false, false, true,  true,  false]),
];

/** 巽宫 (木) */
const XUN_GONG: BaGongHexagram[] = [
  h('巽为风',   '巽',   '巽', '木', '八纯', '巽', '巽', [false, true,  true,  false, true,  true]),
  h('风天小畜', '小畜', '巽', '木', '一世', '巽', '乾', [true,  true,  true,  false, true,  true]),
  h('风火家人', '家人', '巽', '木', '二世', '巽', '离', [true,  false, true,  false, true,  true]),
  h('风雷益',   '益',   '巽', '木', '三世', '巽', '震', [true,  false, false, false, true,  true]),
  h('天雷无妄', '无妄', '巽', '木', '四世', '乾', '震', [true,  false, false, true,  true,  true]),
  h('火雷噬嗑', '噬嗑', '巽', '木', '五世', '离', '震', [true,  false, false, true,  false, true]),
  h('山雷颐',   '颐',   '巽', '木', '游魂', '艮', '震', [true,  false, false, false, false, true]),
  h('山风蛊',   '蛊',   '巽', '木', '归魂', '艮', '巽', [false, true,  true,  false, false, true]),
];

/** 坎宫 (水) */
const KAN_GONG: BaGongHexagram[] = [
  h('坎为水',   '坎',   '坎', '水', '八纯', '坎', '坎', [false, true,  false, false, true,  false]),
  h('水泽节',   '节',   '坎', '水', '一世', '坎', '兑', [true,  true,  false, false, true,  false]),
  h('水雷屯',   '屯',   '坎', '水', '二世', '坎', '震', [true,  false, false, false, true,  false]),
  h('水火既济', '既济', '坎', '水', '三世', '坎', '离', [true,  false, true,  false, true,  false]),
  h('泽火革',   '革',   '坎', '水', '四世', '兑', '离', [true,  false, true,  true,  true,  false]),
  h('雷火丰',   '丰',   '坎', '水', '五世', '震', '离', [true,  false, true,  true,  false, false]),
  h('地火明夷', '明夷', '坎', '水', '游魂', '坤', '离', [true,  false, true,  false, false, false]),
  h('地水师',   '师',   '坎', '水', '归魂', '坤', '坎', [false, true,  false, false, false, false]),
];

/** 艮宫 (土) */
const GEN_GONG: BaGongHexagram[] = [
  h('艮为山',   '艮',   '艮', '土', '八纯', '艮', '艮', [false, false, true,  false, false, true]),
  h('山火贲',   '贲',   '艮', '土', '一世', '艮', '离', [true,  false, true,  false, false, true]),
  h('山天大畜', '大畜', '艮', '土', '二世', '艮', '乾', [true,  true,  true,  false, false, true]),
  h('山泽损',   '损',   '艮', '土', '三世', '艮', '兑', [true,  true,  false, false, false, true]),
  h('火泽睽',   '睽',   '艮', '土', '四世', '离', '兑', [true,  true,  false, true,  false, true]),
  h('天泽履',   '履',   '艮', '土', '五世', '乾', '兑', [true,  true,  false, true,  true,  true]),
  h('风泽中孚', '中孚', '艮', '土', '游魂', '巽', '兑', [true,  true,  false, false, true,  true]),
  h('风山渐',   '渐',   '艮', '土', '归魂', '巽', '艮', [false, false, true,  false, true,  true]),
];

/** 坤宫 (土) */
const KUN_GONG: BaGongHexagram[] = [
  h('坤为地',   '坤',   '坤', '土', '八纯', '坤', '坤', [false, false, false, false, false, false]),
  h('地雷复',   '复',   '坤', '土', '一世', '坤', '震', [true,  false, false, false, false, false]),
  h('地泽临',   '临',   '坤', '土', '二世', '坤', '兑', [true,  true,  false, false, false, false]),
  h('地天泰',   '泰',   '坤', '土', '三世', '坤', '乾', [true,  true,  true,  false, false, false]),
  h('雷天大壮', '大壮', '坤', '土', '四世', '震', '乾', [true,  true,  true,  true,  false, false]),
  h('泽天夬',   '夬',   '坤', '土', '五世', '兑', '乾', [true,  true,  true,  true,  true,  false]),
  h('水天需',   '需',   '坤', '土', '游魂', '坎', '乾', [true,  true,  true,  false, true,  false]),
  h('水地比',   '比',   '坤', '土', '归魂', '坎', '坤', [false, false, false, false, true,  false]),
];

// ==================== 统一64卦数组 ====================

/** 八宫全部64卦 (按宫序排列) */
export const ALL_HEXAGRAMS: BaGongHexagram[] = [
  ...QIAN_GONG, ...DUI_GONG, ...LI_GONG, ...ZHEN_GONG,
  ...XUN_GONG,  ...KAN_GONG, ...GEN_GONG, ...KUN_GONG,
];

/** 按宫分组 */
export const PALACE_HEXAGRAMS: Record<string, BaGongHexagram[]> = {
  '乾': QIAN_GONG,
  '兑': DUI_GONG,
  '离': LI_GONG,
  '震': ZHEN_GONG,
  '巽': XUN_GONG,
  '坎': KAN_GONG,
  '艮': GEN_GONG,
  '坤': KUN_GONG,
};

// ==================== 反查表 ====================

/**
 * 六爻二进制 → 卦 反查表
 * key = 6位字符串, '1'=阳 '0'=阴, 从初爻到上爻
 * 例: 乾为天 = '111111', 坤为地 = '000000'
 */
export const HEXAGRAM_LOOKUP: Record<string, BaGongHexagram> = (() => {
  const map: Record<string, BaGongHexagram> = {};
  for (const gua of ALL_HEXAGRAMS) {
    const key = gua.lines.map(l => l ? '1' : '0').join('');
    map[key] = gua;
  }
  return map;
})();

/**
 * 卦名 → 卦数据 反查表
 */
export const HEXAGRAM_BY_NAME: Record<string, BaGongHexagram> = (() => {
  const map: Record<string, BaGongHexagram> = {};
  for (const gua of ALL_HEXAGRAMS) {
    map[gua.name] = gua;
    map[gua.alias] = gua; // 别名也能查
  }
  return map;
})();

// ==================== 工具函数 ====================

/**
 * 根据六爻阴阳查找卦
 * @param lines 六爻 [初爻..上爻], true=阳
 */
export function findHexagram(lines: boolean[]): BaGongHexagram | undefined {
  if (lines.length !== 6) return undefined;
  const key = lines.map(l => l ? '1' : '0').join('');
  return HEXAGRAM_LOOKUP[key];
}

/**
 * 根据上下经卦名查找卦
 * @param upper 上卦名 (如 "乾")
 * @param lower 下卦名 (如 "坤")
 */
export function findHexagramByTrigrams(upper: string, lower: string): BaGongHexagram | undefined {
  return ALL_HEXAGRAMS.find(g => g.upperTrigram === upper && g.lowerTrigram === lower);
}

/**
 * 获取某卦所在宫的本宫卦 (八纯卦)
 * 用于伏神计算
 */
export function getPalaceHexagram(palaceName: string): BaGongHexagram | undefined {
  const list = PALACE_HEXAGRAMS[palaceName];
  return list?.[0]; // 第一个就是八纯卦
}
