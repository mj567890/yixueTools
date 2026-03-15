/**
 * 玉匣记·择吉文化知识库
 * 基于《正统道藏·许真君玉匣记》及《协纪辩方书》编纂
 * 核心提供：诸神所在、六甲旬空、神煞值日、建除十二神、国学解读
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Solar: YxSolar } = require('lunar-javascript');

import { TIAN_GAN, DI_ZHI } from './lunar';

// ═══════════════════════════════════════════════════════
//  接口定义
// ═══════════════════════════════════════════════════════

export interface ZhuShenInfo {
  xunName: string;
  location: string;
  luck: '大吉' | '吉' | '平' | '凶';
  description: string;
  originalText: string;
}

export interface XunKongInfo {
  kongZhi: [string, string];
  isKongDay: boolean;
  description: string;
}

export interface ShenShaItem {
  name: string;
  type: '吉' | '凶';
  description: string;
  origin?: string;
}

export interface JianXingInfo {
  name: string;
  luck: '吉' | '凶' | '平';
  description: string;
  yi: string;
  ji: string;
}

export interface TianShenInfo {
  name: string;
  type: string;
  luck: string;
  description: string;
}

export interface XiuInfo {
  name: string;
  luck: string;
  song: string;
}

export interface DailyKeyword {
  term: string;
  category: string;
  brief: string;
  detail: string;
  origin?: string;
}

export interface DailyQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface YuXiaResult {
  dayGanZhi: string;
  dayGan: string;
  dayZhi: string;
  lunarMonth: number;
  zhuShen: ZhuShenInfo;
  xunKong: XunKongInfo;
  shenSha: {
    jiShen: ShenShaItem[];
    xiongSha: ShenShaItem[];
  };
  tianShen: TianShenInfo;
  jianXing: JianXingInfo;
  xiu: XiuInfo;
  isTianSheDay: boolean;
  dailyKeyword: DailyKeyword;
  dailyQuiz: DailyQuiz;
}

// ═══════════════════════════════════════════════════════
//  诸神所在（基于六甲旬）
// ═══════════════════════════════════════════════════════

/** 旬首地支索引 → 诸神所在 */
const ZHU_SHEN_MAP: Record<number, {
  location: string;
  luck: '大吉' | '吉' | '平' | '凶';
  desc: string;
  text: string;
}> = {
  0: {
    location: '天',
    luck: '吉',
    desc: '诸神朝会天庭，天门大开。此旬宜祭祀祈福、上表进章，诸神归位于天，民间事务当以静守修德为上，不宜大兴土木。',
    text: '《玉匣记》："甲子旬中，诸神朝天。宜祭祀、祈福，忌动土、破土。"',
  },
  10: {
    location: '地',
    luck: '大吉',
    desc: '诸神巡游大地，福泽人间，百事皆宜，为最吉之旬。此时神灵眷顾人间，凡事顺遂，尤利嫁娶、开市、动土诸事。',
    text: '《玉匣记》："甲戌旬中，诸神在地。百事大吉，万福咸集。"',
  },
  8: {
    location: '人间',
    luck: '吉',
    desc: '诸神临于人间，与世同在，诸事可行。此旬神灵与人同处，有求皆应，利于求财、问事、出行。',
    text: '《玉匣记》："甲申旬中，诸神在人间。利见贵人，百事可行。"',
  },
  6: {
    location: '地府',
    luck: '平',
    desc: '诸神巡视阴间地府，人间神佑较薄。此旬宜祭祖追远、超度先人，忌嫁娶、开市等喜庆之事。',
    text: '《玉匣记》："甲午旬中，诸神入地府。宜祭祖追远，忌嫁娶喜庆。"',
  },
  4: {
    location: '天',
    luck: '吉',
    desc: '诸神游于天界，天光普照。此旬天德临世，宜修身养德、祈福求愿，文事尤吉。',
    text: '《玉匣记》："甲辰旬中，诸神游天。宜祈福修德，利文事。"',
  },
  2: {
    location: '地',
    luck: '大吉',
    desc: '诸神出行于大地，恩泽四方，万事亨通。此旬与甲戌旬同为诸神在地之吉旬，诸事皆宜。',
    text: '《玉匣记》："甲寅旬中，诸神出行。恩泽四方，诸事皆宜。"',
  },
};

