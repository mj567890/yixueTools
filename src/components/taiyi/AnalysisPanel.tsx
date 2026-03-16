'use client';

/**
 * 太乙排盘 —— 分析面板（双模式：白话/专业）
 */

import { useState } from 'react';
import type { TaiyiAnalysis, TaiyiResult, UIMode } from '@/lib/taiyi/types';

interface AnalysisPanelProps {
  result: TaiyiResult;
  analysis: TaiyiAnalysis;
}

function SectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span
        style={{
          background: 'var(--color-cinnabar)',
          color: '#fff',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: '700',
        }}
      >
        {number}
      </span>
      <h3
        style={{
          fontSize: '17px',
          fontWeight: '700',
          color: 'var(--color-primary-dark)',
          fontFamily: 'var(--font-family-kai)',
        }}
      >
        {title}
      </h3>
    </div>
  );
}

function TendencyBadge({ tendency }: { tendency: '吉' | '平' | '凶' }) {
  const color = tendency === '吉' ? '#1B5E20' : tendency === '凶' ? '#B71C1C' : '#BF360C';
  const bg = tendency === '吉' ? '#E8F5E9' : tendency === '凶' ? '#FFEBEE' : '#FFF3E0';
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-bold"
      style={{ color, background: bg }}
    >
      {tendency}
    </span>
  );
}

export default function AnalysisPanel({ result, analysis }: AnalysisPanelProps) {
  const [mode, setMode] = useState<UIMode>('beginner');
  const isBeginner = mode === 'beginner';

  const btnBase = 'flex-1 py-1.5 text-sm font-medium transition-all rounded';

  return (
    <div className="card-chinese p-4 md:p-5 space-y-5">
      {/* 模式切换 */}
      <div className="flex items-center justify-between">
        <h3
          className="text-base font-bold"
          style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
        >
          分析结果
        </h3>
        <div className="flex gap-1 rounded overflow-hidden" style={{ border: '1px solid var(--color-border-warm)' }}>
          <button
            className={btnBase}
            style={{
              backgroundColor: isBeginner ? 'var(--color-cinnabar)' : 'transparent',
              color: isBeginner ? '#fff' : 'var(--color-ink-light)',
              padding: '4px 12px',
            }}
            onClick={() => setMode('beginner')}
          >
            白话
          </button>
          <button
            className={btnBase}
            style={{
              backgroundColor: !isBeginner ? 'var(--color-cinnabar)' : 'transparent',
              color: !isBeginner ? '#fff' : 'var(--color-ink-light)',
              padding: '4px 12px',
            }}
            onClick={() => setMode('professional')}
          >
            专业
          </button>
        </div>
      </div>

      {/* 综合评定 */}
      <div
        className="p-3 rounded-lg"
        style={{ background: 'var(--color-parchment)', border: '1px solid var(--color-border-warm)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base font-bold" style={{ color: 'var(--color-primary-dark)' }}>综合</span>
          <TendencyBadge tendency={analysis.overall.tendency} />
          <span className="text-xs" style={{ color: 'var(--color-ink-light)' }}>
            评分: {analysis.overall.score > 0 ? '+' : ''}{analysis.overall.score}
          </span>
        </div>
        <p className="text-sm" style={{ color: 'var(--color-ink)', lineHeight: '1.6' }}>
          {isBeginner ? analysis.beginnerSummary : analysis.professionalSummary}
        </p>
      </div>

      {/* 1. 格局 */}
      {analysis.patterns.length > 0 && (
        <div>
          <SectionHeader number={1} title="格局" />
          <div className="space-y-2">
            {analysis.patterns.map((p, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg"
                style={{ border: '1px solid var(--color-border-warm)', background: 'var(--color-bg-card)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-family-kai)' }}>{p.name}格</span>
                  <TendencyBadge tendency={p.type === '吉格' ? '吉' : p.type === '凶格' ? '凶' : '平'} />
                </div>
                <p className="text-xs" style={{ color: 'var(--color-ink-light)', lineHeight: '1.5' }}>
                  {p.description}
                </p>
                {!isBeginner && p.classicalRef && (
                  <p className="text-xs mt-1 italic" style={{ color: 'var(--color-gold)' }}>
                    {p.classicalRef}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. 主客胜负 */}
      <div>
        <SectionHeader number={2} title="主客胜负" />
        <div
          className="p-2.5 rounded-lg"
          style={{ border: '1px solid var(--color-border-warm)', background: 'var(--color-bg-card)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold">{analysis.hostGuestResult.winner}</span>
            <span className="text-xs" style={{ color: 'var(--color-ink-light)' }}>
              评分: {analysis.hostGuestResult.score > 0 ? '+' : ''}{analysis.hostGuestResult.score}
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-ink)', lineHeight: '1.6' }}>
            {isBeginner ? analysis.hostGuestResult.beginnerText : analysis.hostGuestResult.professionalText}
          </p>
        </div>
      </div>

      {/* 3. 断语列表 */}
      {analysis.verdicts.length > 0 && (
        <div>
          <SectionHeader number={3} title="断语" />
          <div className="space-y-2">
            {analysis.verdicts.map((v, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg"
                style={{ border: '1px solid var(--color-border-warm)', background: 'var(--color-bg-card)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-parchment)', color: 'var(--color-primary)' }}>
                    {v.category}
                  </span>
                  <TendencyBadge tendency={v.level} />
                </div>
                <p className="text-xs" style={{ color: 'var(--color-ink)', lineHeight: '1.5' }}>
                  {isBeginner ? v.beginnerText : v.professionalText}
                </p>
                {!isBeginner && v.advice && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-ink-light)' }}>
                    建议：{v.advice}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. 场景测算 */}
      {analysis.scenarioResult && (
        <div>
          <SectionHeader number={4} title={`场景·${analysis.scenarioResult.scenarioLabel}`} />
          <div
            className="p-2.5 rounded-lg"
            style={{ border: '1px solid var(--color-border-warm)', background: 'var(--color-bg-card)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <TendencyBadge tendency={analysis.scenarioResult.tendency} />
              <span className="text-xs" style={{ color: 'var(--color-ink-light)' }}>
                评分: {analysis.scenarioResult.score > 0 ? '+' : ''}{analysis.scenarioResult.score}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-ink)', lineHeight: '1.6' }}>
              {isBeginner ? analysis.scenarioResult.beginnerText : analysis.scenarioResult.professionalText}
            </p>
          </div>
        </div>
      )}

      {/* 5. 提示与警告 */}
      {(analysis.overall.tips.length > 0 || analysis.overall.warnings.length > 0) && (
        <div>
          <SectionHeader number={5} title="提示" />
          {analysis.overall.tips.length > 0 && (
            <div className="space-y-1 mb-2">
              {analysis.overall.tips.map((t, i) => (
                <div key={i} className="flex items-start gap-1 text-xs" style={{ color: '#1B5E20' }}>
                  <span>+</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          )}
          {analysis.overall.warnings.length > 0 && (
            <div className="space-y-1">
              {analysis.overall.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-1 text-xs" style={{ color: '#B71C1C' }}>
                  <span>!</span>
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 推演过程（仅专业模式） */}
      {!isBeginner && (
        <details className="text-xs">
          <summary className="cursor-pointer py-1" style={{ color: 'var(--color-ink-light)' }}>
            查看推演过程
          </summary>
          <pre
            className="mt-2 p-3 rounded overflow-x-auto text-xs"
            style={{
              background: 'var(--color-parchment)',
              color: 'var(--color-ink)',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
            }}
          >
            {result.debugInfo}
          </pre>
        </details>
      )}
    </div>
  );
}
