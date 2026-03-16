/**
 * 阳盘奇门遁甲 —— 三种正统定局法引擎
 *
 * 1. 拆补法（chaiBu）：最常用，以节气后最近甲/己日为符头
 * 2. 置闰法（zhiRun）：处理超神接气，符头可在节气之前
 * 3. 茅山道人法（maoShan）：简化法，以日干支旬首定元
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Solar: SolarJu } = require('lunar-javascript');

import type { YangpanConfig, YangpanJuResult } from './types';
import { JU_TABLE, TIAN_GAN, DI_ZHI, XUN_SHOU_MAP, MAOSHAN_YUAN_MAP } from './constants';

// ==================== 工具函数 ====================

/** 获取指定日期的天干地支（日柱），晚子时归属次日 */
function getDayGanZhi(year: number, month: number, day: number, hour: number = 0): string {
  let effYear = year, effMonth = month, effDay = day;
  if (hour >= 23) {
    const nextDate = new Date(year, month - 1, day + 1);
    effYear = nextDate.getFullYear();
    effMonth = nextDate.getMonth() + 1;
    effDay = nextDate.getDate();
  }
  const solar = SolarJu.fromYmdHms(effYear, effMonth, effDay, 0, 0, 0);
  const ec = solar.getLunar().getEightChar();
  ec.setSect(2);
  return ec.getDayGan() + ec.getDayZhi();
}

