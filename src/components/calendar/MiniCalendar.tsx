'use client';

import { useState, useMemo } from 'react';
import { getMonthCalendar } from '@/lib/lunar';

interface MiniCalendarProps {
  year: number;
  month: number;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  onChangeMonth: (year: number, month: number) => void;
}

const WEEK_HEADERS = ['日', '一', '二', '三', '四', '五', '六'];

export default function MiniCalendar({
  year,
  month,
  selectedDay,
  onSelectDay,
  onChangeMonth,
}: MiniCalendarProps) {
  const days = useMemo(() => getMonthCalendar(year, month), [year, month]);

  const prevMonth = () => {
    if (month === 1) onChangeMonth(year - 1, 12);
    else onChangeMonth(year, month - 1);
  };

  const nextMonth = () => {
    if (month === 12) onChangeMonth(year + 1, 1);
    else onChangeMonth(year, month + 1);
  };

  return (
    <div className="card-chinese p-4">
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-parchment)] transition-colors"
        >
          ◀
        </button>
        <span
          className="text-base font-bold"
          style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
        >
          {year}年 {month}月
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-parchment)] transition-colors"
        >
          ▶
        </button>
      </div>

      {/* 星期头 */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {WEEK_HEADERS.map((w) => (
          <div
            key={w}
            className="text-center text-xs py-1 font-bold"
            style={{ color: 'var(--color-ink-light)' }}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 日期格子 */}
      <div className="grid grid-cols-7 gap-0">
        {days.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="p-1" />;
          }

          const isSelected = day.solarDay === selectedDay;
          const hasJieQi = !!day.jieQi;
          const hasFestival = day.festivals.length > 0;

          return (
            <button
              key={day.solarDay}
              onClick={() => onSelectDay(day.solarDay)}
              className={`p-1 rounded-lg text-center transition-all relative ${
                isSelected
                  ? 'bg-[var(--color-cinnabar)] text-white'
                  : day.isToday
                    ? 'bg-[var(--color-parchment)] ring-1 ring-[var(--color-cinnabar)]'
                    : 'hover:bg-[var(--color-parchment)]'
              }`}
            >
              <div className={`text-sm font-bold ${isSelected ? 'text-white' : ''}`}>
                {day.solarDay}
              </div>
              <div
                className={`text-[10px] leading-tight truncate ${
                  isSelected
                    ? 'text-white/80'
                    : hasJieQi
                      ? 'text-[var(--color-cinnabar)]'
                      : hasFestival
                        ? 'text-[var(--color-gold)]'
                        : 'text-[var(--color-ink-light)]'
                }`}
              >
                {day.jieQi || (day.festivals.length > 0 ? day.festivals[0] : day.lunarDay)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
