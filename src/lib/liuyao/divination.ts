/**
 * 六爻排盘系统 —— 四种起卦算法
 *
 * 1. 时间起卦 (time) - 用年月日时干支推导
 * 2. 铜钱起卦 (coin) - 三枚铜钱摇六次
 * 3. 数字起卦 (number) - 用户输入数字
 * 4. 手动起卦 (manual) - 直接指定六爻
 */

import type { YaoType, CoinTossResult, CoinFace, LiuYaoConfig } from './types';
import { COIN_FACE_VALUE, COIN_TOTAL_TO_YAO, isYangYao } from './constants';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Solar } = require('lunar-javascript');

// ==================== 时间起卦 ====================

/**
 * 时间起卦
 *
 * 算法: 利用农历年月日时干支数值推导六爻
 * - 上卦 = (年支序 + 月 + 日) mod 8 → 先天八卦数
 * - 下卦 = (年支序 + 月 + 日 + 时支序) mod 8
 * - 动爻位 = (年支序 + 月 + 日 + 时支序) mod 6
 * - 非动爻为少阳/少阴, 动爻为老阳/老阴
 *
 * 先天八卦序: 1乾 2兑 3离 4震 5巽 6坎 7艮 8坤
 */
const XIANTIAN_TRIGRAM_LINES: Record<number, [boolean, boolean, boolean]> = {
  1: [true,  true,  true],   // 乾
  2: [true,  true,  false],  // 兑
  3: [true,  false, true],   // 离
  4: [true,  false, false],  // 震
  5: [false, true,  true],   // 巽
  6: [false, true,  false],  // 坎
  7: [false, false, true],   // 艮
  0: [false, false, false],  // 坤 (8 mod 8 = 0)
};

const ZHI_ORDER: Record<string, number> = {
  '子': 1, '丑': 2, '寅': 3, '卯': 4, '辰': 5, '巳': 6,
  '午': 7, '未': 8, '申': 9, '酉': 10, '戌': 11, '亥': 12,
};

function getHourZhi(hour: number): string {
  const zhiList = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  // 23-1→子, 1-3→丑, 3-5→寅, ..., 21-23→亥
  const index = Math.floor(((hour + 1) % 24) / 2);
  return zhiList[index];
}

export function divinateByTime(
  year: number, month: number, day: number, hour: number,
): YaoType[] {
  let solar, lunar;
  try {
    solar = Solar.fromYmd(year, month, day);
    lunar = solar.getLunar();
  } catch {
    throw new Error(`日期 ${year}-${month}-${day} 无效`);
  }

  const lunarMonth = Math.abs(lunar.getMonth());
  const lunarDay = lunar.getDay();
  const yearGanZhi = lunar.getYearInGanZhi();
  const yearZhi = yearGanZhi.charAt(1);
  const yearNum = ZHI_ORDER[yearZhi] || 1;
  const hourZhi = getHourZhi(hour);
  const hourNum = ZHI_ORDER[hourZhi] || 1;

  const upperSum = yearNum + lunarMonth + lunarDay;
  const lowerSum = upperSum + hourNum;

  // 上下经卦 → 六爻阴阳
  const upperIdx = upperSum % 8; // 0 = 坤(8)
  const lowerIdx = lowerSum % 8;
  const upperLines = XIANTIAN_TRIGRAM_LINES[upperIdx] ?? XIANTIAN_TRIGRAM_LINES[0];
  const lowerLines = XIANTIAN_TRIGRAM_LINES[lowerIdx] ?? XIANTIAN_TRIGRAM_LINES[0];

  const allLines = [...lowerLines, ...upperLines]; // [初爻..上爻]

  // 动爻位 (1-6)
  const movingPos = (lowerSum % 6) || 6; // 余0按6

  // 生成六爻类型
  const yaoTypes: YaoType[] = allLines.map((isYang, i) => {
    const pos = i + 1;
    if (pos === movingPos) {
      return isYang ? 'laoYang' : 'laoYin'; // 动爻
    }
    return isYang ? 'shaoYang' : 'shaoYin'; // 静爻
  });

  return yaoTypes;
}

// ==================== 铜钱起卦 ====================

