'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Palette, RefreshCw } from 'lucide-react';
import { DesignSession, CreativeDesign } from '@/types';
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

export default function Step12CreativeDesign({ session, updateSession, callKimi, loading, error, onBack, onNext }: Props) {
  const [designs, setDesigns] = useState<CreativeDesign[]>(session.creativeDesigns || []);
  const [report, setReport] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(!session.creativeDesigns);
  const [parsedError, setParsedError] = useState<string | null>(null);

  const generateDesigns = async () => {
    setIsGenerating(true);
    setParsedError(null);
    
    try {
      const selectedSolutionsList = session.solutions
        ?.filter(s => session.selectedSolutions.includes(s.id))
        ?.map(s => `买点: ${s.buyingPoint}\n解决方案: ${s.solution}`)
        ?.join('\n\n') || '';

      const designer = session.designerStyle;
      const designerInfo = designer 
        ? `${designer.name} - 代表作: ${designer.works} - 设计理念: ${designer.philosophy}`
        : '现代简约风格';

      const systemPrompt = SYSTEM_PROMPTS.creativeDesign
        .replace('{productName}', session.productName)
        .replace('{designerStyle}', designerInfo)
        .replace('{selectedSolutions}', selectedSolutionsList);

      const result = await callKimi(`请为${session.productName}生成创意设计方案`, systemPrompt);
      const plainText = parseTextToPlainText(result);
      setReport(plainText);

      let parsed = result;
      if (result.includes('```json')) {
        parsed = result.match(/```json\n?([\s\S]*?)\n?```/)?.[1] || result;
      } else if (result.includes('```')) {
        parsed = result.match(/```\n?([\s\S]*?)\n?```/)?.[1] || result;
      }

      const jsonMatch = parsed.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[0]);
          const formatted: CreativeDesign[] = data.map((d: Record<string, unknown>, idx: number) => ({
            id: generateId(),
            name: d.name as string || `设计方案 ${idx + 1}`,
            solution: d.solution as string || '',
            industrialCMF: d.industrialCMF as string || '',
            mainSellingPoint: d.mainSellingPoint as string || '',
            secondarySellingPoint: d.secondarySellingPoint as string || '',
          }));

          setDesigns(formatted);
          updateSession({ creativeDesigns: formatted });
        } catch {
          setParsedError('JSON格式解析失败');
        }
      } else {
        setParsedError('未找到JSON数据');
      }
    } catch (err) {
      console.error('生成设计方案失败:', err);
      setParsedError(err instanceof Error ? err.message : '生成失败');
    }
    setIsGenerating(false);
  };

  useEffect(() => {
    if (isGenerating && !session.creativeDesigns) {
      generateDesigns();
    }
  }, []);

  const handleContinue = () => {
    updateSession({ creativeDesigns: designs });
    onNext();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2 py-2 px-4">
          <ArrowLeft className="w-4 h-4" />
          上一步
        </button>
        <h2 className="text-xl font-semibold">创意设计说明</h2>
        <div className="w-20" />
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-medium text-[#0071e3]">
          设计风格: {session.designerStyle?.name}
        </h3>
        <p className="text-sm text-[#86868b]">{session.designerStyle?.philosophy}</p>
      </div>

      {(error || parsedError) && (
        <div className="card p-4 mb-4 border-red-200 bg-red-50">
          <p className="text-red-600">{error || parsedError}</p>
        </div>
      )}

      {isGenerating || loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-[#0071e3] animate-spin mb-4" />
          <p className="text-[#86868b]">AI正在生成创意设计方案，请稍候...</p>
        </div>
      ) : designs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {designs.map((design, idx) => (
              <div key={design.id} className="card overflow-hidden fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="badge">{idx + 1}</div>
                    <h3 className="font-semibold">{design.name}</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Palette className="w-4 h-4 text-[#0071e3]" />
                        <span className="text-xs text-[#86868b]">创意设计</span>
                      </div>
                      <p className="text-sm text-[#86868b]">{design.solution}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl">
                      <span className="text-xs text-[#86868b]">工业设计 CMF</span>
                      <p className="text-sm text-[#86868b]">{design.industrialCMF}</p>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 p-3 bg-blue-50 rounded-xl">
                        <div className="text-xs text-[#0071e3] mb-1">主卖点</div>
                        <p className="text-sm">{design.mainSellingPoint}</p>
                      </div>
                      <div className="flex-1 p-3 bg-purple-50 rounded-xl">
                        <div className="text-xs text-[#5856d6] mb-1">次卖点</div>
                        <p className="text-sm text-[#86868b]">{design.secondarySellingPoint}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <button onClick={generateDesigns} className="btn-secondary py-2 px-4 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              重新生成
            </button>
            <button onClick={handleContinue} className="btn-primary flex items-center gap-2">
              继续选择方案
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : report ? (
        <>
          <div className="card p-6 mb-6">
            <div className="text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
              {report.split('\n\n').map((para, i) => (
                <p key={i} className="mb-4 last:mb-0">{para}</p>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleContinue} className="btn-primary flex items-center gap-2">
              继续
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <button onClick={generateDesigns} className="btn-primary">
            生成创意设计方案
          </button>
        </div>
      )}
    </div>
  );
}
