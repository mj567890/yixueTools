/**
 * 八字多维度解读引擎
 *
 * 基于子平八字正统理论，从 10 个维度对命局进行自动化解读。
 * 每个维度输出：核心结论 + 详细解读 + 关键节点 + 大运/流年参考。
 *
 * 判断规则概要：
 * 1. 十神分组统计（天干权重1.0，藏干本气0.4，中气0.25，余气0.15）
 * 2. 日主强弱 → 确定用神/忌神 → 判断哪些十神对命主有利
 * 3. 大运十神 → 识别每步大运的主题（财运期、事业期、桃花期等）
 * 4. 五行对应脏腑/行业/性格 → 输出文字解读
 */

import type { BaziResult, BaziPillar, DaYunResult, DaYunItem } from './lunar';
import {
  WU_XING_MAP,
  GAN_YIN_YANG,
  WX_GENERATES,
  WX_CONTROLS,
  ZHI_CHONG,
  ZHI_HE,
  TIAN_GAN,
  DI_ZHI,
} from './lunar';

// ======================== 类型定义 ========================

/** 单个维度的解读结果 */
export interface DimensionInterpretation {
  id: string;
  title: string;
  icon: string;
  /** 标题所用五行配色 */
  colorElement: string;
  /** 核心结论（1-2 句） */
  conclusion: string;
  /** 详细解读段落 */
  details: string[];
  /** 关键结论（金色高亮） */
  highlights: HighlightItem[];
  /** 大运/流年时间参考 */
  periodRefs: PeriodRef[];
}

export interface HighlightItem {
  text: string;
  type: 'positive' | 'negative' | 'neutral';
}

export interface PeriodRef {
  period: string;
  ganZhi: string;
  description: string;
  type: 'opportunity' | 'risk' | 'neutral';
}

/** 十维度解读完整结果 */
export interface BaziInterpretation {
  dimensions: DimensionInterpretation[];
}

// ======================== 常量表 ========================

/** 日主十天干性格描述 */
const DAY_MASTER_PERSONALITY: Record<string, { trait: string; strength: string; weakness: string }> = {
  '甲': { trait: '刚正不阿，进取心强，如松柏般坚韧', strength: '领导力强，目标明确，善于开拓', weakness: '有时过于固执，不善妥协' },
  '乙': { trait: '温柔灵活，善于变通，如藤蔓般适应力强', strength: '心思细腻，人缘好，善于协调', weakness: '有时犹豫不决，依赖性较强' },
  '丙': { trait: '热情开朗，光明磊落，如太阳般温暖大方', strength: '感染力强，乐观积极，大方爽快', weakness: '有时缺乏耐心，做事急躁' },
  '丁': { trait: '内敛细腻，洞察力强，如灯火般温和专注', strength: '思维敏捷，善于钻研，有艺术天赋', weakness: '有时多虑多疑，情绪敏感' },
  '戊': { trait: '厚重沉稳，诚信可靠，如大山般踏实稳重', strength: '包容力强，言出必行，沉着冷静', weakness: '有时过于保守，反应较慢' },
  '己': { trait: '温顺包容，细致入微，如大地般滋养万物', strength: '善于照顾他人，观察细致，勤勉踏实', weakness: '有时优柔寡断，缺乏魄力' },
  '庚': { trait: '刚毅果断，重情重义，如利剑般锐利', strength: '行事果断，义气深重，执行力强', weakness: '有时过于强硬，不易变通' },
  '辛': { trait: '精致敏感，才华内蕴，如珠玉般内敛', strength: '审美力强，追求完美，心思缜密', weakness: '有时过于计较，承受力不足' },
  '壬': { trait: '智慧深邃，胸怀宽广，如大海般深沉', strength: '思维开阔，善于谋略，适应力强', weakness: '有时缺乏定性，做事不够专注' },
  '癸': { trait: '聪慧灵秀，善解人意，如雨露般温润', strength: '直觉力强，善于观察，心地柔软', weakness: '有时多虑敏感，抗压力不足' },
};

/** 五行对应行业 */
const WX_INDUSTRY: Record<string, string[]> = {
  '木': ['教育培训', '出版传媒', '文化创意', '医药养生', '农林环保'],
  '火': ['科技互联网', '电子电气', '娱乐演艺', '餐饮美食', '能源电力'],
  '土': ['房地产', '建筑工程', '农业畜牧', '物业管理', '珠宝玉石'],
  '金': ['金融投资', '机械制造', '法律司法', '汽车交通', '钢铁矿业'],
  '水': ['国际贸易', '物流运输', '旅游酒店', '信息咨询', '水利海运'],
};

/** 五行对应脏腑 */
const WX_ORGAN: Record<string, string> = {
  '木': '肝胆', '火': '心脏/小肠', '土': '脾胃', '金': '肺/大肠', '水': '肾/膀胱',
};

/** 五行健康建议 */
const WX_HEALTH_TIP: Record<string, string> = {
  '木': '宜多食绿色蔬菜，保持情绪舒畅，避免过度劳累伤肝',
  '火': '宜规律作息，注意心血管保养，避免情绪大起大落',
  '土': '宜饮食规律，注意脾胃调养，少食生冷辛辣',
  '金': '宜注意呼吸道保养，避免烟尘环境，坚持运动',
  '水': '宜注意保暖，适量饮水，避免过度劳累耗肾',
};

/** 桃花星查表：基于年支/日支的三合局 */
const PEACH_BLOSSOM: Record<string, string> = {
  '寅': '卯', '午': '卯', '戌': '卯',
  '巳': '午', '酉': '午', '丑': '午',
  '申': '酉', '子': '酉', '辰': '酉',
  '亥': '子', '卯': '子', '未': '子',
};

/** 天乙贵人查表 */
const HEAVENLY_NOBLE: Record<string, string[]> = {
  '甲': ['丑', '未'], '戊': ['丑', '未'],
  '乙': ['子', '申'], '己': ['子', '申'],
  '丙': ['亥', '酉'], '丁': ['亥', '酉'],
  '庚': ['午', '寅'], '辛': ['午', '寅'],
  '壬': ['巳', '卯'], '癸': ['巳', '卯'],
};

/** 文昌贵人查表 */
const LITERARY_STAR: Record<string, string> = {
  '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申',
  '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯',
};

