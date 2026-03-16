/**
 * 起名测名 —— 字义、音律、谐音、字形分析
 */

import type { CharAnalysisResult, CharDetailAnalysis, PingZe } from './types';
import { getCharEntry } from './charDatabase';
import { checkHomophone } from './constants';

/**
 * 分析姓名用字（字义 + 音律 + 谐音 + 字形）
 * @param fullName 完整姓名
 */
export function analyzeChars(fullName: string): CharAnalysisResult {
  const chars: CharDetailAnalysis[] = [];

  for (const ch of fullName) {
    const entry = getCharEntry(ch);
    if (entry) {
      chars.push({
        char: entry.char,
        pinyin: entry.pinyin,
        tone: entry.tone,
        pingZe: entry.pingZe,
        strokes: entry.kangxiStrokes,
        wuxing: entry.wuxing,
        radical: entry.radical,
        meaning: entry.meaning,
      });
    } else {
      chars.push({
        char: ch,
        pinyin: ch,
        tone: 1,
        pingZe: '平',
        strokes: 0,
        wuxing: '土',
        radical: '',
        meaning: '',
      });
    }
  }

  // 音律分析
  const { tonePattern, toneScore } = analyzeTone(chars);

  // 谐音检测
  const homophoneWarnings = detectHomophone(chars);

  // 字义分析
  const overallMeaning = analyzeMeaning(chars);

  // 字形分析
  const formAnalysis = analyzeForm(chars);

  // 字义评分
  const meaningScore = scoreMeaning(chars);

  return {
    chars,
    tonePattern,
    toneScore,
    homophoneWarnings,
    overallMeaning,
    formAnalysis,
    meaningScore,
  };
}

/** 字符分析综合评分 */
export function scoreCharAnalysis(result: CharAnalysisResult): { phonetics: number; meaning: number } {
  return {
    phonetics: result.toneScore,
    meaning: result.meaningScore,
  };
}

/* ===== 音律分析 ===== */

function analyzeTone(chars: CharDetailAnalysis[]): { tonePattern: string; toneScore: number } {
  if (chars.length < 2) {
    return { tonePattern: '字数过少', toneScore: 50 };
  }

  const pingZeArr: PingZe[] = chars.map(c => c.pingZe);
  const toneArr = chars.map(c => c.tone);
  const pattern = pingZeArr.join('');

  let score = 70; // 基础分
  const descriptions: string[] = [];

  // 1. 平仄交替检测
  let alternating = true;
  for (let i = 1; i < pingZeArr.length; i++) {
    if (pingZeArr[i] === pingZeArr[i - 1]) {
      alternating = false;
      break;
    }
  }
  if (alternating) {
    score += 20;
    descriptions.push('平仄交替，音律优美');
  } else if (pingZeArr.every(p => p === '平')) {
    score -= 15;
    descriptions.push('全平声调，缺乏起伏');
  } else if (pingZeArr.every(p => p === '仄')) {
    score -= 15;
    descriptions.push('全仄声调，稍显沉闷');
  } else {
    descriptions.push('平仄搭配尚可');
  }

  // 2. 声调多样性（三字名声调最好三个不同）
  if (chars.length >= 3) {
    const uniqueTones = new Set(toneArr);
    if (uniqueTones.size === chars.length) {
      score += 10;
      descriptions.push('声调各异，朗朗上口');
    } else if (uniqueTones.size === 1) {
      score -= 10;
      descriptions.push('声调单一，建议调整');
    }
  }

  // 3. 声母重复检测
  const initials = chars.map(c => getInitial(c.pinyin));
  const hasDupInitial = initials.some((v, i) => i > 0 && v === initials[i - 1] && v !== '');
  if (hasDupInitial) {
    score -= 10;
    descriptions.push('相邻字声母相同，略显绕口');
  }

  // 4. 韵母重复检测
  const finals = chars.map(c => getFinal(c.pinyin));
  const hasDupFinal = finals.some((v, i) => i > 0 && v === finals[i - 1] && v !== '');
  if (hasDupFinal) {
    score -= 5;
    descriptions.push('相邻字韵母相同');
  }

  score = Math.max(0, Math.min(100, score));

  const tonePattern = `${pattern}（${descriptions.join('，')}）`;
  return { tonePattern, toneScore: score };
}

/** 获取拼音声母（简化版） */
function getInitial(pinyin: string): string {
  const clean = pinyin.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, (m) => {
    const map: Record<string, string> = {
      'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
      'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
      'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
      'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
      'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
      'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v',
    };
    return map[m] ?? m;
  }).toLowerCase();

  // 双字母声母
  const doubleInitials = ['zh', 'ch', 'sh'];
  for (const di of doubleInitials) {
    if (clean.startsWith(di)) return di;
  }

  // 单字母声母
  const singleInitials = 'bpmfdtnlgkhjqxrzcsyw';
  if (clean.length > 0 && singleInitials.includes(clean[0])) {
    return clean[0];
  }

  return ''; // 零声母
}

