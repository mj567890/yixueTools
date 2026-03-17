'use client';

import { useState, useCallback } from 'react';
import type { LiuYaoResult, LiuYaoAnalysis, SchoolType, UIMode } from '@/lib/liuyao';
import { paipan, performAnalysis } from '@/lib/liuyao';
import type { LiuYaoConfig } from '@/lib/liuyao';
import DivinationTab from '@/components/liuyao/DivinationTab';
import PaipanBoard from '@/components/liuyao/PaipanBoard';
import AnalysisPanel from '@/components/liuyao/AnalysisPanel';

type ResultTab = 'paipan' | 'analysis';

export default function LiuyaoPage() {
  const [school, setSchool] = useState<SchoolType>('jingfang');
  const [uiMode, setUiMode] = useState<UIMode>('beginner');
  const [result, setResult] = useState<LiuYaoResult | null>(null);
  const [analysis, setAnalysis] = useState<LiuYaoAnalysis | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<ResultTab>('paipan');

  const handlePaipan = useCallback((config: LiuYaoConfig) => {
    setError('');
    try {
      const res = paipan({ ...config, school });
      setResult(res);
      // 执行分析引擎
      try {
        const ana = performAnalysis(res);
        setAnalysis(ana);
      } catch {
        setAnalysis(null);
      }
      setActiveTab('paipan');
    } catch (e) {
      setError(e instanceof Error ? e.message : '排盘失败');
      setResult(null);
      setAnalysis(null);
    }
  }, [school]);

  const handleError = useCallback((msg: string) => {
    setError(msg);
    setResult(null);
    setAnalysis(null);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h1
          className="text-2xl md:text-3xl font-bold"
          style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
        >
          六爻纳甲排盘
        </h1>
        <p className="text-base mt-2" style={{ color: 'var(--color-ink-light)' }}>
          支持时间、铜钱、数字、手动四种起卦方式
        </p>
      </div>

      {/* 模式切换栏 */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* UI 模式 */}
        <div className="flex rounded-lg p-0.5" style={{ backgroundColor: 'var(--color-parchment)', border: '1px solid var(--color-border)' }}>
          {([
            { key: 'beginner' as UIMode, label: '白话模式' },
            { key: 'professional' as UIMode, label: '专业模式' },
          ]).map((m) => (
            <button
              key={m.key}
              onClick={() => setUiMode(m.key)}
              className="px-3 py-1.5 rounded-md text-sm font-medium transition-all"
              style={{
                backgroundColor: uiMode === m.key ? 'var(--color-cinnabar)' : 'transparent',
                color: uiMode === m.key ? '#fff' : 'var(--color-ink-light)',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* 流派 */}
        <div className="flex rounded-lg p-0.5" style={{ backgroundColor: 'var(--color-parchment)', border: '1px solid var(--color-border)' }}>
          {([
            { key: 'jingfang' as SchoolType, label: '京房纳甲' },
            { key: 'cangshanbu' as SchoolType, label: '藏山卜' },
          ]).map((s) => (
            <button
              key={s.key}
              onClick={() => setSchool(s.key)}
              className="px-3 py-1.5 rounded-md text-sm font-medium transition-all"
              style={{
                backgroundColor: school === s.key ? 'var(--color-primary-dark)' : 'transparent',
                color: school === s.key ? '#fff' : 'var(--color-ink-light)',
              }}
            >
              {s.label}
              {s.key === 'cangshanbu' && <span className="ml-1 text-xs opacity-70">(Beta)</span>}
            </button>
          ))}
        </div>
      </div>

      {/* 起卦区域 */}
      <DivinationTab onPaipan={handlePaipan} onError={handleError} />

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
      {result && (
        <>
          {/* 结果 Tab */}
          <div className="flex rounded-xl p-1" style={{ backgroundColor: 'var(--color-parchment)' }}>
            {([
              { key: 'paipan' as ResultTab, label: '排盘结果', icon: '☯' },
              { key: 'analysis' as ResultTab, label: '卦象分析', icon: '📊' },
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
          {activeTab === 'paipan' && <PaipanBoard result={result} uiMode={uiMode} />}
          {activeTab === 'analysis' && <AnalysisPanel result={result} analysis={analysis} uiMode={uiMode} />}
        </>
      )}
    </div>
  );
}
