/**
 * 起名测名 —— 常量数据表
 * 含81数理吉凶、125三才配置、偏旁五行、复姓、谐音黑名单、知识库
 */

import type { WuXing, Auspice, KnowledgeArticle } from './types';

/* ===== 数理→五行映射 ===== */

/** 尾数→五行：1,2→木  3,4→火  5,6→土  7,8→金  9,0→水 */
export const NUMBER_WUXING_MAP: Record<number, WuXing> = {
  1: '木', 2: '木', 3: '火', 4: '火', 5: '土',
  6: '土', 7: '金', 8: '金', 9: '水', 0: '水',
};

/** 根据数理值获取五行（取尾数） */
export function getWuxingByNumber(n: number): WuXing {
  return NUMBER_WUXING_MAP[n % 10] ?? '水';
}

/** 数理超过81时取模：(n-1)%80+1 */
export function normalizeShuli(n: number): number {
  if (n <= 0) return 1;
  if (n <= 81) return n;
  return ((n - 1) % 80) + 1;
}

/* ===== 81 数理吉凶表 ===== */

export interface ShuLiEntry {
  number: number;
  auspice: Auspice;
  category: string;
  name: string;
  interpretation: string;
}

/**
 * 81数理吉凶表（索引0占位，实际1-81）
 * 据《姓名学》传统数理编纂
 */
