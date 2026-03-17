'use client';

import { useState } from 'react';
import Link from 'next/link';

/* ================================================================
 *  Tab 定义
 * ================================================================ */
type TabKey = 'api' | 'skills';

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'api', label: 'API 手册', icon: '📡' },
  { key: 'skills', label: 'AI Skills 接入', icon: '🤖' },
];

/* ================================================================
 *  API 端点数据
 * ================================================================ */
const endpoints = [
  {
    id: 'calendar',
    title: '玉匣通书',
    path: 'POST /api/v1/calendar',
    desc: '公农历转换、四柱干支、纳音五行、节气查询、称骨论命',
    params: [
      { name: 'year', type: 'number', required: true, desc: '公历年份' },
      { name: 'month', type: 'number', required: true, desc: '公历月份 (1-12)' },
      { name: 'day', type: 'number', required: true, desc: '公历日 (1-31)' },
      { name: 'hour', type: 'number', required: false, desc: '小时 (0-23)，提供后额外计算称骨' },
    ],
    example: '{"year": 2024, "month": 6, "day": 15, "hour": 8}',
  },
  {
    id: 'bazi',
    title: '八字排盘',
    path: 'POST /api/v1/bazi',
    desc: '四柱八字排盘、大运排列、十维度分析、综合解读',
    params: [
      { name: 'year', type: 'number', required: true, desc: '公历出生年份' },
      { name: 'month', type: 'number', required: true, desc: '公历出生月份 (1-12)' },
      { name: 'day', type: 'number', required: true, desc: '公历出生日 (1-31)' },
      { name: 'hour', type: 'number', required: true, desc: '出生小时 (0-23)' },
      { name: 'gender', type: 'number', required: false, desc: '1=男(默认), 0=女' },
    ],
    example: '{"year": 1990, "month": 3, "day": 15, "hour": 10, "gender": 1}',
  },
  {
    id: 'meihua',
    title: '梅花易数',
    path: 'POST /api/v1/meihua',
    desc: '时间/数字/文字三种起卦方式，体用五行生克分析',
    params: [
      { name: 'method', type: 'string', required: true, desc: '"time" / "number" / "text"' },
      { name: 'year/month/day/hour', type: 'number', required: false, desc: '时间起卦必填' },
      { name: 'upper/lower/moving', type: 'number', required: false, desc: '数字起卦必填' },
      { name: 'text', type: 'string', required: false, desc: '文字起卦必填' },
      { name: 'question', type: 'string', required: false, desc: '所测之事' },
    ],
    example: '{"method": "time", "year": 2024, "month": 6, "day": 15, "hour": 10, "question": "今日运势"}',
  },
  {
    id: 'liuyao',
    title: '六爻纳甲',
    path: 'POST /api/v1/liuyao',
    desc: '四种起卦方式、京房/藏山卜双流派、十大场景分析',
    params: [
      { name: 'method', type: 'string', required: true, desc: '"time" / "coin" / "number" / "manual"' },
      { name: 'year/month/day/hour', type: 'number', required: true, desc: '公历日期时间' },
      { name: 'school', type: 'string', required: false, desc: '"jingfang"(默认) / "cangshanbu"' },
      { name: 'scenario', type: 'string', required: false, desc: '场景: qiucai/wenbing/kaoshi/hunlian/shiye/shiwu/guansi/chuxing/zhaizang/qiuqian' },
      { name: 'coinResults/numberInput/rawYaoTypes', type: 'varies', required: false, desc: '对应起卦方式的数据' },
    ],
    example: '{"method": "time", "year": 2024, "month": 6, "day": 15, "hour": 10, "scenario": "qiucai"}',
  },
  {
    id: 'qimen',
    title: '奇门遁甲',
    path: 'POST /api/v1/qimen',
    desc: '阴盘(王凤麟派) + 阳盘(拆补/置闰/茅山)，九宫格局分析',
    params: [
      { name: 'pan', type: 'string', required: false, desc: '"yin"(默认) / "yang"' },
      { name: 'year/month/day/hour', type: 'number', required: true, desc: '公历日期时间' },
      { name: 'minute', type: 'number', required: false, desc: '分钟 (0-59)，默认 0' },
      { name: 'method', type: 'string', required: false, desc: '阳盘定局法: "chaiBu"(默认) / "zhiRun" / "maoShan"' },
      { name: 'jiGong', type: 'number', required: false, desc: '天禽寄宫: 2(坤宫,默认) / 8(艮宫)' },
      { name: 'scenario', type: 'string', required: false, desc: '阳盘场景: career/wealth/love/health/lawsuit/travel' },
    ],
    example: '{"pan": "yin", "year": 2024, "month": 6, "day": 15, "hour": 10}',
  },
  {
    id: 'taiyi',
    title: '太乙神数',
    path: 'POST /api/v1/taiyi',
    desc: '统宗/金镜两派，年/月/日/时四计，宏观趋势推算',
    params: [
      { name: 'year/month/day/hour', type: 'number', required: true, desc: '公历日期时间' },
      { name: 'minute', type: 'number', required: false, desc: '分钟，默认 0' },
      { name: 'school', type: 'string', required: false, desc: '"tongzong"(默认) / "jinjing"' },
      { name: 'calcType', type: 'string', required: false, desc: '"year"(默认) / "month" / "day" / "hour"' },
      { name: 'scenario', type: 'string', required: false, desc: '场景: guoyun/zhanzheng/tianshi/renshi/jibing/zayi' },
    ],
    example: '{"year": 2024, "month": 6, "day": 15, "hour": 10, "school": "tongzong", "calcType": "year"}',
  },
  {
    id: 'naming',
    title: '起名测名',
    path: 'POST /api/v1/naming',
    desc: '五格数理分析 + 三才配置 + 智能起名推荐',
    params: [
      { name: 'action', type: 'string', required: true, desc: '"analyze"(测名) / "generate"(起名)' },
      { name: 'name', type: 'string', required: false, desc: '测名必填，待分析的姓名' },
      { name: 'surname', type: 'string', required: false, desc: '起名必填，姓氏' },
      { name: 'gender', type: 'string', required: false, desc: '"male"(默认) / "female"' },
      { name: 'nameLength', type: 'number', required: false, desc: '名字字数: 1 或 2(默认)' },
      { name: 'birthYear/Month/Day/Hour', type: 'number', required: false, desc: '出生时间（可选，用于八字匹配）' },
      { name: 'limit', type: 'number', required: false, desc: '起名返回数量，默认 20，上限 50' },
    ],
    example: '{"action": "analyze", "name": "张三丰"}',
  },
];