// ═══════════════════════════════════════════════════════
//  建除十二神
// ═══════════════════════════════════════════════════════

const JIAN_XING_DICT: Record<string, JianXingInfo> = {
  '建': {
    name: '建', luck: '吉',
    description: '建者，万物之始建也。如月建之初，阳气始生，万物萌动。此日宜有作为，利于出行、上任、开工等新事之始。',
    yi: '出行、上任、开工、动土', ji: '诉讼、安葬',
  },
  '除': {
    name: '除', luck: '吉',
    description: '除者，除旧布新也。此日宜扫除不祥、去除晦气，利于治病、扫舍、沐浴更新。为黄道吉日之一。',
    yi: '祭祀、沐浴、求医、扫舍', ji: '嫁娶、远行',
  },
  '满': {
    name: '满', luck: '平',
    description: '满者，盈满之意。物极必反，满则招损。此日宜守成，不宜贪进求多，忌嫁娶、求财等贪多之事。',
    yi: '祭祀、祈福、进人口', ji: '嫁娶、求财、造作',
  },
  '平': {
    name: '平', luck: '吉',
    description: '平者，万事平和也。此日平稳安定，无大吉亦无大凶，宜做平常之事，利修缮、安床等守成之务。',
    yi: '修缮、安床、涂饰', ji: '祈福、求嗣',
  },
  '定': {
    name: '定', luck: '吉',
    description: '定者，安定之义。此日宜定事、定约、定亲，凡事可定而行之。为嫁娶、订盟之吉日。',
    yi: '嫁娶、订盟、安葬、造作', ji: '诉讼、出行',
  },
  '执': {
    name: '执', luck: '平',
    description: '执者，执持固守也。此日宜守不宜攻，利于收纳、捕捉，不利开拓进取。',
    yi: '祭祀、捕捉、收纳', ji: '出行、搬迁、开市',
  },
  '破': {
    name: '破', luck: '凶',
    description: '破者，破败冲散也。日月相冲之时，诸事不利。此日大忌嫁娶、开市、签约等事。唯利破屋坏垣、求医治病。',
    yi: '破屋、治病、求医', ji: '嫁娶、开市、签约、出行',
  },
  '危': {
    name: '危', luck: '凶',
    description: '危者，危险高峻也。此日宜居安思危，不宜冒险。忌登高、远行、动工等事。但危中有机，利于安床、祭祀。',
    yi: '祭祀、安床、收纳', ji: '登高、远行、动土、嫁娶',
  },
  '成': {
    name: '成', luck: '吉',
    description: '成者，万事成就也。天地合德，凡事有成。此日为大吉之日，百事皆宜，尤利嫁娶、开市、签约、入宅。',
    yi: '嫁娶、开市、签约、入宅、安葬', ji: '诉讼',
  },
  '收': {
    name: '收', luck: '吉',
    description: '收者，收藏聚敛也。此日利于收获、纳财、入库，为求财聚财之吉日。不宜开始新事。',
    yi: '纳财、收获、入库、安葬', ji: '开市、出行、动土',
  },
  '开': {
    name: '开', luck: '吉',
    description: '开者，开通开发也。天门大开，万物生长。此日为黄道吉日之一，宜开市、开业、开工等一切新始之事。',
    yi: '开市、开业、出行、嫁娶', ji: '安葬',
  },
  '闭': {
    name: '闭', luck: '凶',
    description: '闭者，闭塞不通也。天地闭藏，万物收敛。此日宜静不宜动，利于收纳、安葬，忌出行、开市等事。',
    yi: '收纳、安葬、修缮', ji: '出行、开市、嫁娶、动土',
  },
};

// ═══════════════════════════════════════════════════════
//  神煞词典（吉神·凶煞文化解读）
// ═══════════════════════════════════════════════════════

