/**
 * 阳盘奇门遁甲 —— 排盘核心管线（10步算法）
 *
 * 完全独立的阳盘排盘引擎，支持寄宫参数化（寄坤2/寄艮8）
 * 不修改现有 panCalc.ts / luckingPaipan.ts 任何代码
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Solar: SolarYP } = require('lunar-javascript');

import type { PalaceId, JiGongType, YangpanConfig, YangpanPaiPanResult, YangpanPalaceState } from './types';
import {
  STEM_SEQUENCE, FORWARD_PALACE_ORDER, BACKWARD_PALACE_ORDER,
  EIGHT_GATES, STAR_BY_PALACE, GATE_BY_PALACE,
  SPIRITS_YANG, SPIRITS_YIN,
  XUN_SHOU_MAP, TIAN_GAN, DI_ZHI,
  BRANCH_TO_PALACE, PALACE_INFO,
} from './constants';
import { getPalaceSequence, getOffsetBetween } from './jiuGong';
import { determineYangpanJu } from './yangpanJuCalc';

// ==================== 工具函数 ====================

const RING = FORWARD_PALACE_ORDER; // [1, 8, 3, 4, 9, 2, 7, 6]

const STAR_NAMES = ['天蓬', '天芮', '天冲', '天辅', '天禽', '天心', '天柱', '天任', '天英'];
const GATE_NAMES: Record<number, string> = {
  1: '休门', 2: '死门', 3: '伤门', 4: '杜门',
  6: '开门', 7: '惊门', 8: '生门', 9: '景门',
};
const SPIRIT_NAMES_YANG = ['值符', '腾蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'];
const SPIRIT_NAMES_YIN = ['值符', '九天', '九地', '玄武', '白虎', '六合', '太阴', '腾蛇'];

/** 寄宫处理：5宫映射到jiGong指定宫 */
function resolveJi(palace: number, jiGong: JiGongType): PalaceId {
  return (palace === 5 ? jiGong : palace) as PalaceId;
}

// ==================== Step 1: 四柱提取 ====================

function extractFourPillars(year: number, month: number, day: number, hour: number) {
  const solar = SolarYP.fromYmdHms(year, month, day, hour, 0, 0);
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();
  ec.setSect(2);

  // 晚子时处理
  let dayGan: string, dayZhi: string;
  if (hour >= 23) {
    const nextDate = new Date(year, month - 1, day + 1);
    const nextSolar = SolarYP.fromYmdHms(
      nextDate.getFullYear(), nextDate.getMonth() + 1, nextDate.getDate(), 0, 0, 0,
    );
    const nextEc = nextSolar.getLunar().getEightChar();
    nextEc.setSect(2);
    dayGan = nextEc.getDayGan();
    dayZhi = nextEc.getDayZhi();
  } else {
    dayGan = ec.getDayGan();
    dayZhi = ec.getDayZhi();
  }

  // 农历描述
  const lunarYear = lunar.getYearShengXiao();
  const lunarMonth = lunar.getMonth();
  const lunarDay = lunar.getDay();
  const lunarDesc = `${lunarYear}年${String(Math.abs(lunarMonth)).padStart(2, '0')}月${String(lunarDay).padStart(2, '0')}日`;

  return {
    yearGZ: ec.getYearGan() + ec.getYearZhi(),
    monthGZ: ec.getMonthGan() + ec.getMonthZhi(),
    dayGZ: dayGan + dayZhi,
    timeGZ: ec.getTimeGan() + ec.getTimeZhi(),
    timeGan: ec.getTimeGan() as string,
    timeZhi: ec.getTimeZhi() as string,
    dayGan: dayGan as string,
    dayZhi: dayZhi as string,
    lunarDesc,
  };
}

// ==================== Step 3: 布地盘 ====================

/**
 * 布地盘天干（参数化寄宫版本）
 * STEM_SEQUENCE = [戊, 己, 庚, 辛, 壬, 癸, 丁, 丙, 乙]
 * 从局数宫开始，按阳遁顺行/阴遁逆行排入8个外宫
 * 第5个干属中5宫天禽，逻辑寄到jiGong宫
 */
