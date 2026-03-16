/**
 * 玉匣择吉 — 吉祥方位、穿衣颜色推荐算法库
 *
 * 穿衣颜色推荐有两种模式：
 *
 * 模式一（通用模式，无八字输入）：
 *   颜色 = "我"，流日天干五行 = "环境"
 *   以颜色为主体，看哪种颜色能在当天的天时环境中获益
 *
 * 模式二（个人模式，有八字输入）：
 *   根据日主喜忌五行，结合大运→流年→流月→流日依次作用，
 *   分析当天对命主最有利的五行颜色
 */

import {
  WU_XING_MAP, WX_GENERATES, WX_CONTROLS,
  type BaziResult, type DaYunItem,
  buildDaYunResult, getBaziResult,
} from './lunar';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Solar } = require('lunar-javascript');

// ─── 常量 ────────────────────────────────────────────

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** 五行 → 方位 */
export const WX_DIRECTION: Record<string, string> = {
  '木': '东', '火': '南', '土': '中', '金': '西', '水': '北',
};

/** 五行 → 具体颜色列表 */
export const WX_DETAIL_COLORS: Record<string, string[]> = {
  '木': ['绿色', '青色', '翠色'],
  '火': ['红色', '紫色', '粉色'],
  '土': ['黄色', '棕色', '咖色'],
  '金': ['白色', '银色', '金色'],
  '水': ['黑色', '蓝色', '灰色'],
};

/** 五行 → 颜色CSS色值（用于UI色块展示） */
export const WX_COLOR_HEX: Record<string, string[]> = {
  '木': ['#2E8B57', '#20B2AA', '#3CB371'],
  '火': ['#DC143C', '#8B008B', '#FF69B4'],
  '土': ['#DAA520', '#8B4513', '#A0522D'],
  '金': ['#F5F5F5', '#C0C0C0', '#FFD700'],
  '水': ['#2F4F4F', '#4169E1', '#808080'],
};

/** 财神方位（基于日天干，依传统每日财神方位表） */
export const CAI_SHEN_DIRECTION: Record<string, string> = {
  '甲': '东北', '乙': '东', '丙': '东南', '丁': '南', '戊': '南',
  '己': '北', '庚': '西南', '辛': '西', '壬': '西北', '癸': '北',
};

/** 方位场景描述 */
const DIRECTION_SCENES: Record<string, string> = {
  '东': '出行、办事宜向东方',
  '南': '出行、办事宜向南方',
  '中': '宜守中位，不宜远行',
  '西': '出行、办事宜向西方',
  '北': '出行、办事宜向北方',
};

const WEEK_NAMES = ['日', '一', '二', '三', '四', '五', '六'];
const ALL_WX = ['木', '火', '土', '金', '水'];

// ─── 接口 ────────────────────────────────────────────

export interface DressColorItem {
  category: string;
  relation: string;
  wuxing: string;
  colors: string[];
  hexColors: string[];
  description: string;
}

export interface DailyDressResult {
  dayGan: string;
  dayWuxing: string;
  mode: 'general' | 'personal';
  modeLabel: string;
  categories: DressColorItem[];
}

export interface LuckyDirectionItem {
  name: string;
  wuxing: string;
  level: string;
  scene: string;
}

export interface LuckyDirectionResult {
  directions: LuckyDirectionItem[];
  caiShen: string;
}

export interface WeekDressItem {
  date: string;
  dayGan: string;
  dayWuxing: string;
  bestColors: string[];
  bestHex: string[];
  avoidColors: string[];
  avoidHex: string[];
}

/** 个人八字穿衣推荐的输入参数 */
export interface PersonalBaziInput {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  gender: number; // 1=男 0=女
}

// ─── 辅助函数 ────────────────────────────────────────

/** 反向查找：谁生了 target（WX_GENERATES[?] === target） */
function findWhoGenerates(target: string): string {
  for (const [k, v] of Object.entries(WX_GENERATES)) {
    if (v === target) return k;
  }
  return '';
}

/** 反向查找：谁克了 target（WX_CONTROLS[?] === target） */
function findWhoControls(target: string): string {
  for (const [k, v] of Object.entries(WX_CONTROLS)) {
    if (v === target) return k;
  }
  return '';
}

/** 获取干支的年干支 */
function getYearGanZhi(year: number): string {
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;
  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
}

// ─── 核心函数 ────────────────────────────────────────

/**
 * 获取指定日期的日干支（轻量封装）
 */
export function getDayGanZhiByDate(year: number, month: number, day: number): { gan: string; zhi: string; ganZhi: string } {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const gz: string = lunar.getDayInGanZhi();
  return { gan: gz[0], zhi: gz[1], ganZhi: gz };
}