const SHEN_SHA_DICT: Record<string, { type: '吉' | '凶'; desc: string; origin?: string }> = {
  // ── 吉神 ──
  '天德': { type: '吉', desc: '天之德气，最为吉利之神。所值之日百福并臻，凶煞退避，化险为夷。', origin: '《协纪辩方书》："天德者，天之恩德也。"' },
  '月德': { type: '吉', desc: '月之德星，月中至吉之神。利于修造、嫁娶、祈福，能制诸凶。', origin: '《协纪辩方书》："月德者，月中施德之辰。"' },
  '天恩': { type: '吉', desc: '上天降恩，宜受恩赐、拜表、上官。此日行善积德，必获天佑。' },
  '天赦': { type: '吉', desc: '天赦日为百神降世之日，至为吉利。上天开恩赦免，百罪可消。', origin: '《玉匣记》："天赦日者，天帝赦免万物之日也。"' },
  '月恩': { type: '吉', desc: '月中施恩之日，宜嫁娶、纳采、上官赴任。' },
  '四相': { type: '吉', desc: '四时旺相之气，利于出行、嫁娶、造作。' },
  '时德': { type: '吉', desc: '得时之德，天时地利，宜行善事。' },
  '民日': { type: '吉', desc: '利于百姓之日，宜安居、嫁娶、开市。' },
  '三合': { type: '吉', desc: '三合局成，天地人和谐。利于合作、嫁娶、开市。', origin: '三合者，申子辰、亥卯未、寅午戌、巳酉丑也。' },
  '天喜': { type: '吉', desc: '天降喜气，利于嫁娶、宴会、庆典等喜庆之事。' },
  '天医': { type: '吉', desc: '天医临值，利于求医问药、治病疗疾。' },
  '母仓': { type: '吉', desc: '如母之仓，丰盈充裕。利于纳财、开仓、求财。' },
  '阳德': { type: '吉', desc: '阳气之德，万物生长。宜出行、上任、嫁娶。' },
  '五富': { type: '吉', desc: '五福临门之日，利于开市、纳财、求财。' },
  '福德': { type: '吉', desc: '福德兼备之日，百事吉利。' },
  '玉堂': { type: '吉', desc: '玉堂黄道，大吉之日。利于嫁娶、开市、入宅。', origin: '玉堂为黄道六神之一。' },
  '金匮': { type: '吉', desc: '金匮黄道，利于纳财、开业。如金匮藏宝，财运亨通。', origin: '金匮为黄道六神之一。' },
  '司命': { type: '吉', desc: '司命黄道，掌管人间寿命。利于祈福、求寿。', origin: '司命为黄道六神之一。' },
  '明堂': { type: '吉', desc: '明堂黄道，光明正大。利于入学、上任。', origin: '明堂为黄道六神之一。' },
  '天德合': { type: '吉', desc: '天德之合，吉力仅次于天德。凡事逢之趋吉避凶。' },
  '月德合': { type: '吉', desc: '月德之合，吉力仅次于月德，利于诸事。' },
  '天愿': { type: '吉', desc: '天之所愿，宜祈福、上表、嫁娶。' },
  '六合': { type: '吉', desc: '六合者，子丑合、寅亥合等，主和合。利于嫁娶、交易、合作。' },
  '五合': { type: '吉', desc: '天干五合，主和谐顺利。利于签约、合作。' },
  '不将': { type: '吉', desc: '不将日，阴阳和合不相冲克。利于嫁娶。', origin: '《协纪辩方书》："不将者，阴阳不相征战也。"' },
  '圣心': { type: '吉', desc: '圣人之心所向，利于祈福、祭祀。' },
  '益后': { type: '吉', desc: '利于后嗣之日，宜求子、祈福。' },
  '续世': { type: '吉', desc: '续世传家之日，利于嫁娶、纳采。' },
  '驿马': { type: '吉', desc: '驿马星动，利于出行、赴任、搬迁。' },
  '天后': { type: '吉', desc: '天后临值，利于嫁娶、求财。' },
  '普护': { type: '吉', desc: '普遍护佑之日，百事皆宜。' },
  '解神': { type: '吉', desc: '解神临值，可解百煞。凡遇凶煞有解神同临则凶力减。' },
  '敬安': { type: '吉', desc: '恭敬安泰之日，宜祭祀、安床。' },
  '要安': { type: '吉', desc: '安泰之日，宜安居、修缮。' },
  '除神': { type: '吉', desc: '除去灾祸之神，利于治病、扫舍、去秽。' },
  '鸣犬': { type: '吉', desc: '鸣犬对日，宜祭祀、畋猎。' },
  '天马': { type: '吉', desc: '天马临值，利于出行、赴任。' },
  '天仓': { type: '吉', desc: '天仓星动，利于纳财、收藏。' },
  '王日': { type: '吉', desc: '王者之日，利于上任、出行。' },
  '守日': { type: '吉', desc: '宜守不宜攻之日，利于修缮、安居。' },
  '官日': { type: '吉', desc: '利于官府之事，宜上任、拜官。' },
  '相日': { type: '吉', desc: '辅相之日，利于谒贵人、求助。' },
  '吉期': { type: '吉', desc: '吉庆之期，百事皆宜。' },
  '宝光': { type: '吉', desc: '宝光照耀，利于求财、纳宝。' },
  '月财': { type: '吉', desc: '月中财星，利于求财、纳财。' },

  // ── 凶煞 ──
  '天刑': { type: '凶', desc: '天降刑罚之日，忌诉讼、动土、嫁娶。宜守静修身。', origin: '天刑为黑道六神之一。' },
  '白虎': { type: '凶', desc: '白虎当值，主血光之灾。忌嫁娶、动土、出行。有天德月德可制。', origin: '白虎为黑道六神之一。' },
  '朱雀': { type: '凶', desc: '朱雀当值，主口舌是非。忌诉讼、签约。', origin: '朱雀为黑道六神之一。' },
  '勾陈': { type: '凶', desc: '勾陈当值，主牵连纠缠。忌诉讼、签约、出行。', origin: '勾陈为黑道六神之一。' },
  '玄武': { type: '凶', desc: '玄武当值，主暗昧盗害。忌出行、纳财、开市。', origin: '玄武为黑道六神之一。' },
  '天牢': { type: '凶', desc: '天牢当值，主幽禁困厄。忌出行、搬迁、嫁娶。', origin: '天牢为黑道六神之一。' },
  '劫煞': { type: '凶', desc: '劫煞临值，主劫掠灾厄。忌出行、纳财。宜守静。' },
  '月煞': { type: '凶', desc: '月中煞星当值，诸事不利，宜谨慎行事。' },
  '月刑': { type: '凶', desc: '月之刑星，忌嫁娶、动土。此日多有阻碍。' },
  '月害': { type: '凶', desc: '月之害星，主口舌暗害。忌签约、合作。' },
  '五虚': { type: '凶', desc: '五行虚空之日，诸事不宜。忌开市、纳财。' },
  '五离': { type: '凶', desc: '五行离散之日，忌嫁娶、合作。' },
  '大耗': { type: '凶', desc: '大耗财之日，忌纳财、开市、求财。宜节俭。' },
  '灾煞': { type: '凶', desc: '灾星临值，宜谨慎防灾。忌出行、动土。' },
  '天火': { type: '凶', desc: '天火临值，忌建造、安灶。有火灾之虞。' },
  '河魁': { type: '凶', desc: '河魁凶星，主瘟疫疾病。忌安葬。' },
  '五墓': { type: '凶', desc: '五行墓库之日，忌安葬、入宅。' },
  '归忌': { type: '凶', desc: '归忌日，忌远行归家。出行不利归来。' },
  '月厌': { type: '凶', desc: '月之所厌，诸事不利。忌嫁娶、开市。' },
  '往亡': { type: '凶', desc: '往亡日，出行大凶。忌一切远行之事。' },
  '血忌': { type: '凶', desc: '血忌日，忌针灸、手术。见血不利。' },
  '重日': { type: '凶', desc: '重日者，忌安葬。恐有重丧之忧。' },
  '天贼': { type: '凶', desc: '天贼日，忌纳财、出行。恐有失窃之虞。' },
  '元武': { type: '凶', desc: '元武当值，主暗昧不明。忌出行、签约。' },
  '四击': { type: '凶', desc: '四方冲击之日，忌动土、出行。' },
  '四穷': { type: '凶', desc: '四穷日，忌开市、纳财。' },
  '土符': { type: '凶', desc: '土符日，忌动土、破土、修造。' },
  '地囊': { type: '凶', desc: '地囊日，忌安葬、入宅。' },
  '八专': { type: '凶', desc: '八专日，忌嫁娶。阴阳不调。' },
  '大煞': { type: '凶', desc: '大煞临值，诸事大忌。宜静守不动。' },
  '小耗': { type: '凶', desc: '小耗财之日，忌纳财。小有损耗。' },
  '受死': { type: '凶', desc: '受死日，百事忌用。宜静守。' },
  '四废': { type: '凶', desc: '四废日，百事无成。忌用事。' },
  '四忌': { type: '凶', desc: '四季所忌之日，宜谨慎。' },
  '九空': { type: '凶', desc: '九空日，事多落空。忌签约、纳财。' },
  '九坎': { type: '凶', desc: '九坎日，行事多有坎坷。忌出行。' },
  '九焦': { type: '凶', desc: '九焦日，事多焦灼。忌动火、嫁娶。' },
  '月破': { type: '凶', desc: '月破大耗，诸事不宜。忌嫁娶、签约、出行。', origin: '日支冲月支为月破。' },
  '天吏': { type: '凶', desc: '天吏临值，主刑狱之事。忌诉讼。' },
  '触水龙': { type: '凶', desc: '触水龙日，忌行船、渡水。' },
  '八风': { type: '凶', desc: '八方来风之日，忌出行。' },
  '单阴': { type: '凶', desc: '孤阴不长之日，忌嫁娶。' },
  '孤阳': { type: '凶', desc: '独阳不生之日，忌嫁娶。' },
  '阴错': { type: '凶', desc: '阴阳错乱之日，忌嫁娶、签约。' },
  '死气': { type: '凶', desc: '死气临值，宜静不宜动。忌开市、出行。' },
  '岁薄': { type: '凶', desc: '岁之薄处，忌大事。' },
  '逐阵': { type: '凶', desc: '逐阵日，忌出行、征战。' },
  '阴阳俱错': { type: '凶', desc: '阴阳皆错，诸事不宜。' },
  '厌对': { type: '凶', desc: '厌对之日，忌嫁娶。' },
  '招摇': { type: '凶', desc: '招摇星动，忌出行、搬迁。' },
  '大退': { type: '凶', desc: '大退日，百事退缩。忌开市。' },
  '咸池': { type: '凶', desc: '咸池桃花，忌嫁娶（恐有桃花之劫）。' },
  '阴将': { type: '凶', desc: '阴将之日，忌嫁娶。' },
  '死神': { type: '凶', desc: '死神临值，百事忌用。宜守静。' },
  '天罡': { type: '凶', desc: '天罡星值日，主刚烈凶险。忌出行、诉讼。' },
  '孤辰': { type: '凶', desc: '孤辰寡宿之日，忌嫁娶。' },
  '阴阳交破': { type: '凶', desc: '阴阳交破，诸事不利。忌大事。' },
  '殃败': { type: '凶', desc: '殃败日，忌嫁娶、开市。' },
  '小红砂': { type: '凶', desc: '小红砂日，忌出行。' },
  '地火': { type: '凶', desc: '地火日，忌建造、安灶。' },
  '荒芜': { type: '凶', desc: '荒芜日，忌播种、动土。' },
  '四耗': { type: '凶', desc: '四耗日，忌纳财、开市。' },
  '披麻': { type: '凶', desc: '披麻星临，忌嫁娶、庆典。' },
  '天狗': { type: '凶', desc: '天狗星值日，忌祈福。' },
  '雷公': { type: '凶', desc: '雷公日，忌建造。' },
  '了戾': { type: '凶', desc: '了戾日，忌嫁娶。' },
  '绝烟': { type: '凶', desc: '绝烟日，忌安灶、迁居。' },
  '四绝': { type: '凶', desc: '四绝日，立春立夏立秋立冬前一日，天地绝气。百事忌用。', origin: '《协纪辩方书》载四绝日' },
  '四离': { type: '凶', desc: '四离日，春分秋分夏至冬至前一日，阴阳分离。忌用事。', origin: '《协纪辩方书》载四离日' },
};

