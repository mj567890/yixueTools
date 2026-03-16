'use client';

import type { LiuYaoResult, UIMode, YaoLine as YaoLineType } from '@/lib/liuyao';
import {
  WX_COLORS, SHEN_COLORS, LIUQIN_COLORS,
  YAO_POSITION_NAMES, ZHI_WUXING,
} from '@/lib/liuyao';

// ============================================================
//  排盘展示板
// ============================================================

interface PaipanBoardProps {
  result: LiuYaoResult;
  uiMode: UIMode;
}

export default function PaipanBoard({ result, uiMode }: PaipanBoardProps) {
  const isPro = uiMode === 'professional';

  return (
    <div className="card-chinese p-5 md:p-6 space-y-5">
      {/* 卦名 + 基本信息 */}
      <GuaHeader result={result} isPro={isPro} />

      {/* 四柱信息 */}
      <SiZhuBar result={result} />

      {/* 核心排盘表 */}
      <PaipanTable result={result} isPro={isPro} />

      {/* 伏神 */}
      {result.fuShenList.length > 0 && (
        <FuShenSection fuShenList={result.fuShenList} isPro={isPro} />
      )}
    </div>
  );
}

// ============================================================
//  卦名头部
// ============================================================

function GuaHeader({ result, isPro }: { result: LiuYaoResult; isPro: boolean }) {
  return (
    <div className="text-center space-y-1">
      <h2
        className="text-xl md:text-2xl font-bold"
        style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
      >
        {result.benGuaName}
        {result.hasChanged && (
          <span className="mx-2" style={{ color: 'var(--color-cinnabar)' }}>→</span>
        )}
        {result.hasChanged && result.bianGuaName}
      </h2>
      <div className="text-sm space-x-3" style={{ color: 'var(--color-ink-light)' }}>
        <span>{result.palace}宫 ({result.palaceWuXing})</span>
        <span>{result.guaSequence}卦</span>
        <span>世{result.shiPosition} 应{result.yingPosition}</span>
        {isPro && <span>旬空: {result.xunKongPair[0]}{result.xunKongPair[1]}</span>}
      </div>
      <div className="text-xs" style={{ color: 'var(--color-ink-light)', opacity: 0.7 }}>
        {result.lunarDesc}
      </div>
    </div>
  );
}

// ============================================================
//  四柱
// ============================================================