function layoutEarthPlate(
  juNumber: number,
  dunType: '阳遁' | '阴遁',
  jiGong: JiGongType,
): Record<number, string> {
  const earth: Record<number, string> = {};
  const order = dunType === '阳遁' ? FORWARD_PALACE_ORDER : BACKWARD_PALACE_ORDER;

  const startIdx = order.indexOf(juNumber as PalaceId);
  if (startIdx === -1) {
    throw new Error(`无效的局数: ${juNumber}`);
  }

  let stemIdx = 0;
  let palaceIdx = startIdx;

  // 前4个干排入前4个宫
  for (let i = 0; i < 4; i++) {
    earth[order[palaceIdx % 8]] = STEM_SEQUENCE[stemIdx];
    stemIdx++;
    palaceIdx++;
  }

  // 第5个干是天禽5宫的干
  earth[5] = STEM_SEQUENCE[stemIdx];
  stemIdx++;

  // 后4个干排入后4个宫
  for (let i = 0; i < 4; i++) {
    earth[order[palaceIdx % 8]] = STEM_SEQUENCE[stemIdx];
    stemIdx++;
    palaceIdx++;
  }

  return earth;
}

// ==================== Step 4: 值符值使 ====================

function findZhiFuZhiShi(
  timeGZ: string,
  earth: Record<number, string>,
  jiGong: JiGongType,
): {
  xunShou: string;
  yinStem: string;
  voidPair: [string, string];
  zhiFuStar: string;
  zhiShiGate: string;
  xunShouPalace: number;
} {
  const xunInfo = XUN_SHOU_MAP[timeGZ];
  if (!xunInfo) throw new Error(`无法找到 "${timeGZ}" 的旬首信息`);

  const { xunShou, yinStem, voidPair } = xunInfo;

  // 旬首六仪在地盘的落宫
  let xunShouPalace = 0;
  for (let p = 1; p <= 9; p++) {
    if (earth[p] === yinStem) {
      xunShouPalace = p;
      break;
    }
  }

  // 值符星 = 旬首落宫的本位九星
  const zhiFuStar = STAR_NAMES[xunShouPalace - 1];

  // 中5宫寄到jiGong宫
  if (xunShouPalace === 5) xunShouPalace = jiGong;

  // 值使门 = 操作位宫的本位八门
  const zhiShiGate = GATE_NAMES[xunShouPalace] || GATE_NAMES[jiGong];

  return {
    xunShou, yinStem, voidPair,
    zhiFuStar, zhiShiGate,
    xunShouPalace,
  };
}

// ==================== Step 5: 天盘九星转盘 ====================

function rotateStar(
  xunShouPalace: number,
  timeGan: string,
  earth: Record<number, string>,
  jiGong: JiGongType,
): Record<number, string> {
  const starPlate: Record<number, string> = {};

  // 找时干在地盘的宫位
  let timeGanPalace: PalaceId = 1;
  for (let p = 1; p <= 9; p++) {
    if (earth[p] === timeGan) {
      timeGanPalace = p as PalaceId;
      break;
    }
  }
  timeGanPalace = resolveJi(timeGanPalace, jiGong);

  // 值符星从本宫到时干宫的偏移
  const fromPalace = resolveJi(xunShouPalace, jiGong);
  const fromIdx = RING.indexOf(fromPalace);
  const toIdx = RING.indexOf(timeGanPalace);
  const offset = (toIdx - fromIdx + 8) % 8;

  // 所有8颗外宫星按同一偏移旋转
  for (let i = 0; i < 8; i++) {
    const nativePalace = RING[i];
    const star = STAR_NAMES[nativePalace - 1];
    const newIdx = (i + offset) % 8;
    const newPalace = RING[newIdx];
    starPlate[newPalace] = star;
  }

  // 5宫固定天禽
  starPlate[5] = '天禽';

  return starPlate;
}

// ==================== Step 6: 天盘干 ====================