// ═══════════════════════════════════════════════════════
//  天赦日判定
// ═══════════════════════════════════════════════════════

function getSeason(lunarMonth: number): string {
  const m = Math.abs(lunarMonth);
  if (m >= 1 && m <= 3) return '春';
  if (m >= 4 && m <= 6) return '夏';
  if (m >= 7 && m <= 9) return '秋';
  return '冬';
}

const TIAN_SHE_MAP: Record<string, string> = {
  '春': '戊寅', '夏': '甲午', '秋': '戊申', '冬': '甲子',
};

// ═══════════════════════════════════════════════════════
//  值日天神说明
// ═══════════════════════════════════════════════════════

const TIAN_SHEN_DESC: Record<string, string> = {
  '青龙': '青龙黄道，大吉。主文昌运旺，利于嫁娶、开市、入宅。',
  '明堂': '明堂黄道，大吉。光明正大之神，利于入学、上任。',
  '天刑': '天刑黑道，凶。主刑狱之事，忌诉讼、嫁娶。唯利于执法公务。',
  '朱雀': '朱雀黑道，凶。主口舌是非，忌签约、合作。',
  '金匮': '金匮黄道，吉。如金匮藏宝，利于纳财、开业。',
  '天德': '天德黄道，大吉。天之恩德临世，百福并臻。',
  '白虎': '白虎黑道，凶。主血光刑伤，忌嫁娶、动土。',
  '玉堂': '玉堂黄道，大吉。玉堂金殿之神，百事皆宜。',
  '天牢': '天牢黑道，凶。主困厄幽禁，忌出行、搬迁。',
  '玄武': '玄武黑道，凶。主暗昧盗害，忌出行、纳财。',
  '司命': '司命黄道，吉。掌管寿命之神，利于祈福、嫁娶。',
  '勾陈': '勾陈黑道，凶。主牵连纠缠，忌签约、出行。',
};

