/**
 * 太乙神数 —— 统一导出
 */

// 类型
export type {
  TaiyiSchool, CalcType, UIMode, TaiyiPalaceId, ScenarioType,
  SpiritName, PatternKind, WuXing,
  TaiyiConfig, GanZhiSet, JiNianResult,
  SpiritDef, SpiritPosition,
  PalaceInfo, TaiyiPalaceState,
  GeneralInfo, SanJi, WuFu, SiShen, YangJiuBaiLiu,
  TaiyiResult,
  TaiyiPattern, HostGuestResult, PalaceAnalysis,
  ScenarioResult, TaiyiVerdict, TaiyiAnalysis,
  ClassicalCase, KnowledgeTerm,
} from './types';

// 排盘核心
export { calculateTaiyi } from './paipan';

// 分析引擎
export { analyzeTaiyi } from './analysis';

// 策略
export { getTaiyiStrategy } from './schools';
export type { TaiyiSchoolStrategy } from './schools';

// 案例库
export {
  CLASSICAL_CASES,
  filterCasesByTag, filterCasesByDynasty, filterCasesByCalcType,
  searchCases, getAllTags, getAllDynasties,
} from './caseLibrary';

// 常量
export {
  TAIYI_PALACE_INFO, SIXTEEN_SPIRITS,
  TAIYI_PATTERN_DEFS, SCENARIO_CONFIGS,
  KNOWLEDGE_TERMS, PALACE_GRID_LAYOUT,
  AUSPICIOUS_PALACES, INAUSPICIOUS_PALACES, NEUTRAL_PALACES,
} from './constants';
