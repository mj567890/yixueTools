/**
 * 六爻排盘系统 —— TypeScript 类型定义
 *
 * 支持京房纳甲 / 藏山卜 双流派
 * 支持白话 / 专业 双模式
 */

// ==================== 基础联合类型 ====================

/** 五行 */
export type WuXing = '木' | '火' | '土' | '金' | '水';

/** 爻的阴阳老少 (老阳=9 少阴=8 少阳=7 老阴=6) */
export type YaoType = 'laoYang' | 'shaoYang' | 'shaoYin' | 'laoYin';

/** 六亲 */
export type SixRelative = '父母' | '兄弟' | '子孙' | '妻财' | '官鬼';

/** 六神 */
export type SixSpirit = '青龙' | '朱雀' | '勾陈' | '螣蛇' | '白虎' | '玄武';

/** 流派 */
export type SchoolType = 'jingfang' | 'cangshanbu';

/** UI 模式 */
export type UIMode = 'beginner' | 'professional';

/** 起卦方式 */
export type DivinationMethod = 'time' | 'coin' | 'number' | 'manual';

/** 铜钱面 (字=阳=3, 背=阴=2) */
export type CoinFace = 'yang' | 'yin';

/** 问事场景 */
export type ScenarioType =
  | 'qiucai'   // 求财
  | 'wenbing'  // 问病
  | 'kaoshi'   // 考试
  | 'hunlian'  // 婚恋
  | 'shiye'    // 事业
  | 'shiwu'    // 失物
  | 'guansi'   // 官司
  | 'chuxing'  // 出行
  | 'zhaizang' // 宅葬
  | 'qiuqian'; // 求签/杂占

// ==================== 数据接口 ====================

/** 爻的旺衰状态 */
export interface YaoStrength {
  /** 与月建关系 */
  monthRelation: '旺' | '相' | '休' | '囚' | '死';
  /** 日辰对爻的作用 */
  dayEffect: string; // 如 "日生" "日克" "日冲" "日合" "日扶" 等
}

/** 单爻完整状态 */
export interface YaoLine {
  /** 爻位 1-6 (初爻=1, 上爻=6) */
  position: number;
  /** 爻位名称 */
  positionName: string;
  /** 爻的阴阳老少 */
  yaoType: YaoType;
  /** 是否阳爻 (老阳/少阳为阳) */
  isYang: boolean;
  /** 是否动爻 (老阳/老阴为动) */
  isMoving: boolean;
  /** 纳甲天干 */
  gan: string;
  /** 纳甲地支 */
  zhi: string;
  /** 纳甲干支合写 */
  ganZhi: string;
  /** 地支五行 */
  zhiWuXing: WuXing;
  /** 六亲 */
  liuQin: SixRelative;
  /** 六神 */
  liuShen: SixSpirit;
  /** 是否世爻 */
  isShiYao: boolean;
  /** 是否应爻 */
  isYingYao: boolean;
  /** 旺衰 */
  strength: YaoStrength;
  /** 是否旬空 */
  isXunKong: boolean;
  /** 是否月破 */
  isYuePo: boolean;
  /** 变爻后的地支 (仅动爻有) */
  changedZhi?: string;
  /** 变爻后的地支五行 */
  changedZhiWuXing?: WuXing;
  /** 变爻后的六亲 */
  changedLiuQin?: SixRelative;
  /** 变爻后的天干 */
  changedGan?: string;
}

/** 伏神 */
export interface FuShen {
  /** 缺失的六亲 */
  liuQin: SixRelative;
  /** 伏神在本宫卦的爻位 */
  position: number;
  /** 伏神的纳甲天干 */
  gan: string;
  /** 伏神的纳甲地支 */
  zhi: string;
  /** 伏神干支 */
  ganZhi: string;
  /** 伏神地支五行 */
  zhiWuXing: WuXing;
  /** 飞神 (覆盖在伏神上的本卦爻位) */
  feiShenPosition: number;
  /** 飞神干支 */
  feiShenGanZhi: string;
  /** 飞伏关系描述 */
  relation: string;
}

/** 铜钱单次投掷结果 */
export interface CoinTossResult {
  /** 第几爻 (1-6) */
  yaoIndex: number;
  /** 三枚铜钱正反 */
  coins: [CoinFace, CoinFace, CoinFace];
  /** 合计数值 (6/7/8/9) */
  total: number;
  /** 对应爻类型 */
  yaoType: YaoType;
}

/** 八宫卦信息 (常量表用) */
export interface BaGongHexagram {
  /** 卦名 */
  name: string;
  /** 简称 */
  alias: string;
  /** 所属宫名 */
  palace: string;
  /** 宫五行 */
  palaceWuXing: WuXing;
  /** 世序名 */
  sequence: string;
  /** 世爻位置 1-6 */
  shiPosition: number;
  /** 应爻位置 1-6 */
  yingPosition: number;
  /** 上卦名 */
  upperTrigram: string;
  /** 下卦名 */
  lowerTrigram: string;
  /** 六爻阴阳 [初..上], true=阳 */
  lines: [boolean, boolean, boolean, boolean, boolean, boolean];
}

