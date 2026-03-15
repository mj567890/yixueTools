export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border-warm)] bg-[var(--color-bg-card)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* 品牌 */}
          <div>
            <h3
              className="text-lg font-bold mb-3"
              style={{
                fontFamily: 'var(--font-family-kai)',
                color: 'var(--color-primary-dark)',
              }}
            >
              嘉嘉易学工具箱
            </h3>
            {/* text-sm→text-base(16px) */}
            <p className="text-base text-[var(--color-ink-light)] leading-relaxed">
              传承国学经典，融合现代科技。提供专业的公农历查询、八字排盘、梅花易数、奇门遁甲等易学工具。
            </p>
          </div>

          {/* 快捷链接 */}
          <div>
            {/* text-sm→text-[15px] */}
            <h4
              className="text-[15px] font-bold mb-3"
              style={{ color: 'var(--color-primary)' }}
            >
              常用工具
            </h4>
            {/* text-sm→text-[15px] */}
            <ul className="space-y-2 text-[15px] text-[var(--color-ink-light)]">
              <li><a href="/calendar" className="hover:text-[var(--color-cinnabar)] transition-colors no-underline">公农历查询</a></li>
              <li><a href="/bazi" className="hover:text-[var(--color-cinnabar)] transition-colors no-underline">八字排盘</a></li>
              <li><a href="/meihua" className="hover:text-[var(--color-cinnabar)] transition-colors no-underline">梅花排盘</a></li>
              <li><a href="/qimen" className="hover:text-[var(--color-cinnabar)] transition-colors no-underline">奇门排盘</a></li>
            </ul>
          </div>

          {/* 声明 */}
          <div>
            <h4
              className="text-[15px] font-bold mb-3"
              style={{ color: 'var(--color-primary)' }}
            >
              免责声明
            </h4>
            {/* text-xs→text-sm(14px) */}
            <p className="text-sm text-[var(--color-ink-light)] leading-relaxed">
              本工具仅供学术研究与文化传承参考，所有排盘及推算结果不构成任何形式的决策建议。
              命理学属于传统文化范畴，请理性看待，切勿迷信。
            </p>
          </div>
        </div>

        <hr className="divider-chinese !my-4" />

        {/* text-xs→text-sm(14px) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-[var(--color-ink-light)]">
          <span>&copy; {new Date().getFullYear()} 嘉嘉易学工具箱 · 仅供学习研究</span>
          <span>历法数据来源：lunar-javascript 开源库</span>
        </div>
      </div>
    </footer>
  );
}
