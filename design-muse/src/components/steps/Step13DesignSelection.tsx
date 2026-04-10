'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { DesignSession } from '@/types';

interface Props {
  session: DesignSession;
  updateSession: (updates: Partial<DesignSession>) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step13DesignSelection({ session, updateSession, onBack, onNext }: Props) {
  const [selected, setSelected] = useState<string[]>(session.selectedDesigns);
  const designs = session.creativeDesigns || [];

  const toggleDesign = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    updateSession({ selectedDesigns: selected });
    onNext();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2 py-2 px-4">
          <ArrowLeft className="w-4 h-4" />
          上一步
        </button>
        <h2 className="text-xl font-semibold">选择设计方案</h2>
        <span className="text-[#86868b]">{selected.length} 已选择</span>
      </div>

      <p className="text-[#86868b] mb-6">请选择要生成设计图的设计方案（可多选）</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {designs.map((design, idx) => {
          const isSelected = selected.includes(design.id);
          
          return (
            <button
              key={design.id}
              onClick={() => toggleDesign(design.id)}
              className={`card p-5 text-left transition-all ${isSelected ? 'ring-2 ring-[#0071e3]' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="badge">{idx + 1}</div>
                <div className={`checkbox ${isSelected ? 'checked' : ''}`}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>

              <h3 className="font-semibold mb-2">{design.name}</h3>
              <p className="text-sm text-[#86868b] mb-2">{design.mainSellingPoint}</p>
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-[#86868b] line-clamp-2">{design.solution}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-[#86868b]">选中的方案将生成产品设计图</span>
        <button
          onClick={handleContinue}
          disabled={selected.length === 0}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          生成设计图 ({selected.length}个)
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
