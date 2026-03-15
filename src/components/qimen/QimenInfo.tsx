'use client';

import type { QimenResult } from '@/lib/qimen';

interface QimenInfoProps {
  result: QimenResult;
}

export default function QimenInfo({ result }: QimenInfoProps) {
  const { timeElements, juInfo, zhiFuInfo, voidBranches, horseBranch, config } = result;
  const isYinPan = config.panType === 'yinPan';

  return (
    <div className="card-chinese p-4 space-y-4">
      {/* 四柱 */}
      <div>
        <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
          四柱干支
        </h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: '年柱', gz: timeElements.yearGanZhi },
            { label: '月柱', gz: timeElements.monthGanZhi },
            { label: '日柱', gz: timeElements.dayGanZhi },
            { label: '时柱', gz: timeElements.timeGanZhi },
          ].map(item => (
            <div key={item.label}>
              <div className="pillar-label">{item.label}</div>
              <div className="ganzhi-char mt-1" style={{ fontSize: '22px' }}>{item.gz}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 定局/排盘信息 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
        <InfoTag label="节气" value={timeElements.currentJie} />
        <InfoTag label="下一节" value={timeElements.nextJie} />
        <InfoTag label="农历" value={timeElements.lunarDesc} />

        {isYinPan ? (
          <>
            {/* 阴盘信息：无遁局/三元/符头/方法 */}
            <InfoTag label="盘式" value="阴盘奇门" highlight />
            <InfoTag label="旬首" value={zhiFuInfo.xunShou} />
            <InfoTag label="值符" value={zhiFuInfo.zhiFuStar.name} />
            <InfoTag label="值使" value={zhiFuInfo.zhiShiGate.name} />
            <InfoTag label="空亡" value={voidBranches.join('、') || '无'} />
            <InfoTag label="马星" value={horseBranch || '无'} />
            {config.yearMing && <InfoTag label="年命" value={config.yearMing} />}
            {timeElements.usedTrueSolarTime && timeElements.trueSolarTimeDesc && (
              <div className="col-span-2 md:col-span-3">
                <InfoTag label="真太阳时" value={timeElements.trueSolarTimeDesc} />
              </div>
            )}
          </>
        ) : (
          <>
            {/* 阳盘信息：完整定局 */}
            {juInfo && (
              <>
                <InfoTag
                  label="遁局"
                  value={`${juInfo.dunType}${juInfo.juNumber}局`}
                  highlight
                />
                <InfoTag label="三元" value={juInfo.yuan} />
                <InfoTag label="符头" value={juInfo.fuTou} />
              </>
            )}
            <InfoTag label="旬首" value={zhiFuInfo.xunShou} />
            <InfoTag label="值符" value={zhiFuInfo.zhiFuStar.name} />
            <InfoTag label="值使" value={zhiFuInfo.zhiShiGate.name} />
            <InfoTag label="空亡" value={voidBranches.join('、') || '无'} />
            <InfoTag label="马星" value={horseBranch || '无'} />
            {juInfo && (
              <InfoTag
                label="方法"
                value={juInfo.method === 'chaiBu' ? '拆补法' : '置闰法'}
              />
            )}
            {juInfo?.isRunQi && <InfoTag label="闰奇" value="是" highlight />}
          </>
        )}
      </div>
    </div>
  );
}

function InfoTag({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-xs" style={{ color: 'var(--color-ink-light)' }}>{label}</span>
      <span
        className="font-medium"
        style={{
          fontFamily: 'var(--font-family-kai)',
          color: highlight ? 'var(--color-cinnabar)' : 'var(--color-ink)',
        }}
      >
        {value}
      </span>
    </div>
  );
}
