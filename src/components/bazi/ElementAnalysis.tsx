'use client';

import type { WuxingAnalysis } from '@/lib/lunar';
import { WU_XING_COLORS } from '@/lib/lunar';

interface ElementAnalysisProps {
  analysis: WuxingAnalysis;
  dayMaster: string;
  dayMasterWuxing: string;
  dayMasterYinYang: string;
}

const ELEMENTS = ['木', '火', '土', '金', '水'] as const;

/**
 * 五行分析组件
 *
 * 展示内容：
 * 1. 五行柱状图（水平条形，高度按比例）
 * 2. 五行缺失/偏旺标识
 * 3. 日主强弱评估
 * 4. 简明解读
 */
export default function ElementAnalysis({
  analysis,
  dayMaster,
  dayMasterWuxing,
  dayMasterYinYang,
}: ElementAnalysisProps) {
  const maxCount = Math.max(...Object.values(analysis.counts), 1);

  return (
    <div className="card-chinese p-5 md:p-6">
      <h3 className="section-title mb-5" style={{ fontSize: '1.2rem' }}>
        五行分析
      </h3>

      {/* 日主信息 */}
      <div
        className="flex items-center gap-3 mb-5 p-3 rounded-lg"
        style={{ backgroundColor: WU_XING_COLORS[dayMasterWuxing]?.bg || '#f5f5f5' }}
      >
        <span
          className="text-3xl font-bold"
          style={{
            fontFamily: 'var(--font-family-kai)',
            color: WU_XING_COLORS[dayMasterWuxing]?.text || '#333',
          }}
        >
          {dayMaster}
        </span>
        <div>
          <div className="text-sm font-bold" style={{ color: 'var(--color-primary-dark)' }}>
            日主 {dayMasterYinYang}{dayMasterWuxing}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-ink-light)' }}>
            身{analysis.dayMasterStrength === '偏强' ? '强' : analysis.dayMasterStrength === '偏弱' ? '弱' : '中和'}
            ，{analysis.dayMasterStrength === '偏强' ? '喜泄耗克' : analysis.dayMasterStrength === '偏弱' ? '喜生扶' : '平衡取用'}
          </div>
        </div>
        <span
          className="ml-auto text-xs px-3 py-1 rounded-full font-medium text-white"
          style={{
            backgroundColor:
              analysis.dayMasterStrength === '偏强' ? '#C23B22'
              : analysis.dayMasterStrength === '偏弱' ? '#1E90FF'
              : '#2E8B57',
          }}
        >
          日主{analysis.dayMasterStrength}
        </span>
      </div>

      {/* 五行柱状图 */}
      <div className="space-y-2.5 mb-5">
        {ELEMENTS.map((el) => {
          const count = analysis.counts[el] || 0;
          const isMissing = count === 0;
          const isStrong = count >= 3;
          const widthPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const colors = WU_XING_COLORS[el];

          return (
            <div key={el} className="flex items-center gap-2">
              {/* 五行标签 */}
              <span
                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold shrink-0"
                style={{
                  color: colors?.text || '#333',
                  backgroundColor: colors?.bg || '#f5f5f5',
                }}
              >
                {el}
              </span>

              {/* 进度条 */}
              <div className="flex-1 h-7 rounded-lg overflow-hidden relative" style={{ backgroundColor: '#F5F0EB' }}>
                <div
                  className="h-full rounded-lg transition-all duration-500 flex items-center"
                  style={{
                    width: `${Math.max(widthPct, isMissing ? 0 : 8)}%`,
                    backgroundColor: isMissing ? 'transparent' : colors?.text || '#999',
                    opacity: isMissing ? 1 : 0.75,
                  }}
                />
                {/* 数字标注 */}
                <span
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold"
                  style={{
                    color: isMissing ? '#bbb' : 'var(--color-ink)',
                  }}
                >
                  {count}
                </span>
              </div>

              {/* 状态标签 */}
              <span className="w-12 text-center shrink-0">
                {isMissing && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-medium">
                    缺
                  </span>
                )}
                {isStrong && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-medium">
                    旺
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* 五行统计卡片 */}
      <div className="grid grid-cols-5 gap-2 mb-5">
        {ELEMENTS.map((el) => {
          const count = analysis.counts[el] || 0;
          const isMissing = count === 0;
          const colors = WU_XING_COLORS[el];

          return (
            <div
              key={el}
              className={`text-center p-2 rounded-lg border ${
                isMissing ? 'border-dashed opacity-50' : ''
              }`}
              style={{
                borderColor: isMissing ? '#ccc' : colors?.text || '#ccc',
                backgroundColor: isMissing ? '#fafafa' : colors?.bg || '#fff',
              }}
            >
              <div
                className="text-lg font-bold"
                style={{
                  fontFamily: 'var(--font-family-kai)',
                  color: isMissing ? '#ccc' : colors?.text || '#333',
                }}
              >
                {el}
              </div>
              <div
                className="text-xs"
                style={{ color: isMissing ? '#ccc' : 'var(--color-ink-light)' }}
              >
                {count} 个
              </div>
            </div>
          );
        })}
      </div>

      {/* 解读 */}
      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: 'var(--color-parchment)' }}
      >
        <div className="text-xs font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
          五行解读
        </div>
        <p
          className="text-sm leading-relaxed"
          style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
        >
          {analysis.summary}
        </p>
      </div>

      {/* 免责声明 */}
      <p className="text-[10px] text-[var(--color-ink-light)] mt-3 text-center opacity-50">
        * 以上分析仅基于八字原局天干地支统计，未考虑藏干权重、大运流年等因素，仅供学习参考
      </p>
    </div>
  );
}