export const SHULI_TABLE: ShuLiEntry[] = [
  /* 0 占位 */ { number: 0, auspice: '凶', category: '', name: '', interpretation: '' },
  /* 1  */ { number: 1, auspice: '吉', category: '首领运', name: '太极之数', interpretation: '天地开泰，万物成就，身体康安，富贵荣誉，一生无忧乐绵长' },
  /* 2  */ { number: 2, auspice: '凶', category: '分离运', name: '两仪之数', interpretation: '混沌未开，进退保守，志望难达，分离破败，独立无依' },
  /* 3  */ { number: 3, auspice: '吉', category: '吉祥运', name: '万物成形', interpretation: '进取如意的增进繁荣数，智勇双全，万事如意，有才能者可成大业' },
  /* 4  */ { number: 4, auspice: '凶', category: '凶变运', name: '万物死折', interpretation: '破败凶变的万事休止数，进退不自由，独立乏能力，灾难迭至' },
  /* 5  */ { number: 5, auspice: '吉', category: '种竹成林', name: '福禄长寿', interpretation: '福禄长寿的福德集门数，阴阳和合，循环相生，福祉无穷' },
  /* 6  */ { number: 6, auspice: '吉', category: '吉人天相', name: '安稳吉庆', interpretation: '安稳余庆的吉人天相数，天德地祥具备，家门繁荣昌盛' },
  /* 7  */ { number: 7, auspice: '吉', category: '刚毅果断', name: '精悍严谨', interpretation: '刚毅果断勇往直前的进取数，独立权威，有魄力，可成大功' },
  /* 8  */ { number: 8, auspice: '吉', category: '勤勉发展', name: '坚刚志愿', interpretation: '意志刚健的勤勉发展数，志向坚定，知识丰富，克服万难终成大业' },
  /* 9  */ { number: 9, auspice: '凶', category: '穷苦运', name: '穷乏困苦', interpretation: '兴尽凶始的穷乏困苦数，利去功空，陷落穷迫，逆运叠至' },
  /* 10 */ { number: 10, auspice: '凶', category: '零暗运', name: '万事终局', interpretation: '万事终局的充满损耗数，暗淡无光，其凶兆万事难如意' },
  /* 11 */ { number: 11, auspice: '吉', category: '万事如意', name: '早苗逢雨', interpretation: '稳健吉祥富贵荣达数，挽回家运矣春光再展，万事如意之象' },
  /* 12 */ { number: 12, auspice: '凶', category: '薄弱挫折', name: '掘井无泉', interpretation: '意志薄弱的家庭寂寞数，有无理伸张之象，不顾脆弱之力' },
  /* 13 */ { number: 13, auspice: '吉', category: '智略超群', name: '才艺多能', interpretation: '智略超群的博学多才数，富于学艺才能，享受天赋之福' },
  /* 14 */ { number: 14, auspice: '凶', category: '沦落运', name: '浮沉破败', interpretation: '沦落天涯的失意烦闷数，家庭缘薄多破兆，逆境之象' },
  /* 15 */ { number: 15, auspice: '吉', category: '慈祥有德', name: '福寿双全', interpretation: '福寿双全的立身兴家数，慈祥有德，温良雅量，人缘极好' },
  /* 16 */ { number: 16, auspice: '吉', category: '贵人得助', name: '厚重载德', interpretation: '贵人得助天乙贵人数，反凶化吉象，得助成大业，富贵发达' },
  /* 17 */ { number: 17, auspice: '半吉', category: '刚柔兼备', name: '坚操刚健', interpretation: '突破万难的刚柔兼备数，权威刚强，意志坚定，能成大业但须慎防过刚' },
  /* 18 */ { number: 18, auspice: '半吉', category: '有志竟成', name: '铁镜重磨', interpretation: '有志竟成的内外有运数，经商做事有能力但须注意守成' },
  /* 19 */ { number: 19, auspice: '凶', category: '多难运', name: '多难遮云', interpretation: '多难挫折的遮云蔽月数，风云蔽月之象，短命多疾之兆' },
  /* 20 */ { number: 20, auspice: '凶', category: '非业破运', name: '屋下藏金', interpretation: '非业破运的屋下藏金数，志高力微，一生保守无远志' },
  /* 21 */ { number: 21, auspice: '吉', category: '独立权威', name: '明月中天', interpretation: '明月光照的独立权威数，风光霁月之象，万物成就为首领数' },
  /* 22 */ { number: 22, auspice: '凶', category: '薄弱不平', name: '秋草逢霜', interpretation: '秋草逢霜的两士相争数，百事不如意，志望半达有多困难' },
  /* 23 */ { number: 23, auspice: '吉', category: '旭日东升', name: '壮丽果敢', interpretation: '旭日东升的质实刚坚数，伟大昌隆之运，威势冲天之象' },
  /* 24 */ { number: 24, auspice: '吉', category: '家门余庆', name: '掘藏得金', interpretation: '家门余庆的金钱丰盈数，财源广进，才略智谋出众之象' },
  /* 25 */ { number: 25, auspice: '半吉', category: '资性英敏', name: '英俊资性', interpretation: '英俊刚毅的资性英敏数，有奇特才能但性情偏重一方' },
  /* 26 */ { number: 26, auspice: '半吉', category: '变怪奇异', name: '波澜变怪', interpretation: '变怪奇异的豪侠行义数，英雄运格多波澜，须防过于冒险' },
  /* 27 */ { number: 27, auspice: '半吉', category: '足智多谋', name: '增长刚情', interpretation: '足智多谋的刚柔兼备数，欲望过高须慎防半途而废' },
  /* 28 */ { number: 28, auspice: '凶', category: '家亲缘薄', name: '离群独处', interpretation: '家亲缘薄的离群独处数，遭难运多，豪杰气概但须防灾厄' },
  /* 29 */ { number: 29, auspice: '半吉', category: '智谋兼备', name: '欲望难足', interpretation: '智谋兼备的欲望难足数，有财力才力但缺乏统率力' },
  /* 30 */ { number: 30, auspice: '半吉', category: '一成一败', name: '非运绝处', interpretation: '一成一败的绝境逢生数，浮沉不定终归失败须慎防' },
  /* 31 */ { number: 31, auspice: '吉', category: '智勇得志', name: '春日花开', interpretation: '智勇得志的心想事成数，智仁勇俱备，意志坚固，千挫不挠' },
  /* 32 */ { number: 32, auspice: '吉', category: '侥幸多望', name: '宝马金鞍', interpretation: '宝马金鞍的侥幸多望数，贵人得助，财帛如裕，繁荣至上' },
  /* 33 */ { number: 33, auspice: '吉', category: '家门隆昌', name: '旭日升天', interpretation: '家门隆昌的才德开展数，鸾凤相会之象，形成确定之意' },
  /* 34 */ { number: 34, auspice: '凶', category: '财命危险', name: '破家亡身', interpretation: '破家亡身的财命危险数，见识短小有非业灾难之兆' },
  /* 35 */ { number: 35, auspice: '吉', category: '优雅发展', name: '温和平静', interpretation: '温和平静的优雅发展数，温良雅量，有艺术气质' },
  /* 36 */ { number: 36, auspice: '半吉', category: '侠义薄运', name: '风浪不息', interpretation: '风浪不息的侠义薄运数，波澜重叠变化奇异须防不测' },
  /* 37 */ { number: 37, auspice: '吉', category: '权威显达', name: '猛虎出林', interpretation: '权威显达的吉人天相数，独立不屈之志，有大鸿图之气' },
  /* 38 */ { number: 38, auspice: '半吉', category: '意志薄弱', name: '磨铁成针', interpretation: '磨铁成针的意志薄弱数，有学艺之才能但意志尚薄弱' },
  /* 39 */ { number: 39, auspice: '半吉', category: '变化无穷', name: '富贵荣华', interpretation: '富贵荣华的变化无穷数，光明荣达之象但须防过于自信' },
  /* 40 */ { number: 40, auspice: '半吉', category: '谨慎治安', name: '退安保吉', interpretation: '谨慎保安的豪胆迈进数，智谋出众但须防冲动冒险' },
  /* 41 */ { number: 41, auspice: '吉', category: '德高望重', name: '纯阳独秀', interpretation: '德高望重的事事如意数，纯阳之象，万物确定形势之意' },
  /* 42 */ { number: 42, auspice: '半吉', category: '博达多能', name: '寒蝉在柳', interpretation: '寒蝉在柳的两士相争数，博识多能须防过于清高' },
  /* 43 */ { number: 43, auspice: '凶', category: '邪途散财', name: '散财破产', interpretation: '邪途散财的外祥内苦数，散财破产运，虽有智能力不足' },
  /* 44 */ { number: 44, auspice: '凶', category: '须眉难展', name: '烦闷暗淡', interpretation: '须眉难展的力量有限数，秋木落叶之象，事业难成' },
  /* 45 */ { number: 45, auspice: '吉', category: '新生泰和', name: '顺风帆航', interpretation: '顺风扬帆的新生泰和数，顺利发展有智谋经纬大志者可成大业' },
  /* 46 */ { number: 46, auspice: '半吉', category: '载宝沉舟', name: '浪里淘金', interpretation: '罗网系身的离祖破家数，须防身心疲劳终世浮沉' },
  /* 47 */ { number: 47, auspice: '吉', category: '点石成金', name: '开花结子', interpretation: '点石成金的祯祥进取数，开花之象，祯祥吉庆之极' },
  /* 48 */ { number: 48, auspice: '吉', category: '德智兼备', name: '青松立鹤', interpretation: '青松立鹤的德智兼备数，智谋兼备有望成大业之象' },
  /* 49 */ { number: 49, auspice: '半吉', category: '吉凶难分', name: '转变吉凶', interpretation: '吉凶难分的转变吉凶数，吉凶难辨须防盛极而衰' },
  /* 50 */ { number: 50, auspice: '半吉', category: '先成后败', name: '吉凶参半', interpretation: '吉凶参半的先成后败数，成功失败参半须谨慎保守' },
  /* 51 */ { number: 51, auspice: '半吉', category: '一盛一衰', name: '盛衰交加', interpretation: '盛衰交加的竭力经营数，一盛一衰须防晚景凄凉' },
  /* 52 */ { number: 52, auspice: '吉', category: '理想实现', name: '先见之明', interpretation: '先见之明的理想实现数，有先见之明可望成功之象' },
  /* 53 */ { number: 53, auspice: '凶', category: '忧愁困苦', name: '内忧外患', interpretation: '忧愁困苦的内心忧患数，表面虽盛但内里空虚' },
  /* 54 */ { number: 54, auspice: '凶', category: '难望成功', name: '多难悲运', interpretation: '多难悲运的难望成功数，三鸟落水之象，病灾重叠' },
  /* 55 */ { number: 55, auspice: '半吉', category: '和顺不实', name: '外美内苦', interpretation: '外美内苦的和顺不实数，外观颇佳但内部空虚之象' },
  /* 56 */ { number: 56, auspice: '凶', category: '旷达离愁', name: '浪里行舟', interpretation: '浪里行舟的旷达离愁数，缺乏实力终难如意' },
  /* 57 */ { number: 57, auspice: '吉', category: '寒雪青松', name: '日照春松', interpretation: '日照春松的寒雪青松数，百折不挠有坚韧不拔之志' },
  /* 58 */ { number: 58, auspice: '半吉', category: '晚行遇月', name: '先苦后甜', interpretation: '晚行遇月的先苦后甘数，宽宏大量可转危为安' },
  /* 59 */ { number: 59, auspice: '凶', category: '时运不济', name: '寒蝉悲风', interpretation: '寒蝉悲风的时运不济数，不忍为义缺乏果断之力' },
  /* 60 */ { number: 60, auspice: '凶', category: '无谋遮云', name: '暗淡无光', interpretation: '无谋暗淡的遮云蔽日数，黑暗无光之象万事挫折' },
  /* 61 */ { number: 61, auspice: '吉', category: '牡丹芙蓉', name: '名利双收', interpretation: '牡丹芙蓉的名利双收数，繁荣富贵之运发展可望' },
  /* 62 */ { number: 62, auspice: '凶', category: '基础虚弱', name: '艰难困苦', interpretation: '基础虚弱的艰难困苦数，内外不和衰败失意之象' },
  /* 63 */ { number: 63, auspice: '吉', category: '富贵荣华', name: '身心安泰', interpretation: '富贵荣华的身心安泰数，万事如意富贵自来之象' },
  /* 64 */ { number: 64, auspice: '凶', category: '骨肉分离', name: '沉沦破败', interpretation: '骨肉分离的沉沦破败数，见异思迁浮沉不定之象' },
  /* 65 */ { number: 65, auspice: '吉', category: '富贵长寿', name: '光明正大', interpretation: '富贵长寿的光明正大数，万事亨通家庭兴盛之象' },
  /* 66 */ { number: 66, auspice: '凶', category: '多愁失志', name: '内外不和', interpretation: '内外不和的多愁失志数，进退维谷百事不如意' },
  /* 67 */ { number: 67, auspice: '吉', category: '志气坚强', name: '财路亨通', interpretation: '财路亨通的志气坚强数，近贵得财家门隆昌之象' },
  /* 68 */ { number: 68, auspice: '吉', category: '宽容好运', name: '兴家立业', interpretation: '兴家立业的宽容好运数，智虑周密发展壮大之象' },
  /* 69 */ { number: 69, auspice: '凶', category: '坐立不安', name: '外世多难', interpretation: '坐立不安的外世多难数，穷迫滞塞终生无气力' },
  /* 70 */ { number: 70, auspice: '凶', category: '家运衰退', name: '晚景凄凉', interpretation: '家运衰退的晚景凄凉数，空虚无物暗淡无光之象' },
  /* 71 */ { number: 71, auspice: '半吉', category: '毫无实力', name: '耗神力弱', interpretation: '毫无实力的耗神力弱数，有学问但难以施展' },
  /* 72 */ { number: 72, auspice: '凶', category: '万难忍受', name: '先甘后苦', interpretation: '先甘后苦的万难忍受数，前半生顺利后半生困苦' },
  /* 73 */ { number: 73, auspice: '半吉', category: '志高力微', name: '平安平稳', interpretation: '志高力微的平安平稳数，高志无力须防空想' },
  /* 74 */ { number: 74, auspice: '凶', category: '秋叶落寞', name: '沉沦逆境', interpretation: '沉沦逆境的秋叶落寞数，无力伸张终身困苦' },
  /* 75 */ { number: 75, auspice: '半吉', category: '守者天安', name: '退守保吉', interpretation: '守者天安的退守保吉数，进取不力守成可安' },
  /* 76 */ { number: 76, auspice: '凶', category: '内外不和', name: '离散损失', interpretation: '内外不和的离散损失数，骨肉离散终世孤独' },
  /* 77 */ { number: 77, auspice: '半吉', category: '家庭有悦', name: '半吉半凶', interpretation: '家庭有悦的半吉半凶数，前半段吉后半段凶须慎防' },
  /* 78 */ { number: 78, auspice: '半吉', category: '晚境凄凉', name: '功果皆空', interpretation: '晚境凄凉的功果皆空数，有智力但易中途受挫' },
  /* 79 */ { number: 79, auspice: '凶', category: '云头望月', name: '挽回败局', interpretation: '挽回败局的云头望月数，终身辛苦不得如意' },
  /* 80 */ { number: 80, auspice: '半吉', category: '远遁隐居', name: '不平不安', interpretation: '远遁隐居的不平不安数，有最大好运之暗示但须安分守己' },
  /* 81 */ { number: 81, auspice: '吉', category: '还原复始', name: '万物回春', interpretation: '万物回春的还原复始数，还本归元繁荣富贵之极数' },
];

