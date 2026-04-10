'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { DesignSession, DesignerStyle as DS, DESIGNER_STYLES } from '@/types';

interface Props {
  session: DesignSession;
  updateSession: (updates: Partial<DesignSession>) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step11DesignerStyle({ session, updateSession, onBack, onNext }: Props) {
  const [selected, setSelected] = useState<DS | null>(session.designerStyle);

  const handleContinue = () => {
    if (selected) {
      updateSession({ designerStyle: selected });
      onNext();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2 py-2 px-4">
          ← 上一步
        </button>
        <h2 className="text-xl font-semibold">选择设计师风格</h2>
        <div className="w-20" />
      </div>

      <p className="text-[#86868b] mb-6">请选择设计风格，AI将结合所选风格生成创意设计方案</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {DESIGNER_STYLES.map((style) => {
          const isSelected = selected?.id === style.id;
          
          return (
            <button
              key={style.id}
              onClick={() => setSelected(style)}
              className={`card p-5 text-left transition-all ${isSelected ? 'ring-2 ring-[#0071e3]' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{style.name}</h3>
                <div className={`checkbox ${isSelected ? 'checked' : ''}`}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
              
              <p className="text-sm text-[#86868b] mb-3">
                <span className="text-[#0071e3]">代表作:</span> {style.works}
              </p>
              
              <p className="text-sm text-[#86868b] mb-3 line-clamp-2">{style.philosophy}</p>
              
              <div className="flex flex-wrap gap-1">
                {style.traits.map((trait) => (
                  <span key={trait} className="px-2 py-1 bg-gray-100 rounded text-xs text-[#86868b]">
                    {trait}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="flex justify-end">
          <button onClick={handleContinue} className="btn-primary flex items-center gap-2">
            生成创意设计
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
