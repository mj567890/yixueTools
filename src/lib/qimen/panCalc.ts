/**
 * 奇门遁甲 —— 排盘核心流水线（9步算法）
 */

import type { PalaceId, PalaceState, QimenConfig, QimenResult, ZhiFuInfo, NineStar, EightGate, Spirit } from './types';
import {
  STEM_SEQUENCE, FORWARD_PALACE_ORDER, BACKWARD_PALACE_ORDER,
  EIGHT_GATES, STAR_BY_PALACE, GATE_BY_PALACE,
  SPIRITS_YANG, SPIRITS_YIN,
  XUN_SHOU_MAP, MA_STAR_MAP, PALACE_INFO,
} from './constants';
import { getPalaceSequence, getOffsetBetween, branchToPalace } from './jiuGong';
import { extractTimeElements, determineJu } from './timeCalc';

/**
 * 排盘主入口：根据配置计算完整的奇门盘
 */
export function calculateQimen(config: QimenConfig): QimenResult {
  const { year, month, day, hour, method, panType, question } = config;

  // Step 1: 提取时间要素
  const timeElements = extractTimeElements(year, month, day, hour);

  // Step 2: 定局
  const juInfo = determineJu(timeElements, method || 'chaiBu', year, month, day, hour);

  // Step 3: 布地盘天干
  const earthPlate = layoutEarthPlate(juInfo.juNumber, juInfo.dunType);

  // Step 4: 确定旬首、值符星、值使门
  const zhiFuInfo = findZhiFuZhiShi(timeElements.timeGanZhi, earthPlate);

  // Step 5: 转天盘（九星+天盘干）
  const { heavenPlate, starPlate } = rotateHeavenPlate(
    earthPlate, zhiFuInfo, timeElements.timeGan, juInfo.dunType,
  );

  // Step 6: 转八门
  const gatePlate = rotateGates(
    zhiFuInfo, timeElements.timeZhi, juInfo.dunType,
  );

  // Step 7: 排八神
  const spiritPlate = layoutSpirits(zhiFuInfo, juInfo.dunType, starPlate);

  // Step 8: 标记空亡和马星
  const voidBranches = XUN_SHOU_MAP[timeElements.timeGanZhi]?.voidPair || ['', ''];
  const horseBranch = MA_STAR_MAP[timeElements.dayZhi] || '';

  // Step 9: 组装结果
  const palaces = assemblePalaces(
    earthPlate, heavenPlate, starPlate, gatePlate, spiritPlate,
    voidBranches, horseBranch,
  );

  return {
    config: { year, month, day, hour, method, panType, question },
    timeElements,
    juInfo,
    zhiFuInfo,
    palaces,
    voidBranches: voidBranches as [string, string],
    horseBranch,
    timestamp: new Date().toISOString(),
  };
}

// ==================== Step 3: 布地盘天干 ====================

/**
 * 布地盘天干
 * STEM_SEQUENCE = [戊, 己, 庚, 辛, 壬, 癸, 丁, 丙, 乙]
 * 从局数宫开始，按阳遁顺行/阴遁逆行排入8个外宫
 * 第5个干（STEM_SEQUENCE[4]）属中5宫天禽，记录到5宫但逻辑寄坤2宫
 */
function layoutEarthPlate(
  juNumber: number,
  dunType: '阳遁' | '阴遁',
): Record<PalaceId, string> {
  const result: Record<number, string> = {};
  const order = dunType === '阳遁' ? FORWARD_PALACE_ORDER : BACKWARD_PALACE_ORDER;

  const startIdx = order.indexOf(juNumber as PalaceId);
  if (startIdx === -1) {
    throw new Error(`无效的局数: ${juNumber}`);
  }

  let stemIdx = 0;
  let palaceIdx = startIdx;

  // 前4个干排入前4个宫
  for (let i = 0; i < 4; i++) {
    result[order[palaceIdx % 8]] = STEM_SEQUENCE[stemIdx];
    stemIdx++;
    palaceIdx++;
  }

  // 第5个干是天禽5宫的干，记录到5宫
  result[5] = STEM_SEQUENCE[stemIdx];
  stemIdx++;

  // 后4个干排入后4个宫
  for (let i = 0; i < 4; i++) {
    result[order[palaceIdx % 8]] = STEM_SEQUENCE[stemIdx];
    stemIdx++;
    palaceIdx++;
  }

  return result as Record<PalaceId, string>;
}