/**
 * 获取指定日期的月干支
 */
function getMonthGanZhi(year: number, month: number, day: number): string {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();
  return ec.getMonthGan() + ec.getMonthZhi();
}

// ─── 模式一：通用穿衣推荐（颜色="我"，流日="环境"）───────

/**
 * 通用穿衣颜色推荐
 *
 * 核心视角：颜色 = "我"（穿衣的主体），流日天干五行 = "环境"
 * 哪种颜色在当天的环境中能得到助力，就是好颜色
 */
export function getDailyDress(dayGan: string): DailyDressResult {
  const envWx = WU_XING_MAP[dayGan] || '木'; // 流日五行 = 环境

  // 以颜色（五行）为"我"，看与环境的关系
  // 环境生我 → 颜色得天时滋养 → 大吉
  const envShengWo = WX_GENERATES[envWx] || '';
  // 与环境同 → 颜色与天时和谐 → 吉
  const tongEnv = envWx;
  // 我克环境 → 颜色能驾驭天时 → 小吉
  const woKeEnv = findWhoControls(envWx);
  // 我生环境 → 颜色被天时泄气 → 消耗
  const woShengEnv = findWhoGenerates(envWx);
  // 环境克我 → 颜色被天时压制 → 凶
  const envKeWo = WX_CONTROLS[envWx] || '';

  const categories: DressColorItem[] = [
    {
      category: '得时色',
      relation: '环境生我',
      wuxing: envShengWo,
      colors: WX_DETAIL_COLORS[envShengWo] || [],
      hexColors: WX_COLOR_HEX[envShengWo] || [],
      description: `今日${envWx}气当令，${envWx}生${envShengWo}，穿${envShengWo}色得天时滋养，大吉`,
    },
    {
      category: '和谐色',
      relation: '与环境同',
      wuxing: tongEnv,
      colors: WX_DETAIL_COLORS[tongEnv] || [],
      hexColors: WX_COLOR_HEX[tongEnv] || [],
      description: `与今日${envWx}气相同，顺应天时，吉`,
    },
    {
      category: '进取色',
      relation: '我克环境',
      wuxing: woKeEnv,
      colors: WX_DETAIL_COLORS[woKeEnv] || [],
      hexColors: WX_COLOR_HEX[woKeEnv] || [],
      description: `${woKeEnv}克${envWx}，颜色能驾驭天时，利主动进取，小吉`,
    },
    {
      category: '消耗色',
      relation: '我生环境',
      wuxing: woShengEnv,
      colors: WX_DETAIL_COLORS[woShengEnv] || [],
      hexColors: WX_COLOR_HEX[woShengEnv] || [],
      description: `${woShengEnv}生${envWx}，颜色泄气于天时，耗费精力，平`,
    },
    {
      category: '不利色',
      relation: '环境克我',
      wuxing: envKeWo,
      colors: WX_DETAIL_COLORS[envKeWo] || [],
      hexColors: WX_COLOR_HEX[envKeWo] || [],
      description: `${envWx}克${envKeWo}，颜色被天时压制，不利`,
    },
  ];

  return { dayGan, dayWuxing: envWx, mode: 'general', modeLabel: '通用推荐', categories };
}

// ─── 模式二：个人八字穿衣推荐 ───────────────────────

/**
 * 根据日主喜忌五行，计算当天最有利的穿衣颜色
 *
 * 核心逻辑：
 * 1. 排命主八字 → 判断日主强弱 → 确定喜用神/忌神五行
 * 2. 获取当前大运天干地支五行
 * 3. 获取流年、流月、流日天干五行
 * 4. 综合分析当天五行能量场，结合喜忌给出推荐
 */
