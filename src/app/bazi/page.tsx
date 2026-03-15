'use client';

import { useState, useMemo } from 'react';
import BaziPanel from '@/components/bazi/BaziPanel';
import ElementAnalysis from '@/components/bazi/ElementAnalysis';
import DaYunTimeline from '@/components/bazi/DaYunTimeline';
import LiuNianGrid from '@/components/bazi/LiuNianGrid';
import WuXingChart from '@/components/bazi/WuXingChart';
import AnalysisPanel from '@/components/bazi/AnalysisPanel';
import InterpretationPanel from '@/components/bazi/InterpretationPanel';
import {
  getBaziResult,
  buildDaYunResult,
  buildLiuNianList,
  analyzeFourDimensions,
  computeDynamicWuxing,
  getBaziInterpretation,
  getDaYunAnalysis,
  type BaziResult,
  type DaYunResult,
  type DaYunAnalysis,
  type FourDimensionAnalysis,
  type BaziInterpretation,
} from '@/lib/lunar';

/** 时辰选项列表 */
const SHICHEN_OPTIONS = [
  { value: 23, label: '子时 (23:00-00:59)' },
  { value: 1, label: '丑时 (01:00-02:59)' },
  { value: 3, label: '寅时 (03:00-04:59)' },
  { value: 5, label: '卯时 (05:00-06:59)' },
  { value: 7, label: '辰时 (07:00-08:59)' },
  { value: 9, label: '巳时 (09:00-10:59)' },
  { value: 11, label: '午时 (11:00-12:59)' },
  { value: 13, label: '未时 (13:00-14:59)' },
  { value: 15, label: '申时 (15:00-16:59)' },
  { value: 17, label: '酉时 (17:00-18:59)' },
  { value: 19, label: '戌时 (19:00-20:59)' },
  { value: 21, label: '亥时 (21:00-22:59)' },
];

function yearOptions() {
  const years = [];
  for (let y = 2100; y >= 1900; y--) {
    years.push(y);
  }
  return years;
}

type TabKey = 'paipan' | 'interpret';

