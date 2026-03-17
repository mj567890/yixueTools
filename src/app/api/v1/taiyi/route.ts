import { ok, fail, parseBody, requireFields } from '../_shared';
import { calculateTaiyi, analyzeTaiyi } from '@/lib/taiyi';
import type { TaiyiConfig, ScenarioType } from '@/lib/taiyi';

/**
 * POST /api/v1/taiyi
 *
 * 太乙神数排盘 — 支持统宗宝鉴/金镜式经，年/月/日/时四计
 *
 * Body: { year, month, day, hour, minute?,
 *         school?: "tongzong"|"jinjing",
 *         calcType?: "year"|"month"|"day"|"hour",
 *         scenario? }
 */
export async function POST(req: Request) {
  const body = await parseBody(req);
  if (!body) return fail('请求体必须是有效 JSON');

  const missing = requireFields(body, ['year', 'month', 'day', 'hour']);
  if (missing) return fail(`缺少必填参数: ${missing}`);

  const {
    year, month, day, hour, minute = 0,
    school = 'tongzong', calcType = 'year', scenario,
  } = body as {
    year: number; month: number; day: number; hour: number; minute?: number;
    school?: TaiyiConfig['school']; calcType?: TaiyiConfig['calcType']; scenario?: ScenarioType;
  };

  try {
    const config: TaiyiConfig = { year, month, day, hour, minute, school, calcType };
    const result = calculateTaiyi(config);
    const analysis = analyzeTaiyi(result, scenario || undefined);
    return ok({ result, analysis });
  } catch (e) {
    return fail(e instanceof Error ? e.message : '排盘失败', 500);
  }
}
