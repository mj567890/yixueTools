'use client';

import type { BaziInterpretation } from '@/lib/lunar';
import DimensionCard from './DimensionCard';

interface InterpretationPanelProps {
  interpretation: BaziInterpretation;
}

/**
 * 八字十维度解读面板
 *
 * 整合 10 个维度的解读展示：
 * 1. 性格与天赋   2. 学业与智慧   3. 事业与方向
 * 4. 财运与赚钱模式 5. 感情与婚姻   6. 家庭与父母
 * 7. 子女         8. 健康与隐患   9. 贵人与小人
 * 10. 人生大运节奏
 *
 * 每个维度使用 DimensionCard 折叠面板展示，
 * 默认收起，点击展开。第一个维度默认展开。
 */
export default function InterpretationPanel({ interpretation }: InterpretationPanelProps) {
  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="card-chinese p-5">
        <div className="flex items-center justify-between">
          <h3 className="section-title" style={{ fontSize: '1.2rem' }}>
            命局解读
          </h3>
          <span
            className="text-xs px-3 py-1 rounded-lg"
            style={{
              color: 'var(--color-gold)',
              backgroundColor: 'var(--color-parchment)',
              border: '1px solid var(--color-border-warm)',
            }}
          >
            十维度分析
          </span>
        </div>
        <p
          className="text-xs mt-2"
          style={{ color: 'var(--color-ink-light)' }}
        >
          基于子平八字理论，从性格天赋、学业、事业、财运、婚姻、家庭、子女、健康、贵人、大运节奏十个维度进行综合解读。点击各维度标题展开详细分析。
        </p>
      </div>

      {/* 十个维度卡片 */}
      <div className="space-y-3">
        {interpretation.dimensions.map((dim, i) => (
          <DimensionCard key={dim.id} dim={dim} defaultOpen={i === 0} />
        ))}
      </div>

      {/* 免责声明 */}
      <div className="card-chinese p-4 text-center">
        <p className="text-[10px] opacity-50" style={{ color: 'var(--color-ink-light)' }}>
          * 以上解读基于子平八字基础理论的自动化分析，仅供易学研究与文化传承参考。
          命理分析涉及多种流派和复杂的格局组合，自动化解读无法完全替代专业命理师的综合判断。
          所有内容不构成任何人生决策建议，请理性看待。
        </p>
      </div>
    </div>
  );
}