export function getPersonalDailyDress(
  bazi: PersonalBaziInput,
  targetYear: number,
  targetMonth: number,
  targetDay: number,
): DailyDressResult {
  // 1. 排命主八字
  const baziResult = getBaziResult(bazi.birthYear, bazi.birthMonth, bazi.birthDay, bazi.birthHour);
  const dayGan = baziResult.pillars[2].gan;
  const dayWx = WU_XING_MAP[dayGan];
  const strength = baziResult.wuxingAnalysis.dayMasterStrength;

  // 2. 确定喜用神/忌神五行
  const genMe = ALL_WX.find(e => WX_GENERATES[e] === dayWx) || '';
  const iGenerate = WX_GENERATES[dayWx] || '';
  const iControl = WX_CONTROLS[dayWx] || '';
  const controlsMe = ALL_WX.find(e => WX_CONTROLS[e] === dayWx) || '';

  let yongShen: string[] = [];
  let jiShen: string[] = [];
  if (strength === '偏弱') {
    yongShen = [dayWx, genMe].filter(Boolean);
    jiShen = [iGenerate, iControl, controlsMe].filter(Boolean);
  } else if (strength === '偏强') {
    yongShen = [iGenerate, iControl, controlsMe].filter(Boolean);
    jiShen = [dayWx, genMe].filter(Boolean);
  } else {
    // 中和：轻微喜泄耗
    yongShen = [iGenerate, dayWx].filter(Boolean);
    jiShen = [];
  }

  // 3. 计算大运
  const dyResult = buildDaYunResult(
    bazi.birthYear, bazi.birthMonth, bazi.birthDay, bazi.birthHour,
    bazi.gender, baziResult,
  );
  const currentAge = targetYear - bazi.birthYear;
  let currentDaYun: DaYunItem | null = null;
  for (const dy of dyResult.daYunList) {
    if (currentAge >= dy.startAge && currentAge <= dy.endAge) {
      currentDaYun = dy;
      break;
    }
  }

  // 4. 获取流年、流月、流日
  const liuNianGZ = getYearGanZhi(targetYear);
  const liuNianWx = WU_XING_MAP[liuNianGZ[0]];
  const liuYueGZ = getMonthGanZhi(targetYear, targetMonth, targetDay);
  const liuYueWx = WU_XING_MAP[liuYueGZ[0]];
  const { gan: liuRiGan } = getDayGanZhiByDate(targetYear, targetMonth, targetDay);
  const liuRiWx = WU_XING_MAP[liuRiGan];

  // 5. 综合评分：对每种五行颜色打分
  const wxScores: Record<string, number> = {};
  for (const wx of ALL_WX) {
    let score = 0;

    // 基础分：喜用神 +4，忌神 -4
    if (yongShen.includes(wx)) score += 4;
    else if (jiShen.includes(wx)) score -= 4;

    // 大运天干五行的影响（大运管10年，影响最广）
    if (currentDaYun) {
      const dyGanWx = currentDaYun.ganWuxing;
      // 大运五行生此颜色五行 → 该颜色得大运助力 +1.5
      if (WX_GENERATES[dyGanWx] === wx) score += 1.5;
      // 大运五行克此颜色五行 → 该颜色受大运压制 -1
      if (WX_CONTROLS[dyGanWx] === wx) score -= 1;
      // 大运五行与喜用同 → 整体环境利此方向 +0.5
      if (yongShen.includes(dyGanWx) && yongShen.includes(wx)) score += 0.5;
    }

    // 流年天干五行的影响
    if (WX_GENERATES[liuNianWx] === wx) score += 1;
    if (WX_CONTROLS[liuNianWx] === wx) score -= 0.5;

    // 流月天干五行的影响
    if (WX_GENERATES[liuYueWx] === wx) score += 0.8;
    if (WX_CONTROLS[liuYueWx] === wx) score -= 0.4;

    // 流日天干五行的影响（最近的力量，加权较高）
    if (WX_GENERATES[liuRiWx] === wx) score += 1.2;
    if (WX_CONTROLS[liuRiWx] === wx) score -= 0.8;
    if (liuRiWx === wx) score += 0.5; // 流日与颜色同五行，得天时

    wxScores[wx] = Math.round(score * 10) / 10;
  }

  // 6. 按分数排序，生成推荐列表
  const sorted = ALL_WX.slice().sort((a, b) => wxScores[b] - wxScores[a]);

  const gradeLabel = (score: number): string => {
    if (score >= 4) return '大吉';
    if (score >= 2) return '吉';
    if (score >= 0) return '平';
    if (score >= -2) return '不利';
    return '凶';
  };

  const categoryLabel = (rank: number, score: number): string => {
    if (rank === 0) return '最佳色';
    if (rank === 1) return '次吉色';
    if (score >= 0) return '可选色';
    if (rank >= 4) return '忌穿色';
    return '消耗色';
  };

  // 构建描述
  const daYunDesc = currentDaYun ? `大运${currentDaYun.ganZhi}(${currentDaYun.ganWuxing})` : '大运未知';
  const baseDesc = `日主${dayGan}属${dayWx}，${strength}，${daYunDesc}`;

  const categories: DressColorItem[] = sorted.map((wx, i) => {
    const score = wxScores[wx];
    const grade = gradeLabel(score);
    const cat = categoryLabel(i, score);

    let desc = '';
    if (i === 0) {
      desc = `${baseDesc}。${wx}为喜用，今日流日${liuRiGan}(${liuRiWx})助力，${grade}`;
    } else if (i <= 1) {
      desc = `${wx}${yongShen.includes(wx) ? '为喜用' : '得天时'}，${grade}`;
    } else if (score >= 0) {
      desc = `${wx}今日表现平稳`;
    } else if (i >= 4) {
      desc = `${wx}${jiShen.includes(wx) ? '为忌神' : '受压制'}，不宜穿着`;
    } else {
      desc = `${wx}今日能量偏弱，消耗`;
    }

    return {
      category: cat,
      relation: `${grade}(${score > 0 ? '+' : ''}${score})`,
      wuxing: wx,
      colors: WX_DETAIL_COLORS[wx] || [],
      hexColors: WX_COLOR_HEX[wx] || [],
      description: desc,
    };
  });

  return {
    dayGan: liuRiGan,
    dayWuxing: liuRiWx,
    mode: 'personal',
    modeLabel: `个人推荐（日主${dayGan}${dayWx}·${strength}）`,
    categories,
  };
}