// ======================== 辅助工具 ========================

/** 十神分组统计结果 */
interface ShiShenStats {
  raw: Record<string, number>;
  biJie: number;
  shiShang: number;
  caiXing: number;
  guanSha: number;
  yinXing: number;
  /** 权重最大的组名 */
  dominant: string;
}

/** 统计四柱中十神分布（天干权重 1.0，藏干分本/中/余气 0.4/0.25/0.15） */
function countShiShen(pillars: BaziPillar[]): ShiShenStats {
  const raw: Record<string, number> = {};
  for (const p of pillars) {
    if (p.shiShen && p.shiShen !== '日主') {
      raw[p.shiShen] = (raw[p.shiShen] || 0) + 1;
    }
    p.cangGan.forEach((cg, idx) => {
      if (cg.shiShen && cg.shiShen !== '日主') {
        const w = idx === 0 ? 0.4 : idx === 1 ? 0.25 : 0.15;
        raw[cg.shiShen] = (raw[cg.shiShen] || 0) + w;
      }
    });
  }
  const biJie = (raw['比肩'] || 0) + (raw['劫财'] || 0);
  const shiShang = (raw['食神'] || 0) + (raw['伤官'] || 0);
  const caiXing = (raw['正财'] || 0) + (raw['偏财'] || 0);
  const guanSha = (raw['正官'] || 0) + (raw['七杀'] || 0);
  const yinXing = (raw['正印'] || 0) + (raw['偏印'] || 0);

  const groups = { '比劫': biJie, '食伤': shiShang, '财星': caiXing, '官杀': guanSha, '印星': yinXing };
  const dominant = Object.entries(groups).sort((a, b) => b[1] - a[1])[0][0];

  return { raw, biJie, shiShang, caiXing, guanSha, yinXing, dominant };
}

/** 检查某地支是否出现在四柱地支中 */
function hasBranch(pillars: BaziPillar[], zhi: string): boolean {
  return pillars.some((p) => p.zhi === zhi);
}

/** 检测桃花星是否入命 */
function hasPeachBlossom(pillars: BaziPillar[]): { has: boolean; star: string } {
  const yearZhi = pillars[0].zhi;
  const dayZhi = pillars[2].zhi;
  const pb1 = PEACH_BLOSSOM[yearZhi];
  const pb2 = PEACH_BLOSSOM[dayZhi];
  for (const pb of [pb1, pb2]) {
    if (pb && hasBranch(pillars, pb)) {
      return { has: true, star: pb };
    }
  }
  return { has: false, star: '' };
}

/** 检测天乙贵人 */
function hasHeavenlyNoble(pillars: BaziPillar[]): boolean {
  const dayGan = pillars[2].gan;
  const nobles = HEAVENLY_NOBLE[dayGan] || [];
  return nobles.some((n) => hasBranch(pillars, n));
}

/** 检测文昌贵人 */
function hasLiteraryStar(pillars: BaziPillar[]): boolean {
  const yearGan = pillars[0].gan;
  const star = LITERARY_STAR[yearGan];
  return !!star && hasBranch(pillars, star);
}

/** 在大运列表中查找匹配特定十神的运期 */
function findDaYunByShiShen(daYunList: DaYunItem[], targetShiShen: string[]): PeriodRef[] {
  const refs: PeriodRef[] = [];
  for (const dy of daYunList) {
    if (targetShiShen.includes(dy.shiShen)) {
      const type: PeriodRef['type'] = dy.score >= 3.0 ? 'opportunity' : dy.score < 2.0 ? 'risk' : 'neutral';
      refs.push({
        period: `${dy.startAge}-${dy.endAge}岁`,
        ganZhi: dy.ganZhi,
        description: `${dy.ganZhi}运（${dy.shiShen}），${dy.grade}`,
        type,
      });
    }
  }
  return refs;
}

/** 在大运列表中查找高分/低分运期 */
function findDaYunByScore(daYunList: DaYunItem[], minScore: number, maxScore: number): PeriodRef[] {
  const refs: PeriodRef[] = [];
  for (const dy of daYunList) {
    if (dy.score >= minScore && dy.score <= maxScore) {
      const type: PeriodRef['type'] = dy.score >= 3.0 ? 'opportunity' : dy.score < 2.0 ? 'risk' : 'neutral';
      refs.push({
        period: `${dy.startAge}-${dy.endAge}岁`,
        ganZhi: dy.ganZhi,
        description: `${dy.ganZhi}运（${dy.shiShen}·${dy.grade}）`,
        type,
      });
    }
  }
  return refs;
}

/** 获取日支对应的配偶性格描述 */
function getSpouseDesc(dayZhi: string): string {
  const wx = WU_XING_MAP[dayZhi];
  const map: Record<string, string> = {
    '木': '伴侣性格温和善良，有上进心，注重自我成长',
    '火': '伴侣性格热情直爽，活泼外向，有感染力',
    '土': '伴侣性格踏实稳重，包容大度，值得信赖',
    '金': '伴侣性格果断干练，有原则性，做事利索',
    '水': '伴侣性格聪慧灵活，善于沟通，适应力强',
  };
  return map[wx] || '';
}

// ======================== 十维度解读函数 ========================

