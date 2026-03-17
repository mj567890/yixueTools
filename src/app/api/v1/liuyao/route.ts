import { ok, fail, parseBody, requireFields } from '../_shared';
import { paipan, performAnalysis } from '@/lib/liuyao';
import type { LiuYaoConfig, DivinationMethod, SchoolType, ScenarioType, YaoType, CoinTossResult } from '@/lib/liuyao';

/**
 * POST /api/v1/liuyao
 *
 * 六爻纳甲排盘 — 四种起卦 + 分析引擎
 *
 * Body:
 *   { method: "time"|"coin"|"number"|"manual",
 *     school?: "jingfang"|"cangshanbu",
 *     question?, scenario?,
 *     year, month, day, hour,
 *     // coin: coinResults: [{yaoIndex,coins,total}...]
 *     // number: numberInput
 *     // manual: rawYaoTypes: ["shaoYang",...]
 *   }
 */
export async function POST(req: Request) {
  const body = await parseBody(req);
  if (!body) return fail('请求体必须是有效 JSON');

  const missing = requireFields(body, ['method', 'year', 'month', 'day', 'hour']);
  if (missing) return fail(`缺少必填参数: ${missing}`);

  const {
    method, school = 'jingfang', question = '', scenario,
    year, month, day, hour,
    coinResults, numberInput, rawYaoTypes,
  } = body as {
    method: DivinationMethod; school?: SchoolType; question?: string; scenario?: ScenarioType;
    year: number; month: number; day: number; hour: number;
    coinResults?: CoinTossResult[]; numberInput?: number; rawYaoTypes?: YaoType[];
  };

  const config: LiuYaoConfig = {
    method, school, question, scenario,
    year, month, day, hour,
    coinResults, numberInput, rawYaoTypes,
  };

  try {
    const result = paipan(config);
    let analysis = null;
    try {
      analysis = performAnalysis(result);
    } catch { /* 分析失败不影响排盘结果 */ }

    return ok({ result, analysis });
  } catch (e) {
    return fail(e instanceof Error ? e.message : '排盘失败', 500);
  }
}