/**
 * 铜钱起卦
 * 用户提供 6 次投掷结果 (每次 3 枚铜钱)
 * 字=阳(3), 背=阴(2)
 * 三字=9(老阳), 二字一背=8(少阴), 二背一字=7(少阳), 三背=6(老阴)
 */
export function divinateByCoin(coinResults: CoinTossResult[]): YaoType[] {
  if (coinResults.length !== 6) {
    throw new Error('铜钱起卦需要6次投掷结果');
  }
  return coinResults.map(r => r.yaoType);
}

/**
 * 从三枚铜钱面计算爻类型
 */
export function calcCoinResult(
  yaoIndex: number,
  coins: [CoinFace, CoinFace, CoinFace],
): CoinTossResult {
  const total = coins.reduce((sum, face) => sum + COIN_FACE_VALUE[face], 0);
  const yaoType = COIN_TOTAL_TO_YAO[total];
  if (!yaoType) throw new Error(`铜钱数值异常: ${total}`);
  return { yaoIndex, coins, total, yaoType };
}

// ==================== 数字起卦 ====================

/**
 * 数字起卦
 *
 * 算法: 取用户输入的数字 + 当前时辰
 * - 如果是1个数: upper = num % 8, lower = (num + hourNum) % 8, 动爻 = (num + hourNum) % 6
 * - 如果是2个数: 拆成两个数字分别做上下卦
 */
export function divinateByNumber(
  numberInput: number,
  hour: number,
): YaoType[] {
  if (!Number.isInteger(numberInput) || numberInput < 1) {
    throw new Error('请输入大于0的正整数');
  }

  const hourZhi = getHourZhi(hour);
  const hourNum = ZHI_ORDER[hourZhi] || 1;

  const upperIdx = numberInput % 8;
  const lowerIdx = (numberInput + hourNum) % 8;
  const movingPos = ((numberInput + hourNum) % 6) || 6;

  const upperLines = XIANTIAN_TRIGRAM_LINES[upperIdx] ?? XIANTIAN_TRIGRAM_LINES[0];
  const lowerLines = XIANTIAN_TRIGRAM_LINES[lowerIdx] ?? XIANTIAN_TRIGRAM_LINES[0];
  const allLines = [...lowerLines, ...upperLines];

  return allLines.map((isYang, i) => {
    const pos = i + 1;
    if (pos === movingPos) {
      return isYang ? 'laoYang' : 'laoYin';
    }
    return isYang ? 'shaoYang' : 'shaoYin';
  });
}

// ==================== 手动起卦 ====================

/**
 * 手动起卦
 * 用户直接指定每一爻的老阳/少阳/少阴/老阴
 */
export function divinateByManual(rawYaoTypes: YaoType[]): YaoType[] {
  if (rawYaoTypes.length !== 6) {
    throw new Error('手动起卦需要指定6个爻');
  }
  const valid: YaoType[] = ['laoYang', 'shaoYang', 'shaoYin', 'laoYin'];
  for (const yt of rawYaoTypes) {
    if (!valid.includes(yt)) {
      throw new Error(`无效的爻类型: ${yt}`);
    }
  }
  return [...rawYaoTypes];
}

// ==================== 统一入口 ====================

/**
 * 根据配置执行起卦，返回六爻类型数组
 */
export function performDivination(config: LiuYaoConfig): YaoType[] {
  switch (config.method) {
    case 'time':
      return divinateByTime(config.year, config.month, config.day, config.hour);
    case 'coin':
      if (!config.coinResults || config.coinResults.length !== 6) {
        throw new Error('铜钱起卦需要6次投掷结果');
      }
      return divinateByCoin(config.coinResults);
    case 'number':
      if (!config.numberInput || config.numberInput < 1) {
        throw new Error('请输入有效的正整数');
      }
      return divinateByNumber(config.numberInput, config.hour);
    case 'manual':
      if (!config.rawYaoTypes || config.rawYaoTypes.length !== 6) {
        throw new Error('手动起卦需要指定6个爻');
      }
      return divinateByManual(config.rawYaoTypes);
    default:
      throw new Error(`不支持的起卦方式: ${config.method}`);
  }
}