/**
 * 计算天盘干（星从原宫带来的地盘干）
 * 天禽寄宫：jiGong=2时天芮携带5宫干，jiGong=8时天任携带5宫干
 */
function computeHeavenStems(
  starPlate: Record<number, string>,
  earth: Record<number, string>,
  jiGong: JiGongType,
): Record<number, string> {
  const heavenStems: Record<number, string> = {};

  // 寄宫对应的本位星名
  const jiGongStar = STAR_NAMES[jiGong - 1]; // jiGong=2→天芮, jiGong=8→天任

  for (let p = 1; p <= 9; p++) {
    if (p === 5) {
      heavenStems[5] = '';
      continue;
    }
    const starName = starPlate[p];
    const nativePalace = STAR_NAMES.indexOf(starName) + 1;
    let stem = earth[nativePalace] || '';

    // 天禽寄宫处理：如果当前星是寄宫本位星，需合并5宫干
    if (starName === jiGongStar) {
      const stem5 = earth[5] || '';
      if (stem5 && stem5 !== stem) {
        stem = stem + stem5;
      }
    }

    heavenStems[p] = stem;
  }

  return heavenStems;
}

// ==================== Step 7: 八门转盘 ====================

/**
 * 阳盘八门转盘：值使门→时支对应宫位
 * 阳遁顺行，阴遁逆行（整体偏移式）
 */
function rotateGate(
  zhiShiGate: string,
  timeZhi: string,
  dunType: '阳遁' | '阴遁',
  jiGong: JiGongType,
): Record<number, string> {
  const gatePlate: Record<number, string> = {};

  // 值使门原始宫位
  let shiGatePalace = 0;
  for (const [p, g] of Object.entries(GATE_NAMES)) {
    if (g === zhiShiGate) { shiGatePalace = Number(p); break; }
  }
  if (shiGatePalace === 0) shiGatePalace = jiGong;

  // 时支→目标宫位
  let targetPalace = BRANCH_TO_PALACE[timeZhi] || 1;
  targetPalace = resolveJi(targetPalace, jiGong);

  // 计算偏移（阳遁顺行，阴遁逆行）
  const order = dunType === '阳遁' ? FORWARD_PALACE_ORDER : BACKWARD_PALACE_ORDER;
  const fromIdx = order.indexOf(shiGatePalace as PalaceId);
  const toIdx = order.indexOf(targetPalace as PalaceId);
  const offset = (toIdx - fromIdx + 8) % 8;

  // 所有八门旋转
  for (let i = 0; i < 8; i++) {
    const nativePalace = order[i];
    const gate = GATE_NAMES[nativePalace];
    if (!gate) continue;
    const newIdx = (i + offset) % 8;
    const newPalace = order[newIdx];
    gatePlate[newPalace] = gate;
  }

  gatePlate[5] = '';
  return gatePlate;
}

// ==================== Step 8: 八神排布 ====================

function rotateSpirit(
  starPlate: Record<number, string>,
  zhiFuStar: string,
  dunType: '阳遁' | '阴遁',
): Record<number, string> {
  const spiritPlate: Record<number, string> = {};
  const spirits = dunType === '阳遁' ? SPIRIT_NAMES_YANG : SPIRIT_NAMES_YIN;

  // 找值符星当前所在宫位
  let zhiFuPalace = 1;
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    if (starPlate[p] === zhiFuStar) { zhiFuPalace = p; break; }
  }

  // 从值符星所在宫起，阳遁顺行/阴遁逆行排列8个神
  const direction = dunType === '阳遁' ? 'forward' : 'backward';
  const palaceSeq = getPalaceSequence(zhiFuPalace as PalaceId, direction, 8);

  for (let i = 0; i < 8; i++) {
    spiritPlate[palaceSeq[i]] = spirits[i];
  }

  spiritPlate[5] = '';
  return spiritPlate;
}

// ==================== Step 9: 空亡与马星 ====================

