/**
 * 真太阳时修正工具
 *
 * 王凤麟阴盘奇门遁甲要求将北京标准时间转为问事地真太阳时后，
 * 再确定时干支。公式：
 *   真太阳时 = 北京时间 + 4×(当地经度 - 120) 分钟
 *
 * 仅使用经度差修正，精准无误差
 */

export interface TrueSolarTimeResult {
  /** 修正后年 */
  year: number;
  /** 修正后月 */
  month: number;
  /** 修正后日 */
  day: number;
  /** 修正后时（0-23） */
  hour: number;
  /** 修正后分（0-59） */
  minute: number;
  /** 经度差修正量（分钟） */
  longitudeCorrection: number;
  /** 总修正量（分钟） */
  totalCorrection: number;
}

/**
 * 将北京标准时间转换为真太阳时
 *
 * 公式：真太阳时 = 北京时间 + 4×(当地经度 - 120) 分钟
 *
 * @param year   年
 * @param month  月
 * @param day    日
 * @param hour   时（0-23）
 * @param minute 分（0-59）
 * @param longitude 问事地东经度（如 116.4 为北京）
 * @returns 修正后的日期时间 + 修正量明细
 */
export function toTrueSolarTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  longitude: number,
): TrueSolarTimeResult {
  // 经度差修正：4×(当地经度 - 120) 分钟
  const longitudeCorrection = 4 * (longitude - 120);
  const totalCorrection = longitudeCorrection;

  // 应用到时间
  let totalMinutes = hour * 60 + minute + totalCorrection;

  // 处理跨日
  let dayOffset = 0;
  while (totalMinutes >= 1440) {
    totalMinutes -= 1440;
    dayOffset++;
  }
  while (totalMinutes < 0) {
    totalMinutes += 1440;
    dayOffset--;
  }

  const correctedHour = Math.floor(totalMinutes / 60);
  const correctedMinute = Math.round(totalMinutes % 60);

  // 计算修正后的日期
  const d = new Date(year, month - 1, day + dayOffset);

  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hour: correctedHour,
    minute: correctedMinute,
    longitudeCorrection: Math.round(longitudeCorrection * 10) / 10,
    totalCorrection: Math.round(totalCorrection * 10) / 10,
  };
}