/** 1. 性格与天赋 */
function interpretPersonality(
  bazi: BaziResult,
  stats: ShiShenStats,
): DimensionInterpretation {
  const dm = bazi.dayMaster;
  const dmWx = bazi.dayMasterWuxing;
  const dmYy = bazi.dayMasterYinYang;
  const p = DAY_MASTER_PERSONALITY[dm] || { trait: '', strength: '', weakness: '' };
  const { dayMasterStrength } = bazi.wuxingAnalysis;

  const conclusion = `日主${dm}（${dmYy}${dmWx}），${p.trait}。十神以${stats.dominant}为主导。`;

  const details: string[] = [];
  details.push(`${p.strength}。${p.weakness}。身${dayMasterStrength === '偏强' ? '强' : dayMasterStrength === '偏弱' ? '弱' : '中和'}，${dayMasterStrength === '偏强' ? '个性刚强独立，不喜受人约束' : dayMasterStrength === '偏弱' ? '性格温和谦让，善于合作配合' : '刚柔并济，处事灵活适中'}。`);

  if (stats.biJie >= 1.5) {
    details.push('比劫较旺，自主意识强，独立性高，有竞争心和开拓精神。适合需要独当一面的岗位，但需注意与人合作时的协调沟通。');
  }
  if (stats.shiShang >= 1.5) {
    details.push('食伤较旺，思维活跃，创造力和表达力突出。善于创新和发挥个人才华，有艺术天赋或技术特长。适合创意、演说、写作、技术研发等方向。');
  }
  if (stats.caiXing >= 1.5) {
    details.push('财星较旺，务实重利，有商业头脑和理财能力。对物质生活有追求，善于把握商机。适合经商、投资、财务管理等方向。');
  }
  if (stats.guanSha >= 1.5) {
    details.push('官杀较旺，责任心强，做事有条理，重视社会地位和规则秩序。有管理才能和领导潜力。适合体制内工作、管理岗位或需要纪律性的职业。');
  }
  if (stats.yinXing >= 1.5) {
    details.push('印星较旺，好学善思，重感情，有文化素养和学术研究能力。善于吸收知识，内心世界丰富。适合教育、研究、咨询等知识密集型方向。');
  }

  const highlights: HighlightItem[] = [];
  highlights.push({ text: `天赋优势方向：${stats.dominant}主导 → ${getDominantTalent(stats.dominant)}`, type: 'positive' });
  if (stats.shiShang >= 2) highlights.push({ text: '创意天赋突出，适合需要想象力和表达力的领域', type: 'positive' });
  if (stats.guanSha >= 2 && dayMasterStrength === '偏强') highlights.push({ text: '身强任官，天生具备领导力和管理才能', type: 'positive' });

  return {
    id: 'personality', title: '性格与天赋', icon: '🧠', colorElement: '木',
    conclusion, details, highlights, periodRefs: [],
  };
}

function getDominantTalent(dominant: string): string {
  const m: Record<string, string> = {
    '比劫': '独立创业、竞技体育、自由职业',
    '食伤': '文学创作、艺术设计、演说表演、技术研发',
    '财星': '商业经营、投资理财、市场营销',
    '官杀': '行政管理、政务公职、企业高管',
    '印星': '教育科研、学术著作、心理咨询',
  };
  return m[dominant] || '';
}

/** 2. 学业与智慧 */
function interpretStudy(
  bazi: BaziResult,
  stats: ShiShenStats,
  daYunList: DaYunItem[],
): DimensionInterpretation {
  const hasShi = stats.raw['食神'] || 0;
  const hasShang = stats.raw['伤官'] || 0;
  const hasZhengYin = stats.raw['正印'] || 0;
  const hasPianYin = stats.raw['偏印'] || 0;
  const hasWenChang = hasLiteraryStar(bazi.pillars);

  let conclusion = '';
  if (stats.yinXing >= 1.5 || stats.shiShang >= 1.5) {
    conclusion = '学业根基良好，';
    if (hasZhengYin >= 1) conclusion += '正印得力，学习踏实，记忆力好，适合正统学历路线。';
    else if (hasPianYin >= 1) conclusion += '偏印透出，研究能力强，适合钻研专门学问。';
    else if (hasShi >= 1) conclusion += '食神见力，理解力深，学习稳扎稳打。';
    else conclusion += '伤官见力，思维敏锐，善于独立思考和创新。';
  } else {
    conclusion = '学业星力量一般，需要后天勤奋弥补。实践学习能力可能强于书本学习。';
  }

  const details: string[] = [];
  if (hasZhengYin >= 1) {
    details.push('正印代表正统学业、学历证书和考试运。命中正印得力，有利于在学校系统中取得好成绩，适合考取较高学历。学习方式偏向踏实积累型。');
  }
  if (hasPianYin >= 0.5) {
    details.push('偏印代表非正统学问、研究能力和悟性。命中偏印有力，适合学习专业技术、冷门学科或需要深度研究的方向。可能对小众领域有独到见解。');
  }
  if (hasShi >= 0.5) {
    details.push('食神代表稳定的智慧输出，思维清晰有条理。有利于文科、语言、教育类学习。表达能力好，适合做老师或文字工作者。');
  }
  if (hasShang >= 0.5) {
    details.push('伤官代表锐利的创新思维，善于质疑和突破常规。有利于理工科、技术创新、辩论演说。但在传统应试教育中可能因不循规蹈矩而受挫。');
  }
  if (hasWenChang) {
    details.push('命带文昌贵人，天生与学业有缘，考试运势较佳，有利于取得功名。');
  }
  if (details.length === 0) {
    details.push('命局中学业相关星辰力量不够突出，需要靠自身努力。实际操作和社会实践中的学习能力可能比书本学习更强。');
  }

  // 适配性
  const highlights: HighlightItem[] = [];
  if (stats.shiShang >= 1.5) {
    highlights.push({ text: hasShang > hasShi ? '思维偏理工创新型，适合理科、工科、IT技术' : '思维偏文理兼修型，文科功底较好', type: 'positive' });
  }
  if (stats.yinXing >= 1.5) {
    highlights.push({ text: '学历运佳，适合深造读研/读博', type: 'positive' });
  }
  if (hasWenChang) {
    highlights.push({ text: '命带文昌贵人，考试运势加持', type: 'positive' });
  }

  const periodRefs = findDaYunByShiShen(daYunList, ['正印', '偏印', '食神']);
  for (const ref of periodRefs) {
    if (ref.type === 'opportunity') {
      ref.description = `${ref.ganZhi}运 — 学业/进修黄金期`;
    }
  }

  return {
    id: 'study', title: '学业与智慧', icon: '📚', colorElement: '水',
    conclusion, details, highlights, periodRefs: periodRefs.slice(0, 4),
  };
}

