'use client';

import { useState, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import Step1ProductInput from '@/components/steps/Step1ProductInput';
import Step2MarketReport from '@/components/steps/Step2MarketReport';
import Step3PersonaSelection from '@/components/steps/Step3PersonaSelection';
import Step4ConfirmPersona from '@/components/steps/Step4ConfirmPersona';
import Step5ProductAnalysis from '@/components/steps/Step5ProductAnalysis';
import Step6BuyingPointsSelection from '@/components/steps/Step6BuyingPointsSelection';
import Step7ConfirmPoints from '@/components/steps/Step7ConfirmPoints';
import Step8SolutionReport from '@/components/steps/Step8SolutionReport';
import Step9SolutionSelection from '@/components/steps/Step9SolutionSelection';
import Step10ConfirmSolutions from '@/components/steps/Step10ConfirmSolutions';
import Step11DesignerStyle from '@/components/steps/Step11DesignerStyle';
import Step12CreativeDesign from '@/components/steps/Step12CreativeDesign';
import Step13DesignSelection from '@/components/steps/Step13DesignSelection';
import Step14ConfirmDesign from '@/components/steps/Step14ConfirmDesign';
import Step15FinalDesign from '@/components/steps/Step15FinalDesign';
import { DesignSession } from '@/types';
import { generateId } from '@/lib/utils';

const STEPS = [
  { num: 1, title: '产品名称' },
  { num: 2, title: '市场调研' },
  { num: 3, title: '用户画像' },
  { num: 4, title: '买点分析' },
  { num: 5, title: '买点选择' },
  { num: 6, title: '解决方案' },
  { num: 7, title: '方案选择' },
  { num: 8, title: '设计风格' },
  { num: 9, title: '创意设计' },
  { num: 10, title: '最终设计' },
];

export default function Home() {
  const [session, setSession] = useState<DesignSession>({
    id: generateId(),
    currentStep: 1,
    productName: '',
    marketReport: null,
    userPersonas: null,
    selectedPersonas: [],
    productAnalysis: null,
    buyingPoints: null,
    selectedPoints: [],
    solutions: null,
    selectedSolutions: [],
    designerStyle: null,
    creativeDesigns: null,
    selectedDesigns: [],
    designDescriptions: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callKimi = useCallback(async (prompt: string, systemPrompt: string): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/kimi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemPrompt, temperature: 0.7, maxTokens: 8000 }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.content;
    } catch (err) {
      const message = err instanceof Error ? err.message : '请求失败';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const goToStep = (step: number) => {
    setSession(prev => ({ ...prev, currentStep: step }));
    setError(null);
  };

  const updateSession = (updates: Partial<DesignSession>) => {
    setSession(prev => ({ ...prev, ...updates }));
  };

  const renderStep = () => {
    switch (session.currentStep) {
      case 1:
        return <Step1ProductInput session={session} updateSession={updateSession} onNext={() => goToStep(2)} />;
      case 2:
        return <Step2MarketReport session={session} updateSession={updateSession} callKimi={callKimi} loading={loading} error={error} onBack={() => goToStep(1)} onNext={() => goToStep(3)} />;
      case 3:
        return <Step3PersonaSelection session={session} updateSession={updateSession} callKimi={callKimi} loading={loading} error={error} onBack={() => goToStep(2)} onNext={() => goToStep(4)} />;
      case 4:
        return <Step5ProductAnalysis session={session} updateSession={updateSession} callKimi={callKimi} loading={loading} error={error} onBack={() => goToStep(3)} onNext={() => goToStep(5)} />;
      case 5:
        return <Step6BuyingPointsSelection session={session} updateSession={updateSession} onBack={() => goToStep(4)} onNext={() => goToStep(6)} />;
      case 6:
        return <Step8SolutionReport session={session} updateSession={updateSession} callKimi={callKimi} loading={loading} error={error} onBack={() => goToStep(5)} onNext={() => goToStep(7)} />;
      case 7:
        return <Step9SolutionSelection session={session} updateSession={updateSession} onBack={() => goToStep(6)} onNext={() => goToStep(8)} />;
      case 8:
        return <Step11DesignerStyle session={session} updateSession={updateSession} onBack={() => goToStep(7)} onNext={() => goToStep(9)} />;
      case 9:
        return <Step12CreativeDesign session={session} updateSession={updateSession} callKimi={callKimi} loading={loading} error={error} onBack={() => goToStep(8)} onNext={() => goToStep(10)} />;
      case 10:
        return <Step15FinalDesign session={session} callKimi={callKimi} loading={loading} error={error} onBack={() => goToStep(9)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">DesignMuse</h1>
                <p className="text-xs text-gray-500">AI设计灵感工具</p>
              </div>
            </div>
            {session.productName && (
              <div className="text-right">
                <p className="text-xs text-gray-500">当前产品</p>
                <p className="text-sm font-medium text-gray-700">{session.productName}</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {STEPS.map((step, idx) => (
              <div key={step.num} className="flex items-center">
                <button
                  onClick={() => step.num < session.currentStep && goToStep(step.num)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                    step.num === session.currentStep
                      ? 'bg-blue-600 text-black'
                      : step.num < session.currentStep
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <span className="font-mono">{step.num.toString().padStart(2, '0')}</span>
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`w-4 h-px mx-1 ${step.num < session.currentStep ? 'bg-blue-600' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {renderStep()}
      </main>
    </div>
  );
}
