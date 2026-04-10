'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Star } from 'lucide-react';
import { DesignSession } from '@/types';

interface Props {
  session: DesignSession;
  updateSession: (updates: Partial<DesignSession>) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step6BuyingPointsSelection({ session, updateSession, onBack, onNext }: Props) {
  const [selected, setSelected] = useState<string[]>(session.selectedPoints);

  const buyingPoints = session.buyingPoints || [];
  const personaMap = new Map(
    session.userPersonas?.map(p => [p.id, p.name]) || []
  );

  const togglePoint = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    updateSession({ selectedPoints: selected });
    onNext();
  };

  if (buyingPoints.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="btn-secondary flex items-center gap-2 py-2 px-4">
            <ArrowLeft className="w-4 h-4" />
            上一步
          </button>
          <h2 className="text-xl font-semibold">选择产品买点</h2>
          <div className="w-20" />
        </div>
        <div className="text-center py-12 text-[#86868b]">
          暂无可选的买点，请返回上一步生成买点分析
        </div>
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
        <h2 className="text-xl font-semibold">选择产品买点</h2>
        <span className="text-[#86868b]">{selected.length} 已选择</span>
      </div>

      <p className="text-[#86868b] mb-6">请选择需要解决的产品买点（可多选），AI将为每个买点检索专业论文解决方案</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {buyingPoints.map((bp) => {
          const isSelected = selected.includes(bp.id);
          const personaName = personaMap.get(bp.personaId);
          
          return (
            <button
              key={bp.id}
              onClick={() => togglePoint(bp.id)}
              className={`card p-5 text-left transition-all ${isSelected ? 'ring-2 ring-[#0071e3]' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#86868b]">
                    {personaName ? `针对: ${personaName}` : '通用'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < bp.priority ? 'text-[#ff9500] fill-[#ff9500]' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
              </div>
              
              <h3 className="font-semibold mb-2">{bp.point}</h3>
              <p className="text-sm text-[#86868b]">{bp.description}</p>

              <div className={`checkbox absolute top-4 right-4 ${isSelected ? 'checked' : ''}`}>
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-[#86868b]">选择多个买点可以获得更全面的解决方案</span>
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
