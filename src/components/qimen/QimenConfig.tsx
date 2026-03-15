'use client';

import { useState, useMemo } from 'react';
import type { QimenConfig } from '@/lib/qimen';
import { CITY_DATABASE } from '@/lib/qimen';

interface QimenConfigProps {
  onResult: (config: QimenConfig) => void;
  onError: (msg: string) => void;
}

type PanType = 'yinPan' | 'zhuanPan';

export default function QimenConfigPanel({ onResult, onError }: QimenConfigProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());
  const [hour, setHour] = useState(now.getHours());
  const [minute, setMinute] = useState(now.getMinutes());
  const [panType, setPanType] = useState<PanType>('yinPan');
  const [method, setMethod] = useState<'chaiBu' | 'zhiRun'>('chaiBu');
  const [yearMing, setYearMing] = useState('');
  const [question, setQuestion] = useState('');
  const [longitude, setLongitude] = useState(116.41);
  const [useTrueSolarTime, setUseTrueSolarTime] = useState(true);
  const [citySearch, setCitySearch] = useState('北京');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // 城市搜索结果
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return CITY_DATABASE.slice(0, 20);
    const q = citySearch.trim();
    return CITY_DATABASE.filter(c =>
      c.name.includes(q) || c.province.includes(q)
    ).slice(0, 20);
  }, [citySearch]);

  const handleCitySelect = (city: { name: string; province: string; lng: number }) => {
    setCitySearch(`${city.name}(${city.province})`);
    setLongitude(city.lng);
    setShowCityDropdown(false);
  };

  const handleUseNow = () => {
    const n = new Date();
    setYear(n.getFullYear());
    setMonth(n.getMonth() + 1);
    setDay(n.getDate());
    setHour(n.getHours());
    setMinute(n.getMinutes());
  };

  const handleSubmit = () => {
    if (year < 1900 || year > 2100) {
      onError('年份需在1900-2100之间');
      return;
    }
    if (month < 1 || month > 12) {
      onError('月份无效');
      return;
    }
    if (day < 1 || day > 31) {
      onError('日期无效');
      return;
    }

    const config: QimenConfig = {
      year, month, day, hour,
      minute,
      panType,
      question,
    };

    if (panType === 'zhuanPan') {
      config.method = method;
    }

    if (panType === 'yinPan') {
      config.longitude = longitude;
      config.useTrueSolarTime = useTrueSolarTime;
      if (yearMing.trim()) {
        config.yearMing = yearMing.trim();
      }
    }

    onResult(config);
  };

  const handleClear = () => {
    setQuestion('');
    setYearMing('');
    onError('');
  };

  const yearOptions = [];
  for (let y = 1940; y <= 2060; y++) yearOptions.push(y);

  const daysInMonth = new Date(year, month, 0).getDate();
  const dayOptions = [];
  for (let d = 1; d <= daysInMonth; d++) dayOptions.push(d);

  return (
    <div className="card-chinese p-5 space-y-4">
      {/* 盘类型切换 */}
      <div>
        <label className="form-label">盘类型</label>
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border-warm)' }}>
          <button
            className="flex-1 py-2 text-sm font-medium transition-all"
            style={{
              backgroundColor: panType === 'yinPan' ? 'var(--color-cinnabar)' : 'transparent',
              color: panType === 'yinPan' ? '#fff' : 'var(--color-ink-light)',
            }}
            onClick={() => setPanType('yinPan')}
          >
            阴盘（王凤麟）
          </button>
          <button
            className="flex-1 py-2 text-sm font-medium transition-all"
            style={{
              backgroundColor: panType === 'zhuanPan' ? 'var(--color-cinnabar)' : 'transparent',
              color: panType === 'zhuanPan' ? '#fff' : 'var(--color-ink-light)',
            }}
            onClick={() => setPanType('zhuanPan')}
          >
            转盘（阳盘）
          </button>
        </div>
      </div>

      {/* 日期 + 精确时间 */}
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

      {/* 真太阳时 + 城市选择（仅阴盘） */}
      {panType === 'yinPan' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="form-label" style={{ marginBottom: 0 }}>真太阳时修正</label>
            <button
              className="px-3 py-1 text-xs rounded-md border transition-all"
              style={{
                backgroundColor: useTrueSolarTime ? 'var(--color-cinnabar)' : 'transparent',
                color: useTrueSolarTime ? '#fff' : 'var(--color-ink-light)',
                borderColor: useTrueSolarTime ? 'var(--color-cinnabar)' : 'var(--color-border-warm)',
              }}
              onClick={() => setUseTrueSolarTime(!useTrueSolarTime)}
            >
              {useTrueSolarTime ? '已开启' : '已关闭'}
            </button>
          </div>

          {useTrueSolarTime && (
            <div className="space-y-2">
              {/* 城市搜索下拉 */}
              <div className="relative">
                <label className="form-label">问事城市</label>
                <input
                  type="text"
                  className="form-input w-full"
                  placeholder="搜索城市名称..."
                  value={citySearch}
                  onChange={e => {
                    setCitySearch(e.target.value);
                    setShowCityDropdown(true);
                  }}
                  onFocus={() => setShowCityDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                />
                {showCityDropdown && filteredCities.length > 0 && (
                  <div
                    className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto rounded-lg border shadow-lg"
                    style={{ backgroundColor: '#fff', borderColor: 'var(--color-border-warm)' }}
                  >
                    {filteredCities.map(city => (
                      <button
                        key={`${city.province}-${city.name}`}
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 flex justify-between"
                        onMouseDown={() => handleCitySelect(city)}
                      >
                        <span>{city.name}</span>
                        <span style={{ color: 'var(--color-ink-light)', fontSize: '12px' }}>
                          {city.province} {city.lng}°E
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 手动经度输入 */}
              <div className="flex gap-2 items-center">
                <label className="text-xs" style={{ color: 'var(--color-ink-light)' }}>经度：</label>
                <input
                  type="number"
                  className="form-input w-28"
                  value={longitude}
                  onChange={e => setLongitude(Number(e.target.value))}
                  min={70}
                  max={140}
                  step={0.1}
                />
                <span className="text-xs" style={{ color: 'var(--color-ink-light)' }}>°E</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 定局方法（仅阳盘） */}
      {panType === 'zhuanPan' && (
        <div>
          <label className="form-label">定局方法</label>
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border-warm)' }}>
            <button
              className="flex-1 py-2 text-sm font-medium transition-all"
              style={{
                backgroundColor: method === 'chaiBu' ? 'var(--color-cinnabar)' : 'transparent',
                color: method === 'chaiBu' ? '#fff' : 'var(--color-ink-light)',
              }}
              onClick={() => setMethod('chaiBu')}
            >
              拆补法
            </button>
            <button
              className="flex-1 py-2 text-sm font-medium transition-all"
              style={{
                backgroundColor: method === 'zhiRun' ? 'var(--color-cinnabar)' : 'transparent',
                color: method === 'zhiRun' ? '#fff' : 'var(--color-ink-light)',
              }}
              onClick={() => setMethod('zhiRun')}
            >
              置闰法
            </button>
          </div>
        </div>
      )}

      {/* 年命输入（仅阴盘） */}
      {panType === 'yinPan' && (
        <div>
          <label className="form-label">年命干支（用于隐干计算）</label>
          <input
            type="text"
            className="form-input w-full"
            placeholder="如：甲子、乙丑..."
            value={yearMing}
            onChange={e => setYearMing(e.target.value)}
            maxLength={4}
          />
        </div>
      )}

      {/* 问事内容 */}
      <div>
        <label className="form-label">问事内容（可选）</label>
        <textarea
          className="form-input w-full"
          rows={2}
          placeholder="请输入所问之事..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button className="btn-primary flex-1" onClick={handleSubmit}>
          排盘
        </button>
        <button className="btn-outline" onClick={handleUseNow}>
          当前时间
        </button>
        <button className="btn-outline" onClick={handleClear}>
          清除
        </button>
      </div>
    </div>
  );
}
