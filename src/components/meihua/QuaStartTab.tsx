'use client';

import { useState } from 'react';
import type { DivinationResult, DivinationMethod } from '@/lib/meihua';
import {
  divinateByTime, divinateByNumber, divinateByText,
  generateRandomNumbers, getTotalStrokes,
} from '@/lib/meihua';

// ============================================================
//  时辰选项
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

function yearOptions() {
  const years = [];
  for (let y = 2100; y >= 1900; y--) years.push(y);
  return years;
}

const TAB_ITEMS: { key: DivinationMethod; label: string; icon: string }[] = [
  { key: 'time',   label: '时间起卦', icon: '🕐' },
  { key: 'number', label: '数字起卦', icon: '🔢' },
  { key: 'text',   label: '文字起卦', icon: '✏️' },
];

// ============================================================
//  通用样式
// ============================================================
const selectCls = 'form-input text-base py-2';
const labelCls = 'form-label';

interface QuaStartTabProps {
  onResult: (result: DivinationResult) => void;
  onError: (msg: string) => void;
}

export default function QuaStartTab({ onResult, onError }: QuaStartTabProps) {
  const [method, setMethod] = useState<DivinationMethod>('time');

  return (
    <div className="card-chinese p-5 md:p-6">
      {/* Tab 切换 */}
      <div className="flex rounded-xl p-1 mb-5" style={{ backgroundColor: 'var(--color-parchment)' }}>
        {TAB_ITEMS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMethod(tab.key)}
            className="flex-1 py-2.5 px-3 rounded-lg text-base font-medium transition-all"
            style={{
              backgroundColor: method === tab.key ? '#fff' : 'transparent',
              color: method === tab.key ? 'var(--color-cinnabar)' : 'var(--color-ink-light)',
              boxShadow: method === tab.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              fontFamily: 'var(--font-family-kai)',
            }}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 表单区域 */}
      {method === 'time'   && <TimeForm onResult={onResult} onError={onError} />}
      {method === 'number' && <NumberForm onResult={onResult} onError={onError} />}
      {method === 'text'   && <TextForm onResult={onResult} onError={onError} />}
    </div>
  );
}

// ============================================================
//  时间起卦表单
// ============================================================
function TimeForm({ onResult, onError }: { onResult: (r: DivinationResult) => void; onError: (m: string) => void }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());
  const [hour, setHour] = useState(() => {
    const h = now.getHours();
    const m = SHICHEN_OPTIONS.find((o) => (o.value === 23 ? h >= 23 || h < 1 : h >= o.value && h < o.value + 2));
    return m?.value ?? 7;
  });
  const [question, setQuestion] = useState('');

  const handleNow = () => {
    const n = new Date();
    setYear(n.getFullYear());
    setMonth(n.getMonth() + 1);
    setDay(n.getDate());
    const h = n.getHours();
    const m = SHICHEN_OPTIONS.find((o) => (o.value === 23 ? h >= 23 || h < 1 : h >= o.value && h < o.value + 2));
    setHour(m?.value ?? 7);
  };

  const handleSubmit = () => {
    try {
      const result = divinateByTime(year, month, day, hour, question);
      onResult(result);
    } catch (e) {
      onError(e instanceof Error ? e.message : '时间起卦失败，请检查日期是否正确');
    }
  };

  const handleClear = () => {
    handleNow();
    setQuestion('');
  };

  return (
    <div className="space-y-4">
      {/* 日期选择 + 当前时间 同一行 */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 items-end">
        <div>
          <label className={labelCls}>年</label>
          <select value={year} onChange={(e) => setYear(+e.target.value)} className={selectCls + ' w-full'}>
            {yearOptions().map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>月</label>
          <select value={month} onChange={(e) => setMonth(+e.target.value)} className={selectCls + ' w-full'}>
            {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}月</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>日</label>
          <select value={day} onChange={(e) => setDay(+e.target.value)} className={selectCls + ' w-full'}>
            {Array.from({ length: 31 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}日</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>时辰</label>
          <select value={hour} onChange={(e) => setHour(+e.target.value)} className={selectCls + ' w-full'}>
            {SHICHEN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <button
            onClick={handleNow}
            className="btn-outline w-full py-2"
          >
            当前时间
          </button>
        </div>
      </div>

      {/* 问事内容 */}
      <div>
        <label className={labelCls}>问事内容（选填）</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, 50))}
          placeholder="简述所问之事..."
          maxLength={50}
          rows={2}
          className={`${selectCls} w-full resize-none`}
        />
      </div>

      {/* 按钮 */}
      <div className="flex gap-3">
        <button onClick={handleSubmit} className="btn-primary flex-1">起卦</button>
        <button onClick={handleClear} className="btn-outline">清除</button>
      </div>
    </div>
  );
}

// ============================================================
//  数字起卦表单
// ============================================================
function NumberForm({ onResult, onError }: { onResult: (r: DivinationResult) => void; onError: (m: string) => void }) {
  const [upper, setUpper] = useState('');
  const [lower, setLower] = useState('');
  const [moving, setMoving] = useState('');
  const [question, setQuestion] = useState('');

  const handleRandom = () => {
    const nums = generateRandomNumbers();
    setUpper(String(nums.upper));
    setLower(String(nums.lower));
    setMoving(String(nums.moving));
  };

  const handleSubmit = () => {
    const u = parseInt(upper, 10);
    const l = parseInt(lower, 10);
    const m = parseInt(moving, 10);
    if (isNaN(u) || isNaN(l) || isNaN(m)) {
      onError('请输入有效的正整数（1~999）');
      return;
    }
    if (u < 1 || l < 1 || m < 1) {
      onError('数字必须大于 0');
      return;
    }
    if (u > 999 || l > 999 || m > 999) {
      onError('数字不能超过 999');
      return;
    }
    try {
      const result = divinateByNumber(u, l, m, question);
      onResult(result);
    } catch (e) {
      onError(e instanceof Error ? e.message : '起卦失败，请检查输入');
    }
  };

  const handleClear = () => {
    setUpper(''); setLower(''); setMoving(''); setQuestion('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>上卦数</label>
          <input
            type="number" min={1} max={999}
            value={upper}
            onChange={(e) => setUpper(e.target.value)}
            placeholder="如 5"
            className={selectCls}
          />
        </div>
        <div>
          <label className={labelCls}>下卦数</label>
          <input
            type="number" min={1} max={999}
            value={lower}
            onChange={(e) => setLower(e.target.value)}
            placeholder="如 3"
            className={selectCls}
          />
        </div>
        <div>
          <label className={labelCls}>动爻数</label>
          <input
            type="number" min={1} max={999}
            value={moving}
            onChange={(e) => setMoving(e.target.value)}
            placeholder="如 2"
            className={selectCls}
          />
        </div>
      </div>

      <button
        onClick={handleRandom}
        className="text-sm px-3 py-1.5 rounded-lg transition-colors"
        style={{ color: 'var(--color-cinnabar)', border: '1px solid var(--color-cinnabar)' }}
      >
        随机生成
      </button>

      <div>
        <label className={labelCls}>问事内容（选填）</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, 50))}
          placeholder="简述所问之事..."
          maxLength={50}
          rows={2}
          className={`${selectCls} w-full resize-none`}
        />
      </div>

      <div className="flex gap-3">
        <button onClick={handleSubmit} className="btn-primary flex-1">起卦</button>
        <button onClick={handleClear} className="btn-outline">清除</button>
      </div>
    </div>
  );
}

