/**
 * 梅花易数 —— 三种起卦算法 + 卦象构建
 */
import { Solar } from 'lunar-javascript';
import type {
  Trigram, Hexagram, MovingLineInfo, DivinationResult,
  DivinationMethod, StrokeDetail,
} from './types';
import { TRIGRAMS, ZHI_TO_NUMBER, YAO_NAMES } from './constants';
import { HEXAGRAM_TABLE } from './hexagrams';
import { getTotalStrokes } from './kangxiStrokes';
import { DI_ZHI, getHourZhi } from '@/lib/lunar';

// ============================================================
//  核心工具函数
// ============================================================

/** 数字取卦：n % 8，余 0 视为 8（坤） */
export function numberToTrigram(n: number): Trigram {
  const r = n % 8;
  return TRIGRAMS[r === 0 ? 8 : r];
}

/** 数字取动爻：n % 6，余 0 视为 6 */
export function numberToMovingLine(n: number): number {
  const r = n % 6;
  return r === 0 ? 6 : r;
}

/** 由上下经卦组合成重卦 */
export function buildHexagram(upper: Trigram, lower: Trigram): Hexagram {
  const key = `${upper.number}-${lower.number}`;
  const data = HEXAGRAM_TABLE[key];
  if (!data) {
    throw new Error(`卦象数据未找到: 上${upper.name}(${upper.number}) 下${lower.name}(${lower.number})`);
  }
  const lines = [...lower.lines, ...upper.lines];
  return {
    upperTrigram: upper,
    lowerTrigram: lower,
    name: data.name,
    alias: data.alias,
    lines,
    guaCi: data.guaCi,
    yaoCi: [...data.yaoCi],
  };
}

/** 动爻反转生成变卦 */
export function buildChangedHexagram(original: Hexagram, movingPos: number): Hexagram {
  const newLines = [...original.lines];
  newLines[movingPos - 1] = !newLines[movingPos - 1];
  // 从新的六爻还原上下卦
  const lowerLines = newLines.slice(0, 3) as [boolean, boolean, boolean];
  const upperLines = newLines.slice(3, 6) as [boolean, boolean, boolean];
  const lower = findTrigramByLines(lowerLines);
  const upper = findTrigramByLines(upperLines);
  return buildHexagram(upper, lower);
}

/** 互卦：取 2/3/4 爻为下卦，3/4/5 爻为上卦（爻位从 1 起） */
export function buildMutualHexagram(original: Hexagram): Hexagram {
  const lines = original.lines; // [0]=初爻 ... [5]=上爻
  const lowerLines = [lines[1], lines[2], lines[3]] as [boolean, boolean, boolean];
  const upperLines = [lines[2], lines[3], lines[4]] as [boolean, boolean, boolean];
  const lower = findTrigramByLines(lowerLines);
  const upper = findTrigramByLines(upperLines);
  return buildHexagram(upper, lower);
}

/** 错卦：六爻全部阴阳反转 */
export function buildReversedHexagram(original: Hexagram): Hexagram {
  const newLines = original.lines.map((l) => !l);
  const lowerLines = newLines.slice(0, 3) as [boolean, boolean, boolean];
  const upperLines = newLines.slice(3, 6) as [boolean, boolean, boolean];
  const lower = findTrigramByLines(lowerLines);
  const upper = findTrigramByLines(upperLines);
  return buildHexagram(upper, lower);
}

/** 综卦：六爻上下颠倒 */
export function buildFlippedHexagram(original: Hexagram): Hexagram {
  const newLines = [...original.lines].reverse();
  const lowerLines = newLines.slice(0, 3) as [boolean, boolean, boolean];
  const upperLines = newLines.slice(3, 6) as [boolean, boolean, boolean];
  const lower = findTrigramByLines(lowerLines);
  const upper = findTrigramByLines(upperLines);
  return buildHexagram(upper, lower);
}

/** 根据三爻画反查经卦 */
function findTrigramByLines(lines: [boolean, boolean, boolean]): Trigram {
  for (const t of Object.values(TRIGRAMS)) {
    if (t.lines[0] === lines[0] && t.lines[1] === lines[1] && t.lines[2] === lines[2]) {
      return t;
    }
  }
  // 理论上不会到达——八卦覆盖了 3 位布尔值的全部 8 种组合
  const desc = lines.map((l) => (l ? '阳' : '阴')).join('');
  throw new Error(`卦象计算异常，请刷新页面后重试（内部参考：${desc}）`);
}

/** 构建动爻信息 */
function buildMovingLineInfo(hex: Hexagram, pos: number): MovingLineInfo {
  return {
    position: pos,
    positionName: YAO_NAMES[pos - 1],
    originalYao: hex.lines[pos - 1],
    changedYao: !hex.lines[pos - 1],
    yaoCi: hex.yaoCi[pos - 1],
  };
}

/** 确定体卦和用卦 */
function determineTiYong(original: Hexagram, movingPos: number): { ti: Trigram; yong: Trigram } {
  // 动爻在下卦(1-3)→下卦为用，上卦为体
  // 动爻在上卦(4-6)→上卦为用，下卦为体
  if (movingPos <= 3) {
    return { ti: original.upperTrigram, yong: original.lowerTrigram };
  }
  return { ti: original.lowerTrigram, yong: original.upperTrigram };
}

