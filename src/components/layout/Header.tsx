'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: '首页', icon: '🏠' },
  { href: '/calendar', label: '公农历查询', icon: '📅' },
  { href: '/bazi', label: '八字排盘', icon: '🔮' },
  { href: '/meihua', label: '梅花排盘', icon: '🌸' },
  { href: '/qimen', label: '奇门排盘', icon: '🧭' },
  { href: '/liuyao', label: '六爻排盘', icon: '⚊' },
  { href: '/taiyi', label: '太乙排盘', icon: '☯' },
  { href: '/naming', label: '起名测名', icon: '✍' },
  { href: '/about', label: '关于', icon: '💡' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-bg-card)]/95 backdrop-blur border-b border-[var(--color-border-warm)]">
      <div className="max-w-7xl mx-auto px-4">
        {/* 顶栏 */}
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="text-2xl">☰</span>
            <span
              className="text-xl font-bold tracking-wider"
              style={{
                fontFamily: 'var(--font-family-kai)',
                color: 'var(--color-primary-dark)',
              }}
            >
              嘉嘉易学工具箱
            </span>
          </Link>

          {/* 桌面导航 */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-base transition-colors no-underline ${
                  (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/')))
                    ? 'bg-[var(--color-cinnabar)] text-white'
                    : 'text-[var(--color-ink-light)] hover:bg-[var(--color-parchment)]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 移动端菜单按钮 */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--color-parchment)] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="菜单"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 移动端导航 — text-xs→text-sm(14px) */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-[var(--color-border-warm)] bg-[var(--color-bg-card)]">
          <div className="grid grid-cols-3 gap-1 p-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg text-sm no-underline transition-colors ${
                  pathname === item.href
                    ? 'bg-[var(--color-cinnabar)] text-white'
                    : 'text-[var(--color-ink-light)] hover:bg-[var(--color-parchment)]'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
