'use client';

import { useState, useCallback } from 'react';
import type { NamingAnalysis, NameCandidate, Gender } from '@/lib/naming';
import { analyzeNaming, generateNames } from '@/lib/naming';
import type { NamingConfig } from '@/lib/naming';

import NamingInputPanel from '@/components/naming/InputPanel';
import AnalysisPanel from '@/components/naming/AnalysisPanel';
import NameList from '@/components/naming/NameList';
import CharLookup from '@/components/naming/CharLookup';
import KnowledgePanel from '@/components/naming/KnowledgePanel';

export default function NamingPage() {
  const [analysis, setAnalysis] = useState<NamingAnalysis | null>(null);
  const [candidates, setCandidates] = useState<NameCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'idle' | 'analysis' | 'generate' | 'detail'>('idle');

  const handleAnalyze = useCallback((data: {
    fullName: string;
    birthYear?: number;
    birthMonth?: number;
    birthDay?: number;
    birthHour?: number;
  }) => {
    setLoading(true);
    setCandidates([]);
    try {
      const result = analyzeNaming(
        data.fullName,
        data.birthYear, data.birthMonth, data.birthDay, data.birthHour,
      );
      setAnalysis(result);
      setView('analysis');
    } catch (e) {
      console.error('测名分析出错:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGenerate = useCallback((data: {
    surname: string;
    gender: Gender;
    birthYear?: number;
    birthMonth?: number;
    birthDay?: number;
    birthHour?: number;
    nameLength: 1 | 2;
  }) => {
    setLoading(true);
    setAnalysis(null);
    try {
      const config: NamingConfig = {
        surname: data.surname,
        gender: data.gender,
        birthYear: data.birthYear,
        birthMonth: data.birthMonth,
        birthDay: data.birthDay,
        birthHour: data.birthHour,
        nameLength: data.nameLength,
      };
      const names = generateNames(config);
      setCandidates(names);
      setView('generate');
    } catch (e) {
      console.error('起名推荐出错:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectCandidate = useCallback((candidate: NameCandidate) => {
    const result: NamingAnalysis = {
      fullName: candidate.fullName,
      surname: candidate.fullName.substring(0, candidate.fullName.length - candidate.givenName.length),
      givenName: candidate.givenName,
      wugeResult: candidate.wugeResult,
      sancaiResult: candidate.sancaiResult,
      baziMatch: candidate.baziMatch,
      charAnalysis: candidate.charAnalysis,
      totalScore: candidate.totalScore,
      scoreBreakdown: candidate.scoreBreakdown,
      verdicts: [],
      beginnerSummary: `「${candidate.fullName}」综合评分${candidate.totalScore}分，${candidate.tags.join('、')}。`,
      professionalSummary: `八字${candidate.scoreBreakdown.bazi} | 五格${candidate.scoreBreakdown.wuge} | 三才${candidate.scoreBreakdown.sancai} | 音律${candidate.scoreBreakdown.phonetics} | 字义${candidate.scoreBreakdown.meaning}`,
    };
    setAnalysis(result);
    setView('detail');
  }, []);

  const handleBackToList = useCallback(() => {
    setAnalysis(null);
    setView('generate');
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="section-title text-2xl">起名测名</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-ink-light)' }}>
          结合五格数理、三才配置、生辰八字，科学取名测名
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：输入面板 + 汉字查询 + 小常识 */}
        <div className="lg:col-span-1 space-y-4">
          <NamingInputPanel
            onAnalyze={handleAnalyze}
            onGenerate={handleGenerate}
          />
          <CharLookup />
          <KnowledgePanel />
        </div>

        {/* 右侧：结果区 */}
        <div className="lg:col-span-2">
          {loading && (
            <div className="card-chinese p-8 text-center">
              <p className="text-sm text-[var(--color-ink-light)]">计算中...</p>
            </div>
          )}

          {!loading && view === 'idle' && (
            <div className="card-chinese p-8 text-center">
              <span className="text-4xl mb-4 block">&#9997;</span>
              <p className="text-sm text-[var(--color-ink-light)]">
                在左侧输入姓名进行测名分析，或输入姓氏进行智能起名
              </p>
              <p className="text-xs text-[var(--color-ink-light)] mt-2 opacity-60">
                支持五格数理、三才配置、八字匹配、音律字义多维分析
              </p>
            </div>
          )}

          {!loading && view === 'analysis' && analysis && (
            <AnalysisPanel analysis={analysis} />
          )}

          {!loading && view === 'generate' && (
            <NameList candidates={candidates} onSelect={handleSelectCandidate} />
          )}

          {!loading && view === 'detail' && analysis && (
            <AnalysisPanel analysis={analysis} onBack={handleBackToList} />
          )}
        </div>
      </div>
    </div>
  );
}
