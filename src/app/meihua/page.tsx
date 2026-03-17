'use client';

import { useState } from 'react';
import QuaStartTab from '@/components/meihua/QuaStartTab';
import QuaPanel from '@/components/meihua/QuaPanel';
import QuaAnalysis from '@/components/meihua/QuaAnalysis';
import {
  performAnalysis,
  type DivinationResult,
  type MeihuaAnalysis,
} from '@/lib/meihua';

type TabKey = 'paipan' | 'analysis';

export default function MeihuaPage() {
  const [result, setResult] = useState<DivinationResult | null>(null);
  const [analysis, setAnalysis] = useState<MeihuaAnalysis | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('paipan');

  const handleResult = (res: DivinationResult) => {
    setError('');
    try {
      const ana = performAnalysis(res);
      setResult(res);
      setAnalysis(ana);
      setActiveTab('paipan');
    } catch (e) {
      setError(e instanceof Error ? e.message : '分析失败');
    }
  };

  const handleError = (msg: string) => {
    setError(msg);
    setResult(null);
    setAnalysis(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h1
          className="text-2xl md:text-3xl font-bold"
          style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
        >
          梅花易数排盘
        </h1>
        <p className="text-base mt-2" style={{ color: 'var(--color-ink-light)' }}>
          支持时间起卦、数字起卦、文字起卦三种方式
        </p>
      </div>

      {/* 起卦区域 */}
      <QuaStartTab onResult={handleResult} onError={handleError} />

      {/* 错误提示 */}
      {error && (
        <div
          className="p-4 rounded-xl text-base"
          style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
        >
          {error}
        </div>
      )}

      {/* 结果区域 */}
      {result && analysis && (
        <>
          {/* 结果 Tab */}
          <div className="flex rounded-xl p-1" style={{ backgroundColor: 'var(--color-parchment)' }}>
            {([
              { key: 'paipan' as TabKey, label: '排盘结果', icon: '☯' },
              { key: 'analysis' as TabKey, label: '辅助分析', icon: '📊' },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 py-2.5 px-3 rounded-lg text-base font-medium transition-all"
                style={{
                  backgroundColor: activeTab === tab.key ? '#fff' : 'transparent',
                  color: activeTab === tab.key ? 'var(--color-cinnabar)' : 'var(--color-ink-light)',
                  boxShadow: activeTab === tab.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  fontFamily: 'var(--font-family-kai)',
                }}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 内容 */}
          {activeTab === 'paipan' && <QuaPanel result={result} />}
          {activeTab === 'analysis' && <QuaAnalysis result={result} analysis={analysis} />}
        </>
      )}
    </div>
  );
}
