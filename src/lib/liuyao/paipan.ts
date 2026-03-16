/**
 * 六爻排盘系统 —— 10 步排盘管线
 *
 * Pipeline:
 * 1. 起卦 → 获取6爻类型
 * 2. 识卦 → 二进制查表定本卦
 * 3. 定宫 → 确定所属八宫
 * 4. 装纳甲 → 分配天干地支
 * 5. 排六亲 → 宫五行与爻五行推导
 * 6. 排六神 → 日干起始六神
 * 7. 定世应 → 世爻应爻标记
 * 8. 求伏神 → 缺失六亲补伏神
 * 9. 算旺衰 → 月建日辰旺衰 + 旬空月破
 * 10. 组变卦 → 动爻变后成变卦
 */

import type {
  LiuYaoConfig, LiuYaoResult, YaoLine, YaoType,
  FuShen, WuXing, BaGongHexagram, SixRelative,
} from './types';
import {
  isYangYao, isMovingYao, getChangedYang,
  getLiuShen, LIU_QIN_TABLE, ZHI_WUXING,
  calcYaoStrength, isXunKong, isYuePo,
  YAO_POSITION_NAMES, getYaoPositionName,
  NAJIA_GAN, NAJIA_ZHI, XUN_KONG_MAP,
} from './constants';
import { findHexagram, getPalaceHexagram } from './hexagramData';
import { assignNaJia, extractTrigrams } from './naJia';
import { performDivination } from './divination';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Solar } = require('lunar-javascript');

// ==================== 排盘主函数 ====================

/**
 * 完整排盘
 * @param config 起卦配置
 * @returns 排盘结果
 */
