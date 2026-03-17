import { ok, fail, parseBody, requireFields } from '../_shared';
import { getBaziResult, buildDaYunResult, analyzeFourDimensions } from '@/lib/lunar';
import { getBaziInterpretation } from '@/lib/bazi-interpretation';

/**
 * POST /api/v1/bazi
 *
 * 八字排盘 — 四柱、大运、十维度解读
 *
 * Body: { year, month, day, hour, gender? (1男0女, 默认1) }
 */
export async function POST(req: Request) {
  const body = await parseBody(req);
  if (!body) return fail('请求体必须是有效 JSON');

  const missing = requireFields(body, ['year', 'month', 'day', 'hour']);
  if (missing) return fail(`缺少必填参数: ${missing}`);

  const { year, month, day, hour, gender = 1 } = body as {
    year: number; month: number; day: number; hour: number; gender?: number;
  };

  try {
    const baziResult = getBaziResult(year, month, day, hour);
    const daYunResult = buildDaYunResult(year, month, day, hour, gender, baziResult);
    const fourDim = analyzeFourDimensions(baziResult, gender);
    const interpretation = getBaziInterpretation(baziResult, daYunResult, gender);

    return ok({
      bazi: baziResult,
      daYun: daYunResult,
      fourDimensions: fourDim,
      interpretation,
    });
  } catch (e) {
    return fail(e instanceof Error ? e.message : '排盘失败', 500);
  }
}