/** 3. 事业与方向 */
function interpretCareer(
  bazi: BaziResult,
  stats: ShiShenStats,
  daYunList: DaYunItem[],
): DimensionInterpretation {
  const { dayMasterStrength } = bazi.wuxingAnalysis;
  const dmWx = bazi.dayMasterWuxing;
  const hasZhengGuan = (stats.raw['正官'] || 0) >= 0.5;
  const hasQiSha = (stats.raw['七杀'] || 0) >= 0.5;

  let conclusion = '';
  if (stats.guanSha >= 1.5 && dayMasterStrength !== '偏弱') {
    conclusion = '命局官杀有力且日主能承担，事业心强，有管理才能和升迁机会。';
    if (hasZhengGuan && !hasQiSha) conclusion += '适合体制内稳步发展。';
    else if (hasQiSha) conclusion += '敢闯敢拼，适合创业或竞争激烈的行业。';
  } else if (stats.shiShang >= 1.5 && stats.caiXing >= 1) {
    conclusion = '食伤生财格局，适合凭借才华和技能赚钱。自由职业或自主创业运势较好。';
  } else if (stats.yinXing >= 1.5) {
    conclusion = '印星得力，有贵人相助，适合文化教育、技术研发等需要积累的行业。';
  } else {
    conclusion = '事业星力量较平均，需要主动寻找机会。适合选择与日主五行相生的行业方向。';
  }

  const details: string[] = [];

  // 行业方向
  const yongShenWx = getYongShenWx(dmWx, dayMasterStrength);
  const industries: string[] = [];
  for (const wx of yongShenWx) {
    industries.push(...(WX_INDUSTRY[wx] || []));
  }
  if (industries.length > 0) {
    details.push(`基于命局用神五行，适合的行业方向：${industries.slice(0, 6).join('、')}。`);
  }

  // 职业类型
  if (hasZhengGuan) details.push('正官代表稳定的事业和社会地位。适合公务员、事业单位、大型企业管理岗等正规职业发展路线。工作中注重规则和秩序。');
  if (hasQiSha) details.push('七杀代表魄力和竞争力。适合军警、创业者、销售管理等需要强势执行力的岗位。不畏困难，善于在压力中成长。');
  if (stats.shiShang >= 1.5) details.push('食伤旺者适合需要创意和表达的职业：作家、设计师、程序员、自媒体、培训师等。靠个人能力吃饭，不宜过多受制于体制。');
  if (stats.caiXing >= 1.5) details.push('财星旺者有商业直觉，适合经商、投资、市场运营。善于发现赚钱机会，但需注意风险控制。');

  // 日主强弱影响
  if (dayMasterStrength === '偏强') {
    details.push('身强者精力旺盛，能承受高压工作。适合管理岗或独当一面的角色，不宜做过于安逸的工作。');
  } else if (dayMasterStrength === '偏弱') {
    details.push('身弱者宜选择压力适中的工作环境，重视团队合作和贵人支持。不宜过于冒进，稳中求进为佳。');
  }

  const highlights: HighlightItem[] = [];
  const careerDaYun = findDaYunByShiShen(daYunList, ['正官', '七杀']);
  const bestCareer = careerDaYun.find((r) => r.type === 'opportunity');
  if (bestCareer) {
    highlights.push({ text: `事业上升期：${bestCareer.period}（${bestCareer.ganZhi}运）`, type: 'positive' });
  }
  if (stats.guanSha >= 2 && dayMasterStrength === '偏强') {
    highlights.push({ text: '身强任官，具备高管/领导潜质', type: 'positive' });
  }

  const periodRefs = [
    ...findDaYunByShiShen(daYunList, ['正官', '七杀']),
    ...findDaYunByShiShen(daYunList, ['正印']),
  ].slice(0, 5);
  for (const ref of periodRefs) {
    if (['正官', '七杀'].includes(ref.description.split('（')[1]?.split('）')[0] || '')) {
      ref.description += ' — 事业变动/升迁机遇期';
    }
  }

  return {
    id: 'career', title: '事业与方向', icon: '💼', colorElement: '金',
    conclusion, details, highlights, periodRefs,
  };
}

/** 获取用神五行（简化版） */
function getYongShenWx(dayWx: string, strength: string): string[] {
  const elements = ['木', '火', '土', '金', '水'];
  const genMe = elements.find((e) => WX_GENERATES[e] === dayWx);
  const iGen = WX_GENERATES[dayWx];
  const iCtrl = WX_CONTROLS[dayWx];
  const ctrlMe = elements.find((e) => WX_CONTROLS[e] === dayWx);

  if (strength === '偏弱') return [dayWx, genMe].filter(Boolean) as string[];
  if (strength === '偏强') return [iGen, iCtrl, ctrlMe].filter(Boolean) as string[];
  return [iGen, dayWx].filter(Boolean) as string[];
}