// ═══════════════════════════════════════════════════════
//  国学小课堂·关键词素材库
// ═══════════════════════════════════════════════════════

const KEYWORD_TIAN_SHE: DailyKeyword = {
  term: '天赦日',
  category: '特殊吉日',
  brief: '天赦日是一年中最为吉祥的日子之一，相传此日上天开恩赦免万物。',
  detail: '天赦日源自古代天文历法，每季一日。春季戊寅日、夏季甲午日、秋季戊申日、冬季甲子日为天赦日。《玉匣记》载："天赦日者，天帝赦免万物之日也。"此日天开恩门，地闭祸窦，百事皆宜。古人最重此日，认为在天赦日行善积德、祈福祭祀，必获天佑。民间有"天赦日，万事吉"之说。',
  origin: '《玉匣记》《协纪辩方书》',
};

const KEYWORD_XUN_KONG: DailyKeyword = {
  term: '六甲旬空',
  category: '择吉术语',
  brief: '旬空是干支纪日中的重要概念——六十甲子中每旬十日配十干十二支，必有二支落空。',
  detail: '天干十位，地支十二位。每旬以甲起首，十天干依次配十二地支中的十位，余二支"无天干可配"，谓之"旬空"或"空亡"。如甲子旬中甲子至癸酉共配十支，戌亥二支落空。旬空在择吉中意味着该日某些地支所代表的力量"虚而不实"。《协纪辩方书》云："空亡者，天地之气不及也。"故逢旬空之日，宜审慎行事，所谋之事恐有落空之虞。',
  origin: '《协纪辩方书》',
};

