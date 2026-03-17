/**
 * GET /api/v1/openapi.json
 *
 * 动态提供 OpenAPI 3.1 规范，自动适配当前域名
 */
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') ?? 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') ?? 'http';
  const baseUrl = `${proto}://${host}`;

  const spec = buildSpec(baseUrl);
  return Response.json(spec, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  });
}

/* ================================================================
 *  OpenAPI 3.1.0 完整规范
 * ================================================================ */

function buildSpec(baseUrl: string) {
  return {
    openapi: '3.1.0',
    info: {
      title: '嘉嘉易学工具箱 API',
      description:
        '中国传统命理与术数计算引擎。提供八字排盘、梅花易数、六爻纳甲、奇门遁甲、太乙神数、起名测名、公农历查询等全方位易学计算能力，可供 AI 助手、第三方网站和自动化流程调用。',
      version: '1.0.0',
      contact: { name: '嘉嘉易学工具箱' },
    },
    servers: [{ url: baseUrl, description: '当前服务器' }],
    paths: {
      /* ---------- health ---------- */
      '/api/v1/health': {
        get: {
          operationId: 'healthCheck',
          summary: '健康检查',
          description: '检测服务是否正常运行，返回可用端点列表。',
          responses: {
            '200': {
              description: '服务正常',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      ok: { type: 'boolean', example: true },
                      service: { type: 'string' },
                      version: { type: 'string' },
                      endpoints: { type: 'array', items: { type: 'string' } },
                    },
                  },
                },
              },
            },
          },
        },
      },

      /* ---------- calendar ---------- */
      '/api/v1/calendar': {
        post: {
          operationId: 'queryCalendar',
          summary: '玉匣通书 — 公农历查询',
          description:
            '当用户想查询某一天的农历日期、天干地支、纳音五行、节气信息或称骨论命时使用。输入公历日期，返回完整的历法信息。如果同时提供了出生时辰（hour），还会计算称骨重量和论命诗文。',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['year', 'month', 'day'],
                  properties: {
                    year: { type: 'integer', description: '公历年份，如 2024', example: 2024 },
                    month: { type: 'integer', description: '公历月份，1-12', example: 6, minimum: 1, maximum: 12 },
                    day: { type: 'integer', description: '公历日，1-31', example: 15, minimum: 1, maximum: 31 },
                    hour: {
                      type: 'integer',
                      description:
                        '小时（24小时制，0-23）。0-1 为子时、1-3 为丑时，以此类推。提供后可额外计算称骨论命。',
                      example: 8,
                      minimum: 0,
                      maximum: 23,
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': refOkResponse('日历信息，包含公农历、干支、纳音、节气及可选的称骨结果'),
            '400': refErrorResponse(),
            '500': refErrorResponse(),
          },
        },
      },

      /* ---------- bazi ---------- */
      '/api/v1/bazi': {
        post: {
          operationId: 'analyzeBazi',
          summary: '八字排盘 — 四柱命理分析',
          description:
            '当用户想了解自己或他人的命理格局、五行强弱、十神关系、大运走势时使用。输入出生的公历年月日时和性别，返回完整的四柱八字、大运排列、十维度分析（事业、财运、婚姻等）和综合解读。这是中国命理学最核心的分析工具。',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['year', 'month', 'day', 'hour'],
                  properties: {
                    year: { type: 'integer', description: '公历出生年份', example: 1990 },
                    month: { type: 'integer', description: '公历出生月份，1-12', example: 3, minimum: 1, maximum: 12 },
                    day: { type: 'integer', description: '公历出生日，1-31', example: 15, minimum: 1, maximum: 31 },
                    hour: {
                      type: 'integer',
                      description: '出生小时（24小时制，0-23）。0 代表子时凌晨，6 代表卯时早晨，12 代表午时正午，18 代表酉时傍晚。',
                      example: 10,
                      minimum: 0,
                      maximum: 23,
                    },
                    gender: {
                      type: 'integer',
                      description: '性别：1 = 男（乾造），0 = 女（坤造）。影响大运顺逆排列方向。默认为 1。',
                      enum: [0, 1],
                      default: 1,
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': refOkResponse('八字排盘完整结果，包含四柱、大运、十维度分析和综合解读'),
            '400': refErrorResponse(),
            '500': refErrorResponse(),
          },
        },
      },

      /* ---------- meihua ---------- */
      '/api/v1/meihua': {
        post: {
          operationId: 'divinateMeihua',
          summary: '梅花易数 — 起卦与体用分析',
          description:
            '当用户想通过梅花易数进行占卜预测时使用。支持三种起卦方式：(1) 时间起卦 — 根据当前或指定时间自动取数起卦；(2) 数字起卦 — 用户指定上卦数、下卦数和动爻数；(3) 文字起卦 — 根据汉字笔画自动取数。返回本卦、互卦、变卦以及体用五行生克分析。',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['method'],
                  properties: {
                    method: {
                      type: 'string',
                      enum: ['time', 'number', 'text'],
                      description: '起卦方式。time = 时间起卦；number = 数字起卦；text = 文字起卦。',
                    },
                    year: { type: 'integer', description: '公历年份（时间起卦必填）', example: 2024 },
                    month: { type: 'integer', description: '公历月份（时间起卦必填）', example: 6 },
                    day: { type: 'integer', description: '公历日（时间起卦必填）', example: 15 },
                    hour: { type: 'integer', description: '小时（时间起卦必填，0-23）', example: 10 },
                    upper: { type: 'integer', description: '上卦数（数字起卦必填，1-8 对应八卦）', example: 3 },
                    lower: { type: 'integer', description: '下卦数（数字起卦必填，1-8 对应八卦）', example: 5 },
                    moving: { type: 'integer', description: '动爻数（数字起卦必填，1-6）', example: 2 },
                    text: { type: 'string', description: '输入文字（文字起卦必填）', example: '天地人' },
                    question: { type: 'string', description: '所测之事，帮助聚焦分析方向', example: '今日运势如何' },
                  },
                },
              },
            },
          },
          responses: {
            '200': refOkResponse('梅花易数卦象及体用分析结果'),
            '400': refErrorResponse(),
            '500': refErrorResponse(),
          },
        },
      },

      /* ---------- liuyao ---------- */
      '/api/v1/liuyao': {
        post: {
          operationId: 'divinateLiuyao',
          summary: '六爻纳甲 — 排盘与场景分析',
          description:
            '当用户想通过六爻占卜来预测具体事项（求财、问病、考试、婚恋、事业、失物、官司、出行、宅葬等）时使用。这是中国最精确的占卜术之一。支持四种起卦方式和两个流派（京房纳甲/藏山卜），可指定具体场景进行针对性分析。返回完整的六爻排盘（世应、六亲、六神、旺衰等）和场景化分析。',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['method', 'year', 'month', 'day', 'hour'],
                  properties: {
                    method: {
                      type: 'string',
                      enum: ['time', 'coin', 'number', 'manual'],
                      description:
                        '起卦方式。time = 时间自动起卦；coin = 摇铜钱（需提供 coinResults）；number = 数字起卦（需提供 numberInput）；manual = 手动指定六爻（需提供 rawYaoTypes）。',
                    },
                    year: { type: 'integer', description: '公历年份', example: 2024 },
                    month: { type: 'integer', description: '公历月份', example: 6 },
                    day: { type: 'integer', description: '公历日', example: 15 },
                    hour: { type: 'integer', description: '小时（0-23）', example: 10 },
                    school: {
                      type: 'string',
                      enum: ['jingfang', 'cangshanbu'],
                      default: 'jingfang',
                      description: '流派。jingfang = 京房纳甲（主流，默认）；cangshanbu = 藏山卜。',
                    },
                    question: { type: 'string', description: '所测之事' },
                    scenario: {
                      type: 'string',
                      enum: ['qiucai', 'wenbing', 'kaoshi', 'hunlian', 'shiye', 'shiwu', 'guansi', 'chuxing', 'zhaizang', 'qiuqian'],
                      description:
                        '分析场景。qiucai=求财, wenbing=问病, kaoshi=考试, hunlian=婚恋, shiye=事业, shiwu=失物, guansi=官司, chuxing=出行, zhaizang=宅葬, qiuqian=求签/杂占。指定后返回该场景的专项分析。',
                    },
                    coinResults: {
                      type: 'array',
                      description: '摇币结果（coin 方式必填），由 6 次摇币结果组成',
                      items: {
                        type: 'object',
                        properties: {
                          yaoIndex: { type: 'integer', description: '爻序号（0=初爻，5=上爻）' },
                          coins: { type: 'array', items: { type: 'integer' }, description: '三枚铜钱正反（2=正面字，3=反面花）' },
                          total: { type: 'integer', description: '三枚铜钱之和（6/7/8/9）' },
                        },
                      },
                    },
                    numberInput: { type: 'integer', description: '数字（number 方式必填）' },
                    rawYaoTypes: {
                      type: 'array',
                      items: { type: 'string', enum: ['laoYang', 'shaoYang', 'shaoYin', 'laoYin'] },
                      description:
                        '手动指定六爻类型（manual 方式必填，从初爻到上爻共 6 个）。laoYang=老阳（动），shaoYang=少阳（静），shaoYin=少阴（静），laoYin=老阴（动）。',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': refOkResponse('六爻排盘结果与场景化分析'),
            '400': refErrorResponse(),
            '500': refErrorResponse(),
          },
        },
      },

      /* ---------- qimen ---------- */
      '/api/v1/qimen': {
        post: {
          operationId: 'divineQimen',
          summary: '奇门遁甲 — 阴盘/阳盘排盘',
          description:
            '当用户想使用奇门遁甲进行决策分析时使用。奇门遁甲被誉为"帝王之术"，用于择时、决策、预测。支持两种盘式：(1) 阴盘（王凤麟派）— 现代应用最广泛的流派；(2) 阳盘（传统）— 支持拆补、置闰、茅山三种定局法。阳盘可指定天禽寄宫和问事场景。返回完整的九宫盘面（天盘、地盘、九星、八门、八神等）和格局分析。',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['year', 'month', 'day', 'hour'],
                  properties: {
                    pan: {
                      type: 'string',
                      enum: ['yin', 'yang'],
                      default: 'yin',
                      description: '盘式。yin = 阴盘奇门（王凤麟派，默认）；yang = 阳盘奇门（传统）。',
                    },
                    year: { type: 'integer', description: '公历年份', example: 2024 },
                    month: { type: 'integer', description: '公历月份', example: 6 },
                    day: { type: 'integer', description: '公历日', example: 15 },
                    hour: { type: 'integer', description: '小时（0-23）', example: 10 },
                    minute: { type: 'integer', description: '分钟（0-59），默认 0', default: 0 },
                    method: {
                      type: 'string',
                      enum: ['chaiBu', 'zhiRun', 'maoShan'],
                      default: 'chaiBu',
                      description: '阳盘定局法（仅阳盘有效）。chaiBu=拆补法（默认），zhiRun=置闰法，maoShan=茅山法。',
                    },
                    jiGong: {
                      type: 'integer',
                      enum: [2, 8],
                      default: 2,
                      description: '天禽星寄宫（仅阳盘有效）。2=寄坤二宫（默认），8=寄艮八宫。',
                    },
                    scenario: {
                      type: 'string',
                      enum: ['career', 'wealth', 'love', 'health', 'lawsuit', 'travel'],
                      description: '问事场景（仅阳盘有效）。career=事业, wealth=财运, love=感情, health=健康, lawsuit=官讼, travel=出行。',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': refOkResponse('奇门遁甲盘面数据与格局分析'),
            '400': refErrorResponse(),
            '500': refErrorResponse(),
          },
        },
      },

      /* ---------- taiyi ---------- */
      '/api/v1/taiyi': {
        post: {
          operationId: 'calculateTaiyi',
          summary: '太乙神数 — 排盘与分析',
          description:
            '当用户想使用太乙神数进行宏观预测时使用。太乙神数是"三式"之首，古代用于推算国运、天时、战争等大事。支持统宗宝鉴和金镜式经两个流派，可按年、月、日、时四种计算类型排盘。返回太乙数、计神、文昌、始击、客主算等盘面信息，以及场景化分析。',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['year', 'month', 'day', 'hour'],
                  properties: {
                    year: { type: 'integer', description: '公历年份', example: 2024 },
                    month: { type: 'integer', description: '公历月份', example: 6 },
                    day: { type: 'integer', description: '公历日', example: 15 },
                    hour: { type: 'integer', description: '小时（0-23）', example: 10 },
                    minute: { type: 'integer', description: '分钟（0-59），默认 0', default: 0 },
                    school: {
                      type: 'string',
                      enum: ['tongzong', 'jinjing'],
                      default: 'tongzong',
                      description: '流派。tongzong = 统宗宝鉴（默认）；jinjing = 金镜式经。两者在太乙积年和推算方法上有所不同。',
                    },
                    calcType: {
                      type: 'string',
                      enum: ['year', 'month', 'day', 'hour'],
                      default: 'year',
                      description: '四计类型。year=太乙年计（推算年运，默认），month=月计，day=日计，hour=时计。时间粒度越细，预测越具体。',
                    },
                    scenario: {
                      type: 'string',
                      enum: ['guoyun', 'zhanzheng', 'tianshi', 'renshi', 'jibing', 'zayi'],
                      description: '问事场景。guoyun=国运, zhanzheng=战争, tianshi=天时, renshi=人事, jibing=疾病, zayi=灾异。',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': refOkResponse('太乙神数盘面与分析结果'),
            '400': refErrorResponse(),
            '500': refErrorResponse(),
          },
        },
      },

      /* ---------- naming ---------- */
      '/api/v1/naming': {
        post: {
          operationId: 'namingService',
          summary: '起名测名 — 姓名分析与智能推荐',
          description:
            '提供两种功能：(1) 测名分析（action="analyze"）— 输入姓名，返回五格数理评分、三才配置、笔画拆解、吉凶判定，可选提供出生时间以匹配八字五行；(2) 智能起名（action="generate"）— 输入姓氏和条件，自动生成高分候选名字。当用户想给孩子取名、测算姓名吉凶、了解名字的数理含义时使用。',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['action'],
                  properties: {
                    action: {
                      type: 'string',
                      enum: ['analyze', 'generate'],
                      description: '操作类型。analyze = 测名分析；generate = 智能起名。',
                    },
                    // ---- analyze 参数 ----
                    name: { type: 'string', description: '待分析的姓名（analyze 必填）', example: '张三丰' },
                    // ---- generate 参数 ----
                    surname: { type: 'string', description: '姓氏（generate 必填）', example: '张' },
                    gender: {
                      type: 'string',
                      enum: ['male', 'female'],
                      default: 'male',
                      description: '性别（generate 可选），影响用字风格。',
                    },
                    nameLength: {
                      type: 'integer',
                      enum: [1, 2],
                      default: 2,
                      description: '名字字数。1 = 单字名，2 = 双字名（默认）。',
                    },
                    fixedFirstChar: { type: 'string', description: '指定名字第一个字（generate 可选）' },
                    fixedSecondChar: { type: 'string', description: '指定名字第二个字（generate 可选，双字名）' },
                    avoidChars: {
                      type: 'array',
                      items: { type: 'string' },
                      description: '需要避开的字（generate 可选）',
                    },
                    limit: {
                      type: 'integer',
                      default: 20,
                      description: '返回候选名字数量，默认 20，上限 50。',
                      maximum: 50,
                    },
                    // ---- 共用参数 ----
                    birthYear: { type: 'integer', description: '出生年（可选，用于八字五行匹配）' },
                    birthMonth: { type: 'integer', description: '出生月（可选）' },
                    birthDay: { type: 'integer', description: '出生日（可选）' },
                    birthHour: { type: 'integer', description: '出生时（可选，0-23）' },
                  },
                },
              },
            },
          },
          responses: {
            '200': refOkResponse('测名分析结果或候选名字列表'),
            '400': refErrorResponse(),
            '500': refErrorResponse(),
          },
        },
      },
    },
  };
}

/* ---- 复用的响应 Schema 片段 ---- */

function refOkResponse(desc: string) {
  return {
    description: desc,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: true },
            data: { type: 'object', description: desc },
          },
        },
      },
    },
  };
}

function refErrorResponse() {
  return {
    description: '请求错误',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            ok: { type: 'boolean', example: false },
            error: { type: 'string', example: '缺少必填参数: year' },
          },
        },
      },
    },
  };
}