/** 4. 财运与赚钱模式 */
function interpretWealth(
  bazi: BaziResult,
  stats: ShiShenStats,
  daYunList: DaYunItem[],
): DimensionInterpretation {
  const { dayMasterStrength } = bazi.wuxingAnalysis;
  const zhengCai = stats.raw['正财'] || 0;
  const pianCai = stats.raw['偏财'] || 0;

  let conclusion = '';
  const isBodyStrong = dayMasterStrength === '偏强' || dayMasterStrength === '中和';

  if (stats.caiXing >= 1.5 && isBodyStrong) {
    conclusion = '财星有力且身旺能担财，财运基础良好。';
    if (zhengCai > pianCai) conclusion += '以正财为主，适合通过稳定工作和正当途径积累财富。';
    else conclusion += '偏财较旺，有意外收入和投资收益的机会。';
  } else if (stats.caiXing >= 1.5 && dayMasterStrength === '偏弱') {
    conclusion = '财星旺但身弱，钱财来去频繁，赚得到但不易守住。需增强自身实力才能稳固财运。';
  } else if (stats.shiShang >= 1.5 && stats.caiXing >= 0.5) {
    conclusion = '食伤生财格局，善于用才华和技能赚钱。属于"靠本事吃饭"的类型。';
  } else {
    conclusion = '财星力量一般，财运需要后天努力经营。踏实工作、量入为出是稳妥之道。';
  }

  const details: string[] = [];
  if (zhengCai >= 1) {
    details.push('正财代表稳定收入、工资薪酬和正当经营所得。命中正财有力，适合做"固定收入+逐步积累"的理财模式。投资宜保守稳健，不宜冒进。');
  }
  if (pianCai >= 1) {
    details.push('偏财代表意外之财、投资回报和非固定收入。命中偏财有力，有投资眼光和赚外快的机会。但偏财来去无定，需注意风控。');
  }
  if (stats.shiShang >= 1 && stats.caiXing >= 0.5) {
    details.push('食伤生财：通过个人才华、专业技能或创意来创造价值。适合知识付费、技术变现、自媒体、咨询等模式。');
  }
  if (stats.biJie >= 2 && stats.caiXing >= 1) {
    details.push('比劫夺财：命中比劫较旺，需注意合伙经营中的利益纷争。钱财不宜借出，合作需签书面协议。独资经营可能优于合伙。');
  }

  // 守财能力
  if (isBodyStrong && stats.caiXing >= 1) {
    details.push('身旺担财，守财能力较强，财富能够有效积累。晚年财运基础稳固。');
  } else if (dayMasterStrength === '偏弱' && stats.caiXing >= 1.5) {
    details.push('身弱财旺，赚钱辛苦且容易破耗。建议减少大额投资，先提升自身能力和收入基础。');
  }

  const highlights: HighlightItem[] = [];
  const wealthDaYun = findDaYunByShiShen(daYunList, ['正财', '偏财']);
  const bestWealth = wealthDaYun.find((r) => r.type === 'opportunity');
  if (bestWealth) {
    highlights.push({ text: `旺财大运：${bestWealth.period}（${bestWealth.ganZhi}运）`, type: 'positive' });
  }
  const riskWealth = findDaYunByShiShen(daYunList, ['劫财', '比肩']).find((r) => r.type === 'risk');
  if (riskWealth) {
    highlights.push({ text: `破财风险期：${riskWealth.period}，注意合作纠纷与开支`, type: 'negative' });
  }
  if (stats.shiShang >= 1.5 && stats.caiXing >= 0.5) {
    highlights.push({ text: '食伤生财格局：凭才华赚钱是最佳路径', type: 'positive' });
  }

  const periodRefs = [
    ...findDaYunByShiShen(daYunList, ['正财', '偏财']),
    ...findDaYunByShiShen(daYunList, ['食神', '伤官']),
  ].slice(0, 5);

  return {
    id: 'wealth', title: '财运与赚钱模式', icon: '💰', colorElement: '土',
    conclusion, details, highlights, periodRefs,
  };
}

/** 5. 感情与婚姻 */
function interpretMarriage(
  bazi: BaziResult,
  stats: ShiShenStats,
  daYunList: DaYunItem[],
  gender: number,
): DimensionInterpretation {
  const pillars = bazi.pillars;
  const dayZhi = pillars[2].zhi;
  const { dayMasterStrength } = bazi.wuxingAnalysis;

  // 配偶星
  const spouseStar = gender === 1 ? '正财' : '正官';
  const rivalStar = gender === 1 ? '偏财' : '七杀';
  const spouseCount = stats.raw[spouseStar] || 0;
  const rivalCount = stats.raw[rivalStar] || 0;

  // 日支冲合
  let dayZhiClash = false;
  let dayZhiHe = false;
  for (let i = 0; i < pillars.length; i++) {
    if (i === 2) continue;
    if (ZHI_CHONG[dayZhi] === pillars[i].zhi) dayZhiClash = true;
    if (ZHI_HE[dayZhi] === pillars[i].zhi) dayZhiHe = true;
  }

  // 桃花
  const peach = hasPeachBlossom(pillars);

  let conclusion = '';
  if (spouseCount >= 0.5 && spouseCount <= 1.5 && !dayZhiClash) {
    conclusion = `${spouseStar}适中，配偶宫稳定，感情基础较好。`;
  } else if (spouseCount >= 2) {
    conclusion = `${spouseStar}过多，感情经历丰富，需注意感情中的选择和专注。`;
  } else if (spouseCount < 0.5) {
    conclusion = `${spouseStar}不显，异性缘较晚显现，宜耐心等待合适对象。`;
  } else {
    conclusion = '感情运势中等，需要用心经营。';
  }
  if (dayZhiClash) conclusion += '日支逢冲，婚姻需多加包容忍让。';

  const details: string[] = [];

  // 配偶性格
  const spouseDesc = getSpouseDesc(dayZhi);
  if (spouseDesc) details.push(`日支（配偶宫）为${dayZhi}：${spouseDesc}。`);

  // 配偶星分析
  if (gender === 1) {
    if (spouseCount >= 1) details.push('正财代表正妻缘，命中正财得力，有利于遇到贤良持家的伴侣。婚后财运也会因配偶而得到助力。');
    if (rivalCount >= 1.5) details.push('偏财较多，异性缘旺盛但需注意感情上的定力。婚前多交往、婚后需专一。');
  } else {
    if (spouseCount >= 1) details.push('正官代表正夫缘，命中正官得力，有利于遇到稳重有责任感的伴侣。丈夫事业运较好。');
    if (rivalCount >= 1.5) details.push('七杀较多，感情中可能遇到较强势的对象。需注意辨别真心，避免仓促决定。');
    if ((stats.raw['伤官'] || 0) >= 1.5) details.push('伤官较旺，个性独立鲜明。在感情中容易与伴侣产生观念冲突，需学会表达方式的柔和。');
  }

  // 日支冲合
  if (dayZhiClash) details.push('日支逢冲，代表配偶宫不稳定。婚姻中可能出现较大波动或分歧。建议婚前充分了解对方，婚后多加沟通包容。适当保持个人空间有助稳定。');
  if (dayZhiHe) details.push('日支逢合，配偶宫稳定，夫妻关系较为和睦。婚后生活默契度高，有利于长久稳定。');

  if (peach.has) {
    details.push(`命带桃花星（${peach.star}），异性缘较佳，社交魅力强。未婚时有利于结识对象，已婚后需注意保持适当社交距离。`);
  }

  const highlights: HighlightItem[] = [];
  const marriageDaYun = findDaYunByShiShen(daYunList, [spouseStar, rivalStar]);
  const bestMarriage = marriageDaYun.find((r) => r.type === 'opportunity');
  if (bestMarriage) {
    highlights.push({ text: `姻缘机遇期：${bestMarriage.period}（${bestMarriage.ganZhi}运）`, type: 'positive' });
  }
  if (dayZhiClash) {
    highlights.push({ text: '配偶宫逢冲，婚姻宜晚不宜早，建议28岁后再考虑结婚', type: 'neutral' });
  }
  if (peach.has) {
    highlights.push({ text: `桃花星入命（${peach.star}），异性缘旺盛`, type: 'positive' });
  }

  const periodRefs = findDaYunByShiShen(daYunList, [spouseStar, rivalStar]).slice(0, 4);

  return {
    id: 'marriage', title: '感情与婚姻', icon: '💑', colorElement: '火',
    conclusion, details, highlights, periodRefs,
  };
}

