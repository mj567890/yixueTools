'use client';

import { useState } from 'react';
import type { LiuYaoConfig, DivinationMethod, YaoType, CoinTossResult, CoinFace, ScenarioType } from '@/lib/liuyao';
import { calcCoinResult, SCENARIO_NAMES } from '@/lib/liuyao';

// ============================================================
//  常量
// ============================================================

const SHICHEN_OPTIONS = [
  { value: 23, label: '子时 (23:00-00:59)' },
  { value: 1,  label: '丑时 (01:00-02:59)' },
  { value: 3,  label: '寅时 (03:00-04:59)' },
  { value: 5,  label: '卯时 (05:00-06:59)' },
  { value: 7,  label: '辰时 (07:00-08:59)' },
  { value: 9,  label: '巳时 (09:00-10:59)' },
  { value: 11, label: '午时 (11:00-12:59)' },
  { value: 13, label: '未时 (13:00-14:59)' },
  { value: 15, label: '申时 (15:00-16:59)' },
  { value: 17, label: '酉时 (17:00-18:59)' },
  { value: 19, label: '戌时 (19:00-20:59)' },
  { value: 21, label: '亥时 (21:00-22:59)' },
];

const TAB_ITEMS: { key: DivinationMethod; label: string; icon: string }[] = [
  { key: 'time',   label: '时间起卦', icon: '🕐' },
  { key: 'coin',   label: '铜钱起卦', icon: '🪙' },
  { key: 'number', label: '数字起卦', icon: '🔢' },
  { key: 'manual', label: '手动起卦', icon: '✏️' },
];

const YAO_TYPE_OPTIONS: { value: YaoType; label: string; desc: string }[] = [
  { value: 'laoYang',  label: '老阳 ⚌', desc: '(三字 = 9)' },
  { value: 'shaoYang', label: '少阳 ⚊', desc: '(二背一字 = 7)' },
  { value: 'shaoYin',  label: '少阴 ⚋', desc: '(二字一背 = 8)' },
  { value: 'laoYin',   label: '老阴 ⚏', desc: '(三背 = 6)' },
];

const COIN_LABELS = ['字 (阳)', '背 (阴)'] as const;

const selectCls = 'form-input text-base py-2';
const labelCls = 'form-label';

// ============================================================
//  组件
// ============================================================

interface DivinationTabProps {
  onPaipan: (config: LiuYaoConfig) => void;
  onError: (msg: string) => void;
}

export default function DivinationTab({ onPaipan, onError }: DivinationTabProps) {
  const [method, setMethod] = useState<DivinationMethod>('time');

  return (
    <div className="card-chinese p-5 md:p-6">
      {/* Tab 切换 */}
      <div className="flex rounded-xl p-1 mb-5" style={{ backgroundColor: 'var(--color-parchment)' }}>
        {TAB_ITEMS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMethod(tab.key)}
            className="flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: method === tab.key ? '#fff' : 'transparent',
              color: method === tab.key ? 'var(--color-cinnabar)' : 'var(--color-ink-light)',
              boxShadow: method === tab.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              fontFamily: 'var(--font-family-kai)',
            }}
          >
            <span className="mr-0.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {method === 'time'   && <TimeForm onPaipan={onPaipan} onError={onError} />}
      {method === 'coin'   && <CoinForm onPaipan={onPaipan} onError={onError} />}
      {method === 'number' && <NumberForm onPaipan={onPaipan} onError={onError} />}
      {method === 'manual' && <ManualForm onPaipan={onPaipan} onError={onError} />}
    </div>
  );
}

// ============================================================
//  公共部分: 问事 + 场景 + 日期
// ============================================================

function useCommonFields() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());
  const [hour, setHour] = useState(now.getHours());
  const [question, setQuestion] = useState('');
  const [scenario, setScenario] = useState<ScenarioType | ''>('');

  const buildBaseConfig = (m: DivinationMethod): Omit<LiuYaoConfig, 'school'> => ({
    method: m,
    question,
    scenario: scenario || undefined,
    year, month, day, hour,
  });

  return { year, setYear, month, setMonth, day, setDay, hour, setHour,
           question, setQuestion, scenario, setScenario, buildBaseConfig };
}