/** 获取拼音韵母（简化版） */
function getFinal(pinyin: string): string {
  const initial = getInitial(pinyin);
  const clean = pinyin.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, (m) => {
    const map: Record<string, string> = {
      'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
      'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
      'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
      'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
      'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
      'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v',
    };
    return map[m] ?? m;
  }).toLowerCase();
  return clean.substring(initial.length);
}

/** 去掉声调标记获取纯拼音（用于谐音检测） */
function stripTone(pinyin: string): string {
  return pinyin.replace(/[āáǎà]/g, 'a')
    .replace(/[ēéěè]/g, 'e')
    .replace(/[īíǐì]/g, 'i')
    .replace(/[ōóǒò]/g, 'o')
    .replace(/[ūúǔù]/g, 'u')
    .replace(/[ǖǘǚǜ]/g, 'v')
    .toLowerCase();
}

/* ===== 谐音检测 ===== */

function detectHomophone(chars: CharDetailAnalysis[]): string[] {
  const pinyinArr = chars.map(c => stripTone(c.pinyin));
  return checkHomophone(pinyinArr);
}

/* ===== 字义分析 ===== */

function analyzeMeaning(chars: CharDetailAnalysis[]): string {
  if (chars.length < 2) return '字数不足，无法分析';

  const nameParts = chars.slice(1); // 去掉姓
  const meanings = nameParts.filter(c => c.meaning).map(c => `${c.char}（${c.meaning}）`);

  if (meanings.length === 0) return '名字用字寓意尚可';

  return `名字用字：${meanings.join('、')}。整体寓意${getMeaningTone(nameParts)}。`;
}

function getMeaningTone(nameParts: CharDetailAnalysis[]): string {
  const posWords = ['美', '好', '善', '佳', '嘉', '瑞', '祥', '福', '喜', '乐',
    '明', '亮', '辉', '光', '荣', '华', '德', '智', '慧', '聪',
    '勇', '刚', '毅', '强', '健', '康', '安', '宁', '平', '和',
    '雅', '秀', '丽', '婉', '芳', '馨', '清', '淑', '贤'];

  let posCount = 0;
  for (const c of nameParts) {
    if (posWords.some(w => c.meaning.includes(w) || c.char === w)) {
      posCount++;
    }
  }

  if (posCount === nameParts.length) return '美好，寓意积极向上';
  if (posCount > 0) return '较好，含有积极含义';
  return '中性，寓意含蓄';
}

/* ===== 字形分析 ===== */

function analyzeForm(chars: CharDetailAnalysis[]): string {
  const parts: string[] = [];
  const strokes = chars.map(c => c.strokes);

  // 笔画均衡度
  const maxStroke = Math.max(...strokes);
  const minStroke = Math.min(...strokes);
  const diff = maxStroke - minStroke;

  if (diff <= 5) {
    parts.push('各字笔画数相近，书写均衡美观');
  } else if (diff <= 12) {
    parts.push('笔画数差异适中，视觉层次分明');
  } else {
    parts.push('笔画数差异较大，书写时需注意整体协调');
  }

  // 笔画繁简
  const avgStroke = strokes.reduce((a, b) => a + b, 0) / strokes.length;
  if (avgStroke < 6) {
    parts.push('用字偏简，清爽利落');
  } else if (avgStroke < 12) {
    parts.push('用字繁简适中');
  } else {
    parts.push('用字偏繁，显得庄重但书写较复杂');
  }

  return parts.join('。') + '。';
}

/* ===== 字义评分 ===== */

function scoreMeaning(chars: CharDetailAnalysis[]): number {
  let score = 70; // 基础分

  const nameParts = chars.slice(1);

  // 有明确字义加分
  for (const c of nameParts) {
    if (c.meaning && c.meaning.length > 0) {
      score += 5;
    }
  }

  // 正面含义加分
  const posWords = ['美', '好', '善', '佳', '嘉', '瑞', '祥', '福', '喜', '乐',
    '明', '亮', '辉', '光', '荣', '华', '德', '智', '慧', '聪',
    '勇', '刚', '毅', '强', '健', '康', '安', '宁', '平', '和'];

  for (const c of nameParts) {
    if (posWords.some(w => c.meaning.includes(w) || c.char === w)) {
      score += 5;
    }
  }

  return Math.max(0, Math.min(100, score));
}
