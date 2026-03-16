'use client';

import { useState, useCallback, useRef } from 'react';
import type { CoinFace, CoinTossResult } from '@/lib/liuyao';
import { calcCoinResult } from '@/lib/liuyao';

// ============================================================
//  铜钱3D翻转动画组件
//
//  使用纯 CSS perspective + rotateY + backface-visibility
//  每次点击"投掷"随机生成3枚铜钱结果并播放翻转动画
// ============================================================

interface CoinTossAnimationProps {
  /** 当前爻序号 (1-6) */
  yaoIndex: number;
  /** 投掷完成回调 */
  onResult: (result: CoinTossResult) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

const COIN_SIZE = 64; // px

export default function CoinTossAnimation({ yaoIndex, onResult, disabled }: CoinTossAnimationProps) {
  const [coins, setCoins] = useState<CoinFace[]>(['yang', 'yang', 'yang']);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const animTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  const handleToss = useCallback(() => {
    if (disabled || isAnimating) return;

    setIsAnimating(true);
    setShowResult(false);

    // 随机生成 3 枚铜钱结果
    const newCoins: CoinFace[] = Array.from({ length: 3 }, () =>
      Math.random() < 0.5 ? 'yang' : 'yin'
    ) as CoinFace[];

    // 动画结束后显示结果
    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    animTimeoutRef.current = setTimeout(() => {
      setCoins(newCoins);
      setShowResult(true);
      setIsAnimating(false);

      const result = calcCoinResult(yaoIndex, newCoins as [CoinFace, CoinFace, CoinFace]);
      onResult(result);
    }, 1200); // 动画持续 1.2 秒
  }, [disabled, isAnimating, yaoIndex, onResult]);

  const positionNames = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
  const total = coins.reduce((s, c) => s + (c === 'yang' ? 3 : 2), 0);
  const yaoDesc: Record<number, string> = {
    6: '老阴 ⚏', 7: '少阳 ⚊', 8: '少阴 ⚋', 9: '老阳 ⚌',
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 当前爻提示 */}
      <div className="text-sm font-medium" style={{ color: 'var(--color-cinnabar)' }}>
        第{yaoIndex}爻 · {positionNames[yaoIndex - 1]}
      </div>

      {/* 三枚铜钱 */}
      <div className="flex gap-4 justify-center">
        {[0, 1, 2].map((coinIdx) => (
          <CoinFlip
            key={coinIdx}
            face={coins[coinIdx]}
            isAnimating={isAnimating}
            delay={coinIdx * 150}
          />
        ))}
      </div>

      {/* 结果 */}
      {showResult && (
        <div
          className="text-sm font-medium px-3 py-1 rounded-full animate-fade-in"
          style={{
            backgroundColor: total === 9 || total === 6 ? 'rgba(220,38,38,0.1)' : 'var(--color-parchment)',
            color: total === 9 || total === 6 ? 'var(--color-cinnabar)' : 'var(--color-ink)',
          }}
        >
          {total} · {yaoDesc[total] || ''}
          {(total === 9 || total === 6) && ' (动爻)'}
        </div>
      )}

      {/* 投掷按钮 */}
      <button
        className="btn-primary px-8 py-2.5 text-base"
        onClick={handleToss}
        disabled={disabled || isAnimating}
        style={{ opacity: disabled || isAnimating ? 0.5 : 1 }}
      >
        {isAnimating ? '投掷中...' : '🪙 投掷铜钱'}
      </button>
    </div>
  );
}

// ============================================================
//  单枚铜钱翻转
// ============================================================

function CoinFlip({ face, isAnimating, delay }: {
  face: CoinFace;
  isAnimating: boolean;
  delay: number;
}) {
  return (
    <div
      style={{
        perspective: '400px',
        width: COIN_SIZE,
        height: COIN_SIZE,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDelay: `${delay}ms`,
          transform: isAnimating
            ? 'rotateY(1080deg) rotateX(360deg)'
            : face === 'yin' ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* 字面 (阳) */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(145deg, #D4A843, #B8860B)',
            boxShadow: '0 2px 8px rgba(184,134,11,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
            color: '#3D1C00',
            fontSize: '22px',
            fontWeight: 'bold',
            fontFamily: 'var(--font-family-kai, serif)',
            border: '2px solid #A67C00',
          }}
        >
          字
        </div>

        {/* 背面 (阴) */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(145deg, #C9B06B, #8B7D3C)',
            boxShadow: '0 2px 8px rgba(139,125,60,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
            transform: 'rotateY(180deg)',
            border: '2px solid #8B7D3C',
          }}
        >
          {/* 方孔 */}
          <div
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid #5C4A1E',
              backgroundColor: 'transparent',
            }}
          />
        </div>
      </div>
    </div>
  );
}
