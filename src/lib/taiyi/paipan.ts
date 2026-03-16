/**
 * 太乙神数 —— 排盘核心管线（12步）
 * 据《太乙金镜式经》《太乙统宗宝鉴》编纂
 *
 * 流程：
 * Step 1 : 提取四柱干支
 * Step 2 : 计算太乙积年
 * Step 3 : 太乙落宫
 * Step 4 : 计神落宫
 * Step 5 : 文昌落宫
 * Step 6 : 始击落宫
 * Step 7 : 十六神排布
 * Step 8 : 主客大将
 * Step 9 : 主算 / 客算 / 定算
 * Step 10: 三基 / 五福 / 四神
 * Step 11: 阳九百六（仅年计）
 * Step 12: 组装九宫状态
 */

import type {
  TaiyiConfig, TaiyiResult, TaiyiPalaceId, TaiyiPalaceState,
  SpiritPosition, GeneralInfo, SanJi, WuFu, SiShen, YangJiuBaiLiu,
  GanZhiSet, WuXing, CalcType,
} from './types';
import {
  TAIYI_PALACE_INFO, SIXTEEN_SPIRITS, GAN_TO_PALACE,
  ZHU_JIANG_CALC, TIAN_GAN, GAN_WX, ZHI_TO_PALACE,
  YANG_JIU_PERIOD, YANG_JIU_BAI_LIU_SEGMENTS,
  getXunKong,
} from './constants';
import { extractFourPillars, getShiChenIndex } from './timeCalc';
import { getTaiyiStrategy } from './schools';

/* ===== 主入口 ===== */

/**
 * 太乙排盘完整计算
 */
