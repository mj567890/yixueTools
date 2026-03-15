/**
 * 梅花易数 —— 体用分析 + 动爻解读 + 问事结论引擎
 */
import type {
  DivinationResult, TiYongRelation, TiYongType,
  VerdictItem, VerdictLevel, MeihuaAnalysis,
} from './types';
import { WX_SHENG, WX_KE, WX_XIANG, YAO_POSITION_MEANING, GUA_XIANG } from './constants';

// ============================================================
//  体用关系分析
// ============================================================

/** 判定两个五行之间的体用关系 */
export function analyzeTiYong(result: DivinationResult): TiYongRelation {
  const tiEl = result.tiGua.element;
  const yongEl = result.yongGua.element;

  let relationType: TiYongType;
  let relation: string;
  let favorable: boolean;
  let summary: string;

  if (tiEl === yongEl) {
    // 比和
    relationType = 'bihe';
    relation = '体用比和';
    favorable = true;
    summary = `体卦${result.tiGua.name}(${tiEl})与用卦${result.yongGua.name}(${yongEl})五行相同，为比和之象，主平稳顺遂。`;
  } else if (WX_SHENG[yongEl] === tiEl) {
    // 用生体
    relationType = 'sheng_ti';
    relation = '用生体';
    favorable = true;
    summary = `用卦${result.yongGua.name}(${yongEl})生体卦${result.tiGua.name}(${tiEl})，${yongEl}生${tiEl}，得外力相助，大吉之象。`;
  } else if (WX_KE[tiEl] === yongEl) {
    // 体克用
    relationType = 'ti_ke';
    relation = '体克用';
    favorable = true;
    summary = `体卦${result.tiGua.name}(${tiEl})克用卦${result.yongGua.name}(${yongEl})，${tiEl}克${yongEl}，能掌控局面，吉利。`;
  } else if (WX_SHENG[tiEl] === yongEl) {
    // 体生用
    relationType = 'ti_sheng';
    relation = '体生用';
    favorable = false;
    summary = `体卦${result.tiGua.name}(${tiEl})生用卦${result.yongGua.name}(${yongEl})，${tiEl}生${yongEl}，耗泄自身精力，不利之象。`;
  } else if (WX_KE[yongEl] === tiEl) {
    // 用克体
    relationType = 'ke_ti';
    relation = '用克体';
    favorable = false;
    summary = `用卦${result.yongGua.name}(${yongEl})克体卦${result.tiGua.name}(${tiEl})，${yongEl}克${tiEl}，受制于外力，凶险之象。`;
  } else {
    // 兜底（理论上不会到这里）
    relationType = 'bihe';
    relation = '体用无直接生克';
    favorable = true;
    summary = `体卦${result.tiGua.name}(${tiEl})与用卦${result.yongGua.name}(${yongEl})关系较弱，影响有限。`;
  }

  return { tiElement: tiEl, yongElement: yongEl, relation, relationType, favorable, summary };
}

// ============================================================
//  动爻解读
// ============================================================

export function interpretMovingLine(result: DivinationResult): string {
  const { movingLine, original, changed } = result;
  const pos = movingLine.position;
  const posName = movingLine.positionName;
  const meaning = YAO_POSITION_MEANING[pos] || '';
  const yaoType = movingLine.originalYao ? '阳爻动变阴' : '阴爻动变阳';
  const direction = movingLine.originalYao ? '由刚转柔，动中趋静' : '由柔转刚，静中生动';

  const inWhich = pos <= 3 ? '下卦（内卦）' : '上卦（外卦）';
  const guaName = pos <= 3 ? original.lowerTrigram.name : original.upperTrigram.name;

  let text = `动爻在${posName}（${inWhich}·${guaName}卦），${meaning}。` +
    `此爻${yaoType}，${direction}。` +
    `爻辞曰："${movingLine.yaoCi}"`;

  /* ---- 增强：体用关系与变卦关联补充 ---- */
  // 体用动静说明
  const tiPos = result.movingLine.position <= 3 ? '上卦' : '下卦';
  text += `\n\n【体用动静】动爻在${inWhich}，故${inWhich.slice(0, 2)}为用卦（动卦），${tiPos}为体卦（静卦）。` +
    `邵康节曰"体为己，用为人"——体卦代表求测者自身，用卦代表所问之事或对方。`;

  // 变卦关联
  text += `\n\n【变卦之意】${posName}动后，本卦${original.name}变为${changed.name}。` +
    `《易》云"变则通，通则久"——动爻所变之处，即为事态转化的关键。` +
    `变卦${changed.name}（${changed.alias}）揭示事物的最终走向与归宿。`;

  return text;
}