// ==================== Step 4: 定旬首、值符、值使 ====================

/**
 * 确定旬首、值符星、值使门
 */
function findZhiFuZhiShi(
  timeGanZhi: string,
  earthPlate: Record<PalaceId, string>,
): ZhiFuInfo {
  // 1. 查旬首
  const xunInfo = XUN_SHOU_MAP[timeGanZhi];
  if (!xunInfo) {
    throw new Error(`无法找到 "${timeGanZhi}" 的旬首信息`);
  }

  const { xunShou, yinStem, voidPair: _vp } = xunInfo;

  // 2. 在地盘上找到隐仪所在的宫位
  let yinStemPalace: PalaceId = 1;
  for (let p = 1; p <= 9; p++) {
    if (earthPlate[p as PalaceId] === yinStem) {
      yinStemPalace = p as PalaceId;
      break;
    }
  }

  // 3. 值符星 = 隐仪所在宫的本宫星
  // 如果隐仪在5宫，值符星=天禽，实际寄到2宫处理
  let zhiFuPalace = yinStemPalace;
  if (zhiFuPalace === 5) zhiFuPalace = 2 as PalaceId;
  const zhiFuStar = STAR_BY_PALACE[zhiFuPalace];

  // 4. 值使门 = 值符星本宫对应的门
  const zhiShiGate = GATE_BY_PALACE[zhiFuPalace];

  return {
    xunShou,
    xunShouYin: yinStem,
    zhiFuStar,
    zhiShiGate,
    zhiFuOriginalPalace: zhiFuPalace,
  };
}

// ==================== Step 5: 转天盘 ====================

/**
 * 旋转天盘（星+天盘干一起旋转）
 * 值符星从本宫移动到时干所在的地盘宫位
 * 其余星按相同偏移量旋转
 */
function rotateHeavenPlate(
  earthPlate: Record<PalaceId, string>,
  zhiFuInfo: ZhiFuInfo,
  timeGan: string,
  dunType: '阳遁' | '阴遁',
): { heavenPlate: Record<PalaceId, string>; starPlate: Record<PalaceId, NineStar | null> } {
  const heavenPlate: Record<number, string> = {};
  const starPlate: Record<number, NineStar | null> = {};

  // 找到时干在地盘上的宫位
  let timeGanPalace: PalaceId = 1;
  for (let p = 1; p <= 9; p++) {
    if (earthPlate[p as PalaceId] === timeGan) {
      timeGanPalace = p as PalaceId;
      break;
    }
  }
  // 如果时干在5宫，寄到2宫
  if (timeGanPalace === 5) timeGanPalace = 2 as PalaceId;

  // 值符星从其本宫移动到时干宫位
  const zhiFuOriginal = zhiFuInfo.zhiFuOriginalPalace;
  const direction = 'forward'; // 天盘旋转统一按顺行计算偏移
  const offset = getOffsetBetween(zhiFuOriginal, timeGanPalace, direction);

  // 所有外宫星按同一偏移量旋转
  const order = FORWARD_PALACE_ORDER;
  for (let i = 0; i < 8; i++) {
    const originalPalace = order[i];
    const star = STAR_BY_PALACE[originalPalace];
    const targetPalace = order[(i + offset) % 8];

    starPlate[targetPalace] = star;
    // 天盘干 = 星从其原始宫位带出的地盘干
    heavenPlate[targetPalace] = earthPlate[originalPalace] || '';
  }

  // 5宫：天禽星寄到2宫
  starPlate[5] = null;
  heavenPlate[5] = earthPlate[5] || '';

  // 天禽星特殊处理：天禽随值符走（天禽寄宫的天盘干已在上面计算）
  // 如果天禽本应在某宫，它的天盘干用5宫地盘干
  // 但由于5宫被跳过，天禽实际跟随天芮（2宫星）一起移动
  // 这里已在旋转中自然处理

  return {
    heavenPlate: heavenPlate as Record<PalaceId, string>,
    starPlate: starPlate as Record<PalaceId, NineStar | null>,
  };
}