function SiZhuBar({ result }: { result: LiuYaoResult }) {
  const pillars = [
    { label: '年柱', value: result.ganZhi.year },
    { label: '月柱', value: result.ganZhi.month },
    { label: '日柱', value: result.ganZhi.day },
    { label: '时柱', value: result.ganZhi.time },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {pillars.map((p) => (
        <div
          key={p.label}
          className="text-center py-2 rounded-lg"
          style={{ backgroundColor: 'var(--color-parchment)' }}
        >
          <div className="text-xs" style={{ color: 'var(--color-ink-light)' }}>{p.label}</div>
          <div className="text-base font-bold mt-0.5" style={{ color: 'var(--color-ink)' }}>{p.value}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
//  核心排盘表
// ============================================================

function PaipanTable({ result, isPro }: { result: LiuYaoResult; isPro: boolean }) {
  // 从上爻到初爻 (传统排列顺序)
  const reversedYao = [...result.yaoLines].reverse();
  const reversedBian = result.bianYaoLines ? [...result.bianYaoLines].reverse() : null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: '0 2px' }}>
        <thead>
          <tr className="text-xs" style={{ color: 'var(--color-ink-light)' }}>
            <th className="text-left px-2 py-1 w-10">六神</th>
            <th className="text-left px-2 py-1 w-10">六亲</th>
            <th className="text-left px-2 py-1">本卦</th>
            <th className="text-center px-2 py-1 w-10">爻</th>
            {result.hasChanged && <th className="text-left px-2 py-1">变卦</th>}
            {isPro && <th className="text-left px-2 py-1 w-16">旺衰</th>}
          </tr>
        </thead>
        <tbody>
          {reversedYao.map((yao, displayIdx) => {
            const bianYao = reversedBian?.[displayIdx];
            return (
              <YaoRow
                key={yao.position}
                yao={yao}
                bianYao={bianYao}
                hasChanged={result.hasChanged}
                isPro={isPro}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
//  单爻行
// ============================================================

function YaoRow({
  yao, bianYao, hasChanged, isPro,
}: {
  yao: YaoLineType;
  bianYao?: YaoLineType;
  hasChanged: boolean;
  isPro: boolean;
}) {
  const shenColor = SHEN_COLORS[yao.liuShen] || '';
  const qinColor = LIUQIN_COLORS[yao.liuQin] || '';
  const wxColor = WX_COLORS[yao.zhiWuXing] || '';

  // 世应标记
  const shiYingMark = yao.isShiYao ? ' 世' : yao.isYingYao ? ' 应' : '';

  // 爻象
  const yaoSymbol = yao.isYang ? '━━━━━' : '━━ ━━';
  const movingMark = yao.isMoving ? (yao.isYang ? '○' : '×') : '';

  // 旬空月破标记
  const specialMarks: string[] = [];
  if (yao.isXunKong) specialMarks.push('空');
  if (yao.isYuePo) specialMarks.push('破');

  return (
    <tr
      className="transition-colors"
      style={{
        backgroundColor: yao.isMoving ? 'rgba(220, 38, 38, 0.04)' : 'transparent',
      }}
    >
      {/* 六神 */}
      <td className="px-2 py-1.5">
        <span className={`text-xs font-medium ${shenColor}`}>{yao.liuShen}</span>
      </td>
      {/* 六亲 */}
      <td className="px-2 py-1.5">
        <span className={`text-xs font-medium ${qinColor}`}>{yao.liuQin}</span>
      </td>
      {/* 本卦干支 */}
      <td className="px-2 py-1.5">
        <span className={`font-medium ${wxColor}`}>{yao.ganZhi}</span>
        <span className="text-xs ml-1" style={{ color: 'var(--color-ink-light)' }}>
          {yao.zhiWuXing}
        </span>
        {shiYingMark && (
          <span
            className="ml-1 text-xs font-bold px-1 rounded"
            style={{
              backgroundColor: yao.isShiYao ? 'var(--color-cinnabar)' : 'var(--color-primary-dark)',
              color: '#fff',
            }}
          >
            {shiYingMark.trim()}
          </span>
        )}
        {specialMarks.length > 0 && (
          <span className="ml-1 text-xs text-orange-500">
            ({specialMarks.join(',')})
          </span>
        )}
      </td>
      {/* 爻象 */}
      <td className="text-center px-1 py-1.5 font-mono text-xs whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>
        {yaoSymbol}{movingMark}
      </td>
      {/* 变卦 */}
      {hasChanged && (
        <td className="px-2 py-1.5">
          {yao.isMoving && bianYao ? (
            <>
              <span className={WX_COLORS[bianYao.zhiWuXing] || ''}>
                {bianYao.ganZhi}
              </span>
              <span className="text-xs ml-1" style={{ color: 'var(--color-ink-light)' }}>
                {bianYao.zhiWuXing}
              </span>
              {isPro && yao.changedLiuQin && (
                <span className={`text-xs ml-1 ${LIUQIN_COLORS[yao.changedLiuQin] || ''}`}>
                  {yao.changedLiuQin}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs" style={{ color: 'var(--color-ink-light)', opacity: 0.3 }}>-</span>
          )}
        </td>
      )}
      {/* 旺衰 */}
      {isPro && (
        <td className="px-2 py-1.5 text-xs" style={{ color: 'var(--color-ink-light)' }}>
          <span>{yao.strength.monthRelation}</span>
          {yao.strength.dayEffect !== '无' && (
            <span className="ml-1">{yao.strength.dayEffect}</span>
          )}
        </td>
      )}
    </tr>
  );
}

// ============================================================
//  伏神区
// ============================================================

function FuShenSection({
  fuShenList,
  isPro,
}: {
  fuShenList: LiuYaoResult['fuShenList'];
  isPro: boolean;
}) {
  return (
    <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-parchment)' }}>
      <h3
        className="text-sm font-bold mb-2"
        style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
      >
        伏神
      </h3>
      <div className="space-y-1">
        {fuShenList.map((fs, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className={LIUQIN_COLORS[fs.liuQin] || ''}>{fs.liuQin}</span>
            <span className={WX_COLORS[fs.zhiWuXing] || ''}>{fs.ganZhi}</span>
            <span className="text-xs" style={{ color: 'var(--color-ink-light)' }}>
              {fs.zhiWuXing}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-ink-light)' }}>
              伏于{YAO_POSITION_NAMES[fs.feiShenPosition - 1]}下
            </span>
            {isPro && (
              <span className="text-xs" style={{ color: 'var(--color-ink-light)' }}>
                ({fs.relation})
              </span>
            )}
            <span className="text-xs" style={{ color: 'var(--color-ink-light)' }}>
              飞神: {fs.feiShenGanZhi}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
