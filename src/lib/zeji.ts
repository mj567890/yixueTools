/**
 * 玉匣择吉 — 吉祥方位、穿衣颜色推荐算法库
 * 基于五行生克关系推算，仅供民俗参考
 */

import { WU_XING_MAP, WX_GENERATES, WX_CONTROLS } from './lunar';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Solar } = require('lunar-javascript');

// ─── 常量 ────────────────────────────────────────────

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

// ─── 接口 ────────────────────────────────────────────

export interface DressColorItem {
  /** 分类名：贵人色/进取色/求财色/消耗色/不利色 */
  category: string;
  /** 五行关系描述：生我/同我/我克/我生/克我 */
  relation: string;
  /** 对应五行 */
  wuxing: string;
  /** 具体颜色名 */
  colors: string[];
  /** 颜色CSS色值 */
  hexColors: string[];
  /** 说明 */
  description: string;
}

export interface DailyDressResult {
  dayGan: string;
  dayWuxing: string;
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
 * 每日穿衣颜色推荐
 * 基于日主五行的五种生克关系推导
 */
export function getDailyDress(dayGan: string): DailyDressResult {
  const dayWx = WU_XING_MAP[dayGan] || '木';

  // 五行关系
  const shengWo = findWhoGenerates(dayWx);   // 生我 → 贵人色
  const tongWo = dayWx;                       // 同我 → 进取色
  const woKe = WX_CONTROLS[dayWx] || '';      // 我克 → 求财色
  const woSheng = WX_GENERATES[dayWx] || '';  // 我生 → 消耗色
  const keWo = findWhoControls(dayWx);        // 克我 → 不利色

  const categories: DressColorItem[] = [
    {
      category: '贵人色',
      relation: '生我',
      wuxing: shengWo,
      colors: WX_DETAIL_COLORS[shengWo] || [],
      hexColors: WX_COLOR_HEX[shengWo] || [],
      description: `${shengWo}生${dayWx}，得贵人相助，大吉`,
    },
    {
      category: '进取色',
      relation: '同我',
      wuxing: tongWo,
      colors: WX_DETAIL_COLORS[tongWo] || [],
      hexColors: WX_COLOR_HEX[tongWo] || [],
      description: `与日主${dayWx}同属，旺自身之气，吉`,
    },
    {
      category: '求财色',
      relation: '我克',
      wuxing: woKe,
      colors: WX_DETAIL_COLORS[woKe] || [],
      hexColors: WX_COLOR_HEX[woKe] || [],
      description: `${dayWx}克${woKe}，主求财有利，小吉`,
    },
    {
      category: '消耗色',
      relation: '我生',
      wuxing: woSheng,
      colors: WX_DETAIL_COLORS[woSheng] || [],
      hexColors: WX_COLOR_HEX[woSheng] || [],
      description: `${dayWx}生${woSheng}，泄自身之气，平`,
    },
    {
      category: '不利色',
      relation: '克我',
      wuxing: keWo,
      colors: WX_DETAIL_COLORS[keWo] || [],
      hexColors: WX_COLOR_HEX[keWo] || [],
      description: `${keWo}克${dayWx}，受克不利，凶`,
    },
  ];

  return { dayGan, dayWuxing: dayWx, categories };
}

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

/**
 * 7日穿衣颜色预测
 */
export function getWeekDress(year: number, month: number, day: number): WeekDressItem[] {
  const result: WeekDressItem[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(year, month - 1, day + i);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const dd = d.getDate();
    const w = d.getDay();

    const { gan, ganZhi: _gz } = getDayGanZhiByDate(y, m, dd);
    const dress = getDailyDress(gan);

    // 推荐色 = 贵人色 + 进取色的第一个
    const bestColors: string[] = [];
    const bestHex: string[] = [];
    const avoidColors: string[] = [];
    const avoidHex: string[] = [];

    for (const cat of dress.categories) {
      if (cat.category === '贵人色' || cat.category === '进取色') {
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