/* ===== 125 三才配置表 ===== */

export interface SanCaiEntry {
  /** 吉凶 */
  auspice: Auspice;
  /** 评分 0-100 */
  score: number;
  /** 综合描述 */
  description: string;
}

/**
 * 三才配置表（天才-人才-地才）
 * key 为三字五行组合如 "木木木"，共125种
 */
export const SANCAI_TABLE: Record<string, SanCaiEntry> = {
  // ===== 天木 =====
  '木木木': { auspice: '吉', score: 88, description: '成功顺利，能平安达到目的，身心健全可获长寿幸福' },
  '木木火': { auspice: '吉', score: 90, description: '成功顺利，向上发展生机旺盛，万事如意' },
  '木木土': { auspice: '吉', score: 85, description: '成功顺利发展，基础安泰，能得幸福长寿' },
  '木木金': { auspice: '凶', score: 30, description: '虽努力奋斗但成功运受压制，不易如愿' },
  '木木水': { auspice: '吉', score: 82, description: '成功顺利发展，目的平安达到，身心健全' },
  '木火木': { auspice: '吉', score: 92, description: '受上辈提拔得以成功发展，基础安稳' },
  '木火火': { auspice: '半吉', score: 65, description: '盛运隆昌一时，过刚恐招不测之患' },
  '木火土': { auspice: '吉', score: 95, description: '受长辈提携大有发展，基础稳固，身心安泰' },
  '木火金': { auspice: '半吉', score: 50, description: '虽有一时成功但渐入困境，须防急变' },
  '木火水': { auspice: '凶', score: 25, description: '虽有成功运但急变急祸相续而来' },
  '木土木': { auspice: '凶', score: 28, description: '命运被压抑不得伸张，有不满不平之态' },
  '木土火': { auspice: '半吉', score: 55, description: '一时虽可成功但基础不稳，不持久' },
  '木土土': { auspice: '半吉', score: 52, description: '成功运不佳但基础尚可，有忧虑之象' },
  '木土金': { auspice: '凶', score: 35, description: '成功运被压抑，困难重重多忧虑' },
  '木土水': { auspice: '凶', score: 20, description: '成功运不佳基础不稳，有急变灾祸之虑' },
  '木金木': { auspice: '凶', score: 15, description: '成功运被完全压抑，有灾祸或不满' },
  '木金火': { auspice: '凶', score: 18, description: '成功运极差，有急变之灾祸' },
  '木金土': { auspice: '凶', score: 25, description: '成功运虽差但基础尚可勉强维持' },
  '木金金': { auspice: '凶', score: 12, description: '成功运被严重压制，诸事不如意' },
  '木金水': { auspice: '凶', score: 22, description: '表面看似安定实际空虚不实' },
  '木水木': { auspice: '吉', score: 85, description: '受长辈引进顺利成功发展，基础安稳' },
  '木水火': { auspice: '凶', score: 30, description: '虽有成功迹象但基础薄弱不持久' },
  '木水土': { auspice: '半吉', score: 55, description: '一时虽能成功但基础薄弱须谨慎' },
  '木水金': { auspice: '吉', score: 80, description: '成功顺利发展基础安泰，可获幸福' },
  '木水水': { auspice: '半吉', score: 58, description: '一时成功发展但有流亡不安之虞' },

  // ===== 天火 =====
  '火木木': { auspice: '吉', score: 90, description: '成功顺利，志望达到，基础安定' },
  '火木火': { auspice: '吉', score: 85, description: '成功发展，但须注意过于急进之患' },
  '火木土': { auspice: '吉', score: 92, description: '成功顺利发展，基础安泰，心身健全' },
  '火木金': { auspice: '半吉', score: 52, description: '虽有成功运但终不持久，有变化之象' },
  '火木水': { auspice: '半吉', score: 55, description: '成功运佳但基础欠稳，须防变动' },
  '火火木': { auspice: '吉', score: 88, description: '隆昌兴盛繁荣发展大吉之象' },
  '火火火': { auspice: '半吉', score: 60, description: '虽兴盛发展但过于急进须防不测' },
  '火火土': { auspice: '吉', score: 90, description: '成功运佳基础稳固，能获安泰长寿' },
  '火火金': { auspice: '凶', score: 28, description: '成功运差，有急变之患' },
  '火火水': { auspice: '凶', score: 20, description: '成功运差基础不稳，灾祸频至' },
  '火土木': { auspice: '半吉', score: 58, description: '有些许成功但不太持久' },
  '火土火': { auspice: '吉', score: 88, description: '成功发展顺利，基础安泰' },
  '火土土': { auspice: '吉', score: 92, description: '成功运极佳基础稳固大吉' },
  '火土金': { auspice: '吉', score: 85, description: '顺利成功发展基础安泰' },
  '火土水': { auspice: '半吉', score: 50, description: '一时成功发展但晚年须注意' },
  '火金木': { auspice: '凶', score: 22, description: '成功运差，困难重重' },
  '火金火': { auspice: '凶', score: 15, description: '成功运被完全压制' },
  '火金土': { auspice: '凶', score: 30, description: '成功运不佳，虽有基础但难发展' },
  '火金金': { auspice: '凶', score: 12, description: '成功运被严重压制灾难叠至' },
  '火金水': { auspice: '凶', score: 18, description: '命运被极度压制凶象' },
  '火水木': { auspice: '凶', score: 28, description: '成功运差基础不安定' },
  '火水火': { auspice: '凶', score: 10, description: '成功运极差，水火相克大凶' },
  '火水土': { auspice: '凶', score: 25, description: '基础尚可但成功运极差' },
  '火水金': { auspice: '凶', score: 22, description: '成功运差须防灾变' },
  '火水水': { auspice: '凶', score: 15, description: '命运被严重压制凶兆' },

  // ===== 天土 =====
  '土木木': { auspice: '凶', score: 30, description: '成功运差，须防不满及纠纷' },
  '土木火': { auspice: '半吉', score: 55, description: '有些许成功但须注意变动' },
  '土木土': { auspice: '半吉', score: 50, description: '基础稍好但成功运一般' },
  '土木金': { auspice: '凶', score: 25, description: '成功运被压抑且基础不稳' },
  '土木水': { auspice: '凶', score: 22, description: '成功运差有急变灾祸之虞' },
  '土火木': { auspice: '吉', score: 90, description: '受长辈提拔大成功，基础安泰' },
  '土火火': { auspice: '吉', score: 85, description: '成功运极佳但须防过刚' },
  '土火土': { auspice: '吉', score: 95, description: '成功顺利发展基础安泰幸福长寿' },
  '土火金': { auspice: '半吉', score: 52, description: '虽有成功运但不太持久' },
  '土火水': { auspice: '凶', score: 25, description: '成功运差有急变灾祸' },
  '土土木': { auspice: '半吉', score: 55, description: '基础稳固但成功运一般' },
  '土土火': { auspice: '吉', score: 85, description: '成功运佳基础稳固' },
  '土土土': { auspice: '吉', score: 88, description: '基础极其稳固成功运佳' },
  '土土金': { auspice: '吉', score: 85, description: '成功运顺利基础安定' },
  '土土水': { auspice: '半吉', score: 48, description: '基础稳固但晚年须注意' },
  '土金木': { auspice: '凶', score: 30, description: '成功运差有变动之虑' },
  '土金火': { auspice: '凶', score: 22, description: '成功运受压制困难多' },
  '土金土': { auspice: '吉', score: 88, description: '成功运佳基础安泰大吉' },
  '土金金': { auspice: '吉', score: 82, description: '成功顺利但须防过于刚强' },
  '土金水': { auspice: '吉', score: 80, description: '成功运佳基础安泰可获幸福' },
  '土水木': { auspice: '凶', score: 25, description: '成功运差基础不安定' },
  '土水火': { auspice: '凶', score: 15, description: '成功运极差有大凶之象' },
  '土水土': { auspice: '凶', score: 28, description: '基础不稳成功运差' },
  '土水金': { auspice: '半吉', score: 45, description: '一时虽有成功但不持久' },
  '土水水': { auspice: '凶', score: 20, description: '成功运差基础不稳有灾变' },

  // ===== 天金 =====
  '金木木': { auspice: '凶', score: 25, description: '成功运差有不满及灾祸之虑' },
  '金木火': { auspice: '凶', score: 28, description: '成功运差且基础不安' },
  '金木土': { auspice: '凶', score: 30, description: '成功运被压制虽有基础难发展' },
  '金木金': { auspice: '凶', score: 12, description: '成功运极差困难重重' },
  '金木水': { auspice: '凶', score: 22, description: '成功运差有变动' },
  '金火木': { auspice: '凶', score: 20, description: '命运被压制不得伸张' },
  '金火火': { auspice: '凶', score: 12, description: '成功运极差金被火克大凶' },
  '金火土': { auspice: '凶', score: 28, description: '成功运不佳虽有基础难安' },
  '金火金': { auspice: '凶', score: 10, description: '命运被严重压制大凶' },
  '金火水': { auspice: '凶', score: 15, description: '成功运极差灾祸频至' },
  '金土木': { auspice: '半吉', score: 55, description: '有些许成功且基础尚可' },
  '金土火': { auspice: '吉', score: 85, description: '成功运佳基础安泰' },
  '金土土': { auspice: '吉', score: 92, description: '成功运极佳基础稳固大吉' },
  '金土金': { auspice: '吉', score: 88, description: '顺利成功发展基础安泰' },
  '金土水': { auspice: '半吉', score: 50, description: '一时成功但晚年须注意' },
  '金金木': { auspice: '凶', score: 28, description: '成功运差有不和之虑' },
  '金金火': { auspice: '凶', score: 22, description: '成功运差困难重重' },
  '金金土': { auspice: '吉', score: 82, description: '基础稳固成功运佳' },
  '金金金': { auspice: '半吉', score: 55, description: '过刚强须防折挫之虑' },
  '金金水': { auspice: '半吉', score: 58, description: '成功运佳但过于刚强须慎' },
  '金水木': { auspice: '吉', score: 85, description: '受长辈引进顺利成功发展' },
  '金水火': { auspice: '凶', score: 28, description: '有成功运但基础不稳' },
  '金水土': { auspice: '半吉', score: 55, description: '一时成功但基础尚需稳固' },
  '金水金': { auspice: '吉', score: 82, description: '顺利成功发展基础安定' },
  '金水水': { auspice: '半吉', score: 52, description: '成功运佳但须防过度飘浮' },

  // ===== 天水 =====
  '水木木': { auspice: '吉', score: 88, description: '成功顺利发展志望达到' },
  '水木火': { auspice: '吉', score: 85, description: '成功顺利发展基础安定' },
  '水木土': { auspice: '吉', score: 90, description: '成功顺利发展基础稳固大吉' },
  '水木金': { auspice: '半吉', score: 50, description: '有些许成功但不太持久' },
  '水木水': { auspice: '吉', score: 82, description: '成功运佳但须注意' },
  '水火木': { auspice: '半吉', score: 48, description: '一时虽有成功但不稳定' },
  '水火火': { auspice: '凶', score: 22, description: '成功运差有急变之患' },
  '水火土': { auspice: '半吉', score: 50, description: '有些许成功但须防变动' },
  '水火金': { auspice: '凶', score: 25, description: '成功运被压制困难多' },
  '水火水': { auspice: '凶', score: 10, description: '命运被严重压制大凶水火相克' },
  '水土木': { auspice: '凶', score: 28, description: '成功运差有压制之象' },
  '水土火': { auspice: '半吉', score: 52, description: '有些许成功但不太顺利' },
  '水土土': { auspice: '半吉', score: 50, description: '基础稳固但成功运不佳' },
  '水土金': { auspice: '半吉', score: 55, description: '一时成功且基础尚可' },
  '水土水': { auspice: '凶', score: 22, description: '成功运差基础不稳' },
  '水金木': { auspice: '半吉', score: 55, description: '一时有些成功但须注意变动' },
  '水金火': { auspice: '凶', score: 25, description: '成功运差困难多' },
  '水金土': { auspice: '吉', score: 85, description: '成功运佳基础安泰' },
  '水金金': { auspice: '半吉', score: 58, description: '成功运佳但过于刚强' },
  '水金水': { auspice: '半吉', score: 55, description: '成功运佳但须防过于飘浮' },
  '水水木': { auspice: '吉', score: 82, description: '成功运佳可得安泰' },
  '水水火': { auspice: '凶', score: 22, description: '成功运差有急变之患' },
  '水水土': { auspice: '凶', score: 28, description: '基础不太稳成功运差' },
  '水水金': { auspice: '半吉', score: 55, description: '一时成功但须注意守成' },
  '水水水': { auspice: '半吉', score: 48, description: '成功运佳但飘浮不定须防变动' },
};