const KEYWORD_ZHU_SHEN: DailyKeyword = {
  term: '诸神方所',
  category: '玉匣记',
  brief: '《玉匣记》以六甲旬为周期，标注诸神所在方位，是择吉的重要依据。',
  detail: '诸神方所是《玉匣记》的核心内容之一。古人认为天地诸神并非时刻留驻一处，而是按六甲旬的规律在天、地、人间、地府之间巡行。诸神在地时，神灵眷顾人间，百事大吉；诸神在天时，天门大开宜祭祀祈福；诸神在地府时，宜祭祖追远。此说体现了古人"天人合一"的宇宙观——人之行事须顺应天地神灵的运行节律。',
  origin: '《玉匣记·诸神所在篇》',
};

function getKeywordForJianXing(jxName: string): DailyKeyword {
  const jx = JIAN_XING_DICT[jxName];
  if (!jx) return KEYWORD_ZHU_SHEN;
  return {
    term: `建除十二神·${jxName}`,
    category: '建除择日',
    brief: `今日建除值"${jxName}"日。${jx.description.slice(0, 30)}...`,
    detail: `${jx.description}\n\n建除十二神是古代择日术的核心体系之一，源自月建与日辰的关系。十二神依次为：建、除、满、平、定、执、破、危、成、收、开、闭。其中除、危、定、执、成、开六日为黄道吉日，建、满、平、破、收、闭六日为黑道凶日。不过传统择吉讲究"制化"，凶日遇吉神亦可化解，吉日逢凶煞亦须谨慎。《协纪辩方书》云："建除之法，论日之吉凶也。"`,
    origin: '《协纪辩方书·建除篇》',
  };
}