// ============================================================
//  文字起卦表单
// ============================================================
function TextForm({ onResult, onError }: { onResult: (r: DivinationResult) => void; onError: (m: string) => void }) {
  const [text, setText] = useState('');
  const [question, setQuestion] = useState('');

  // 实时预览笔画拆分
  const chars = Array.from(text.replace(/\s/g, ''));
  const splitIndex = Math.floor(chars.length / 2);
  const upperChars = chars.slice(0, splitIndex || (chars.length > 0 ? 1 : 0));
  const lowerChars = splitIndex > 0 ? chars.slice(splitIndex) : (chars.length > 0 ? chars : []);
  const preview = chars.length > 0 ? getTotalStrokes(chars.join('')) : null;

  const handleSubmit = () => {
    if (chars.length === 0) {
      onError('请输入至少一个汉字');
      return;
    }
    try {
      const result = divinateByText(text, question);
      onResult(result);
    } catch (e) {
      onError(e instanceof Error ? e.message : '文字起卦失败，请检查输入');
    }
  };

  const handleClear = () => { setText(''); setQuestion(''); };

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>输入文字（最多20字）</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 20))}
          placeholder={'输入汉字，如\u201C天地玄黄\u201D'}
          maxLength={20}
          rows={2}
          className={`${selectCls} w-full resize-none`}
        />
      </div>

      {/* 实时笔画预览 */}
      {preview && chars.length > 0 && (
        <div
          className="p-3 rounded-lg text-sm"
          style={{ backgroundColor: 'var(--color-parchment)', border: '1px solid var(--color-border-warm)' }}
        >
          <div className="flex flex-wrap gap-1 mb-2">
            {preview.details.map((d, i) => {
              const isUpper = i < upperChars.length;
              return (
                <span
                  key={i}
                  className="inline-flex flex-col items-center px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: isUpper ? '#FEF2F2' : '#F0FDF4',
                    border: `1px solid ${isUpper ? '#FECACA' : '#BBF7D0'}`,
                  }}
                >
                  <span className="text-base font-medium" style={{ color: 'var(--color-primary-dark)' }}>
                    {d.char}
                  </span>
                  <span className="text-xs" style={{ color: d.estimated ? '#C23B22' : '#666' }}>
                    {d.strokes}画{d.estimated ? '*' : ''}
                  </span>
                </span>
              );
            })}
          </div>
          <div className="text-sm" style={{ color: '#666' }}>
            <span style={{ color: '#DC2626' }}>上卦</span>：
            {upperChars.join('')}（{preview.details.slice(0, upperChars.length).reduce((s, d) => s + d.strokes, 0)}画）
            {' · '}
            <span style={{ color: '#15803D' }}>下卦</span>：
            {lowerChars.join('')}（{preview.details.slice(upperChars.length).reduce((s, d) => s + d.strokes, 0)}画）
            {' · '}
            总计{preview.total}画
          </div>
          {preview.details.some((d) => d.estimated) && (
            <div className="text-xs mt-1" style={{ color: '#C23B22' }}>
              * 标注为估算笔画（字典未收录）
            </div>
          )}
        </div>
      )}

      <div>
        <label className={labelCls}>问事内容（选填）</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, 50))}
          placeholder="简述所问之事..."
          maxLength={50}
          rows={2}
          className={`${selectCls} w-full resize-none`}
        />
      </div>

      <div className="flex gap-3">
        <button onClick={handleSubmit} className="btn-primary flex-1">起卦</button>
        <button onClick={handleClear} className="btn-outline">清除</button>
      </div>
    </div>
  );
}
