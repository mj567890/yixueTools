/**
 * 六爻排盘系统 —— 统一导出
 */

// 核心排盘
export { paipan } from './paipan';

// 分析引擎
export { performAnalysis } from './analysis';

// 起卦方法
export {
  performDivination,
  divinateByTime,
  divinateByCoin,
  divinateByNumber,
  divinateByManual,
  calcCoinResult,
} from './divination';

// 纳甲策略
export { getNaJiaStrategy, assignNaJia, extractTrigrams } from './naJia';

// 卦数据
export {
  ALL_HEXAGRAMS,
  PALACE_HEXAGRAMS,
  HEXAGRAM_LOOKUP,
  HEXAGRAM_BY_NAME,
  findHexagram,
  findHexagramByTrigrams,
  getPalaceHexagram,
  SHI_YING_TABLE,
} from './hexagramData';

// 常量
export {
  NAJIA_GAN, NAJIA_ZHI,
  JING_GUA_NAMES, JING_GUA_LINES, JING_GUA_WUXING,
  LIU_SHEN_ORDER, getLiuShen,
  LIU_QIN_TABLE, getLiuQin,
  ZHI_WUXING,
  calcYaoStrength, getMonthStrength, getDayEffect,
  isXunKong, isYuePo, XUN_KONG_MAP,
  ZHI_CHONG_MAP, ZHI_HE_MAP, ZHI_SAN_HE,
  YAO_POSITION_NAMES, getYaoPositionName,
  SCENARIO_YONG_SHEN, SCENARIO_NAMES,
  WX_COLORS, SHEN_COLORS, LIUQIN_COLORS,
  COIN_TOTAL_TO_YAO, COIN_FACE_VALUE,
  isYangYao, isMovingYao, getChangedYang,
  TIAN_GAN, DI_ZHI, WU_XING_MAP, WX_SHENG, WX_KE,
} from './constants';

// 类型
export type {
  WuXing, YaoType, SixRelative, SixSpirit,
  SchoolType, UIMode, DivinationMethod, CoinFace, ScenarioType,
  YaoStrength, YaoLine, FuShen, CoinTossResult,
  BaGongHexagram, LiuYaoConfig, LiuYaoResult,
  YongShenInfo, ShenInfo, AnalysisVerdict,
  ScenarioAnalysis, LiuYaoAnalysis,
} from './types';