/** 6. 家庭与父母 */
function interpretFamily(
  bazi: BaziResult,
  stats: ShiShenStats,
  daYunList: DaYunItem[],
  gender: number,
): DimensionInterpretation {
  const yearPillar = bazi.pillars[0];
  const monthPillar = bazi.pillars[1];

  const motherStar = stats.raw['正印'] || 0;
  const fatherStar = stats.raw['偏财'] || 0;

  let conclusion = '';
  if (stats.yinXing >= 1 && stats.caiXing >= 0.5) {
    conclusion = '年月柱根基较好，与父母关系和睦，家庭助力较强。';
  } else if (stats.yinXing >= 1.5) {
    conclusion = '印星得力，与母亲缘分深厚，家中长辈支持较多。';
  } else if (stats.caiXing >= 1.5 && gender === 1) {
    conclusion = '财星较旺，与父亲关系密切，可能得到父辈的事业资源。';
  } else {
    conclusion = '家庭助力中等，个人独立发展的成分更大。';
  }

  const details: string[] = [];

  // 年柱看祖上
  details.push(`年柱${yearPillar.ganZhi}代表祖上和家庭背景。年柱纳音为${yearPillar.naYin}，${yearPillar.shiShen === '正印' || yearPillar.shiShen === '偏印' ? '祖上有文化根基或家教良好' : yearPillar.shiShen === '正财' || yearPillar.shiShen === '偏财' ? '祖上有一定经济基础' : '家庭背景平实，靠自身打拼'}。`);

  // 月柱看父母
  details.push(`月柱${monthPillar.ganZhi}代表父母宫。月柱十神为${monthPillar.shiShen}，${getMonthPillarDesc(monthPillar.shiShen)}。`);

  // 印星看母亲
  if (motherStar >= 1) {
    details.push('正印有力，与母亲感情深厚。母亲对你关爱有加，在成长过程中给予充分的支持和教育。遇到困难时母亲是重要的精神支柱。');
  } else if ((stats.raw['偏印'] || 0) >= 1) {
    details.push('偏印有力，与母亲关系较特殊。母亲可能个性独特或在教育方式上不走寻常路。关系时近时远，但内心牵挂不减。');
  }

  // 偏财看父亲
  if (fatherStar >= 1) {
    details.push('偏财有力，与父亲缘分较深。父亲可能是家庭经济支柱，事业有成或有一定社会资源。能从父辈获得物质或人脉上的帮助。');
  }

  const highlights: HighlightItem[] = [];
  if (stats.yinXing >= 1.5) highlights.push({ text: '印星强旺，家庭教育根基深厚', type: 'positive' });
  if (stats.biJie >= 2) highlights.push({ text: '比劫较多，兄弟姐妹缘分较深，但可能有竞争', type: 'neutral' });

  return {
    id: 'family', title: '家庭与父母', icon: '🏠', colorElement: '土',
    conclusion, details, highlights,
    periodRefs: findDaYunByShiShen(daYunList, ['正印', '偏印', '偏财']).slice(0, 3),
  };
}

function getMonthPillarDesc(shiShen: string): string {
  const m: Record<string, string> = {
    '比肩': '父母性格与你相似，关系平等但有时各持己见',
    '劫财': '与父母关系中有竞争元素，独立意识较早觉醒',
    '食神': '家庭氛围宽松温馨，父母注重生活品质',
    '伤官': '与父母可能在观念上有分歧，但感情深处仍有挂念',
    '正财': '父母持家有方，家庭经济基础较好',
    '偏财': '父亲有一定事业基础，家境较为宽裕',
    '正官': '父母管教较严，家规清晰，有利于培养规矩意识',
    '七杀': '成长环境有一定压力，但这些压力促使你更早独立成熟',
    '正印': '母亲温柔慈爱，家庭教育氛围好，利于学业',
    '偏印': '家庭教育方式独特，可能有不同于常人的成长经历',
  };
  return m[shiShen] || '家庭环境平实';
}

/** 7. 子女 */
function interpretChildren(
  bazi: BaziResult,
  stats: ShiShenStats,
  daYunList: DaYunItem[],
  gender: number,
): DimensionInterpretation {
  const timePillar = bazi.pillars[3];
  const timeShiShen = timePillar.shiShen;

  // 子女星：男命看官杀，女命看食伤
  const childStarName = gender === 1 ? '官杀' : '食伤';
  const childStarCount = gender === 1 ? stats.guanSha : stats.shiShang;

  let conclusion = '';
  if (childStarCount >= 1 && childStarCount <= 2) {
    conclusion = `${childStarName}适中，子女缘分较好。`;
  } else if (childStarCount >= 2) {
    conclusion = `${childStarName}较旺，子女缘分深厚，可能子女较多或子女能力较强。`;
  } else {
    conclusion = `${childStarName}力量偏弱，子女缘来得较晚，但不代表无子女缘。`;
  }

  const details: string[] = [];

  // 时柱分析
  const timeWx = WU_XING_MAP[timePillar.gan];
  details.push(`时柱${timePillar.ganZhi}为子女宫。时柱十神为${timeShiShen === '日主' ? '比肩' : timeShiShen}，纳音${timePillar.naYin}。时柱五行属${timeWx}，子女性格可能偏向${getChildPersonality(timeWx)}。`);

  // 子女缘
  if (gender === 1) {
    if (stats.guanSha >= 1) details.push('男命官杀代表子女星。命中官杀得力，子女有出息，对你的事业和晚年有正面助力。');
    if ((stats.raw['食神'] || 0) >= 1) details.push('食神也可辅助看子女缘，食神有力者与子女关系亲近，子女性格温顺。');
  } else {
    if (stats.shiShang >= 1) details.push('女命食伤代表子女星。命中食伤得力，子女聪明伶俐，与你感情较好。');
    if ((stats.raw['正官'] || 0) >= 1) details.push('正官兼看子女缘（尤其是女儿），正官有力者子女乖巧懂事。');
  }

  // 时柱冲合
  const timeZhi = timePillar.zhi;
  for (const p of bazi.pillars) {
    if (p === timePillar) continue;
    if (ZHI_CHONG[timeZhi] === p.zhi) {
      details.push('时柱地支逢冲，与子女可能有一定距离感（如子女远行、聚少离多），但不影响深层感情。');
      break;
    }
  }

  const highlights: HighlightItem[] = [];
  if (childStarCount >= 1.5) highlights.push({ text: '子女缘深，晚年可得子女照顾', type: 'positive' });

  const childShiShen = gender === 1 ? ['正官', '七杀'] : ['食神', '伤官'];
  const periodRefs = findDaYunByShiShen(daYunList, childShiShen).slice(0, 3);

  return {
    id: 'children', title: '子女', icon: '👶', colorElement: '木',
    conclusion, details, highlights, periodRefs,
  };
}