/* ================================================================
 *  Skills 数据
 * ================================================================ */
const skillsList = [
  {
    name: 'calendar',
    title: '公农历查询',
    desc: '当用户想查询某一天的农历日期、天干地支、纳音五行、节气信息或称骨论命时使用',
    icon: '📅',
  },
  {
    name: 'bazi',
    title: '八字命理分析',
    desc: '当用户想了解自己或他人的命理格局、五行强弱、十神关系、大运走势时使用',
    icon: '🔮',
  },
  {
    name: 'meihua',
    title: '梅花易数占卜',
    desc: '当用户想通过梅花易数进行占卜预测时使用，支持时间/数字/文字三种起卦方式',
    icon: '🌸',
  },
  {
    name: 'liuyao',
    title: '六爻纳甲预测',
    desc: '当用户想预测具体事项（求财、问病、考试、婚恋、事业等）时使用',
    icon: '⚊',
  },
  {
    name: 'qimen',
    title: '奇门遁甲决策',
    desc: '当用户想使用奇门遁甲进行择时、决策、预测时使用，被誉为"帝王之术"',
    icon: '🧭',
  },
  {
    name: 'taiyi',
    title: '太乙神数推演',
    desc: '当用户想使用太乙神数进行宏观预测时使用，"三式"之首，测国运大事',
    icon: '☯',
  },
  {
    name: 'naming',
    title: '姓名学分析',
    desc: '当用户想给孩子取名、测算姓名吉凶、了解名字的数理含义时使用',
    icon: '✍',
  },
];

/* ================================================================
 *  页面组件
 * ================================================================ */
