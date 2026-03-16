/**
 * 太乙神数 —— TypeScript 完整类型系统
 * 据《太乙金镜式经》《太乙统宗宝鉴》编纂
 */

/* ===== 基础联合类型 ===== */

/** 五行 */
export type WuXing = '木' | '火' | '土' | '金' | '水';

/** 流派 */
export type TaiyiSchool = 'tongzong' | 'jinjing';

/** 四计类型 */
export type CalcType = 'year' | 'month' | 'day' | 'hour';

/** UI 模式 */
export type UIMode = 'beginner' | 'professional';

/** 九宫编号 */
export type TaiyiPalaceId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** 问事场景 */
export type ScenarioType =
  | 'guoyun'     // 国运
  | 'zhanzheng'  // 战争
  | 'tianshi'    // 天时
  | 'renshi'     // 人事
  | 'jibing'     // 疾病
  | 'zayi';      // 灾异

/** 十六神名称 */
export type SpiritName =
  // 八正神
  | '天乙' | '地乙' | '直符' | '文昌'
  | '始击' | '客' | '主' | '定'
  // 八间神
  | '关' | '囚' | '臣基' | '雄基'
  | '大炅' | '小炅' | '大武' | '小武';

/** 格局类型 */
export type PatternKind =
  | '掩' | '迫' | '击' | '关' | '囚'
  | '对' | '和' | '格' | '飞' | '重审';

/* ===== 配置与输入 ===== */

/** 排盘配置 */
export interface TaiyiConfig {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** 流派选择 */
  school: TaiyiSchool;
  /** 计算类型 */
  calcType: CalcType;
  /** 问事场景 */
  scenario?: ScenarioType;
  /** 问事内容 */
  question?: string;
}

/* ===== 时间与积年 ===== */

/** 四柱干支 */
export interface GanZhiSet {
  year: string;
  month: string;
  day: string;
  time: string;
}

/** 太乙积年结果 */
export interface JiNianResult {
  /** 太乙积年数 */
  jiNian: number;
  /** 所属元（上元/中元/下元） */
  yuan: string;
  /** 纪数 */
  ji: number;
  /** 所用流派 */
  school: TaiyiSchool;
  /** 推演过程说明 */
  debugInfo: string;
}

/* ===== 十六神 ===== */

/** 十六神定义（静态） */
export interface SpiritDef {
  name: SpiritName;
  /** 正神 / 间神 */
  category: '正神' | '间神';
  /** 本位宫 */
  homePalace: TaiyiPalaceId;
  /** 五行 */
  element: WuXing;
  /** 吉凶属性 */
  auspice: '吉' | '凶' | '中';
  /** 说明 */
  desc: string;
}

/** 十六神运行时状态 */
export interface SpiritPosition {
  name: SpiritName;
  category: '正神' | '间神';
  /** 当前所在宫 */
  palace: TaiyiPalaceId;
  element: WuXing;
  auspice: '吉' | '凶' | '中';
}

/* ===== 九宫 ===== */

/** 宫位静态信息 */
export interface PalaceInfo {
  id: TaiyiPalaceId;
  name: string;       // 乾一宫 / 坎二宫 ...
  direction: string;  // 西北 / 正北 ...
  element: WuXing;
  branches: string[]; // 该宫对应地支
}

/** 宫位运行时状态 */
export interface TaiyiPalaceState {
  palaceId: TaiyiPalaceId;
  palaceName: string;
  direction: string;
  element: WuXing;
  /** 太乙是否在此宫 */
  hasTaiyi: boolean;
  /** 计神是否在此宫 */
  hasJiShen: boolean;
  /** 文昌是否在此宫 */
  hasWenChang: boolean;
  /** 始击是否在此宫 */
  hasShiJi: boolean;
  /** 此宫中的十六神 */
  spirits: SpiritPosition[];
  /** 主大将 */
  zhuJiang?: string;
  /** 客大将 */
  keJiang?: string;
  /** 地盘地支 */
  earthBranch: string;
  /** 是否空亡 */
  isVoid: boolean;
}

/* ===== 主客大将 ===== */

/** 大将信息 */
export interface GeneralInfo {
  /** 大将名（天干名） */
  name: string;
  /** 所在宫 */
  palace: TaiyiPalaceId;
  /** 五行 */
  element: WuXing;
}

/* ===== 三基/五福/四神 ===== */

/** 三基 */
export interface SanJi {
  suiJi: { gan: string; palace: TaiyiPalaceId };  // 岁基
  yueJi: { gan: string; palace: TaiyiPalaceId };  // 月基
  riJi: { gan: string; palace: TaiyiPalaceId };    // 日基
}

/** 五福 */
export interface WuFu {
  junJi: TaiyiPalaceId;     // 君基（太乙所在宫）
  chenJi: TaiyiPalaceId;    // 臣基
  minJi: TaiyiPalaceId;     // 民基
  shiJiGong: TaiyiPalaceId; // 始击宫
  keGong: TaiyiPalaceId;    // 客宫
}

/** 四神 */
export interface SiShen {
  tianYuan: { name: string; palace: TaiyiPalaceId };  // 天元
  diYuan: { name: string; palace: TaiyiPalaceId };    // 地元
  zhiFu: { name: string; palace: TaiyiPalaceId };     // 直符
  xuJing: { name: string; palace: TaiyiPalaceId };    // 虚精
}

/* ===== 阳九百六 ===== */

