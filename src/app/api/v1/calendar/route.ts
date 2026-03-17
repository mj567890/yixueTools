import { ok, fail, parseBody, requireFields } from '../_shared';
import { getCalendarInfo, getChengGu } from '@/lib/lunar';

/**
 * POST /api/v1/calendar
 *
 * 玉匣通书 — 公农历查询、四柱、纳音、节气、称骨等
 *
 * Body: { year, month, day, hour? }
 */
export async function POST(req: Request) {
  const body = await parseBody(req);
  if (!body) return fail('请求体必须是有效 JSON');

  const missing = requireFields(body, ['year', 'month', 'day']);
  if (missing) return fail(`缺少必填参数: ${missing}`);

  const { year, month, day, hour } = body as { year: number; month: number; day: number; hour?: number };

  try {
    const info = getCalendarInfo(year, month, day, hour);

    // 如果提供了时辰，额外计算称骨
    let chengGu = null;
    if (hour !== undefined && info.yearGanZhi) {
      try {
        const hourZhi = ['子', '丑', '丑', '寅', '寅', '卯', '卯', '辰', '辰', '巳', '巳', '午', '午', '未', '未', '申', '申', '酉', '酉', '戌', '戌', '亥', '亥', '子'][hour] ?? '子';
        chengGu = getChengGu(info.yearGanZhi, info.lunarMonth, info.lunarDay, hourZhi);
      } catch { /* 称骨失败不影响主结果 */ }
    }

    return ok({ ...info, chengGu });
  } catch (e) {
    return fail(e instanceof Error ? e.message : '查询失败', 500);
  }
}