// ============================================================
//  五行生克详解
// ============================================================

function describeElementInteractions(result: DivinationResult, tiYong: TiYongRelation): string {
  const tiEl = tiYong.tiElement;
  const yongEl = tiYong.yongElement;
  const mutualUpper = result.mutual.upperTrigram.element;
  const mutualLower = result.mutual.lowerTrigram.element;

  let desc = `本卦上卦${result.original.upperTrigram.name}(${result.original.upperTrigram.element})，` +
    `下卦${result.original.lowerTrigram.name}(${result.original.lowerTrigram.element})。`;

  desc += `体卦属${tiEl}，用卦属${yongEl}，${tiYong.relation}。`;

  // 互卦五行
  desc += `互卦上${result.mutual.upperTrigram.name}(${mutualUpper})下${result.mutual.lowerTrigram.name}(${mutualLower})，`;
  if (WX_SHENG[mutualUpper] === tiEl || WX_SHENG[mutualLower] === tiEl) {
    desc += '互卦有助力体卦之象。';
  } else if (WX_KE[mutualUpper] === tiEl || WX_KE[mutualLower] === tiEl) {
    desc += '互卦有制约体卦之象，需留意暗中阻碍。';
  } else {
    desc += '互卦对体卦影响中性。';
  }

  // 变卦趋势
  desc += `变卦为${result.changed.name}，体卦在变化后`;
  const changedTiEl = result.movingLine.position <= 3
    ? result.changed.upperTrigram.element
    : result.changed.lowerTrigram.element;
  if (changedTiEl === tiEl) {
    desc += '五行不变，趋势稳定。';
  } else {
    desc += `五行转为${changedTiEl}，局势将有变化。`;
  }

  return desc;
}

// ============================================================
//  问事结论
// ============================================================

const VERDICT_MATRIX: Record<TiYongType, Record<string, VerdictLevel>> = {
  sheng_ti: { career: '吉', wealth: '吉', love: '吉', health: '吉', study: '吉', job: '吉', travel: '吉', lawsuit: '吉', search: '吉', house: '吉', deal: '吉' },
  ti_ke:    { career: '吉', wealth: '吉', love: '平', health: '平', study: '吉', job: '吉', travel: '平', lawsuit: '吉', search: '平', house: '平', deal: '吉' },
  bihe:     { career: '平', wealth: '平', love: '吉', health: '平', study: '平', job: '平', travel: '吉', lawsuit: '平', search: '吉', house: '吉', deal: '平' },
  ti_sheng: { career: '忌', wealth: '忌', love: '平', health: '忌', study: '忌', job: '忌', travel: '平', lawsuit: '忌', search: '忌', house: '平', deal: '忌' },
  ke_ti:    { career: '忌', wealth: '忌', love: '忌', health: '忌', study: '忌', job: '忌', travel: '忌', lawsuit: '忌', search: '忌', house: '忌', deal: '忌' },
};