/* ===== 偏旁部首→五行映射 ===== */

/** 常见偏旁部首对应五行 */
export const RADICAL_WUXING: Record<string, WuXing> = {
  // 木
  '木': '木', '艹': '木', '⺾': '木', '竹': '木', '⺮': '木',
  '禾': '木', '⻀': '木', '耒': '木', '弓': '木',
  // 火
  '火': '火', '灬': '火', '日': '火', '⺜': '火', '光': '火',
  '心': '火', '忄': '火', '⺗': '火',
  // 土
  '土': '土', '山': '土', '石': '土', '田': '土', '阝': '土',
  '⻏': '土', '里': '土', '王': '土', '玉': '土',
  // 金
  '金': '金', '钅': '金', '釒': '金', '刀': '金', '刂': '金',
  '匕': '金', '戈': '金', '殳': '金', '⻊': '金',
  // 水
  '水': '水', '氵': '水', '冫': '水', '雨': '水', '⻗': '水',
  '鱼': '水', '⻥': '水', '⺡': '水',
};

/* ===== 复姓列表 ===== */

/** 常见复姓 */
export const COMPOUND_SURNAMES: string[] = [
  '欧阳', '太史', '端木', '上官', '司马', '东方', '独孤', '南宫',
  '万俟', '闻人', '夏侯', '诸葛', '尉迟', '公羊', '赫连', '澹台',
  '皇甫', '宗政', '濮阳', '公冶', '太叔', '申屠', '公孙', '慕容',
  '仲孙', '钟离', '长孙', '宇文', '司徒', '鲜于', '司空', '闾丘',
  '子车', '亓官', '司寇', '巫马', '公西', '颛孙', '壤驷', '公良',
  '漆雕', '乐正', '宰父', '谷梁', '拓跋', '夹谷', '轩辕', '令狐',
  '段干', '百里', '呼延', '东郭', '南门', '羊舌', '微生', '公户',
  '公玉', '公仪', '梁丘', '公仲', '公上', '公门', '公山', '公坚',
  '左丘', '公伯', '西门', '公祖', '第五', '公乘', '贯丘', '公皙',
  '南荣', '东里', '东宫', '仲长', '子书', '子桑', '即墨', '达奚',
  '褚师',
];

