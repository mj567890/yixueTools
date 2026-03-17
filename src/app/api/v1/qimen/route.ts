import { ok, fail, parseBody, requireFields } from '../_shared';
import { yinpan_lucking_data } from '@/lib/qimen/luckingPaipan';
import { analyzeQimen } from '@/lib/qimen/luckingAnalysis';
import { calculateYangpan } from '@/lib/qimen/yangpanPipeline';
import { analyzeYangpan } from '@/lib/qimen/yangpanAnalysis';
import type { JiGongType, ScenarioType } from '@/lib/qimen/types';

/**
 * POST /api/v1/qimen
 *
 * 奇门遁甲排盘 — 阴盘 / 阳盘
 *
 * Body:
 *   阴盘: { pan: "yin", year, month, day, hour, minute? }
 *   阳盘: { pan: "yang", year, month, day, hour, minute?,
 *           method?: "chaiBu"|"zhiRun"|"maoShan",
 *           jiGong?: 2|8, scenario? }
 */
export async function POST(req: Request) {
  const body = await parseBody(req);
  if (!body) return fail('请求体必须是有效 JSON');

  const { pan = 'yin' } = body as { pan?: string };
  const missing = requireFields(body, ['year', 'month', 'day', 'hour']);
  if (missing) return fail(`缺少必填参数: ${missing}`);

  const { year, month, day, hour, minute = 0 } = body as {
    year: number; month: number; day: number; hour: number; minute?: number;
  };

  try {
    if (pan === 'yin') {
      const data = yinpan_lucking_data(year, month, day, hour, minute);
      let analysis = null;
      try { analysis = analyzeQimen(data as Parameters<typeof analyzeQimen>[0]); } catch { /* */ }
      return ok({ pan: 'yin', result: data, analysis });
    }

    if (pan === 'yang') {
      const { method = 'chaiBu', jiGong = 2, scenario } = body as {
        method?: 'chaiBu' | 'zhiRun' | 'maoShan'; jiGong?: JiGongType; scenario?: ScenarioType;
      };
      const result = calculateYangpan({ year, month, day, hour, minute, method, jiGong });
      let analysis = null;
      try { analysis = analyzeYangpan(result, scenario || undefined); } catch { /* */ }
      return ok({ pan: 'yang', result, analysis });
    }

    return fail('pan 参数无效，可选: yin / yang');
  } catch (e) {
    return fail(e instanceof Error ? e.message : '排盘失败', 500);
  }
}
