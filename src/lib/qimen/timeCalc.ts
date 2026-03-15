/**
 * 奇门遁甲 —— 时间要素提取 + 定局算法（拆补法/置闰法）
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Solar } = require('lunar-javascript');

import type { TimeElements, JuInfo } from './types';
import { JU_TABLE, JIEQI_ORDER, XUN_SHOU_MAP, DI_ZHI } from './constants';

/**
 * 提取排盘所需的所有时间要素
 */
export function extractTimeElements(
  year: number,
  month: number,
  day: number,
  hour: number,
): TimeElements {
  const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  eightChar.setSect(2);

  // 四柱干支
  const yearGan = eightChar.getYearGan();
  const yearZhi = eightChar.getYearZhi();
  const monthGan = eightChar.getMonthGan();
  const monthZhi = eightChar.getMonthZhi();
  const timeGan = eightChar.getTimeGan();
  const timeZhi = eightChar.getTimeZhi();

  // 晚子时处理：23时属于次日子时，日柱取次日
  let dayGan: string, dayZhi: string;
  if (hour >= 23) {
    const nextDate = new Date(year, month - 1, day + 1);
    const nextSolar = Solar.fromYmdHms(
      nextDate.getFullYear(), nextDate.getMonth() + 1, nextDate.getDate(), 0, 0, 0,
    );
    const nextEc = nextSolar.getLunar().getEightChar();
    nextEc.setSect(2);
    dayGan = nextEc.getDayGan();
    dayZhi = nextEc.getDayZhi();
  } else {
    dayGan = eightChar.getDayGan();
    dayZhi = eightChar.getDayZhi();
  }

  // 获取上一个节和下一个节
  const prevJie = lunar.getPrevJie();
  const nextJie = lunar.getNextJie();

  const currentJie = prevJie ? prevJie.getName() : '';
  const currentJieDate = prevJie ? prevJie.getSolar().toYmd() : '';
  const nextJieName = nextJie ? nextJie.getName() : '';
  const nextJieDate = nextJie ? nextJie.getSolar().toYmd() : '';

  // 农历描述
  const lunarDesc = `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;

  return {
    yearGanZhi: yearGan + yearZhi,
    monthGanZhi: monthGan + monthZhi,
    dayGanZhi: dayGan + dayZhi,
    timeGanZhi: timeGan + timeZhi,
    yearGan, yearZhi,
    monthGan, monthZhi,
    dayGan, dayZhi,
    timeGan, timeZhi,
    currentJie,
    currentJieDate,
    nextJie: nextJieName,
    nextJieDate,
    lunarDesc,
  };
}

/**
 * 确定阴阳遁和局数
 */
export function determineJu(
  timeElements: TimeElements,
  method: 'chaiBu' | 'zhiRun',
  year: number,
  month: number,
  day: number,
  hour: number,
): JuInfo {
  // 晚子时处理：23时归属次日
  let effYear = year, effMonth = month, effDay = day;
  if (hour >= 23) {
    const nextDate = new Date(year, month - 1, day + 1);
    effYear = nextDate.getFullYear();
    effMonth = nextDate.getMonth() + 1;
    effDay = nextDate.getDate();
  }

  const effSolar = Solar.fromYmdHms(effYear, effMonth, effDay, 0, 0, 0);
  const effLunar = effSolar.getLunar();

  // 获取节气名（用于确定阳/阴遁）
  const jieQiName = findCurrentJieQi(effYear, effMonth, effDay, 0);
  const juEntry = JU_TABLE[jieQiName];

  if (!juEntry) {
    throw new Error(`无法找到节气 "${jieQiName}" 对应的局数`);
  }

  const dunType = juEntry.dunType;

  // 定局公式：(年支序数 + 农历月 + 农历日 + 时支序数) % 9
  const yearZhiIdx = DI_ZHI.indexOf(timeElements.yearZhi) + 1;
  const lunarMonth = Math.abs(effLunar.getMonth());
  const lunarDay = effLunar.getDay();
  const timeZhiIdx = DI_ZHI.indexOf(timeElements.timeZhi) + 1;

  const sum = yearZhiIdx + lunarMonth + lunarDay + timeZhiIdx;
  const juNumber = sum % 9 === 0 ? 9 : sum % 9;

  // 旬首信息（保留兼容）
  const xunInfo = XUN_SHOU_MAP[timeElements.dayGanZhi];
  const fuTou = xunInfo ? xunInfo.xunShou : '';

  return { dunType, juNumber, yuan: '上元', fuTou, method, isRunQi: false };
}

/**
 * 查找当前时间所在的节气（用于定局查表）
 * 获取当年及前一年的节气表，找到当前时间之前最近的节气
 */
function findCurrentJieQi(
  year: number,
  month: number,
  day: number,
  hour: number,
): string {
  const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
  const lunar = solar.getLunar();

  // 优先使用 getPrevJie() 获取上一个"节"
  const prevJie = lunar.getPrevJie();
  if (prevJie) {
    const jieName = prevJie.getName();
    // 检查是否在定局表中
    if (JU_TABLE[jieName]) {
      return jieName;
    }
  }

  // 备用方案：获取节气表逐一比对
  const jieQiTable = lunar.getJieQiTable();
  if (jieQiTable) {
    // 收集所有节气及其日期，找到当前时间之前最近的
    const entries: Array<{ name: string; solar: { getYear(): number; getMonth(): number; getDay(): number } }> = [];
    for (const name of JIEQI_ORDER) {
      const s = jieQiTable[name];
      if (s) {
        entries.push({ name, solar: s });
      }
    }

    // 可能需要查上一年的节气表（如1月初在冬至和小寒之间）
    if (month <= 2) {
      const prevYearSolar = Solar.fromYmd(year - 1, 12, 1);
      const prevLunar = prevYearSolar.getLunar();
      const prevTable = prevLunar.getJieQiTable();
      if (prevTable) {
        for (const name of ['大雪', '冬至']) {
          const s = prevTable[name];
          if (s) {
            entries.push({ name, solar: s });
          }
        }
      }
    }

    // 按日期排序找到当前时间之前最近的节气
    let bestName = '冬至';
    let bestDist = Infinity;

    for (const entry of entries) {
      if (!JU_TABLE[entry.name]) continue;
      const s = entry.solar;
      const entryDate = new Date(s.getYear(), s.getMonth() - 1, s.getDay());
      const currentDate = new Date(year, month - 1, day);
      const dist = currentDate.getTime() - entryDate.getTime();
      if (dist >= 0 && dist < bestDist) {
        bestDist = dist;
        bestName = entry.name;
      }
    }
    return bestName;
  }

  // 最后备用：根据月份粗略判断
  return fallbackJieQi(month, day);
}

/**
 * 根据月份粗略判断节气（最后备用方案）
 */
function fallbackJieQi(month: number, day: number): string {
  // 节气大致日期
  const approx: Array<{ name: string; m: number; d: number }> = [
    { name: '小寒', m: 1, d: 6 }, { name: '大寒', m: 1, d: 20 },
    { name: '立春', m: 2, d: 4 }, { name: '雨水', m: 2, d: 19 },
    { name: '惊蛰', m: 3, d: 6 }, { name: '春分', m: 3, d: 21 },
    { name: '清明', m: 4, d: 5 }, { name: '谷雨', m: 4, d: 20 },
    { name: '立夏', m: 5, d: 6 }, { name: '小满', m: 5, d: 21 },
    { name: '芒种', m: 6, d: 6 }, { name: '夏至', m: 6, d: 21 },
    { name: '小暑', m: 7, d: 7 }, { name: '大暑', m: 7, d: 23 },
    { name: '立秋', m: 8, d: 7 }, { name: '处暑', m: 8, d: 23 },
    { name: '白露', m: 9, d: 8 }, { name: '秋分', m: 9, d: 23 },
    { name: '寒露', m: 10, d: 8 }, { name: '霜降', m: 10, d: 23 },
    { name: '立冬', m: 11, d: 7 }, { name: '小雪', m: 11, d: 22 },
    { name: '大雪', m: 12, d: 7 }, { name: '冬至', m: 12, d: 22 },
  ];

  let result = '冬至';
  const dayOfYear = (month - 1) * 31 + day; // 粗略计算

  for (const jq of approx) {
    const jqDoy = (jq.m - 1) * 31 + jq.d;
    if (dayOfYear >= jqDoy) {
      result = jq.name;
    }
  }
  return result;
}