/** 检查姓氏是否为复姓 */
export function isCompoundSurname(name: string): boolean {
  if (name.length < 2) return false;
  return COMPOUND_SURNAMES.includes(name.substring(0, 2));
}

/* ===== 谐音黑名单 ===== */

/**
 * 谐音黑名单（无调拼音）
 * 用于检测姓名谐音是否有不雅含义
 * 格式：拼音连读（无空格、无调号）
 */
export const HOMOPHONE_BLACKLIST: string[] = [
  // 不雅谐音
  'si', 'sang', 'siwang', 'bai', 'qiong', 'shagua', 'ben', 'sha',
  'bendan', 'huaidan', 'feiwu', 'laji', 'diaosi', 'goushi',
  'nübi', 'nubi', 'jiba', 'bichi', 'shabi', 'wangba',
  'bian', 'niubi', 'daye', 'zazhong', 'chusheng',
  // 负面意义
  'fan', 'zui', 'fanfa', 'fanzui', 'fanlao', 'hundan',
  'yanzhong', 'sunshi', 'pochan', 'shibai', 'gubi',
  'jibing', 'aizheng', 'zhongliu',
  // 容易被嘲笑
  'doufu', 'dabian', 'xiaobian', 'pigu', 'fangpi',
  'pengyou', 'niupai', 'ji', 'gou', 'zhu',
  'feiniu', 'feizhu', 'laoshu', 'haochong',
  'douya', 'shitou', 'mutou', 'shutou',
  // 常见不雅姓名谐音组合
  'quhuan', 'xijin', 'laizhu', 'mapi', 'weilai',
  'caoni', 'rini', 'ganma', 'dama', 'dabi',
  'pangbi', 'pangpi', 'sicong',
  'feidan', 'qifu', 'sharen', 'zisha',
  'dupin', 'dubo', 'huangse', 'seqing',
  // 贬义绰号
  'sanba', 'laogui', 'laotou', 'laotaipo',
  'guaishou', 'yaoguai', 'mogui', 'emeng',
  'jiqi', 'jiqiren', 'mucai', 'mugua',
  'shagua', 'daigou', 'chanfei',
  // 两字不雅组合（全名匹配）
  'duzi', 'biaozi', 'laobao', 'pizi',
  'lieshi', 'zhishi', 'wuse', 'wuchi',
  'wulai', 'wuli', 'wuneng', 'wuyong',
  'fuchou', 'ezi', 'egui',
  // 身体相关不雅
  'rutou', 'rufang', 'jiji', 'yinjing', 'yindao',
  'gangmen', 'niao', 'laipi',
  // 贬义动物
  'wugui', 'chanchui', 'zhulou', 'niuguai',
  'mayi', 'cangying', 'wenzi', 'shezui',
];

