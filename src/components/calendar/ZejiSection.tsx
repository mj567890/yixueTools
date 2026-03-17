'use client';

import { useState, useMemo } from 'react';
import { getYuXiaInfo } from '@/lib/yuxia';
import { getShiChen } from '@/lib/lunar';
import type { PersonalBaziInput } from '@/lib/zeji';
import ZhuShenPanel from './ZhuShenPanel';
import ShenShaPanel from './ShenShaPanel';
import DressColor from './DressColor';
import WeekDressTable from './WeekDressTable';

const HOURS = Array.from({ length: 12 }, (_, i) => {
  const h = i === 0 ? 23 : (i * 2) - 1;
  return { value: h, label: getShiChen(h) };
});

interface ZejiSectionProps {
  year: number;
  month: number;
  day: number;
}

export default function ZejiSection({ year, month, day }: ZejiSectionProps) {
  const yuxia = useMemo(() => getYuXiaInfo(year, month, day), [year, month, day]);

  // 八字个人穿衣定制（状态自包含）
  const [showBaziInput, setShowBaziInput] = useState(false);
  const [bazi, setBazi] = useState<PersonalBaziInput | null>(null);
  const [baziYear, setBaziYear] = useState('1990');
  const [baziMonth, setBaziMonth] = useState('1');
  const [baziDay, setBaziDay] = useState('1');
  const [baziHour, setBaziHour] = useState('12');
  const [baziGender, setBaziGender] = useState<number>(1);

  const handleBaziSubmit = () => {
    const by = parseInt(baziYear);
    const bm = parseInt(baziMonth);
    const bd = parseInt(baziDay);
    const bh = parseInt(baziHour);
    if (by >= 1900 && by <= 2100 && bm >= 1 && bm <= 12 && bd >= 1 && bd <= 31) {
      setBazi({ birthYear: by, birthMonth: bm, birthDay: bd, birthHour: bh, gender: baziGender });
    }
  };

  const handleBaziClear = () => {
    setBazi(null);
  };

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

      {/* 免责声明 */}
      <p className="text-disclaimer">
        * 以上内容据《许真君玉匣记》《协纪辩方书》等古籍编纂，旨在普及国学文化，仅供民俗参考，不构成决策依据。传统择吉学说存在多个流派，判定或有差异，读者宜辩证理解。
      </p>

      {/* ── 分隔线（与 section-title 装饰线同色系） ── */}
      <div className="my-8">
        <div
          className="h-[3px] rounded-full"
          style={{
            background: 'linear-gradient(90deg, var(--color-cinnabar), var(--color-cinnabar) 40%, transparent)',
          }}
        />
      </div>

      {/* ── 穿衣颜色指南（独立板块） ── */}
      <div className="flex items-center justify-between mt-4">
        <h3 className="section-title flex items-center gap-2">
          每日穿衣指南
          <span className="text-sm font-normal text-[var(--color-ink-light)]" style={{ fontFamily: 'var(--font-family-kai)' }}>
            ——五行穿衣，顺应天时
          </span>
        </h3>
        <button
          onClick={() => setShowBaziInput(!showBaziInput)}
          className={`text-sm px-3 py-1.5 rounded-lg border transition-colors font-medium whitespace-nowrap ${
            bazi
              ? 'bg-[var(--color-cinnabar)] text-white border-[var(--color-cinnabar)]'
              : showBaziInput
                ? 'bg-[var(--color-primary-dark)] text-white border-[var(--color-primary-dark)]'
                : 'border-[var(--color-primary-dark)] text-[var(--color-primary-dark)] hover:bg-[var(--color-primary-dark)] hover:text-white'
          }`}
        >
          {bazi ? '个人定制(已启用)' : '输入八字 定制推荐'}
        </button>
      </div>

      {/* 八字输入表单（可折叠） */}
      {showBaziInput && (
        <div className="card-chinese p-4">
          <p className="text-sm text-[var(--color-ink-light)] mb-3">
            输入出生信息，根据八字喜忌 + 大运流年流月流日，生成个人穿衣颜色推荐
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="form-label">出生年</label>
              <input
                type="number"
                value={baziYear}
                onChange={(e) => setBaziYear(e.target.value)}
                min={1900}
                max={2100}
                className="form-input w-24"
              />
            </div>
            <div>
              <label className="form-label">月</label>
              <input
                type="number"
                value={baziMonth}
                onChange={(e) => setBaziMonth(e.target.value)}
                min={1}
                max={12}
                className="form-input w-20"
              />
            </div>
            <div>
              <label className="form-label">日</label>
              <input
                type="number"
                value={baziDay}
                onChange={(e) => setBaziDay(e.target.value)}
                min={1}
                max={31}
                className="form-input w-20"
              />
            </div>
            <div>
              <label className="form-label">时辰</label>
              <select
                value={baziHour}
                onChange={(e) => setBaziHour(e.target.value)}
                className="form-input"
              >
                {HOURS.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">性别</label>
              <select
                value={baziGender}
                onChange={(e) => setBaziGender(parseInt(e.target.value))}
                className="form-input"
              >
                <option value={1}>男</option>
                <option value={0}>女</option>
              </select>
            </div>
            <button onClick={handleBaziSubmit} className="btn-primary">
              生成定制
            </button>
            {bazi && (
              <button onClick={handleBaziClear} className="btn-outline">
                清除
              </button>
            )}
          </div>
          {bazi && (
            <p className="text-xs text-[var(--color-cinnabar)] mt-2">
              已启用：{bazi.birthYear}年{bazi.birthMonth}月{bazi.birthDay}日 {bazi.gender === 1 ? '男' : '女'}命
            </p>
          )}
        </div>
      )}

      {/* 每日穿衣颜色 */}
      <DressColor dayGan={yuxia.dayGan} targetYear={year} targetMonth={month} targetDay={day} bazi={bazi} />

      {/* 7日穿衣预测 */}
      <WeekDressTable year={year} month={month} day={day} bazi={bazi} />
    </div>
  );
}