export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('api');
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* 标题 */}
      <section className="text-center mb-10">
        <h1
          className="text-3xl md:text-4xl font-bold mb-3 tracking-wide"
          style={{
            fontFamily: 'var(--font-family-kai)',
            color: 'var(--color-primary-dark)',
          }}
        >
          开发文档
        </h1>
        <p className="text-base text-[var(--color-ink-light)] max-w-xl mx-auto leading-relaxed">
          完整的 API 接口手册与 AI 平台接入指南
        </p>
        <div
          className="w-20 h-0.5 mx-auto mt-4 rounded-full"
          style={{ backgroundColor: 'var(--color-cinnabar)' }}
        />
      </section>

      {/* Tab 切换 */}
      <div className="flex justify-center gap-3 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-5 py-2.5 rounded-lg text-base font-medium transition-all cursor-pointer border-none"
            style={
              activeTab === tab.key
                ? {
                    background: 'linear-gradient(135deg, var(--color-cinnabar), var(--color-cinnabar-dark))',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(194, 59, 34, 0.3)',
                  }
                : {
                    background: 'var(--color-bg-card)',
                    color: 'var(--color-ink-light)',
                    border: '1px solid var(--color-border-warm)',
                  }
            }
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <hr className="divider-chinese" />

      {/* 内容区 */}
      {activeTab === 'api' ? (
        <ApiManual expandedEndpoint={expandedEndpoint} setExpandedEndpoint={setExpandedEndpoint} />
      ) : (
        <SkillsGuide />
      )}

      {/* 底部导航 */}
      <div className="text-center mt-12">
        <Link
          href="/"
          className="text-sm no-underline transition-colors hover:underline"
          style={{ color: 'var(--color-cinnabar)' }}
        >
          &larr; 返回首页
        </Link>
      </div>
    </div>
  );
}

/* ================================================================
 *  API 手册 Tab
 * ================================================================ */
