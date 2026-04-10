'use client';

import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { DesignSession } from '@/types';

interface Props {
  session: DesignSession;
  onConfirm: () => void;
  onBack: () => void;
}

export default function Step4ConfirmPersona({ session, onConfirm, onBack }: Props) {
  const selectedPersonas = session.userPersonas?.filter(p => session.selectedPersonas.includes(p.id)) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2 py-2 px-4">
          <ArrowLeft className="w-4 h-4" />
          上一步
        </button>
        <h2 className="text-xl font-semibold">确认用户画像</h2>
        <div className="w-20" />
      </div>

      <p className="text-[#86868b] mb-6">已选择以下用户画像，点击确认继续进行买点分析</p>

      <div className="space-y-4 mb-8">
        {selectedPersonas.map((persona) => (
          <div key={persona.id} className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Check className="w-5 h-5 text-[#0071e3]" />
              </div>
              <div>
                <h3 className="font-semibold">{persona.name}</h3>
                <p className="text-sm text-[#86868b]">{persona.age} · {persona.occupation}</p>
              </div>
            </div>
            <p className="text-sm text-[#86868b]">{persona.description}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={onConfirm} className="btn-primary flex items-center gap-2">
          确认并继续
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