// ─── 方位推算 ────────────────────────────────────────

/**
 * 每日吉祥方位推算
 */
export function getLuckyDirections(dayGan: string): LuckyDirectionResult {
  const dayWx = WU_XING_MAP[dayGan] || '木';

  const shengWo = findWhoGenerates(dayWx); // 生我
  const woKe = WX_CONTROLS[dayWx] || '';   // 我克

  const directions: LuckyDirectionItem[] = [
    {
      name: WX_DIRECTION[shengWo] || '中',
      wuxing: shengWo,
      level: '大吉',
      scene: DIRECTION_SCENES[WX_DIRECTION[shengWo] || '中'] || '',
    },
    {
      name: WX_DIRECTION[dayWx] || '中',
      wuxing: dayWx,
      level: '吉',
      scene: DIRECTION_SCENES[WX_DIRECTION[dayWx] || '中'] || '',
    },
    {
      name: WX_DIRECTION[woKe] || '中',
      wuxing: woKe,
      level: '小吉',
      scene: DIRECTION_SCENES[WX_DIRECTION[woKe] || '中'] || '',
    },
  ];

  const caiShen = CAI_SHEN_DIRECTION[dayGan] || '南';

  return { directions, caiShen };
}

// ─── 7日穿衣推荐 ────────────────────────────────────

/**
 * 7日穿衣颜色推荐（通用模式）
 */
export function getWeekDress(year: number, month: number, day: number): WeekDressItem[] {
  const result: WeekDressItem[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(year, month - 1, day + i);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const dd = d.getDate();
    const w = d.getDay();

    const { gan } = getDayGanZhiByDate(y, m, dd);
    const dress = getDailyDress(gan);

    const bestColors: string[] = [];
    const bestHex: string[] = [];
    const avoidColors: string[] = [];
    const avoidHex: string[] = [];

    for (const cat of dress.categories) {
      if (cat.category === '得时色' || cat.category === '和谐色') {
        if (cat.colors.length > 0) {
          bestColors.push(cat.colors[0]);
          bestHex.push(cat.hexColors[0] || '');
        }
      }
      if (cat.category === '不利色') {
        if (cat.colors.length > 0) {
          avoidColors.push(cat.colors[0]);
          avoidHex.push(cat.hexColors[0] || '');
        }
      }
    }

    result.push({
      date: `${m}月${dd}日 周${WEEK_NAMES[w]}`,
      dayGan: gan,
      dayWuxing: dress.dayWuxing,
      bestColors,
      bestHex,
      avoidColors,
      avoidHex,
    });
  }

  return result;
}

/**
 * 7日穿衣颜色推荐（个人八字模式）
 */
export function getWeekDressPersonal(
  bazi: PersonalBaziInput,
  year: number, month: number, day: number,
): WeekDressItem[] {
  const result: WeekDressItem[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(year, month - 1, day + i);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const dd = d.getDate();
    const w = d.getDay();

    const dress = getPersonalDailyDress(bazi, y, m, dd);

    const bestColors: string[] = [];
    const bestHex: string[] = [];
    const avoidColors: string[] = [];
    const avoidHex: string[] = [];

    for (const cat of dress.categories) {
      if (cat.category === '最佳色' || cat.category === '次吉色') {
        if (cat.colors.length > 0) {
          bestColors.push(cat.colors[0]);
          bestHex.push(cat.hexColors[0] || '');
        }
      }
      if (cat.category === '忌穿色') {
        if (cat.colors.length > 0) {
          avoidColors.push(cat.colors[0]);
          avoidHex.push(cat.hexColors[0] || '');
        }
      }
    }

    result.push({
      date: `${m}月${dd}日 周${WEEK_NAMES[w]}`,
      dayGan: dress.dayGan,
      dayWuxing: dress.dayWuxing,
      bestColors,
      bestHex,
      avoidColors,
      avoidHex,
    });
  }

  return result;
}