// ==================== Step 6: 转八门 ====================

/**
 * 旋转八门
 * 值使门移动到时支对应的宫位
 * 阳遁顺行，阴遁逆行
 */
function rotateGates(
  zhiFuInfo: ZhiFuInfo,
  timeZhi: string,
  dunType: '阳遁' | '阴遁',
): Record<PalaceId, EightGate | null> {
  const gatePlate: Record<number, EightGate | null> = {};

  // 值使门的原始宫位
  const zhiShiOriginal = zhiFuInfo.zhiShiGate.originalPalace;

  // 时支对应的目标宫位
  let targetPalace = branchToPalace(timeZhi);
  if (targetPalace === 5) targetPalace = 2 as PalaceId; // 5宫无门，寄2宫

  // 计算偏移
  const direction = dunType === '阳遁' ? 'forward' : 'backward';
  const offset = getOffsetBetween(zhiShiOriginal, targetPalace, direction);

  // 所有门按同一偏移量旋转
  const order = dunType === '阳遁' ? FORWARD_PALACE_ORDER : BACKWARD_PALACE_ORDER;
  for (const gate of EIGHT_GATES) {
    const originalIdx = order.indexOf(gate.originalPalace);
    if (originalIdx === -1) continue;
    const newPalace = order[(originalIdx + offset) % 8];
    gatePlate[newPalace] = gate;
  }

  // 5宫无门
  gatePlate[5] = null;

  return gatePlate as Record<PalaceId, EightGate | null>;
}

// ==================== Step 7: 排八神 ====================

/**
 * 排八神
 * 值符神在值符星旋转后所在的宫位
 * 阳遁按顺行排后续神，阴遁按逆行
 */
function layoutSpirits(
  zhiFuInfo: ZhiFuInfo,
  dunType: '阳遁' | '阴遁',
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

  // 选择八神序列
  const spirits = dunType === '阳遁' ? SPIRITS_YANG : SPIRITS_YIN;

  // 从值符星所在宫开始，按顺/逆行排列8个神
  const direction = dunType === '阳遁' ? 'forward' : 'backward';
  const palaceSeq = getPalaceSequence(zhiFuCurrentPalace, direction, 8);

  for (let i = 0; i < 8; i++) {
    spiritPlate[palaceSeq[i]] = spirits[i];
  }

  // 5宫无神
  spiritPlate[5] = null;

  return spiritPlate as Record<PalaceId, Spirit | null>;
}

// ==================== Step 9: 组装宫位 ====================

/**
 * 组装九宫完整状态
 */
function assemblePalaces(
  earthPlate: Record<PalaceId, string>,
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

    // 检查空亡
    const isVoid = info.branches.some(b => voidBranches.includes(b));

    // 检查马星
    const isHorseStar = info.branches.includes(horseBranch);

    palaces[pid] = {
      palaceId: pid,
      earthStem: earthPlate[pid] || '',
      heavenStem: heavenPlate[pid] || '',
      star: starPlate[pid] || null,
      gate: gatePlate[pid] || null,
      spirit: spiritPlate[pid] || null,
      isVoid,
      isHorseStar,
    };
  }

  return palaces as Record<PalaceId, PalaceState>;
}