function computeVoidAndHorse(
  voidPair: [string, string],
  timeZhi: string,
): { voidPalaces: number[]; horsePalace: number } {
  const voidPalaces: number[] = [];
  for (const z of voidPair) {
    const p = BRANCH_TO_PALACE[z];
    if (p && !voidPalaces.includes(p)) voidPalaces.push(p);
  }

  // 马星：时支三合局冲方
  const MA_MAP: Record<string, number> = {
    '申': 8, '子': 8, '辰': 8,
    '寅': 2, '午': 2, '戌': 2,
    '巳': 6, '酉': 6, '丑': 6,
    '亥': 4, '卯': 4, '未': 4,
  };
  const horsePalace = MA_MAP[timeZhi] || 0;

  return { voidPalaces, horsePalace };
}

// ==================== 主排盘函数 ====================

/**
 * 阳盘奇门遁甲排盘主入口
 */
export function calculateYangpan(config: YangpanConfig): YangpanPaiPanResult {
  const { year, month, day, hour, minute = 0, jiGong } = config;

  // Step 1: 提取四柱
  const fp = extractFourPillars(year, month, day, hour);

  // Step 2: 正统定局
  const juResult = determineYangpanJu(config);

  // Step 3: 时干处理（甲时用旬首六仪替代）
  const timeXunInfo = XUN_SHOU_MAP[fp.timeGZ];
  let effectiveTimeGan = fp.timeGan;
  if (effectiveTimeGan === '甲' && timeXunInfo) {
    effectiveTimeGan = timeXunInfo.yinStem;
  }

  // Step 4: 布地盘
  const earth = layoutEarthPlate(juResult.juNumber, juResult.dunType, jiGong);

  // Step 5: 定值符值使
  const zf = findZhiFuZhiShi(fp.timeGZ, earth, jiGong);

  // Step 6: 转天盘九星
  const starPlate = rotateStar(zf.xunShouPalace, effectiveTimeGan, earth, jiGong);

  // Step 7: 计算天盘干
  const heavenStems = computeHeavenStems(starPlate, earth, jiGong);

  // Step 8: 转八门
  const gatePlate = rotateGate(zf.zhiShiGate, fp.timeZhi, juResult.dunType, jiGong);

  // Step 9: 排八神
  const spiritPlate = rotateSpirit(starPlate, zf.zhiFuStar, juResult.dunType);

  // Step 10: 空亡与马星
  const { voidPalaces, horsePalace } = computeVoidAndHorse(zf.voidPair, fp.timeZhi);

  // 组装九宫数据
  const palaces: Record<number, YangpanPalaceState> = {};
  for (let p = 1; p <= 9; p++) {
    const pid = p as PalaceId;
    const info = PALACE_INFO[pid];
    const isVoid = voidPalaces.includes(p);
    const isHorse = p === horsePalace;

    // 地盘干显示：寄宫需合并5宫干
    let earthDisplay = earth[p] || '';
    if (p === jiGong) {
      const stem5 = earth[5] || '';
      if (stem5 && stem5 !== earth[p]) {
        earthDisplay = earth[p] + stem5;
      }
    }
    if (p === 5) earthDisplay = '';

    palaces[pid] = {
      palaceId: pid,
      earthStem: earthDisplay,
      heavenStem: heavenStems[p] || '',
      star: starPlate[p] || '',
      gate: gatePlate[p] || '',
      spirit: spiritPlate[p] || '',
      isVoid,
      isHorse,
    };
  }

  return {
    config,
    ganZhi: { year: fp.yearGZ, month: fp.monthGZ, day: fp.dayGZ, time: fp.timeGZ },
    lunarDesc: fp.lunarDesc,
    juResult,
    jiGong,
    palaces: palaces as Record<PalaceId, YangpanPalaceState>,
    zhiFuStar: zf.zhiFuStar,
    zhiShiGate: zf.zhiShiGate,
    xunShou: zf.xunShou,
    xunShouYin: zf.yinStem,
    voidPair: zf.voidPair,
    voidPalaces,
    horsePalace,
    timestamp: new Date().toISOString(),
  };
}