/** 排盘输入配置 */
export interface LiuYaoConfig {
  /** 起卦方式 */
  method: DivinationMethod;
  /** 流派 */
  school: SchoolType;
  /** 问事内容 */
  question: string;
  /** 问事场景 */
  scenario?: ScenarioType;
  /** 公历年 */
  year: number;
  /** 公历月 */
  month: number;
  /** 公历日 */
  day: number;
  /** 小时 0-23 */
  hour: number;
  /** 分钟 */
  minute?: number;
  /** 手动输入的6爻 (manual方式) */
  rawYaoTypes?: YaoType[];
  /** 铜钱结果 (coin方式) */
  coinResults?: CoinTossResult[];
  /** 数字输入 (number方式) */
  numberInput?: number;
}

/** 排盘完整结果 */
export interface LiuYaoResult {
  /** 配置 */
  config: LiuYaoConfig;
  /** 流派 */
  school: SchoolType;
  /** 时间戳 */
  timestamp: string;
  /** 农历描述 */
  lunarDesc: string;

  /** 四柱干支 */
  ganZhi: { year: string; month: string; day: string; time: string };
  /** 日干 */
  dayGan: string;
  /** 日支 */
  dayZhi: string;
  /** 月支 (月建) */
  monthZhi: string;

  /** 本卦名 */
  benGuaName: string;
  /** 本卦简称 */
  benGuaAlias: string;
  /** 所属宫 */
  palace: string;
  /** 宫五行 */
  palaceWuXing: WuXing;
  /** 世序名 */
  guaSequence: string;

  /** 本卦六爻 [初爻..上爻] */
  yaoLines: YaoLine[];

  /** 是否有变卦 */
  hasChanged: boolean;
  /** 变卦名 */
  bianGuaName?: string;
  /** 变卦简称 */
  bianGuaAlias?: string;
  /** 变卦六爻 */
  bianYaoLines?: YaoLine[];

  /** 伏神列表 */
  fuShenList: FuShen[];

  /** 世爻位置 */
  shiPosition: number;
  /** 应爻位置 */
  yingPosition: number;

  /** 旬空地支对 */
  xunKongPair: [string, string];

  /** 卦辞 */
  guaCi?: string;
  /** 爻辞 */
  yaoCi?: string[];

  /** 原始6爻类型 */
  rawYaoTypes: YaoType[];
}

// ==================== 分析相关类型 ====================

/** 用神信息 */
export interface YongShenInfo {
  /** 六亲 */
  liuQin: SixRelative;
  /** 用神所在爻位 (0=伏藏) */
  position: number;
  /** 用神地支 */
  zhi: string;
  /** 用神五行 */
  wuXing: WuXing;
  /** 用神状态描述 */
  status: string;
  /** 是否伏藏 */
  isFuShen: boolean;
  /** 是否旬空 */
  isXunKong: boolean;
  /** 是否月破 */
  isYuePo: boolean;
  /** 是否动爻 */
  isMoving: boolean;
}

/** 辅助神信息 (原神/忌神/仇神) */
export interface ShenInfo {
  /** 角色 */
  role: '原神' | '忌神' | '仇神';
  /** 六亲 */
  liuQin: SixRelative;
  /** 所在爻位 */
  position: number;
  /** 地支 */
  zhi: string;
  /** 五行 */
  wuXing: WuXing;
  /** 状态描述 */
  status: string;
}

/** 分析断语条目 */
export interface AnalysisVerdict {
  /** 类别 */
  category: string;
  /** 吉凶 */
  level: '吉' | '平' | '凶';
  /** 结论 */
  conclusion: string;
  /** 建议 */
  advice: string;
  /** 白话版本 */
  beginnerText: string;
  /** 专业版本 */
  professionalText: string;
}

/** 场景分析结果 */
export interface ScenarioAnalysis {
  /** 场景名称 */
  scenarioName: string;
  /** 用神 */
  yongShen: YongShenInfo;
  /** 原神 */
  yuanShen?: ShenInfo;
  /** 忌神 */
  jiShen?: ShenInfo;
  /** 仇神 */
  chouShen?: ShenInfo;
  /** 体用关系 */
  keyFindings: string[];
  /** 结论 */
  conclusion: string;
  /** 建议 */
  advice: string[];
  /** 趋势 */
  tendency: '吉' | '凶' | '平';
}

/** 完整分析结果 */
export interface LiuYaoAnalysis {
  /** 总趋势 */
  overallTendency: '吉' | '凶' | '平';
  /** 综合评分 0-100 */
  score: number;
  /** 场景分析 */
  scenarioResult?: ScenarioAnalysis;
  /** 断语 */
  verdicts: AnalysisVerdict[];
  /** 关键提示 */
  keyTips: string[];
  /** 警示 */
  warnings: string[];
  /** 白话总结 */
  beginnerSummary: string;
  /** 专业总结 */
  professionalSummary: string;
  /** 应期推测 */
  yingQi?: string;
}