function getKeywordForTianShen(tsName: string): DailyKeyword {
  const desc = TIAN_SHEN_DESC[tsName] || '';
  return {
    term: `值日天神·${tsName}`,
    category: '黄黑道',
    brief: `今日值日天神为「${tsName}」。${desc.slice(0, 30)}`,
    detail: `${desc}\n\n黄道黑道之说源于古代天文星占。古人将天空周天分为十二宫，每宫有一神值日，六吉六凶。六吉神为青龙、明堂、金匮、天德、玉堂、司命，谓之"黄道"；六凶神为天刑、朱雀、白虎、天牢、玄武、勾陈，谓之"黑道"。黄道日百事皆宜，黑道日诸事须慎。此即民间常说"黄道吉日"之由来。`,
    origin: '《协纪辩方书·黄黑道篇》',
  };
}

// ═══════════════════════════════════════════════════════
//  国学小课堂·每日测验素材
// ═══════════════════════════════════════════════════════

function getQuizForJianXing(jxName: string): DailyQuiz {
  const options = ['建', '除', '成', '破', '开', '闭'];
  const jiOptions = options.filter(o => ['破', '危', '闭'].includes(o));
  const jiItem = jiOptions[Math.abs(jxName.charCodeAt(0)) % jiOptions.length] || '破';

  return {
    question: `今日建除十二神为「${jxName}」。以下哪一日被称为"万事成就"之日？`,
    options: ['成日', '建日', '开日', '满日'],
    correctIndex: 0,
    explanation: '成者，万事成就也。天地合德，凡事有成。《协纪辩方书》将「成日」列为黄道吉日之一，百事皆宜，尤利嫁娶、开市、签约。与之相对的「破日」则为日月相冲，诸事不利。',
  };
}

function getQuizForHuangDao(tianShenType: string): DailyQuiz {
  return {
    question: `今日为「${tianShenType}」日。民间常说"黄道吉日"，请问以下哪位不属于黄道六神？`,
    options: ['白虎', '青龙', '玉堂', '金匮'],
    correctIndex: 0,
    explanation: '黄道六神为：青龙、明堂、金匮、天德、玉堂、司命，皆为吉神。白虎属于黑道六神（天刑、朱雀、白虎、天牢、玄武、勾陈），主凶。不过"白虎"逢天德、月德同值时凶力可解。',
  };
}

function getQuizForXunKong(): DailyQuiz {
  return {
    question: '六甲旬空是择吉中的重要概念。"旬空"产生的原因是什么？',
    options: ['天干十位配地支十二位，每旬余二支', '某些日子不吉利', '神灵不在之时', '月相变化所致'],
    correctIndex: 0,
    explanation: '旬空的本质是数学问题：天干十位，地支十二位，每旬十日中十天干只能配十个地支，剩余两个地支"无干可配"，故称"空亡"。这反映了古人将数理规律融入天人观念的智慧。',
  };
}

// ═══════════════════════════════════════════════════════
//  核心计算函数
// ═══════════════════════════════════════════════════════

/**
 * 获取指定日期的玉匣记完整信息
 */
