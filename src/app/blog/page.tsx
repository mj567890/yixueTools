export default function BlogPage() {
  const articles = [
    { title: '周易入门：六十四卦速查', desc: '系统学习六十四卦的卦象、卦辞与爻辞', tag: '基础' },
    { title: '梅花易数断卦技巧', desc: '从体用关系到外应取象的实战技巧', tag: '进阶' },
    { title: '奇门遁甲基础概念', desc: '天盘、地盘、人盘与九星八门详解', tag: '基础' },
    { title: '八字命理学习路线', desc: '从天干地支到格局用神的学习建议', tag: '入门' },
    { title: '六爻纳甲装卦方法', desc: '详解六爻装卦步骤与六亲配置', tag: '基础' },
    { title: '太乙神数简介', desc: '古三式之首的基本原理与应用场景', tag: '科普' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="section-title text-2xl mb-2">易学博客</h1>
      {/* text-sm→text-base(16px) */}
      <p className="text-base text-[var(--color-ink-light)] mb-6">
        精选易学文章与经典解读，助力学习提升
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((a, i) => (
          <div key={i} className="card-chinese p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span
                className="text-[17px] font-bold"
                style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
              >
                {a.title}
              </span>
              {/* text-xs→text-sm(14px) */}
              <span className="text-sm px-2 py-0.5 rounded bg-[var(--color-parchment)] text-[var(--color-primary)]">
                {a.tag}
              </span>
            </div>
            {/* text-sm→text-base(16px) */}
            <p className="text-base text-[var(--color-ink-light)]">{a.desc}</p>
            {/* text-xs→text-sm(14px) */}
            <span className="text-sm text-[var(--color-cinnabar)] mt-auto cursor-pointer hover:underline">
              阅读全文 →
            </span>
          </div>
        ))}
      </div>

      <div className="card-chinese p-6 mt-8 text-center">
        <p className="text-base text-[var(--color-ink-light)]">
          更多文章持续更新中，欢迎收藏关注
        </p>
      </div>
    </div>
  );
}