/**
 * 检测姓名拼音是否命中谐音黑名单
 * @param pinyinArr 姓名每个字的拼音数组（无调号小写）
 */
export function checkHomophone(pinyinArr: string[]): string[] {
  const warnings: string[] = [];
  const fullPinyin = pinyinArr.join('');

  // 全名连读
  if (HOMOPHONE_BLACKLIST.includes(fullPinyin)) {
    warnings.push(`姓名连读"${fullPinyin}"谐音不雅`);
  }

  // 名字部分（去掉姓）
  if (pinyinArr.length >= 2) {
    const givenPinyin = pinyinArr.slice(1).join('');
    if (HOMOPHONE_BLACKLIST.includes(givenPinyin)) {
      warnings.push(`名字部分"${givenPinyin}"谐音不雅`);
    }
  }

  // 相邻两字连读
  for (let i = 0; i < pinyinArr.length - 1; i++) {
    const pair = pinyinArr[i] + pinyinArr[i + 1];
    if (HOMOPHONE_BLACKLIST.includes(pair)) {
      warnings.push(`"${pinyinArr[i]}${pinyinArr[i + 1]}"连读谐音不雅`);
    }
  }

  // 单字匹配高频敏感音
  const singleBlack = ['si', 'sang', 'qiong', 'sha'];
  for (let i = 1; i < pinyinArr.length; i++) {
    if (singleBlack.includes(pinyinArr[i])) {
      warnings.push(`用字"${pinyinArr[i]}"读音敏感，可能引起联想`);
    }
  }

  return warnings;
}

/* ===== 五行相生相克 ===== */

/** 五行相生：木→火→土→金→水→木 */
export const WUXING_SHENG: Record<WuXing, WuXing> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
};

