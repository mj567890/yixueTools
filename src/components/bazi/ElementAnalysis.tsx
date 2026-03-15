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
 * 字体优化：
 * - 日主大字：36px 楷体 weight 700
 * - 标题/标签：14-15px weight 600-700
 * - 进度条数字：14px weight 700
 * - 五行卡片字：20px 楷体 weight 700
 * - 缺/旺标签：12px weight 600
 * - 解读正文：15px 楷体 weight 500
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
      <h3 className="section-title mb-5">
        五行分析
      </h3>

      {/* 日主信息 */}
      <div
        className="flex items-center gap-4 mb-5 p-4 rounded-lg"
        style={{ backgroundColor: WU_XING_COLORS[dayMasterWuxing]?.bg || '#f5f5f5' }}
      >
        <span
          className="ganzhi-char text-[36px]"
          style={{ color: WU_XING_COLORS[dayMasterWuxing]?.text || '#333' }}
        >
          {dayMaster}
        </span>
        <div>
          <div className="text-[15px] font-bold" style={{ color: 'var(--color-primary-dark)' }}>
            日主 {dayMasterYinYang}{dayMasterWuxing}
          </div>
          <div className="text-sm mt-0.5" style={{ color: '#666' }}>
            身{analysis.dayMasterStrength === '偏强' ? '强' : analysis.dayMasterStrength === '偏弱' ? '弱' : '中和'}
            ，{analysis.dayMasterStrength === '偏强' ? '喜泄耗克' : analysis.dayMasterStrength === '偏弱' ? '喜生扶' : '平衡取用'}
          </div>
        </div>
        <span
          className="ml-auto text-[13px] px-3.5 py-1.5 rounded-full font-bold text-white"
          style={{
            backgroundColor:
              analysis.dayMasterStrength === '偏强' ? '#C23B22'
              : analysis.dayMasterStrength === '偏弱' ? '#1565C0'
              : '#2E8B57',
          }}
        >
          日主{analysis.dayMasterStrength}
        </span>
      </div>

      {/* 五行柱状图 */}
      <div className="space-y-3 mb-5">
        {ELEMENTS.map((el) => {
          const count = analysis.counts[el] || 0;
          const isMissing = count === 0;
          const isStrong = count >= 3;
          const widthPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const colors = WU_XING_COLORS[el];

          return (
            <div key={el} className="flex items-center gap-2.5">
              {/* 五行标签 */}
              <span
                className="w-9 h-9 flex items-center justify-center rounded-lg text-[15px] font-bold shrink-0"
                style={{
                  color: colors?.text || '#333',
                  backgroundColor: colors?.bg || '#f5f5f5',
                }}
              >
                {el}
              </span>

              {/* 进度条 */}
              <div className="flex-1 h-8 rounded-lg overflow-hidden relative" style={{ backgroundColor: '#F5F0EB' }}>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold"
                  style={{
                    color: isMissing ? '#bbb' : '#333',
                  }}
                >
                  {count}
                </span>
              </div>

              {/* 状态标签 */}
              <span className="w-12 text-center shrink-0">
                {isMissing && (
                  <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-semibold">
                    缺
                  </span>
                )}
                {isStrong && (
                  <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-semibold">
                    旺
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* 五行统计卡片 */}
      <div className="grid grid-cols-5 gap-2.5 mb-5">
        {ELEMENTS.map((el) => {
          const count = analysis.counts[el] || 0;
          const isMissing = count === 0;
          const colors = WU_XING_COLORS[el];

          return (
            <div
              key={el}
              className={`text-center p-2.5 rounded-lg border ${
                isMissing ? 'border-dashed opacity-50' : ''
              }`}
              style={{
                borderColor: isMissing ? '#ccc' : colors?.text || '#ccc',
                backgroundColor: isMissing ? '#fafafa' : colors?.bg || '#fff',
              }}
            >
              <div
                className="text-xl font-bold"
                style={{
                  fontFamily: 'var(--font-family-kai)',
                  color: isMissing ? '#ccc' : colors?.text || '#333',
                }}
              >
                {el}
              </div>
              <div
                className="text-[13px] font-medium mt-0.5"
                style={{ color: isMissing ? '#ccc' : '#666' }}
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
        <div className="text-sm font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
          五行解读
        </div>
        <p
          className="text-[15px] leading-relaxed"
          style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
        >
          {analysis.summary}
        </p>
      </div>

      {/* 免责声明 */}
      <p className="text-xs mt-3 text-center opacity-50" style={{ color: '#888' }}>
        * 以上分析仅基于八字原局天干地支统计，未考虑藏干权重、大运流年等因素，仅供学习参考
      </p>
    </div>
  );
}
