/**
 * 太乙神数 —— 经典案例库
 * 据《太乙金镜式经》《太乙统宗宝鉴》及历代太乙相关典籍
 */

import type { ClassicalCase } from './types';

export const CLASSICAL_CASES: ClassicalCase[] = [
  // ===== 先秦 =====
  {
    title: '武王伐纣',
    dynasty: '西周',
    source: '《太乙统宗宝鉴》',
    year: -1046,
    month: 1,
    calcType: 'year',
    interpretation: '太乙在吉宫，主算大于客算，主将旺相，利于兴师伐纣。始击在主方，先发制人。',
    historicalOutcome: '武王克商，纣王自焚，周朝建立。',
    tags: ['战争', '朝代更替', '年计'],
  },
  {
    title: '周幽王烽火戏诸侯',
    dynasty: '西周',
    source: '《太乙统宗宝鉴》',
    year: -771,
    calcType: 'year',
    interpretation: '太乙临凶宫，现掩格，客掩主。国运衰败之象，君臣失和。',
    historicalOutcome: '犬戎攻破镐京，西周灭亡。',
    tags: ['国运', '灾异', '年计'],
  },
  // ===== 秦汉 =====
  {
    title: '秦始皇统一六国',
    dynasty: '秦',
    source: '《太乙金镜式经》',
    year: -221,
    calcType: 'year',
    interpretation: '太乙临乾一宫（吉），主算远大于客算，定算为奇数。主将旺相，大利征伐。',
    historicalOutcome: '秦灭六国，统一天下，建立秦朝。',
    tags: ['战争', '统一', '年计'],
  },
  {
    title: '楚汉争霸·垓下之战',
    dynasty: '西汉',
    source: '《太乙统宗宝鉴》',
    year: -202,
    calcType: 'year',
    interpretation: '客将（项羽方）五行受制，主将（刘邦方）得时令旺相。掩格不成，主胜客败。',
    historicalOutcome: '刘邦大胜，项羽乌江自刎，西汉建立。',
    tags: ['战争', '年计'],
  },
  {
    title: '王莽篡汉',
    dynasty: '新',
    source: '《太乙统宗宝鉴》',
    year: 9,
    calcType: 'year',
    interpretation: '重审格成立，太乙与计神同宫，事多反复。阳九运限将至。',
    historicalOutcome: '王莽篡位建新朝，十余年后覆灭。',
    tags: ['国运', '朝代更替', '年计'],
  },
  {
    title: '赤壁之战',
    dynasty: '东汉',
    source: '《太乙金镜式经》',
    year: 208,
    month: 11,
    calcType: 'month',
    interpretation: '客算（曹操方）虽大但客将受克于月令。文昌在吉宫利智谋。始击在客方，客先动但不利。',
    historicalOutcome: '孙刘联军以少胜多，大败曹军，奠定三国鼎立格局。',
    tags: ['战争', '月计'],
  },
  // ===== 三国两晋 =====
  {
    title: '诸葛亮北伐',
    dynasty: '蜀汉',
    source: '《太乙统宗宝鉴》',
    year: 228,
    calcType: 'year',
    interpretation: '主算略大于客算，但太乙临中宫（绝地），迫格隐现。主将虽强，形势所逼。',
    historicalOutcome: '六出祁山未竟全功，诸葛亮病逝五丈原。',
    tags: ['战争', '年计'],
  },
  {
    title: '永嘉之乱',
    dynasty: '西晋',
    source: '《太乙统宗宝鉴》',
    year: 311,
    calcType: 'year',
    interpretation: '太乙临凶宫，阳九运限期间。客掩主，外族入侵之象。五福散乱，君臣民基分离。',
    historicalOutcome: '匈奴攻破洛阳，西晋灭亡，五胡乱华开始。',
    tags: ['国运', '灾异', '年计'],
  },
  // ===== 隋唐 =====
  {
    title: '隋统一南北',
    dynasty: '隋',
    source: '《太乙金镜式经》',
    year: 589,
    calcType: 'year',
    interpretation: '太乙临吉宫，和格成立，主客将五行相生。统一大势已成。',
    historicalOutcome: '隋灭陈朝，结束南北朝近三百年分裂。',
    tags: ['统一', '年计'],
  },
  {
    title: '安史之乱',
    dynasty: '唐',
    source: '《太乙金镜式经》',
    year: 755,
    month: 11,
    calcType: 'year',
    interpretation: '太乙临凶宫，击格成立（始击与太乙对冲）。关神入太乙宫，阻隔不通。百六运限中。',
    historicalOutcome: '安禄山起兵叛乱，唐朝由盛转衰。',
    tags: ['灾异', '战争', '年计'],
  },
  {
    title: '唐朝灭亡',
    dynasty: '唐',
    source: '《太乙统宗宝鉴》',
    year: 907,
    calcType: 'year',
    interpretation: '太乙临绝地（5宫），重审格。阳九将至，国运终结之象。',
    historicalOutcome: '朱温篡唐，唐朝灭亡，进入五代十国。',
    tags: ['国运', '朝代更替', '年计'],
  },
  // ===== 宋元 =====
  {
    title: '靖康之变',
    dynasty: '北宋',
    source: '《太乙金镜式经》',
    year: 1127,
    month: 1,
    calcType: 'year',
    interpretation: '太乙在凶宫，掩格大成。客算远大于主算，客将旺而主将衰。阳九运限。国运至暗。',
    historicalOutcome: '金兵攻破汴京，掳走徽钦二帝，北宋灭亡。',
    tags: ['国运', '战争', '灾异', '年计'],
  },
  {
    title: '岳飞北伐',
    dynasty: '南宋',
    source: '《太乙统宗宝鉴》',
    year: 1140,
    calcType: 'year',
    interpretation: '主算大于客算，飞格几近成立。主将旺相大利进攻。然始击在客方，主方被迫撤军。',
    historicalOutcome: '岳飞连战连捷，但被十二道金牌召回，功败垂成。',
    tags: ['战争', '年计'],
  },
  {
    title: '蒙古灭金',
    dynasty: '金/蒙古',
    source: '《太乙统宗宝鉴》',
    year: 1234,
    calcType: 'year',
    interpretation: '客方（蒙古）算大且将旺，掩格成立。金朝太乙临凶宫，运势已尽。',
    historicalOutcome: '蒙宋联军攻灭金朝。',
    tags: ['战争', '朝代更替', '年计'],
  },
  {
    title: '文天祥抗元',
    dynasty: '南宋',
    source: '《太乙金镜式经》',
    year: 1278,
    calcType: 'year',
    interpretation: '主算远小于客算，太乙在凶宫。迫格成立，虽有忠义之心，大势不可逆。',
    historicalOutcome: '文天祥兵败被俘，南宋灭亡。',
    tags: ['国运', '战争', '年计'],
  },
  // ===== 明清 =====
  {
    title: '朱元璋建明',
    dynasty: '明',
    source: '《太乙统宗宝鉴》',
    year: 1368,
    calcType: 'year',
    interpretation: '太乙临吉宫，主算大于客算。飞格成立，三星（太乙/计神/文昌）皆在吉位。开国大吉。',
    historicalOutcome: '朱元璋北伐成功，建立明朝，恢复汉室。',
    tags: ['国运', '朝代更替', '年计'],
  },
  {
    title: '土木堡之变',
    dynasty: '明',
    source: '《太乙金镜式经》',
    year: 1449,
    month: 8,
    calcType: 'month',
    interpretation: '客掩主，击格同现。太乙在凶宫，始击与太乙对冲。天子亲征大忌。',
    historicalOutcome: '英宗御驾亲征被俘，明军精锐尽丧。于谦力挽狂澜守住北京。',
    tags: ['战争', '灾异', '月计'],
  },
  {
    title: '李自成攻入北京',
    dynasty: '明',
    source: '《太乙统宗宝鉴》',
    year: 1644,
    month: 3,
    calcType: 'year',
    interpretation: '太乙在凶宫，掩格与重审同现。阳九百六交替之际。三百年王气已尽。',
    historicalOutcome: '崇祯帝自缢煤山，明朝灭亡。清军随后入关。',
    tags: ['国运', '朝代更替', '年计'],
  },
  {
    title: '康熙平三藩',
    dynasty: '清',
    source: '《太乙金镜式经》',
    year: 1681,
    calcType: 'year',
    interpretation: '主算大于客算，主将旺相。和格成立后转胜，太乙在吉宫。平定之象。',
    historicalOutcome: '康熙帝平定三藩之乱，清朝统一大业完成。',
    tags: ['战争', '国运', '年计'],
  },
  {
    title: '鸦片战争',
    dynasty: '清',
    source: '《太乙统宗宝鉴》',
    year: 1840,
    calcType: 'year',
    interpretation: '客算远大于主算，客将（西方金）旺相克主将。掩格大凶。百六运限中。',
    historicalOutcome: '清军大败，被迫签订《南京条约》，割地赔款。',
    tags: ['战争', '国运', '年计'],
  },
  {
    title: '甲午战争',
    dynasty: '清',
    source: '《太乙金镜式经》',
    year: 1894,
    calcType: 'year',
    interpretation: '甲午年太乙积年为阳九前夕。客算强于主算，击格与关格并现。海军覆灭之兆。',
    historicalOutcome: '北洋水师全军覆没，签订《马关条约》。',
    tags: ['战争', '国运', '年计'],
  },
  {
    title: '辛亥革命',
    dynasty: '清/民国',
    source: '《太乙统宗宝鉴》',
    year: 1911,
    month: 10,
    calcType: 'year',
    interpretation: '太乙与旧制相冲，重审格成立。天命更替，旧朝气数已尽。主客逆转之象。',
    historicalOutcome: '清帝退位，中华民国成立，两千年帝制终结。',
    tags: ['国运', '朝代更替', '年计'],
  },
  // ===== 近现代 =====
  {
    title: '抗日战争爆发',
    dynasty: '民国',
    source: '太乙分析',
    year: 1937,
    month: 7,
    calcType: 'year',
    interpretation: '客掩主格显现，但太乙渐移吉宫方向。主方虽弱但不灭，持久战有望转机。',
    historicalOutcome: '全面抗战爆发，历经八年最终取得胜利。',
    tags: ['战争', '年计'],
  },
  {
    title: '新中国成立',
    dynasty: '现代',
    source: '太乙分析',
    year: 1949,
    month: 10,
    day: 1,
    calcType: 'year',
    interpretation: '太乙归正位，飞格隐现。主算大增，新政权气运初开。和格主万民归心。',
    historicalOutcome: '中华人民共和国成立。',
    tags: ['国运', '年计'],
  },
  // ===== 天文灾异类 =====
  {
    title: '汉武帝元光元年日食',
    dynasty: '西汉',
    source: '《太乙统宗宝鉴》',
    year: -134,
    calcType: 'year',
    interpretation: '太乙临离七宫（凶），文昌在坤八宫。天象异变与太乙凶宫相应。',
    historicalOutcome: '武帝借日食罢免窦婴等旧臣，开启变革。',
    tags: ['天时', '灾异', '年计'],
  },
  {
    title: '贞观元年大旱',
    dynasty: '唐',
    source: '《太乙金镜式经》',
    year: 627,
    calcType: 'year',
    interpretation: '太乙在火宫（离七），文昌亦入火位。火气太盛，天时干旱之象。',
    historicalOutcome: '贞观元年关中大旱，太宗下诏罪己，减免赋税。',
    tags: ['天时', '年计'],
  },
  {
    title: '开元二十九年蝗灾',
    dynasty: '唐',
    source: '《太乙统宗宝鉴》',
    year: 741,
    calcType: 'year',
    interpretation: '太乙临土宫（坤八），始击在木位。木克土，地气受伤，虫灾之兆。',
    historicalOutcome: '全国多地蝗灾严重，唐玄宗命官民捕灭。',
    tags: ['天时', '灾异', '年计'],
  },
  // ===== 人事类 =====
  {
    title: '汉文帝即位',
    dynasty: '西汉',
    source: '《太乙统宗宝鉴》',
    year: -180,
    calcType: 'year',
    interpretation: '太乙临吉宫，计神在辅位。和格成立，新君仁德之象。百姓安乐。',
    historicalOutcome: '代王刘恒即位为汉文帝，开启文景之治。',
    tags: ['人事', '国运', '年计'],
  },
  {
    title: '张骞出使西域',
    dynasty: '西汉',
    source: '《太乙金镜式经》',
    year: -138,
    calcType: 'year',
    interpretation: '文昌在吉宫，远行利文教交流。始击在外方，宜主动出使。虽有阻滞终有成。',
    historicalOutcome: '张骞历十三年返回，开通丝绸之路。',
    tags: ['人事', '年计'],
  },
  {
    title: '隋炀帝三征高句丽',
    dynasty: '隋',
    source: '《太乙统宗宝鉴》',
    year: 612,
    calcType: 'year',
    interpretation: '太乙临凶宫，迫格成立。主算虽大但格局不利远征。国力空耗之象。',
    historicalOutcome: '三次远征皆败，隋朝国力大耗，民变四起。',
    tags: ['战争', '国运', '年计'],
  },
  // ===== 疾病类 =====
  {
    title: '东汉建安大疫',
    dynasty: '东汉',
    source: '《太乙统宗宝鉴》',
    year: 217,
    calcType: 'year',
    interpretation: '太乙在凶宫，囚格成立。水气太过（阳九期间），瘟疫流行之象。',
    historicalOutcome: '建安大疫席卷中原，建安七子多死于此疫。张仲景因此著《伤寒杂病论》。',
    tags: ['疾病', '灾异', '年计'],
  },
  // ===== 补充案例 =====
  {
    title: '赤壁之战前夕（日计）',
    dynasty: '东汉',
    source: '《太乙金镜式经》',
    year: 208,
    month: 11,
    day: 20,
    calcType: 'day',
    interpretation: '日计排盘显示文昌在吉宫利用智谋，风向有利火攻。太乙主南方。',
    historicalOutcome: '诸葛亮借东风，周瑜火烧赤壁，大破曹军。',
    tags: ['战争', '日计'],
  },
  {
    title: '李世民玄武门之变',
    dynasty: '唐',
    source: '《太乙金镜式经》',
    year: 626,
    month: 7,
    day: 2,
    hour: 5,
    calcType: 'hour',
    interpretation: '时计排盘始击在主方，利先发制人。主将旺相，客将衰微。太乙在吉宫，天命所归。',
    historicalOutcome: '李世民诛杀太子李建成、齐王李元吉，随后即位为唐太宗。',
    tags: ['人事', '时计'],
  },
  {
    title: '淝水之战',
    dynasty: '东晋',
    source: '《太乙统宗宝鉴》',
    year: 383,
    month: 11,
    calcType: 'month',
    interpretation: '月计客算虽大，但客将处死地。主方以少胜多之象，和格暗助。风声鹤唳。',
    historicalOutcome: '东晋八万大军击败前秦百万大军，淝水之战以少胜多。',
    tags: ['战争', '月计'],
  },
  {
    title: '郑和下西洋',
    dynasty: '明',
    source: '《太乙统宗宝鉴》',
    year: 1405,
    calcType: 'year',
    interpretation: '太乙临吉宫，文昌亦在吉位。飞格隐现，利远行贸易。和格主万邦来朝。',
    historicalOutcome: '郑和七下西洋，远达非洲东海岸，彰显国威。',
    tags: ['人事', '年计'],
  },
  {
    title: '万历三大征',
    dynasty: '明',
    source: '《太乙金镜式经》',
    year: 1592,
    calcType: 'year',
    interpretation: '主算大于客算，太乙在中性宫。虽无吉格加持，主方凭国力取胜。耗财之象。',
    historicalOutcome: '明朝先后平定宁夏、播州叛乱并援朝抗倭，但国库空虚。',
    tags: ['战争', '年计'],
  },
  {
    title: '萨尔浒之战',
    dynasty: '明',
    source: '《太乙统宗宝鉴》',
    year: 1619,
    calcType: 'year',
    interpretation: '太乙临凶宫，击格成立。主方兵分四路犯太乙分兵之忌。客将旺而主将衰。',
    historicalOutcome: '明军四路大军被后金各个击破，从此辽东攻守易势。',
    tags: ['战争', '年计'],
  },
  {
    title: '太平天国起义',
    dynasty: '清',
    source: '《太乙统宗宝鉴》',
    year: 1851,
    calcType: 'year',
    interpretation: '重审格与击格并现。阳九运限中，民变四起之象。太乙在凶宫，社稷不安。',
    historicalOutcome: '洪秀全金田起义，太平天国运动席卷半个中国。',
    tags: ['灾异', '国运', '年计'],
  },
  {
    title: '庚子国变',
    dynasty: '清',
    source: '《太乙金镜式经》',
    year: 1900,
    calcType: 'year',
    interpretation: '庚子年太乙临凶宫，客掩主大格成立。八国联军入侵之象，国运至暗。',
    historicalOutcome: '八国联军攻入北京，签订《辛丑条约》。',
    tags: ['国运', '战争', '年计'],
  },
  // ===== 现代参考 =====
  {
    title: '改革开放',
    dynasty: '现代',
    source: '太乙分析',
    year: 1978,
    calcType: 'year',
    interpretation: '太乙移入吉宫，和格渐成。文昌在旺位，利文教与经济发展。新纪元开启之象。',
    historicalOutcome: '十一届三中全会召开，改革开放正式启动。',
    tags: ['国运', '年计'],
  },
  {
    title: '香港回归',
    dynasty: '现代',
    source: '太乙分析',
    year: 1997,
    month: 7,
    day: 1,
    calcType: 'day',
    interpretation: '日计太乙在吉宫，和格成立。主客将皆旺，合和之象。',
    historicalOutcome: '香港顺利回归祖国。',
    tags: ['国运', '日计'],
  },
  {
    title: '2008年北京奥运',
    dynasty: '现代',
    source: '太乙分析',
    year: 2008,
    month: 8,
    day: 8,
    hour: 20,
    calcType: 'day',
    interpretation: '日计太乙与文昌同在吉宫。飞格成立，万国来朝、文运昌盛之象。',
    historicalOutcome: '北京奥运会成功举办，中国获51金列金牌榜首位。',
    tags: ['人事', '国运', '日计'],
  },
  {
    title: '2020年庚子疫情',
    dynasty: '现代',
    source: '太乙分析',
    year: 2020,
    calcType: 'year',
    interpretation: '庚子年太乙在凶宫，囚格隐现。阳九百六周期叠加，瘟疫流行之象。',
    historicalOutcome: '新冠疫情全球大流行。',
    tags: ['疾病', '灾异', '年计'],
  },
];