/** 计算两个日期之间的天数差（date1 - date2） */
function daysBetween(
  y1: number, m1: number, d1: number,
  y2: number, m2: number, d2: number,
): number {
  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  return Math.round((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
}

/** 从指定日期偏移N天 */
function addDays(year: number, month: number, day: number, offset: number): { year: number; month: number; day: number } {
  const d = new Date(year, month - 1, day + offset);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

/**
 * 获取上一个节气（节+气都包括，因为JU_TABLE含24个节气）
 * 返回节气名和精确日期
 */
function getPrevJieQi(year: number, month: number, day: number, hour: number): {
  name: string;
  year: number;
  month: number;
  day: number;
} {
  // 晚子时处理
  let effYear = year, effMonth = month, effDay = day;
  if (hour >= 23) {
    const nextDate = new Date(year, month - 1, day + 1);
    effYear = nextDate.getFullYear();
    effMonth = nextDate.getMonth() + 1;
    effDay = nextDate.getDate();
  }

  const solar = SolarJu.fromYmdHms(effYear, effMonth, effDay, hour < 23 ? hour : 0, 0, 0);
  const lunar = solar.getLunar();

  // 尝试 getPrevJieQi()（节+气）
  const prevJieQi = lunar.getPrevJieQi();
  if (prevJieQi) {
    const name: string = prevJieQi.getName();
    if (JU_TABLE[name]) {
      const s = prevJieQi.getSolar();
      return { name, year: s.getYear(), month: s.getMonth(), day: s.getDay() };
    }
  }

  // 备用方案：获取节气表逐一比对
  const jieQiTable = lunar.getJieQiTable();
  if (jieQiTable) {
    const JIEQI_ORDER = [
      '冬至', '小寒', '大寒', '立春', '雨水', '惊蛰',
      '春分', '清明', '谷雨', '立夏', '小满', '芒种',
      '夏至', '小暑', '大暑', '立秋', '处暑', '白露',
      '秋分', '寒露', '霜降', '立冬', '小雪', '大雪',
    ];

    interface JieQiEntry {
      name: string;
      year: number;
      month: number;
      day: number;
    }
    const entries: JieQiEntry[] = [];

    for (const name of JIEQI_ORDER) {
      const s = jieQiTable[name];
      if (s && JU_TABLE[name]) {
        entries.push({ name, year: s.getYear(), month: s.getMonth(), day: s.getDay() });
      }
    }

    // 查上一年节气表（1-2月可能需要）
    if (month <= 2) {
      try {
        const prevYearSolar = SolarJu.fromYmd(year - 1, 12, 1);
        const prevLunar = prevYearSolar.getLunar();
        const prevTable = prevLunar.getJieQiTable();
        if (prevTable) {
          for (const name of ['大雪', '冬至']) {
            const s = prevTable[name];
            if (s && JU_TABLE[name]) {
              entries.push({ name, year: s.getYear(), month: s.getMonth(), day: s.getDay() });
            }
          }
        }
      } catch {
        // ignore
      }
    }

    // 找当前日期之前最近的节气
    let best: JieQiEntry | null = null;
    let bestDist = Infinity;
    for (const entry of entries) {
      const dist = daysBetween(effYear, effMonth, effDay, entry.year, entry.month, entry.day);
      if (dist >= 0 && dist < bestDist) {
        bestDist = dist;
        best = entry;
      }
    }
    if (best) return best;
  }

  // 最后备用方案
  throw new Error(`无法获取 ${effYear}-${effMonth}-${effDay} 的节气信息`);
}

/**
 * 获取下一个节气
 */
function getNextJieQi(year: number, month: number, day: number, hour: number): {
  name: string;
  year: number;
  month: number;
  day: number;
} {
  let effYear = year, effMonth = month, effDay = day;
  if (hour >= 23) {
    const nextDate = new Date(year, month - 1, day + 1);
    effYear = nextDate.getFullYear();
    effMonth = nextDate.getMonth() + 1;
    effDay = nextDate.getDate();
  }

  const solar = SolarJu.fromYmdHms(effYear, effMonth, effDay, hour < 23 ? hour : 0, 0, 0);
  const lunar = solar.getLunar();
  const nextJieQi = lunar.getNextJieQi();
  if (nextJieQi) {
    const name: string = nextJieQi.getName();
    if (JU_TABLE[name]) {
      const s = nextJieQi.getSolar();
      return { name, year: s.getYear(), month: s.getMonth(), day: s.getDay() };
    }
  }
  throw new Error(`无法获取 ${effYear}-${effMonth}-${effDay} 的下一个节气信息`);
}

/**
 * 找符头（拆补法专用）
 *
 * 拆补法规则：找节气交节日**当天或之前**最近的甲/己日作为符头
 * 符头是每一"元"的起始日，每元5天
 *
 * 注意：如果节气当天就是甲/己日，则当天为符头
 */
function findFuTouChaiBu(
  jqYear: number, jqMonth: number, jqDay: number,
): { fuTouGZ: string; fuTouYear: number; fuTouMonth: number; fuTouDay: number } {
  // 获取节气当天的日干支
  const jqDayGZ = getDayGanZhi(jqYear, jqMonth, jqDay);
  const jqGanIdx = TIAN_GAN.indexOf(jqDayGZ[0]);

  // 甲=0, 己=5 → %5==0 → 回溯步数=0
  // 乙=1 → 回溯1天找甲; 丙=2 → 回溯2天; 丁=3 → 3天; 戊=4 → 4天
  // 庚=5+1=6 → %5=1 → 1天找己; 辛=7 → %5=2; 壬=8 → %5=3; 癸=9 → %5=4
  const stepsBack = jqGanIdx % 5;

  const fuTou = addDays(jqYear, jqMonth, jqDay, -stepsBack);
  const fuTouGZ = getDayGanZhi(fuTou.year, fuTou.month, fuTou.day);

  return {
    fuTouGZ,
    fuTouYear: fuTou.year,
    fuTouMonth: fuTou.month,
    fuTouDay: fuTou.day,
  };
}

// ==================== 拆补法 ====================

/**
 * 拆补法定局
 *
 * 步骤：
 * 1. 找上一个节气及其交节日期
 * 2. 从节气日向前找最近的甲/己日为"符头"
 * 3. 计算排盘日距符头的天数，判定三元（上/中/下）
 * 4. 查 JU_TABLE[节气名][三元] 得局数
 */
export function chaiBuJu(config: YangpanConfig): YangpanJuResult {
  const { year, month, day, hour } = config;
  const debugLines: string[] = [];

  // 晚子时处理
  let effYear = year, effMonth = month, effDay = day;
  if (hour >= 23) {
    const nextDate = new Date(year, month - 1, day + 1);
    effYear = nextDate.getFullYear();
    effMonth = nextDate.getMonth() + 1;
    effDay = nextDate.getDate();
  }

  // Step 1: 获取上一个节气
  const prevJQ = getPrevJieQi(year, month, day, hour);
  debugLines.push(`当前节气：${prevJQ.name}（${prevJQ.year}-${String(prevJQ.month).padStart(2, '0')}-${String(prevJQ.day).padStart(2, '0')}交节）`);

  // Step 2: 从节气日找符头
  const { fuTouGZ, fuTouYear, fuTouMonth, fuTouDay } = findFuTouChaiBu(prevJQ.year, prevJQ.month, prevJQ.day);
  debugLines.push(`符头：${fuTouGZ}日（${fuTouYear}-${String(fuTouMonth).padStart(2, '0')}-${String(fuTouDay).padStart(2, '0')}）`);

  // Step 3: 计算排盘日距符头天数
  let daysSinceFuTou = daysBetween(effYear, effMonth, effDay, fuTouYear, fuTouMonth, fuTouDay);

  // 如果排盘日在符头之前（极端情况），说明需要往下一个符头推
  // 但拆补法符头在节气当日或之前，而排盘日在节气之后，所以一般 daysSinceFuTou >= 0
  // 如果 daysSinceFuTou >= 15，需要找下一个符头
  let currentFuTouGZ = fuTouGZ;
  let currentFuTouY = fuTouYear, currentFuTouM = fuTouMonth, currentFuTouD = fuTouDay;

  if (daysSinceFuTou < 0) {
    // 排盘日在符头之前（不应发生在拆补法中，但做防御处理）
    // 往前找5天作为上一个符头
    const prevFuTou = addDays(fuTouYear, fuTouMonth, fuTouDay, -5);
    currentFuTouGZ = getDayGanZhi(prevFuTou.year, prevFuTou.month, prevFuTou.day);
    currentFuTouY = prevFuTou.year;
    currentFuTouM = prevFuTou.month;
    currentFuTouD = prevFuTou.day;
    daysSinceFuTou = daysBetween(effYear, effMonth, effDay, currentFuTouY, currentFuTouM, currentFuTouD);
    debugLines.push(`修正符头：${currentFuTouGZ}日（排盘日在原符头前）`);
  }

  while (daysSinceFuTou >= 15) {
    // 跳到下一个符头（+15天 = 3元结束）
    const nextFuTou = addDays(currentFuTouY, currentFuTouM, currentFuTouD, 15);
    currentFuTouGZ = getDayGanZhi(nextFuTou.year, nextFuTou.month, nextFuTou.day);
    currentFuTouY = nextFuTou.year;
    currentFuTouM = nextFuTou.month;
    currentFuTouD = nextFuTou.day;
    daysSinceFuTou = daysBetween(effYear, effMonth, effDay, currentFuTouY, currentFuTouM, currentFuTouD);
    debugLines.push(`跳转下一符头：${currentFuTouGZ}日`);
  }

  // Step 4: 三元判定
  let yuan: '上元' | '中元' | '下元';
  if (daysSinceFuTou < 5) {
    yuan = '上元';
  } else if (daysSinceFuTou < 10) {
    yuan = '中元';
  } else {
    yuan = '下元';
  }
  debugLines.push(`距符头${daysSinceFuTou}天 → ${yuan}`);

  // Step 5: 查局数表
  const juEntry = JU_TABLE[prevJQ.name];
  if (!juEntry) {
    throw new Error(`节气 "${prevJQ.name}" 不在定局表中`);
  }
  const juNumber = juEntry[yuan];
  const dunType = juEntry.dunType;
  debugLines.push(`${prevJQ.name} ${yuan} → ${dunType}${juNumber}局`);

  return {
    dunType,
    juNumber,
    yuan,
    jieQiName: prevJQ.name,
    jieQiDate: `${prevJQ.year}-${String(prevJQ.month).padStart(2, '0')}-${String(prevJQ.day).padStart(2, '0')}`,
    fuTou: currentFuTouGZ,
    method: 'chaiBu',
    isRunJu: false,
    daysSinceFuTou,
    debugInfo: debugLines.join('\n'),
  };
}

// ==================== 置闰法 ====================

/**
 * 置闰法定局
 *
 * 与拆补法的核心区别：
 * 1. 以节气之前最近的甲/己日为符头（可"超神"——符头早于节气）
 * 2. 当超神天数过多（>9天）时，需要"闰局"处理
 * 3. 闰局使用本节气的局数，但标注为闰
 */
export function zhiRunJu(config: YangpanConfig): YangpanJuResult {
  const { year, month, day, hour } = config;
  const debugLines: string[] = [];

  let effYear = year, effMonth = month, effDay = day;
  if (hour >= 23) {
    const nextDate = new Date(year, month - 1, day + 1);
    effYear = nextDate.getFullYear();
    effMonth = nextDate.getMonth() + 1;
    effDay = nextDate.getDate();
  }

  // Step 1: 获取上一个和下一个节气
  const prevJQ = getPrevJieQi(year, month, day, hour);
  debugLines.push(`当前节气：${prevJQ.name}（${prevJQ.year}-${String(prevJQ.month).padStart(2, '0')}-${String(prevJQ.day).padStart(2, '0')}交节）`);

  // Step 2: 找符头 —— 节气日当天或之前最近的甲/己日（同拆补法）
  const { fuTouGZ, fuTouYear, fuTouMonth, fuTouDay } = findFuTouChaiBu(prevJQ.year, prevJQ.month, prevJQ.day);
  debugLines.push(`符头：${fuTouGZ}日（${fuTouYear}-${String(fuTouMonth).padStart(2, '0')}-${String(fuTouDay).padStart(2, '0')}）`);

  // Step 3: 计算符头到节气的差值（超神天数）
  const chaoShenDays = daysBetween(prevJQ.year, prevJQ.month, prevJQ.day, fuTouYear, fuTouMonth, fuTouDay);
  debugLines.push(`符头到节气：${chaoShenDays}天（${chaoShenDays > 0 ? '超神' : chaoShenDays === 0 ? '正授' : '接气'}）`);

  // Step 4: 计算排盘日距符头天数
  let daysSinceFuTou = daysBetween(effYear, effMonth, effDay, fuTouYear, fuTouMonth, fuTouDay);

  // 检查是否需要闰局
  let isRunJu = false;
  let yuan: '上元' | '中元' | '下元';
  let juEntry = JU_TABLE[prevJQ.name];

  if (!juEntry) {
    throw new Error(`节气 "${prevJQ.name}" 不在定局表中`);
  }

  if (daysSinceFuTou >= 15) {
    // 超过15天，进入下一个节气的范围
    // 置闰法：在两个节气之间多出的天数作为闰局
    // 取下一个节气来处理
    try {
      const nextJQ = getNextJieQi(year, month, day, hour);
      const nextFuTou = findFuTouChaiBu(nextJQ.year, nextJQ.month, nextJQ.day);
      const daysToNextFuTou = daysBetween(effYear, effMonth, effDay, nextFuTou.fuTouYear, nextFuTou.fuTouMonth, nextFuTou.fuTouDay);

      if (daysToNextFuTou >= 0 && daysToNextFuTou < 15) {
        // 已经进入下一个节气的符头范围
        juEntry = JU_TABLE[nextJQ.name] || juEntry;
        daysSinceFuTou = daysToNextFuTou;
        debugLines.push(`进入下一节气范围：${nextJQ.name}`);
      } else {
        // 闰局处理：使用当前节气的下元局
        isRunJu = true;
        yuan = '下元';
        const juNumber = juEntry[yuan];
        debugLines.push(`触发闰局：距符头${daysSinceFuTou}天 > 15天`);
        debugLines.push(`闰局 → ${prevJQ.name} ${yuan} → ${juEntry.dunType}${juNumber}局`);

        return {
          dunType: juEntry.dunType,
          juNumber,
          yuan,
          jieQiName: prevJQ.name,
          jieQiDate: `${prevJQ.year}-${String(prevJQ.month).padStart(2, '0')}-${String(prevJQ.day).padStart(2, '0')}`,
          fuTou: fuTouGZ,
          method: 'zhiRun',
          isRunJu: true,
          daysSinceFuTou,
          debugInfo: debugLines.join('\n'),
        };
      }
    } catch {
      // 无法获取下一个节气，按正常处理
      isRunJu = true;
      debugLines.push(`无法获取下一节气，按闰局处理`);
    }
  }

  // Step 5: 三元判定（同拆补法）
  if (daysSinceFuTou < 5) {
    yuan = '上元';
  } else if (daysSinceFuTou < 10) {
    yuan = '中元';
  } else {
    yuan = '下元';
  }
  debugLines.push(`距符头${daysSinceFuTou}天 → ${yuan}`);

  // Step 6: 查局数表
  const juNumber = juEntry[yuan];
  debugLines.push(`${prevJQ.name} ${yuan} → ${juEntry.dunType}${juNumber}局${isRunJu ? '（闰）' : ''}`);

  return {
    dunType: juEntry.dunType,
    juNumber,
    yuan,
    jieQiName: prevJQ.name,
    jieQiDate: `${prevJQ.year}-${String(prevJQ.month).padStart(2, '0')}-${String(prevJQ.day).padStart(2, '0')}`,
    fuTou: fuTouGZ,
    method: 'zhiRun',
    isRunJu,
    daysSinceFuTou,
    debugInfo: debugLines.join('\n'),
  };
}

// ==================== 茅山道人法 ====================

/**
 * 茅山道人法定局（简化法）
 *
 * 步骤：
 * 1. 取排盘当日干支的旬首
 * 2. 用旬首查 MAOSHAN_YUAN_MAP 得三元
 * 3. 结合当前节气查 JU_TABLE 得局数
 */
export function maoShanJu(config: YangpanConfig): YangpanJuResult {
  const { year, month, day, hour } = config;
  const debugLines: string[] = [];

  // 获取排盘日的日干支
  const dayGZ = getDayGanZhi(year, month, day, hour);
  debugLines.push(`排盘日干支：${dayGZ}`);

  // 查旬首
  const xunInfo = XUN_SHOU_MAP[dayGZ];
  if (!xunInfo) {
    throw new Error(`无法找到 "${dayGZ}" 的旬首信息`);
  }
  const xunShou = xunInfo.xunShou;
  debugLines.push(`旬首：${xunShou}`);

  // 查三元
  const yuan = MAOSHAN_YUAN_MAP[xunShou];
  if (!yuan) {
    throw new Error(`茅山法：旬首 "${xunShou}" 不在三元映射表中`);
  }
  debugLines.push(`${xunShou} → ${yuan}`);

  // 获取当前节气
  const prevJQ = getPrevJieQi(year, month, day, hour);
  debugLines.push(`当前节气：${prevJQ.name}`);

  // 查局数表
  const juEntry = JU_TABLE[prevJQ.name];
  if (!juEntry) {
    throw new Error(`节气 "${prevJQ.name}" 不在定局表中`);
  }
  const juNumber = juEntry[yuan];
  debugLines.push(`${prevJQ.name} ${yuan} → ${juEntry.dunType}${juNumber}局`);

  return {
    dunType: juEntry.dunType,
    juNumber,
    yuan,
    jieQiName: prevJQ.name,
    jieQiDate: `${prevJQ.year}-${String(prevJQ.month).padStart(2, '0')}-${String(prevJQ.day).padStart(2, '0')}`,
    fuTou: dayGZ, // 茅山法用日干支代替符头概念
    method: 'maoShan',
    isRunJu: false,
    daysSinceFuTou: 0,
    debugInfo: debugLines.join('\n'),
  };
}

// ==================== 统一入口 ====================

/**
 * 阳盘定局统一入口
 */
export function determineYangpanJu(config: YangpanConfig): YangpanJuResult {
  switch (config.method) {
    case 'chaiBu':
      return chaiBuJu(config);
    case 'zhiRun':
      return zhiRunJu(config);
    case 'maoShan':
      return maoShanJu(config);
    default:
      return chaiBuJu(config);
  }
}
