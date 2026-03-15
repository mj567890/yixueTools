'use client';

import type { ZhuShenInfo, XunKongInfo } from '@/lib/yuxia';

interface ZhuShenPanelProps {
  zhuShen: ZhuShenInfo;
  xunKong: XunKongInfo;
  isTianSheDay: boolean;
}

const LUCK_STYLE: Record<string, { border: string; bg: string; text: string }> = {
  '大吉': { border: 'border-red-600', bg: 'bg-red-600', text: 'text-white' },
  '吉': { border: 'border-[var(--color-cinnabar)]', bg: 'bg-[var(--color-cinnabar)]', text: 'text-white' },
  '平': { border: 'border-[var(--color-gold)]', bg: 'bg-[var(--color-gold)]', text: 'text-white' },
  '凶': { border: 'border-gray-500', bg: 'bg-gray-500', text: 'text-white' },
};

const LOCATION_ICON: Record<string, string> = {
  '天': '☁',
  '地': '🌏',
  '人间': '🏘',
  '地府': '⛩',
};

export default function ZhuShenPanel({ zhuShen, xunKong, isTianSheDay }: ZhuShenPanelProps) {
  const ls = LUCK_STYLE[zhuShen.luck] || LUCK_STYLE['平'];

  return (
    <div className="card-chinese p-5">
      {/* 标题栏 */}
      <h4
        className="text-[17px] font-bold mb-4 flex items-center gap-2"
        style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
      >
        诸神方所
        <span className="text-sm font-normal text-[var(--color-ink-light)]">
          ——《玉匣记·诸神所在篇》
        </span>
      </h4>

      {/* 核心展示区 */}
      <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
        {/* 印章式标记 */}
        <div className="flex items-center gap-3">
          <div
            className={`w-16 h-16 rounded-full ${ls.border} border-2 flex flex-col items-center justify-center`}
            style={{ fontFamily: 'var(--font-family-kai)' }}
          >
            <span className="text-xl">{LOCATION_ICON[zhuShen.location] || '☁'}</span>
            <span className={`text-xs font-bold ${ls.bg} ${ls.text} px-1.5 rounded mt-0.5`}>{zhuShen.luck}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-xl font-bold"
                style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
              >
                诸神在{zhuShen.location}
              </span>
              <span className="text-sm text-[var(--color-ink-light)]">
                ({zhuShen.xunName})
              </span>
            </div>
            {isTianSheDay && (
              <div className="mt-1">
                <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white">
                  天赦日
                </span>
                <span className="text-xs text-[var(--color-ink-light)] ml-1">
                  天帝赦免万物，百事大吉
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 文化解读 */}
      <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: 'var(--color-parchment)' }}>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-base)' }}>
          {zhuShen.description}
        </p>
      </div>

      {/* 古籍原文 */}
      <div className="border-l-2 pl-3 mb-4" style={{ borderColor: 'var(--color-gold)' }}>
        <p
          className="text-sm italic leading-relaxed"
          style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-gold)' }}
        >
          {zhuShen.originalText}
        </p>
      </div>

      {/* 六甲旬空 */}
      <div className="rounded-lg p-3 border border-[var(--color-border-warm)]">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="text-sm font-bold"
            style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
          >
            六甲旬空
          </span>
          <span className="text-sm">
            空亡：
            <span className="font-semibold" style={{ fontFamily: 'var(--font-family-kai)' }}>
              {xunKong.kongZhi[0]}·{xunKong.kongZhi[1]}
            </span>
          </span>
          {xunKong.isKongDay && (
            <span className="inline-block px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-700 border border-amber-200">
              今日空亡
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--color-ink-light)] leading-relaxed">
          {xunKong.description}
        </p>
      </div>
    </div>
  );
}