function ApiManual({
  expandedEndpoint,
  setExpandedEndpoint,
}: {
  expandedEndpoint: string | null;
  setExpandedEndpoint: (id: string | null) => void;
}) {
  return (
    <div>
      {/* 概述 */}
      <div className="card-chinese p-6 mb-8">
        <h2 className="section-title mb-4">概述</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <InfoItem label="请求方式" value="POST（JSON Body）" />
          <InfoItem label="基础路径" value="/api/v1/" />
          <InfoItem label="跨域支持" value="CORS 已启用" />
        </div>
        <div className="mt-5 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-parchment)' }}>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-primary-dark)' }}>
            统一响应格式
          </p>
          <code className="text-sm block leading-relaxed" style={{ color: 'var(--color-ink)' }}>
            {'{ "ok": true, "data": { ... } }'}<br />
            {'{ "ok": false, "error": "错误描述" }'}
          </code>
        </div>
      </div>

      {/* 端点列表 */}
      <h2 className="section-title mb-6">全部端点</h2>
      <div className="space-y-4">
        {endpoints.map((ep) => {
          const isOpen = expandedEndpoint === ep.id;
          return (
            <div key={ep.id} className="card-chinese overflow-hidden" style={isOpen ? {} : undefined}>
              {/* 端点头部 — 可点击展开 */}
              <button
                onClick={() => setExpandedEndpoint(isOpen ? null : ep.id)}
                className="w-full text-left px-6 py-4 flex items-center gap-4 cursor-pointer border-none bg-transparent"
              >
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-md shrink-0"
                  style={{
                    backgroundColor: 'var(--color-cinnabar)',
                    color: 'white',
                  }}
                >
                  POST
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="font-bold text-base"
                      style={{
                        fontFamily: 'var(--font-family-kai)',
                        color: 'var(--color-primary-dark)',
                      }}
                    >
                      {ep.title}
                    </span>
                    <code className="text-sm" style={{ color: 'var(--color-ink-light)' }}>
                      /api/v1/{ep.id}
                    </code>
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-ink-light)' }}>
                    {ep.desc}
                  </p>
                </div>
                <span
                  className="text-lg transition-transform shrink-0"
                  style={{
                    color: 'var(--color-ink-light)',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  &#9662;
                </span>
              </button>

              {/* 展开内容 */}
              {isOpen && (
                <div
                  className="px-6 pb-5 border-t"
                  style={{ borderColor: 'var(--color-border-warm)' }}
                >
                  {/* 参数表 */}
                  <h4
                    className="text-sm font-bold mt-4 mb-3"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    请求参数
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr
                          style={{
                            backgroundColor: 'var(--color-parchment)',
                            color: 'var(--color-primary-dark)',
                          }}
                        >
                          <th className="text-left px-3 py-2 font-semibold">参数</th>
                          <th className="text-left px-3 py-2 font-semibold">类型</th>
                          <th className="text-center px-3 py-2 font-semibold">必填</th>
                          <th className="text-left px-3 py-2 font-semibold">说明</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ep.params.map((p, i) => (
                          <tr
                            key={p.name}
                            style={{
                              borderBottom: '1px solid var(--color-border-warm)',
                              backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--color-parchment)33',
                            }}
                          >
                            <td className="px-3 py-2">
                              <code className="font-semibold" style={{ color: 'var(--color-cinnabar-dark)' }}>
                                {p.name}
                              </code>
                            </td>
                            <td className="px-3 py-2" style={{ color: 'var(--color-ink-light)' }}>
                              {p.type}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {p.required ? (
                                <span style={{ color: 'var(--color-cinnabar)' }}>*</span>
                              ) : (
                                <span style={{ color: 'var(--color-ink-light)' }}>-</span>
                              )}
                            </td>
                            <td className="px-3 py-2" style={{ color: 'var(--color-ink)' }}>
                              {p.desc}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 示例 */}
                  <h4
                    className="text-sm font-bold mt-5 mb-2"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    请求示例
                  </h4>
                  <pre
                    className="p-4 rounded-lg text-sm leading-relaxed overflow-x-auto"
                    style={{
                      backgroundColor: '#2d2015',
                      color: '#f0e6d8',
                    }}
                  >
                    <span style={{ color: '#999' }}>curl -X POST</span>{' '}
                    <span style={{ color: '#DAA520' }}>http://localhost:3000/api/v1/{ep.id}</span>{' '}
                    \{'\n'}
                    {'  '}<span style={{ color: '#999' }}>-H</span>{' '}
                    <span style={{ color: '#98c379' }}>&quot;Content-Type: application/json&quot;</span>{' '}
                    \{'\n'}
                    {'  '}<span style={{ color: '#999' }}>-d</span>{' '}
                    <span style={{ color: '#98c379' }}>&apos;{ep.example}&apos;</span>
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 注意事项 */}
      <div className="card-chinese p-6 mt-8">
        <h2 className="section-title mb-4">注意事项</h2>
        <ul className="space-y-2 mt-5 text-sm" style={{ color: 'var(--color-ink)' }}>
          <li className="flex gap-2">
            <span style={{ color: 'var(--color-cinnabar)' }}>&#9670;</span>
            所有时间参数均基于公历，hour 为 24 小时制 (0-23)
          </li>
          <li className="flex gap-2">
            <span style={{ color: 'var(--color-cinnabar)' }}>&#9670;</span>
            分析类字段（analysis、interpretation）采用宽容策略：计算失败时返回 null，不影响主结果
          </li>
          <li className="flex gap-2">
            <span style={{ color: 'var(--color-cinnabar)' }}>&#9670;</span>
            API 计算结果与网页前端完全一致，共用同一套计算引擎
          </li>
          <li className="flex gap-2">
            <span style={{ color: 'var(--color-cinnabar)' }}>&#9670;</span>
            HTTP 状态码：200 成功 / 400 参数错误 / 500 计算异常
          </li>
        </ul>
      </div>
    </div>
  );
}

/* ================================================================
 *  AI Skills 接入 Tab
 * ================================================================ */
function SkillsGuide() {
  return (
    <div>
      {/* 介绍 */}
      <div className="card-chinese p-6 mb-8">
        <h2 className="section-title mb-4">什么是 AI Skills</h2>
        <p className="text-base mt-5 leading-[1.8]" style={{ color: 'var(--color-ink)' }}>
          嘉嘉易学工具箱提供标准的 AI 平台发现协议，可作为 AI 助手的"技能"被自动识别和调用。
          支持 OpenClaw、Coze、Dify、ChatGPT Plugins 等主流 AI 平台。AI 助手将根据用户意图自动选择对应的易学计算能力。
        </p>
      </div>

      {/* 接入步骤 */}
      <h2 className="section-title mb-6">接入步骤</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[
          {
            step: '1',
            title: '部署服务',
            desc: '将本服务部署到公网可访问的域名',
            detail: '支持 Vercel / Docker / 任意 Node.js 托管环境',
          },
          {
            step: '2',
            title: '填入域名',
            desc: '在 AI 平台中填入您的域名地址',
            detail: '平台会自动拉取 /.well-known/ai-plugin.json',
          },
          {
            step: '3',
            title: '自动注册',
            desc: '平台读取 OpenAPI 规范后自动注册全部技能',
            detail: '7 个易学计算技能即刻可用',
          },
        ].map((item) => (
          <div key={item.step} className="card-chinese p-5 text-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--color-cinnabar), var(--color-cinnabar-dark))',
                color: 'white',
              }}
            >
              {item.step}
            </div>
            <h3
              className="font-bold text-base mb-1"
              style={{
                fontFamily: 'var(--font-family-kai)',
                color: 'var(--color-primary-dark)',
              }}
            >
              {item.title}
            </h3>
            <p className="text-sm mb-2" style={{ color: 'var(--color-ink)' }}>
              {item.desc}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-ink-light)' }}>
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      {/* 发现端点 */}
      <h2 className="section-title mb-6">发现端点</h2>
      <div className="card-chinese overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--color-parchment)' }}>
              <th
                className="text-left px-5 py-3 font-semibold"
                style={{ color: 'var(--color-primary-dark)' }}
              >
                端点
              </th>
              <th
                className="text-left px-5 py-3 font-semibold"
                style={{ color: 'var(--color-primary-dark)' }}
              >
                用途
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              { path: 'GET /.well-known/ai-plugin.json', desc: 'AI 插件清单 — 平台自动扫描此路径' },
              { path: 'GET /api/v1/openapi.json', desc: 'OpenAPI 3.1 完整规范 — 自动适配当前域名' },
              { path: 'GET /api/v1/health', desc: '健康检查 — 平台探活、状态监控' },
            ].map((item, i) => (
              <tr
                key={item.path}
                style={{
                  borderBottom: '1px solid var(--color-border-warm)',
                  backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--color-parchment)33',
                }}
              >
                <td className="px-5 py-3">
                  <code className="font-semibold text-sm" style={{ color: 'var(--color-cinnabar-dark)' }}>
                    {item.path}
                  </code>
                </td>
                <td className="px-5 py-3" style={{ color: 'var(--color-ink)' }}>
                  {item.desc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 7 个技能 */}
      <h2 className="section-title mb-6">可用技能一览</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--color-ink-light)' }}>
        以下技能会被 AI 平台自动注册。每个技能的描述经过语义优化，帮助 AI 准确理解何时调用。
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {skillsList.map((skill) => (
          <div key={skill.name} className="card-chinese p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{skill.icon}</span>
              <h4
                className="font-bold text-[15px]"
                style={{
                  fontFamily: 'var(--font-family-kai)',
                  color: 'var(--color-primary-dark)',
                }}
              >
                {skill.title}
              </h4>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-light)' }}>
              {skill.desc}
            </p>
            <div className="mt-2">
              <code className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--color-parchment)', color: 'var(--color-primary)' }}>
                /api/v1/{skill.name}
              </code>
            </div>
          </div>
        ))}
      </div>

      {/* 技术细节 */}
      <div className="card-chinese p-6">
        <h2 className="section-title mb-4">技术细节</h2>
        <ul className="space-y-3 mt-5 text-sm" style={{ color: 'var(--color-ink)' }}>
          <li className="flex gap-2">
            <span style={{ color: 'var(--color-cinnabar)' }}>&#9670;</span>
            <div>
              <strong>协议标准：</strong>OpenAPI 3.1.0 + AI Plugin Manifest v1
            </div>
          </li>
          <li className="flex gap-2">
            <span style={{ color: 'var(--color-cinnabar)' }}>&#9670;</span>
            <div>
              <strong>鉴权方式：</strong>当前为 none（无需鉴权），可扩展为 API Key
            </div>
          </li>
          <li className="flex gap-2">
            <span style={{ color: 'var(--color-cinnabar)' }}>&#9670;</span>
            <div>
              <strong>域名自适应：</strong>OpenAPI 规范和插件清单会自动检测当前域名，无需手动配置
            </div>
          </li>
          <li className="flex gap-2">
            <span style={{ color: 'var(--color-cinnabar)' }}>&#9670;</span>
            <div>
              <strong>描述策略：</strong>所有描述针对 AI 理解优化，说明"何时使用"而非"如何实现"，中英双语
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

/* ================================================================
 *  辅助组件
 * ================================================================ */
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-parchment)' }}>
      <p className="text-xs mb-1" style={{ color: 'var(--color-ink-light)' }}>
        {label}
      </p>
      <p className="text-sm font-bold" style={{ color: 'var(--color-primary-dark)' }}>
        {value}
      </p>
    </div>
  );
}
