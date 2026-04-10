'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, Loader2, BookOpen } from 'lucide-react';
import { DesignSession, Solution } from '@/types';
import { SYSTEM_PROMPTS } from '@/lib/prompts';
import { generateId } from '@/lib/utils';

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

export default function Step8SolutionReport({ session, updateSession, callKimi, loading, error, onBack, onNext }: Props) {
  const [report, setReport] = useState<string>('');
  const [solutions, setSolutions] = useState<Solution[]>(session.solutions || []);
  const [isGenerating, setIsGenerating] = useState(!session.solutions);
  const [parsedError, setParsedError] = useState<string | null>(null);

  const generateSolutions = async () => {
    setIsGenerating(true);
    setParsedError(null);
    
    try {
      const selectedPoints = session.buyingPoints
        ?.filter(bp => session.selectedPoints.includes(bp.id))
        ?.map(bp => `买点: ${bp.point}\n描述: ${bp.description}`)
        ?.join('\n\n') || '';

      const systemPrompt = SYSTEM_PROMPTS.solutionReport
        .replace('{productName}', session.productName)
        .replace('{buyingPoints}', selectedPoints);

      const result = await callKimi(`请为${session.productName}检索解决方案`, systemPrompt);
      const plainText = parseTextToPlainText(result);
      setReport(plainText);

      let parsed = result;
      if (result.includes('```json')) {
        parsed = result.match(/```json\n?([\s\S]*?)\n?```/)?.[1] || result;
      } else if (result.includes('```')) {
        parsed = result.match(/```\n?([\s\S]*?)\n?```/)?.[1] || result;
      }

      const jsonMatch = parsed.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          let data = JSON.parse(jsonMatch[0]);
          if (!Array.isArray(data)) {
            data = [data];
          }
          
          const formatted: Solution[] = data.map((item: Record<string, unknown>) => ({
            id: generateId(),
            buyingPoint: item.buyingPoint as string || '',
            solution: item.solution as string || '',
            papers: Array.isArray(item.papers) 
              ? (item.papers as Array<Record<string, unknown>>).map((p: Record<string, unknown>) => ({
                  name: p.name as string || '',
                  source: p.source as string || '',
                  excerpt: p.excerpt as string || '',
                  url: (p.url as string) || '#',
                }))
              : [],
          }));

          setSolutions(formatted);
          updateSession({ solutions: formatted });
        } catch (parseErr) {
          console.log('解决方案JSON解析失败');
        }
      }
    } catch (err) {
      console.error('生成解决方案失败:', err);
      setParsedError(err instanceof Error ? err.message : '生成失败');
    }
    setIsGenerating(false);
  };

  useEffect(() => {
    if (isGenerating && !session.solutions) {
      generateSolutions();
    }
  }, []);

  const handleContinue = () => {
    updateSession({ solutions });
    onNext();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2 py-2 px-4">
          <ArrowLeft className="w-4 h-4" />
          上一步
        </button>
        <h2 className="text-xl font-semibold">买点解决方案报告</h2>
        <div className="w-20" />
      </div>

      <p className="text-[#86868b] mb-6">以下是基于学术论文的买点解决方案</p>

      {(error || parsedError) && (
        <div className="card p-4 mb-4 border-red-200 bg-red-50">
          <p className="text-red-600">{error || parsedError}</p>
        </div>
      )}

      {isGenerating || loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-[#0071e3] animate-spin mb-4" />
          <p className="text-[#86868b]">AI正在检索相关论文和解决方案，请稍候...</p>
        </div>
      ) : (
        <>
          {report && (
            <div className="card p-6 mb-6">
              <div className="text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
                {report.split('\n\n').map((para, i) => (
                  <p key={i} className="mb-4 last:mb-0">{para}</p>
                ))}
              </div>
            </div>
          )}

          {solutions.length > 0 && (
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold">买点解决方案摘要</h3>
              {solutions.map((sol) => (
                <div key={sol.id} className="card p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="tag">买点</span>
                    <span className="font-medium">{sol.buyingPoint}</span>
                  </div>
                  <p className="text-[#86868b] mb-2">{sol.solution}</p>
                  {sol.papers.length > 0 && (
                    <p className="text-xs text-[#86868b]">{sol.papers.length} 篇支持论文</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {!report && (
            <div className="text-center py-12">
              <button onClick={generateSolutions} className="btn-primary">
                生成解决方案报告
              </button>
            </div>
          )}
        </>
      )}

      {report && (
        <div className="flex justify-end">
          <button onClick={handleContinue} className="btn-primary flex items-center gap-2">
            继续
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