export default function BaziPage() {
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());
  const [hour, setHour] = useState(() => {
    const h = now.getHours();
    const matched = SHICHEN_OPTIONS.find((opt) => {
      if (opt.value === 23) return h >= 23 || h < 1;
      return h >= opt.value && h < opt.value + 2;
    });
    return matched?.value ?? 7;
  });
  const [isLunar, setIsLunar] = useState(false);
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [useLiChun, setUseLiChun] = useState(true);
  const [gender, setGender] = useState(1);

  const [result, setResult] = useState<BaziResult | null>(null);
  const [error, setError] = useState('');
  const [daYunResult, setDaYunResult] = useState<DaYunResult | null>(null);
  const [selectedDaYunIndex, setSelectedDaYunIndex] = useState<number | null>(null);
  const [fourDimAnalysis, setFourDimAnalysis] = useState<FourDimensionAnalysis | null>(null);
  const [interpretation, setInterpretation] = useState<BaziInterpretation | null>(null);
  const [wuxingLayer, setWuxingLayer] = useState<'original' | 'withDaYun' | 'withLiuNian'>('original');
  const [activeTab, setActiveTab] = useState<TabKey>('paipan');

  const liuNianData = useMemo(() => {
    if (!daYunResult || selectedDaYunIndex === null || !result) return null;
    const daYun = daYunResult.daYunList[selectedDaYunIndex];
    if (!daYun) return null;
    return { daYun, list: buildLiuNianList(daYun, result) };
  }, [daYunResult, selectedDaYunIndex, result]);

  // 大运断语分析
  const daYunAnalysis: DaYunAnalysis | null = useMemo(() => {
    if (!result || !liuNianData) return null;
    return getDaYunAnalysis(result, liuNianData.daYun, liuNianData.list);
  }, [result, liuNianData]);

  const dynamicWuxing = useMemo(() => {
    if (!result) return null;
    const selectedDaYun =
      daYunResult && selectedDaYunIndex !== null
        ? (daYunResult.daYunList[selectedDaYunIndex] ?? null)
        : null;
    const currentYear = new Date().getFullYear();
    const currentLiuNian =
      liuNianData?.list.find((ln) => ln.year === currentYear) ?? null;
    return computeDynamicWuxing(result, selectedDaYun, currentLiuNian);
  }, [result, daYunResult, selectedDaYunIndex, liuNianData]);

  const handlePaiPan = () => {
    setError('');
    try {
      const opts = { isLunar, isLeapMonth, sect: 2, useLiChun };
      const r = getBaziResult(year, month, day, hour, opts);
      setResult(r);
      const dyResult = buildDaYunResult(year, month, day, hour, gender, r, opts);
      setDaYunResult(dyResult);
      setFourDimAnalysis(analyzeFourDimensions(r, gender));
      setInterpretation(getBaziInterpretation(r, dyResult, gender));
      const currentYear = new Date().getFullYear();
      const currentIdx = dyResult.daYunList.findIndex(
        (dy) => currentYear >= dy.startYear && currentYear <= dy.endYear,
      );
      setSelectedDaYunIndex(currentIdx >= 0 ? currentIdx : 0);
      setWuxingLayer('original');
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : '排盘计算失败，请检查日期是否有效';
      setError(msg);
      setResult(null);
      setDaYunResult(null);
      setSelectedDaYunIndex(null);
      setFourDimAnalysis(null);
      setInterpretation(null);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const days = useMemo(() => {
    if (isLunar) {
      return Array.from({ length: 30 }, (_, i) => i + 1);
    }
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [year, month, isLunar]);

  const selectCls =
    'px-3 py-2 rounded-lg border border-[var(--color-border-warm)] bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--color-cinnabar)]/30';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="section-title text-2xl">八字排盘</h1>
        <p className="text-[15px] mt-2" style={{ color: '#666' }}>
          输入出生日期与时辰，排出四柱八字，分析十神、藏干、五行平衡
        </p>
      </div>

      {/* 输入表单 */}
      <div className="card-chinese p-5 mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center rounded-lg border border-[var(--color-border-warm)] overflow-hidden">
            <button
              onClick={() => {
                setIsLunar(false);
                setIsLeapMonth(false);
              }}
              className={`px-4 py-2 text-[15px] font-medium transition-colors ${!isLunar ? 'bg-[var(--color-cinnabar)] text-white' : 'bg-white text-[#666] hover:bg-[var(--color-parchment)]'}`}
            >
              公历
            </button>
            <button
              onClick={() => setIsLunar(true)}
              className={`px-4 py-2 text-[15px] font-medium transition-colors ${isLunar ? 'bg-[var(--color-cinnabar)] text-white' : 'bg-white text-[#666] hover:bg-[var(--color-parchment)]'}`}
            >
              农历
            </button>
          </div>

          <div className="flex items-center rounded-lg border border-[var(--color-border-warm)] overflow-hidden">
            <button
              onClick={() => setGender(1)}
              className={`px-4 py-2 text-[15px] font-medium transition-colors ${gender === 1 ? 'bg-[var(--color-cinnabar)] text-white' : 'bg-white text-[#666] hover:bg-[var(--color-parchment)]'}`}
            >
              男
            </button>
            <button
              onClick={() => setGender(0)}
              className={`px-4 py-2 text-[15px] font-medium transition-colors ${gender === 0 ? 'bg-[var(--color-cinnabar)] text-white' : 'bg-white text-[#666] hover:bg-[var(--color-parchment)]'}`}
            >
              女
            </button>
          </div>

          {isLunar && (
            <label className="flex items-center gap-1.5 text-[15px] cursor-pointer" style={{ color: '#666' }}>
              <input
                type="checkbox"
                checked={isLeapMonth}
                onChange={(e) => setIsLeapMonth(e.target.checked)}
                className="accent-[var(--color-cinnabar)]"
              />
              闰月
            </label>
          )}

          <label className="flex items-center gap-1.5 text-[15px] cursor-pointer ml-auto">
            <span style={{ color: '#666' }}>
              按立春划分年柱
            </span>
            <button
              onClick={() => setUseLiChun(!useLiChun)}
              className={`relative w-10 h-5 rounded-full transition-colors ${useLiChun ? 'bg-[var(--color-cinnabar)]' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${useLiChun ? 'left-5' : 'left-0.5'}`}
              />
            </button>
          </label>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-[13px] font-medium block mb-1" style={{ color: '#888' }}>
              {isLunar ? '农历年' : '公历年'}
            </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={`w-24 ${selectCls}`}
            >
              {yearOptions().map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium block mb-1" style={{ color: '#888' }}>
              月
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className={`w-20 ${selectCls}`}
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}月
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium block mb-1" style={{ color: '#888' }}>
              日
            </label>
            <select
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className={`w-20 ${selectCls}`}
            >
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium block mb-1" style={{ color: '#888' }}>
              时辰
            </label>
            <select
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className={selectCls}
            >
              {SHICHEN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button onClick={handlePaiPan} className="btn-primary px-6">
            排盘
          </button>

          <button
            onClick={() => {
              setResult(null);
              setDaYunResult(null);
              setSelectedDaYunIndex(null);
              setFourDimAnalysis(null);
              setInterpretation(null);
              setActiveTab('paipan');
              setError('');
            }}
            className="btn-outline"
          >
            清除
          </button>
        </div>

        {error && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
            {error}
          </div>
        )}
      </div>

      {result ? (
        <>
          {/* 标签页切换 */}
          <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-[var(--color-parchment)] border border-[var(--color-border-warm)]">
            <button
              onClick={() => setActiveTab('paipan')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'paipan'
                  ? 'bg-white text-[var(--color-primary-dark)] shadow-sm'
                  : 'text-[var(--color-ink-light)] hover:text-[var(--color-primary-dark)]'
              }`}
              style={{
                fontFamily: activeTab === 'paipan' ? 'var(--font-family-kai)' : undefined,
              }}
            >
              排盘分析
            </button>
            <button
              onClick={() => setActiveTab('interpret')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'interpret'
                  ? 'bg-white text-[var(--color-primary-dark)] shadow-sm'
                  : 'text-[var(--color-ink-light)] hover:text-[var(--color-primary-dark)]'
              }`}
              style={{
                fontFamily: activeTab === 'interpret' ? 'var(--font-family-kai)' : undefined,
              }}
            >
              命局解读
            </button>
          </div>

          {/* 排盘分析标签页 */}
          {activeTab === 'paipan' && (
            <div className="space-y-6">
              <BaziPanel data={result} />
              <ElementAnalysis
                analysis={result.wuxingAnalysis}
                dayMaster={result.dayMaster}
                dayMasterWuxing={result.dayMasterWuxing}
                dayMasterYinYang={result.dayMasterYinYang}
              />
              {daYunResult && (
                <DaYunTimeline
                  data={daYunResult}
                  selectedIndex={selectedDaYunIndex ?? undefined}
                  onSelect={setSelectedDaYunIndex}
                  analysis={daYunAnalysis}
                />
              )}
              {liuNianData && result && (
                <LiuNianGrid
                  liuNianList={liuNianData.list}
                  daYun={liuNianData.daYun}
                  baziResult={result}
                />
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dynamicWuxing && (
                  <WuXingChart
                    data={dynamicWuxing}
                    activeLayer={wuxingLayer}
                    onLayerChange={setWuxingLayer}
                    hasDaYun={selectedDaYunIndex !== null}
                    hasLiuNian={liuNianData !== null}
                  />
                )}
                {fourDimAnalysis && (
                  <AnalysisPanel analysis={fourDimAnalysis} />
                )}
              </div>
              <div className="card-chinese p-4 text-center">
                <p className="text-xs text-[var(--color-ink-light)] opacity-60">
                  本工具仅供易学研究与文化传承参考，所有排盘结果不构成任何决策建议。命理学属于传统文化范畴，请理性看待。
                </p>
              </div>
            </div>
          )}

          {/* 命局解读标签页 */}
          {activeTab === 'interpret' && interpretation && (
            <InterpretationPanel interpretation={interpretation} />
          )}
        </>
      ) : (
        <div className="card-chinese p-8 text-center">
          <span className="text-5xl mb-4 block">&#x1F52E;</span>
          <h2
            className="text-xl font-bold mb-3"
            style={{
              fontFamily: 'var(--font-family-kai)',
              color: 'var(--color-primary-dark)',
            }}
          >
            输入出生信息开始排盘
          </h2>
          <p className="text-sm text-[var(--color-ink-light)] max-w-md mx-auto leading-relaxed mb-6">
            选择出生日期（公历或农历）和时辰，点击「排盘」即可查看四柱八字、十神关系、藏干分布与五行平衡分析。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
            {[
              {
                icon: '&#x1F4CA;',
                title: '四柱排盘',
                desc: '自动计算年月日时四柱干支、纳音五行',
              },
              {
                icon: '&#x2696;',
                title: '十神分析',
                desc: '标注各柱十神关系、地支藏干及其十神',
              },
              {
                icon: '&#x1F3A8;',
                title: '五行平衡',
                desc: '统计五行分布，判断缺失偏旺与日主强弱',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-parchment)' }}
              >
                <span
                  className="text-2xl block mb-1"
                  dangerouslySetInnerHTML={{ __html: item.icon }}
                />
                <div
                  className="text-sm font-bold mb-1"
                  style={{ color: 'var(--color-primary-dark)' }}
                >
                  {item.title}
                </div>
                <div className="text-xs text-[var(--color-ink-light)]">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
