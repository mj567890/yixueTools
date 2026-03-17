import { ok, fail, parseBody } from '../_shared';
import { analyzeNaming, generateNames } from '@/lib/naming';
import type { NamingConfig } from '@/lib/naming';

/**
 * POST /api/v1/naming
 *
 * 起名测名系统
 *
 * 测名: { action: "analyze", name, birthYear?, birthMonth?, birthDay?, birthHour? }
 * 起名: { action: "generate", surname, gender: "male"|"female",
 *          birthYear?, birthMonth?, birthDay?, birthHour?,
 *          nameLength?, fixedFirstChar?, fixedSecondChar?, avoidChars?, limit? }
 */
export async function POST(req: Request) {
  const body = await parseBody(req);
  if (!body) return fail('请求体必须是有效 JSON');

  const { action } = body as { action?: string };
  if (!action) return fail('缺少必填参数: action (analyze/generate)');

  try {
    if (action === 'analyze') {
      const { name, birthYear, birthMonth, birthDay, birthHour } = body as {
        name?: string; birthYear?: number; birthMonth?: number; birthDay?: number; birthHour?: number;
      };
      if (!name) return fail('测名需要 name 参数');
      const result = analyzeNaming(name, birthYear, birthMonth, birthDay, birthHour);
      return ok(result);
    }

    if (action === 'generate') {
      const { surname, gender = 'male', birthYear, birthMonth, birthDay, birthHour,
              nameLength, fixedFirstChar, fixedSecondChar, avoidChars, limit = 20 } = body as {
        surname?: string; gender?: 'male' | 'female';
        birthYear?: number; birthMonth?: number; birthDay?: number; birthHour?: number;
        nameLength?: number; fixedFirstChar?: string; fixedSecondChar?: string;
        avoidChars?: string[]; limit?: number;
      };
      if (!surname) return fail('起名需要 surname 参数');

      const nl: 1 | 2 = nameLength === 1 ? 1 : 2;
      const config: NamingConfig = {
        surname, gender,
        birthYear, birthMonth, birthDay, birthHour,
        nameLength: nl, fixedFirstChar, fixedSecondChar, avoidChars,
      };
      const candidates = generateNames(config);
      return ok(candidates.slice(0, Math.min(limit, 50)));
    }

    return fail('action 参数无效，可选: analyze / generate');
  } catch (e) {
    return fail(e instanceof Error ? e.message : '操作失败', 500);
  }
}
