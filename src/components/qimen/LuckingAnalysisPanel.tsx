'use client';

import type { PaipanData } from '@/components/qimen/YinpanPaipanBoard';
import {
  analyzeQimen,
  type AnalysisResult,
  type StemPalaceInfo,
  type PalaceAnalysis,
  type PatternInfo,
} from '@/lib/qimen/luckingAnalysis';

// ==================== 工具函数 ====================

const WX_TAG_CLASS: Record<string, string> = {
  '木': 'tag-wood', '火': 'tag-fire', '土': 'tag-earth', '金': 'tag-metal', '水': 'tag-water',
};

function WxTag({ wx }: { wx: string }) {
  return <span className={`tag-element ${WX_TAG_CLASS[wx] || 'tag-earth'}`}>{wx}</span>;
}

function ScoreBadge({ score, label }: { score: number; label: string }) {
  let bg = 'var(--color-border-warm)';
  let color = 'var(--color-ink)';
  if (score >= 3) { bg = '#E8F5E9'; color = '#1B5E20'; }
  else if (score <= -3) { bg = '#FFEBEE'; color = '#B71C1C'; }
  else { bg = '#FFF8E1'; color = '#E65100'; }

  return (
    <span
      style={{ background: bg, color, padding: '2px 8px', borderRadius: '4px', fontSize: '15px', fontWeight: 600 }}
    >
      {label}
    </span>
  );
}

function TendencyBadge({ tendency }: { tendency: '吉' | '凶' | '平' }) {
  const styles: Record<string, { bg: string; color: string }> = {
    '吉': { bg: '#E8F5E9', color: '#1B5E20' },
    '凶': { bg: '#FFEBEE', color: '#B71C1C' },
    '平': { bg: '#FFF8E1', color: '#E65100' },
  };
  const s = styles[tendency];
  return (
    <span
      style={{
        background: s.bg, color: s.color,
        padding: '4px 16px', borderRadius: '6px',
        fontSize: '20px', fontWeight: 700,
        fontFamily: 'var(--font-family-kai)',
      }}
    >
      {tendency}
    </span>
  );
}

// ==================== 子区块组件 ====================

/** 区块标题 */
function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span
        style={{
          background: 'var(--color-cinnabar)',
          color: '#fff',
          width: '24px', height: '24px',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 700, flexShrink: 0,
        }}
      >
        {number}
      </span>
      <h3
        style={{
          fontSize: '17px', fontWeight: 700,
          color: 'var(--color-primary-dark)',
          fontFamily: 'var(--font-family-kai)',
          margin: 0,
        }}
      >
        {title}
      </h3>
    </div>
  );
}