/**
 * 按标签筛选案例
 */
export function filterCasesByTag(tag: string): ClassicalCase[] {
  return CLASSICAL_CASES.filter(c => c.tags.includes(tag));
}

/**
 * 按朝代筛选案例
 */
export function filterCasesByDynasty(dynasty: string): ClassicalCase[] {
  return CLASSICAL_CASES.filter(c => c.dynasty === dynasty);
}

/**
 * 按计算类型筛选案例
 */
export function filterCasesByCalcType(calcType: string): ClassicalCase[] {
  return CLASSICAL_CASES.filter(c => c.calcType === calcType);
}

/**
 * 搜索案例（关键词匹配标题和解读）
 */
export function searchCases(keyword: string): ClassicalCase[] {
  const kw = keyword.toLowerCase();
  return CLASSICAL_CASES.filter(c =>
    c.title.toLowerCase().includes(kw)
    || c.interpretation.toLowerCase().includes(kw)
    || c.historicalOutcome.toLowerCase().includes(kw)
    || c.tags.some(t => t.includes(kw))
  );
}

/**
 * 获取所有唯一标签
 */
export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  CLASSICAL_CASES.forEach(c => c.tags.forEach(t => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

/**
 * 获取所有唯一朝代
 */
export function getAllDynasties(): string[] {
  const dynastySet = new Set<string>();
  CLASSICAL_CASES.forEach(c => dynastySet.add(c.dynasty));
  return Array.from(dynastySet);
}
