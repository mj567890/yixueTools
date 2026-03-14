export default function ResourcesPage() {
  const resources = [
    { title: '《周易》原文及注解', type: '电子书', icon: '📕', desc: '周易六十四卦完整原文与白话注解' },
    { title: '《梅花易数》全本', type: '电子书', icon: '📗', desc: '邵康节先生梅花易数完整版' },
    { title: '《奇门遁甲入门》', type: '电子书', icon: '📘', desc: '奇门遁甲基础知识系统讲解' },
    { title: '天干地支速查表', type: '工具表', icon: '📋', desc: '干支纳音、五行对照速查工具' },
    { title: '六十甲子纳音表', type: '工具表', icon: '📋', desc: '完整六十甲子纳音五行对照' },
    { title: '二十四节气详解', type: '知识卡', icon: '🗓', desc: '二十四节气的天文意义与民俗' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="section-title text-2xl mb-2">免费资源</h1>
      <p className="text-sm text-[var(--color-ink-light)] mb-6">
        易学经典资料与学习工具，全部免费提供
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {resources.map((r, i) => (
          <div key={i} className="card-chinese p-5 flex gap-4 items-start">
            <span className="text-3xl">{r.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-base font-bold"
                  style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
                >
                  {r.title}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-parchment)] text-[var(--color-gold)]">
                  {r.type}
                </span>
              </div>
              <p className="text-sm text-[var(--color-ink-light)]">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card-chinese p-6 mt-8 text-center">
        <p className="text-sm text-[var(--color-ink-light)]">
          资源持续整理上传中，所有内容仅供学习研究使用
        </p>
      </div>
    </div>
  );
}