const CATEGORY_INFO: { key: string; name: string; icon: string; group: 'core' | 'extended' }[] = [
  /* ---- 原有4个核心维度 ---- */
  { key: 'career', name: '事业', icon: '💼', group: 'core' },
  { key: 'wealth', name: '财运', icon: '💰', group: 'core' },
  { key: 'love',   name: '感情', icon: '❤️',  group: 'core' },
  { key: 'health', name: '健康', icon: '🏥', group: 'core' },
  /* ---- 增强：新增7个问事维度 ---- */
  { key: 'study',   name: '学业考试', icon: '📚', group: 'extended' },
  { key: 'job',     name: '求职升迁', icon: '📈', group: 'extended' },
  { key: 'travel',  name: '出行远行', icon: '🧭', group: 'extended' },
  { key: 'lawsuit', name: '官司是非', icon: '⚖️',  group: 'extended' },
  { key: 'search',  name: '寻人寻物', icon: '🔍', group: 'extended' },
  { key: 'house',   name: '家宅风水', icon: '🏠', group: 'extended' },
  { key: 'deal',    name: '交易合作', icon: '🤝', group: 'extended' },
];

function generateConclusion(
  category: string, level: VerdictLevel, tiYong: TiYongRelation, result: DivinationResult,
): { conclusion: string; advice: string } {
  const tiName = result.tiGua.name;
  const yongName = result.yongGua.name;
  const tiXiang = GUA_XIANG[tiName] || '';
  const yongXiang = GUA_XIANG[yongName] || '';

  const conclusionMap: Record<string, Record<VerdictLevel, string>> = {
    career: {
      '吉': `${tiYong.relation}，事业运势向好。${yongXiang ? `用卦${yongName}含「${yongXiang.split('、').slice(0, 2).join('、')}」之象，` : ''}利于积极行动、开拓进取。`,
      '平': `体用比和，事业运势平稳。宜稳步推进现有计划，不宜冒进。`,
      '忌': `${tiYong.relation}，事业方面需谨慎。${tiXiang ? `体卦${tiName}含「${tiXiang.split('、').slice(0, 2).join('、')}」之象，` : ''}宜守成、勿轻举妄动。`,
    },
    wealth: {
      '吉': `${tiYong.relation}，财运亨通。有外来财源之兆，可适当投资或拓展。`,
      '平': `财运平稳，收支平衡。不宜大额投资，守住现有财富为上。`,
      '忌': `${tiYong.relation}，财运不佳。有破财耗财之象，宜节省开支、避免投机。`,
    },
    love: {
      '吉': `${tiYong.relation}，感情和睦。有佳偶良缘之兆，关系融洽、互相扶持。`,
      '平': `感情平稳，无大波澜。宜用心经营、加强沟通。`,
      '忌': `${tiYong.relation}，感情方面有阻碍。可能出现分歧或外部干扰，宜冷静处理。`,
    },
    health: {
      '吉': `${tiYong.relation}，身体状况良好。体卦得生扶，精力充沛、状态佳。`,
      '平': `健康无大碍，注意日常保养。${WX_XIANG[tiYong.tiElement] ? `体卦属${tiYong.tiElement}，注意${WX_XIANG[tiYong.tiElement].organ}保养。` : ''}`,
      '忌': `${tiYong.relation}，健康需关注。${WX_XIANG[tiYong.tiElement] ? `体卦属${tiYong.tiElement}，${WX_XIANG[tiYong.tiElement].organ}方面需留意。` : ''}宜注重休息与调养。`,
    },
    /* ---- 增强：新增7个问事维度结论 ---- */
    study: {
      '吉': `${tiYong.relation}，学业运势佳。体卦得助，头脑清明、思路敏捷，利于考试、应试发挥出色。`,
      '平': `学业平稳，需持续努力。无特别有利或不利之象，宜按部就班、稳扎稳打。`,
      '忌': `${tiYong.relation}，学业方面有阻碍。体卦受损，精力不济或心绪不宁，考试宜加倍准备。`,
    },
    job: {
      '吉': `${tiYong.relation}，求职升迁运势向好。${yongXiang ? `用卦${yongName}含「${yongXiang.split('、').slice(0, 2).join('、')}」之象，` : ''}有贵人提携、逢机遇之兆。`,
      '平': `求职升迁运平稳。当前非最佳时机，宜积累实力、等待合适机会。`,
      '忌': `${tiYong.relation}，求职升迁需谨慎。竞争压力较大，宜暂缓行动、充实自身。`,
    },
    travel: {
      '吉': `${tiYong.relation}，出行顺利。体卦得生扶，旅途平安、有收获之象。`,
      '平': `出行无大碍，平安往返。宜做好充分准备，注意细节安排。`,
      '忌': `${tiYong.relation}，出行需慎重。体卦受克，途中恐有波折，宜改期或缩短行程。`,
    },
    lawsuit: {
      '吉': `${tiYong.relation}，官司是非可得化解。体卦占优，有利于己方，正义终得伸张。`,
      '平': `官司是非势均力敌。双方难分胜负，宜以和解为上策，避免久讼伤财。`,
      '忌': `${tiYong.relation}，官司是非不利。体卦处于劣势，宜避免对簿公堂，以退为进、息事宁人。`,
    },
    search: {
      '吉': `${tiYong.relation}，寻人寻物有望。体卦得助，${result.tiGua.direction ? `宜往${result.tiGua.direction}方寻找，` : ''}终可寻获。`,
      '平': `寻人寻物需费周折。物或可得但需时日，宜耐心细寻、多方打听。`,
      '忌': `${tiYong.relation}，寻人寻物困难。体卦受损，恐难如愿，宜扩大范围或借助他人之力。`,
    },
    house: {
      '吉': `${tiYong.relation}，家宅安宁、风水吉利。体卦受生扶，居所气场和谐、家人平安。`,
      '平': `家宅总体平稳，无大碍。${WX_XIANG[tiYong.tiElement] ? `注意${WX_XIANG[tiYong.tiElement].color}色系装饰可调和气场。` : ''}宜保持整洁有序。`,
      '忌': `${tiYong.relation}，家宅方面需留意。体卦受克，居所气场不顺，宜调整布局或化解煞气。`,
    },
    deal: {
      '吉': `${tiYong.relation}，交易合作顺利。体卦占优，合作诚意足、有利可图，可积极推进。`,
      '平': `交易合作条件一般。双方利益基本均衡，宜仔细审核条款、谨慎决定。`,
      '忌': `${tiYong.relation}，交易合作不利。体卦耗泄或受制，恐有损失或受骗之象，宜暂缓或放弃。`,
    },
  };

  const adviceMap: Record<string, Record<VerdictLevel, string>> = {
    career: {
      '吉': '把握机遇，主动出击，贵人运佳。',
      '平': '稳中求进，按部就班，忌急躁冒进。',
      '忌': '韬光养晦，等待时机，避免重大决策。',
    },
    wealth: {
      '吉': '可适度扩大投资，财源广进。',
      '平': '量入为出，稳健理财。',
      '忌': '谨慎理财，避免借贷与投机。',
    },
    love: {
      '吉': '坦诚相待，感情升温。',
      '平': '多沟通交流，维护现有关系。',
      '忌': '冷静理性，避免冲动决定。',
    },
    health: {
      '吉': '适度运动，保持良好状态。',
      '平': '规律作息，均衡饮食。',
      '忌': '及时就医检查，避免过度劳累。',
    },
    /* ---- 增强：新增7个问事维度建议 ---- */
    study: {
      '吉': '把握学习状态，考前适度放松，可有超常发挥。',
      '平': '制定学习计划，查漏补缺，勤能补拙。',
      '忌': '调整心态为先，避免临阵换题、改变策略。',
    },
    job: {
      '吉': '主动投递简历或争取表现机会，贵人在前方。',
      '平': '完善简历、提升技能，静候佳音。',
      '忌': '暂缓跳槽或竞聘，先充实自身实力。',
    },
    travel: {
      '吉': '宜出行，旅途愉快、有意外收获。',
      '平': '出行可，做好预案，注意天气与行程安排。',
      '忌': '宜改期或短途代替，注意安全与健康。',
    },
    lawsuit: {
      '吉': '据理力争，正义在我，可放心应诉。',
      '平': '权衡利弊，以调解和解为首选。',
      '忌': '能和则和，退一步海阔天空，避免扩大纷争。',
    },
    search: {
      '吉': `往${result.tiGua.direction || '体卦所指'}方向寻找，多留意相关线索。`,
      '平': '耐心等候，发动身边人帮助打听。',
      '忌': '扩大寻找范围，必要时借助外力或报案。',
    },
    house: {
      '吉': '居所气场和谐，安心居住，利于家人健康。',
      '平': '适当调整家居布置，保持通风采光。',
      '忌': '请专业人士勘察风水，化解不利因素。',
    },
    deal: {
      '吉': '积极推进合作，条款对己有利，把握时机。',
      '平': '仔细审核合同细节，不可大意。',
      '忌': '暂缓签约，谨防合同陷阱与隐性风险。',
    },
  };

  return {
    conclusion: conclusionMap[category]?.[level] || `${tiYong.relation}，${level}。`,
    advice: adviceMap[category]?.[level] || '顺其自然，随遇而安。',
  };
}

