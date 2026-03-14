'use client';

import { CalendarResult, getWuxingClass, WU_XING_MAP } from '@/lib/lunar';

interface DayDetailProps {
  data: CalendarResult;
}

function GanZhiPillar({
  label,
  ganZhi,
  naYin,
}: {
  label: string;
  ganZhi: string;
  naYin: string;
}) {
  const gan = ganZhi[0];
  const zhi = ganZhi[1];
  const ganWx = WU_XING_MAP[gan] || '';
  const zhiWx = WU_XING_MAP[zhi] || '';

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-[var(--color-ink-light)]">{label}</span>
      <div className="card-chinese !p-3 flex flex-col items-center gap-1 min-w-[70px]">
        <span className={`tag-element ${getWuxingClass(ganWx)}`}>{ganWx}</span>
        <span
          className="text-xl font-bold"
          style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
        >
          {gan}
        </span>
        <hr className="w-8 border-[var(--color-border-warm)]" />
        <span
          className="text-xl font-bold"
          style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
        >
          {zhi}
        </span>
        <span className={`tag-element ${getWuxingClass(zhiWx)}`}>{zhiWx}</span>
      </div>
      <span className="text-xs text-[var(--color-gold)]">{naYin}</span>
    </div>
  );
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
              <span className="text-sm text-[var(--color-ink-light)]">
                星期{data.solarWeek}
              </span>
            </div>
            <div className="flex items-center gap-3 text-base">
              <span style={{ color: 'var(--color-cinnabar)' }}>
                农历 {data.lunarMonthName}月{data.lunarDayName}
                {data.isLeapMonth && <span className="text-xs ml-1">(闰)</span>}
              </span>
              <span className="text-[var(--color-gold)]">
                {data.shengXiao}年
              </span>
              <span className="text-sm text-[var(--color-ink-light)]">
                {data.xingZuo}座
              </span>
            </div>
          </div>

          {/* 节气 / 节日 */}
          <div className="text-right">
            {data.currentJieQi && (
              <div className="text-sm">
                <span className="text-[var(--color-cinnabar)] font-bold">
                  今日节气：{data.currentJieQi}
                </span>
              </div>
            )}
            {data.nextJieQi && (
              <div className="text-xs text-[var(--color-ink-light)]">
                下一节气：{data.nextJieQi.name}（{data.nextJieQi.date}）
              </div>
            )}
            {data.festivals.length > 0 && (
              <div className="flex gap-1 mt-1 flex-wrap justify-end">
                {data.festivals.map((f, i) => (
                  <span
                    key={i}
                    className="inline-block px-2 py-0.5 rounded text-xs text-white"
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

      {/* 四柱排盘 */}
      <div className="card-chinese p-5">
        <h3
          className="section-title mb-5"
          style={{ fontSize: '1.1rem' }}
        >
          四柱八字
        </h3>
        <div className="flex items-center justify-center gap-4 md:gap-8">
          <GanZhiPillar label="年柱" ganZhi={data.yearGanZhi} naYin={data.yearNaYin} />
          <GanZhiPillar label="月柱" ganZhi={data.monthGanZhi} naYin={data.monthNaYin} />
          <GanZhiPillar label="日柱" ganZhi={data.dayGanZhi} naYin={data.dayNaYin} />
          <GanZhiPillar label="时柱" ganZhi={data.timeGanZhi} naYin={data.timeNaYin} />
        </div>
      </div>

      {/* 宜忌 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-chinese p-5">
          <h3
            className="text-base font-bold mb-3 flex items-center gap-2"
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
                  className="inline-block px-2 py-1 rounded text-xs bg-green-50 text-green-700 border border-green-200"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-sm text-[var(--color-ink-light)]">无</span>
            )}
          </div>
        </div>

        <div className="card-chinese p-5">
          <h3
            className="text-base font-bold mb-3 flex items-center gap-2"
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
                  className="inline-block px-2 py-1 rounded text-xs bg-red-50 text-red-600 border border-red-200"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-sm text-[var(--color-ink-light)]">无</span>
            )}
          </div>
        </div>
      </div>

      {/* 其他信息 */}
      <div className="card-chinese p-5">
        <h3
          className="section-title mb-4"
          style={{ fontSize: '1.1rem' }}
        >
          详细信息
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex gap-2">
            <span className="text-[var(--color-ink-light)] min-w-[72px]">彭祖百忌：</span>
            <span>{data.pengZu}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[var(--color-ink-light)] min-w-[72px]">冲煞：</span>
            <span>冲{data.chong} 煞{data.sha}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[var(--color-ink-light)] min-w-[72px]">胎神方位：</span>
            <span>{data.taiShen}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[var(--color-ink-light)] min-w-[72px]">农历年号：</span>
            <span>{data.lunarYearName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
