'use client';

import { CalendarResult, getWuxingClass, WU_XING_MAP } from '@/lib/lunar';

interface CompactBaziProps {
  data: CalendarResult;
}

function PillarItem({ label, ganZhi, naYin }: { label: string; ganZhi: string; naYin: string }) {
  const gan = ganZhi[0];
  const zhi = ganZhi[1];
  const ganWx = WU_XING_MAP[gan] || '';
  const zhiWx = WU_XING_MAP[zhi] || '';

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-[var(--color-ink-light)]">{label}</span>
      <span
        className="text-base font-semibold"
        style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
      >
        {ganZhi}
      </span>
      <span className={`tag-element ${getWuxingClass(ganWx)}`} style={{ fontSize: '11px', padding: '0 4px', lineHeight: '18px' }}>{ganWx}</span>
      <span className={`tag-element ${getWuxingClass(zhiWx)}`} style={{ fontSize: '11px', padding: '0 4px', lineHeight: '18px' }}>{zhiWx}</span>
      <span className="text-sm text-[var(--color-gold)]">({naYin})</span>
    </div>
  );
}

export default function CompactBazi({ data }: CompactBaziProps) {
  return (
    <div className="card-chinese p-3 mb-6">
      <div className="flex items-center justify-center gap-3 md:gap-5 flex-wrap">
        <PillarItem label="年柱" ganZhi={data.yearGanZhi} naYin={data.yearNaYin} />
        <span className="text-[var(--color-border-warm)] hidden sm:inline">|</span>
        <PillarItem label="月柱" ganZhi={data.monthGanZhi} naYin={data.monthNaYin} />
        <span className="text-[var(--color-border-warm)] hidden sm:inline">|</span>
        <PillarItem label="日柱" ganZhi={data.dayGanZhi} naYin={data.dayNaYin} />
        <span className="text-[var(--color-border-warm)] hidden sm:inline">|</span>
        <PillarItem label="时柱" ganZhi={data.timeGanZhi} naYin={data.timeNaYin} />
      </div>
    </div>
  );
}