/** 五行相克：木→土→水→火→金→木 */
export const WUXING_KE: Record<WuXing, WuXing> = {
  '木': '土', '土': '水', '水': '火', '火': '金', '金': '木',
};

/** 五行被克：木被金克、火被水克… */
export const WUXING_BEKE: Record<WuXing, WuXing> = {
  '木': '金', '火': '水', '土': '木', '金': '火', '水': '土',
};

/**
 * 判断两五行关系
 * 返回: 'sheng'(a生b) | 'ke'(a克b) | 'besheng'(a被b生) | 'beke'(a被b克) | 'same'(同类)
 */
export function wuxingRelation(a: WuXing, b: WuXing): string {
  if (a === b) return 'same';
  if (WUXING_SHENG[a] === b) return 'sheng';
  if (WUXING_KE[a] === b) return 'ke';
  if (WUXING_SHENG[b] === a) return 'besheng';
  if (WUXING_KE[b] === a) return 'beke';
  return 'same';
}

/* ===== 日主旺衰→喜用神推断 ===== */

/** 根据日主五行和旺衰推断喜用神 */
export function inferYongShen(dayMasterWX: WuXing, strength: string): { yongShen: WuXing[]; jiShen: WuXing[] } {
  const WX_LIST: WuXing[] = ['木', '火', '土', '金', '水'];
  // 偏强：喜克泄耗（克我、我生、我克）
  // 偏弱：喜生扶（生我、同类）
  // 中和：轻微补弱
  if (strength === '偏强' || strength === '过旺') {
    const yongShen: WuXing[] = [];
    const jiShen: WuXing[] = [];
    for (const wx of WX_LIST) {
      const rel = wuxingRelation(dayMasterWX, wx);
      if (rel === 'sheng' || rel === 'ke' || rel === 'beke') {
        yongShen.push(wx);
      } else {
        jiShen.push(wx);
      }
    }
    return { yongShen, jiShen };
  } else if (strength === '偏弱' || strength === '过弱') {
    const yongShen: WuXing[] = [];
    const jiShen: WuXing[] = [];
    for (const wx of WX_LIST) {
      const rel = wuxingRelation(dayMasterWX, wx);
      if (rel === 'same' || rel === 'besheng') {
        yongShen.push(wx);
      } else {
        jiShen.push(wx);
      }
    }
    return { yongShen, jiShen };
  } else {
    // 中和：轻微喜生我
    const yongShen: WuXing[] = [];
    const jiShen: WuXing[] = [];
    for (const wx of WX_LIST) {
      const rel = wuxingRelation(dayMasterWX, wx);
      if (rel === 'besheng' || rel === 'same') {
        yongShen.push(wx);
      } else {
        jiShen.push(wx);
      }
    }
    return { yongShen, jiShen };
  }
}

