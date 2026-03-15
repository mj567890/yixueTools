/**
 * 梅花易数 —— 八卦常量、五行生克、爻位含义
 */
import type { Trigram } from './types';

// ============================================================
//  八卦映射表（先天数 1-8）
//  lines: [初爻, 二爻, 三爻]（自下而上），true = 阳爻
// ============================================================
export const TRIGRAMS: Record<number, Trigram> = {
  1: { number: 1, name: '乾', element: '金', nature: '天', lines: [true,  true,  true],  direction: '西北', bodyPart: '头' },
  2: { number: 2, name: '兑', element: '金', nature: '泽', lines: [true,  true,  false], direction: '西',   bodyPart: '口' },
  3: { number: 3, name: '离', element: '火', nature: '火', lines: [true,  false, true],  direction: '南',   bodyPart: '目' },
  4: { number: 4, name: '震', element: '木', nature: '雷', lines: [true,  false, false], direction: '东',   bodyPart: '足' },
  5: { number: 5, name: '巽', element: '木', nature: '风', lines: [false, true,  true],  direction: '东南', bodyPart: '股' },
  6: { number: 6, name: '坎', element: '水', nature: '水', lines: [false, true,  false], direction: '北',   bodyPart: '耳' },
  7: { number: 7, name: '艮', element: '土', nature: '山', lines: [false, false, true],  direction: '东北', bodyPart: '手' },
  8: { number: 8, name: '坤', element: '土', nature: '地', lines: [false, false, false], direction: '西南', bodyPart: '腹' },
};

/** 通过卦名反查先天数 */
export const TRIGRAM_NAME_TO_NUMBER: Record<string, number> = {
  '乾': 1, '兑': 2, '离': 3, '震': 4, '巽': 5, '坎': 6, '艮': 7, '坤': 8,
};

// ============================================================
//  地支→序号（梅花时间起卦用：子=1,丑=2,...,亥=12）
// ============================================================
export const ZHI_TO_NUMBER: Record<string, number> = {
  '子': 1, '丑': 2, '寅': 3, '卯': 4, '辰': 5, '巳': 6,
  '午': 7, '未': 8, '申': 9, '酉': 10, '戌': 11, '亥': 12,
};

// ============================================================
//  五行相生相克
//  WX_SHENG[A] = B 表示 A 生 B
//  WX_KE[A] = B   表示 A 克 B
// ============================================================
export const WX_SHENG: Record<string, string> = {
  '金': '水', '水': '木', '木': '火', '火': '土', '土': '金',
};
export const WX_KE: Record<string, string> = {
  '金': '木', '木': '土', '土': '水', '水': '火', '火': '金',
};

/** 五行 → 万物类象（简要） */
export const WX_XIANG: Record<string, { color: string; season: string; organ: string }> = {
  '金': { color: '白',  season: '秋', organ: '肺/大肠' },
  '木': { color: '青',  season: '春', organ: '肝/胆' },
  '水': { color: '黑',  season: '冬', organ: '肾/膀胱' },
  '火': { color: '赤',  season: '夏', organ: '心/小肠' },
  '土': { color: '黄',  season: '四季', organ: '脾/胃' },
};

// ============================================================
//  爻位名称 & 含义
// ============================================================
export const YAO_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'] as const;

export const YAO_POSITION_MEANING: Record<number, string> = {
  1: '事之起始，基础根基，尚未展开',
  2: '内部环境，人际关系，蓄势待发',
  3: '内外交接，转折关口，进退抉择',
  4: '外部环境，近官近贵，时机初现',
  5: '核心主导，关键力量，事之高潮',
  6: '事之终局，最终走向，盛极而变',
};

// ============================================================
//  八卦万物类象（用于分析引擎的文字生成）
// ============================================================
export const GUA_XIANG: Record<string, string> = {
  '乾': '天、君王、父亲、刚健进取、金玉珍宝',
  '兑': '泽、少女、口舌、喜悦和谐、通商贸易',
  '离': '火、中女、文明、光明美丽、文化艺术',
  '震': '雷、长男、行动、奋发振作、创业开拓',
  '巽': '风、长女、进退、灵活变通、学术教育',
  '坎': '水、中男、陷险、流动变化、智慧谋略',
  '艮': '山、少男、止静、安定守成、房产地产',
  '坤': '地、母亲、柔顺、厚德载物、安稳保守',
};
