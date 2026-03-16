/**
 * 六爻排盘系统 —— 分析规则
 *
 * 定义各场景的断卦规则模板和文案
 */

import type { SixRelative, WuXing, ScenarioType, YaoLine } from './types';
import { WX_SHENG, WX_KE } from './constants';

// ==================== 五行生克辅助 ====================

/** 判断 A 是否生 B */
export function wxSheng(a: WuXing, b: WuXing): boolean {
  return WX_SHENG[a] === b;
}

/** 判断 A 是否克 B */
export function wxKe(a: WuXing, b: WuXing): boolean {
  return WX_KE[a] === b;
}

/** 根据用神六亲推导原神/忌神/仇神六亲 */
export function deriveHelperShen(yongShenLiuQin: SixRelative): {
  yuanShen: SixRelative;
  jiShen: SixRelative;
  chouShen: SixRelative;
} {
  // 六亲对应五行关系:
  // 生用神者 = 原神, 克用神者 = 忌神, 生忌神者 = 仇神
  const map: Record<SixRelative, { yuanShen: SixRelative; jiShen: SixRelative; chouShen: SixRelative }> = {
    '父母': { yuanShen: '官鬼', jiShen: '妻财', chouShen: '子孙' },
    '兄弟': { yuanShen: '父母', jiShen: '官鬼', chouShen: '妻财' },
    '子孙': { yuanShen: '兄弟', jiShen: '父母', chouShen: '官鬼' },
    '妻财': { yuanShen: '子孙', jiShen: '兄弟', chouShen: '父母' },
    '官鬼': { yuanShen: '妻财', jiShen: '子孙', chouShen: '兄弟' },
  };
  return map[yongShenLiuQin];
}

// ==================== 爻位强弱评估 ====================

/** 评估爻的综合强弱 (-3 ~ +3) */
export function evaluateYaoStrength(yao: YaoLine): number {
  let score = 0;

  // 月建
  switch (yao.strength.monthRelation) {
    case '旺': score += 2; break;
    case '相': score += 1; break;
    case '休': score += 0; break;
    case '囚': score -= 1; break;
    case '死': score -= 2; break;
  }

  // 日辰
  const dayEff = yao.strength.dayEffect;
  if (dayEff.includes('日生') || dayEff.includes('日扶')) score += 1;
  if (dayEff.includes('日克')) score -= 1;
  if (dayEff.includes('日冲')) score -= 0.5;
  if (dayEff.includes('日合')) score += 0.5;
  if (dayEff.includes('日泄')) score -= 0.5;

  // 旬空
  if (yao.isXunKong) score -= 1;

  // 月破
  if (yao.isYuePo) score -= 1.5;

  // 动爻加分 (动则有力)
  if (yao.isMoving) score += 0.5;

  return Math.max(-3, Math.min(3, score));
}

/** 将强弱分数转为文字描述 */
export function strengthToText(score: number): string {
  if (score >= 2) return '旺相有力';
  if (score >= 1) return '有一定力量';
  if (score >= 0) return '力量一般';
  if (score >= -1) return '稍显不足';
  return '衰弱无力';
}

// ==================== 场景断语模板 ====================

export interface ScenarioRule {
  name: string;
  yongShen: SixRelative;
  /** 吉利条件描述 */
  jiConditions: string[];
  /** 凶险条件描述 */
  xiongConditions: string[];
  /** 白话吉语 */
  beginnerJi: string;
  /** 白话凶语 */
  beginnerXiong: string;
  /** 白话平语 */
  beginnerPing: string;
  /** 专业吉语 */
  proJi: string;
  /** 专业凶语 */
  proXiong: string;
  /** 专业平语 */
  proPing: string;
}

