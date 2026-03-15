/**
 * 梅花易数 —— 统一导出入口
 */

// 类型
export type {
  Trigram, Hexagram, MovingLineInfo, DivinationMethod, DivinationResult,
  StrokeDetail, TiYongRelation, TiYongType, VerdictItem, VerdictLevel, MeihuaAnalysis,
} from './types';

// 常量
export { TRIGRAMS, ZHI_TO_NUMBER, YAO_NAMES, YAO_POSITION_MEANING, GUA_XIANG, WX_SHENG, WX_KE, WX_XIANG } from './constants';

// 卦象数据
export { HEXAGRAM_TABLE } from './hexagrams';

// 笔画
export { getStrokeCount, getTotalStrokes, KANGXI_STROKES } from './kangxiStrokes';

// 起卦
export {
  divinateByTime, divinateByNumber, divinateByText,
  generateRandomNumbers,
  numberToTrigram, numberToMovingLine,
  buildHexagram, buildChangedHexagram, buildMutualHexagram,
  buildReversedHexagram, buildFlippedHexagram,
} from './divination';

// 分析
export {
  analyzeTiYong, interpretMovingLine, generateVerdicts,
  generateKeyTips, performAnalysis,
} from './analysis';
