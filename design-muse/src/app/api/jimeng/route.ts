import { NextRequest, NextResponse } from 'next/server';

interface GenerateRequest {
  prompt: string;
  model?: string;
  size?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { prompt, size = '1024x1024' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.SD_API_KEY || 'sk-EzVAaUxx1CcVuZ6NxW3c357eJdjsOV8YPy7R6BIlRwFKmwF9';

    const engineId = 'stable-diffusion-xl-1024-v1-0';
    
    const requestBody = {
      text_prompts: [
        {
          text: prompt,
          weight: 1
        },
        {
          text: 'blurry, low quality, distorted, ugly, bad anatomy',
          weight: -1
        }
      ],
      cfg_scale: 7,
      height: 1024,
      width: 1024,
      steps: 30,
      samples: 1,
    };

    console.log('Sending request to Stability AI API...');

    const maxRetries = 3;
    const retryDelay = 3000;
    let lastError = '';
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const response = await fetch(`https://api.stability.ai/v1/generation/${engineId}/text-to-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      console.log('Response status:', response.status, 'Attempt:', attempt);

      if (response.ok) {
        const data = JSON.parse(responseText);
        
        if (data.errors) {
          return NextResponse.json({ 
            error: 'API error', 
            details: data.errors.join(', ') 
          }, { status: 500 });
        }

        const base64Image = data.artifacts?.[0]?.base64;
        
        if (!base64Image) {
          return NextResponse.json({ 
            error: 'No image in response',
            details: JSON.stringify(data)
          }, { status: 500 });
        }

        const imageUrl = `data:image/png;base64,${base64Image}`;

        return NextResponse.json({
          data: [{
            url: imageUrl
          }]
        });
      }

      lastError = responseText;
      
      if (response.status === 429 && attempt < maxRetries) {
        console.log('API overloaded, retrying in', retryDelay, 'ms...');
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      return NextResponse.json({ 
        error: `API error: ${response.status}`, 
        details: lastError 
      }, { status: response.status });
    }
  } catch (error) {
    console.error('Generate image error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: String(error) 
    }, { status: 500 });
  }
}