/* ===== 知识库文章 ===== */

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    title: '五格数理概述',
    category: '基础知识',
    brief: '五格数理是根据姓名笔画数计算天格、人格、地格、总格、外格的数理吉凶。',
    detail: '五格剖象法由日本熊崎健翁所创，后经中国学者改良。将姓名拆为天格（姓笔画+1）、人格（姓末字+名首字笔画）、地格（名字笔画之和+1或全名首字+1）、总格（全部笔画之和）、外格（总格-人格+1）五个维度，以康熙字典笔画为准。每格数理对应1-81吉凶表，又与五行相配合，是姓名学最基础的分析工具。',
    source: '《姓名与人生》',
  },
  {
    title: '天格详解',
    category: '五格详解',
    brief: '天格代表先天运势，由姓氏决定，无法改变。',
    detail: '天格又称"先格"，是由姓氏笔画加1（单姓）或姓氏二字笔画之和（复姓）得来。天格代表祖上基业与先天条件，对人生影响相对较小，但与人格搭配构成"天人关系"，影响中年运势。天格不能单独判断吉凶，须结合三才配置综合分析。',
    source: '《姓名学教程》',
  },
  {
    title: '人格详解',
    category: '五格详解',
    brief: '人格是姓名核心，代表本人性格、才能及一生主运。',
    detail: '人格又称"主格"，由姓末字与名首字笔画之和得来。人格是五格中最重要的一格，代表人的性格、智慧、体质及一生总体运势。人格的数理吉凶直接影响一生命运走向，其五行属性需与天格、地格构成良好的三才配置。人格又与外格构成"人外关系"，影响社交运。',
    source: '《姓名学教程》',
  },
  {
    title: '地格详解',
    category: '五格详解',
    brief: '地格代表前运（36岁前），影响青少年时期运势。',
    detail: '地格又称"前运"，单名者为名字笔画+1，双名者为名字二字笔画之和。地格代表36岁前的运势以及家庭、婚姻、子女方面的信息。地格与人格构成"人地关系"，是三才配置的基础组成，影响基础运势的稳固程度。',
    source: '《姓名学教程》',
  },
  {
    title: '总格与外格',
    category: '五格详解',
    brief: '总格代表后运（36岁后），外格代表社交运与副运势。',
    detail: '总格为姓名所有字笔画之和，代表36岁以后的运势和整体命运结局。外格为总格减去人格再加1，代表外在环境、社交关系和副运势。外格与人格的关系影响人际交往和社会评价。总格的吉凶对一生的最终成就有重要参考价值。',
    source: '《姓名学教程》',
  },
  {
    title: '三才配置详解',
    category: '进阶知识',
    brief: '三才配置即天才、人才、地才的五行组合，代表人生发展大势。',
    detail: '三才即天格、人格、地格各自对应的五行（按尾数取五行：1,2木 3,4火 5,6土 7,8金 9,0水）。三才之间的相生相克关系决定了人生基调：相生为吉（如木火土），相克为凶（如木金木）。三才影响面涵盖性格、事业、健康三大维度。125种组合各有定论，是判断姓名优劣的核心指标之一。良好的三才配置即使个别格数理欠佳也能化解，反之则可能使吉数理难以发挥。',
    source: '《三才五格姓名学》',
  },
  {
    title: '康熙笔画与现代简体',
    category: '基础知识',
    brief: '姓名学以康熙字典笔画为准，与现代简体笔画有别。',
    detail: '五格数理计算要求使用康熙字典的繁体笔画数，而非现代简体字笔画。例如"华"简体6画但康熙笔画为14画；"陈"简体7画但康熙为16画。部分特殊部首有固定画数规定：氵算4画、忄算4画、犭算4画、礻算5画、王（玉旁）算5画、艹算6画等。使用正确的康熙笔画是保证计算准确性的基础。',
    source: '《康熙字典》',
  },
  {
    title: '八字与姓名的关系',
    category: '进阶知识',
    brief: '好名字应补益八字所需，以喜用神五行为依据选字。',
    detail: '生辰八字反映先天命理格局，姓名则是后天调补手段。取名时首先排出八字、分析日主旺衰、确定喜用神五行，然后在姓名用字中补入喜用神五行。例如日主偏弱需生扶，若日主为木则喜水（生木）和木（同类），名字宜用五行属水或木的字。需注意：五格数理中人格、地格的五行也应尽量契合喜用神方向，形成"格局-用字-三才"三层协调。',
    source: '《四柱命理与姓名学》',
  },
  {
    title: '音律搭配原则',
    category: '实用技巧',
    brief: '好名字讲究平仄交替、声韵搭配、避免谐音不雅。',
    detail: '姓名的音律美感体现在三个层面：（1）平仄搭配：理想模式是平仄交替或平平仄、仄平平，避免全平或全仄；（2）声母搭配：避免姓名各字声母相同（如"李丽莉"均为L声母），否则读起来绕口；（3）韵母搭配：避免相邻字韵母完全相同；（4）谐音检查：需检查姓名整体和局部的谐音是否有负面含义。一个读起来朗朗上口的名字会增加好感度和记忆度。',
    source: '《音韵学与取名》',
  },
  {
    title: '字义选择与寓意',
    category: '实用技巧',
    brief: '选字应注重字义正面、寓意美好、文化底蕴丰富。',
    detail: '取名用字的字义是名字灵魂所在。选字原则：（1）字义明确正面，避免多义字的负面释义；（2）两字搭配寓意连贯，如"思远"有深思远虑之意；（3）避免生僻字，既不利于日常使用也可能造成误读；（4）注意字的文化内涵，经典诗词中的用字往往寓意深远；（5）性别适配，男名宜阳刚大气，女名宜温婉雅致；（6）考虑姓与名的整体意境，使全名形成和谐意象。',
    source: '《取名艺术》',
  },
  {
    title: '字形结构与美感',
    category: '实用技巧',
    brief: '姓名用字的结构搭配影响视觉美感和书写体验。',
    detail: '汉字结构分为独体、左右、上下、包围等类型。取名时应注意：（1）笔画数不宜差异过大，如姓氏笔画少（如"丁"2画）则名字也不宜过于繁复；（2）结构宜有变化，避免全部左右结构或全部上下结构；（3）避免姓与名形似造成辨识困难；（4）考虑签名书写的流畅性和美观度。',
    source: '《书法与取名》',
  },
  {
    title: '复姓取名要点',
    category: '进阶知识',
    brief: '复姓在五格计算上与单姓有所不同，需特别处理。',
    detail: '复姓（如欧阳、司马、上官等）在五格计算上：天格=姓氏二字笔画之和，人格=姓氏末字+名首字笔画之和，地格=名字笔画+1（单名）或名字二字笔画之和（双名）。复姓本身已有丰富的文化意蕴，取名时应与姓氏搭配和谐。由于复姓已占两字，全名三字者为"复姓+单名"，四字者为"复姓+双名"。复姓的天格固定，应围绕天格五行选择人格和地格的最佳配合。',
    source: '《姓名学教程》',
  },
  {
    title: '81数理吉凶速查',
    category: '速查表',
    brief: '81个数理各有吉凶，大吉数如1、3、5、8、11、13、15、16、21、23、24、31、32、33、35、37、41、45、47、48、52、57、61、63、65、67、68、81。',
    detail: '81数理中，吉数主要有：1(太极)、3(万物成形)、5(福禄长寿)、6(安稳吉庆)、7(精悍严谨)、8(坚刚志愿)、11(早苗逢雨)、13(才艺多能)、15(福寿双全)、16(厚重载德)、21(明月中天)、23(壮丽果敢)、24(掘藏得金)、31(春日花开)、32(宝马金鞍)、33(旭日升天)、35(温和平静)、37(猛虎出林)、41(纯阳独秀)、45(顺风帆航)、47(开花结子)、48(青松立鹤)、52(先见之明)、57(日照春松)、61(名利双收)、63(身心安泰)、65(光明正大)、67(财路亨通)、68(兴家立业)、81(万物回春)。半吉数须看搭配，凶数应尽量避免出现在人格和地格。',
    source: '《姓名数理》',
  },
  {
    title: '起名的基本步骤',
    category: '基础知识',
    brief: '科学起名遵循"排八字→定喜用→选笔画→配三才→择好字"的流程。',
    detail: '完整的起名流程：（1）排出生辰八字，确定日主旺衰和喜用神五行；（2）根据姓氏确定天格，规划人格和地格的最优笔画组合，使三才配置吉利且五格数理尽量为吉；（3）在目标笔画范围内筛选五行属性匹配喜用神的候选字；（4）检查字义、音律、字形是否和谐；（5）排除谐音不雅的组合；（6）综合评估多个候选名字，选择最优方案。专业起名需要这几个维度协调统一才能得到一个优秀的名字。',
    source: '《姓名学实务》',
  },
  {
    title: '姓名学流派简介',
    category: '基础知识',
    brief: '姓名学主要有五格派、音形义派、八字派等流派，各有侧重。',
    detail: '中国姓名学主要流派包括：（1）五格数理派：以康熙笔画计算五格数理和三才配置为核心，重视数理吉凶；（2）八字命理派：以补益八字喜用神五行为核心，将姓名作为命理调补工具；（3）音形义派：侧重姓名的读音美感、字形结构和文化寓意；（4）周易卦象派：通过姓名笔画起卦判断吉凶。现代实用姓名学通常综合以上各派精华，兼顾数理、八字、音形义多维度，力求全面评估。本系统即采用综合评估体系。',
    source: '《中国姓名学概论》',
  },
];
