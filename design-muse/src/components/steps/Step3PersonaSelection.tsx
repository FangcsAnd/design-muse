'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2, User } from 'lucide-react';
import { DesignSession, Persona } from '@/types';
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

export default function Step3PersonaSelection({ session, updateSession, callKimi, loading, error, onBack, onNext }: Props) {
  const [personas, setPersonas] = useState<Persona[]>(session.userPersonas || []);
  const [selected, setSelected] = useState<string[]>(session.selectedPersonas);
  const [isGenerating, setIsGenerating] = useState(!session.userPersonas);
  const [parsedError, setParsedError] = useState<string | null>(null);

  const generatePersonas = async () => {
    setIsGenerating(true);
    setParsedError(null);
    try {
      const systemPrompt = SYSTEM_PROMPTS.userPersonas
        .replace('{productName}', session.productName)
        .replace('{marketReport}', session.marketReport || '');
      
      const result = await callKimi(`请为${session.productName}生成用户画像`, systemPrompt);
      
      let parsed = result;
      if (result.includes('```json')) {
        parsed = result.match(/```json\n?([\s\S]*?)\n?```/)?.[1] || result;
      } else if (result.includes('```')) {
        parsed = result.match(/```\n?([\s\S]*?)\n?```/)?.[1] || result;
      }

      const jsonMatch = parsed.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const personasData = JSON.parse(jsonMatch[0]);
        const formatted: Persona[] = personasData.map((p: Record<string, unknown>) => ({
          id: generateId(),
          name: p.name as string || '',
          description: p.description as string || '',
          age: (p.age as string) || '未知',
          occupation: (p.occupation as string) || '未知',
          painPoints: Array.isArray(p.painPoints) ? p.painPoints as string[] : [],
          percentage: (p.percentage as string) || '',
        }));
        setPersonas(formatted);
        updateSession({ userPersonas: formatted });
      } else {
        setParsedError('无法解析用户画像数据，请重试');
      }
    } catch (err) {
      console.error('生成用户画像失败:', err);
      setParsedError(err instanceof Error ? err.message : '生成失败');
    }
    setIsGenerating(false);
  };

  useEffect(() => {
    if (isGenerating && !session.userPersonas) {
      generatePersonas();
    }
  }, []);

  const togglePersona = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selected.length > 0) {
      updateSession({ selectedPersonas: selected });
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
        <h2 className="text-xl font-semibold">选择目标用户画像</h2>
        <span className="text-[#86868b]">{selected.length} 已选择</span>
      </div>

      <p className="text-[#86868b] mb-6">请选择此产品的目标用户画像（可多选），AI将根据选择分析产品买点</p>

      {(error || parsedError) && (
        <div className="card p-4 mb-4 border-red-200 bg-red-50">
          <p className="text-red-600">{error || parsedError}</p>
        </div>
      )}

      {isGenerating || loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-[#0071e3] animate-spin mb-4" />
          <p className="text-[#86868b]">AI正在分析用户画像...</p>
        </div>
      ) : personas.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {personas.map((persona) => {
              const isSelected = selected.includes(persona.id);
              return (
                <button
                  key={persona.id}
                  onClick={() => togglePersona(persona.id)}
                  className={`card p-5 text-left transition-all ${
                    isSelected ? 'ring-2 ring-[#0071e3]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-[#0071e3]' : 'bg-gray-100'
                      }`}>
                        <User className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#86868b]'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{persona.name}</h3>
                          {persona.percentage && (
                            <span className="tag">{persona.percentage}</span>
                          )}
                        </div>
                        <p className="text-sm text-[#86868b]">{persona.age} · {persona.occupation}</p>
                      </div>
                    </div>
                    <div className={`checkbox ${isSelected ? 'checked' : ''}`}>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  <p className="text-sm text-[#86868b] mb-3">{persona.description}</p>
                  {persona.painPoints.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {persona.painPoints.slice(0, 3).map((point, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs text-[#86868b]">
                          {point}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center">
            <button onClick={generatePersonas} className="text-sm text-[#86868b] hover:text-[#0071e3]">
              重新生成
            </button>
            <button
              onClick={handleContinue}
              disabled={selected.length === 0}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              继续 ({selected.length}个选中)
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <button onClick={generatePersonas} className="btn-primary">
            生成用户画像
          </button>
        </div>
      )}
    </div>
  );
}
