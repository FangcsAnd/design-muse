'use client';

import { ArrowLeft, ArrowRight, Check, Lightbulb } from 'lucide-react';
import { DesignSession } from '@/types';

interface Props {
  session: DesignSession;
  onConfirm: () => void;
  onBack: () => void;
}

export default function Step10ConfirmSolutions({ session, onConfirm, onBack }: Props) {
  const selectedSolutions = session.solutions?.filter(s => session.selectedSolutions.includes(s.id)) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2 py-2 px-4">
          <ArrowLeft className="w-4 h-4" />
          上一步
        </button>
        <h2 className="text-xl font-semibold">确认解决方案</h2>
        <div className="w-20" />
      </div>

      <p className="text-[#86868b] mb-6">已选择以下解决方案，点击确认继续选择设计师风格</p>

      <div className="space-y-4 mb-8">
        {selectedSolutions.map((sol) => (
          <div key={sol.id} className="card p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-[#0071e3]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-[#0071e3]" />
                  <span className="tag">{sol.buyingPoint}</span>
                </div>
                <p className="text-sm text-[#86868b]">{sol.solution}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={onConfirm} className="btn-primary flex items-center gap-2">
          确认并选择设计师风格
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
