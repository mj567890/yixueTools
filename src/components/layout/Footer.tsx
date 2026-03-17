import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border-warm)] bg-[var(--color-bg-card)]">
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-6">

        {/* 上部：品牌 + 免责 + 公益 三列 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
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
            <p className="text-sm text-[var(--color-ink-light)] leading-relaxed">
              传承国学经典，融合现代科技。提供专业的玉匣通书、八字排盘、梅花易数、奇门遁甲等易学工具。所有计算均在本地完成，个人信息不上传服务器。
            </p>
          </div>

          {/* 免责声明 */}
          <div>
            <h4
              className="text-[15px] font-bold mb-3"
              style={{ color: 'var(--color-primary)' }}
            >
              免责声明
            </h4>
            <p className="text-sm text-[var(--color-ink-light)] leading-relaxed">
              本工具仅供学术研究与文化传承参考，所有排盘及推算结果不构成任何形式的决策建议。命理学属于传统文化范畴，请理性看待，切勿迷信。
            </p>
          </div>

          {/* 公益 */}
          <div>
            <h4
              className="text-[15px] font-bold mb-3"
              style={{ color: 'var(--color-primary)' }}
            >
              以微光汇聚善意
            </h4>
            <p className="text-sm text-[var(--color-ink-light)] leading-relaxed mb-3">
              本软件完全免费。若您觉得有所帮助，欢迎前往韩红爱心慈善基金会略尽绵薄之力。
            </p>
            <a
              href="https://www.hhax.org/owe/lovedonate?typeGuid=donateType"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium no-underline transition-colors"
              style={{ color: 'var(--color-cinnabar)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              韩红爱心慈善基金会
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>
        </div>

        {/* 装饰分隔线 */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--color-border-warm))' }} />
          <span className="text-xs" style={{ color: 'var(--color-gold)', letterSpacing: '0.3em' }}>
            &#9776; &#9777; &#9778; &#9779; &#9780; &#9781; &#9782; &#9783;
          </span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, var(--color-border-warm))' }} />
        </div>

        {/* 底栏 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--color-ink-light)]">
          <span>&copy; {new Date().getFullYear()} 嘉嘉易学工具箱 &middot; 仅供学习研究</span>
          <div className="flex items-center gap-3">
            <span>历法数据来源：lunar-javascript</span>
            <span>&middot;</span>
            <Link href="/about" className="no-underline hover:underline" style={{ color: 'var(--color-cinnabar)' }}>
              关于
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
