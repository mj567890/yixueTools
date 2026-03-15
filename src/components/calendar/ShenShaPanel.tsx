'use client';

import { useState } from 'react';
import type { ShenShaItem, TianShenInfo, JianXingInfo, XiuInfo } from '@/lib/yuxia';

interface ShenShaPanelProps {
  shenSha: {
    jiShen: ShenShaItem[];
    xiongSha: ShenShaItem[];
  };
  tianShen: TianShenInfo;
  jianXing: JianXingInfo;
  xiu: XiuInfo;
}

export default function ShenShaPanel({ shenSha, tianShen, jianXing, xiu }: ShenShaPanelProps) {
  const [expandedJi, setExpandedJi] = useState<string | null>(null);
  const [expandedXiong, setExpandedXiong] = useState<string | null>(null);

  const isHuangDao = tianShen.type === '黄道';

  return (
    <div className="card-chinese p-5 space-y-5">
      <h4
        className="text-[17px] font-bold flex items-center gap-2"
        style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
      >
        神煞值日
        <span className="text-sm font-normal text-[var(--color-ink-light)]">
          ——择吉之"为何宜忌"
        </span>
      </h4>

      {/* 黄道/黑道 + 建除 + 二十八宿 三联展示 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 值日天神 */}
        <div className={`rounded-lg p-3 border ${isHuangDao ? 'border-[var(--color-cinnabar)] bg-[var(--color-cinnabar)]/5' : 'border-gray-300 bg-gray-50'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${isHuangDao ? 'bg-[var(--color-cinnabar)] text-white' : 'bg-gray-500 text-white'}`}
            >
              {tianShen.type}
            </span>
            <span
              className="text-base font-bold"
              style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
            >
              {tianShen.name}
            </span>
          </div>
          <p className="text-xs text-[var(--color-ink-light)] leading-relaxed">
            {tianShen.description}
          </p>
        </div>

        {/* 建除十二神 */}
        <div className={`rounded-lg p-3 border ${jianXing.luck === '吉' ? 'border-green-300 bg-green-50/50' : jianXing.luck === '凶' ? 'border-gray-300 bg-gray-50' : 'border-[var(--color-border-warm)]'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
              jianXing.luck === '吉' ? 'bg-green-600 text-white' : jianXing.luck === '凶' ? 'bg-gray-500 text-white' : 'bg-amber-500 text-white'
            }`}>
              建除·{jianXing.name}
            </span>
            <span className={`text-xs ${jianXing.luck === '吉' ? 'text-green-600' : jianXing.luck === '凶' ? 'text-gray-500' : 'text-amber-600'}`}>
              {jianXing.luck}
            </span>
          </div>
          <p className="text-xs text-[var(--color-ink-light)] leading-relaxed line-clamp-3">
            {jianXing.description}
          </p>
          {jianXing.yi && (
            <p className="text-xs mt-1">
              <span className="text-green-600">宜</span>
              <span className="text-[var(--color-ink-light)] ml-1">{jianXing.yi}</span>
            </p>
          )}
          {jianXing.ji && (
            <p className="text-xs">
              <span className="text-gray-500">忌</span>
              <span className="text-[var(--color-ink-light)] ml-1">{jianXing.ji}</span>
            </p>
          )}
        </div>

        {/* 二十八宿 */}
        <div className="rounded-lg p-3 border border-[var(--color-border-warm)]">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-[var(--color-primary)] text-white">
              宿·{xiu.name}
            </span>
            <span className={`text-xs ${xiu.luck === '吉' ? 'text-green-600' : 'text-gray-500'}`}>
              {xiu.luck}
            </span>
          </div>
          {xiu.song && (
            <p
              className="text-xs leading-relaxed mt-1"
              style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-ink-light)' }}
            >
              {xiu.song}
            </p>
          )}
        </div>
      </div>

      {/* 吉神宜趋 */}
      {shenSha.jiShen.length > 0 && (
        <div>
          <h5
            className="text-sm font-bold mb-2 flex items-center gap-1.5"
            style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
          >
            <span className="w-5 h-5 flex items-center justify-center rounded bg-red-100 text-red-600 text-xs">吉</span>
            吉神宜趋
          </h5>
          <div className="flex flex-wrap gap-1.5">
            {shenSha.jiShen.map((item) => (
              <button
                key={item.name}
                onClick={() => setExpandedJi(expandedJi === item.name ? null : item.name)}
                className={`inline-flex items-center px-2 py-1 rounded text-sm border transition-colors cursor-pointer ${
                  expandedJi === item.name
                    ? 'bg-[var(--color-cinnabar)] text-white border-[var(--color-cinnabar)]'
                    : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
          {expandedJi && shenSha.jiShen.find(i => i.name === expandedJi) && (
            <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-parchment)' }}>
              <p className="text-sm leading-relaxed">
                <span className="font-bold" style={{ color: 'var(--color-cinnabar)' }}>
                  {expandedJi}
                </span>
                ：{shenSha.jiShen.find(i => i.name === expandedJi)!.description}
              </p>
              {shenSha.jiShen.find(i => i.name === expandedJi)!.origin && (
                <p
                  className="text-xs mt-1 italic"
                  style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-gold)' }}
                >
                  {shenSha.jiShen.find(i => i.name === expandedJi)!.origin}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 凶神宜忌 */}
      {shenSha.xiongSha.length > 0 && (
        <div>
          <h5
            className="text-sm font-bold mb-2 flex items-center gap-1.5"
            style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
          >
            <span className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 text-gray-600 text-xs">凶</span>
            凶神宜忌
          </h5>
          <div className="flex flex-wrap gap-1.5">
            {shenSha.xiongSha.map((item) => (
              <button
                key={item.name}
                onClick={() => setExpandedXiong(expandedXiong === item.name ? null : item.name)}
                className={`inline-flex items-center px-2 py-1 rounded text-sm border transition-colors cursor-pointer ${
                  expandedXiong === item.name
                    ? 'bg-gray-600 text-white border-gray-600'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
          {expandedXiong && shenSha.xiongSha.find(i => i.name === expandedXiong) && (
            <div className="mt-2 p-3 rounded-lg bg-gray-50">
              <p className="text-sm leading-relaxed text-gray-700">
                <span className="font-bold text-gray-800">
                  {expandedXiong}
                </span>
                ：{shenSha.xiongSha.find(i => i.name === expandedXiong)!.description}
              </p>
              {shenSha.xiongSha.find(i => i.name === expandedXiong)!.origin && (
                <p className="text-xs mt-1 italic text-gray-500">
                  {shenSha.xiongSha.find(i => i.name === expandedXiong)!.origin}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 流派说明 */}
      <div className="border-t border-[var(--color-border-warm)] pt-3">
        <p className="text-xs text-[var(--color-ink-light)] leading-relaxed">
          <span className="font-bold" style={{ color: 'var(--color-primary-dark)' }}>流派须知：</span>
          以上神煞体系主要依据《许真君玉匣记》及《协纪辩方书》。传统择吉学说存在多个流派，如"星命派"重神煞、"理气派"重方位，不同典籍对同一日吉凶判定或有差异，此乃各派侧重不同所致。古人择吉讲究"制化"之道——凶日逢吉神可化解，吉日遇凶煞亦须审慎，不可拘泥于单一判定。
        </p>
      </div>
    </div>
  );
}
