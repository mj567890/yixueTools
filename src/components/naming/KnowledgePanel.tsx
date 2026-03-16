'use client';

/**
 * 起名测名 —— 姓名学小常识（窄格式侧栏知识块）
 */

import { useState } from 'react';
import { KNOWLEDGE_ARTICLES } from '@/lib/naming/constants';

export default function KnowledgePanel() {
  const [expandedTitle, setExpandedTitle] = useState<string | null>(null);

  return (
    <div className="card-chinese p-4 space-y-3">
      <h4 className="text-xs font-medium text-[var(--color-ink)] flex items-center gap-1.5">
        <span style={{ color: 'var(--color-gold)' }}>&#9733;</span>
        姓名学小常识
      </h4>

      <div className="space-y-1.5 max-h-[360px] overflow-y-auto">
        {KNOWLEDGE_ARTICLES.map(article => {
          const isExpanded = expandedTitle === article.title;
          return (
            <div key={article.title}>
              <button
                className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-[var(--color-parchment)] transition"
                onClick={() => setExpandedTitle(isExpanded ? null : article.title)}
              >
                <span className="text-[var(--color-ink)]">{article.title}</span>
              </button>
              {isExpanded && (
                <div className="px-2 pb-2">
                  <p className="text-xs text-[var(--color-ink-light)] leading-relaxed whitespace-pre-wrap">
                    {article.brief}
                  </p>
                  <p className="text-xs text-[var(--color-ink-light)] leading-relaxed mt-1 opacity-80 whitespace-pre-wrap">
                    {article.detail}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
