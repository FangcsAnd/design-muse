'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { DesignSession } from '@/types';
import { SYSTEM_PROMPTS } from '@/lib/prompts';

interface Props {
  session: DesignSession;
  updateSession: (updates: Partial<DesignSession>) => void;
  callKimi: (prompt: string, systemPrompt: string) => Promise<string>;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onNext: () => void;
}

function parseTextToPlainText(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/\*|_/g, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default function Step2MarketReport({ session, updateSession, callKimi, loading, error, onBack, onNext }: Props) {
  const [report, setReport] = useState<string>(session.marketReport || '');
  const [isGenerating, setIsGenerating] = useState(!session.marketReport);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const systemPrompt = SYSTEM_PROMPTS.marketResearch.replace('{productName}', session.productName);
      const result = await callKimi(`请为${session.productName}生成详细的市场调研报告`, systemPrompt);
      const plainText = parseTextToPlainText(result);
      setReport(plainText);
      updateSession({ marketReport: plainText });
    } catch (err) {
      console.error('生成报告失败:', err);
    }
    setIsGenerating(false);
  };

  useEffect(() => {
    if (isGenerating && !session.marketReport) {
      generateReport();
    }
  }, []);

  const handleContinue = () => {
    if (report) {
      updateSession({ marketReport: report });
      onNext();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2 py-2 px-4">
          <ArrowLeft className="w-4 h-4" />
          上一步
        </button>
        <h2 className="text-xl font-semibold">市场调研报告</h2>
        <div className="w-20" />
      </div>

      <div className="mb-4">
        <h3 className="text-2xl font-semibold text-[#0071e3] mb-1">{session.productName}</h3>
        <p className="text-[#86868b]">以下是基于AI分析生成的市场调研报告</p>
      </div>

      {error && (
        <div className="card p-4 mb-4 border-red-200 bg-red-50">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {isGenerating || loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-[#0071e3] animate-spin mb-4" />
          <p className="text-[#86868b]">AI正在分析市场数据，请稍候...</p>
        </div>
      ) : report ? (
        <>
          <div className="card p-6 mb-6">
            <div className="text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
              {report.split('\n\n').map((para, i) => (
                <p key={i} className="mb-4 last:mb-0">{para}</p>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button onClick={generateReport} className="btn-secondary py-2 px-4 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              重新生成
            </button>
            <button onClick={handleContinue} className="btn-primary flex items-center gap-2">
              继续
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <button onClick={generateReport} className="btn-primary">
            生成市场调研报告
          </button>
        </div>
      )}
    </div>
  );
}