export function calculateTaiyi(config: TaiyiConfig): TaiyiResult {
  const debugLines: string[] = [];
  const strategy = getTaiyiStrategy(config.school);

  // ── Step 1: 提取四柱干支 ────────────────────────
  const { ganZhi, lunarDesc } = extractFourPillars(
    config.year, config.month, config.day, config.hour,
  );
  debugLines.push('【Step 1】四柱干支');
  debugLines.push(`  年柱: ${ganZhi.year}  月柱: ${ganZhi.month}  日柱: ${ganZhi.day}  时柱: ${ganZhi.time}`);
  debugLines.push(`  ${lunarDesc}`);

  // ── Step 2: 计算太乙积年 ────────────────────────
  const jiNianResult = strategy.calcJiNian(
    config.year, config.month, config.day, config.hour, config.calcType,
  );
  debugLines.push('【Step 2】太乙积年');
  debugLines.push(`  ${jiNianResult.debugInfo.split('\n').join('\n  ')}`);

  const jiNian = jiNianResult.jiNian;

  // ── Step 3: 太乙落宫 ────────────────────────
  const taiyiPalace = strategy.getTaiyiPalace(jiNian);
  debugLines.push('【Step 3】太乙落宫');
  debugLines.push(`  积年 ${jiNian} → 太乙在 ${TAIYI_PALACE_INFO[taiyiPalace].name}(${taiyiPalace}宫)`);

  // ── Step 4: 计神落宫 ────────────────────────
  const jiShenPalace = strategy.getJiShenPalace(jiNian);
  debugLines.push('【Step 4】计神落宫');
  debugLines.push(`  积年 ${jiNian} → 计神在 ${TAIYI_PALACE_INFO[jiShenPalace].name}(${jiShenPalace}宫)`);

  // ── Step 5: 文昌落宫 ────────────────────────
  const wenChangPalace = strategy.getWenChangPalace(jiNian);
  debugLines.push('【Step 5】文昌落宫');
  debugLines.push(`  积年 ${jiNian} → 文昌在 ${TAIYI_PALACE_INFO[wenChangPalace].name}(${wenChangPalace}宫)`);

  // ── Step 6: 始击落宫 ────────────────────────
  const shiJiPalace = calcShiJiPalace(ganZhi, config.calcType);
  debugLines.push('【Step 6】始击落宫');
  debugLines.push(`  始击在 ${TAIYI_PALACE_INFO[shiJiPalace].name}(${shiJiPalace}宫)`);

  // ── Step 7: 十六神排布 ────────────────────────
  const spirits = placeSixteenSpirits(taiyiPalace, jiShenPalace, wenChangPalace, shiJiPalace);
  debugLines.push('【Step 7】十六神排布');
  spirits.forEach(s => {
    debugLines.push(`  ${s.name}(${s.category}) → ${TAIYI_PALACE_INFO[s.palace].name}`);
  });

  // ── Step 8: 主客大将 ────────────────────────
  const zhuJiang = calcZhuJiang(ganZhi, config.calcType);
  const keJiang = calcKeJiang(jiNian);
  debugLines.push('【Step 8】主客大将');
  debugLines.push(`  主大将: ${zhuJiang.name} → ${TAIYI_PALACE_INFO[zhuJiang.palace].name}(${zhuJiang.element})`);
  debugLines.push(`  客大将: ${keJiang.name} → ${TAIYI_PALACE_INFO[keJiang.palace].name}(${keJiang.element})`);

  // ── Step 9: 主算 / 客算 / 定算 ────────────────
  const zhuSuan = strategy.calcZhuSuan(jiNian);
  const keSuan = strategy.calcKeSuan(jiNian);
  const dingSuan = Math.abs(zhuSuan - keSuan);
  debugLines.push('【Step 9】主算/客算/定算');
  debugLines.push(`  主算: ${zhuSuan}  客算: ${keSuan}  定算: |${zhuSuan}-${keSuan}| = ${dingSuan}`);

  // ── Step 10: 三基 / 五福 / 四神 ────────────────
  const sanJi = calcSanJi(ganZhi);
  const wuFu = calcWuFu(taiyiPalace, shiJiPalace, keJiang.palace);
  const siShen = calcSiShen(ganZhi, taiyiPalace);
  debugLines.push('【Step 10】三基/五福/四神');
  debugLines.push(`  岁基: ${sanJi.suiJi.gan}→${sanJi.suiJi.palace}宫  月基: ${sanJi.yueJi.gan}→${sanJi.yueJi.palace}宫  日基: ${sanJi.riJi.gan}→${sanJi.riJi.palace}宫`);
  debugLines.push(`  五福: 君${wuFu.junJi}宫 臣${wuFu.chenJi}宫 民${wuFu.minJi}宫 始击${wuFu.shiJiGong}宫 客${wuFu.keGong}宫`);

  // ── Step 11: 阳九百六（仅年计） ────────────────
  let yangJiuBaiLiu: YangJiuBaiLiu | undefined;
  if (config.calcType === 'year') {
    yangJiuBaiLiu = calcYangJiuBaiLiu(jiNian);
    debugLines.push('【Step 11】阳九百六');
    debugLines.push(`  ${yangJiuBaiLiu.cycleName} (${yangJiuBaiLiu.limitType})  位置: 第${yangJiuBaiLiu.positionInCycle}年`);
    debugLines.push(`  ${yangJiuBaiLiu.description}`);
  } else {
    debugLines.push('【Step 11】阳九百六（非年计，跳过）');
  }

  // ── Step 12: 组装九宫状态 ────────────────────────
  const palaces = assemblePalaces(
    taiyiPalace, jiShenPalace, wenChangPalace, shiJiPalace,
    spirits, zhuJiang, keJiang, ganZhi,
  );
  debugLines.push('【Step 12】九宫状态组装完成');

  return {
    config,
    timestamp: new Date().toISOString(),
    ganZhi,
    lunarDesc,
    jiNianResult,
    palaces,
    taiyiPalace,
    jiShenPalace,
    wenChangPalace,
    shiJiPalace,
    spirits,
    zhuSuan,
    keSuan,
    dingSuan,
    zhuJiang,
    keJiang,
    sanJi,
    wuFu,
    siShen,
    yangJiuBaiLiu,
    debugInfo: debugLines.join('\n'),
  };
}

/* ===== 内部算法函数 ===== */

/**
 * Step 6: 始击落宫
 * 始击由日干确定（年计用年干，月计用月干……）
 */
function calcShiJiPalace(ganZhi: GanZhiSet, calcType: CalcType): TaiyiPalaceId {
  const ganZhiKey = ZHU_JIANG_CALC[calcType]; // year|month|day|time
  const gz = ganZhi[ganZhiKey]; // e.g. '甲子'
  const gan = gz[0]; // 甲
  return GAN_TO_PALACE[gan] || (1 as TaiyiPalaceId);
}

/**
 * Step 7: 十六神排布
 *
 * 简化规则：
 * - 天乙 随太乙同宫
 * - 地乙 落太乙对冲宫
 * - 直符 落计神宫
 * - 文昌 落文昌宫
 * - 始击 落始击宫
 * - 客  落客大将所推宫（这里暂用计神宫）
 * - 主  落主大将所推宫（这里暂用太乙宫）
 * - 定  落文昌对冲
 * - 八间神按照正神顺序、各偏移一宫排布
 */
