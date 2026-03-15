/**
 * 王凤麟阴盘奇门遁甲 —— 独立排盘引擎
 *
 * 核心规则（精准排盘规则，1:1实现）：
 * 1. 无阳遁/阴遁之分，无节气定局、拆补法、置闰法
 * 2. 地盘元旦盘固定不变（核心基准）
 * 3. 值符星 = 旬首六仪在元旦盘的落宫 → 该宫本位九星
 * 4. 九星：值符星→时干落宫，其余顺行偏移
 * 5. 八门：值使门→时支落宫，其余逆行偏移
 * 6. 八神：值符→螣蛇→太阴→六合→白虎→玄武→九地→九天，顺行
 * 7. 天盘干：旬首六仪为起始，从值符星落宫顺行飞布
 * 8. 暗干/隐干：基于元旦盘交叉引用
 *
 * 参考：王凤麟《道家阴盘奇门遁甲》
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Solar } = require('lunar-javascript');

import type {
  PalaceId, PalaceState, QimenConfig, QimenResult,
  ZhiFuInfo, NineStar, EightGate, Spirit, TimeElements,
} from './types';
import {
  STEM_SEQUENCE, FORWARD_PALACE_ORDER, BACKWARD_PALACE_ORDER,
  EIGHT_GATES, STAR_BY_PALACE, GATE_BY_PALACE,
  SPIRITS_YINPAN, XUN_SHOU_MAP, MA_STAR_MAP, PALACE_INFO,
  YUAN_DAN_EARTH, STEM_TO_PALACE,
} from './constants';
import { getOffsetBetween, branchToPalace } from './jiuGong';
import { toTrueSolarTime } from './trueSolarTime';

// ==================== 主入口 ====================

/**
 * 王凤麟阴盘奇门排盘主入口
 */
export function calculateYinPan(config: QimenConfig): QimenResult {
  const {
    year, month, day, hour, question, yearMing,
    minute = 0,
    longitude = 120,
    useTrueSolarTime = true,
  } = config;

  // Step 0: 真太阳时修正
  let effectiveYear = year;
  let effectiveMonth = month;
  let effectiveDay = day;
  let effectiveHour = hour;
  let trueSolarDesc = '';
  let trueSolarCorrection = 0;

  if (useTrueSolarTime) {
    const tst = toTrueSolarTime(year, month, day, hour, minute, longitude);
    effectiveYear = tst.year;
    effectiveMonth = tst.month;
    effectiveDay = tst.day;
    effectiveHour = tst.hour;
    trueSolarCorrection = tst.totalCorrection;

    const pad = (n: number) => String(n).padStart(2, '0');
    const original = `${pad(hour)}:${pad(minute)}`;
    const corrected = `${pad(tst.hour)}:${pad(tst.minute)}`;
    if (original !== corrected || day !== tst.day) {
      trueSolarDesc = `${original} → ${corrected}（真太阳时，修正${tst.totalCorrection > 0 ? '+' : ''}${tst.totalCorrection}分）`;
    } else {
      trueSolarDesc = `${corrected}（真太阳时，修正量${tst.totalCorrection}分）`;
    }
  }

  // Step 1: 提取时间四柱（使用修正后的时间）
  const timeElements = extractYinPanTime(
    effectiveYear, effectiveMonth, effectiveDay, effectiveHour,
  );
  timeElements.usedTrueSolarTime = useTrueSolarTime;
  timeElements.trueSolarTimeCorrection = trueSolarCorrection;
  timeElements.trueSolarTimeDesc = trueSolarDesc;

  // Step 2: 确定旬首信息
  const timeXunInfo = XUN_SHOU_MAP[timeElements.timeGanZhi];
  if (!timeXunInfo) {
    throw new Error(`无法找到「${timeElements.timeGanZhi}」的旬首信息`);
  }

  // Step 3: 确定值符星、值使门（旬首六仪→元旦盘→本位星/门）
  const zhiFuInfo = findYinPanZhiFu(timeElements.timeGanZhi, timeXunInfo.yinStem);

  // Step 4: 九星排布（值符星→时干落宫，其余顺行偏移）
  const effectiveTimeGan = timeElements.timeGan === '甲'
    ? timeXunInfo.yinStem
    : timeElements.timeGan;
  const starPlate = rotateYinPanStars(zhiFuInfo, effectiveTimeGan);

  // Step 5: 天盘干排布（旬首六仪为起始，从值符星落宫顺行飞布）
  const heavenPlate = layoutYinPanHeavenStems(
    timeXunInfo.yinStem, effectiveTimeGan, zhiFuInfo,
  );

  // Step 6: 八门排布（值使门→时支落宫，逆行偏移）
  const gatePlate = rotateYinPanGates(zhiFuInfo, timeElements.timeZhi);

  // Step 7: 八神排布（值符→螣蛇→...→九天，顺行）
  const spiritPlate = layoutYinPanSpirits(zhiFuInfo, starPlate);

  // Step 8: 空亡取日干支旬空，马星取时支定马
  const dayXunInfo = XUN_SHOU_MAP[timeElements.dayGanZhi];
  const voidBranches: [string, string] = dayXunInfo?.voidPair || ['', ''];
  const horseBranch = MA_STAR_MAP[timeElements.timeZhi] || '';

  // Step 9: 组装九宫完整状态
  const palaces = assembleYinPanPalaces(
    heavenPlate, starPlate, gatePlate, spiritPlate,
    voidBranches, horseBranch,
  );

  return {
    config: {
      year, month, day, hour, minute,
      panType: 'yinPan', question, yearMing,
      longitude, useTrueSolarTime,
    },
    timeElements,
    zhiFuInfo,
    palaces,
    voidBranches,
    horseBranch,
    timestamp: new Date().toISOString(),
  };
}

