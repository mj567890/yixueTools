import { ok, fail, parseBody } from '../_shared';
import {
  divinateByTime, divinateByNumber, divinateByText,
  performAnalysis,
} from '@/lib/meihua';

/**
 * POST /api/v1/meihua
 *
 * 梅花易数 — 时间/数字/文字起卦 + 体用分析
 *
 * Body:
 *   时间: { method: "time", year, month, day, hour, question? }
 *   数字: { method: "number", upper, lower, moving, question? }
 *   文字: { method: "text", text, question? }
 */
export async function POST(req: Request) {
  const body = await parseBody(req);
  if (!body) return fail('请求体必须是有效 JSON');

  const { method, question = '' } = body as { method?: string; question?: string; [k: string]: unknown };
  if (!method) return fail('缺少必填参数: method (time/number/text)');

  try {
    let result;
    switch (method) {
      case 'time': {
        const { year, month, day, hour } = body as { year: number; month: number; day: number; hour: number };
        if (!year || !month || !day || hour === undefined) return fail('时间起卦需要 year, month, day, hour');
        result = divinateByTime(year, month, day, hour, question);
        break;
      }
      case 'number': {
        const { upper, lower, moving } = body as { upper: number; lower: number; moving: number };
        if (!upper || !lower || !moving) return fail('数字起卦需要 upper, lower, moving');
        result = divinateByNumber(upper, lower, moving, question);
        break;
      }
      case 'text': {
        const { text } = body as { text: string };
        if (!text) return fail('文字起卦需要 text');
        result = divinateByText(text, question);
        break;
      }
      default:
        return fail(`不支持的起卦方式: ${method}，可选: time/number/text`);
    }

    const analysis = performAnalysis(result);
    return ok({ result, analysis });
  } catch (e) {
    return fail(e instanceof Error ? e.message : '起卦失败', 500);
  }
}
