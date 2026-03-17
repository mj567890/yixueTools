/**
 * API v1 公共工具
 */
import { NextResponse } from 'next/server';

/** 统一成功响应 */
export function ok(data: unknown) {
  return NextResponse.json({ ok: true, data }, { status: 200 });
}

/** 统一错误响应 */
export function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/** 安全解析 JSON body，失败返回 null */
export async function parseBody<T = Record<string, unknown>>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

/** 必填字段校验，返回缺失字段名或 null */
export function requireFields(body: Record<string, unknown>, fields: string[]): string | null {
  for (const f of fields) {
    if (body[f] === undefined || body[f] === null) return f;
  }
  return null;
}
