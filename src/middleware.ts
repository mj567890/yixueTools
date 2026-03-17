import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * CORS 中间件 — 仅作用于 /api/* 路由
 * 允许任意来源的跨域请求，供外部网站和 AI 平台调用
 */
export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin') ?? '*';

  // OPTIONS 预检请求直接返回
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }

  // 正常请求：放行后追加 CORS 头
  const res = NextResponse.next();
  for (const [k, v] of Object.entries(corsHeaders(origin))) {
    res.headers.set(k, v);
  }
  return res;
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    'Access-Control-Max-Age': '86400',
  };
}

export const config = {
  matcher: '/api/:path*',
};
