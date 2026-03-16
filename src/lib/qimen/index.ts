/**
 * 奇门遁甲 —— 统一导出入口
 */

// 类型
export type {
  WuXing, PalaceId, PalaceInfo, NineStar, EightGate, Spirit,
  PalaceState, QimenConfig, TimeElements, JuInfo, ZhiFuInfo,
  QimenResult, SwapAction, PatternMatch, QimenAnalysis,
} from './types';

// 常量
export {
  PALACE_INFO, NINE_STARS, EIGHT_GATES, STAR_BY_PALACE, GATE_BY_PALACE,
  SPIRITS_YANG, SPIRITS_YIN, STEM_SEQUENCE,
  FORWARD_PALACE_ORDER, BACKWARD_PALACE_ORDER,
  JU_TABLE, JIEQI_ORDER, XUN_SHOU_MAP, MA_STAR_MAP,
  BRANCH_TO_PALACE, GAN_WU_XING, WX_SHENG, WX_KE, OPPOSITE_PALACE,
  TIAN_GAN, DI_ZHI, PATTERN_DEFS,
  // 王凤麟阴盘专属常量
  YUAN_DAN_EARTH, STEM_TO_PALACE, SPIRITS_YINPAN,
  STAR_MEANINGS, GATE_MEANINGS, SPIRIT_MEANINGS, GAN_MEANINGS,
} from './constants';

// 九宫工具
export {
  getPalaceSequence, getOffsetBetween, getOppositePalace, branchToPalace, getTargetPalace,
} from './jiuGong';

// 时间计算
export { extractTimeElements, determineJu } from './timeCalc';

// 排盘核心（阳盘：转盘/飞盘）
export { calculateQimen } from './panCalc';

// 阴盘排盘核心（王凤麟体系）
export { calculateYinPan } from './yinPanCalc';

// 阴盘专属（暗干/隐干/移星换斗）
export {
  calculateDarkStems, calculateHiddenStems, applyYinPanStems, applyStarSwap,
} from './yinPan';

// 真太阳时修正
export { toTrueSolarTime, type TrueSolarTimeResult } from './trueSolarTime';

// 城市经纬度数据库
export { CITY_DATABASE, type CityInfo } from './cityDatabase';

// 格局分析
export {
  detectPatterns, generateSummary, generateTips, performQimenAnalysis,
} from './analysis';

// ==================== 阳盘奇门遁甲 ====================

// 阳盘类型
export type {
  JiGongType, YangpanConfig, YangpanJuResult, YangpanPalaceState,
  YangpanPaiPanResult, ScenarioType, YangpanPalaceAnalysis,
  ScenarioResult, YangpanAnalysisResult,
} from './types';

// 阳盘定局
export { chaiBuJu, zhiRunJu, maoShanJu, determineYangpanJu } from './yangpanJuCalc';

// 阳盘排盘
export { calculateYangpan } from './yangpanPipeline';

// 阳盘分析
export { analyzeYangpan } from './yangpanAnalysis';