function placeSixteenSpirits(
  taiyiPalace: TaiyiPalaceId,
  jiShenPalace: TaiyiPalaceId,
  wenChangPalace: TaiyiPalaceId,
  shiJiPalace: TaiyiPalaceId,
): SpiritPosition[] {
  const positions: SpiritPosition[] = [];

  // 对冲宫映射
  const opposite: Record<TaiyiPalaceId, TaiyiPalaceId> = {
    1: 7, 2: 8, 3: 9, 4: 6, 5: 5, 6: 4, 7: 1, 8: 2, 9: 3,
  };

  // 八正神落宫
  const zhengShenPalaces: TaiyiPalaceId[] = [
    taiyiPalace,             // 天乙 → 随太乙
    opposite[taiyiPalace],   // 地乙 → 太乙对冲
    jiShenPalace,            // 直符 → 计神宫
    wenChangPalace,          // 文昌 → 文昌宫
    shiJiPalace,             // 始击 → 始击宫
    jiShenPalace,            // 客 → 计神宫（客随计神）
    taiyiPalace,             // 主 → 太乙宫（主随太乙）
    opposite[wenChangPalace],// 定 → 文昌对冲
  ];

  const zhengShenDefs = SIXTEEN_SPIRITS.filter(s => s.category === '正神');
  zhengShenDefs.forEach((def, i) => {
    positions.push({
      name: def.name,
      category: '正神',
      palace: zhengShenPalaces[i],
      element: def.element,
      auspice: def.auspice,
    });
  });

  // 八间神落宫：依次在对应正神宫位基础上 +1 偏移（跳5）
  const route = [1, 2, 3, 4, 6, 7, 8, 9] as TaiyiPalaceId[];
  const jianShenDefs = SIXTEEN_SPIRITS.filter(s => s.category === '间神');
  jianShenDefs.forEach((def, i) => {
    const basePalace = zhengShenPalaces[i];
    const baseIdx = route.indexOf(basePalace);
    const nextIdx = (baseIdx + 1) % route.length;
    positions.push({
      name: def.name,
      category: '间神',
      palace: route[nextIdx],
      element: def.element,
      auspice: def.auspice,
    });
  });

  return positions;
}

/**
 * Step 8a: 主大将
 * 年计取年干，月计取月干，日计取日干，时计取时干
 */
function calcZhuJiang(ganZhi: GanZhiSet, calcType: CalcType): GeneralInfo {
  const ganZhiKey = ZHU_JIANG_CALC[calcType];
  const gz = ganZhi[ganZhiKey];
  const gan = gz[0];
  const palace = GAN_TO_PALACE[gan] || (1 as TaiyiPalaceId);
  const element = GAN_WX[gan] || '土';
  return { name: gan, palace, element: element as WuXing };
}

/**
 * Step 8b: 客大将
 * 由太乙积年取天干
 */
function calcKeJiang(jiNian: number): GeneralInfo {
  const idx = ((jiNian % 10) + 10) % 10;
  const gan = TIAN_GAN[idx];
  const palace = GAN_TO_PALACE[gan] || (1 as TaiyiPalaceId);
  const element = GAN_WX[gan] || '土';
  return { name: gan, palace, element: element as WuXing };
}

/**
 * Step 10a: 三基
 * 岁基=年干落宫，月基=月干落宫，日基=日干落宫
 */
function calcSanJi(ganZhi: GanZhiSet): SanJi {
  const yearGan = ganZhi.year[0];
  const monthGan = ganZhi.month[0];
  const dayGan = ganZhi.day[0];
  return {
    suiJi: { gan: yearGan, palace: GAN_TO_PALACE[yearGan] || (1 as TaiyiPalaceId) },
    yueJi: { gan: monthGan, palace: GAN_TO_PALACE[monthGan] || (1 as TaiyiPalaceId) },
    riJi: { gan: dayGan, palace: GAN_TO_PALACE[dayGan] || (1 as TaiyiPalaceId) },
  };
}

/**
 * Step 10b: 五福
 */
