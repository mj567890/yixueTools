import Link from 'next/link';

const tools = [
  {
    href: '/calendar',
    icon: '📅',
    title: '玉匣通书',
    desc: '日期转换、四柱八字、纳音五行、节气查询、民俗择吉、穿衣指南、称骨论命',
    color: 'var(--color-cinnabar)',
  },
  {
    href: '/bazi',
    icon: '🔮',
    title: '八字排盘',
    desc: '根据出生时间排出四柱八字，分析十神、大运、流年',
    color: 'var(--color-primary)',
  },
  {
    href: '/meihua',
    icon: '🌸',
    title: '梅花排盘',
    desc: '梅花易数起卦排盘，支持时间起卦、数字起卦等多种方式',
    color: '#C2185B',
  },
  {
    href: '/qimen',
    icon: '🧭',
    title: '奇门排盘',
    desc: '奇门遁甲排盘，含天地人三盘、九星八门、八神等要素',
    color: '#1565C0',
  },
  {
    href: '/liuyao',
    icon: '⚊',
    title: '六爻排盘',
    desc: '六爻纳甲排盘，自动装卦、配六亲世应、变爻提示',
    color: '#2E7D32',
  },
  {
    href: '/taiyi',
    icon: '☯',
    title: '太乙排盘',
    desc: '太乙神数排盘推演，古三式之首，测国运大事',
    color: '#4527A0',
  },
  {
    href: '/naming',
    icon: '✍',
    title: '起名测名',
    desc: '结合五格、三才、生辰八字进行姓名吉凶分析',
    color: '#00695C',
  },
  {
    href: '/docs',
    icon: '📡',
    title: '开发文档',
    desc: 'API 接口手册、AI Skills 接入指南，供第三方网站和 AI 平台调用',
    color: '#37474F',
  },
];

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Hero */}
      <section className="text-center mb-12">
        {/* 装饰符号 */}
        <div
          className="text-2xl mb-4 tracking-[0.5em] opacity-40"
          style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-family-kai)' }}
        >
          ☰ ☷ ☵ ☲
        </div>
        <h1
          className="text-4xl md:text-5xl font-bold mb-3 tracking-wide"
          style={{
            fontFamily: 'var(--font-family-kai)',
            color: 'var(--color-primary-dark)',
          }}
        >
          嘉嘉易学工具箱
        </h1>
        <p className="text-lg text-[var(--color-ink-light)] max-w-2xl mx-auto leading-relaxed">
          传承国学经典 · 融合现代科技
        </p>
        <p className="text-base text-[var(--color-ink-light)] mt-2 opacity-70">
          专业的历法择吉、命理排盘与易学研究工具集
        </p>
        {/* 装饰分隔 */}
        <div className="mt-6 flex items-center justify-center gap-3 opacity-30">
          <span
            className="block h-[1px] w-16"
            style={{ background: 'linear-gradient(to right, transparent, var(--color-cinnabar))' }}
          />
          <span style={{ color: 'var(--color-cinnabar)', fontSize: '12px' }}>&#9672;</span>
          <span
            className="block h-[1px] w-16"
            style={{ background: 'linear-gradient(to left, transparent, var(--color-cinnabar))' }}
          />
        </div>
      </section>

      <hr className="divider-chinese" />

      {/* 工具卡片网格 */}
      <section>
        <h2 className="section-title mb-8">全部工具</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="card-chinese p-5 flex flex-col gap-3 no-underline group"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-10 h-10 flex items-center justify-center rounded-lg text-xl"
                  style={{ backgroundColor: tool.color + '15', }}
                >
                  {tool.icon}
                </span>
                {/* text-base→text-[17px] 卡片标题微调 */}
                <h3
                  className="text-[17px] font-bold group-hover:text-[var(--color-cinnabar)] transition-colors"
                  style={{ color: 'var(--color-primary-dark)' }}
                >
                  {tool.title}
                </h3>
              </div>
              {/* text-sm→text-base(16px) */}
              <p className="text-base text-[var(--color-ink-light)] leading-relaxed">
                {tool.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <hr className="divider-chinese" />

      {/* 特色说明 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            title: '数据权威',
            desc: '采用 lunar-javascript 开源历法库，确保公农历转换、节气计算精准可靠',
            icon: '🎯',
          },
          {
            title: '经典传承',
            desc: '涵盖八字、梅花、奇门、六爻、太乙等主流易学体系，算法遵循古籍原典',
            icon: '📚',
          },
          {
            title: '隐私安全',
            desc: '所有计算均在本地完成，个人信息不上传服务器，笔记数据本地存储',
            icon: '🔒',
          },
        ].map((item) => (
          <div key={item.title} className="text-center p-6">
            <span className="text-3xl mb-3 block">{item.icon}</span>
            <h3
              className="text-[17px] font-bold mb-2"
              style={{
                fontFamily: 'var(--font-family-kai)',
                color: 'var(--color-primary-dark)',
              }}
            >
              {item.title}
            </h3>
            {/* text-sm→text-base(16px) */}
            <p className="text-base text-[var(--color-ink-light)]">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