// ==================== Step 1: 时间提取 ====================

function extractYinPanTime(
  year: number, month: number, day: number, hour: number,
): TimeElements {
  const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  // setSect(2): 子时换日 —— 23:00起算新一天的日柱和时柱
  eightChar.setSect(2);

  const yearGan = eightChar.getYearGan();
  const yearZhi = eightChar.getYearZhi();
  const monthGan = eightChar.getMonthGan();
  const monthZhi = eightChar.getMonthZhi();
  const dayGan = eightChar.getDayGan();
  const dayZhi = eightChar.getDayZhi();
  const timeGan = eightChar.getTimeGan();
  const timeZhi = eightChar.getTimeZhi();

  const prevJie = lunar.getPrevJie();
  const nextJie = lunar.getNextJie();
  const lunarDesc = `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;

  return {
    yearGanZhi: yearGan + yearZhi,
    monthGanZhi: monthGan + monthZhi,
    dayGanZhi: dayGan + dayZhi,
    timeGanZhi: timeGan + timeZhi,
    yearGan, yearZhi, monthGan, monthZhi,
    dayGan, dayZhi, timeGan, timeZhi,
    currentJie: prevJie?.getName() || '',
    currentJieDate: prevJie?.getSolar().toYmd() || '',
    nextJie: nextJie?.getName() || '',
    nextJieDate: nextJie?.getSolar().toYmd() || '',
    lunarDesc,
  };
}

// ==================== Step 3: 定值符值使 ====================

/**
 * 确定值符星、值使门
 * 王凤麟阴盘规则：
 *   旬首六仪 → 在元旦盘中找到对应宫位 → 该宫本位九星 = 值符星
 *   值使门 = 值符星本宫对应的本宫门
 */
function findYinPanZhiFu(
  timeGanZhi: string,
  xunShouYinStem: string,
): ZhiFuInfo {
  const xunInfo = XUN_SHOU_MAP[timeGanZhi];
  if (!xunInfo) {
    throw new Error(`无法找到「${timeGanZhi}」的旬首信息`);
  }

  const { xunShou, yinStem } = xunInfo;

  // 旬首六仪在元旦盘中的宫位
  let zhiFuPalace = STEM_TO_PALACE[xunShouYinStem];
  if (!zhiFuPalace) {
    throw new Error(`六仪「${xunShouYinStem}」无对应宫位`);
  }
  // 5宫寄2宫
  if (zhiFuPalace === 5) zhiFuPalace = 2 as PalaceId;

  // 值符星 = 该宫本位九星
  const zhiFuStar = STAR_BY_PALACE[zhiFuPalace];

  // 值使门 = 值符星本宫对应的门
  const zhiShiGate = GATE_BY_PALACE[zhiFuPalace];

  return {
    xunShou,
    xunShouYin: yinStem,
    zhiFuStar,
    zhiShiGate,
    zhiFuOriginalPalace: zhiFuPalace,
  };
}

// ==================== Step 4: 九星排布 ====================

/**
 * 九星排布（杜绝伏吟的核心规则）
 * 步骤1：值符星从本位宫→时干在元旦盘的落宫
 * 步骤2：其余8颗星保持相对位置，整体顺行偏移
 */
function rotateYinPanStars(
  zhiFuInfo: ZhiFuInfo,
  effectiveTimeGan: string,
): Record<PalaceId, NineStar | null> {
  const starPlate: Record<number, NineStar | null> = {};

  // 时干在元旦盘的落宫（目标宫位）
  let targetPalace = STEM_TO_PALACE[effectiveTimeGan];
  if (!targetPalace) {
    throw new Error(`时干「${effectiveTimeGan}」无对应宫位`);
  }
  if (targetPalace === 5) targetPalace = 2 as PalaceId;

  // 值符星从本位宫到目标宫位的顺行偏移
  const zhiFuOriginal = zhiFuInfo.zhiFuOriginalPalace;
  const offset = getOffsetBetween(zhiFuOriginal, targetPalace, 'forward');

  // 所有外宫星按同一偏移顺行旋转
  const order = FORWARD_PALACE_ORDER;
  for (let i = 0; i < 8; i++) {
    const originalPalace = order[i];
    const star = STAR_BY_PALACE[originalPalace];
    const newPalace = order[(i + offset) % 8];
    starPlate[newPalace] = star;
  }

  // 5宫无星
  starPlate[5] = null;

  return starPlate as Record<PalaceId, NineStar | null>;
}

// ==================== Step 5: 天盘干排布 ====================

/**
 * 天盘干独立排布（王凤麟阴盘规则）
 * 以旬首六仪为起始干，从值符星最终落宫起，沿九宫顺行飞布
 * STEM_SEQUENCE = [戊, 己, 庚, 辛, 壬, 癸, 丁, 丙, 乙]
 */
function layoutYinPanHeavenStems(
  xunShouYinStem: string,
  effectiveTimeGan: string,
  zhiFuInfo: ZhiFuInfo,
): Record<PalaceId, string> {
  const heavenPlate: Record<number, string> = {};

  // 旬首六仪在 STEM_SEQUENCE 中的起始索引
  const startStemIdx = STEM_SEQUENCE.indexOf(xunShouYinStem);
  if (startStemIdx === -1) {
    throw new Error(`六仪「${xunShouYinStem}」不在天干序列中`);
  }

  // 值符星最终落宫（即时干在元旦盘的落宫）
  let startPalace = STEM_TO_PALACE[effectiveTimeGan];
  if (!startPalace) {
    throw new Error(`时干「${effectiveTimeGan}」无对应宫位`);
  }
  if (startPalace === 5) startPalace = 2 as PalaceId;

  // 从值符星落宫起，按顺行方向飞布9个天干
  const order = FORWARD_PALACE_ORDER;
  const startPalaceIdx = order.indexOf(startPalace);
  if (startPalaceIdx === -1) {
    throw new Error(`起始宫 ${startPalace} 不在顺行序列中`);
  }

  let stemIdx = startStemIdx;
  let palaceIdx = startPalaceIdx;

  // 前4个干排入前4个外宫
  for (let i = 0; i < 4; i++) {
    heavenPlate[order[palaceIdx % 8]] = STEM_SEQUENCE[stemIdx % 9];
    stemIdx++;
    palaceIdx++;
  }

  // 第5个干归中5宫
  heavenPlate[5] = STEM_SEQUENCE[stemIdx % 9];
  stemIdx++;

  // 后4个干排入后4个外宫
  for (let i = 0; i < 4; i++) {
    heavenPlate[order[palaceIdx % 8]] = STEM_SEQUENCE[stemIdx % 9];
    stemIdx++;
    palaceIdx++;
  }

  return heavenPlate as Record<PalaceId, string>;
}

// ==================== Step 6: 八门排布 ====================

/**
 * 八门排布（杜绝伏吟的核心规则）
 * 步骤1：值使门从本位宫→时支在元旦盘的落宫
 * 步骤2：其余7门保持相对位置，整体逆行偏移
 */
function rotateYinPanGates(
  zhiFuInfo: ZhiFuInfo,
  timeZhi: string,
): Record<PalaceId, EightGate | null> {
  const gatePlate: Record<number, EightGate | null> = {};

  const zhiShiOriginal = zhiFuInfo.zhiShiGate.originalPalace;

  // 时支对应的宫位
  let targetPalace = branchToPalace(timeZhi);
  if (targetPalace === 5) targetPalace = 2 as PalaceId;

  // 逆行偏移
  const offset = getOffsetBetween(zhiShiOriginal, targetPalace, 'backward');

  const order = BACKWARD_PALACE_ORDER;
  for (const gate of EIGHT_GATES) {
    const originalIdx = order.indexOf(gate.originalPalace);
    if (originalIdx === -1) continue;
    const newPalace = order[(originalIdx + offset) % 8];
    gatePlate[newPalace] = gate;
  }

  gatePlate[5] = null;

  return gatePlate as Record<PalaceId, EightGate | null>;
}

// ==================== Step 7: 八神排布 ====================

/**
 * 八神排布（王凤麟阴盘规则）
 * 值符→螣蛇→太阴→六合→白虎→玄武→九地→九天
 * 从值符星最终落宫起，沿九宫顺行方向飞布
 */
function layoutYinPanSpirits(
  zhiFuInfo: ZhiFuInfo,
  starPlate: Record<PalaceId, NineStar | null>,
): Record<PalaceId, Spirit | null> {
  const spiritPlate: Record<number, Spirit | null> = {};

  // 找到值符星当前所在的宫位
  let zhiFuCurrentPalace: PalaceId = 1;
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const star = starPlate[p as PalaceId];
    if (star && star.name === zhiFuInfo.zhiFuStar.name) {
      zhiFuCurrentPalace = p as PalaceId;
      break;
    }
  }

  // 王凤麟阴盘八神：顺行排列
  const order = FORWARD_PALACE_ORDER;
  const startIdx = order.indexOf(zhiFuCurrentPalace);
  const effectiveStartIdx = startIdx === -1 ? order.indexOf(2 as PalaceId) : startIdx;

  for (let i = 0; i < 8; i++) {
    spiritPlate[order[(effectiveStartIdx + i) % 8]] = SPIRITS_YINPAN[i];
  }

  spiritPlate[5] = null;

  return spiritPlate as Record<PalaceId, Spirit | null>;
}

// ==================== Step 9: 组装宫位 ====================

function assembleYinPanPalaces(
  heavenPlate: Record<PalaceId, string>,
  starPlate: Record<PalaceId, NineStar | null>,
  gatePlate: Record<PalaceId, EightGate | null>,
  spiritPlate: Record<PalaceId, Spirit | null>,
  voidBranches: [string, string],
  horseBranch: string,
): Record<PalaceId, PalaceState> {
  const palaces: Record<number, PalaceState> = {};

  for (let p = 1; p <= 9; p++) {
    const pid = p as PalaceId;
    const info = PALACE_INFO[pid];

    const isVoid = info.branches.some(b => voidBranches.includes(b));
    const isHorseStar = info.branches.includes(horseBranch);

    palaces[pid] = {
      palaceId: pid,
      earthStem: YUAN_DAN_EARTH[pid],     // 地盘干：固定元旦盘
      heavenStem: heavenPlate[pid] || '',  // 天盘干：独立飞布
      star: starPlate[pid] || null,
      gate: gatePlate[pid] || null,
      spirit: spiritPlate[pid] || null,
      isVoid,
      isHorseStar,
    };
  }

  return palaces as Record<PalaceId, PalaceState>;
}
