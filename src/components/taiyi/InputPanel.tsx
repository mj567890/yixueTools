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

  const daysInMonth = new Date(year, month, 0).getDate();

  const yearOptions = [];
  for (let y = 1940; y <= 2060; y++) yearOptions.push(y);
  const dayOptions = [];
  for (let d = 1; d <= daysInMonth; d++) dayOptions.push(d);

  return (
    <div className="card-chinese p-5 space-y-4">
      {/* 日期时间 */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        <div>
          <label className="form-label">年</label>
          <select className="form-input w-full" value={year} onChange={e => setYear(Number(e.target.value))}>
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">月</label>
          <select className="form-input w-full" value={month} onChange={e => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m}月</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">日</label>
          <select className="form-input w-full" value={day > daysInMonth ? daysInMonth : day} onChange={e => setDay(Number(e.target.value))}>
            {dayOptions.map(d => <option key={d} value={d}>{d}日</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">时</label>
          <select className="form-input w-full" value={hour} onChange={e => setHour(Number(e.target.value))}>
            {Array.from({ length: 24 }, (_, i) => i).map(h => (
              <option key={h} value={h}>{String(h).padStart(2, '0')}时</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">分</label>
          <select className="form-input w-full" value={minute} onChange={e => setMinute(Number(e.target.value))}>
            {Array.from({ length: 60 }, (_, i) => i).map(m => (
              <option key={m} value={m}>{String(m).padStart(2, '0')}分</option>
            ))}
          </select>
        </div>
      </div>

      {/* 流派 + 计算类型 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="form-label">流派</label>
          <select className="form-input w-full" value={school} onChange={e => setSchool(e.target.value as TaiyiSchool)}>
            <option value="tongzong">统宗宝鉴</option>
            <option value="jinjing">金镜式经</option>
          </select>
        </div>
        <div>
          <label className="form-label">计算类型</label>
          <select className="form-input w-full" value={calcType} onChange={e => setCalcType(e.target.value as CalcType)}>
            <option value="year">年计</option>
            <option value="month">月计</option>
            <option value="day">日计</option>
            <option value="hour">时计</option>
          </select>
        </div>
      </div>

      {/* 场景选择 */}
      <div>
        <label className="form-label">问事场景（可选）</label>
        <select className="form-input w-full" value={scenario} onChange={e => setScenario(e.target.value as ScenarioType | '')}>
          <option value="">-- 不指定 --</option>
          {SCENARIO_CONFIGS.map(sc => (
            <option key={sc.type} value={sc.type}>{sc.label}</option>
          ))}
        </select>
      </div>

      {/* 按钮 */}
      <div className="flex gap-3">
        <button className="btn-primary flex-1" onClick={handleSubmit}>
          起盘推算
        </button>
        <button className="btn-outline" onClick={handleNow}>
          当前时间
        </button>
      </div>
    </div>
  );
}
