/**
 * GET /.well-known/ai-plugin.json
 *
 * AI 平台自动发现清单（ChatGPT Plugins / OpenClaw / Coze / Dify 等）
 */
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') ?? 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') ?? 'http';
  const baseUrl = `${proto}://${host}`;

  return Response.json(
    {
      schema_version: 'v1',
      name_for_human: '嘉嘉易学工具箱',
      name_for_model: 'yixue_toolbox',
      description_for_human:
        '中国传统命理术数计算工具，提供八字排盘、梅花易数、六爻纳甲、奇门遁甲、太乙神数、起名测名、公农历查询等功能。',
      description_for_model:
        '中国传统命理与术数计算引擎（Chinese metaphysics & divination calculation engine）。' +
        '包含以下能力：' +
        '1) calendar — 公农历互查、干支纳音、节气、称骨论命；' +
        '2) bazi — 八字四柱排盘、大运流年、十维度命理分析（事业/财运/婚姻/健康等）；' +
        '3) meihua — 梅花易数，支持时间/数字/文字三种起卦，体用五行生克分析；' +
        '4) liuyao — 六爻纳甲排盘，十大场景专项分析（求财/问病/考试/婚恋/事业等）；' +
        '5) qimen — 奇门遁甲，支持阴盘（王凤麟派）和阳盘（拆补/置闰/茅山），九宫格局分析；' +
        '6) taiyi — 太乙神数，支持统宗/金镜两派，年/月/日/时四计，用于宏观趋势推算；' +
        '7) naming — 姓名学五格数理分析和智能起名推荐。' +
        '所有时间参数使用公历，hour 为 24 小时制（0-23）。',
      auth: { type: 'none' },
      api: {
        type: 'openapi',
        url: `${baseUrl}/api/v1/openapi.json`,
        is_user_authenticated: false,
      },
      logo_url: `${baseUrl}/favicon.ico`,
      contact_email: '',
      legal_info_url: `${baseUrl}/about`,
    },
    { headers: { 'Cache-Control': 'public, max-age=3600' } }
  );
}
