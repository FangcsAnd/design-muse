'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { DesignSession, BuyingPoint } from '@/types';
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

export default function Step5ProductAnalysis({ session, updateSession, callKimi, loading, error, onBack, onNext }: Props) {
  const [report, setReport] = useState<string>(session.productAnalysis || '');
  const [buyingPoints, setBuyingPoints] = useState<BuyingPoint[]>(session.buyingPoints || []);
  const [isGenerating, setIsGenerating] = useState(!session.productAnalysis);
  const [parsedError, setParsedError] = useState<string | null>(null);

  const generateAnalysis = async () => {
    setIsGenerating(true);
    setParsedError(null);
    try {
      const selectedPersonasList = session.userPersonas
        ?.filter(p => session.selectedPersonas.includes(p.id))
        ?.map(p => `${p.name}: ${p.description}`)
        ?.join('\n') || '';

      const systemPrompt = SYSTEM_PROMPTS.productAnalysis
        .replace('{productName}', session.productName)
        .replace('{marketReport}', session.marketReport || '')
        .replace('{selectedPersonas}', selectedPersonasList);

      const result = await callKimi(`请为${session.productName}生成产品买点分析`, systemPrompt);
      const plainText = parseTextToPlainText(result);
      setReport(plainText);
      updateSession({ productAnalysis: plainText });

      let parsed = result;
      if (result.includes('```json')) {
        parsed = result.match(/```json\n?([\s\S]*?)\n?```/)?.[1] || result;
      } else if (result.includes('```')) {
        parsed = result.match(/```\n?([\s\S]*?)\n?```/)?.[1] || result;
      }

      const jsonMatch = parsed.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const pointsData = JSON.parse(jsonMatch[0]);
          const formatted: BuyingPoint[] = [];
          
          pointsData.forEach((p: Record<string, unknown>) => {
            const personaId = p.personaId as string;
            const points = p.buyingPoints as Array<Record<string, unknown>>;
            
            if (Array.isArray(points)) {
              points.forEach((pt: Record<string, unknown>) => {
                formatted.push({
                  id: generateId(),
                  point: pt.point as string || '',
                  priority: (pt.priority as number) || 3,
                  description: pt.description as string || '',
                  personaId: personaId || '',
                });
              });
            }
          });

          if (formatted.length > 0) {
            setBuyingPoints(formatted);
            updateSession({ buyingPoints: formatted });
          }
        } catch (parseErr) {
          console.log('买点JSON解析失败，将使用文本报告');
        }
      }
    } catch (err) {
      console.error('生成买点分析失败:', err);
      setParsedError(err instanceof Error ? err.message : '生成失败');
    }
    setIsGenerating(false);
  };

  useEffect(() => {
    if (isGenerating && !session.productAnalysis) {
      generateAnalysis();
    }
  }, []);

  const handleContinue = () => {
    updateSession({ 
      productAnalysis: report,
      buyingPoints: buyingPoints.length > 0 ? buyingPoints : session.buyingPoints 
    });
    onNext();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2 py-2 px-4">
          <ArrowLeft className="w-4 h-4" />
          上一步
        </button>
        <h2 className="text-xl font-semibold">产品买点分析</h2>
        <div className="w-20" />
      </div>

      {(error || parsedError) && (
        <div className="card p-4 mb-4 border-red-200 bg-red-50">
          <p className="text-red-600">{error || parsedError}</p>
        </div>
      )}

      {isGenerating || loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-[#0071e3] animate-spin mb-4" />
          <p className="text-[#86868b]">AI正在分析产品买点...</p>
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
            <button onClick={generateAnalysis} className="btn-secondary py-2 px-4 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              重新生成
            </button>
            <button onClick={handleContinue} className="btn-primary flex items-center gap-2">
              继续选择买点
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <button onClick={generateAnalysis} className="btn-primary">
            生成买点分析报告
          </button>
        </div>
      )}
    </div>
  );
}
