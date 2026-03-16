/**
 * 太乙神数 —— 时间提取与干支计算
 * 复用 lunar-javascript 库
 */

import { Solar, Lunar } from 'lunar-javascript';
import type { GanZhiSet } from './types';

/**
 * 提取四柱干支
 * 处理晚子时（hour >= 23 时日柱归次日）
 */
export function extractFourPillars(
  year: number, month: number, day: number, hour: number,
): { ganZhi: GanZhiSet; lunarDesc: string } {
  // 晚子时处理：23点归入次日
  let adjYear = year;
  let adjMonth = month;
  let adjDay = day;
  if (hour >= 23) {
    const d = new Date(year, month - 1, day + 1);
    adjYear = d.getFullYear();
    adjMonth = d.getMonth() + 1;
    adjDay = d.getDate();
  }

  const solar = Solar.fromYmd(adjYear, adjMonth, adjDay);
  const lunar = solar.getLunar();

  // 时辰地支序号：子(23-1)=0, 丑(1-3)=1, ...
  const shiChenIdx = hour === 23 ? 0 : Math.floor((hour + 1) / 2) % 12;

  const eightChar = lunar.getEightChar();

  const ganZhi: GanZhiSet = {
    year: eightChar.getYear(),
    month: eightChar.getMonth(),
    day: eightChar.getDay(),
    time: eightChar.getTime(),
  };

  // 农历描述
  const lunarMonth = lunar.getMonthInChinese();
  const lunarDay = lunar.getDayInChinese();
  const lunarYear = lunar.getYearInChinese();
  const lunarDesc = `农历${lunarYear}年${lunarMonth}月${lunarDay}`;

  return { ganZhi, lunarDesc };
}

/**
 * 获取当前节气信息
 */
export function getJieQiName(year: number, month: number, day: number): string {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const jq = lunar.getCurrentJieQi();
  return jq ? jq.getName() : '';
}

/**
 * 获取月支（用于旺衰判断）
 */
export function getMonthZhi(monthGanZhi: string): string {
  return monthGanZhi.length >= 2 ? monthGanZhi[1] : '';
}

/**
 * 获取日干支字符串
 */
export function getDayGanZhi(year: number, month: number, day: number): string {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  return lunar.getEightChar().getDay();
}

/** 时辰索引 (0=子, 1=丑, ..., 11=亥) */
export function getShiChenIndex(hour: number): number {
  if (hour === 23) return 0;
  return Math.floor((hour + 1) / 2) % 12;
}