/** 阳九百六运限 */
export interface YangJiuBaiLiu {
  /** 当前所处周期名 */
  cycleName: string;
  /** 在周期内的位置（年） */
  positionInCycle: number;
  /** 运限类型 */
  limitType: '阳九' | '百六' | '正常';
  /** 描述 */
  description: string;
  /** 该运限起止年 */
  startYear: number;
  endYear: number;
}

/* ===== 排盘结果 ===== */

/** 排盘完整结果 */
export interface TaiyiResult {
  /** 输入配置 */
  config: TaiyiConfig;
  /** 排盘时间戳 */
  timestamp: string;
  /** 四柱干支 */
  ganZhi: GanZhiSet;
  /** 农历描述 */
  lunarDesc: string;

  /** 太乙积年 */
  jiNianResult: JiNianResult;

  /** 九宫状态 */
  palaces: Record<TaiyiPalaceId, TaiyiPalaceState>;

  /** 太乙所在宫 */
  taiyiPalace: TaiyiPalaceId;
  /** 计神所在宫 */
  jiShenPalace: TaiyiPalaceId;
  /** 文昌所在宫 */
  wenChangPalace: TaiyiPalaceId;
  /** 始击所在宫 */
  shiJiPalace: TaiyiPalaceId;

  /** 十六神排布 */
  spirits: SpiritPosition[];

  /** 主算 */
  zhuSuan: number;
  /** 客算 */
  keSuan: number;
  /** 定算 */
  dingSuan: number;

  /** 主大将 */
  zhuJiang: GeneralInfo;
  /** 客大将 */
  keJiang: GeneralInfo;

  /** 三基 */
  sanJi: SanJi;
  /** 五福 */
  wuFu: WuFu;
  /** 四神 */
  siShen: SiShen;

  /** 阳九百六（仅年计） */
  yangJiuBaiLiu?: YangJiuBaiLiu;

  /** 推演过程汇总 */
  debugInfo: string;
}

/* ===== 分析结果 ===== */

/** 格局匹配 */
export interface TaiyiPattern {
  /** 格局名 */
  name: string;
  /** 吉凶 */
  type: '吉格' | '凶格' | '中性';
  /** 描述 */
  description: string;
  /** 相关宫位 */
  involvedPalaces: TaiyiPalaceId[];
  /** 古籍原文 */
  classicalRef?: string;
}

/** 主客胜负判断 */
export interface HostGuestResult {
  /** 胜者 */
  winner: '主胜' | '客胜' | '和局';
  /** 判断依据 */
  reason: string;
  /** 评分（-10 ~ +10，正=主优） */
  score: number;
  /** 白话解读 */
  beginnerText: string;
  /** 专业解读 */
  professionalText: string;
}

/** 宫位分析 */
export interface PalaceAnalysis {
  palaceId: TaiyiPalaceId;
  /** 评分 (-5 ~ +5) */
  score: number;
  /** 旺衰 */
  wangShuai: string;
  /** 吉凶要点 */
  points: string[];
  /** 白话 */
  beginnerText: string;
  /** 专业 */
  professionalText: string;
}

/** 场景测算 */
export interface ScenarioResult {
  scenario: ScenarioType;
  scenarioLabel: string;
  /** 体宫 */
  tiPalace: TaiyiPalaceId;
  /** 用宫 */
  yongPalace: TaiyiPalaceId;
  /** 体用关系 */
  relation: string;
  /** 评分 */
  score: number;
  /** 趋势 */
  tendency: '吉' | '平' | '凶';
  /** 白话 */
  beginnerText: string;
  /** 专业 */
  professionalText: string;
}

/** 分析断语 */
export interface TaiyiVerdict {
  /** 类别 */
  category: string;
  /** 吉凶等级 */
  level: '吉' | '平' | '凶';
  /** 结论 */
  conclusion: string;
  /** 建议 */
  advice: string;
  /** 白话文案 */
  beginnerText: string;
  /** 专业文案 */
  professionalText: string;
  /** 古籍出处 */
  classicalCitation?: string;
}

/** 完整分析结果 */
export interface TaiyiAnalysis {
  /** 格局列表 */
  patterns: TaiyiPattern[];
  /** 主客胜负 */
  hostGuestResult: HostGuestResult;
  /** 宫位深度分析 */
  palaceAnalyses: Record<number, PalaceAnalysis>;
  /** 场景测算 */
  scenarioResult?: ScenarioResult;
  /** 断语列表 */
  verdicts: TaiyiVerdict[];
  /** 综合 */
  overall: {
    tendency: '吉' | '平' | '凶';
    score: number;
    summary: string;
    tips: string[];
    warnings: string[];
  };
  /** 白话总结 */
  beginnerSummary: string;
  /** 专业总结 */
  professionalSummary: string;
}

/* ===== 案例库 ===== */

/** 经典案例 */
export interface ClassicalCase {
  /** 标题 */
  title: string;
  /** 朝代 */
  dynasty: string;
  /** 出处 */
  source: string;
  /** 公历年份 */
  year: number;
  /** 月/日/时（可选） */
  month?: number;
  day?: number;
  hour?: number;
  /** 计算类型 */
  calcType: CalcType;
  /** 古人解读 */
  interpretation: string;
  /** 历史结果 */
  historicalOutcome: string;
  /** 分类标签 */
  tags: string[];
}

/* ===== 知识库 ===== */

/** 术语条目 */
export interface KnowledgeTerm {
  /** 术语名 */
  term: string;
  /** 分类 */
  category: string;
  /** 简要解释 */
  brief: string;
  /** 详细说明 */
  detail: string;
  /** 古籍出处 */
  source?: string;
}
