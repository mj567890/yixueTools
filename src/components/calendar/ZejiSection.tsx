'use client';

import { useMemo } from 'react';
import { getYuXiaInfo } from '@/lib/yuxia';
import ZhuShenPanel from './ZhuShenPanel';
import ShenShaPanel from './ShenShaPanel';
import DailyLesson from './DailyLesson';

interface ZejiSectionProps {
  year: number;
  month: number;
  day: number;
}

export default function ZejiSection({ year, month, day }: ZejiSectionProps) {
  const yuxia = useMemo(() => getYuXiaInfo(year, month, day), [year, month, day]);

  return (
    <div className="space-y-4 mt-6">
      {/* 标题 */}
      <h3 className="section-title flex items-center gap-2">
        玉匣择吉
        <span className="text-sm font-normal text-[var(--color-ink-light)]" style={{ fontFamily: 'var(--font-family-kai)' }}>
          ——据《许真君玉匣记》编纂
        </span>
      </h3>

      {/* 诸神所在 + 旬空 */}
      <ZhuShenPanel
        zhuShen={yuxia.zhuShen}
        xunKong={yuxia.xunKong}
        isTianSheDay={yuxia.isTianSheDay}
      />

      {/* 神煞值日 */}
      <ShenShaPanel
        shenSha={yuxia.shenSha}
        tianShen={yuxia.tianShen}
        jianXing={yuxia.jianXing}
        xiu={yuxia.xiu}
      />

      {/* 国学小课堂 */}
      <DailyLesson
        keyword={yuxia.dailyKeyword}
        quiz={yuxia.dailyQuiz}
      />

      {/* 免责声明 */}
      <p className="text-disclaimer">
        * 以上内容据《许真君玉匣记》《协纪辩方书》等古籍编纂，旨在普及国学文化，仅供民俗参考，不构成决策依据。传统择吉学说存在多个流派，判定或有差异，读者宜辩证理解。
      </p>
    </div>
  );
}
