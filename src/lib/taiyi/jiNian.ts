/**
 * 太乙神数 —— 太乙积年核心算法
 * 据《太乙统宗宝鉴》《太乙金镜式经》
 */

import type { CalcType, JiNianResult, TaiyiSchool } from './types';
import { TONGZONG_EPOCH, JINJING_EPOCH } from './constants';

/**
 * 统宗版积年计算
 *
 * 太乙积年 = 当前公历年 + TONGZONG_EPOCH
 * 年计直接使用积年
 * 月计 = 积年 × 12 + 月数
 * 日计 = 积年 × 360 + 日数（太乙历每年360日）
 * 时计 = 积年 × 360 × 12 + 日数 × 12 + 时辰序号
 */
export function calcJiNianTongzong(
  year: number, month: number, day: number, hour: number,
  calcType: CalcType,
): JiNianResult {
  const baseJiNian = year + TONGZONG_EPOCH;

  let jiNian: number;
  let debugLines: string[] = [];

  debugLines.push(`[统宗版] 公元${year}年`);
  debugLines.push(`基础积年 = ${year} + ${TONGZONG_EPOCH} = ${baseJiNian}`);

  switch (calcType) {
    case 'year':
      jiNian = baseJiNian;
      debugLines.push(`年计：积年 = ${jiNian}`);
      break;
    case 'month':
      jiNian = baseJiNian * 12 + month;
      debugLines.push(`月计：积月 = ${baseJiNian} × 12 + ${month} = ${jiNian}`);
      break;
    case 'day': {
      // 简化：太乙历每年360日，月30日
      const dayCount = (month - 1) * 30 + day;
      jiNian = baseJiNian * 360 + dayCount;
      debugLines.push(`日计：积日 = ${baseJiNian} × 360 + ${dayCount} = ${jiNian}`);
      break;
    }
    case 'hour': {
      const dayCount = (month - 1) * 30 + day;
      const shiChen = hour === 23 ? 0 : Math.floor((hour + 1) / 2) % 12;
      jiNian = baseJiNian * 360 * 12 + dayCount * 12 + shiChen;
      debugLines.push(`时计：积时 = ${baseJiNian}×360×12 + ${dayCount}×12 + ${shiChen} = ${jiNian}`);
      break;
    }
  }

  // 推导元和纪
  const { yuan, ji } = calcYuanJi(jiNian, 'tongzong');
  debugLines.push(`所属：${yuan}，第${ji}纪`);

  return {
    jiNian,
    yuan,
    ji,
    school: 'tongzong',
    debugInfo: debugLines.join('\n'),
  };
}

/**
 * 金镜版积年计算
 *
 * 与统宗版的主要差异在于起算点不同
 */
export function calcJiNianJinjing(
  year: number, month: number, day: number, hour: number,
  calcType: CalcType,
): JiNianResult {
  const baseJiNian = year + JINJING_EPOCH;

  let jiNian: number;
  let debugLines: string[] = [];

  debugLines.push(`[金镜版] 公元${year}年`);
  debugLines.push(`基础积年 = ${year} + ${JINJING_EPOCH} = ${baseJiNian}`);

  switch (calcType) {
    case 'year':
      jiNian = baseJiNian;
      debugLines.push(`年计：积年 = ${jiNian}`);
      break;
    case 'month':
      jiNian = baseJiNian * 12 + month;
      debugLines.push(`月计：积月 = ${baseJiNian} × 12 + ${month} = ${jiNian}`);
      break;
    case 'day': {
      const dayCount = (month - 1) * 30 + day;
      jiNian = baseJiNian * 360 + dayCount;
      debugLines.push(`日计：积日 = ${baseJiNian} × 360 + ${dayCount} = ${jiNian}`);
      break;
    }
    case 'hour': {
      const dayCount = (month - 1) * 30 + day;
      const shiChen = hour === 23 ? 0 : Math.floor((hour + 1) / 2) % 12;
      jiNian = baseJiNian * 360 * 12 + dayCount * 12 + shiChen;
      debugLines.push(`时计：积时 = ${baseJiNian}×360×12 + ${dayCount}×12 + ${shiChen} = ${jiNian}`);
      break;
    }
  }

  const { yuan, ji } = calcYuanJi(jiNian, 'jinjing');
  debugLines.push(`所属：${yuan}，第${ji}纪`);

  return {
    jiNian,
    yuan,
    ji,
    school: 'jinjing',
    debugInfo: debugLines.join('\n'),
  };
}

/**
 * 从积年推导元和纪
 *
 * 统宗版：72年为一大周期（3元×24年）
 *   上元(1-24), 中元(25-48), 下元(49-72)
 * 金镜版：360年为一大周期
 *   上元(1-120), 中元(121-240), 下元(241-360)
 */
export function calcYuanJi(jiNian: number, school: TaiyiSchool): { yuan: string; ji: number } {
  if (school === 'tongzong') {
    const cycle = 72;
    const pos = ((jiNian % cycle) + cycle) % cycle || cycle; // 1-72
    let yuan: string;
    if (pos <= 24) yuan = '上元';
    else if (pos <= 48) yuan = '中元';
    else yuan = '下元';
    const ji = Math.ceil(pos / 24);
    return { yuan, ji };
  } else {
    const cycle = 360;
    const pos = ((jiNian % cycle) + cycle) % cycle || cycle; // 1-360
    let yuan: string;
    if (pos <= 120) yuan = '上元';
    else if (pos <= 240) yuan = '中元';
    else yuan = '下元';
    const ji = Math.ceil(pos / 120);
    return { yuan, ji };
  }
}