function getChildPersonality(wx: string): string {
  const m: Record<string, string> = {
    '木': '仁慈善良、有上进心', '火': '活泼开朗、热情好动',
    '土': '踏实稳重、包容沉稳', '金': '果断聪明、有主见',
    '水': '聪慧灵活、好奇心强',
  };
  return m[wx] || '性格均衡';
}

/** 8. 健康与隐患 */
function interpretHealth(
  bazi: BaziResult,
  stats: ShiShenStats,
  daYunList: DaYunItem[],
): DimensionInterpretation {
  const { counts, missing, dayMasterStrength } = bazi.wuxingAnalysis;
  const elements = ['木', '火', '土', '金', '水'];

  let conclusion = '';
  if (missing.length === 0 && dayMasterStrength === '中和') {
    conclusion = '五行俱全且日主中和，先天体质根基较好。注意顺应节气养生即可。';
  } else if (missing.length > 0) {
    conclusion = `五行缺${missing.join('、')}，先天在${missing.map((e) => WX_ORGAN[e]).join('、')}方面需要多加关注。`;
  } else {
    conclusion = '五行无缺，但部分五行偏旺需注意对应脏腑的过度消耗。';
  }

  const details: string[] = [];

  // 缺失五行
  for (const el of missing) {
    details.push(`五行缺${el}：${el}对应${WX_ORGAN[el]}。${WX_HEALTH_TIP[el]}。在缺${el}的大运流年中需格外注意。`);
  }

  // 过旺五行
  for (const el of elements) {
    if ((counts[el] || 0) >= 4) {
      details.push(`${el}行过旺：${el}对应${WX_ORGAN[el]}。过旺则此系统可能过度活跃或消耗过大。宜适当抑制，饮食上减少${el === '木' ? '酸' : el === '火' ? '苦' : el === '土' ? '甜' : el === '金' ? '辛' : '咸'}味摄入。`);
    }
  }

  // 日主强弱与体质
  if (dayMasterStrength === '偏强') {
    details.push('日主偏强，先天精力较旺。体质较好但要避免过度消耗。年轻时不觉疲劳，但中年后需注意劳逸结合。');
  } else if (dayMasterStrength === '偏弱') {
    details.push('日主偏弱，先天体质需要后天调养。建议规律作息，避免过度劳累。适当运动增强体质，饮食宜温补。');
  } else {
    details.push('日主中和，先天体质均衡。日常注意基本养生即可，无特别突出的健康短板。');
  }

  const highlights: HighlightItem[] = [];
  if (missing.length > 0) {
    highlights.push({ text: `重点关注：${missing.map((e) => `${e}→${WX_ORGAN[e]}`).join('、')}`, type: 'negative' });
  }

  // 健康风险大运
  const riskDaYun = daYunList.filter((dy) => {
    // 大运五行如果克制命局缺失五行对应的脏腑
    for (const m of missing) {
      if (WX_CONTROLS[dy.ganWuxing] === m || WX_CONTROLS[dy.zhiWuxing] === m) return true;
    }
    return false;
  });
  if (riskDaYun.length > 0) {
    const ref = riskDaYun[0];
    highlights.push({ text: `健康注意期：${ref.startAge}-${ref.endAge}岁（${ref.ganZhi}运）`, type: 'negative' });
  }

  const periodRefs: PeriodRef[] = riskDaYun.slice(0, 3).map((dy) => ({
    period: `${dy.startAge}-${dy.endAge}岁`,
    ganZhi: dy.ganZhi,
    description: `${dy.ganZhi}运 — 注意${missing.map((e) => WX_ORGAN[e]).join('、')}保养`,
    type: 'risk' as const,
  }));

  return {
    id: 'health', title: '健康与隐患', icon: '🏥', colorElement: '水',
    conclusion, details, highlights, periodRefs,
  };
}

