'use client';

/**
 * 太乙排盘 —— 输入配置面板
 */

import { useState } from 'react';
import type { TaiyiSchool, CalcType, ScenarioType } from '@/lib/taiyi/types';
import { SCENARIO_CONFIGS } from '@/lib/taiyi/constants';

interface InputPanelProps {
  onCalculate: (config: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    school: TaiyiSchool;
    calcType: CalcType;
    scenario?: ScenarioType;
  }) => void;
}

export default function InputPanel({ onCalculate }: InputPanelProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());
  const [hour, setHour] = useState(now.getHours());
  const [minute, setMinute] = useState(now.getMinutes());
  const [school, setSchool] = useState<TaiyiSchool>('tongzong');
  const [calcType, setCalcType] = useState<CalcType>('year');
  const [scenario, setScenario] = useState<ScenarioType | ''>('');

  const handleSubmit = () => {
    onCalculate({
      year, month, day, hour, minute, school, calcType,
      scenario: scenario || undefined,
    });
  };

  const handleNow = () => {
    const n = new Date();
    setYear(n.getFullYear());
    setMonth(n.getMonth() + 1);
    setDay(n.getDate());
    setHour(n.getHours());
    setMinute(n.getMinutes());
  };

  const btnBase = 'flex-1 py-2 text-sm font-medium transition-all rounded';

  return (
    <div className="card-chinese p-4 md:p-5 space-y-4">
      <h3
        className="text-base font-bold"
        style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
      >
        排盘设置
      </h3>

      {/* 日期时间输入 */}
      <div className="flex flex-wrap gap-2 items-center justify-center">
        <label className="flex items-center gap-1 text-sm">
          <span style={{ color: 'var(--color-ink-light)' }}>年</span>
          <input
            type="number"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="w-20 px-2 py-1 border rounded text-center text-sm"
            style={{ borderColor: 'var(--color-border-warm)', background: 'var(--color-bg-card)' }}
          />
        </label>
        <label className="flex items-center gap-1 text-sm">
          <span style={{ color: 'var(--color-ink-light)' }}>月</span>
          <input
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="w-14 px-2 py-1 border rounded text-center text-sm"
            style={{ borderColor: 'var(--color-border-warm)', background: 'var(--color-bg-card)' }}
          />
        </label>
        <label className="flex items-center gap-1 text-sm">
          <span style={{ color: 'var(--color-ink-light)' }}>日</span>
          <input
            type="number"
            min={1}
            max={31}
            value={day}
            onChange={e => setDay(Number(e.target.value))}
            className="w-14 px-2 py-1 border rounded text-center text-sm"
            style={{ borderColor: 'var(--color-border-warm)', background: 'var(--color-bg-card)' }}
          />
        </label>
        <label className="flex items-center gap-1 text-sm">
          <span style={{ color: 'var(--color-ink-light)' }}>时</span>
          <input
            type="number"
            min={0}
            max={23}
            value={hour}
            onChange={e => setHour(Number(e.target.value))}
            className="w-14 px-2 py-1 border rounded text-center text-sm"
            style={{ borderColor: 'var(--color-border-warm)', background: 'var(--color-bg-card)' }}
          />
        </label>
        <label className="flex items-center gap-1 text-sm">
          <span style={{ color: 'var(--color-ink-light)' }}>分</span>
          <input
            type="number"
            min={0}
            max={59}
            value={minute}
            onChange={e => setMinute(Number(e.target.value))}
            className="w-14 px-2 py-1 border rounded text-center text-sm"
            style={{ borderColor: 'var(--color-border-warm)', background: 'var(--color-bg-card)' }}
          />
        </label>
        <button
          onClick={handleNow}
          className="btn-outline px-3 py-1 text-xs rounded"
        >
          当前时间
        </button>
      </div>

      {/* 流派选择 */}
      <div>
        <div className="text-xs mb-1" style={{ color: 'var(--color-ink-light)' }}>流派</div>
        <div className="flex gap-1 rounded overflow-hidden" style={{ border: '1px solid var(--color-border-warm)' }}>
          {[
            { value: 'tongzong' as TaiyiSchool, label: '统宗宝鉴' },
            { value: 'jinjing' as TaiyiSchool, label: '金镜式经' },
          ].map(opt => (
            <button
              key={opt.value}
              className={btnBase}
              style={{
                backgroundColor: school === opt.value ? 'var(--color-cinnabar)' : 'transparent',
                color: school === opt.value ? '#fff' : 'var(--color-ink-light)',
              }}
              onClick={() => setSchool(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 四计选择 */}
      <div>
        <div className="text-xs mb-1" style={{ color: 'var(--color-ink-light)' }}>计算类型</div>
        <div className="flex gap-1 rounded overflow-hidden" style={{ border: '1px solid var(--color-border-warm)' }}>
          {[
            { value: 'year' as CalcType, label: '年计' },
            { value: 'month' as CalcType, label: '月计' },
            { value: 'day' as CalcType, label: '日计' },
            { value: 'hour' as CalcType, label: '时计' },
          ].map(opt => (
            <button
              key={opt.value}
              className={btnBase}
              style={{
                backgroundColor: calcType === opt.value ? 'var(--color-cinnabar)' : 'transparent',
                color: calcType === opt.value ? '#fff' : 'var(--color-ink-light)',
              }}
              onClick={() => setCalcType(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 场景选择 */}
      <div>
        <div className="text-xs mb-1" style={{ color: 'var(--color-ink-light)' }}>问事场景（可选）</div>
        <div className="flex flex-wrap gap-1">
          <button
            className="px-3 py-1 text-xs rounded transition-all"
            style={{
              backgroundColor: !scenario ? 'var(--color-cinnabar)' : 'transparent',
              color: !scenario ? '#fff' : 'var(--color-ink-light)',
              border: '1px solid var(--color-border-warm)',
            }}
            onClick={() => setScenario('')}
          >
            不选
          </button>
          {SCENARIO_CONFIGS.map(sc => (
            <button
              key={sc.type}
              className="px-3 py-1 text-xs rounded transition-all"
              style={{
                backgroundColor: scenario === sc.type ? 'var(--color-cinnabar)' : 'transparent',
                color: scenario === sc.type ? '#fff' : 'var(--color-ink-light)',
                border: '1px solid var(--color-border-warm)',
              }}
              onClick={() => setScenario(sc.type)}
              title={sc.desc}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* 排盘按钮 */}
      <button
        onClick={handleSubmit}
        className="btn-primary w-full py-2.5 text-sm font-bold rounded"
      >
        起盘推算
      </button>
    </div>
  );
}
