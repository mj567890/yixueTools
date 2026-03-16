/**
 * 起名测名 —— 测名分析结果面板
 * 评分 + 文字解读统一展示，不区分模式
 */

import type { NamingAnalysis } from '@/lib/naming/types';
import WuGeDisplay from './WuGeDisplay';

interface AnalysisPanelProps {
  analysis: NamingAnalysis;
  onBack?: () => void;
}

export default function AnalysisPanel({ analysis, onBack }: AnalysisPanelProps) {
  const levelColor = (level: string) =>
    level === '吉' ? 'text-green-600' : level === '平' ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="card-chinese p-5 space-y-5">
      {/* 返回按钮 */}
      {onBack && (
        <button
          onClick={onBack}
          className="text-xs text-[var(--color-cinnabar)] hover:underline"
        >
          &larr; 返回推荐列表
        </button>
      )}

      {/* 顶部：总分 */}
      <div>
        <h2 className="text-lg font-bold text-[var(--color-ink)]">
          {analysis.fullName}
          <span className="ml-2 text-2xl font-bold text-[var(--color-cinnabar)]">
            {analysis.totalScore}分
          </span>
        </h2>
        <p className="text-xs text-[var(--color-ink-light)] mt-1">
          姓：{analysis.surname}　名：{analysis.givenName}
        </p>
      </div>

      {/* 分数条 */}
      <div className="w-full h-2.5 rounded-full bg-[var(--color-parchment)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${analysis.totalScore}%`,
            backgroundColor: analysis.totalScore >= 80 ? '#22c55e'
              : analysis.totalScore >= 60 ? '#eab308'
                : '#ef4444',
          }}
        />
      </div>

      {/* 分项评分 */}
      <div className="grid grid-cols-5 gap-2 text-center">
        {([
          ['八字', analysis.scoreBreakdown.bazi],
          ['五格', analysis.scoreBreakdown.wuge],
          ['三才', analysis.scoreBreakdown.sancai],
          ['音律', analysis.scoreBreakdown.phonetics],
          ['字义', analysis.scoreBreakdown.meaning],
        ] as [string, number][]).map(([label, score]) => (
          <div key={label} className="p-2 rounded bg-[var(--color-parchment)]">
            <div className="text-xs text-[var(--color-ink-light)]">{label}</div>
            <div className="text-lg font-bold text-[var(--color-ink)]">{score}</div>
          </div>
        ))}
      </div>

      {/* 五格详情 */}
      <WuGeDisplay result={analysis.wugeResult} />

      {/* 三才配置 */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-[var(--color-ink)]">三才配置</h3>
        <div className="p-3 rounded bg-[var(--color-parchment)] text-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[var(--color-ink)]">
              {analysis.sancaiResult.tianCai} · {analysis.sancaiResult.renCai} · {analysis.sancaiResult.diCai}
            </span>
            <span className={`text-xs font-medium ${analysis.sancaiResult.auspice === '吉' ? 'text-green-600' : analysis.sancaiResult.auspice === '半吉' ? 'text-yellow-600' : 'text-red-600'}`}>
              {analysis.sancaiResult.auspice}
            </span>
          </div>
          <p className="text-xs text-[var(--color-ink-light)]">
            {analysis.sancaiResult.beginnerText}
          </p>
          <p className="text-xs text-[var(--color-ink-light)] mt-1 opacity-80">
            {analysis.sancaiResult.professionalText}
          </p>
        </div>
      </div>

      {/* 八字匹配 */}
      {analysis.baziMatch && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-[var(--color-ink)]">八字匹配</h3>
          <div className="p-3 rounded bg-[var(--color-parchment)] text-sm">
            <p className="text-xs text-[var(--color-ink-light)] whitespace-pre-wrap">
              {analysis.baziMatch.beginnerText}
            </p>
            <p className="text-xs text-[var(--color-ink-light)] whitespace-pre-wrap mt-1 opacity-80">
              {analysis.baziMatch.professionalText}
            </p>
          </div>
        </div>
      )}

      {/* 字义分析 */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-[var(--color-ink)]">字义与音律</h3>
        <div className="p-3 rounded bg-[var(--color-parchment)] text-sm space-y-2">
          <p className="text-xs text-[var(--color-ink-light)]">
            <span className="font-medium">音律：</span>{analysis.charAnalysis.tonePattern}
          </p>
          <p className="text-xs text-[var(--color-ink-light)]">
            <span className="font-medium">字义：</span>{analysis.charAnalysis.overallMeaning}
          </p>
          <p className="text-xs text-[var(--color-ink-light)]">
            <span className="font-medium">字形：</span>{analysis.charAnalysis.formAnalysis}
          </p>
          {analysis.charAnalysis.homophoneWarnings.length > 0 && (
            <div className="text-xs text-red-500">
              <span className="font-medium">谐音提醒：</span>
              {analysis.charAnalysis.homophoneWarnings.join('；')}
            </div>
          )}
        </div>
      </div>

      {/* 综合断语 */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-[var(--color-ink)]">综合断语</h3>
        <div className="space-y-2">
          {analysis.verdicts.map((v, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded bg-[var(--color-parchment)]">
              <span className={`text-xs font-bold mt-0.5 ${levelColor(v.level)}`}>
                {v.level}
              </span>
              <div className="flex-1">
                <div className="text-xs font-medium text-[var(--color-ink)]">{v.category}</div>
                <p className="text-xs text-[var(--color-ink-light)] mt-0.5">
                  {v.beginnerText}
                </p>
                <p className="text-xs text-[var(--color-ink-light)] mt-0.5 opacity-80">
                  {v.professionalText}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 摘要 */}
      <div className="p-3 rounded border border-[var(--color-border-warm)] bg-[var(--color-bg-card)]">
        <p className="text-sm text-[var(--color-ink)] whitespace-pre-wrap">
          {analysis.beginnerSummary}
        </p>
        <p className="text-xs text-[var(--color-ink-light)] whitespace-pre-wrap mt-2">
          {analysis.professionalSummary}
        </p>
      </div>
    </div>
  );
}
