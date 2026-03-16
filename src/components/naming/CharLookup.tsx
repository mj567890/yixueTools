'use client';

/**
 * 起名测名 —— 汉字查询小工具
 * 1. 输入汉字 → 查五行、笔画等信息
 * 2. 选择五行 + 笔画数 → 查符合条件的汉字
 */

import { useState } from 'react';
import type { CharEntry, WuXing } from '@/lib/naming/types';
import { getCharEntry, getCharsByWuxingAndStrokes, getCharsByWuxing, getCharsByStrokes } from '@/lib/naming';

const WX_LIST: WuXing[] = ['木', '火', '土', '金', '水'];
const WX_COLOR: Record<string, string> = {
  '木': '#22c55e', '火': '#ef4444', '土': '#d97706',
  '金': '#f59e0b', '水': '#3b82f6',
};

export default function CharLookup() {
  const [tab, setTab] = useState<'char' | 'search'>('char');

  // 文字查五行
  const [inputChar, setInputChar] = useState('');
  const [charResult, setCharResult] = useState<CharEntry | null | undefined>(undefined);

  // 五行笔画查字
  const [selWuxing, setSelWuxing] = useState<WuXing | ''>('');
  const [selStrokes, setSelStrokes] = useState('');
  const [searchResults, setSearchResults] = useState<CharEntry[]>([]);
  const [searched, setSearched] = useState(false);

  const handleCharLookup = () => {
    const ch = inputChar.trim();
    if (!ch || ch.length !== 1) return;
    setCharResult(getCharEntry(ch));
  };

  const handleSearch = () => {
    const strokes = selStrokes ? parseInt(selStrokes, 10) : 0;
    let results: CharEntry[];
    if (selWuxing && strokes > 0) {
      results = getCharsByWuxingAndStrokes(selWuxing, strokes);
    } else if (selWuxing) {
      results = getCharsByWuxing(selWuxing);
    } else if (strokes > 0) {
      results = getCharsByStrokes(strokes);
    } else {
      return;
    }
    setSearchResults(results);
    setSearched(true);
  };

  const tabBtn = (key: 'char' | 'search', label: string) => (
    <button
      className={`flex-1 py-1.5 text-xs font-medium transition-all ${tab === key
        ? 'bg-[var(--color-cinnabar)] text-white'
        : 'bg-[var(--color-bg-card)] text-[var(--color-ink-light)]'}`}
      onClick={() => setTab(key)}
    >
      {label}
    </button>
  );

  return (
    <div className="card-chinese p-4 space-y-3">
      <h4 className="text-xs font-medium text-[var(--color-ink)]">汉字查询</h4>

      <div className="flex rounded overflow-hidden border border-[var(--color-border-warm)]">
        {tabBtn('char', '文字查五行')}
        {tabBtn('search', '五行笔画查字')}
      </div>

      {tab === 'char' ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              className="flex-1 px-2 py-1.5 rounded text-sm bg-[var(--color-parchment)] border border-[var(--color-border-warm)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-cinnabar)]"
              placeholder="输入一个汉字"
              value={inputChar}
              onChange={e => { setInputChar(e.target.value); setCharResult(undefined); }}
              maxLength={1}
            />
            <button
              onClick={handleCharLookup}
              className="px-3 py-1.5 rounded text-xs font-medium text-white bg-[var(--color-cinnabar)] hover:opacity-90 transition"
            >
              查询
            </button>
          </div>

          {charResult !== undefined && (
            charResult ? (
              <div className="p-2.5 rounded bg-[var(--color-parchment)] space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[var(--color-ink)]">{charResult.char}</span>
                  <span
                    className="text-xs font-medium px-1.5 py-0.5 rounded"
                    style={{ color: WX_COLOR[charResult.wuxing], backgroundColor: `${WX_COLOR[charResult.wuxing]}15` }}
                  >
                    {charResult.wuxing}
                  </span>
                </div>
                <div className="text-xs text-[var(--color-ink-light)] space-y-0.5">
                  <p>康熙笔画：{charResult.kangxiStrokes} 画</p>
                  {charResult.pinyin && charResult.pinyin !== charResult.char && (
                    <p>拼音：{charResult.pinyin}（{charResult.pingZe}声）</p>
                  )}
                  {charResult.radical && <p>部首：{charResult.radical}</p>}
                  {charResult.meaning && <p>释义：{charResult.meaning}</p>}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--color-ink-light)] text-center py-2">未收录该字</p>
            )
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="space-y-1.5">
            <label className="block text-xs text-[var(--color-ink-light)]">五行</label>
            <div className="flex gap-1.5">
              {WX_LIST.map(wx => (
                <button
                  key={wx}
                  className={`flex-1 py-1 rounded text-xs border transition ${selWuxing === wx
                    ? 'border-[var(--color-cinnabar)] font-medium'
                    : 'border-[var(--color-border-warm)] text-[var(--color-ink-light)]'}`}
                  style={selWuxing === wx ? { color: WX_COLOR[wx], backgroundColor: `${WX_COLOR[wx]}10` } : undefined}
                  onClick={() => setSelWuxing(selWuxing === wx ? '' : wx)}
                >
                  {wx}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs text-[var(--color-ink-light)]">康熙笔画</label>
            <input
              className="w-full px-2 py-1.5 rounded text-sm bg-[var(--color-parchment)] border border-[var(--color-border-warm)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-cinnabar)]"
              type="number"
              placeholder="如：8（可留空）"
              value={selStrokes}
              onChange={e => { setSelStrokes(e.target.value); setSearched(false); }}
              min={1} max={30}
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={!selWuxing && !selStrokes}
            className="w-full py-1.5 rounded text-xs font-medium text-white bg-[var(--color-cinnabar)] hover:opacity-90 transition disabled:opacity-40"
          >
            查询
          </button>

          {searched && (
            searchResults.length > 0 ? (
              <div className="p-2.5 rounded bg-[var(--color-parchment)]">
                <p className="text-xs text-[var(--color-ink-light)] mb-1.5">
                  共 {searchResults.length} 字
                </p>
                <div className="flex flex-wrap gap-1 max-h-[160px] overflow-y-auto">
                  {searchResults.map(c => (
                    <span
                      key={c.char}
                      className="inline-block px-1.5 py-0.5 text-sm rounded cursor-default border border-transparent hover:border-[var(--color-border-warm)] transition"
                      style={{ color: WX_COLOR[c.wuxing] }}
                      title={`${c.char} | ${c.wuxing} | ${c.kangxiStrokes}画${c.meaning ? ' | ' + c.meaning : ''}`}
                    >
                      {c.char}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--color-ink-light)] text-center py-2">未找到匹配的字</p>
            )
          )}
        </div>
      )}
    </div>
  );
}