export function generateVerdicts(result: DivinationResult, tiYong: TiYongRelation): VerdictItem[] {
  return CATEGORY_INFO.map(({ key, name, icon, group }) => {
    const level = VERDICT_MATRIX[tiYong.relationType]?.[key] || '平';
    const { conclusion, advice } = generateConclusion(key, level, tiYong, result);
    return { category: name, icon, level, conclusion, advice, group };
  });
}

// ============================================================
//  关键提示
// ============================================================

export function generateKeyTips(result: DivinationResult, tiYong: TiYongRelation): string[] {
  const tips: string[] = [];

  // 1. 体用强弱提示
  if (tiYong.favorable) {
    if (tiYong.relationType === 'sheng_ti') {
      tips.push('用生体，大吉之象。外部条件有利，宜积极行动、把握机遇。');
    } else if (tiYong.relationType === 'ti_ke') {
      tips.push('体克用，主能掌控局面。但需注意力度适当，刚柔并济。');
    } else {
      tips.push('体用比和，势均力敌。宜以和为贵，合作共赢。');
    }
  } else {
    if (tiYong.relationType === 'ke_ti') {
      tips.push('用克体，凶险之兆。体卦受克，宜守不宜攻，避免正面冲突。');
    } else {
      tips.push('体生用，耗泄之象。自身精力外泄，宜收敛守成、蓄养实力。');
    }
  }

  // 2. 动爻位置提示
  const pos = result.movingLine.position;
  const posHints: Record<number, string> = {
    1: '动在初爻，事方起始，尚在萌芽阶段，宜观望筹备。',
    2: '动在二爻，内部变化为主，注意人际关系与内部协调。',
    3: '动在三爻，正值转折关口，进退需慎重抉择。',
    4: '动在四爻，外部环境变化，注意把握外部机会或防范外来风险。',
    5: '动在五爻，核心力量所在，此事关键在于主导方的态度与决策。',
    6: '动在上爻，事近终局，大势已定，宜顺势而为。',
  };
  if (posHints[pos]) tips.push(posHints[pos]);

  // 3. 变卦趋势
  tips.push(`变卦为${result.changed.name}（${result.changed.alias}），事态发展方向：${GUA_XIANG[result.changed.upperTrigram.name]?.split('、').slice(0, 2).join('、') || result.changed.upperTrigram.nature}之象。`);

  // 4. 互卦暗象
  tips.push(`互卦为${result.mutual.name}（${result.mutual.alias}），暗含${GUA_XIANG[result.mutual.upperTrigram.name]?.split('、').slice(0, 2).join('、') || result.mutual.upperTrigram.nature}之意，为事态发展的内在脉络。`);

  return tips;
}

// ============================================================
//  汇总分析
// ============================================================

export function performAnalysis(result: DivinationResult): MeihuaAnalysis {
  const tiYong = analyzeTiYong(result);
  const movingLineInterpretation = interpretMovingLine(result);
  const verdicts = generateVerdicts(result, tiYong);
  const keyTips = generateKeyTips(result, tiYong);
  const elementInteractions = describeElementInteractions(result, tiYong);

  return { tiYong, movingLineInterpretation, verdicts, keyTips, elementInteractions };
}