/** 9. 贵人与小人 */
function interpretBenefactor(
  bazi: BaziResult,
  stats: ShiShenStats,
  daYunList: DaYunItem[],
): DimensionInterpretation {
  const hasNoble = hasHeavenlyNoble(bazi.pillars);

  let conclusion = '';
  if (stats.yinXing >= 1.5 || hasNoble) {
    conclusion = '命中贵人星较旺，人生中能遇到关键助力者。';
    if (hasNoble) conclusion += '天乙贵人入命，逢难呈祥，关键时刻有人伸出援手。';
  } else {
    conclusion = '贵人星力量一般，需要主动经营人脉关系。';
  }
  if (stats.biJie >= 2) {
    conclusion += '比劫偏旺，需注意身边的竞争和暗算。';
  }

  const details: string[] = [];

  // 贵人类型
  if ((stats.raw['正印'] || 0) >= 1) {
    details.push('正印贵人：代表长辈、师长、母亲式的贵人。在学业和事业初期给予指导和庇护。适合多向年长者请教，拜师学艺尤为有利。');
  }
  if ((stats.raw['正官'] || 0) >= 1) {
    details.push('正官贵人：代表上级、领导、官方贵人。工作中能遇到赏识你的上司。适合在体制内或大企业中寻求发展，容易得到提拔。');
  }
  if ((stats.raw['食神'] || 0) >= 1) {
    details.push('食神贵人：代表才华带来的贵人缘。通过展示专业能力吸引贵人注意。适合通过作品、演讲、社交活动建立人脉。');
  }
  if (hasNoble) {
    details.push('天乙贵人入命：这是八字中最有力的贵人星。遇到危难时总有人相助，能化险为夷。一生中多得他人帮扶。');
  }

  // 小人提醒
  if (stats.biJie >= 2) {
    details.push('比劫旺盛，同辈中可能出现竞争对手或"小人"。特征：表面友好、暗中争利。应对建议：核心利益不轻易分享，重要决策独立判断。');
  }
  if ((stats.raw['七杀'] || 0) >= 1.5) {
    details.push('七杀偏旺，可能遇到较强势的对手或压制者。特征：在职场中可能有人刻意打压。应对建议：提升实力是最好的防御，避免正面冲突。');
  }

  const highlights: HighlightItem[] = [];
  if (hasNoble) highlights.push({ text: '天乙贵人入命，逢凶化吉能力强', type: 'positive' });

  // 贵人运期
  const nobleDaYun = findDaYunByShiShen(daYunList, ['正印', '正官']);
  if (nobleDaYun.length > 0) {
    const best = nobleDaYun.find((r) => r.type === 'opportunity') || nobleDaYun[0];
    highlights.push({ text: `贵人运旺期：${best.period}（${best.ganZhi}运）`, type: 'positive' });
  }

  // 小人运期
  const rivalDaYun = findDaYunByShiShen(daYunList, ['劫财', '七杀']).filter((r) => r.type === 'risk');
  if (rivalDaYun.length > 0) {
    highlights.push({ text: `防小人期：${rivalDaYun[0].period}，注意人际关系`, type: 'negative' });
  }

  const periodRefs = [...nobleDaYun, ...rivalDaYun].slice(0, 5);

  return {
    id: 'benefactor', title: '贵人与小人', icon: '🤝', colorElement: '金',
    conclusion, details, highlights, periodRefs,
  };
}

/** 10. 人生大运节奏 */
function interpretLifeRhythm(
  bazi: BaziResult,
  stats: ShiShenStats,
  daYunList: DaYunItem[],
): DimensionInterpretation {
  const conclusion = `共${daYunList.length}步大运。每步大运十年，主导该阶段的人生主题和运势走向。`;

  const details: string[] = [];

  for (const dy of daYunList) {
    const theme = getDaYunTheme(dy.shiShen);
    const strength = dy.score >= 3.0 ? '运势较好' : dy.score < 2.0 ? '运势偏弱' : '运势平稳';
    const gradeLabel = dy.grade;

    let desc = `【${dy.startAge}-${dy.endAge}岁】${dy.ganZhi}运（${dy.shiShen}·${gradeLabel}）：${theme}。${strength}`;

    // 合冲提示
    for (const p of bazi.pillars) {
      if (ZHI_CHONG[dy.zhi] === p.zhi) {
        desc += `。${dy.zhi}${p.zhi}相冲，此运有较大变动`;
        break;
      }
    }

    details.push(desc);
  }

  const highlights: HighlightItem[] = [];
  const bestDaYun = findDaYunByScore(daYunList, 3.5, 5);
  if (bestDaYun.length > 0) {
    highlights.push({ text: `人生黄金期：${bestDaYun.map((r) => r.period).join('、')}`, type: 'positive' });
  }
  const worstDaYun = findDaYunByScore(daYunList, 0, 1.5);
  if (worstDaYun.length > 0) {
    highlights.push({ text: `低谷期需注意：${worstDaYun.map((r) => r.period).join('、')}`, type: 'negative' });
  }

  // 运势走势
  const scores = daYunList.map((dy) => dy.score);
  const rising = scores.length > 2 && scores[scores.length - 1] > scores[0];
  if (rising) {
    highlights.push({ text: '运势整体呈上升趋势，越老越顺', type: 'positive' });
  }

  const periodRefs = daYunList.map((dy) => ({
    period: `${dy.startAge}-${dy.endAge}岁`,
    ganZhi: dy.ganZhi,
    description: `${dy.shiShen}·${dy.grade}`,
    type: (dy.score >= 3.0 ? 'opportunity' : dy.score < 2.0 ? 'risk' : 'neutral') as PeriodRef['type'],
  }));

  return {
    id: 'lifeRhythm', title: '人生大运节奏', icon: '🎯', colorElement: '火',
    conclusion, details, highlights, periodRefs,
  };
}

function getDaYunTheme(shiShen: string): string {
  const m: Record<string, string> = {
    '比肩': '自我意识增强，竞争与合作并存，适合独立发展',
    '劫财': '社交活跃，花销增大，注意合作中的利益纠纷',
    '食神': '生活安逸，才华外显，适合创作和享受生活',
    '伤官': '创新突破期，敢于打破常规，但也容易得罪人',
    '正财': '稳定聚财期，收入增加，适合投资置业',
    '偏财': '意外收获期，投资机会多，但需控制风险',
    '正官': '事业上升期，有升迁机会，适合体制内发展',
    '七杀': '压力与挑战并存，适合创业或大刀阔斧的改变',
    '正印': '贵人帮扶期，适合学习进修，有长辈提携',
    '偏印': '思考沉淀期，适合研究和独处，注意避免孤立',
  };
  return m[shiShen] || '运势平稳，按部就班';
}

// ======================== 主入口 ========================

/**
 * 生成八字十维度解读
 *
 * @param baziResult 八字排盘结果
 * @param daYunResult 大运排盘结果
 * @param gender 性别 1=男 0=女
 * @returns 十维度解读结果
 */
export function getBaziInterpretation(
  baziResult: BaziResult,
  daYunResult: DaYunResult,
  gender: number,
): BaziInterpretation {
  const stats = countShiShen(baziResult.pillars);
  const daYunList = daYunResult.daYunList;

  return {
    dimensions: [
      interpretPersonality(baziResult, stats),
      interpretStudy(baziResult, stats, daYunList),
      interpretCareer(baziResult, stats, daYunList),
      interpretWealth(baziResult, stats, daYunList),
      interpretMarriage(baziResult, stats, daYunList, gender),
      interpretFamily(baziResult, stats, daYunList, gender),
      interpretChildren(baziResult, stats, daYunList, gender),
      interpretHealth(baziResult, stats, daYunList),
      interpretBenefactor(baziResult, stats, daYunList),
      interpretLifeRhythm(baziResult, stats, daYunList),
    ],
  };
}