/** 干落宫卡片 */
function StemCard({ info, analysis }: { info: StemPalaceInfo; analysis?: PalaceAnalysis }) {
  if (info.palace === 0) return null;

  return (
    <div
      style={{
        border: '1px solid var(--color-border-warm)',
        borderRadius: '8px',
        padding: '12px',
        background: 'var(--color-bg-card)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
          {info.label}：{info.stem}
          {info.stem !== info.effectStem && <span style={{ color: 'var(--color-ink-light)' }}>（遁{info.effectStem}）</span>}
        </span>
        <span style={{ fontSize: '16px', color: 'var(--color-cinnabar)', fontWeight: 600 }}>
          {info.palaceName}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap" style={{ fontSize: '15px' }}>
        <span>干五行 <WxTag wx={info.stemWX} /></span>
        <span>宫五行 <WxTag wx={info.palaceWX} /></span>
        <span style={{ color: info.relation === '克' || info.relation === '被克' ? '#B71C1C' : '#1B5E20' }}>
          {info.relation === '生' ? '干生宫' :
           info.relation === '被生' ? '宫生干' :
           info.relation === '克' ? '干克宫' :
           info.relation === '被克' ? '宫克干' : '比和'}
        </span>
      </div>
      {analysis && (
        <div className="mt-2 flex items-center gap-2 flex-wrap" style={{ fontSize: '15px', color: 'var(--color-ink-light)' }}>
          <span>{analysis.star}（{analysis.starStrength}）</span>
          <span>{analysis.gate}</span>
          <span>{analysis.spirit}</span>
          {analysis.isVoid && <span style={{ color: '#B71C1C' }}>空亡</span>}
          {analysis.isHorse && <span style={{ color: '#E65100' }}>马星</span>}
          {analysis.isMenPo && <span style={{ color: '#B71C1C' }}>门迫</span>}
        </div>
      )}
    </div>
  );
}

/** 宫位详解卡片 */
function PalaceDetailCard({ pa, label }: { pa: PalaceAnalysis; label?: string }) {
  return (
    <div
      style={{
        border: '1px solid var(--color-border-warm)',
        borderRadius: '8px',
        padding: '12px',
        background: 'var(--color-bg-card)',
      }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {label && (
            <span style={{
              background: 'var(--color-cinnabar)', color: '#fff',
              padding: '1px 8px', borderRadius: '4px', fontSize: '14px', fontWeight: 600,
            }}>
              {label}
            </span>
          )}
          <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
            {pa.palaceName}
          </span>
          <WxTag wx={pa.palaceWX} />
        </div>
        <ScoreBadge score={pa.score} label={pa.score > 0 ? '偏吉' : pa.score < 0 ? '偏凶' : '中平'} />
      </div>

      {/* 星 */}
      <div style={{ fontSize: '16px' }}>
        <span style={{ color: '#B8860B', fontWeight: 600 }}>{pa.star}</span>
        <span style={{ marginLeft: '4px' }}>
          <WxTag wx={pa.starWX} />
        </span>
        <span style={{ marginLeft: '4px', fontWeight: 600, color: pa.starStrength === '旺' || pa.starStrength === '相' ? '#1B5E20' : '#B71C1C' }}>
          {pa.starStrength}
        </span>
        <span style={{ color: 'var(--color-ink-light)', marginLeft: '6px' }}>
          {pa.starNature} - {pa.starMeaning}
        </span>
      </div>

      {/* 门 */}
      <div style={{ fontSize: '16px' }}>
        <span style={{ color: '#C23B22', fontWeight: 600 }}>{pa.gate}</span>
        <span style={{ marginLeft: '4px' }}>
          <WxTag wx={pa.gateWX} />
        </span>
        <span style={{
          marginLeft: '4px',
          fontWeight: 600,
          color: pa.gateAuspice === '吉' ? '#1B5E20' : pa.gateAuspice === '凶' ? '#B71C1C' : '#E65100',
        }}>
          {pa.gateAuspice}
        </span>
        <span style={{ color: 'var(--color-ink-light)', marginLeft: '6px' }}>
          {pa.gateMeaning}
        </span>
      </div>

      {/* 神 */}
      <div style={{ fontSize: '16px' }}>
        <span style={{ color: '#8B4513', fontWeight: 600 }}>{pa.spirit}</span>
        <span style={{ marginLeft: '4px', fontWeight: 500, color: pa.spiritNature === '吉神' ? '#1B5E20' : '#B71C1C' }}>
          {pa.spiritNature}
        </span>
        <span style={{ color: 'var(--color-ink-light)', marginLeft: '6px' }}>
          {pa.spiritMeaning}
        </span>
      </div>

      {/* 天地盘干 */}
      <div style={{ fontSize: '16px', color: 'var(--color-ink-light)' }}>
        天盘干：<span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{pa.heavenStem}</span>
        {' '}地盘干：<span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{pa.earthStem}</span>
      </div>

      {/* 状态标记 */}
      {(pa.isMenPo || pa.isStarRuMu || pa.isGateRuMu || pa.isVoid || pa.isHorse) && (
        <div className="flex gap-2 flex-wrap" style={{ fontSize: '15px' }}>
          {pa.isMenPo && (
            <span style={{ background: '#FFEBEE', color: '#B71C1C', padding: '1px 6px', borderRadius: '3px' }}>
              门迫：{pa.gate}受{pa.palaceName}所克
            </span>
          )}
          {pa.isStarRuMu && (
            <span style={{ background: '#FFEBEE', color: '#B71C1C', padding: '1px 6px', borderRadius: '3px' }}>
              星入墓：{pa.star}入墓
            </span>
          )}
          {pa.isGateRuMu && (
            <span style={{ background: '#FFEBEE', color: '#B71C1C', padding: '1px 6px', borderRadius: '3px' }}>
              门入墓：{pa.gate}入墓
            </span>
          )}
          {pa.isVoid && (
            <span style={{ background: '#FFF3E0', color: '#E65100', padding: '1px 6px', borderRadius: '3px' }}>
              空亡宫
            </span>
          )}
          {pa.isHorse && (
            <span style={{ background: '#E3F2FD', color: '#0D47A1', padding: '1px 6px', borderRadius: '3px' }}>
              马星临宫
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** 格局条目 */
function PatternItem({ p }: { p: PatternInfo }) {
  return (
    <div
      style={{
        padding: '8px 12px',
        borderLeft: `3px solid ${p.type === '凶格' ? '#C23B22' : '#B8860B'}`,
        background: p.type === '凶格' ? '#FFF8F6' : '#FFFAF0',
        borderRadius: '0 6px 6px 0',
        fontSize: '16px',
      }}
    >
      <div className="flex items-center gap-2">
        <span style={{ fontWeight: 700, color: p.type === '凶格' ? '#B71C1C' : '#E65100' }}>
          {p.name}
        </span>
        {p.palace > 0 && (
          <span style={{ fontSize: '14px', color: 'var(--color-ink-light)' }}>
            {p.target} @ {p.palace}宫
          </span>
        )}
      </div>
      <div style={{ color: 'var(--color-ink-light)', marginTop: '2px' }}>
        {p.description}
      </div>
    </div>
  );
}

// ==================== 主组件 ====================

interface LuckingAnalysisPanelProps {
  data: PaipanData;
}

export default function LuckingAnalysisPanel({ data }: LuckingAnalysisPanelProps) {
  const result = analyzeQimen(data);
  const { stemPalaces, palaceAnalyses, patterns, overall, dayTimeRelation } = result;

  // 日干/时干对应的宫位分析
  const dayPA = stemPalaces.dayGan.palace > 0 ? palaceAnalyses[stemPalaces.dayGan.palace] : null;
  const timePA = stemPalaces.timeGan.palace > 0 ? palaceAnalyses[stemPalaces.timeGan.palace] : null;
  const yearPA = stemPalaces.yearGan.palace > 0 ? palaceAnalyses[stemPalaces.yearGan.palace] : null;
  const monthPA = stemPalaces.monthGan.palace > 0 ? palaceAnalyses[stemPalaces.monthGan.palace] : null;

  return (
    <div className="space-y-4">
      {/* ===== 一、基础信息锚定 ===== */}
      <div className="card-chinese p-4 space-y-3">
        <SectionHeader number="一" title="基础信息锚定" />
        <div style={{ fontSize: '16px', lineHeight: 1.8 }}>
          <p>
            排盘类型：<strong>阴盘遁甲</strong>，
            {result.seasonDesc}，当令五行 <WxTag wx={result.seasonWX} />。
            {data.dunType}遁{data.juNumber}局，
            值符<strong>{data.zhiFuStar}</strong>，
            值使<strong>{data.zhiShiGate}</strong>。
          </p>
          <p style={{ color: 'var(--color-ink-light)' }}>
            空亡：{data.voidPair[0]}{data.voidPair[1]}
            {data.voidPalaces.length > 0 && `（落${data.voidPalaces.map(p => p + '宫').join('、')}）`}
            {data.horsePalace > 0 && `，马星临${data.horsePalace}宫`}
          </p>
        </div>
      </div>

      {/* ===== 二、核心宫位深度解读 ===== */}
      <div className="card-chinese p-4 space-y-3">
        <SectionHeader number="二" title="核心宫位深度解读" />

        {/* 日干、时干落宫卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <StemCard info={stemPalaces.dayGan} analysis={dayPA || undefined} />
          <StemCard info={stemPalaces.timeGan} analysis={timePA || undefined} />
        </div>

        {/* 日干-时干关系 */}
        {dayTimeRelation.description && (
          <div
            style={{
              padding: '10px 14px',
              background: 'var(--color-parchment)',
              borderRadius: '8px',
              fontSize: '16px',
            }}
          >
            <strong>日干-时干关系：</strong>{dayTimeRelation.description}
          </div>
        )}

        {/* 辅助宫位 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <StemCard info={stemPalaces.yearGan} analysis={yearPA || undefined} />
          <StemCard info={stemPalaces.monthGan} analysis={monthPA || undefined} />
        </div>

        {/* 日干宫深度解读 */}
        {dayPA && (
          <PalaceDetailCard pa={dayPA} label="日干宫 · 求测人" />
        )}

        {/* 时干宫深度解读 */}
        {timePA && stemPalaces.timeGan.palace !== stemPalaces.dayGan.palace && (
          <PalaceDetailCard pa={timePA} label="时干宫 · 事体" />
        )}
      </div>

      {/* ===== 三、星门神干精准解析 ===== */}
      <div className="card-chinese p-4 space-y-3">
        <SectionHeader number="三" title="星门神干精准解析" />

        <div className="space-y-2">
          {[1, 8, 3, 4, 9, 2, 7, 6].map(p => {
            const pa = palaceAnalyses[p];
            if (!pa) return null;

            // 判断是否为核心宫位
            let label: string | undefined;
            if (p === stemPalaces.dayGan.palace && p === stemPalaces.timeGan.palace) {
              label = '日干+时干';
            } else if (p === stemPalaces.dayGan.palace) {
              label = '日干宫';
            } else if (p === stemPalaces.timeGan.palace) {
              label = '时干宫';
            } else if (p === stemPalaces.yearGan.palace) {
              label = '年干宫';
            } else if (p === stemPalaces.monthGan.palace) {
              label = '月干宫';
            }

            return <PalaceDetailCard key={p} pa={pa} label={label} />;
          })}
        </div>
      </div>

      {/* ===== 四、阴盘专属核心格局 ===== */}
      <div className="card-chinese p-4 space-y-3">
        <SectionHeader number="四" title="阴盘专属核心格局" />

        {patterns.length > 0 ? (
          <div className="space-y-2">
            {patterns.map((p, i) => <PatternItem key={i} p={p} />)}
          </div>
        ) : (
          <p style={{ fontSize: '16px', color: 'var(--color-ink-light)' }}>
            当前盘面未检测到明显的特殊凶格（伏吟、反吟、击刑、入墓、门迫），格局整体平稳。
          </p>
        )}
      </div>

      {/* ===== 五、综合判断与落地建议 ===== */}
      <div className="card-chinese p-4 space-y-3">
        <SectionHeader number="五" title="综合判断与落地建议" />

        {/* 运势定性 */}
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '17px', fontWeight: 600 }}>运势定性：</span>
          <TendencyBadge tendency={overall.tendency} />
        </div>

        {/* 总结 */}
        <p style={{ fontSize: '16px', lineHeight: 1.8 }}>
          {overall.summary}
        </p>

        {/* 核心要点 */}
        {overall.keyPoints.length > 0 && (
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
              核心要点：
            </div>
            <ul style={{ fontSize: '16px', paddingLeft: '20px', margin: 0 }}>
              {overall.keyPoints.map((pt, i) => (
                <li key={i} style={{ marginBottom: '4px', lineHeight: 1.6 }}>{pt}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 行动建议 */}
        {overall.advice.length > 0 && (
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#1B5E20', marginBottom: '4px' }}>
              行动指引：
            </div>
            <ul style={{ fontSize: '16px', paddingLeft: '20px', margin: 0 }}>
              {overall.advice.map((a, i) => (
                <li key={i} style={{ marginBottom: '4px', lineHeight: 1.6, color: '#333' }}>{a}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 注意事项 */}
        {overall.warnings.length > 0 && (
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#B71C1C', marginBottom: '4px' }}>
              注意事项：
            </div>
            <ul style={{ fontSize: '16px', paddingLeft: '20px', margin: 0 }}>
              {overall.warnings.map((w, i) => (
                <li key={i} style={{ marginBottom: '4px', lineHeight: 1.6, color: '#666' }}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 免责声明 */}
        <p className="text-disclaimer" style={{ marginTop: '12px' }}>
          以上解读仅基于阴盘奇门遁甲规则进行算法分析，仅供文化参考，不构成任何决策依据。
        </p>
        <p
          style={{
            marginTop: '8px',
            textAlign: 'center',
            fontSize: '15px',
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-family-kai)',
            letterSpacing: '0.05em',
            lineHeight: 1.8,
          }}
        >
          阴盘遁甲无三奇，亦无吉凶与格局。<br />
          取象直读藏功用，大易至简是玄机。
        </p>
      </div>
    </div>
  );
}
