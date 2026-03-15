'use client';

import { CalendarResult } from '@/lib/lunar';

interface DayDetailProps {
  data: CalendarResult;
}

export default function DayDetail({ data }: DayDetailProps) {
  return (
    <div className="space-y-6">
      {/* 基本信息 */}
      <div className="card-chinese p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span
                className="text-3xl font-bold"
                style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
              >
                {data.solarYear}年{data.solarMonth}月{data.solarDay}日
              </span>
              {/* text-sm→text-base(16px) */}
              <span className="text-base text-[var(--color-ink-light)]">
                星期{data.solarWeek}
              </span>
            </div>
            <div className="flex items-center gap-3 text-lg">
              <span style={{ color: 'var(--color-cinnabar)' }}>
                农历 {data.lunarMonthName}月{data.lunarDayName}
                {data.isLeapMonth && <span className="text-sm ml-1">(闰)</span>}
              </span>
              <span className="text-[var(--color-gold)]">
                {data.shengXiao}年
              </span>
              {/* text-sm→text-base(16px) */}
              <span className="text-base text-[var(--color-ink-light)]">
                {data.xingZuo}座
              </span>
            </div>
          </div>

          {/* 节气 / 节日 */}
          <div className="text-right">
            {data.currentJieQi && (
              <div className="text-base">
                <span className="text-[var(--color-cinnabar)] font-bold">
                  今日节气：{data.currentJieQi}
                </span>
              </div>
            )}
            {data.nextJieQi && (
              <div className="text-sm text-[var(--color-ink-light)]">
                下一节气：{data.nextJieQi.name}（{data.nextJieQi.date}）
              </div>
            )}
            {data.festivals.length > 0 && (
              <div className="flex gap-1 mt-1 flex-wrap justify-end">
                {data.festivals.map((f, i) => (
                  <span
                    key={i}
                    className="inline-block px-2 py-0.5 rounded text-sm text-white"
                    style={{ backgroundColor: 'var(--color-cinnabar)' }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 宜忌 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-chinese p-5">
          <h3
            className="text-[17px] font-bold mb-3 flex items-center gap-2"
            style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
          >
            <span className="w-6 h-6 flex items-center justify-center rounded bg-red-100 text-red-600 text-sm">宜</span>
            今日宜
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.yi.length > 0 ? (
              data.yi.map((item, i) => (
                <span
                  key={i}
                  className="inline-block px-2.5 py-1 rounded text-sm bg-green-50 text-green-700 border border-green-200"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-base text-[var(--color-ink-light)]">无</span>
            )}
          </div>
        </div>

        <div className="card-chinese p-5">
          <h3
            className="text-[17px] font-bold mb-3 flex items-center gap-2"
            style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
          >
            <span className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 text-gray-600 text-sm">忌</span>
            今日忌
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.ji.length > 0 ? (
              data.ji.map((item, i) => (
                <span
                  key={i}
                  className="inline-block px-2.5 py-1 rounded text-sm bg-red-50 text-red-600 border border-red-200"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-base text-[var(--color-ink-light)]">无</span>
            )}
          </div>
        </div>
      </div>

      {/* 其他信息 */}
      <div className="card-chinese p-5">
        <h3
          className="section-title mb-4"
        >
          详细信息
        </h3>
        {/* text-sm→text-base(16px) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-base">
          <div className="flex gap-2">
            <span className="text-[var(--color-ink-light)] min-w-[80px]">彭祖百忌：</span>
            <span>{data.pengZu}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[var(--color-ink-light)] min-w-[80px]">冲煞：</span>
            <span>冲{data.chong} 煞{data.sha}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[var(--color-ink-light)] min-w-[80px]">胎神方位：</span>
            <span>{data.taiShen}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[var(--color-ink-light)] min-w-[80px]">农历年号：</span>
            <span>{data.lunarYearName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
