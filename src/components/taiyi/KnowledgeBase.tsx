'use client';

/**
 * 太乙术语知识库组件
 */

import { useState, useMemo } from 'react';
import { KNOWLEDGE_TERMS } from '@/lib/taiyi/constants';

const CATEGORIES = ['全部', '基础', '进阶', '高级', '格局'];

export default function KnowledgeBasePanel() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');

  const filteredTerms = useMemo(() => {
    let terms = KNOWLEDGE_TERMS;
    if (activeCategory !== '全部') {
      terms = terms.filter(t => t.category === activeCategory);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      terms = terms.filter(t =>
        t.term.toLowerCase().includes(kw) ||
        t.brief.toLowerCase().includes(kw) ||
        t.detail.toLowerCase().includes(kw)
      );
    }
    return terms;
  }, [activeCategory, keyword]);

  return (
    <div className="card-chinese p-4 md:p-5 space-y-4">
      <h3
        className="text-base font-bold"
        style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
      >
        术语知识库
        <span className="text-xs font-normal ml-2" style={{ color: 'var(--color-ink-light)' }}>
          共{KNOWLEDGE_TERMS.length}条
        </span>
      </h3>

      {/* 搜索 */}
      <input
        type="text"
        placeholder="搜索术语..."
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        className="w-full px-3 py-1.5 text-sm border rounded"
        style={{ borderColor: 'var(--color-border-warm)', background: 'var(--color-bg-card)' }}
      />

      {/* 分类筛选 */}
      <div className="flex gap-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className="px-3 py-1 text-xs rounded transition-all"
            style={{
              background: activeCategory === cat ? 'var(--color-cinnabar)' : 'transparent',
              color: activeCategory === cat ? '#fff' : 'var(--color-ink-light)',
              border: '1px solid var(--color-border-warm)',
            }}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 术语列表 */}
      <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
        {filteredTerms.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: 'var(--color-ink-light)' }}>
            未找到匹配的术语
          </p>
        ) : (
          filteredTerms.map(term => (
            <div
              key={term.term}
              className="rounded-lg cursor-pointer transition-all"
              style={{ border: '1px solid var(--color-border-warm)', background: 'var(--color-bg-card)' }}
              onClick={() => setExpandedTerm(expandedTerm === term.term ? null : term.term)}
            >
              <div className="p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-bold"
                    style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
                  >
                    {term.term}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-parchment)', color: 'var(--color-primary)' }}>
                    {term.category}
                  </span>
                </div>
                <span className="text-xs" style={{ color: 'var(--color-ink-light)' }}>
                  {term.brief}
                </span>
              </div>

              {expandedTerm === term.term && (
                <div className="px-2.5 pb-2.5 space-y-1.5" style={{ borderTop: '1px dashed var(--color-border-warm)' }}>
                  <p className="text-xs pt-2" style={{ color: 'var(--color-ink)', lineHeight: '1.6' }}>
                    {term.detail}
                  </p>
                  {term.source && (
                    <p className="text-xs italic" style={{ color: 'var(--color-gold)' }}>
                      出处：{term.source}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
