/**
 * 起名测名 —— TypeScript 完整类型系统
 * 结合五格数理、三才配置、生辰八字
 */

/* ===== 基础联合类型 ===== */

/** 五行 */
export type WuXing = '木' | '火' | '土' | '金' | '水';

/** UI 模式 */
export type UIMode = 'beginner' | 'professional';

/** 性别 */
export type Gender = 'male' | 'female';

/** 吉凶 */
export type Auspice = '吉' | '半吉' | '凶';

/** 名字风格 */
export type NameStyle = 'classic' | 'elegant' | 'strong' | 'nature' | 'literary' | 'modern';

/** 平仄 */
export type PingZe = '平' | '仄';

/* ===== 字库条目 ===== */

/** 字库单字条目 */
export interface CharEntry {
  /** 汉字 */
  char: string;
  /** 康熙笔画数 */
  kangxiStrokes: number;
  /** 五行属性 */
  wuxing: WuXing;
  /** 拼音（含声调标记） */
  pinyin: string;
  /** 声调 1-4 */
  tone: 1 | 2 | 3 | 4;
  /** 平仄 */
  pingZe: PingZe;
  /** 偏旁部首 */
  radical: string;
  /** 简要字义 */
  meaning: string;
  /** 取名常用度 */
  nameFrequency: 'common' | 'moderate' | 'rare';
  /** 性别倾向 */
  genderHint: 'male' | 'female' | 'neutral';
}

/* ===== 五格数理 ===== */

/** 单格详情 */
export interface WuGeGrid {
  /** 格名 */
  name: string;
  /** 数理值 */
  number: number;
  /** 对应五行 */
  wuxing: WuXing;
  /** 吉凶 */
  auspice: Auspice;
  /** 数理分类 (如"首领运") */
  category: string;
  /** 详细解读 */
  interpretation: string;
  /** 白话解读 */
  beginnerText: string;
  /** 专业解读 */
  professionalText: string;
}

/** 五格计算结果 */
export interface WuGeResult {
  tianGe: WuGeGrid;
  renGe: WuGeGrid;
  diGe: WuGeGrid;
  zongGe: WuGeGrid;
  waiGe: WuGeGrid;
  /** 姓笔画数组 */
  surnameStrokes: number[];
  /** 名笔画数组 */
  givenNameStrokes: number[];
  /** 是否复姓 */
  isCompound: boolean;
  /** 推算过程 */
  debugInfo: string;
}

/* ===== 三才配置 ===== */

/** 三才结果 */
export interface SanCaiResult {
  tianCai: WuXing;
  renCai: WuXing;
  diCai: WuXing;
  /** 组合描述 (如"木火土") */
  combination: string;
  /** 综合吉凶 */
  auspice: Auspice;
  /** 评分 0-100 */
  score: number;
  /** 性格描述 */
  personality: string;
  /** 事业描述 */
  career: string;
  /** 健康描述 */
  health: string;
  /** 白话 */
  beginnerText: string;
  /** 专业 */
  professionalText: string;
}

/* ===== 八字匹配 ===== */

/** 八字匹配结果 */
export interface BaziMatchResult {
  /** 八字摘要 */
  baziSummary: string;
  /** 日主 */
  dayMaster: string;
  /** 日主旺衰 */
  dayMasterStrength: string;
  /** 喜用神五行 */
  yongShen: WuXing[];
  /** 忌神五行 */
  jiShen: WuXing[];
  /** 姓名五行分布 */
  nameWuxingDist: Record<string, number>;
  /** 匹配评分 0-100 */
  matchScore: number;
  /** 匹配明细 */
  matchDetails: string[];
  /** 调整建议 */
  suggestions: string[];
  /** 白话 */
  beginnerText: string;
  /** 专业 */
  professionalText: string;
}

/* ===== 字符分析 ===== */

/** 单字详细分析 */
export interface CharDetailAnalysis {
  char: string;
  pinyin: string;
  tone: number;
  pingZe: PingZe;
  strokes: number;
  wuxing: WuXing;
  radical: string;
  meaning: string;
}

/** 字义分析结果 */
export interface CharAnalysisResult {
  /** 逐字分析 */
  chars: CharDetailAnalysis[];
  /** 平仄搭配描述 */
  tonePattern: string;
  /** 音律评分 0-100 */
  toneScore: number;
  /** 谐音提醒 */
  homophoneWarnings: string[];
  /** 整体寓意 */
  overallMeaning: string;
  /** 字形分析 */
  formAnalysis: string;
  /** 字义评分 0-100 */
  meaningScore: number;
}

/* ===== 评分 ===== */

/** 评分权重 */
export interface ScoreWeights {
  bazi: number;
  wuge: number;
  sancai: number;
  phonetics: number;
  meaning: number;
}

/** 分项评分 */
export interface ScoreBreakdown {
  bazi: number;
  wuge: number;
  sancai: number;
  phonetics: number;
  meaning: number;
}

/* ===== 起名配置 ===== */

/** 起名输入配置 */
export interface NamingConfig {
  surname: string;
  gender: Gender;
  birthYear?: number;
  birthMonth?: number;
  birthDay?: number;
  birthHour?: number;
  /** 单名/双名 */
  nameLength: 1 | 2;
  /** 固定第一字 (辈分字) */
  fixedFirstChar?: string;
  /** 固定末字 */
  fixedSecondChar?: string;
  /** 避开的字 */
  avoidChars?: string[];
  /** 风格偏好 */
  stylePreference?: NameStyle[];
  /** 自定义权重 (专业模式) */
  weightConfig?: ScoreWeights;
}

/** 推荐名字 */
export interface NameCandidate {
  fullName: string;
  givenName: string;
  totalScore: number;
  scoreBreakdown: ScoreBreakdown;
  wugeResult: WuGeResult;
  sancaiResult: SanCaiResult;
  charAnalysis: CharAnalysisResult;
  baziMatch?: BaziMatchResult;
  tags: string[];
}

/* ===== 测名分析 ===== */

/** 断语 */
export interface NamingVerdict {
  category: string;
  level: '吉' | '平' | '凶';
  conclusion: string;
  advice: string;
  beginnerText: string;
  professionalText: string;
}

/** 测名完整分析结果 */
export interface NamingAnalysis {
  fullName: string;
  surname: string;
  givenName: string;
  wugeResult: WuGeResult;
  sancaiResult: SanCaiResult;
  baziMatch?: BaziMatchResult;
  charAnalysis: CharAnalysisResult;
  totalScore: number;
  scoreBreakdown: ScoreBreakdown;
  verdicts: NamingVerdict[];
  beginnerSummary: string;
  professionalSummary: string;
}

/* ===== 知识库 ===== */

/** 知识库文章 */
export interface KnowledgeArticle {
  title: string;
  category: string;
  brief: string;
  detail: string;
  source?: string;
}
