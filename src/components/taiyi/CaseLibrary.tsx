'use client';

/**
 * 太乙经典案例库组件（含排盘图）
 */

import { useState, useMemo } from 'react';
import {
  CLASSICAL_CASES, getAllTags, getAllDynasties,
  filterCasesByTag, filterCasesByDynasty, searchCases,
} from '@/lib/taiyi/caseLibrary';
import { calculateTaiyi } from '@/lib/taiyi';
import type { ClassicalCase, TaiyiResult } from '@/lib/taiyi/types';
import TaiyiBoard from './TaiyiBoard';

export default function CaseLibraryPanel() {
  const [activeTag, setActiveTag] = useState<string>('');
  const [activeDynasty, setActiveDynasty] = useState<string>('');
  const [keyword, setKeyword] = useState('');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [caseResult, setCaseResult] = useState<TaiyiResult | null>(null);

  const tags = useMemo(() => getAllTags(), []);
  const dynasties = useMemo(() => getAllDynasties(), []);

  const filteredCases = useMemo(() => {
    let cases: ClassicalCase[] = CLASSICAL_CASES;
    if (keyword) cases = searchCases(keyword);
    if (activeTag) cases = cases.filter(c => c.tags.includes(activeTag));
    if (activeDynasty) cases = cases.filter(c => c.dynasty === activeDynasty);
    return cases;
  }, [keyword, activeTag, activeDynasty]);

  const handleExpand = (i: number) => {
    if (expandedIdx === i) {
      setExpandedIdx(null);
      setCaseResult(null);
      return;
    }
    setExpandedIdx(i);
    // 为案例生成排盘
    const c = filteredCases[i];
    try {
      const result = calculateTaiyi({
        year: Math.abs(c.year),
        month: c.month ?? 1,
        day: c.day ?? 1,
        hour: c.hour ?? 12,
        minute: 0,
        school: 'tongzong',
        calcType: c.calcType as 'year' | 'month' | 'day' | 'hour',
      });
      setCaseResult(result);
    } catch {
      setCaseResult(null);
    }
  };

  return (
    <div className="card-chinese p-4 md:p-5 space-y-4">
      <h3
        className="text-base font-bold"
        style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
      >
        经典案例库
        <span className="text-xs font-normal ml-2" style={{ color: 'var(--color-ink-light)' }}>
          共{CLASSICAL_CASES.length}例
        </span>
      </h3>

      {/* 搜索 */}
      <input
        type="text"
        placeholder="搜索案例（标题、解读、标签）..."
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        className="w-full px-3 py-1.5 text-sm border rounded"
        style={{ borderColor: 'var(--color-border-warm)', background: 'var(--color-bg-card)' }}
      />

      {/* 标签筛选 */}
      <div className="flex flex-wrap gap-1">
        <button
          className="px-2 py-0.5 text-xs rounded transition-all"
          style={{
            background: !activeTag ? 'var(--color-cinnabar)' : 'transparent',
            color: !activeTag ? '#fff' : 'var(--color-ink-light)',
            border: '1px solid var(--color-border-warm)',
          }}
          onClick={() => setActiveTag('')}
        >
          全部
        </button>
        {tags.map(tag => (
          <button
            key={tag}
            className="px-2 py-0.5 text-xs rounded transition-all"
            style={{
              background: activeTag === tag ? 'var(--color-cinnabar)' : 'transparent',
              color: activeTag === tag ? '#fff' : 'var(--color-ink-light)',
              border: '1px solid var(--color-border-warm)',
            }}
            onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 朝代筛选 */}
      <div className="flex flex-wrap gap-1">
        <button
          className="px-2 py-0.5 text-xs rounded transition-all"
          style={{
            background: !activeDynasty ? 'var(--color-gold)' : 'transparent',
            color: !activeDynasty ? '#fff' : 'var(--color-ink-light)',
            border: '1px solid var(--color-border-warm)',
          }}
          onClick={() => setActiveDynasty('')}
        >
          全部朝代
        </button>
        {dynasties.map(d => (
          <button
            key={d}
            className="px-2 py-0.5 text-xs rounded transition-all"
            style={{
              background: activeDynasty === d ? 'var(--color-gold)' : 'transparent',
              color: activeDynasty === d ? '#fff' : 'var(--color-ink-light)',
              border: '1px solid var(--color-border-warm)',
            }}
            onClick={() => setActiveDynasty(activeDynasty === d ? '' : d)}
          >
            {d}
          </button>
        ))}
      </div>

      {/* 案例列表 */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {filteredCases.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: 'var(--color-ink-light)' }}>
            未找到匹配的案例
          </p>
        ) : (
          filteredCases.map((c, i) => (
            <div
              key={i}
              className="rounded-lg cursor-pointer transition-all"
              style={{ border: '1px solid var(--color-border-warm)', background: 'var(--color-bg-card)' }}
              onClick={() => handleExpand(i)}
            >
              <div className="p-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-family-kai)' }}>
                      {c.title}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-parchment)', color: 'var(--color-primary)' }}>
                      {c.dynasty}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--color-ink-light)' }}>
                    {c.year > 0 ? `公元${c.year}年` : `公元前${Math.abs(c.year)}年`}
                  </span>
                </div>
                <div className="flex gap-1 mt-1">
                  {c.tags.map(t => (
                    <span
                      key={t}
                      className="text-xs px-1 rounded"
                      style={{ background: 'var(--color-parchment)', color: 'var(--color-ink-light)', fontSize: '10px' }}
                    >
                      {t}
                    </span>
                  ))}
                  <span className="text-xs px-1 rounded" style={{ background: '#E3F2FD', color: '#0D47A1', fontSize: '10px' }}>
                    {c.calcType === 'year' ? '年计' : c.calcType === 'month' ? '月计' : c.calcType === 'day' ? '日计' : '时计'}
                  </span>
                </div>
              </div>

              {expandedIdx === i && (
                <div className="px-2.5 pb-2.5 space-y-3" style={{ borderTop: '1px dashed var(--color-border-warm)' }}>
                  {/* 排盘图 */}
                  {caseResult && (
                    <div className="pt-2">
                      <TaiyiBoard result={caseResult} />
                    </div>
                  )}

                  <div className="pt-2">
                    <div className="text-xs font-bold mb-1" style={{ color: 'var(--color-primary-dark)' }}>太乙解读</div>
                    <p className="text-xs" style={{ color: 'var(--color-ink)', lineHeight: '1.6' }}>{c.interpretation}</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold mb-1" style={{ color: 'var(--color-primary-dark)' }}>历史结果</div>
                    <p className="text-xs" style={{ color: 'var(--color-ink)', lineHeight: '1.6' }}>{c.historicalOutcome}</p>
                  </div>
                  <div className="text-xs italic" style={{ color: 'var(--color-gold)' }}>
                    出处：{c.source}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
