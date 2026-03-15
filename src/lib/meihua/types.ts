/**
 * 梅花易数 —— TypeScript 类型定义
 */

/** 单经卦（八卦之一） */
export interface Trigram {
  /** 先天数 1-8 */
  number: number;
  /** 卦名：乾/兑/离/震/巽/坎/艮/坤 */
  name: string;
  /** 五行：金/火/木/水/土 */
  element: string;
  /** 卦性：天/泽/火/雷/风/水/山/地 */
  nature: string;
  /** 三爻画（自下而上），true=阳爻，false=阴爻 */
  lines: [boolean, boolean, boolean];
  /** 方位 */
  direction: string;
  /** 对应身体部位 */
  bodyPart: string;
}

/** 重卦（六十四卦） */
export interface Hexagram {
  /** 上卦（外卦） */
  upperTrigram: Trigram;
  /** 下卦（内卦） */
  lowerTrigram: Trigram;
  /** 完整卦名，如"天火同人" */
  name: string;
  /** 简称，如"同人" */
  alias: string;
  /** 六爻画（自下而上），true=阳爻 */
  lines: boolean[];
  /** 卦辞 */
  guaCi: string;
  /** 六爻爻辞（初爻→上爻） */
  yaoCi: string[];
}

/** 动爻信息 */
export interface MovingLineInfo {
  /** 动爻位置 1-6（自下而上） */
  position: number;
  /** 位置名称："初爻"~"上爻" */
  positionName: string;
  /** 原爻阴阳 */
  originalYao: boolean;
  /** 变后阴阳 */
  changedYao: boolean;
  /** 该爻爻辞 */
  yaoCi: string;
}

/** 起卦方式 */
export type DivinationMethod = 'time' | 'number' | 'text';

/** 笔画详情（文字起卦时） */
export interface StrokeDetail {
  char: string;
  strokes: number;
  estimated: boolean;
}

/** 起卦完整结果 */
export interface DivinationResult {
  /** 起卦方式 */
  method: DivinationMethod;
  /** 问事内容 */
  question: string;
  /** 起卦时间戳 */
  timestamp: string;
  /** 上卦原始数 */
  upperNumber: number;
  /** 下卦原始数 */
  lowerNumber: number;
  /** 动爻原始数 */
  movingNumber: number;
  /** 本卦 */
  original: Hexagram;
  /** 变卦 */
  changed: Hexagram;
  /** 互卦 */
  mutual: Hexagram;
  /** 错卦 */
  reversed: Hexagram;
  /** 综卦 */
  flipped: Hexagram;
  /** 动爻详情 */
  movingLine: MovingLineInfo;
  /** 体卦（不动之卦） */
  tiGua: Trigram;
  /** 用卦（动爻所在之卦） */
  yongGua: Trigram;
  /** 农历描述（时间起卦时） */
  lunarDesc?: string;
  /** 笔画详情（文字起卦时） */
  strokeDetails?: StrokeDetail[];
}

/** 体用关系类型 */
export type TiYongType = 'sheng_ti' | 'ti_sheng' | 'ti_ke' | 'ke_ti' | 'bihe';

/** 体用关系 */
export interface TiYongRelation {
  tiElement: string;
  yongElement: string;
  /** 关系描述，如"用生体" */
  relation: string;
  relationType: TiYongType;
  /** 对体卦是否有利 */
  favorable: boolean;
  /** 一句话总结 */
  summary: string;
}

/** 吉凶等级 */
export type VerdictLevel = '吉' | '平' | '忌';

/** 问事结论条目 */
export interface VerdictItem {
  category: string;
  icon: string;
  level: VerdictLevel;
  conclusion: string;
  advice: string;
  /** 增强：标识属于核心维度还是扩展维度 */
  group: 'core' | 'extended';
}

/** 完整分析结果 */
export interface MeihuaAnalysis {
  tiYong: TiYongRelation;
  movingLineInterpretation: string;
  verdicts: VerdictItem[];
  keyTips: string[];
  elementInteractions: string;
}
