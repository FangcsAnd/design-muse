'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Copy, Check, RefreshCw, Image, ExternalLink, Wand2, Loader2 } from 'lucide-react';
import { DesignSession } from '@/types';

interface Props {
  session: DesignSession;
  callKimi: (prompt: string, systemPrompt: string) => Promise<string>;
  loading: boolean;
  error: string | null;
  onBack: () => void;
}

interface DesignPrompt {
  id: string;
  designName: string;
  prompt: string;
  description: string;
  style: string;
}

interface GeneratedImage {
  promptId: string;
  url: string;
  status: 'generating' | 'success' | 'error';
}

export default function Step15FinalDesign({ session, callKimi, loading, error, onBack }: Props) {
  const [prompts, setPrompts] = useState<DesignPrompt[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [parsedError, setParsedError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<string, GeneratedImage>>({});
  const [generatingPrompts, setGeneratingPrompts] = useState<Set<string>>(new Set());
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    const generatePrompts = async () => {
      setIsGenerating(true);
      setParsedError(null);
      
      try {
        const selectedDesigns = session.creativeDesigns?.filter(d => session.selectedDesigns.includes(d.id)) || [];
        const designerStyle = session.designerStyle;
        
        const designTexts = selectedDesigns.map((d, i) => 
          `${i + 1}. ${d.name}
   解决方案: ${d.solution}
   CMF材质: ${d.industrialCMF}
   主卖点: ${d.mainSellingPoint}
   次卖点: ${d.secondarySellingPoint}`
        ).join('\n\n');

        const result = await callKimi(
          `请为以下${selectedDesigns.length}个设计方案生成专业的图像生成提示词`,
          `你是一位专业的工业设计师，擅长为产品设计方案生成图像生成提示词。

设计师风格: ${designerStyle?.name || '现代'} - ${designerStyle?.philosophy || ''}

请为每个设计方案生成专业的英文图像生成提示词，提示词应该包含：
- 产品外观描述
- 材质和颜色
- 设计风格特征
- 场景和光影
- 画质要求

格式要求：
每个提示词用 ---分隔，格式如下：
设计方案名称: XXX
图像提示词: [详细的英文提示词]
风格标签: [简洁的风格标签]

以下是设计方案信息：
${designTexts}`
        );

        const newPrompts: DesignPrompt[] = selectedDesigns.map((d) => ({
          id: d.id,
          designName: d.name,
          prompt: `Professional product design of ${d.name}, ${d.industrialCMF}, ${designerStyle?.name || 'modern'} style, ${d.solution}, minimalist studio setting, soft natural lighting, high-end photography, 4K detail, photorealistic`,
          description: d.solution,
          style: designerStyle?.name || '现代',
        }));

        const promptMatches = result.match(/图像提示词[:：]\s*([\s\S]*?)(?=设计方案名称|风格标签|---|$)/gi);
        if (promptMatches && promptMatches.length > 0) {
          promptMatches.forEach((match, idx) => {
            if (idx < newPrompts.length) {
              const promptText = match
                .replace(/图像提示词[:：]\s*/i, '')
                .replace(/[\n\r]+/g, ' ')
                .trim();
              if (promptText.length > 20) {
                newPrompts[idx].prompt = promptText;
              }
            }
          });
        }

        setPrompts(newPrompts);
      } catch (err) {
        console.error('生成提示词失败:', err);
        setParsedError(err instanceof Error ? err.message : '生成失败');
      }
      setIsGenerating(false);
    };
    
    if (session.selectedDesigns.length > 0) {
      generatePrompts();
    }
  }, [session.selectedDesigns, session.creativeDesigns, session.designerStyle, callKimi]);

  const copyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const regeneratePrompt = async (index: number) => {
    const designId = session.selectedDesigns[index];
    const design = session.creativeDesigns?.find(d => d.id === designId);
    if (!design) return;

    const designerStyle = session.designerStyle;
    
    setPrompts(prev => prev.map((p, i) => 
      i === index ? { ...p, prompt: '正在生成...' } : p
    ));

    const newPrompt = `Professional product design of ${design.name}, ${design.industrialCMF}, ${designerStyle?.name || 'modern'} style, ${design.solution}, minimalist studio setting, soft natural lighting, high-end photography, 4K detail, photorealistic`;
    
    setTimeout(() => {
      setPrompts(prev => prev.map((p, i) => 
        i === index ? { ...p, prompt: newPrompt } : p
      ));
    }, 1000);
  };

  const generateImage = async (promptItem: DesignPrompt) => {
    if (generatingPrompts.has(promptItem.id)) return;
    
    setGeneratingPrompts(prev => new Set(prev).add(promptItem.id));
    setImageError(null);
    
    setGeneratedImages(prev => ({
      ...prev,
      [promptItem.id]: { promptId: promptItem.id, url: '', status: 'generating' }
    }));

    try {
      const response = await fetch('/api/jimeng', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptItem.prompt,
          model: 'doubao-seedream-4-0-250828',
          size: '1024x1024',
          watermark: false
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('API Error Response:', text);
        let errorMsg = `API error: ${response.status}`;
        try {
          const errorData = JSON.parse(text);
          errorMsg = errorData.details || errorData.message || errorData.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      if (data.data && data.data[0]?.url) {
        setGeneratedImages(prev => ({
          ...prev,
          [promptItem.id]: { promptId: promptItem.id, url: data.data[0].url, status: 'success' }
        }));
      } else {
        throw new Error('No image URL in response');
      }
    } catch (err) {
      console.error('Generate image error:', err);
      setGeneratedImages(prev => ({
        ...prev,
        [promptItem.id]: { promptId: promptItem.id, url: '', status: 'error' }
      }));
      setImageError(err instanceof Error ? err.message : '生成图片失败');
    } finally {
      setGeneratingPrompts(prev => {
        const newSet = new Set(prev);
        newSet.delete(promptItem.id);
        return newSet;
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-[#888] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          上一步
        </button>
        <h2 className="text-xl font-semibold">产品设计图</h2>
        <div className="w-20" />
      </div>

      <p className="text-[#888] mb-6">
        以下是为选定方案生成的图像生成提示词，可复制到 Midjourney、DALL-E、Stable Diffusion 等工具生成设计图
      </p>

      {(error || parsedError || imageError) && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
          {error || parsedError || imageError}
        </div>
      )}

      <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Wand2 className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">即梦AI生成</h3>
        </div>
        <p className="text-sm text-gray-400">
          点击下方每个方案卡片的"用即梦AI生成"按钮，可直接生成设计图
        </p>
      </div>

      {isGenerating || loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full border-4 border-[#2a2a3e] border-t-[#e94560] animate-spin-slow mb-4" />
          <p className="text-[#888]">正在生成图像提示词...</p>
        </div>
      ) : prompts.length > 0 ? (
        <div className="space-y-6 mb-6">
          {prompts.map((prompt, idx) => (
            <div key={prompt.id} className="bg-[#1a1a2e] rounded-2xl border border-[#2a2a3e] overflow-hidden fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e94560] to-[#0f3460] flex items-center justify-center text-white font-bold text-lg">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{prompt.designName}</h3>
                    <p className="text-sm text-[#888]">{prompt.description}</p>
                  </div>
                </div>

                <div className="bg-[#0a0a0f] rounded-xl p-5 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-[#e94560]" />
                      <span className="text-sm text-[#888]">图像生成提示词</span>
                    </div>
                    <button
                      onClick={() => copyPrompt(prompt.id, prompt.prompt)}
                      className="flex items-center gap-1 text-sm text-[#e94560] hover:underline"
                    >
                      {copiedId === prompt.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          复制提示词
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{prompt.prompt}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-[#e94560]/20 text-[#e94560] rounded-lg text-xs font-medium">
                      {prompt.style}
                    </span>
                    <span className="px-3 py-1 bg-[#2a2a3e] text-[#888] rounded-lg text-xs">
                      可用于 Midjourney / DALL-E / SD
                    </span>
                  </div>
                  <button
                    onClick={() => regeneratePrompt(idx)}
                    className="flex items-center gap-1 text-sm text-[#888] hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    重新生成
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-[#2a2a3e]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">即梦AI设计图</span>
                    {generatedImages[prompt.id]?.status !== 'generating' && (
                      <button
                        onClick={() => generateImage(prompt)}
                        disabled={generatingPrompts.has(prompt.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-xs text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {generatingPrompts.has(prompt.id) ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            生成中...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3 h-3" />
                            用即梦AI生成
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {generatedImages[prompt.id]?.status === 'generating' && (
                    <div className="flex items-center justify-center py-8 bg-[#0a0a0f] rounded-xl">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mb-2" />
                        <p className="text-sm text-[#888]">正在用即梦AI生成图片...</p>
                      </div>
                    </div>
                  )}
                  
                  {generatedImages[prompt.id]?.status === 'success' && (
                    <div className="relative group">
                      <img 
                        src={generatedImages[prompt.id].url} 
                        alt={prompt.designName}
                        className="w-full rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
                        <a 
                          href={generatedImages[prompt.id].url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-white text-black rounded-lg text-sm hover:bg-gray-100"
                        >
                          查看大图
                        </a>
                        <button
                          onClick={() => generateImage(prompt)}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
                        >
                          重新生成
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {generatedImages[prompt.id]?.status === 'error' && (
                    <div className="flex flex-col items-center py-8 bg-[#0a0a0f] rounded-xl">
                      <p className="text-sm text-red-400 mb-2">生成失败，请重试</p>
                      <button
                        onClick={() => generateImage(prompt)}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
                      >
                        重新生成
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-[#888]">暂无可用的设计方案</p>
        </div>
      )}

      {prompts.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-[#e94560]/20 to-[#0f3460]/20 rounded-2xl border border-[#e94560]/30">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-[#e94560]" />
            使用说明
          </h3>
          <ol className="text-sm text-[#aaa] space-y-2 list-decimal list-inside">
            <li>点击每个方案下方的"用即梦AI生成"按钮，直接生成设计图</li>
            <li>或者点击"复制提示词"复制到 Midjourney、DALL-E、Stable Diffusion 等工具</li>
            <li>粘贴提示词并根据需要调整参数</li>
            <li>生成后即可获得专业的产品设计图</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="https://jimeng.jianying.com" target="_blank" rel="noopener noreferrer" 
               className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-sm hover:opacity-90 transition-opacity">
              即梦AI
            </a>
            <a href="https://www.midjourney.com" target="_blank" rel="noopener noreferrer" 
               className="px-4 py-2 bg-[#1a1a2e] rounded-lg text-sm hover:bg-[#2a2a3e] transition-colors">
              Midjourney
            </a>
            <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer"
               className="px-4 py-2 bg-[#1a1a2e] rounded-lg text-sm hover:bg-[#2a2a3e] transition-colors">
              DALL-E (ChatGPT)
            </a>
            <a href="https://stabilityai.com/stablediffusion" target="_blank" rel="noopener noreferrer"
               className="px-4 py-2 bg-[#1a1a2e] rounded-lg text-sm hover:bg-[#2a2a3e] transition-colors">
              Stable Diffusion
            </a>
          </div>
        </div>
      )}

      {prompts.length > 0 && (
        <div className="mt-8 p-6 bg-[#1a1a2e] rounded-2xl border border-[#2a2a3e] text-center">
          <h3 className="font-semibold text-lg mb-2">恭喜完成设计灵感探索！</h3>
          <p className="text-[#888] text-sm mb-4">
            你已经获得了从市场调研到产品设计图的完整设计洞察方案
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1 bg-[#2a2a3e] rounded-full text-xs text-[#888]">市场调研 ✓</span>
            <span className="px-3 py-1 bg-[#2a2a3e] rounded-full text-xs text-[#888]">用户画像 ✓</span>
            <span className="px-3 py-1 bg-[#2a2a3e] rounded-full text-xs text-[#888]">买点分析 ✓</span>
            <span className="px-3 py-1 bg-[#2a2a3e] rounded-full text-xs text-[#888]">解决方案 ✓</span>
            <span className="px-3 py-1 bg-[#2a2a3e] rounded-full text-xs text-[#888]">创意设计 ✓</span>
            <span className="px-3 py-1 bg-[#e94560]/20 rounded-full text-xs text-[#e94560]">设计图提示词 ✓</span>
            <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full text-xs text-purple-400">即梦AI设计图</span>
          </div>
        </div>
      )}
    </div>
  );
}
