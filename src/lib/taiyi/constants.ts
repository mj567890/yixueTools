/**
 * 太乙神数 —— 常量数据表
 * 据《太乙金镜式经》《太乙统宗宝鉴》编纂
 */

import type {
  TaiyiPalaceId, WuXing, SpiritDef, SpiritName,
  PalaceInfo, CalcType, ScenarioType, KnowledgeTerm,
} from './types';

/* ===== 天干地支（复用 lunar） ===== */
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

/** 天干→五行 */
export const GAN_WX: Record<string, WuXing> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

/** 地支→五行 */
export const ZHI_WX: Record<string, WuXing> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
  午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
};

/** 五行相生 */
export const WX_SHENG: Record<WuXing, WuXing> = {
  木: '火', 火: '土', 土: '金', 金: '水', 水: '木',
};

/** 五行相克 */
export const WX_KE: Record<WuXing, WuXing> = {
  木: '土', 火: '金', 土: '水', 金: '木', 水: '火',
};

/* ===== 太乙九宫信息 ===== */

/**
 * 太乙九宫与洛书九宫不同：
 * 一宫乾(西北)、二宫坎(正北)、三宫艮(东北)、四宫震(正东)、
 * 五宫中(中央/绝地)、六宫巽(东南)、七宫离(正南)、八宫坤(西南)、九宫兑(正西)
 */
export const TAIYI_PALACE_INFO: Record<TaiyiPalaceId, PalaceInfo> = {
  1: { id: 1, name: '乾一宫', direction: '西北', element: '金', branches: ['戌', '亥'] },
  2: { id: 2, name: '坎二宫', direction: '正北', element: '水', branches: ['子'] },
  3: { id: 3, name: '艮三宫', direction: '东北', element: '土', branches: ['丑', '寅'] },
  4: { id: 4, name: '震四宫', direction: '正东', element: '木', branches: ['卯'] },
  5: { id: 5, name: '中五宫', direction: '中央', element: '土', branches: [] },
  6: { id: 6, name: '巽六宫', direction: '东南', element: '木', branches: ['辰', '巳'] },
  7: { id: 7, name: '离七宫', direction: '正南', element: '火', branches: ['午'] },
  8: { id: 8, name: '坤八宫', direction: '西南', element: '土', branches: ['未', '申'] },
  9: { id: 9, name: '兑九宫', direction: '正西', element: '金', branches: ['酉'] },
};

/** 地支→宫位映射 */
export const ZHI_TO_PALACE: Record<string, TaiyiPalaceId> = {
  戌: 1, 亥: 1,
  子: 2,
  丑: 3, 寅: 3,
  卯: 4,
  辰: 6, 巳: 6,
  午: 7,
  未: 8, 申: 8,
  酉: 9,
};

/* ===== 太乙巡行路线 ===== */

/**
 * 统宗版：太乙巡行跳过5宫（绝地），8宫循环
 * 顺序: 1→2→3→4→6→7→8→9→1...
 */
export const TAIYI_PATROL_SKIP5: TaiyiPalaceId[] = [1, 2, 3, 4, 6, 7, 8, 9];

/**
 * 金镜版：太乙巡行过5宫，9宫循环
 * 顺序: 1→2→3→4→5→6→7→8→9→1...
 */