export function paipan(config: LiuYaoConfig): LiuYaoResult {
  // ── Step 1: 起卦 ──
  const rawYaoTypes = performDivination(config);

  // ── Step 2: 识卦 ──
  const benLines = rawYaoTypes.map(yt => isYangYao(yt));
  const benGua = findHexagram(benLines);
  if (!benGua) {
    throw new Error('无法识别卦象，请检查输入');
  }

  // ── Step 3: 定宫 ──
  const palace = benGua.palace;
  const palaceWuXing = benGua.palaceWuXing;

  // ── 获取四柱信息 ──
  const calInfo = getCalendarData(config.year, config.month, config.day, config.hour);

  // ── Step 4: 装纳甲 ──
  const naJiaData = assignNaJia(benLines, config.school);

  // ── Step 5: 排六亲 ──
  const liuQinList = naJiaData.map(d =>
    LIU_QIN_TABLE[palaceWuXing][d.zhiWuXing]
  );

  // ── Step 6: 排六神 ──
  const liuShenList = getLiuShen(calInfo.dayGan);

  // ── Step 7: 定世应 ──
  const shiPos = benGua.shiPosition;
  const yingPos = benGua.yingPosition;

  // ── Step 9: 算旺衰 + 旬空月破 ──
  const xunKongPair = XUN_KONG_MAP[calInfo.dayGanZhi] ?? ['', ''];

  // ── 组装本卦六爻 ──
  const yaoLines: YaoLine[] = rawYaoTypes.map((yaoType, i) => {
    const pos = i + 1;
    const isYang = isYangYao(yaoType);
    const isMoving = isMovingYao(yaoType);
    const { gan, zhi, zhiWuXing } = naJiaData[i];
    const ganZhi = gan + zhi;
    const liuQin = liuQinList[i];
    const liuShen = liuShenList[i];
    const strength = calcYaoStrength(calInfo.monthZhi, calInfo.dayZhi, zhi);
    const xunKong = isXunKong(calInfo.dayGanZhi, zhi);
    const yuePo = isYuePo(calInfo.monthZhi, zhi);

    // 变爻信息
    let changedZhi: string | undefined;
    let changedZhiWuXing: WuXing | undefined;
    let changedLiuQin: SixRelative | undefined;
    let changedGan: string | undefined;

    if (isMoving) {
      const changedYang = getChangedYang(yaoType);
      const changedBenLines = [...benLines];
      changedBenLines[i] = changedYang;
      // 变爻后的上下卦
      const changedTrigramLines = changedBenLines.slice(
        pos <= 3 ? 0 : 3,
        pos <= 3 ? 3 : 6,
      );
      const isOuter = pos > 3;
      const binStr = changedTrigramLines.map(l => l ? '1' : '0').join('');
      const JING_GUA_BINARY: Record<string, string> = {
        '111': '乾', '110': '兑', '101': '离', '100': '震',
        '011': '巽', '010': '坎', '001': '艮', '000': '坤',
      };
      const changedTrigramName = JING_GUA_BINARY[binStr] ?? '';
      if (changedTrigramName) {
        const posInTrigram = isOuter ? pos - 3 : pos;
        const zhiArr = NAJIA_ZHI[changedTrigramName];
        const ganPair = NAJIA_GAN[changedTrigramName];
        if (zhiArr && ganPair) {
          const idx = isOuter ? (posInTrigram - 1 + 3) : (posInTrigram - 1);
          changedZhi = zhiArr[idx];
          changedGan = isOuter ? ganPair[1] : ganPair[0];
          changedZhiWuXing = ZHI_WUXING[changedZhi] as WuXing;
          changedLiuQin = LIU_QIN_TABLE[palaceWuXing][changedZhiWuXing];
        }
      }
    }

    return {
      position: pos,
      positionName: getYaoPositionName(pos, isYang),
      yaoType,
      isYang,
      isMoving,
      gan,
      zhi,
      ganZhi,
      zhiWuXing,
      liuQin,
      liuShen,
      isShiYao: pos === shiPos,
      isYingYao: pos === yingPos,
      strength,
      isXunKong: xunKong,
      isYuePo: yuePo,
      changedZhi,
      changedZhiWuXing,
      changedLiuQin,
      changedGan,
    };
  });

  // ── Step 10: 组变卦 ──
  const hasChanged = rawYaoTypes.some(yt => isMovingYao(yt));
  let bianGuaName: string | undefined;
  let bianGuaAlias: string | undefined;
  let bianYaoLines: YaoLine[] | undefined;

  if (hasChanged) {
    const bianLines = rawYaoTypes.map((yt, i) => {
      if (isMovingYao(yt)) return getChangedYang(yt);
      return isYangYao(yt);
    });
    const bianGua = findHexagram(bianLines);
    if (bianGua) {
      bianGuaName = bianGua.name;
      bianGuaAlias = bianGua.alias;
      // 变卦纳甲
      const bianNaJia = assignNaJia(bianLines, config.school);
      bianYaoLines = bianLines.map((isYang, i) => {
        const pos = i + 1;
        const { gan, zhi, zhiWuXing } = bianNaJia[i];
        const liuQin = LIU_QIN_TABLE[palaceWuXing][zhiWuXing];
        return {
          position: pos,
          positionName: getYaoPositionName(pos, isYang),
          yaoType: (isYang ? 'shaoYang' : 'shaoYin') as YaoType,
          isYang,
          isMoving: false,
          gan,
          zhi,
          ganZhi: gan + zhi,
          zhiWuXing,
          liuQin,
          liuShen: liuShenList[i],
          isShiYao: false,
          isYingYao: false,
          strength: calcYaoStrength(calInfo.monthZhi, calInfo.dayZhi, zhi),
          isXunKong: isXunKong(calInfo.dayGanZhi, zhi),
          isYuePo: isYuePo(calInfo.monthZhi, zhi),
        };
      });
    }
  }

  // ── Step 8: 求伏神 ──
  const fuShenList = calcFuShen(yaoLines, palace, palaceWuXing, config.school);

  return {
    config,
    school: config.school,
    timestamp: new Date().toISOString(),
    lunarDesc: calInfo.lunarDesc,
    ganZhi: calInfo.ganZhi,
    dayGan: calInfo.dayGan,
    dayZhi: calInfo.dayZhi,
    monthZhi: calInfo.monthZhi,
    benGuaName: benGua.name,
    benGuaAlias: benGua.alias,
    palace,
    palaceWuXing,
    guaSequence: benGua.sequence,
    yaoLines,
    hasChanged,
    bianGuaName,
    bianGuaAlias,
    bianYaoLines,
    fuShenList,
    shiPosition: shiPos,
    yingPosition: yingPos,
    xunKongPair: xunKongPair as [string, string],
    rawYaoTypes,
  };
}

// ==================== 伏神计算 ====================

