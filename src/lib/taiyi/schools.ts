/**
 * 太乙神数 —— 策略模式：统宗版 vs 金镜版
 * 参照 liuyao/naJia.ts 的 NaJiaStrategy 设计
 */

import type {
  TaiyiSchool, CalcType, TaiyiPalaceId, JiNianResult,
} from './types';
import { calcJiNianTongzong, calcJiNianJinjing } from './jiNian';
import {
  TAIYI_PATROL_SKIP5, TAIYI_PATROL_FULL9, JISHEN_PATROL, WENCHANG_PATROL,
  TONGZONG_TAIYI_CYCLE, JINJING_TAIYI_CYCLE,
  TONGZONG_ZHU_DIVISOR, JINJING_ZHU_DIVISOR,
  TONGZONG_KE_DIVISOR, JINJING_KE_DIVISOR,
} from './constants';

/** 太乙流派策略接口 */
export interface TaiyiSchoolStrategy {
  readonly school: TaiyiSchool;
  /** 计算积年 */
  calcJiNian(year: number, month: number, day: number, hour: number, calcType: CalcType): JiNianResult;
  /** 太乙落宫 */
  getTaiyiPalace(jiNian: number): TaiyiPalaceId;
  /** 计神落宫 */
  getJiShenPalace(jiNian: number): TaiyiPalaceId;
  /** 文昌落宫 */
  getWenChangPalace(jiNian: number): TaiyiPalaceId;
  /** 主算 */
  calcZhuSuan(jiNian: number): number;
  /** 客算 */
  calcKeSuan(jiNian: number): number;
}

/* ===== 统宗宝鉴版 ===== */

class TongzongStrategy implements TaiyiSchoolStrategy {
  readonly school: TaiyiSchool = 'tongzong';

  calcJiNian(year: number, month: number, day: number, hour: number, calcType: CalcType): JiNianResult {
    return calcJiNianTongzong(year, month, day, hour, calcType);
  }

  /** 太乙巡行跳5宫，8宫循环 */
  getTaiyiPalace(jiNian: number): TaiyiPalaceId {
    const route = TAIYI_PATROL_SKIP5;
    const idx = ((jiNian % route.length) + route.length) % route.length;
    return route[idx];
  }

  /** 计神逆行，8宫循环 */
  getJiShenPalace(jiNian: number): TaiyiPalaceId {
    const route = JISHEN_PATROL;
    const idx = ((jiNian % route.length) + route.length) % route.length;
    return route[idx];
  }

  /** 文昌顺行，起始偏移4位 */
  getWenChangPalace(jiNian: number): TaiyiPalaceId {
    const route = WENCHANG_PATROL;
    const offset = 4; // 文昌起始偏移
    const idx = (((jiNian + offset) % route.length) + route.length) % route.length;
    return route[idx];
  }

  calcZhuSuan(jiNian: number): number {
    return ((jiNian % TONGZONG_ZHU_DIVISOR) + TONGZONG_ZHU_DIVISOR) % TONGZONG_ZHU_DIVISOR;
  }

  calcKeSuan(jiNian: number): number {
    return ((jiNian % TONGZONG_KE_DIVISOR) + TONGZONG_KE_DIVISOR) % TONGZONG_KE_DIVISOR;
  }
}

/* ===== 金镜式经版 ===== */

class JinjingStrategy implements TaiyiSchoolStrategy {
  readonly school: TaiyiSchool = 'jinjing';

  calcJiNian(year: number, month: number, day: number, hour: number, calcType: CalcType): JiNianResult {
    return calcJiNianJinjing(year, month, day, hour, calcType);
  }

  /** 太乙巡行过5宫，9宫全循环 */
  getTaiyiPalace(jiNian: number): TaiyiPalaceId {
    const route = TAIYI_PATROL_FULL9;
    const idx = ((jiNian % route.length) + route.length) % route.length;
    return route[idx];
  }

  /** 计神逆行，8宫循环（金镜版计神同样跳5宫） */
  getJiShenPalace(jiNian: number): TaiyiPalaceId {
    const route = JISHEN_PATROL;
    const idx = ((jiNian % route.length) + route.length) % route.length;
    return route[idx];
  }

  /** 文昌顺行，起始偏移3位 */
  getWenChangPalace(jiNian: number): TaiyiPalaceId {
    const route = WENCHANG_PATROL;
    const offset = 3;
    const idx = (((jiNian + offset) % route.length) + route.length) % route.length;
    return route[idx];
  }

  calcZhuSuan(jiNian: number): number {
    return ((jiNian % JINJING_ZHU_DIVISOR) + JINJING_ZHU_DIVISOR) % JINJING_ZHU_DIVISOR;
  }

  calcKeSuan(jiNian: number): number {
    return ((jiNian % JINJING_KE_DIVISOR) + JINJING_KE_DIVISOR) % JINJING_KE_DIVISOR;
  }
}

/* ===== 策略注册与工厂 ===== */

const strategies: Record<TaiyiSchool, TaiyiSchoolStrategy> = {
  tongzong: new TongzongStrategy(),
  jinjing: new JinjingStrategy(),
};

/** 获取对应流派的策略实例 */
export function getTaiyiStrategy(school: TaiyiSchool): TaiyiSchoolStrategy {
  return strategies[school];
}
