'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Lightbulb } from 'lucide-react';
import { DesignSession } from '@/types';

interface Props {
  session: DesignSession;
  updateSession: (updates: Partial<DesignSession>) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step9SolutionSelection({ session, updateSession, onBack, onNext }: Props) {
  const [selected, setSelected] = useState<string[]>(session.selectedSolutions);
  const solutions = session.solutions || [];

  const toggleSolution = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    updateSession({ selectedSolutions: selected });
    onNext();
  };

  if (solutions.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="btn-secondary flex items-center gap-2 py-2 px-4">
            <ArrowLeft className="w-4 h-4" />
            上一步
          </button>
          <h2 className="text-xl font-semibold">选择解决方案</h2>
          <div className="w-20" />
        </div>
        <div className="text-center py-12 text-[#86868b]">暂无可选的解决方案</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2 py-2 px-4">
          <ArrowLeft className="w-4 h-4" />
          上一步
        </button>
        <h2 className="text-xl font-semibold">选择解决方案</h2>
        <span className="text-[#86868b]">{selected.length} 已选择</span>
      </div>

      <p className="text-[#86868b] mb-6">请选择要采用的解决方案（可多选）</p>

      <div className="space-y-4 mb-6">
        {solutions.map((sol) => {
          const isSelected = selected.includes(sol.id);
          
          return (
            <button
              key={sol.id}
              onClick={() => toggleSolution(sol.id)}
              className={`card p-5 text-left w-full transition-all ${isSelected ? 'ring-2 ring-[#0071e3]' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`checkbox flex-shrink-0 ${isSelected ? 'checked' : ''}`}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className={`w-4 h-4 ${isSelected ? 'text-[#0071e3]' : 'text-[#86868b]'}`} />
                    <span className="tag">{sol.buyingPoint}</span>
                  </div>
                  <p className="text-[#86868b]">{sol.solution}</p>
                  {sol.papers.length > 0 && (
                    <p className="text-xs text-[#86868b] mt-2">{sol.papers.length} 篇支持论文</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-[#86868b]">选择多个解决方案可获得更丰富的设计方案</span>
        <button
          onClick={handleContinue}
          disabled={selected.length === 0}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          继续 ({selected.length}个选中)
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
