'use client';

/**
 * 起名测名 —— 推荐名字列表
 */

import { useState } from 'react';
import type { NameCandidate } from '@/lib/naming/types';

interface NameListProps {
  candidates: NameCandidate[];
  onSelect: (candidate: NameCandidate) => void;
}

export default function NameList({ candidates, onSelect }: NameListProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (candidates.length === 0) {
    return (
      <div className="card-chinese p-6 text-center">
        <p className="text-sm text-[var(--color-ink-light)]">暂无推荐结果</p>
      </div>
    );
  }

  return (
    <div className="card-chinese p-4 space-y-2">
      <h3 className="text-sm font-medium text-[var(--color-ink)] mb-3">
        推荐名字（共{candidates.length}个）
      </h3>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {candidates.map((c, i) => {
          const isExpanded = expanded === c.fullName;

          return (
            <div
              key={`${c.fullName}-${i}`}
              className="border border-[var(--color-border-warm)] rounded-lg overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-3 hover:bg-[var(--color-parchment)] transition text-left"
                onClick={() => setExpanded(isExpanded ? null : c.fullName)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-ink-light)] w-5">{i + 1}</span>
                  <span className="text-base font-bold text-[var(--color-ink)]">{c.fullName}</span>
                  <div className="flex gap-1">
                    {c.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-cinnabar)]/10 text-[var(--color-cinnabar)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-lg font-bold text-[var(--color-cinnabar)]">{c.totalScore}</span>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 pt-0 space-y-2 border-t border-[var(--color-border-warm)]">
                  {/* 分项分数 */}
                  <div className="grid grid-cols-5 gap-1 text-center mt-2">
                    {([
                      ['八字', c.scoreBreakdown.bazi],
                      ['五格', c.scoreBreakdown.wuge],
                      ['三才', c.scoreBreakdown.sancai],
                      ['音律', c.scoreBreakdown.phonetics],
                      ['字义', c.scoreBreakdown.meaning],
                    ] as [string, number][]).map(([label, score]) => (
                      <div key={label} className="text-xs">
                        <div className="text-[var(--color-ink-light)]">{label}</div>
                        <div className="font-bold text-[var(--color-ink)]">{score}</div>
                      </div>
                    ))}
                  </div>

                  {/* 五格信息 */}
                  <div className="text-xs text-[var(--color-ink-light)]">
                    五格：天{c.wugeResult.tianGe.number}({c.wugeResult.tianGe.auspice})
                    · 人{c.wugeResult.renGe.number}({c.wugeResult.renGe.auspice})
                    · 地{c.wugeResult.diGe.number}({c.wugeResult.diGe.auspice})
                    · 总{c.wugeResult.zongGe.number}({c.wugeResult.zongGe.auspice})
                    · 外{c.wugeResult.waiGe.number}({c.wugeResult.waiGe.auspice})
                  </div>

                  {/* 三才 */}
                  <div className="text-xs text-[var(--color-ink-light)]">
                    三才：{c.sancaiResult.combination}（{c.sancaiResult.auspice}）
                  </div>

                  {/* 字义 */}
                  <div className="text-xs text-[var(--color-ink-light)]">
                    {c.charAnalysis.overallMeaning}
                  </div>

                  <button
                    className="text-xs text-[var(--color-cinnabar)] hover:underline"
                    onClick={() => onSelect(c)}
                  >
                    查看详细分析 &rarr;
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
