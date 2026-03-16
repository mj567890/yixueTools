'use client';

import type {
  YangpanPaiPanResult, YangpanAnalysisResult,
  YangpanPalaceAnalysis, PatternMatch, ScenarioResult, PalaceId,
} from '@/lib/qimen/types';
import { PALACE_INFO } from '@/lib/qimen/constants';

// ==================== 工具组件 ====================

const WX_TAG_CLASS: Record<string, string> = {
  '木': 'tag-wood', '火': 'tag-fire', '土': 'tag-earth', '金': 'tag-metal', '水': 'tag-water',
};

function WxTag({ wx }: { wx: string }) {
  return <span className={`tag-element ${WX_TAG_CLASS[wx] || 'tag-earth'}`}>{wx}</span>;
}

function ScoreBadge({ score }: { score: number }) {
  let bg = 'var(--color-border-warm)';
  let color = 'var(--color-ink)';
  let label = '中平';
  if (score >= 1.5) { bg = '#E8F5E9'; color = '#1B5E20'; label = '偏吉'; }
  else if (score <= -1.5) { bg = '#FFEBEE'; color = '#B71C1C'; label = '偏凶'; }
  else { bg = '#FFF8E1'; color = '#E65100'; }

  return (
    <span style={{ background: bg, color, padding: '2px 8px', borderRadius: '4px', fontSize: '15px', fontWeight: 600 }}>
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

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span
        style={{
          background: 'var(--color-cinnabar)', color: '#fff',
          width: '24px', height: '24px', borderRadius: '50%',
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

// ==================== 宫位详解卡片 ====================

function PalaceCard({ pa, label }: { pa: YangpanPalaceAnalysis; label?: string }) {
  return (
    <div
      style={{
        border: '1px solid var(--color-border-warm)',
        borderRadius: '8px', padding: '12px',
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
        <ScoreBadge score={pa.score} />
      </div>

      {/* 星 */}
      <div style={{ fontSize: '16px' }}>
        <span style={{ color: '#B8860B', fontWeight: 600 }}>{pa.star}</span>
        <span style={{ marginLeft: '4px' }}><WxTag wx={pa.starWX} /></span>
        <span style={{
          marginLeft: '4px', fontWeight: 600,
          color: pa.starAuspice === '吉' ? '#1B5E20' : pa.starAuspice === '凶' ? '#B71C1C' : '#E65100',
        }}>
          {pa.starAuspice}
        </span>
      </div>

      {/* 门 */}
      <div style={{ fontSize: '16px' }}>
        <span style={{ color: '#C23B22', fontWeight: 600 }}>{pa.gate}</span>
        <span style={{ marginLeft: '4px' }}><WxTag wx={pa.gateWX} /></span>
        <span style={{
          marginLeft: '4px', fontWeight: 600,
          color: pa.gateAuspice === '吉' ? '#1B5E20' : pa.gateAuspice === '凶' ? '#B71C1C' : '#E65100',
        }}>
          {pa.gateAuspice}
        </span>
      </div>

      {/* 神 */}
      <div style={{ fontSize: '16px' }}>
        <span style={{ color: '#8B4513', fontWeight: 600 }}>{pa.spirit}</span>
      </div>

      {/* 天地盘干 */}
      <div style={{ fontSize: '16px', color: 'var(--color-ink-light)' }}>
        天盘干：<span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{pa.heavenStem}</span>
        {' '}地盘干：<span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{pa.earthStem}</span>
      </div>

      {/* 状态标记 */}
      {(pa.isMenPo || pa.isRuMu || pa.isVoid || pa.isHorse) && (
        <div className="flex gap-2 flex-wrap" style={{ fontSize: '15px' }}>
          {pa.isMenPo && (
            <span style={{ background: '#FFEBEE', color: '#B71C1C', padding: '1px 6px', borderRadius: '3px' }}>
              门迫：{pa.gate}受{pa.palaceName}所克
            </span>
          )}
          {pa.isRuMu && (
            <span style={{ background: '#FFEBEE', color: '#B71C1C', padding: '1px 6px', borderRadius: '3px' }}>
              入墓
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

      {/* 综合评语 */}
      <div style={{ fontSize: '14px', color: 'var(--color-ink-light)' }}>
        {pa.comment}
      </div>
    </div>
  );
}

// ==================== 格局条目 ====================

function PatternItem({ p }: { p: PatternMatch }) {
  const isJi = p.type === '吉格';
  return (
    <div
      style={{
        padding: '8px 12px',
        borderLeft: `3px solid ${isJi ? '#B8860B' : '#C23B22'}`,
        background: isJi ? '#FFFAF0' : '#FFF8F6',
        borderRadius: '0 6px 6px 0',
        fontSize: '16px',
      }}
    >
      <div className="flex items-center gap-2">
        <span style={{ fontWeight: 700, color: isJi ? '#E65100' : '#B71C1C' }}>
          {p.name}
        </span>
        {p.palace > 0 && (
          <span style={{ fontSize: '14px', color: 'var(--color-ink-light)' }}>
            @ {PALACE_INFO[p.palace as PalaceId]?.name || p.palace + '宫'}
          </span>
        )}
      </div>
      <div style={{ color: 'var(--color-ink-light)', marginTop: '2px' }}>
        {p.description}
      </div>
    </div>
  );
}

// ==================== 场景分析区块 ====================

function ScenarioSection({ scenario }: { scenario: ScenarioResult }) {
  return (
    <div className="space-y-3">
      {/* 体用宫对比 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          style={{
            border: '1px solid var(--color-border-warm)',
            borderRadius: '8px', padding: '12px',
            background: 'var(--color-bg-card)',
          }}
        >
          <div style={{ fontSize: '14px', color: 'var(--color-ink-light)', marginBottom: '4px' }}>体宫（求测人）</div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
            {scenario.tiDesc || '体宫不明'}
          </div>
          {scenario.tiPalace > 0 && (
            <div style={{ fontSize: '14px', color: 'var(--color-ink-light)', marginTop: '2px' }}>
              {scenario.tiPalace}宫
            </div>
          )}
        </div>
        <div
          style={{
            border: '1px solid var(--color-border-warm)',
            borderRadius: '8px', padding: '12px',
            background: 'var(--color-bg-card)',
          }}
        >
          <div style={{ fontSize: '14px', color: 'var(--color-ink-light)', marginBottom: '4px' }}>用宫（{scenario.scenarioName}）</div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
            {scenario.yongDesc || '用宫不明'}
          </div>
          {scenario.yongPalace > 0 && (
            <div style={{ fontSize: '14px', color: 'var(--color-ink-light)', marginTop: '2px' }}>
              {scenario.yongPalace}宫
            </div>
          )}
        </div>
      </div>

      {/* 体用关系 */}
      <div
        style={{
          padding: '10px 14px',
          background: 'var(--color-parchment)',
          borderRadius: '8px', fontSize: '16px',
        }}
      >
        <strong>体用关系：</strong>{scenario.relation}
      </div>

      {/* 关键发现 */}
      {scenario.keyFindings.length > 0 && (
        <div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
            关键发现：
          </div>
          <ul style={{ fontSize: '16px', paddingLeft: '20px', margin: 0 }}>
            {scenario.keyFindings.map((f, i) => (
              <li key={i} style={{ marginBottom: '4px', lineHeight: 1.6 }}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 结论 */}
      <div
        style={{
          padding: '10px 14px',
          background: scenario.tendency === '吉' ? '#E8F5E9' : scenario.tendency === '凶' ? '#FFEBEE' : '#FFF8E1',
          borderRadius: '8px', fontSize: '16px',
          fontWeight: 600,
          color: scenario.tendency === '吉' ? '#1B5E20' : scenario.tendency === '凶' ? '#B71C1C' : '#E65100',
        }}
      >
        {scenario.conclusion}
      </div>

      {/* 建议 */}
      {scenario.advice.length > 0 && (
        <ul style={{ fontSize: '16px', paddingLeft: '20px', margin: 0 }}>
          {scenario.advice.map((a, i) => (
            <li key={i} style={{ marginBottom: '4px', lineHeight: 1.6, color: '#333' }}>{a}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ==================== 主组件 ====================

interface YangpanAnalysisPanelProps {
  data: YangpanPaiPanResult;
  analysis: YangpanAnalysisResult;
}

export default function YangpanAnalysisPanel({ data, analysis }: YangpanAnalysisPanelProps) {
  const { patterns, palaceAnalyses, stemLocations, scenarioResult, overall } = analysis;
  const ju = data.juResult;
  const methodLabel = ju.method === 'chaiBu' ? '拆补法' : ju.method === 'zhiRun' ? '置闰法' : '茅山法';

  // 日干/时干所在宫分析
  const dayPA = stemLocations.dayGan.palace > 0 ? palaceAnalyses[stemLocations.dayGan.palace] : null;
  const timePA = stemLocations.timeGan.palace > 0 ? palaceAnalyses[stemLocations.timeGan.palace] : null;

  // 分离吉凶格
  const jiPatterns = patterns.filter(p => p.type === '吉格');
  const xiongPatterns = patterns.filter(p => p.type === '凶格');

  return (
    <div className="space-y-4">
      {/* ===== 一、基础信息锚定 ===== */}
      <div className="card-chinese p-4 space-y-3">
        <SectionHeader number="一" title="基础信息锚定" />
        <div style={{ fontSize: '16px', lineHeight: 1.8 }}>
          <p>
            排盘类型：<strong>阳盘奇门</strong>（{methodLabel}），
            {ju.dunType}{ju.juNumber}局，{ju.yuan}，
            值符<strong>{data.zhiFuStar}</strong>，
            值使<strong>{data.zhiShiGate}</strong>。
          </p>
          <p style={{ color: 'var(--color-ink-light)' }}>
            旬首：{data.xunShou}（{data.xunShouYin}），
            空亡：{data.voidPair[0]}{data.voidPair[1]}
            {data.voidPalaces.length > 0 && `（落${data.voidPalaces.map(p => p + '宫').join('、')}）`}
            {data.horsePalace > 0 && `，马星临${data.horsePalace}宫`}
          </p>
          <p style={{ color: 'var(--color-ink-light)' }}>
            寄宫：天禽寄{data.jiGong === 2 ? '坤二' : '艮八'}宫
            {ju.isRunJu && <span style={{ color: '#B71C1C', fontWeight: 600 }}>（闰局）</span>}
          </p>
        </div>

        {/* 四柱干落宫速览 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2" style={{ fontSize: '15px' }}>
          {[
            { label: '日干', stem: stemLocations.dayGan.stem, palace: stemLocations.dayGan.palace },
            { label: '时干', stem: stemLocations.timeGan.stem, palace: stemLocations.timeGan.palace },
            { label: '年干', stem: stemLocations.yearGan.stem, palace: stemLocations.yearGan.palace },
            { label: '月干', stem: stemLocations.monthGan.stem, palace: stemLocations.monthGan.palace },
          ].map(item => (
            <div
              key={item.label}
              style={{
                padding: '6px 10px', borderRadius: '6px',
                background: 'var(--color-parchment)',
                textAlign: 'center',
              }}
            >
              <span style={{ color: 'var(--color-ink-light)' }}>{item.label}</span>{' '}
              <strong>{item.stem}</strong>{' '}
              <span style={{ color: 'var(--color-cinnabar)' }}>
                {item.palace > 0 ? PALACE_INFO[item.palace as PalaceId]?.name || item.palace + '宫' : '未入宫'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 二、核心宫位深度解读 ===== */}
      <div className="card-chinese p-4 space-y-3">
        <SectionHeader number="二" title="核心宫位深度解读" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dayPA && <PalaceCard pa={dayPA} label="日干宫 · 求测人" />}
          {timePA && stemLocations.timeGan.palace !== stemLocations.dayGan.palace && (
            <PalaceCard pa={timePA} label="时干宫 · 事体" />
          )}
        </div>

        {/* 八宫总览 */}
        <div className="space-y-2">
          {[1, 8, 3, 4, 9, 2, 7, 6].map(p => {
            const pa = palaceAnalyses[p];
            if (!pa) return null;
            // 跳过已在上面展示过的核心宫位
            if (p === stemLocations.dayGan.palace || p === stemLocations.timeGan.palace) return null;

            let label: string | undefined;
            if (p === stemLocations.yearGan.palace) label = '年干宫';
            else if (p === stemLocations.monthGan.palace) label = '月干宫';

            return <PalaceCard key={p} pa={pa} label={label} />;
          })}
        </div>
      </div>

      {/* ===== 三、格局检测 ===== */}
      <div className="card-chinese p-4 space-y-3">
        <SectionHeader number="三" title="格局检测" />

        {patterns.length > 0 ? (
          <div className="space-y-3">
            {jiPatterns.length > 0 && (
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#1B5E20', marginBottom: '6px' }}>
                  吉格（{jiPatterns.length}个）
                </div>
                <div className="space-y-2">
                  {jiPatterns.map((p, i) => <PatternItem key={'ji-' + i} p={p} />)}
                </div>
              </div>
            )}
            {xiongPatterns.length > 0 && (
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#B71C1C', marginBottom: '6px' }}>
                  凶格（{xiongPatterns.length}个）
                </div>
                <div className="space-y-2">
                  {xiongPatterns.map((p, i) => <PatternItem key={'x-' + i} p={p} />)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p style={{ fontSize: '16px', color: 'var(--color-ink-light)' }}>
            当前盘面未检测到明显的特殊格局，格局整体平稳。
          </p>
        )}
      </div>

      {/* ===== 四、场景化测算（可选） ===== */}
      {scenarioResult && (
        <div className="card-chinese p-4 space-y-3">
          <SectionHeader number="四" title={`场景测算 · ${scenarioResult.scenarioName}`} />
          <ScenarioSection scenario={scenarioResult} />
        </div>
      )}

      {/* ===== 五、综合判断与落地建议 ===== */}
      <div className="card-chinese p-4 space-y-3">
        <SectionHeader number={scenarioResult ? '五' : '四'} title="综合判断与落地建议" />

        {/* 运势定性 */}
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '17px', fontWeight: 600 }}>运势定性：</span>
          <TendencyBadge tendency={overall.tendency} />
          <span style={{ fontSize: '15px', color: 'var(--color-ink-light)' }}>
            综合评分：{overall.score}
          </span>
        </div>

        {/* 总结 */}
        <p style={{ fontSize: '16px', lineHeight: 1.8 }}>{overall.summary}</p>

        {/* 提示 */}
        {overall.tips.length > 0 && (
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#1B5E20', marginBottom: '4px' }}>
              重要提示：
            </div>
            <ul style={{ fontSize: '16px', paddingLeft: '20px', margin: 0 }}>
              {overall.tips.map((t, i) => (
                <li key={i} style={{ marginBottom: '4px', lineHeight: 1.6 }}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 警示 */}
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
          以上解读仅基于阳盘奇门遁甲规则进行算法分析，仅供文化参考，不构成任何决策依据。
        </p>
      </div>
    </div>
  );
}