/** 组装完整结果 */
function assembleResult(
  method: DivinationMethod,
  question: string,
  upperNum: number,
  lowerNum: number,
  movingNum: number,
  extra?: { lunarDesc?: string; strokeDetails?: StrokeDetail[] },
): DivinationResult {
  const upper = numberToTrigram(upperNum);
  const lower = numberToTrigram(lowerNum);
  const movingPos = numberToMovingLine(movingNum);

  const original = buildHexagram(upper, lower);
  const changed = buildChangedHexagram(original, movingPos);
  const mutual = buildMutualHexagram(original);
  const reversed = buildReversedHexagram(original);
  const flipped = buildFlippedHexagram(original);
  const movingLine = buildMovingLineInfo(original, movingPos);
  const { ti, yong } = determineTiYong(original, movingPos);

  return {
    method,
    question,
    timestamp: new Date().toLocaleString('zh-CN'),
    upperNumber: upperNum,
    lowerNumber: lowerNum,
    movingNumber: movingNum,
    original,
    changed,
    mutual,
    reversed,
    flipped,
    movingLine,
    tiGua: ti,
    yongGua: yong,
    lunarDesc: extra?.lunarDesc,
    strokeDetails: extra?.strokeDetails,
  };
}

// ============================================================
//  三种起卦方式
// ============================================================

/**
 * 时间起卦
 * @param year 公历年
 * @param month 公历月
 * @param day 公历日
 * @param hour 小时 (0-23)
 * @param question 问事内容
 */
export function divinateByTime(
  year: number, month: number, day: number, hour: number,
  question: string,
): DivinationResult {
  // 公历转农历
  let solar, lunar;
  try {
    solar = Solar.fromYmd(year, month, day);
    lunar = solar.getLunar();
  } catch {
    throw new Error(`日期 ${year}-${month}-${day} 无效，请检查后重试`);
  }

  const lunarYear = lunar.getYear();
  const lunarMonth = Math.abs(lunar.getMonth()); // 取绝对值（闰月为负数）
  const lunarDay = lunar.getDay();

  // 年地支→序号
  const yearGanZhi = lunar.getYearInGanZhi();
  const yearZhi = yearGanZhi.charAt(1); // 取地支
  const yearNum = ZHI_TO_NUMBER[yearZhi] || 1;

  // 时辰地支→序号
  const hourZhi = getHourZhi(hour);
  const hourNum = ZHI_TO_NUMBER[hourZhi] || 1;

  // 梅花易数起卦公式
  const upperSum = yearNum + lunarMonth + lunarDay;
  const lowerSum = yearNum + lunarMonth + lunarDay + hourNum;
  const movingSum = lowerSum; // 动爻也用总和

  const lunarDesc = `农历${lunarYear}年${lunarMonth}月${lunarDay}日 ${hourZhi}时` +
    `（${yearGanZhi}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日）`;

  return assembleResult('time', question, upperSum, lowerSum, movingSum, { lunarDesc });
}

/**
 * 数字起卦
 */
export function divinateByNumber(
  upperNum: number, lowerNum: number, movingNum: number,
  question: string,
): DivinationResult {
  if (!Number.isInteger(upperNum) || !Number.isInteger(lowerNum) || !Number.isInteger(movingNum)) {
    throw new Error('请输入有效的整数');
  }
  if (upperNum < 1 || lowerNum < 1 || movingNum < 1) {
    throw new Error('请输入大于 0 的正整数');
  }
  return assembleResult('number', question, upperNum, lowerNum, movingNum);
}

/**
 * 生成随机起卦数字
 */
export function generateRandomNumbers(): { upper: number; lower: number; moving: number } {
  return {
    upper: Math.floor(Math.random() * 99) + 1,
    lower: Math.floor(Math.random() * 99) + 1,
    moving: Math.floor(Math.random() * 99) + 1,
  };
}

/**
 * 文字起卦
 */
export function divinateByText(text: string, question: string): DivinationResult {
  const chars = Array.from(text.replace(/\s/g, ''));
  if (chars.length === 0) {
    throw new Error('请输入至少一个汉字');
  }

  // 拆分前后半：奇数字时最后一个归后半
  const splitIndex = Math.floor(chars.length / 2);
  const upperChars = chars.slice(0, splitIndex || 1); // 至少 1 个字
  const lowerChars = splitIndex > 0 ? chars.slice(splitIndex) : chars;

  const upperResult = getTotalStrokes(upperChars.join(''));
  const lowerResult = getTotalStrokes(lowerChars.join(''));
  const totalStrokes = upperResult.total + lowerResult.total;

  const strokeDetails: StrokeDetail[] = [
    ...upperResult.details,
    ...lowerResult.details,
  ];

  return assembleResult(
    'text', question,
    upperResult.total, lowerResult.total, totalStrokes,
    { strokeDetails },
  );
}