/**
 * 计算伏神
 *
 * 规则: 检查本卦六爻中是否缺少某种六亲
 * 如果缺失，则从本宫八纯卦中找到对应六亲的爻作为伏神
 */
function calcFuShen(
  yaoLines: YaoLine[],
  palaceName: string,
  palaceWuXing: WuXing,
  school: string,
): FuShen[] {
  // 收集本卦已有的六亲
  const existingLiuQin = new Set(yaoLines.map(y => y.liuQin));

  // 如果五种六亲都齐，无需伏神
  const allLiuQin: SixRelative[] = ['父母', '兄弟', '子孙', '妻财', '官鬼'];
  const missingLiuQin = allLiuQin.filter(lq => !existingLiuQin.has(lq));
  if (missingLiuQin.length === 0) return [];

  // 获取本宫八纯卦的纳甲
  const palaceGua = getPalaceHexagram(palaceName);
  if (!palaceGua) return [];

  const palaceNaJia = assignNaJia(palaceGua.lines, school as 'jingfang' | 'cangshanbu');

  const fuShenList: FuShen[] = [];

  for (const missing of missingLiuQin) {
    // 在本宫八纯卦中找对应六亲
    for (let i = 0; i < 6; i++) {
      const { gan, zhi, zhiWuXing } = palaceNaJia[i];
      const lq = LIU_QIN_TABLE[palaceWuXing][zhiWuXing];
      if (lq === missing) {
        const feiShenYao = yaoLines[i];
        const feiGanZhi = feiShenYao ? feiShenYao.ganZhi : '';

        // 飞伏关系
        const relation = describeRelation(palaceWuXing, zhiWuXing, feiShenYao?.zhiWuXing);

        fuShenList.push({
          liuQin: missing,
          position: i + 1,
          gan,
          zhi,
          ganZhi: gan + zhi,
          zhiWuXing,
          feiShenPosition: i + 1,
          feiShenGanZhi: feiGanZhi,
          relation,
        });
        break; // 每种缺失六亲只取第一个匹配
      }
    }
  }

  return fuShenList;
}

/**
 * 描述飞伏关系 (伏神五行 vs 飞神五行)
 */
function describeRelation(
  _palaceWx: WuXing,
  fuWx: WuXing,
  feiWx?: WuXing,
): string {
  if (!feiWx) return '无飞神';
  if (fuWx === feiWx) return '飞伏比和';

  const WX_SHENG: Record<string, string> = {
    '金': '水', '水': '木', '木': '火', '火': '土', '土': '金',
  };
  const WX_KE: Record<string, string> = {
    '金': '木', '木': '土', '土': '水', '水': '火', '火': '金',
  };

  if (WX_SHENG[feiWx] === fuWx) return '飞来生伏';
  if (WX_SHENG[fuWx] === feiWx) return '伏去生飞';
  if (WX_KE[feiWx] === fuWx) return '飞来克伏';
  if (WX_KE[fuWx] === feiWx) return '伏去克飞';
  return '飞伏无关';
}

// ==================== 历法辅助 ====================

interface CalendarData {
  ganZhi: { year: string; month: string; day: string; time: string };
  dayGan: string;
  dayZhi: string;
  dayGanZhi: string;
  monthZhi: string;
  lunarDesc: string;
}

function getCalendarData(
  year: number, month: number, day: number, hour: number,
): CalendarData {
  let solar, lunar;
  try {
    solar = Solar.fromYmd(year, month, day);
    lunar = solar.getLunar();
  } catch {
    throw new Error(`日期 ${year}-${month}-${day} 无效`);
  }

  const yearGZ = lunar.getYearInGanZhi();
  const monthGZ = lunar.getMonthInGanZhi();
  const dayGZ = lunar.getDayInGanZhi();
  const timeGZ = lunar.getTimeInGanZhi();

  const lunarMonth = lunar.getMonthInChinese();
  const lunarDay = lunar.getDayInChinese();
  const lunarYear = lunar.getYearInChinese();

  return {
    ganZhi: {
      year: yearGZ,
      month: monthGZ,
      day: dayGZ,
      time: timeGZ,
    },
    dayGan: dayGZ[0],
    dayZhi: dayGZ[1],
    dayGanZhi: dayGZ,
    monthZhi: monthGZ[1],
    lunarDesc: `农历${lunarYear}年${lunarMonth}月${lunarDay}`,
  };
}
