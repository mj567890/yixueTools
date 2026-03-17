/**
 * GET /api/v1/health
 *
 * 健康检查端点 — 供 AI 平台探活、监控系统使用
 */
export async function GET() {
  return Response.json({
    ok: true,
    service: '嘉嘉易学工具箱 API',
    version: 'v1',
    endpoints: [
      'POST /api/v1/calendar',
      'POST /api/v1/bazi',
      'POST /api/v1/meihua',
      'POST /api/v1/liuyao',
      'POST /api/v1/qimen',
      'POST /api/v1/taiyi',
      'POST /api/v1/naming',
    ],
  });
}
