'use client';

import { useState, useCallback } from 'react';
import type { TaiyiConfig, TaiyiResult, TaiyiAnalysis, ScenarioType } from '@/lib/taiyi';
import { calculateTaiyi } from '@/lib/taiyi';
import { analyzeTaiyi } from '@/lib/taiyi';

import InputPanel from '@/components/taiyi/InputPanel';
import TaiyiBoard from '@/components/taiyi/TaiyiBoard';
import AnalysisPanel from '@/components/taiyi/AnalysisPanel';
import CaseLibraryPanel from '@/components/taiyi/CaseLibrary';
import KnowledgeBasePanel from '@/components/taiyi/KnowledgeBase';

type TabKey = 'paipan' | 'cases' | 'knowledge';

export default function TaiyiPage() {
  const [result, setResult] = useState<TaiyiResult | null>(null);
  const [analysis, setAnalysis] = useState<TaiyiAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('paipan');

  const handleCalculate = useCallback((config: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    school: TaiyiConfig['school'];
    calcType: TaiyiConfig['calcType'];
    scenario?: ScenarioType;
  }) => {
    const taiyiConfig: TaiyiConfig = {
      ...config,
    };
    const res = calculateTaiyi(taiyiConfig);
    setResult(res);
    const ana = analyzeTaiyi(res, config.scenario);
    setAnalysis(ana);
    setActiveTab('paipan');
  }, []);

  const tabBtnBase = 'flex-1 py-2.5 text-sm font-medium transition-all';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="section-title text-2xl mb-4">太乙排盘</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-light)' }}>
        古三式之首，推演国运天时 · 支持统宗宝鉴/金镜式经双版本
      </p>

      {/* 顶部Tab */}
      <div
        className="flex rounded-lg overflow-hidden mb-6"
        style={{ border: '1px solid var(--color-border-warm)' }}
      >
        {[
          { key: 'paipan' as TabKey, label: '排盘推算' },
          { key: 'cases' as TabKey, label: '经典案例' },
          { key: 'knowledge' as TabKey, label: '术语知识' },
        ].map(tab => (
          <button
            key={tab.key}
            className={tabBtnBase}
            style={{
              backgroundColor: activeTab === tab.key ? 'var(--color-cinnabar)' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'var(--color-ink-light)',
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 排盘推算 */}
      {activeTab === 'paipan' && (
        <div className="space-y-6">
          {/* 输入面板 */}
          <InputPanel onCalculate={handleCalculate} />

          {/* 结果展示 */}
          {result && analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 左：九宫盘面 */}
              <TaiyiBoard result={result} />

              {/* 右：分析面板 */}
              <AnalysisPanel result={result} analysis={analysis} />
            </div>
          )}

          {/* 附加信息 */}
          {result && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 三基 */}
              <div className="card-chinese p-3">
                <h4
                  className="text-sm font-bold mb-2"
                  style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
                >
                  三基
                </h4>
                <div className="space-y-1 text-xs" style={{ color: 'var(--color-ink)' }}>
                  <div>岁基: {result.sanJi.suiJi.gan} → {result.sanJi.suiJi.palace}宫</div>
                  <div>月基: {result.sanJi.yueJi.gan} → {result.sanJi.yueJi.palace}宫</div>
                  <div>日基: {result.sanJi.riJi.gan} → {result.sanJi.riJi.palace}宫</div>
                </div>
              </div>

              {/* 五福 */}
              <div className="card-chinese p-3">
                <h4
                  className="text-sm font-bold mb-2"
                  style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
                >
                  五福
                </h4>
                <div className="space-y-1 text-xs" style={{ color: 'var(--color-ink)' }}>
                  <div>君基(太乙): {result.wuFu.junJi}宫</div>
                  <div>臣基: {result.wuFu.chenJi}宫</div>
                  <div>民基: {result.wuFu.minJi}宫</div>
                  <div>始击: {result.wuFu.shiJiGong}宫 / 客: {result.wuFu.keGong}宫</div>
                </div>
              </div>

              {/* 四神 */}
              <div className="card-chinese p-3">
                <h4
                  className="text-sm font-bold mb-2"
                  style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
                >
                  四神
                </h4>
                <div className="space-y-1 text-xs" style={{ color: 'var(--color-ink)' }}>
                  <div>天元: {result.siShen.tianYuan.name} → {result.siShen.tianYuan.palace}宫</div>
                  <div>地元: {result.siShen.diYuan.name} → {result.siShen.diYuan.palace}宫</div>
                  <div>直符: {result.siShen.zhiFu.name} → {result.siShen.zhiFu.palace}宫</div>
                  <div>虚精: {result.siShen.xuJing.palace}宫</div>
                </div>
              </div>
            </div>
          )}

          {/* 阳九百六（仅年计有） */}
          {result?.yangJiuBaiLiu && (
            <div className="card-chinese p-3">
              <h4
                className="text-sm font-bold mb-2"
                style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
              >
                阳九百六运限
              </h4>
              <div className="text-xs space-y-1" style={{ color: 'var(--color-ink)' }}>
                <div>
                  <span className="font-medium">{result.yangJiuBaiLiu.cycleName}</span>
                  <span
                    className="ml-2 px-1.5 py-0.5 rounded text-xs"
                    style={{
                      background: result.yangJiuBaiLiu.limitType === '正常' ? '#E8F5E9' : '#FFEBEE',
                      color: result.yangJiuBaiLiu.limitType === '正常' ? '#1B5E20' : '#B71C1C',
                    }}
                  >
                    {result.yangJiuBaiLiu.limitType}
                  </span>
                </div>
                <div>{result.yangJiuBaiLiu.description}</div>
              </div>
            </div>
          )}

          {/* 积年信息 */}
          {result && (
            <div className="card-chinese p-3">
              <h4
                className="text-sm font-bold mb-2"
                style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
              >
                排盘信息
              </h4>
              <div className="text-xs space-y-1" style={{ color: 'var(--color-ink)' }}>
                <div>
                  流派: {result.config.school === 'tongzong' ? '统宗宝鉴' : '金镜式经'} /
                  {result.config.calcType === 'year' ? '年' : result.config.calcType === 'month' ? '月' : result.config.calcType === 'day' ? '日' : '时'}计
                </div>
                <div>四柱: {result.ganZhi.year} {result.ganZhi.month} {result.ganZhi.day} {result.ganZhi.time}</div>
                <div>{result.lunarDesc}</div>
                <div>
                  积年: {result.jiNianResult.jiNian} ({result.jiNianResult.yuan}第{result.jiNianResult.ji}纪)
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 经典案例 */}
      {activeTab === 'cases' && <CaseLibraryPanel />}

      {/* 术语知识 */}
      {activeTab === 'knowledge' && <KnowledgeBasePanel />}
    </div>
  );
}
