'use client';

import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { DesignSession } from '@/types';

interface Props {
  session: DesignSession;
  onConfirm: () => void;
  onBack: () => void;
}

export default function Step14ConfirmDesign({ session, onConfirm, onBack }: Props) {
  const selectedDesigns = session.creativeDesigns?.filter(d => session.selectedDesigns.includes(d.id)) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2 py-2 px-4">
          <ArrowLeft className="w-4 h-4" />
          上一步
        </button>
        <h2 className="text-xl font-semibold">确认设计方案</h2>
        <div className="w-20" />
      </div>

      <p className="text-[#86868b] mb-6">已选择以下设计方案，点击确认生成产品设计图</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {selectedDesigns.map((design, idx) => (
          <div key={design.id} className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="badge">{idx + 1}</div>
              <div>
                <h3 className="font-semibold">{design.name}</h3>
                <p className="text-sm text-[#86868b]">CMF: {design.industrialCMF.split(',')[0]}</p>
              </div>
              <div className="ml-auto">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <Check className="w-4 h-4 text-[#0071e3]" />
                </div>
              </div>
            </div>
            <span className="tag">{design.mainSellingPoint}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={onConfirm} className="btn-primary flex items-center gap-2">
          生成产品设计图
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
