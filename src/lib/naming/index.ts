/**
 * 起名测名 —— 统一导出
 */

// 类型
export type {
  CharEntry, WuGeResult, WuGeGrid, SanCaiResult, BaziMatchResult,
  CharAnalysisResult, CharDetailAnalysis, ScoreBreakdown, ScoreWeights,
  NamingConfig, NameCandidate, NamingAnalysis, NamingVerdict,
  KnowledgeArticle, WuXing, UIMode, Gender, Auspice, NameStyle, PingZe,
} from './types';

// 常量
export {
  SHULI_TABLE, SANCAI_TABLE, RADICAL_WUXING, COMPOUND_SURNAMES,
  HOMOPHONE_BLACKLIST, KNOWLEDGE_ARTICLES,
  getWuxingByNumber, normalizeShuli, isCompoundSurname, checkHomophone,
  wuxingRelation, inferYongShen,
  WUXING_SHENG, WUXING_KE,
} from './constants';

// 字库
export {
  getCharEntry, getKangxiStrokes, getCharsByWuxing,
  getCharsByStrokes, getCharsByWuxingAndStrokes,
  filterByGender, excludeChars, getDatabaseStats,
} from './charDatabase';

// 五格
export { calcWuGe, scoreWuGe, getWuGeWuxing } from './wugeCalc';

// 三才
export { calcSanCai, scoreSanCai } from './sancaiCalc';

// 字义分析
export { analyzeChars, scoreCharAnalysis } from './charAnalysis';

// 八字匹配
export { matchBazi, scoreBaziMatch } from './baziMatch';

// 评分
export { calcTotalScore, getScoreLevel, getScoreTags, DEFAULT_WEIGHTS } from './scoring';

// 起名引擎
export { generateNames } from './nameGenerator';

// 测名分析
export { analyzeNaming } from './analysis';
