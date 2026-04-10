'use client';

import { useState } from 'react';
import { ArrowRight, Lightbulb, Target, TrendingUp } from 'lucide-react';
import { DesignSession } from '@/types';

interface Props {
  session: DesignSession;
  updateSession: (updates: Partial<DesignSession>) => void;
  onNext: () => void;
}

export default function Step1ProductInput({ session, updateSession, onNext }: Props) {
  const [input, setInput] = useState(session.productName);

  const handleSubmit = () => {
    if (input.trim()) {
      updateSession({ productName: input.trim() });
      onNext();
    }
  };

  const examples = ['智能手表', '无线耳机', '便携咖啡机', '空气净化器', '智能音箱'];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">开始你的设计灵感之旅</h2>
        <p className="text-[#888] text-lg">
          输入你想要设计的产品名称，AI将为你生成完整的市场洞察和设计方向
        </p>
      </div>

      <div className="relative mb-8">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="例如：智能手表、无线耳机、便携咖啡机..."
          className="w-full px-6 py-5 text-lg bg-[#1a1a2e] border-2 border-[#2a2a3e] rounded-2xl focus:border-[#e94560] focus:outline-none transition-colors text-white"
          autoFocus
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-3 bg-[#e94560] rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d63850] transition-colors flex items-center gap-2 text-white"
        >
          开始分析
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-12">
        <p className="text-sm text-[#888] mb-3">或选择示例产品开始：</p>
        <div className="flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              key={example}
              onClick={() => {
                setInput(example);
                updateSession({ productName: example });
              }}
              className="px-4 py-2 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg text-sm hover:border-[#e94560] hover:text-[#e94560] transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[#1a1a2e] rounded-2xl border border-[#2a2a3e]">
          <div className="w-12 h-12 rounded-xl bg-[#e94560]/20 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-[#e94560]" />
          </div>
          <h3 className="font-semibold mb-2">市场调研</h3>
          <p className="text-sm text-[#888]">AI将进行SWOT、PEST、竞争分析等全方位市场调研</p>
        </div>
        <div className="p-6 bg-[#1a1a2e] rounded-2xl border border-[#2a2a3e]">
          <div className="w-12 h-12 rounded-xl bg-[#0f3460]/30 flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-[#0f3460]" />
          </div>
          <h3 className="font-semibold mb-2">买点分析</h3>
          <p className="text-sm text-[#888]">基于JTBD等理论找出用户真实需求和买点优先级</p>
        </div>
        <div className="p-6 bg-[#1a1a2e] rounded-2xl border border-[#2a2a3e]">
          <div className="w-12 h-12 rounded-xl bg-[#16213e]/50 flex items-center justify-center mb-4">
            <Lightbulb className="w-6 h-6 text-[#16213e]" />
          </div>
          <h3 className="font-semibold mb-2">创意设计</h3>
          <p className="text-sm text-[#888]">结合大师风格生成创新设计方案和设计说明</p>
        </div>
      </div>
    </div>
  );
}
