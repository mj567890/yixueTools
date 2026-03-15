'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SUB_TABS = [
  { href: '/qimen/lucking', label: '阴盘遁甲' },
  { href: '/qimen/yangpan', label: '阳盘排盘' },
];

export default function YangpanPage() {
  const pathname = usePathname();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h1
          className="text-2xl md:text-3xl font-bold"
          style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
        >
          奇门排盘
        </h1>
        <p className="text-base mt-2" style={{ color: 'var(--color-ink-light)' }}>
          阳盘奇门遁甲
        </p>
      </div>

      {/* 子导航 */}
      <div className="flex rounded-xl p-1" style={{ backgroundColor: 'var(--color-parchment)' }}>
        {SUB_TABS.map(tab => {
          const isActive = pathname === tab.href;
          return isActive ? (
            <span
              key={tab.href}
              className="flex-1 py-2.5 px-3 rounded-lg text-base font-medium text-center"
              style={{
                backgroundColor: '#fff',
                color: 'var(--color-cinnabar)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                fontFamily: 'var(--font-family-kai)',
              }}
            >
              {tab.label}
            </span>
          ) : (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 py-2.5 px-3 rounded-lg text-base font-medium text-center no-underline transition-all"
              style={{ color: 'var(--color-ink-light)' }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* 占位内容 */}
      <div className="card-chinese p-8 text-center">
        <p
          className="text-lg"
          style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-ink-light)' }}
        >
          阳盘排盘功能开发中，敬请期待
        </p>
      </div>
    </div>
  );
}
