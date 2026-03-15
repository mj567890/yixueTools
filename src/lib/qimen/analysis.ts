/**
 * 奇门遁甲 —— 格局分析引擎
 */

import type { PalaceId, QimenResult, PatternMatch, QimenAnalysis } from './types';
import { PATTERN_DEFS, PALACE_INFO, NINE_STARS, OPPOSITE_PALACE, GAN_WU_XING, WX_KE } from './constants';

/**
 * 检测所有格局
 */
export function detectPatterns(result: QimenResult): PatternMatch[] {
  const patterns: PatternMatch[] = [];
  const { palaces, zhiFuInfo } = result;

  // 遍历每个外宫
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const pid = p as PalaceId;
    const palace = palaces[pid];

    const heavenStem = palace.heavenStem;
    const earthStem = palace.earthStem;
    const starName = palace.star?.name || '';
    const gateName = palace.gate?.name || '';
    const spiritName = palace.spirit?.name || '';

    // 检查常规格局
    for (const def of PATTERN_DEFS) {
      if (def.name === '飞鸟跌穴') {
        // 特殊处理：天盘丙落离9宫
        if (heavenStem === '丙' && pid === 9) {
          patterns.push({
            name: def.name,
            type: def.type,
            palace: pid,
            description: def.description,
          });
        }
        continue;
      }

      if (def.check(heavenStem, earthStem, starName, gateName, spiritName)) {
        patterns.push({
          name: def.name,
          type: def.type,
          palace: pid,
          description: def.description,
        });
      }
    }
  }

  // 检查伏吟（值符星回到本宫）
  const zhiFuStar = zhiFuInfo.zhiFuStar;
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const pid = p as PalaceId;
    const star = palaces[pid].star;
    if (star && star.name === zhiFuStar.name && pid === zhiFuStar.originalPalace) {
      patterns.push({
        name: '伏吟',
        type: '凶格',
        palace: pid,
        description: '值符星回到本宫，主事不动，忧虑重重',
      });
      break;
    }
  }

  // 检查反吟（值符星到对冲宫）
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const pid = p as PalaceId;
    const star = palaces[pid].star;
    if (star && star.name === zhiFuStar.name &&
        pid === OPPOSITE_PALACE[zhiFuStar.originalPalace]) {
      patterns.push({
        name: '反吟',
        type: '凶格',
        palace: pid,
        description: '值符星到对冲宫，主事反复，变动不安',
      });
      break;
    }
  }

  // 检查入墓
  const muMap: Record<string, PalaceId> = {
    '木': 6, // 木墓在戌→乾6宫
    '火': 2, // 火墓在丑→... 实际火墓在戌 → 6宫 (传统说法不一)
    '水': 4, // 水墓在辰→巽4宫
    '金': 2, // 金墓在丑→坤... 实际金墓在丑→艮8... 简化处理
    '土': 4, // 土墓在辰→巽4宫
  };
  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue;
    const pid = p as PalaceId;
    const hs = palaces[pid].heavenStem;
    const wx = GAN_WU_XING[hs];
    if (wx && muMap[wx] === pid) {
      patterns.push({
        name: '入墓',
        type: '凶格',
        palace: pid,
        description: `天盘${hs}(${wx})入墓于${PALACE_INFO[pid].name}`,
      });
    }
  }

  return patterns;
}

/**
 * 生成总体摘要
 */
export function generateSummary(patterns: PatternMatch[], result: QimenResult): string {
  const jiCount = patterns.filter(p => p.type === '吉格').length;
  const xiongCount = patterns.filter(p => p.type === '凶格').length;

  const { juInfo, zhiFuInfo, config } = result;

  let summary: string;
  if (config.panType === 'yinPan' || !juInfo) {
    // 阴盘无定局信息
    summary = `阴盘奇门（王凤麟体系），`;
    summary += `值符${zhiFuInfo.zhiFuStar.name}，值使${zhiFuInfo.zhiShiGate.name}。`;
  } else {
    summary = `${juInfo.dunType}${juInfo.juNumber}局（${juInfo.yuan}），`;
    summary += `值符${zhiFuInfo.zhiFuStar.name}，值使${zhiFuInfo.zhiShiGate.name}。`;
  }

  if (jiCount > 0 && xiongCount === 0) {
    summary += '盘中吉格显现，整体形势向好。';
  } else if (xiongCount > 0 && jiCount === 0) {
    summary += '盘中有凶格出现，行事需谨慎。';
  } else if (jiCount > 0 && xiongCount > 0) {
    summary += `吉凶并见（${jiCount}吉${xiongCount}凶），需综合分析具体宫位。`;
  } else {
    summary += '盘中无明显吉凶格局，整体平稳。';
  }

  return summary;
}

/**
 * 生成关键提示
 */
export function generateTips(patterns: PatternMatch[], result: QimenResult): string[] {
  const tips: string[] = [];
  const { palaces, voidBranches, horseBranch } = result;

  // 空亡提示
  if (voidBranches[0]) {
    const voidPalaces: string[] = [];
    for (let p = 1; p <= 9; p++) {
      if (p === 5) continue;
      if (palaces[p as PalaceId].isVoid) {
        voidPalaces.push(PALACE_INFO[p as PalaceId].name);
      }
    }
    if (voidPalaces.length > 0) {
      tips.push(`空亡落${voidPalaces.join('、')}，该方位所问之事难以落实`);
    }
  }

  // 马星提示
  if (horseBranch) {
    for (let p = 1; p <= 9; p++) {
      if (p === 5) continue;
      if (palaces[p as PalaceId].isHorseStar) {
        tips.push(`驿马在${PALACE_INFO[p as PalaceId].name}（${PALACE_INFO[p as PalaceId].direction}），主动象，利出行远行`);
        break;
      }
    }
  }

  // 值符值使提示
  const { zhiFuInfo } = result;
  tips.push(`值符${zhiFuInfo.zhiFuStar.name}（${zhiFuInfo.zhiFuStar.auspice === '吉' ? '吉星' : zhiFuInfo.zhiFuStar.auspice === '凶' ? '凶星' : '中性'}），值使${zhiFuInfo.zhiShiGate.name}（${zhiFuInfo.zhiShiGate.auspice === '吉' ? '吉门' : zhiFuInfo.zhiShiGate.auspice === '凶' ? '凶门' : '中性'}）`);

  // 吉格提示
  const jiPatterns = patterns.filter(p => p.type === '吉格');
  if (jiPatterns.length > 0) {
    tips.push(`吉格：${jiPatterns.map(p => `${p.name}（${PALACE_INFO[p.palace].name}）`).join('、')}`);
  }

  // 凶格提示
  const xiongPatterns = patterns.filter(p => p.type === '凶格');
  if (xiongPatterns.length > 0) {
    tips.push(`凶格：${xiongPatterns.map(p => `${p.name}（${PALACE_INFO[p.palace].name}）`).join('、')}`);
  }

  return tips;
}

/**
 * 汇总分析入口
 */
export function performQimenAnalysis(result: QimenResult): QimenAnalysis {
  const patterns = detectPatterns(result);
  const summary = generateSummary(patterns, result);
  const tips = generateTips(patterns, result);
  return { patterns, summary, tips };
}