export const TAIYI_PATROL_FULL9: TaiyiPalaceId[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * 计神巡行路线（逆行，跳5宫）
 * 与太乙相对运行
 */
export const JISHEN_PATROL: TaiyiPalaceId[] = [9, 8, 7, 6, 4, 3, 2, 1];

/**
 * 文昌巡行路线（顺行，跳5宫）
 * 与太乙同步但起始偏移不同
 */
export const WENCHANG_PATROL: TaiyiPalaceId[] = [1, 2, 3, 4, 6, 7, 8, 9];

/* ===== 十六神定义 ===== */

export const SIXTEEN_SPIRITS: SpiritDef[] = [
  // 八正神
  { name: '天乙', category: '正神', homePalace: 1, element: '金', auspice: '吉', desc: '天乙贵人，主恩泽' },
  { name: '地乙', category: '正神', homePalace: 9, element: '金', auspice: '吉', desc: '地乙，辅佐之神' },
  { name: '直符', category: '正神', homePalace: 2, element: '水', auspice: '中', desc: '值符，当令之神' },
  { name: '文昌', category: '正神', homePalace: 6, element: '木', auspice: '吉', desc: '文昌，主文运科名' },
  { name: '始击', category: '正神', homePalace: 7, element: '火', auspice: '凶', desc: '始击，先发制人之神' },
  { name: '客',   category: '正神', homePalace: 3, element: '土', auspice: '中', desc: '客神，代表外来之力' },
  { name: '主',   category: '正神', homePalace: 4, element: '木', auspice: '中', desc: '主神，代表自身之力' },
  { name: '定',   category: '正神', homePalace: 8, element: '土', auspice: '中', desc: '定神，定局之用' },
  // 八间神
  { name: '关',   category: '间神', homePalace: 1, element: '金', auspice: '凶', desc: '关神，主阻隔' },
  { name: '囚',   category: '间神', homePalace: 2, element: '水', auspice: '凶', desc: '囚神，主困顿' },
  { name: '臣基', category: '间神', homePalace: 3, element: '土', auspice: '中', desc: '臣基，辅臣之基' },
  { name: '雄基', category: '间神', homePalace: 4, element: '木', auspice: '中', desc: '雄基，英雄之基' },
  { name: '大炅', category: '间神', homePalace: 6, element: '木', auspice: '吉', desc: '大炅，大光明' },
  { name: '小炅', category: '间神', homePalace: 7, element: '火', auspice: '吉', desc: '小炅，小光明' },
  { name: '大武', category: '间神', homePalace: 8, element: '土', auspice: '凶', desc: '大武，主兵戈' },
  { name: '小武', category: '间神', homePalace: 9, element: '金', auspice: '凶', desc: '小武，主争斗' },
];

/** 八正神名列表 */
export const ZHENG_SHEN_NAMES: SpiritName[] = [
  '天乙', '地乙', '直符', '文昌', '始击', '客', '主', '定',
];

/** 八间神名列表 */
export const JIAN_SHEN_NAMES: SpiritName[] = [
  '关', '囚', '臣基', '雄基', '大炅', '小炅', '大武', '小武',
];

/* ===== 主客大将推算 ===== */

/**
 * 十天干在太乙九宫中的落宫
 * 甲→4(震), 乙→6(巽), 丙→7(离), 丁→7(离),
 * 戊→5→寄8(坤), 己→5→寄8(坤), 庚→9(兑), 辛→1(乾),
 * 壬→2(坎), 癸→2(坎)
 */
export const GAN_TO_PALACE: Record<string, TaiyiPalaceId> = {
  甲: 4, 乙: 6, 丙: 7, 丁: 7,
  戊: 8, 己: 8, 庚: 9, 辛: 1,
  壬: 2, 癸: 2,
};

/**
 * 主大将推算：按计算类型取对应干
 * 年计→年干, 月计→月干, 日计→日干, 时计→时干
 * 主大将 = 对应干在九宫的位置
 */
export const ZHU_JIANG_CALC: Record<CalcType, 'year' | 'month' | 'day' | 'time'> = {
  year: 'year',
  month: 'month',
  day: 'day',
  hour: 'time',
};

/**
 * 客大将推算规则：
 * 年计→太乙积年求天干, 月计/日计/时计各有对应推算
 */
export const KE_JIANG_GAN_CYCLE = TIAN_GAN;

/* ===== 阳九百六运限 ===== */

/**
 * 阳九百六大周期 = 4617年
 * 阳九: 每一大周期中有多个阳九灾限
 * 百六: 106年一行限
 *
 * 据《太乙统宗宝鉴》：
 * 大周期4617年 = 阳九(9年灾限) × 若干 + 百六(106年行限) × 若干
 * 实际结构: 4617 = 7×(9+106) + 4×(9+106) + 若干微调
 */
export const YANG_JIU_PERIOD = 4617; // 大周期
export const YANG_JIU_DURATION = 9;  // 阳九持续年数
export const BAI_LIU_DURATION = 106; // 百六持续年数

/** 阳九百六在一个大周期内的分布（起始年偏移, 类型） */
export const YANG_JIU_BAI_LIU_SEGMENTS: Array<{
  startOffset: number;
  duration: number;
  type: '阳九' | '百六' | '正常';
  name: string;
}> = [
  { startOffset: 0, duration: 106, type: '百六', name: '初百六·一' },
  { startOffset: 106, duration: 9, type: '阳九', name: '初阳九·一' },
  { startOffset: 115, duration: 106, type: '百六', name: '初百六·二' },
  { startOffset: 221, duration: 9, type: '阳九', name: '初阳九·二' },
  { startOffset: 230, duration: 106, type: '百六', name: '初百六·三' },
  { startOffset: 336, duration: 9, type: '阳九', name: '初阳九·三' },
  { startOffset: 345, duration: 106, type: '百六', name: '中百六·一' },
  { startOffset: 451, duration: 9, type: '阳九', name: '中阳九·一' },
  { startOffset: 460, duration: 106, type: '百六', name: '中百六·二' },
  { startOffset: 566, duration: 9, type: '阳九', name: '中阳九·二' },
  { startOffset: 575, duration: 106, type: '百六', name: '中百六·三' },
  { startOffset: 681, duration: 9, type: '阳九', name: '中阳九·三' },
  { startOffset: 690, duration: 106, type: '百六', name: '末百六·一' },
  { startOffset: 796, duration: 9, type: '阳九', name: '末阳九·一' },
  { startOffset: 805, duration: 106, type: '百六', name: '末百六·二' },
  { startOffset: 911, duration: 9, type: '阳九', name: '末阳九·二' },
  { startOffset: 920, duration: 106, type: '百六', name: '末百六·三' },
  { startOffset: 1026, duration: 9, type: '阳九', name: '末阳九·三' },
  // 后续循环类推...
];

/* ===== 积年相关常量 ===== */

/**
 * 统宗宝鉴：太乙上元甲子积年起算点
 * 上元甲子年 = 公元前 10157年
 * 积年 = 当前年 + 10156（公元前为负数需转换）
 */
export const TONGZONG_EPOCH = 10156; // 公元1年的积年值

/**
 * 金镜式经：不同的起算点
 * 据《太乙金镜式经》，上元积年起于黄帝甲子
 */
export const JINJING_EPOCH = 8917; // 金镜版公元1年的积年值

/** 统宗版太乙周期：72年（3元 × 24年） */
export const TONGZONG_TAIYI_CYCLE = 72;

/** 金镜版太乙周期：360年 */
export const JINJING_TAIYI_CYCLE = 360;

/** 主算除数 */
export const TONGZONG_ZHU_DIVISOR = 360;
export const JINJING_ZHU_DIVISOR = 360;

/** 客算除数 */
export const TONGZONG_KE_DIVISOR = 72;
export const JINJING_KE_DIVISOR = 72;

/* ===== 格局定义 ===== */

/** 太乙格局名及简述 */
export interface PatternDef {
  name: string;
  type: '吉格' | '凶格' | '中性';
  description: string;
  /** 检测逻辑描述（实际检测在 analysisRules.ts 中实现） */
  condition: string;
  classicalRef: string;
}

export const TAIYI_PATTERN_DEFS: PatternDef[] = [
  // 凶格
  {
    name: '掩',
    type: '凶格',
    description: '客掩主，客算大于主算且客将克主将',
    condition: '客算>主算 且 客将五行克主将五行',
    classicalRef: '《太乙金镜式经》：客掩主，兵来犯我，大凶。',
  },
  {
    name: '迫',
    type: '凶格',
    description: '主迫客，主算大于客算且主将克客将，但太乙临凶宫',
    condition: '主算>客算 且 主将五行克客将五行 且 太乙临凶宫',
    classicalRef: '《太乙统宗宝鉴》：迫者，势逼而不得已也。',
  },
  {
    name: '击',
    type: '凶格',
    description: '始击所临宫位与太乙所临宫位相冲',
    condition: '始击宫与太乙宫为对冲关系',
    classicalRef: '《太乙金镜式经》：击者，攻伐之象也。',
  },
  {
    name: '关',
    type: '凶格',
    description: '关神临太乙宫，主阻隔不通',
    condition: '关神与太乙同宫',
    classicalRef: '《太乙统宗宝鉴》：关者，闭塞之义，事多阻滞。',
  },
  {
    name: '囚',
    type: '凶格',
    description: '囚神临太乙宫，主困顿受制',
    condition: '囚神与太乙同宫',
    classicalRef: '《太乙金镜式经》：囚者，幽闭之象，百事不宜。',
  },
  // 中性格局
  {
    name: '对',
    type: '中性',
    description: '主算等于客算，势均力敌',
    condition: '主算 == 客算',
    classicalRef: '《太乙统宗宝鉴》：对者，两相当也。',
  },
  {
    name: '和',
    type: '吉格',
    description: '主客大将五行相生，和睦之象',
    condition: '主将五行生客将五行 或 客将五行生主将五行',
    classicalRef: '《太乙金镜式经》：和者，阴阳调和，万事顺遂。',
  },
  {
    name: '格',
    type: '凶格',
    description: '主客大将五行相克且定算为凶数',
    condition: '主将五行克客将五行 且 定算为凶数',
    classicalRef: '《太乙统宗宝鉴》：格者，格斗之象。',
  },
  {
    name: '飞',
    type: '吉格',
    description: '太乙飞入吉宫，计神文昌亦在吉位',
    condition: '太乙在吉宫 且 计神在吉宫 且 文昌在吉宫',
    classicalRef: '《太乙金镜式经》：飞者，变动升腾之象。',
  },
  {
    name: '重审',
    type: '凶格',
    description: '太乙与计神同宫，事情反复需重新审视',
    condition: '太乙宫 == 计神宫',
    classicalRef: '《太乙统宗宝鉴》：重审者，当重新审视，不可轻动。',
  },
];

/* ===== 宫位对冲关系 ===== */

/** 太乙九宫的对冲宫 */
export const OPPOSITE_PALACE: Record<TaiyiPalaceId, TaiyiPalaceId> = {
  1: 7, 2: 8, 3: 9, 4: 6,
  5: 5, // 中宫无对冲
  6: 4, 7: 1, 8: 2, 9: 3,
};

/** 吉宫列表 */
export const AUSPICIOUS_PALACES: TaiyiPalaceId[] = [1, 4, 6];

/** 凶宫列表 */
export const INAUSPICIOUS_PALACES: TaiyiPalaceId[] = [3, 7, 9];

/** 中性宫列表 */
export const NEUTRAL_PALACES: TaiyiPalaceId[] = [2, 5, 8];

/* ===== 场景配置 ===== */

export interface ScenarioConfig {
  type: ScenarioType;
  label: string;
  /** 体宫取法 */
  tiSource: string;
  /** 用宫取法 */
  yongSource: string;
  desc: string;
}

export const SCENARIO_CONFIGS: ScenarioConfig[] = [
  { type: 'guoyun', label: '国运', tiSource: '太乙宫', yongSource: '主将宫', desc: '推演一国之运势兴衰' },
  { type: 'zhanzheng', label: '战争', tiSource: '主将宫', yongSource: '客将宫', desc: '推演战争胜负攻守' },
  { type: 'tianshi', label: '天时', tiSource: '太乙宫', yongSource: '文昌宫', desc: '推演气候灾变' },
  { type: 'renshi', label: '人事', tiSource: '计神宫', yongSource: '始击宫', desc: '推演人事吉凶' },
  { type: 'jibing', label: '疾病', tiSource: '主将宫', yongSource: '客将宫', desc: '推演疾病转归' },
  { type: 'zayi', label: '灾异', tiSource: '太乙宫', yongSource: '始击宫', desc: '推演天灾人祸' },
];

/* ===== 旺衰判定 ===== */

/** 月令五行当旺表（按月支所属季节） */
export const SEASON_WX: Record<string, WuXing> = {
  寅: '木', 卯: '木', 辰: '土',
  巳: '火', 午: '火', 未: '土',
  申: '金', 酉: '金', 戌: '土',
  亥: '水', 子: '水', 丑: '土',
};

/** 五行旺衰关系 */
export function getWangShuai(wx: WuXing, seasonWX: WuXing): string {
  if (wx === seasonWX) return '旺';
  if (WX_SHENG[seasonWX] === wx) return '相';
  if (WX_SHENG[wx] === seasonWX) return '休';
  if (WX_KE[wx] === seasonWX) return '囚';
  if (WX_KE[seasonWX] === wx) return '死';
  return '平';
}

/* ===== 六甲旬空 ===== */

export const XUN_KONG_MAP: Record<string, [string, string]> = {
  '甲子': ['戌', '亥'], '甲戌': ['申', '酉'], '甲申': ['午', '未'],
  '甲午': ['辰', '巳'], '甲辰': ['寅', '卯'], '甲寅': ['子', '丑'],
};

/** 查找干支所属旬空 */
export function getXunKong(ganZhi: string): [string, string] {
  const ganIdx = TIAN_GAN.indexOf(ganZhi[0] as typeof TIAN_GAN[number]);
  const zhiIdx = DI_ZHI.indexOf(ganZhi[1] as typeof DI_ZHI[number]);
  if (ganIdx < 0 || zhiIdx < 0) return ['', ''];
  const xunIdx = ((zhiIdx - ganIdx) + 12) % 12;
  const xunShouZhi = DI_ZHI[xunIdx];
  const xunShou = `甲${xunShouZhi}`;
  return XUN_KONG_MAP[xunShou] || ['', ''];
}

/* ===== 知识库术语 ===== */

export const KNOWLEDGE_TERMS: KnowledgeTerm[] = [
  { term: '太乙', category: '基础', brief: '太乙神数的核心星神', detail: '太乙为天之贵神，太乙神数以太乙在九宫中的巡行为核心推演体系。太乙所临之宫即为天时之所向，太乙临吉宫则吉，临凶宫则凶。', source: '《太乙金镜式经》' },
  { term: '积年', category: '基础', brief: '从太乙上元甲子起算的总年数', detail: '太乙积年是太乙排盘的核心基数，所有推算均以积年为起点。统宗版以上元甲子为公元前10157年，金镜版起点不同。年计取年积年，月计/日计/时计需进一步换算。', source: '《太乙统宗宝鉴》' },
  { term: '计神', category: '基础', brief: '太乙的对应星神，逆行于九宫', detail: '计神与太乙相对运行，太乙顺行则计神逆行。计神所临之宫代表谋划、计策的方向。太乙与计神同宫为"重审"格局。', source: '《太乙金镜式经》' },
  { term: '文昌', category: '基础', brief: '主文运科名之星神', detail: '文昌星主文运、科举、学业。文昌所在宫位吉凶影响文教之事。文昌在吉宫利考试、升迁，在凶宫则文事不顺。', source: '《太乙统宗宝鉴》' },
  { term: '始击', category: '基础', brief: '先发制人之神', detail: '始击代表先动者，始击所临之宫为先手方。若始击在主方（体方），则主方宜先发；若在客方（用方），则客方先动。', source: '《太乙金镜式经》' },
  { term: '十六神', category: '进阶', brief: '太乙式盘中的16位星神', detail: '太乙十六神分八正神（天乙、地乙、直符、文昌、始击、客、主、定）和八间神（关、囚、臣基、雄基、大炅、小炅、大武、小武）。各神有吉凶属性，按规则分布于九宫。', source: '《太乙统宗宝鉴》' },
  { term: '主算', category: '进阶', brief: '代表"主方"的数值', detail: '主算由太乙积年经特定除数取余而得。主算大则主方（守方/体方）势强。主算与客算的对比是判断主客胜负的关键依据。', source: '《太乙金镜式经》' },
  { term: '客算', category: '进阶', brief: '代表"客方"的数值', detail: '客算由太乙积年经不同除数取余而得。客算大则客方（攻方/用方）势强。', source: '《太乙金镜式经》' },
  { term: '定算', category: '进阶', brief: '主算与客算综合后的定局数', detail: '定算 = (主算 + 客算) 经特定运算而得，为最终定局之数。定算奇数为阳，偶数为阴，亦有吉凶之分。', source: '《太乙统宗宝鉴》' },
  { term: '三基', category: '进阶', brief: '岁基、月基、日基的合称', detail: '三基分别由年干、月干、日干推算落宫。岁基主一年大势，月基主当月运程，日基主当日吉凶。三基同在吉宫则大吉。', source: '《太乙统宗宝鉴》' },
  { term: '五福', category: '进阶', brief: '太乙排盘中的五个关键宫位', detail: '五福由君基（太乙宫）、臣基、民基、始击宫、客宫五者组成，用于判断国运中君臣民的关系。五福齐聚吉宫为大吉之象。', source: '《太乙金镜式经》' },
  { term: '四神', category: '进阶', brief: '天元、地元、直符、虚精', detail: '四神代表天地人三才及虚灵之气。天元主天时，地元主地利，直符主当令之气，虚精为无形之力。四神各自落宫影响对应层面。', source: '《太乙统宗宝鉴》' },
  { term: '阳九', category: '高级', brief: '9年灾限', detail: '阳九为太乙大运中的灾限周期，每逢阳九年限，天灾人祸较多。阳九持续9年，与百六交替出现在4617年的大周期中。', source: '《太乙统宗宝鉴》' },
  { term: '百六', category: '高级', brief: '106年行限', detail: '百六为太乙大运中106年的行限周期，百六期间运势波动较大。与阳九共同构成4617年大周期的灾运节奏。', source: '《太乙统宗宝鉴》' },
  { term: '掩', category: '格局', brief: '客掩主，大凶格局', detail: '掩格出现时，客方势力压制主方，主方处于被动挨打状态。用于军事则敌方来犯势不可挡，用于国运则外患侵凌。', source: '《太乙金镜式经》' },
  { term: '迫', category: '格局', brief: '势逼之格', detail: '迫格为形势所迫、不得已而为之的格局。虽主方数值占优，但受制于凶宫位，胜之不武或杀敌一千自损八百。', source: '《太乙统宗宝鉴》' },
  { term: '重审', category: '格局', brief: '太乙与计神同宫', detail: '重审格出现时，当前局势需要重新审视，不可贸然行动。多有反复之象，宜静观其变、谋定后动。', source: '《太乙统宗宝鉴》' },
  { term: '年计', category: '基础', brief: '以年为单位推演', detail: '年计以一年为推演单位，积年直接取用。年计主推国运、大势、长期趋势，太乙排盘最常用的计算类型。', source: '《太乙统宗宝鉴》' },
  { term: '月计', category: '基础', brief: '以月为单位推演', detail: '月计以一月为推演单位，积年需转换为积月数。月计主推月度运程、季节变化。', source: '《太乙统宗宝鉴》' },
  { term: '日计', category: '基础', brief: '以日为单位推演', detail: '日计以一日为推演单位，积年需转换为积日数。日计主推每日吉凶、具体事件。', source: '《太乙统宗宝鉴》' },
  { term: '时计', category: '基础', brief: '以时辰为单位推演', detail: '时计以一个时辰（2小时）为推演单位，积年需转换为积时数。时计主推即时应事、紧急决策。', source: '《太乙统宗宝鉴》' },
];

/* ===== 九宫洛书布局（用于UI展示） ===== */

/**
 * 太乙九宫在UI中的3x3网格布局
 * 注意：太乙九宫编号与方位的对应与洛书不同
 * 按方位排列：
 *   西北(1)  正北(2)  东北(3)
 *   正东(4)  中央(5)  东南(6)
 *   正南(7)  西南(8)  正西(9) ← 但UI常以"上南下北"展示，取决于传统
 *
 * 此处采用"上北下南"的现代方位展示
 */
export const PALACE_GRID_LAYOUT: TaiyiPalaceId[][] = [
  [1, 2, 3],  // 上排: 西北 正北 东北
  [4, 5, 6],  // 中排: 正东 中央 东南
  [9, 8, 7],  // 下排: 正西 西南 正南（注意：为视觉匹配，下排从西到东排列）
];

/* ===== 凶数吉数 ===== */

/** 定算吉凶判定：奇数为阳（偏吉），偶数为阴（偏凶），0为极端 */
export function isDingSuanAuspicious(dingSuan: number): '吉' | '凶' | '中' {
  if (dingSuan === 0) return '凶';
  return dingSuan % 2 === 1 ? '吉' : '中';
}