export const SCENARIO_RULES: Record<ScenarioType, ScenarioRule> = {
  qiucai: {
    name: '求财',
    yongShen: '妻财',
    jiConditions: ['妻财旺相', '妻财得日月生扶', '子孙(原神)发动生财'],
    xiongConditions: ['妻财衰弱空破', '兄弟(忌神)发动克财', '妻财伏藏不现'],
    beginnerJi: '财运不错，有望获得收入。注意把握时机，积极行动。',
    beginnerXiong: '求财不太顺利，可能会有阻碍或损失。建议暂缓投资，保守理财。',
    beginnerPing: '财运平平，不会大赚也不会大亏。量力而行为佳。',
    proJi: '妻财旺相有气，得日月生扶，原神子孙亦有力，财可得。',
    proXiong: '妻财休囚无力，忌神兄弟发动克制，求财恐难如愿。',
    proPing: '妻财力量一般，需看动爻变化及应期。',
  },
  wenbing: {
    name: '问病',
    yongShen: '官鬼',
    jiConditions: ['官鬼衰弱(病退)', '子孙旺相(药到病除)', '官鬼入墓'],
    xiongConditions: ['官鬼旺动(病势凶猛)', '子孙空破(无药可救)', '用神(世爻)衰极'],
    beginnerJi: '病情有好转迹象，按医嘱治疗即可。',
    beginnerXiong: '病情较为严重，需要格外注意。建议寻求专业医疗。',
    beginnerPing: '病情反复，需耐心调养。',
    proJi: '官鬼休囚无力，子孙旺相克鬼，病可愈。',
    proXiong: '官鬼旺动持世，子孙空破不力，病情堪忧。',
    proPing: '病势平稳，需观后续变化。',
  },
  kaoshi: {
    name: '考试',
    yongShen: '父母',
    jiConditions: ['父母旺相', '父母持世', '官鬼(原神)生父母'],
    xiongConditions: ['父母衰空', '子孙(忌神)发动克父母', '父母伏藏'],
    beginnerJi: '考运不错，努力复习有望取得好成绩。',
    beginnerXiong: '考运欠佳，需加倍努力。注意审题仔细。',
    beginnerPing: '成绩中规中矩，发挥正常。',
    proJi: '父母旺相有气，得官鬼生扶，科考可期。',
    proXiong: '父母休囚，子孙发动克之，恐难如愿。',
    proPing: '父母力量尚可，成绩取决于临场发挥。',
  },
  hunlian: {
    name: '婚恋',
    yongShen: '妻财',
    jiConditions: ['用神旺相', '世应相生相合', '世应不空不破'],
    xiongConditions: ['用神衰空', '世应相冲相克', '世或应空破'],
    beginnerJi: '感情发展顺利，有缘分，可以积极争取。',
    beginnerXiong: '感情方面可能遇到阻碍，不宜操之过急。',
    beginnerPing: '感情平稳发展，需要双方共同努力。',
    proJi: '用神旺相，世应相生有情，婚恋可成。',
    proXiong: '用神衰弱，世应相克无情，恐难遂愿。',
    proPing: '世应关系一般，需看动爻变化。',
  },
  shiye: {
    name: '事业',
    yongShen: '官鬼',
    jiConditions: ['官鬼旺相', '官鬼持世', '妻财(原神)生官鬼'],
    xiongConditions: ['官鬼衰空', '子孙发动克官', '官鬼伏藏'],
    beginnerJi: '事业运势不错，有升迁或获得认可的机会。',
    beginnerXiong: '事业方面需谨慎，可能遇到困难或变动。',
    beginnerPing: '事业平稳，维持现状为主。',
    proJi: '官鬼旺相持世，得财爻生扶，事业亨通。',
    proXiong: '官鬼休囚，子孙发动制之，仕途不顺。',
    proPing: '官鬼力量中等，需审时度势。',
  },
  shiwu: {
    name: '失物',
    yongShen: '妻财',
    jiConditions: ['妻财旺相不空', '妻财持世或在内卦', '世爻生用神'],
    xiongConditions: ['妻财空破入墓', '妻财在外卦且衰弱', '官鬼发动(被盗)'],
    beginnerJi: '失物有找回的可能，注意在原来的地方仔细寻找。',
    beginnerXiong: '失物可能难以找回，建议做好心理准备。',
    beginnerPing: '能否找回不确定，可以再找找看。',
    proJi: '妻财旺相不空，物尚在可寻。',
    proXiong: '妻财空破，恐已失散难回。',
    proPing: '妻财力量一般，需看应期。',
  },
  guansi: {
    name: '官司',
    yongShen: '官鬼',
    jiConditions: ['世爻旺相', '世爻克应', '官鬼生世'],
    xiongConditions: ['世爻衰弱', '应爻克世', '官鬼克世'],
    beginnerJi: '官司形势对你有利，可以据理力争。',
    beginnerXiong: '官司可能不利，建议考虑和解或妥协。',
    beginnerPing: '官司胜负不明，需要做好充分准备。',
    proJi: '世旺克应，我方占优。',
    proXiong: '世衰应旺，恐为对方所制。',
    proPing: '世应力量相当，需看动爻向背。',
  },
  chuxing: {
    name: '出行',
    yongShen: '子孙',
    jiConditions: ['世爻旺相', '子孙发动', '无官鬼发动'],
    xiongConditions: ['世爻衰空', '官鬼发动', '应爻克世'],
    beginnerJi: '出行顺利，旅途平安。',
    beginnerXiong: '出行可能不太顺利，注意安全，建议改期。',
    beginnerPing: '出行基本顺利，注意细节即可。',
    proJi: '世旺子孙有力，出行无碍。',
    proXiong: '官鬼发动克世，出行恐有险阻。',
    proPing: '卦象平稳，可行但宜谨慎。',
  },
  zhaizang: {
    name: '宅葬',
    yongShen: '父母',
    jiConditions: ['父母旺相', '世爻旺相', '青龙临世或财'],
    xiongConditions: ['父母衰空', '白虎临世', '官鬼持世'],
    beginnerJi: '住宅风水不错，适宜居住或操办。',
    beginnerXiong: '住宅方面可能有些问题，建议请专业人士查看。',
    beginnerPing: '住宅情况一般，可以正常居住。',
    proJi: '父母旺相，宅运安泰。',
    proXiong: '父母衰空，宅运不佳。',
    proPing: '宅象平平，需看具体爻位。',
  },
  qiuqian: {
    name: '杂占',
    yongShen: '兄弟',
    jiConditions: ['世爻旺相', '用神有力', '无忌神发动'],
    xiongConditions: ['世爻衰空', '忌神发动', '用神伏藏'],
    beginnerJi: '所问之事趋势良好，可以放心行动。',
    beginnerXiong: '所问之事可能遇到阻碍，建议暂缓。',
    beginnerPing: '所问之事吉凶参半，需谨慎行事。',
    proJi: '世旺用神有力，事可成。',
    proXiong: '世衰用神无力，事难成。',
    proPing: '卦象平平，需综合分析。',
  },
};
