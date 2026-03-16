'use client';

import { useState } from 'react';
import type { DailyKeyword, DailyQuiz } from '@/lib/yuxia';

interface DailyLessonProps {
  keyword: DailyKeyword;
  quiz: DailyQuiz;
}

export default function DailyLesson({ keyword, quiz }: DailyLessonProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
  };

  return (
    <div className="card-chinese p-5 space-y-5">
      <h4
        className="text-[17px] font-bold flex items-center gap-2"
        style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
      >
        国学小课堂
        <span className="text-sm font-normal text-[var(--color-ink-light)]">
          ——每日一知
        </span>
      </h4>

      {/* 今日关键词 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-block px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: 'var(--color-cinnabar)', color: 'white' }}
          >
            {keyword.category}
          </span>
          <span
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-primary-dark)' }}
          >
            {keyword.term}
          </span>
        </div>

        <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--color-ink-base)' }}>
          {keyword.brief}
        </p>

        {!showDetail ? (
          <button
            onClick={() => setShowDetail(true)}
            className="text-sm text-[var(--color-cinnabar)] hover:underline cursor-pointer"
            style={{ fontFamily: 'var(--font-family-kai)' }}
          >
            展开详解 &gt;&gt;
          </button>
        ) : (
          <div className="rounded-lg p-3 space-y-2" style={{ backgroundColor: 'var(--color-parchment)' }}>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-ink-base)' }}>
              {keyword.detail}
            </p>
            {keyword.origin && (
              <p
                className="text-xs italic"
                style={{ fontFamily: 'var(--font-family-kai)', color: 'var(--color-gold)' }}
              >
                出典：{keyword.origin}
              </p>
            )}
            <button
              onClick={() => setShowDetail(false)}
              className="text-xs text-[var(--color-ink-light)] hover:underline cursor-pointer"
            >
              收起
            </button>
          </div>
        )}
      </div>

      {/* 分隔线 */}
      <hr className="border-[var(--color-border-warm)]" />

      {/* 每日问答 */}
      <div>
        <h5
          className="text-sm font-bold mb-3 flex items-center gap-1.5"
          style={{ color: 'var(--color-primary-dark)', fontFamily: 'var(--font-family-kai)' }}
        >
          学以致用
          <span className="text-xs font-normal text-[var(--color-ink-light)]">（点击选项作答）</span>
        </h5>

        <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--color-ink-base)' }}>
          {quiz.question}
        </p>

        <div className="grid grid-cols-1 gap-2">
          {quiz.options.map((option, idx) => {
            let optionStyle = 'border-[var(--color-border-warm)] hover:border-[var(--color-cinnabar)] hover:bg-[var(--color-cinnabar)]/5';
            if (selectedAnswer !== null) {
              if (idx === quiz.correctIndex) {
                optionStyle = 'border-green-500 bg-green-50 text-green-700';
              } else if (idx === selectedAnswer && idx !== quiz.correctIndex) {
                optionStyle = 'border-red-400 bg-red-50 text-red-600';
              } else {
                optionStyle = 'border-gray-200 text-gray-400';
              }
            }
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={selectedAnswer !== null}
                className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors cursor-pointer disabled:cursor-default ${optionStyle}`}
              >
                <span className="font-medium mr-1.5">{String.fromCharCode(65 + idx)}.</span>
                {option}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-parchment)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              {selectedAnswer === quiz.correctIndex ? (
                <span className="text-green-600 font-bold text-sm">回答正确</span>
              ) : (
                <span className="text-red-500 font-bold text-sm">
                  正确答案：{String.fromCharCode(65 + quiz.correctIndex)}
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-[var(--color-ink-base)]">
              {quiz.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
