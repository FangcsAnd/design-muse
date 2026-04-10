'use client';

import { ArrowLeft, ArrowRight, Check, Star } from 'lucide-react';
import { DesignSession } from '@/types';

interface Props {
  session: DesignSession;
  onConfirm: () => void;
  onBack: () => void;
}

export default function Step7ConfirmPoints({ session, onConfirm, onBack }: Props) {
  const selectedPoints = session.buyingPoints?.filter(p => session.selectedPoints.includes(p.id)) || [];
  const personaMap = new Map(
    session.userPersonas?.map(p => [p.id, p.name]) || []
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2 py-2 px-4">
          <ArrowLeft className="w-4 h-4" />
          上一步
        </button>
        <h2 className="text-xl font-semibold">确认产品买点</h2>
        <div className="w-20" />
      </div>

      <p className="text-[#86868b] mb-6">已选择以下产品买点，点击确认继续检索解决方案</p>

      <div className="space-y-4 mb-8">
        {selectedPoints.map((bp) => {
          const personaName = personaMap.get(bp.personaId);
          
          return (
            <div key={bp.id} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Check className="w-5 h-5 text-[#0071e3]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{bp.point}</h3>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < bp.priority ? 'text-[#ff9500] fill-[#ff9500]' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  {personaName && (
                    <p className="text-sm text-[#86868b]">针对: {personaName}</p>
                  )}
                </div>
              </div>
              <p className="text-sm text-[#86868b]">{bp.description}</p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button onClick={onConfirm} className="btn-primary flex items-center gap-2">
          确认并检索解决方案
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