function calcWuFu(
  taiyiPalace: TaiyiPalaceId,
  shiJiPalace: TaiyiPalaceId,
  keGong: TaiyiPalaceId,
): WuFu {
  // 臣基 = 太乙宫 顺数3位（在8宫循环中）
  const route = [1, 2, 3, 4, 6, 7, 8, 9] as TaiyiPalaceId[];
  const taiyiIdx = route.indexOf(taiyiPalace);
  const chenIdx = (taiyiIdx + 2) % route.length;
  const minIdx = (taiyiIdx + 4) % route.length;

  return {
    junJi: taiyiPalace,
    chenJi: route[chenIdx >= 0 ? chenIdx : 0],
    minJi: route[minIdx >= 0 ? minIdx : 0],
    shiJiGong: shiJiPalace,
    keGong,
  };
}

/**
 * Step 10c: 四神
 */
function calcSiShen(ganZhi: GanZhiSet, taiyiPalace: TaiyiPalaceId): SiShen {
  const yearGan = ganZhi.year[0];
  const yearZhi = ganZhi.year[1];
  const dayGan = ganZhi.day[0];

  return {
    tianYuan: {
      name: yearGan,
      palace: GAN_TO_PALACE[yearGan] || (1 as TaiyiPalaceId),
    },
    diYuan: {
      name: yearZhi,
      palace: ZHI_TO_PALACE[yearZhi] || (1 as TaiyiPalaceId),
    },
    zhiFu: {
      name: dayGan,
      palace: GAN_TO_PALACE[dayGan] || (1 as TaiyiPalaceId),
    },
    xuJing: {
      name: '虚精',
      palace: taiyiPalace, // 虚精随太乙
    },
  };
}

/**
 * Step 11: 阳九百六运限
 */
function calcYangJiuBaiLiu(jiNian: number): YangJiuBaiLiu {
  const posInCycle = ((jiNian % YANG_JIU_PERIOD) + YANG_JIU_PERIOD) % YANG_JIU_PERIOD;

  for (const seg of YANG_JIU_BAI_LIU_SEGMENTS) {
    if (posInCycle >= seg.startOffset && posInCycle < seg.startOffset + seg.duration) {
      const posInSeg = posInCycle - seg.startOffset + 1;
      return {
        cycleName: seg.name,
        positionInCycle: posInSeg,
        limitType: seg.type,
        description: seg.type === '阳九'
          ? `当前处于阳九灾限第${posInSeg}年（共9年），宜慎防天灾人祸`
          : seg.type === '百六'
            ? `当前处于百六行限第${posInSeg}年（共106年），运势起伏较大`
            : '正常年份',
        startYear: jiNian - posInSeg + 1,
        endYear: jiNian - posInSeg + seg.duration,
      };
    }
  }

  // 若超出已定义的段落，按正常处理
  return {
    cycleName: '大周期外',
    positionInCycle: posInCycle,
    limitType: '正常',
    description: '正常年份，无特殊运限',
    startYear: jiNian,
    endYear: jiNian,
  };
}

/**
 * Step 12: 组装九宫状态
 */
function assemblePalaces(
  taiyiPalace: TaiyiPalaceId,
  jiShenPalace: TaiyiPalaceId,
  wenChangPalace: TaiyiPalaceId,
  shiJiPalace: TaiyiPalaceId,
  spirits: SpiritPosition[],
  zhuJiang: GeneralInfo,
  keJiang: GeneralInfo,
  ganZhi: GanZhiSet,
): Record<TaiyiPalaceId, TaiyiPalaceState> {
  const palaces = {} as Record<TaiyiPalaceId, TaiyiPalaceState>;

  // 日干支用于判断空亡
  const dayGZ = ganZhi.day;
  const [kong1, kong2] = getXunKong(dayGZ);

  for (let i = 1; i <= 9; i++) {
    const pid = i as TaiyiPalaceId;
    const info = TAIYI_PALACE_INFO[pid];
    const palaceSpirits = spirits.filter(s => s.palace === pid);

    // 判定该宫地支是否空亡
    const isVoid = info.branches.some(b => b === kong1 || b === kong2);

    palaces[pid] = {
      palaceId: pid,
      palaceName: info.name,
      direction: info.direction,
      element: info.element,
      hasTaiyi: pid === taiyiPalace,
      hasJiShen: pid === jiShenPalace,
      hasWenChang: pid === wenChangPalace,
      hasShiJi: pid === shiJiPalace,
      spirits: palaceSpirits,
      zhuJiang: zhuJiang.palace === pid ? zhuJiang.name : undefined,
      keJiang: keJiang.palace === pid ? keJiang.name : undefined,
      earthBranch: info.branches.join(''),
      isVoid,
    };
  }

  return palaces;
}
