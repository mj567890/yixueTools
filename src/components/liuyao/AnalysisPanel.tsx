'use client';

import type { LiuYaoResult, LiuYaoAnalysis, UIMode } from '@/lib/liuyao';

interface AnalysisPanelProps {
  result: LiuYaoResult;
  analysis: LiuYaoAnalysis | null;
  uiMode: UIMode;
}

export default function AnalysisPanel({ result, analysis, uiMode }: AnalysisPanelProps) {
  const isPro = uiMode === 'professional';

  // Phase 3 将接入完整分析引擎，当前显示基础卦象信息
  if (!analysis) {
    return (
      <div className="card-chinese p-5 md:p-6 space-y-5">
        <BasicAnalysis result={result} isPro={isPro} />
      </div>
    );
  }

  return (
    <div className="card-chinese p-5 md:p-6 space-y-5">
      {/* 总评 */}
      <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--color-parchment)' }}>
        <div
          className="text-lg font-bold"
          style={{
            color: analysis.overallTendency === '吉' ? '#16A34A'
              : analysis.overallTendency === '凶' ? '#DC2626' : '#D97706',
          }}
        >
          {analysis.overallTendency === '吉' ? '吉' : analysis.overallTendency === '凶' ? '凶' : '平'}
        </div>
        <div className="text-sm mt-1" style={{ color: 'var(--color-ink-light)' }}>
          综合评分: {analysis.score}/100
        </div>
      </div>

      {/* 摘要 */}
      <div className="p-4 rounded-xl" style={{ border: '1px solid var(--color-border)' }}>
        <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
          {isPro ? '专业分析' : '白话解读'}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink)' }}>
          {isPro ? analysis.professionalSummary : analysis.beginnerSummary}
        </p>
      </div>

      {/* 关键提示 */}
      {analysis.keyTips.length > 0 && (
        <div className="p-4 rounded-xl" style={{ backgroundColor: '#FEF3C7' }}>
          <h3 className="text-sm font-bold mb-2" style={{ color: '#92400E' }}>
            关键提示
          </h3>
          <ul className="space-y-1">
            {analysis.keyTips.map((tip, i) => (
              <li key={i} className="text-sm" style={{ color: '#78350F' }}>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 应期 */}
      {analysis.yingQi && (
        <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-parchment)', color: 'var(--color-ink)' }}>
          <span className="font-bold">应期推测: </span>{analysis.yingQi}
        </div>
      )}
    </div>
  );
}

// ============================================================
//  基础分析 (无分析引擎时的占位)
// ============================================================

function BasicAnalysis({ result, isPro }: { result: LiuYaoResult; isPro: boolean }) {
  // 统计动爻
  const movingYao = result.yaoLines.filter(y => y.isMoving);
  const xunKongYao = result.yaoLines.filter(y => y.isXunKong);
  const yuePo = result.yaoLines.filter(y => y.isYuePo);
  const shiYao = result.yaoLines.find(y => y.isShiYao);

  return (
    <>
      <h3
        className="text-lg font-bold text-center"
        style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
      >
        卦象概览
      </h3>

      <div className="space-y-3">
        {/* 卦象 */}
        <InfoRow label="本卦" value={`${result.benGuaName} (${result.palace}宫${result.palaceWuXing} · ${result.guaSequence})`} />
        {result.hasChanged && result.bianGuaName && (
          <InfoRow label="变卦" value={result.bianGuaName} />
        )}

        {/* 世爻 */}
        {shiYao && (
          <InfoRow
            label="世爻"
            value={`${shiYao.ganZhi} (${shiYao.zhiWuXing}) · ${shiYao.liuQin} · 月${shiYao.strength.monthRelation}${shiYao.strength.dayEffect !== '无' ? ' · ' + shiYao.strength.dayEffect : ''}`}
          />
        )}

        {/* 动爻 */}
        {movingYao.length > 0 ? (
          <InfoRow
            label="动爻"
            value={movingYao.map(y => `${y.positionName}(${y.ganZhi} ${y.liuQin})`).join('、')}
          />
        ) : (
          <InfoRow label="动爻" value="无动爻 (静卦)" />
        )}

        {/* 旬空 */}
        {xunKongYao.length > 0 && (
          <InfoRow
            label="旬空"
            value={xunKongYao.map(y => `${y.positionName}(${y.zhi})`).join('、')}
          />
        )}

        {/* 月破 */}
        {yuePo.length > 0 && (
          <InfoRow
            label="月破"
            value={yuePo.map(y => `${y.positionName}(${y.zhi})`).join('、')}
            isWarning
          />
        )}

        {/* 伏神 */}
        {result.fuShenList.length > 0 && (
          <InfoRow
            label="伏神"
            value={result.fuShenList.map(f => `${f.liuQin}(${f.ganZhi}) ${f.relation}`).join('、')}
          />
        )}
      </div>

      <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--color-parchment)' }}>
        <p className="text-sm" style={{ color: 'var(--color-ink-light)' }}>
          {isPro
            ? '完整分析引擎将在后续版本接入，敬请期待。'
            : '智能分析功能开发中，目前展示基础卦象信息。'}
        </p>
      </div>
    </>
  );
}

function InfoRow({ label, value, isWarning }: { label: string; value: string; isWarning?: boolean }) {
  return (
    <div className="flex gap-3 text-sm">
      <span
        className="shrink-0 w-12 text-right font-medium"
        style={{ color: isWarning ? '#DC2626' : 'var(--color-ink-light)' }}
      >
        {label}
      </span>
      <span style={{ color: isWarning ? '#DC2626' : 'var(--color-ink)' }}>
        {value}
      </span>
    </div>
  );
}