export function getYuXiaInfo(year: number, month: number, day: number): YuXiaResult {
  const solar = YxSolar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  // ── 基础干支 ──
  const dayGZ: string = lunar.getDayInGanZhi();
  const dayGan = dayGZ[0];
  const dayZhi = dayGZ[1];
  const ganIdx = TIAN_GAN.indexOf(dayGan);
  const zhiIdx = DI_ZHI.indexOf(dayZhi);
  const lunarMonth = Math.abs(lunar.getMonth());

  // ── 诸神所在 ──
  const xunShouZhi = (zhiIdx - ganIdx + 12) % 12;
  const xunNames: Record<number, string> = {
    0: '甲子旬', 10: '甲戌旬', 8: '甲申旬', 6: '甲午旬', 4: '甲辰旬', 2: '甲寅旬',
  };
  const zhuShenData = ZHU_SHEN_MAP[xunShouZhi] || ZHU_SHEN_MAP[0];
  const zhuShen: ZhuShenInfo = {
    xunName: xunNames[xunShouZhi] || '甲子旬',
    location: zhuShenData.location,
    luck: zhuShenData.luck,
    description: zhuShenData.desc,
    originalText: zhuShenData.text,
  };

  // ── 六甲旬空 ──
  const kong1 = (xunShouZhi - 2 + 12) % 12;
  const kong2 = (xunShouZhi - 1 + 12) % 12;
  const kongZhi: [string, string] = [DI_ZHI[kong1], DI_ZHI[kong2]];
  const isKongDay = zhiIdx === kong1 || zhiIdx === kong2;
  const xunKong: XunKongInfo = {
    kongZhi,
    isKongDay,
    description: isKongDay
      ? `今日地支「${dayZhi}」正在旬空之中。《协纪辩方书》云"空亡者，天地之气不及也"，所谋之事恐有落空之虞，宜审慎行事。`
      : `今日不在旬空之中，${zhuShen.xunName}旬空为「${kongZhi[0]}${kongZhi[1]}」。`,
  };

  // ── 神煞 ──
  const rawJiShen: string[] = lunar.getDayJiShen() || [];
  const rawXiongSha: string[] = lunar.getDayXiongSha() || [];
  const jiShen: ShenShaItem[] = rawJiShen.map(name => {
    const info = SHEN_SHA_DICT[name];
    return {
      name,
      type: '吉' as const,
      description: info?.desc || '吉神临值，利于行事。',
      origin: info?.origin,
    };
  });
  const xiongSha: ShenShaItem[] = rawXiongSha.map(name => {
    const info = SHEN_SHA_DICT[name];
    return {
      name,
      type: '凶' as const,
      description: info?.desc || '凶煞当值，宜谨慎行事。',
      origin: info?.origin,
    };
  });

  // ── 值日天神 ──
  const tsName: string = lunar.getDayTianShen() || '';
  const tsType: string = lunar.getDayTianShenType() || '';
  const tsLuck: string = lunar.getDayTianShenLuck() || '';
  const tianShen: TianShenInfo = {
    name: tsName,
    type: tsType,
    luck: tsLuck,
    description: TIAN_SHEN_DESC[tsName] || `${tsName}值日。`,
  };

  // ── 建除十二神 ──
  const jxName: string = lunar.getZhiXing() || '';
  const jianXing: JianXingInfo = JIAN_XING_DICT[jxName] || {
    name: jxName, luck: '平' as const, description: '', yi: '', ji: '',
  };

  // ── 二十八宿 ──
  const xiuName: string = lunar.getXiu() || '';
  const xiuLuck: string = lunar.getXiuLuck() || '';
  const xiuSong: string = lunar.getXiuSong() || '';
  const xiu: XiuInfo = { name: xiuName, luck: xiuLuck, song: xiuSong };

  // ── 天赦日 ──
  const season = getSeason(lunarMonth);
  const isTianSheDay = dayGZ === TIAN_SHE_MAP[season];

  // ── 每日关键词（按优先级选取最值得了解的知识点） ──
  let dailyKeyword: DailyKeyword;
  if (isTianSheDay) {
    dailyKeyword = KEYWORD_TIAN_SHE;
  } else if (isKongDay) {
    dailyKeyword = KEYWORD_XUN_KONG;
  } else if (['成', '开', '破', '闭'].includes(jxName)) {
    dailyKeyword = getKeywordForJianXing(jxName);
  } else if (tsType) {
    dailyKeyword = getKeywordForTianShen(tsName);
  } else {
    dailyKeyword = KEYWORD_ZHU_SHEN;
  }

  // ── 每日测验 ──
  let dailyQuiz: DailyQuiz;
  const dayNum = year * 10000 + month * 100 + day;
  const quizType = dayNum % 3;
  if (quizType === 0) {
    dailyQuiz = getQuizForJianXing(jxName);
  } else if (quizType === 1) {
    dailyQuiz = getQuizForHuangDao(tsType);
  } else {
    dailyQuiz = getQuizForXunKong();
  }

  return {
    dayGanZhi: dayGZ,
    dayGan,
    dayZhi,
    lunarMonth,
    zhuShen,
    xunKong,
    shenSha: { jiShen, xiongSha },
    tianShen,
    jianXing,
    xiu,
    isTianSheDay,
    dailyKeyword,
    dailyQuiz,
  };
}