function CommonFields({
  year, setYear, month, setMonth, day, setDay, hour, setHour,
  question, setQuestion, scenario, setScenario,
}: ReturnType<typeof useCommonFields>) {
  return (
    <>
      {/* 问事 */}
      <div className="mb-4">
        <label className={labelCls}>问事内容</label>
        <input
          className={selectCls + ' w-full'}
          placeholder="简述你想问的事情..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />
      </div>

      {/* 场景 */}
      <div className="mb-4">
        <label className={labelCls}>问事场景 (可选)</label>
        <select
          className={selectCls + ' w-full'}
          value={scenario}
          onChange={e => setScenario(e.target.value as ScenarioType | '')}
        >
          <option value="">-- 不指定 --</option>
          {Object.entries(SCENARIO_NAMES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* 日期时间 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div>
          <label className={labelCls}>年</label>
          <input type="number" className={selectCls + ' w-full'} value={year} min={1900} max={2100}
            onChange={e => setYear(Number(e.target.value))} />
        </div>
        <div>
          <label className={labelCls}>月</label>
          <select className={selectCls + ' w-full'} value={month}
            onChange={e => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m}月</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>日</label>
          <input type="number" className={selectCls + ' w-full'} value={day} min={1} max={31}
            onChange={e => setDay(Number(e.target.value))} />
        </div>
        <div>
          <label className={labelCls}>时辰</label>
          <select className={selectCls + ' w-full'} value={hour}
            onChange={e => setHour(Number(e.target.value))}>
            {SHICHEN_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}

// ============================================================
//  时间起卦
// ============================================================

function TimeForm({ onPaipan, onError }: { onPaipan: (c: LiuYaoConfig) => void; onError: (m: string) => void }) {
  const fields = useCommonFields();

  const handleSubmit = () => {
    if (!fields.question.trim()) { onError('请输入问事内容'); return; }
    onPaipan(fields.buildBaseConfig('time') as LiuYaoConfig);
  };

  return (
    <div>
      <CommonFields {...fields} />
      <button className="btn-primary w-full mt-2" onClick={handleSubmit}>
        起卦排盘
      </button>
    </div>
  );
}

// ============================================================
//  铜钱起卦
// ============================================================

function CoinForm({ onPaipan, onError }: { onPaipan: (c: LiuYaoConfig) => void; onError: (m: string) => void }) {
  const fields = useCommonFields();
  const [coinResults, setCoinResults] = useState<(CoinTossResult | null)[]>(Array(6).fill(null));
  const [currentYao, setCurrentYao] = useState(0);

  const positionNames = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

  const handleCoinSelect = (coins: [CoinFace, CoinFace, CoinFace]) => {
    if (currentYao >= 6) return;
    const result = calcCoinResult(currentYao + 1, coins);
    const newResults = [...coinResults];
    newResults[currentYao] = result;
    setCoinResults(newResults);
    if (currentYao < 5) setCurrentYao(currentYao + 1);
  };

  const handleReset = () => {
    setCoinResults(Array(6).fill(null));
    setCurrentYao(0);
  };

  const handleSubmit = () => {
    if (!fields.question.trim()) { onError('请输入问事内容'); return; }
    const filled = coinResults.filter(Boolean) as CoinTossResult[];
    if (filled.length !== 6) { onError('请完成全部6次投掷'); return; }
    onPaipan({ ...fields.buildBaseConfig('coin'), coinResults: filled } as LiuYaoConfig);
  };

  const filledCount = coinResults.filter(Boolean).length;

  // 快捷选择面板
  const quickOptions: { coins: [CoinFace, CoinFace, CoinFace]; label: string; desc: string }[] = [
    { coins: ['yang', 'yang', 'yang'], label: '三字', desc: '老阳(9)' },
    { coins: ['yang', 'yang', 'yin'],  label: '二字一背', desc: '少阴(8)' },
    { coins: ['yang', 'yin',  'yin'],  label: '一字二背', desc: '少阳(7)' },
    { coins: ['yin',  'yin',  'yin'],  label: '三背', desc: '老阴(6)' },
  ];

  return (
    <div>
      <CommonFields {...fields} />

      {/* 投掷状态 */}
      <div className="mb-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-parchment)' }}>
        <div className="text-sm font-medium mb-3" style={{ color: 'var(--color-ink)' }}>
          投掷进度: {filledCount}/6
          {currentYao < 6 && (
            <span className="ml-2" style={{ color: 'var(--color-cinnabar)' }}>
              当前 → {positionNames[currentYao]}
            </span>
          )}
        </div>

        {/* 已投掷结果 */}
        <div className="grid grid-cols-6 gap-2 mb-3">
          {positionNames.map((name, i) => {
            const r = coinResults[i];
            return (
              <div
                key={i}
                className="text-center p-2 rounded-lg cursor-pointer transition-all"
                style={{
                  backgroundColor: i === currentYao ? 'var(--color-cinnabar-light, #FEE2E2)' : r ? '#E8F5E9' : '#F5F5F5',
                  border: i === currentYao ? '2px solid var(--color-cinnabar)' : '1px solid var(--color-border)',
                }}
                onClick={() => { if (i <= filledCount) setCurrentYao(i); }}
              >
                <div className="text-xs" style={{ color: 'var(--color-ink-light)' }}>{name}</div>
                {r && (
                  <div className="text-sm font-bold mt-1" style={{ color: 'var(--color-ink)' }}>
                    {r.total}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 快捷选择 */}
        {currentYao < 6 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickOptions.map((opt, i) => (
              <button
                key={i}
                className="p-2 rounded-lg text-sm transition-all hover:shadow"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-ink)',
                }}
                onClick={() => handleCoinSelect(opt.coins)}
              >
                <div className="font-medium">{opt.label}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-ink-light)' }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        )}

        {filledCount > 0 && (
          <button
            className="mt-3 text-sm underline"
            style={{ color: 'var(--color-ink-light)' }}
            onClick={handleReset}
          >
            重新投掷
          </button>
        )}
      </div>

      <button
        className="btn-primary w-full"
        onClick={handleSubmit}
        disabled={filledCount < 6}
        style={{ opacity: filledCount < 6 ? 0.5 : 1 }}
      >
        排盘
      </button>
    </div>
  );
}

// ============================================================
//  数字起卦
// ============================================================

function NumberForm({ onPaipan, onError }: { onPaipan: (c: LiuYaoConfig) => void; onError: (m: string) => void }) {
  const fields = useCommonFields();
  const [numberInput, setNumberInput] = useState<number | ''>('');

  const handleSubmit = () => {
    if (!fields.question.trim()) { onError('请输入问事内容'); return; }
    if (!numberInput || numberInput < 1) { onError('请输入有效的正整数'); return; }
    onPaipan({ ...fields.buildBaseConfig('number'), numberInput } as LiuYaoConfig);
  };

  const handleRandom = () => {
    setNumberInput(Math.floor(Math.random() * 999) + 1);
  };

  return (
    <div>
      <CommonFields {...fields} />

      <div className="mb-4">
        <label className={labelCls}>心中所想数字</label>
        <div className="flex gap-2">
          <input
            type="number"
            className={selectCls + ' flex-1'}
            placeholder="输入正整数 (如 168)"
            value={numberInput}
            min={1}
            onChange={e => setNumberInput(e.target.value ? Number(e.target.value) : '')}
          />
          <button
            className="px-4 py-2 rounded-lg text-sm"
            style={{ backgroundColor: 'var(--color-parchment)', border: '1px solid var(--color-border)' }}
            onClick={handleRandom}
          >
            随机
          </button>
        </div>
      </div>

      <button className="btn-primary w-full" onClick={handleSubmit}>
        起卦排盘
      </button>
    </div>
  );
}

// ============================================================
//  手动起卦
// ============================================================

function ManualForm({ onPaipan, onError }: { onPaipan: (c: LiuYaoConfig) => void; onError: (m: string) => void }) {
  const fields = useCommonFields();
  const [yaoTypes, setYaoTypes] = useState<YaoType[]>(Array(6).fill('shaoYang'));
  const positionNames = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

  const handleYaoChange = (index: number, value: YaoType) => {
    const newTypes = [...yaoTypes];
    newTypes[index] = value;
    setYaoTypes(newTypes);
  };

  const handleSubmit = () => {
    if (!fields.question.trim()) { onError('请输入问事内容'); return; }
    onPaipan({ ...fields.buildBaseConfig('manual'), rawYaoTypes: yaoTypes } as LiuYaoConfig);
  };

  return (
    <div>
      <CommonFields {...fields} />

      <div className="mb-4">
        <label className={labelCls}>手动设定六爻 (自下而上: 初爻→上爻)</label>
        <div className="space-y-2">
          {positionNames.map((name, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm w-12 text-right" style={{ color: 'var(--color-ink-light)' }}>
                {name}
              </span>
              <div className="flex gap-1 flex-1">
                {YAO_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className="flex-1 py-1.5 px-1 rounded text-xs transition-all"
                    style={{
                      backgroundColor: yaoTypes[i] === opt.value ? 'var(--color-cinnabar)' : 'var(--color-parchment)',
                      color: yaoTypes[i] === opt.value ? '#fff' : 'var(--color-ink)',
                      border: `1px solid ${yaoTypes[i] === opt.value ? 'var(--color-cinnabar)' : 'var(--color-border)'}`,
                    }}
                    onClick={() => handleYaoChange(i, opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-primary w-full" onClick={handleSubmit}>
        排盘
      </button>
    </div>
  );
}
