/**
 * 奇门遁甲 —— TypeScript 类型定义
 * 阴盘（王凤麟体系）与阳盘（转盘/飞盘）完全隔离
 */

/** 五行 */
export type WuXing = '木' | '火' | '土' | '金' | '水';

/** 九宫编号（洛书数 1-9） */
export type PalaceId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** 宫位静态信息 */
export interface PalaceInfo {
  id: PalaceId;
  name: string;
  direction: string;
  element: WuXing;
  branches: string[];
}

/** 九星 */
export interface NineStar {
  name: string;
  originalPalace: PalaceId;
  element: WuXing;
  auspice: '吉' | '凶' | '中';
}

/** 八门 */
export interface EightGate {
  name: string;
  originalPalace: PalaceId;
  element: WuXing;
  auspice: '吉' | '凶' | '中';
}

/** 八神 */
export interface Spirit {
  name: string;
}

/** 排盘后单宫的完整状态 */
export interface PalaceState {
  palaceId: PalaceId;
  /** 地盘天干 */
  earthStem: string;
  /** 天盘天干 */
  heavenStem: string;
  /** 九星（5宫寄2宫时为null） */
  star: NineStar | null;
  /** 八门（5宫无门） */
  gate: EightGate | null;
  /** 八神 */
  spirit: Spirit | null;
  /** 是否空亡 */
  isVoid: boolean;
  /** 是否马星 */
  isHorseStar: boolean;
  /** 阴盘暗干（王凤麟专属） */
  yinPanDarkStem?: string;
  /** 阴盘隐干（王凤麟专属） */
  yinPanHiddenStem?: string;
}

/** 排盘输入配置 */
export interface QimenConfig {
  year: number;
  month: number;
  day: number;
  hour: number;
  /** 分钟（0-59，默认0，真太阳时修正需精确到分） */
  minute?: number;
  /** 盘类型 */
  panType: 'yinPan' | 'zhuanPan' | 'feiPan';
  /** 问事内容 */
  question: string;
  /** 阳盘定局方法（仅转盘/飞盘使用） */
  method?: 'chaiBu' | 'zhiRun';
  /** 年命干支（阴盘用于体用分析） */
  yearMing?: string;
  /** 问事地经度（东经度数，如 116.4 为北京），用于真太阳时修正 */
  longitude?: number;
  /** 是否启用真太阳时修正（阴盘默认 true） */
  useTrueSolarTime?: boolean;
}

/** 时间要素提取结果 */
export interface TimeElements {
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  timeGanZhi: string;
  yearGan: string;
  yearZhi: string;
  monthGan: string;
  monthZhi: string;
  dayGan: string;
  dayZhi: string;
  timeGan: string;
  timeZhi: string;
  currentJie: string;
  currentJieDate: string;
  nextJie: string;
  nextJieDate: string;
  lunarDesc: string;
  /** 是否已做真太阳时修正 */
  usedTrueSolarTime?: boolean;
  /** 真太阳时修正量（分钟） */
  trueSolarTimeCorrection?: number;
  /** 修正后的时间描述 */
  trueSolarTimeDesc?: string;
}

/**
 * 定局结果（仅阳盘使用：转盘/飞盘）
 * 阴盘不使用此类型
 */
export interface JuInfo {
  dunType: '阳遁' | '阴遁';
  juNumber: number;
  yuan: '上元' | '中元' | '下元';
  fuTou: string;
  method: 'chaiBu' | 'zhiRun';
  isRunQi: boolean;
}

/** 值符值使信息 */
export interface ZhiFuInfo {
  /** 旬首，如"甲子" */
  xunShou: string;
  /** 遁甲所隐之六仪，如"戊" */
  xunShouYin: string;
  /** 值符星 */
  zhiFuStar: NineStar;
  /** 值使门 */
  zhiShiGate: EightGate;
  /** 值符星原始宫位 */
  zhiFuOriginalPalace: PalaceId;
}

/** 排盘完整结果 */
export interface QimenResult {
  config: QimenConfig;
  timeElements: TimeElements;
  /** 定局信息（仅阳盘有值，阴盘为 undefined） */
  juInfo?: JuInfo;
  /** 值符值使信息 */
  zhiFuInfo: ZhiFuInfo;
  /** 九宫状态 */
  palaces: Record<PalaceId, PalaceState>;
  /** 空亡地支对 */
  voidBranches: [string, string];
  /** 马星地支 */
  horseBranch: string;
  /** 排盘时间戳 */
  timestamp: string;
}

/** 移星换斗操作 */
export interface SwapAction {
  sourcePalace: PalaceId;
  targetPalace: PalaceId;
}

/** 格局匹配结果 */
export interface PatternMatch {
  name: string;
  type: '吉格' | '凶格';
  palace: PalaceId;
  description: string;
}

/** 分析结果 */
export interface QimenAnalysis {
  patterns: PatternMatch[];
  summary: string;
  tips: string[];
}
