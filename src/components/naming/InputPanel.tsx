'use client';

/**
 * 起名测名 —— 输入面板
 */

import { useState } from 'react';
import type { Gender } from '@/lib/naming/types';

interface NamingInputPanelProps {
  onAnalyze: (data: {
    fullName: string;
    birthYear?: number;
    birthMonth?: number;
    birthDay?: number;
    birthHour?: number;
  }) => void;
  onGenerate: (data: {
    surname: string;
    gender: Gender;
    birthYear?: number;
    birthMonth?: number;
    birthDay?: number;
    birthHour?: number;
    nameLength: 1 | 2;
  }) => void;
}

export default function NamingInputPanel({ onAnalyze, onGenerate }: NamingInputPanelProps) {
  const [tab, setTab] = useState<'analyze' | 'generate'>('analyze');

  // 测名输入
  const [fullName, setFullName] = useState('');
  const [hasBirth, setHasBirth] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');

  // 起名输入
  const [surname, setSurname] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [nameLength, setNameLength] = useState<1 | 2>(2);
  const [generateError, setGenerateError] = useState('');
  const [genHasBirth, setGenHasBirth] = useState(false);

  // 共用生辰
  const now = new Date();
  const [birthYear, setBirthYear] = useState(now.getFullYear());
  const [birthMonth, setBirthMonth] = useState(now.getMonth() + 1);
  const [birthDay, setBirthDay] = useState(now.getDate());
  const [birthHour, setBirthHour] = useState(now.getHours());

  const handleAnalyze = () => {
    const name = fullName.trim();
    if (!name) {
      setAnalyzeError('请输入姓名');
      return;
    }
    if (name.length < 2) {
      setAnalyzeError('姓名至少需要2个字');
      return;
    }
    setAnalyzeError('');
    onAnalyze({
      fullName: name,
      birthYear: hasBirth ? birthYear : undefined,
      birthMonth: hasBirth ? birthMonth : undefined,
      birthDay: hasBirth ? birthDay : undefined,
      birthHour: hasBirth ? birthHour : undefined,
    });
  };

  const handleGenerate = () => {
    if (!surname.trim()) {
      setGenerateError('请输入姓氏');
      return;
    }
    setGenerateError('');
    onGenerate({
      surname: surname.trim(),
      gender,
      birthYear: genHasBirth ? birthYear : undefined,
      birthMonth: genHasBirth ? birthMonth : undefined,
      birthDay: genHasBirth ? birthDay : undefined,
      birthHour: genHasBirth ? birthHour : undefined,
      nameLength,
    });
  };

  const inputClass = 'w-full px-3 py-2 rounded-md text-sm'
    + ' bg-[var(--color-parchment)] border border-[var(--color-border-warm)]'
    + ' text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-cinnabar)]';

  const tabBtnClass = (active: boolean) =>
    'flex-1 py-2 text-sm font-medium transition-all '
    + (active
      ? 'bg-[var(--color-cinnabar)] text-white'
      : 'bg-[var(--color-bg-card)] text-[var(--color-ink-light)] hover:bg-[var(--color-parchment)]');

  return (
    <div className="card-chinese p-5">
      {/* 测名/起名切换 */}
      <div className="flex rounded-lg overflow-hidden mb-4 border border-[var(--color-border-warm)]">
        <button className={tabBtnClass(tab === 'analyze')} onClick={() => setTab('analyze')}>
          测名分析
        </button>
        <button className={tabBtnClass(tab === 'generate')} onClick={() => setTab('generate')}>
          起名推荐
        </button>
      </div>

      {tab === 'analyze' ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-[var(--color-ink-light)] mb-1">输入姓名</label>
            <input
              className={inputClass}
              placeholder="请输入完整姓名（如：张三丰）"
              value={fullName}
              onChange={e => { setFullName(e.target.value); setAnalyzeError(''); }}
              maxLength={6}
            />
          </div>

          {analyzeError && (
            <p className="text-xs text-red-500">{analyzeError}</p>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasBirth"
              checked={hasBirth}
              onChange={e => setHasBirth(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="hasBirth" className="text-xs text-[var(--color-ink-light)]">
              输入出生信息（启用八字匹配分析）
            </label>
          </div>

          {hasBirth && <BirthInputRow
            year={birthYear} month={birthMonth} day={birthDay} hour={birthHour}
            onYear={setBirthYear} onMonth={setBirthMonth} onDay={setBirthDay} onHour={setBirthHour}
          />}

          <button
            onClick={handleAnalyze}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-white bg-[var(--color-cinnabar)] hover:opacity-90 transition"
          >
            开始测名
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--color-ink-light)] mb-1">姓氏</label>
              <input
                className={inputClass}
                placeholder="如：张"
                value={surname}
                onChange={e => { setSurname(e.target.value); setGenerateError(''); }}
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--color-ink-light)] mb-1">性别</label>
              <select className={inputClass} value={gender} onChange={e => setGender(e.target.value as Gender)}>
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[var(--color-ink-light)] mb-1">名字字数</label>
            <div className="flex gap-2">
              {([1, 2] as const).map(n => (
                <button
                  key={n}
                  className={`flex-1 py-1.5 rounded text-sm border transition ${nameLength === n
                    ? 'border-[var(--color-cinnabar)] text-[var(--color-cinnabar)] bg-[var(--color-cinnabar)]/10'
                    : 'border-[var(--color-border-warm)] text-[var(--color-ink-light)]'
                    }`}
                  onClick={() => setNameLength(n)}
                >
                  {n === 1 ? '单名' : '双名'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="genHasBirth"
              checked={genHasBirth}
              onChange={e => setGenHasBirth(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="genHasBirth" className="text-xs text-[var(--color-ink-light)]">
              输入出生信息（启用八字匹配，推荐更精准）
            </label>
          </div>

          {genHasBirth && <BirthInputRow
            year={birthYear} month={birthMonth} day={birthDay} hour={birthHour}
            onYear={setBirthYear} onMonth={setBirthMonth} onDay={setBirthDay} onHour={setBirthHour}
          />}

          {generateError && (
            <p className="text-xs text-red-500">{generateError}</p>
          )}

          <button
            onClick={handleGenerate}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-white bg-[var(--color-cinnabar)] hover:opacity-90 transition"
          >
            智能起名
          </button>
        </div>
      )}
    </div>
  );
}

/* ===== 出生信息输入行 ===== */

function BirthInputRow({ year, month, day, hour, onYear, onMonth, onDay, onHour }: {
  year: number; month: number; day: number; hour: number;
  onYear: (v: number) => void; onMonth: (v: number) => void;
  onDay: (v: number) => void; onHour: (v: number) => void;
}) {
  const smallInput = 'w-full px-2 py-1.5 rounded text-xs text-center'
    + ' bg-[var(--color-parchment)] border border-[var(--color-border-warm)]'
    + ' text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-cinnabar)]';

  return (
    <div>
      <label className="block text-xs text-[var(--color-ink-light)] mb-1">出生日期（公历）</label>
      <div className="grid grid-cols-4 gap-2">
        <div>
          <input
            className={smallInput}
            type="number"
            placeholder="年"
            value={year}
            onChange={e => onYear(Number(e.target.value))}
            min={1900} max={2100}
          />
        </div>
        <div>
          <input
            className={smallInput}
            type="number"
            placeholder="月"
            value={month}
            onChange={e => onMonth(Number(e.target.value))}
            min={1} max={12}
          />
        </div>
        <div>
          <input
            className={smallInput}
            type="number"
            placeholder="日"
            value={day}
            onChange={e => onDay(Number(e.target.value))}
            min={1} max={31}
          />
        </div>
        <div>
          <input
            className={smallInput}
            type="number"
            placeholder="时"
            value={hour}
            onChange={e => onHour(Number(e.target.value))}
            min={0} max={23}
          />
        </div>
      </div>
      <p className="text-xs text-[var(--color-ink-light)] opacity-50 mt-1">年 / 月 / 日 / 时(0-23)</p>
    </div>
  );
}
