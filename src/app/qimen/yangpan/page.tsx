'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import YangpanBoard from '@/components/qimen/YangpanBoard';
import YangpanAnalysisPanel from '@/components/qimen/YangpanAnalysisPanel';
import { calculateYangpan } from '@/lib/qimen/yangpanPipeline';
import { analyzeYangpan } from '@/lib/qimen/yangpanAnalysis';
import type { YangpanPaiPanResult, YangpanAnalysisResult, JiGongType, ScenarioType } from '@/lib/qimen/types';

const SUB_TABS = [
  { href: '/qimen/lucking', label: '阴盘遁甲' },
  { href: '/qimen/yangpan', label: '阳盘排盘' },
];

const METHOD_OPTIONS = [
  { value: 'chaiBu', label: '拆补法' },
  { value: 'zhiRun', label: '置闰法' },
  { value: 'maoShan', label: '茅山法' },
] as const;

const SCENARIO_OPTIONS = [
  { value: '', label: '不选择场景' },
  { value: 'career', label: '事业运' },
  { value: 'wealth', label: '财运' },
  { value: 'love', label: '婚姻感情' },
  { value: 'health', label: '健康' },
  { value: 'lawsuit', label: '诉讼官司' },
  { value: 'travel', label: '出行' },
];

export default function YangpanPage() {
  const pathname = usePathname();
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());
  const [hour, setHour] = useState(now.getHours());
  const [minute, setMinute] = useState(now.getMinutes());
  const [method, setMethod] = useState<'chaiBu' | 'zhiRun' | 'maoShan'>('chaiBu');
  const [jiGong, setJiGong] = useState<JiGongType>(2);
  const [scenario, setScenario] = useState<ScenarioType | ''>('');
  const [result, setResult] = useState<YangpanPaiPanResult | null>(null);
  const [analysis, setAnalysis] = useState<YangpanAnalysisResult | null>(null);
  const [showJuDetail, setShowJuDetail] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    try {
      const data = calculateYangpan({ year, month, day, hour, minute, method, jiGong });
      setResult(data);
      const analysisResult = analyzeYangpan(data, scenario || undefined);
      setAnalysis(analysisResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : '排盘失败，请检查输入');
      setResult(null);
      setAnalysis(null);
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

      {/* 输入配置 */}
      <div className="card-chinese p-5 space-y-4">
        {/* 时间选择 */}
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

        {/* 定局法 + 寄宫 + 场景 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 定局法 */}
          <div>
            <label className="form-label">定局法</label>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border-warm)' }}>
              {METHOD_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setMethod(opt.value)}
                  className="flex-1 py-1.5 text-sm font-medium transition-all"
                  style={{
                    backgroundColor: method === opt.value ? 'var(--color-cinnabar)' : 'transparent',
                    color: method === opt.value ? '#fff' : 'var(--color-ink)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 寄宫 */}
          <div>
            <label className="form-label">天禽寄宫</label>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border-warm)' }}>
              <button
                onClick={() => setJiGong(2)}
                className="flex-1 py-1.5 text-sm font-medium transition-all"
                style={{
                  backgroundColor: jiGong === 2 ? 'var(--color-cinnabar)' : 'transparent',
                  color: jiGong === 2 ? '#fff' : 'var(--color-ink)',
                }}
              >
                寄坤二宫
              </button>
              <button
                onClick={() => setJiGong(8)}
                className="flex-1 py-1.5 text-sm font-medium transition-all"
                style={{
                  backgroundColor: jiGong === 8 ? 'var(--color-cinnabar)' : 'transparent',
                  color: jiGong === 8 ? '#fff' : 'var(--color-ink)',
                }}
              >
                寄艮八宫
              </button>
            </div>
          </div>

          {/* 场景选择 */}
          <div>
            <label className="form-label">场景测算</label>
            <select
              className="form-input w-full"
              value={scenario}
              onChange={e => setScenario(e.target.value as ScenarioType | '')}
            >
              {SCENARIO_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button className="btn-primary flex-1" onClick={handleSubmit}>排盘</button>
          <button className="btn-outline" onClick={handleUseNow}>当前时间</button>
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
          <YangpanBoard data={result} />

          {/* 定局推演过程（可折叠） */}
          <div className="card-chinese p-4">
            <button
              onClick={() => setShowJuDetail(!showJuDetail)}
              className="w-full text-left text-sm font-medium flex items-center justify-between"
              style={{ color: 'var(--color-primary-dark)' }}
            >
              <span>定局推演过程</span>
              <span style={{ fontSize: 12 }}>{showJuDetail ? '▲ 收起' : '▼ 展开'}</span>
            </button>
            {showJuDetail && (
              <pre
                className="mt-3 p-3 rounded-lg text-sm whitespace-pre-wrap"
                style={{
                  backgroundColor: 'var(--color-cream)',
                  color: 'var(--color-ink)',
                  fontFamily: 'var(--font-family-song)',
                  lineHeight: 1.8,
                }}
              >
                {result.juResult.debugInfo}
              </pre>
            )}
          </div>

          {/* 分析面板 */}
          {analysis && <YangpanAnalysisPanel data={result} analysis={analysis} />}
        </>
      )}
    </div>
  );
}
