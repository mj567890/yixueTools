'use client';

import type { QimenAnalysis, QimenResult } from '@/lib/qimen';
import { PALACE_INFO } from '@/lib/qimen';

interface QimenAnalysisProps {
  analysis: QimenAnalysis;
  result: QimenResult;
}

export default function QimenAnalysisPanel({ analysis, result }: QimenAnalysisProps) {
  const jiPatterns = analysis.patterns.filter(p => p.type === '吉格');
  const xiongPatterns = analysis.patterns.filter(p => p.type === '凶格');

  return (
    <div className="space-y-4">
      {/* 总体摘要 */}
      <div className="card-chinese p-4">
        <h3
          className="text-base font-bold mb-2"
          style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
        >
          总体概述
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink)' }}>
          {analysis.summary}
        </p>
      </div>

      {/* 吉格 */}
      {jiPatterns.length > 0 && (
        <div>
          <h3
            className="text-sm font-bold mb-2"
            style={{ fontFamily: 'var(--font-family-kai)', color: '#1B5E20' }}
          >
            吉格（{jiPatterns.length}）
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {jiPatterns.map((p, i) => (
              <div
                key={`ji-${i}`}
                className="p-3 rounded-lg"
                style={{ backgroundColor: '#E8F5E9', border: '1px solid #C8E6C9' }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm" style={{ color: '#1B5E20' }}>{p.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#C8E6C9', color: '#2E7D32' }}>
                    {PALACE_INFO[p.palace].name}
                  </span>
                </div>
                <p className="text-xs" style={{ color: '#33691E' }}>{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 凶格 */}
      {xiongPatterns.length > 0 && (
        <div>
          <h3
            className="text-sm font-bold mb-2"
            style={{ fontFamily: 'var(--font-family-kai)', color: '#B71C1C' }}
          >
            凶格（{xiongPatterns.length}）
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {xiongPatterns.map((p, i) => (
              <div
                key={`xiong-${i}`}
                className="p-3 rounded-lg"
                style={{ backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2' }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm" style={{ color: '#B71C1C' }}>{p.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FFCDD2', color: '#C62828' }}>
                    {PALACE_INFO[p.palace].name}
                  </span>
                </div>
                <p className="text-xs" style={{ color: '#BF360C' }}>{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 无格局 */}
      {analysis.patterns.length === 0 && (
        <div className="card-chinese p-4 text-center">
          <p className="text-sm" style={{ color: 'var(--color-ink-light)' }}>
            本盘未检测到明显吉凶格局
          </p>
        </div>
      )}

      {/* 关键提示 */}
      {analysis.tips.length > 0 && (
        <div className="card-chinese p-4">
          <h3
            className="text-sm font-bold mb-2"
            style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
          >
            关键提示
          </h3>
          <ul className="space-y-1.5">
            {analysis.tips.map((tip, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span style={{ color: 'var(--color-gold)' }}>◆</span>
                <span style={{ color: 'var(--color-ink)' }}>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 免责声明 */}
      <p className="text-disclaimer">
        以上分析仅供参考，奇门遁甲为传统数术，请理性看待。
      </p>
    </div>
  );
}
