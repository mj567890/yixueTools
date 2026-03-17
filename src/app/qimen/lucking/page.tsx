'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import YinpanPaipanBoard from '@/components/qimen/YinpanPaipanBoard';
import type { PaipanData } from '@/components/qimen/YinpanPaipanBoard';
import LuckingAnalysisPanel from '@/components/qimen/LuckingAnalysisPanel';
import { yinpan_lucking_data } from '@/lib/qimen/luckingPaipan';

const SUB_TABS = [
  { href: '/qimen/lucking', label: '阴盘遁甲' },
  { href: '/qimen/yangpan', label: '阳盘排盘' },
];

export default function LuckingPage() {
  const pathname = usePathname();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());
  const [hour, setHour] = useState(now.getHours());
  const [minute, setMinute] = useState(now.getMinutes());
  const [result, setResult] = useState<PaipanData | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    try {
      const data = yinpan_lucking_data(year, month, day, hour, minute);
      setResult(data as PaipanData);
    } catch (e) {
      setError(e instanceof Error ? e.message : '排盘失败，请检查输入');
      setResult(null);
    }
  };

  const handleUseNow = () => {
    const n = new Date();
    setYear(n.getFullYear());
    setMonth(n.getMonth() + 1);
    setDay(n.getDate());
    setHour(n.getHours());
    setMinute(n.getMinutes());
  };

  const yearOptions = [];
  for (let y = 1940; y <= 2060; y++) yearOptions.push(y);
  const daysInMonth = new Date(year, month, 0).getDate();
  const dayOptions = [];
  for (let d = 1; d <= daysInMonth; d++) dayOptions.push(d);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h1
          className="text-2xl md:text-3xl font-bold"
          style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
        >
          奇门排盘
        </h1>
        <p className="text-base mt-2" style={{ color: 'var(--color-ink-light)' }}>
          阴盘奇门遁甲
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

      {/* 输入配置 */}
      <div className="card-chinese p-5 space-y-4">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          <div>
            <label className="form-label">年</label>
            <select className="form-input w-full" value={year} onChange={e => setYear(Number(e.target.value))}>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">月</label>
            <select className="form-input w-full" value={month} onChange={e => setMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}月</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">日</label>
            <select className="form-input w-full" value={day > daysInMonth ? daysInMonth : day} onChange={e => setDay(Number(e.target.value))}>
              {dayOptions.map(d => <option key={d} value={d}>{d}日</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">时</label>
            <select className="form-input w-full" value={hour} onChange={e => setHour(Number(e.target.value))}>
              {Array.from({ length: 24 }, (_, i) => i).map(h => (
                <option key={h} value={h}>{String(h).padStart(2, '0')}时</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">分</label>
            <select className="form-input w-full" value={minute} onChange={e => setMinute(Number(e.target.value))}>
              {Array.from({ length: 60 }, (_, i) => i).map(m => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}分</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="btn-primary flex-1" onClick={handleSubmit}>
            排盘
          </button>
          <button className="btn-outline" onClick={handleUseNow}>
            当前时间
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div
          className="p-4 rounded-xl text-base"
          style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
        >
          {error}
        </div>
      )}

      {/* 排盘结果 */}
      {result && (
        <>
          <YinpanPaipanBoard data={result} schoolName="阴盘遁甲" />
          <LuckingAnalysisPanel data={result} />
        </>
      )}
    </div>
  );
}
