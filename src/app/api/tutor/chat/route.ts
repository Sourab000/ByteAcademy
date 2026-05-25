import { NextRequest } from 'next/server';
import { getActiveProviderConfig } from '@/lib/ai/provider';
import { getSystemPromptForMode } from '@/lib/ai/prompts';

// Ensure the route does not static-opt, force dynamic execution
export const dynamic = 'force-dynamic';

/**
 * Text encoder for writing text chunks to the readable stream.
 */
const encoder = new TextEncoder();

/**
 * Next.js App Router POST handler for tutor chat stream requests.
 */
export async function POST(req: NextRequest) {
  try {
    const { messages, mode } = await req.json();

    if (!messages || !Array.isArray(messages) || !mode) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload. "messages" (array) and "mode" (string) are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const providerConfig = getActiveProviderConfig();

    // =========================================================================
    // FALLBACK STREAM: If no API keys are configured, stream setup instructions
    // =========================================================================
    if (!providerConfig) {
      const fallbackText = `### ⚠️ AI Provider Keys Missing!

Welcome to **ByteAcademy's Adaptive AI Tutor**! 

To unlock the full potential of your real-time Socratic mentor, strict reviewer, and system interviewer, you need to configure an API key. 

#### 🔧 How to Configure Your Keys:

1. **Create a local environment file**:
   In the root directory of your project, rename \`.env.example\` to \`.env.local\`:
   \`\`\`bash
   # Rename the template
   copy .env.example .env.local
   \`\`\`

2. **Add your preferred API Key**:
   Open \`.env.local\` in your editor and insert your key:
   - **Groq Key (Recommended for ultra-fast speeds)**:
     \`GROQ_API_KEY=gsk_your_key_here\`
   - **OpenRouter Key (Highly versatile models)**:
     \`OPENROUTER_API_KEY=sk-or-v1-your_key_here\`
   - **OpenAI Key (Industry standard)**:
     \`OPENAI_API_KEY=sk-proj-your_key_here\`

3. **Restart the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

*Once configured, the tutor will automatically activate and start guiding your coding journey in real-time!*`;

      // Create a stream that emits the fallback text chunk by chunk with brief delays
      const customStream = new ReadableStream({
        async start(controller) {
          const words = fallbackText.split(' ');
          for (let i = 0; i < words.length; i++) {
            // Group words slightly to make the streaming feel natural
            const chunk = words[i] + (i === words.length - 1 ? '' : ' ');
            controller.enqueue(encoder.encode(chunk));
            // Simulate brief token stream delay
            await new Promise((resolve) => setTimeout(resolve, 25));
          }
          controller.close();
        },
      });

      return new Response(customStream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
        },
      });
    }

    // =========================================================================
    // REAL STREAM: Process LLM streaming fetch call from the resolved provider
    // =========================================================================
    const systemPrompt = getSystemPromptForMode(mode);

    // Build standard messages array containing system instructions first
    const payloadMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
    ];

    const response = await fetch(providerConfig.endpoint, {
      method: 'POST',
      headers: providerConfig.headers,
      body: JSON.stringify({
        model: providerConfig.model,
        messages: payloadMessages,
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API error status ${response.status}:`, errorText);
      return new Response(
        JSON.stringify({ error: `Provider API failed with status ${response.status}: ${errorText}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Capture standard response body stream
    const rawStream = response.body;
    if (!rawStream) {
      throw new Error('API Response body is empty.');
    }

    // Create readable stream that decodes SSE formats into raw text streams
    const transformedStream = new ReadableStream({
      async start(controller) {
        const reader = rawStream.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            
            // Retain unfinished last line in buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
              const cleaned = line.trim();
              if (!cleaned) continue;

              // Check if stream finished
              if (cleaned === 'data: [DONE]') continue;

              if (cleaned.startsWith('data: ')) {
                try {
                  const jsonStr = cleaned.slice(6);
                  if (jsonStr === '[DONE]') continue;
                  
                  const parsed = JSON.parse(jsonStr);
                  const textChunk = parsed.choices?.[0]?.delta?.content || '';
                  if (textChunk) {
                    controller.enqueue(encoder.encode(textChunk));
                  }
                } catch (e) {
                  // Ignore parsing issues from comments or incomplete SSE chunks
                }
              }
            }
          }
          
          // Process final remaining buffer data
          if (buffer && buffer.startsWith('data: ')) {
            try {
              const jsonStr = buffer.slice(6);
              if (jsonStr !== '[DONE]') {
                const parsed = JSON.parse(jsonStr);
                const textChunk = parsed.choices?.[0]?.delta?.content || '';
                if (textChunk) {
                  controller.enqueue(encoder.encode(textChunk));
                }
              }
            } catch (e) {}
          }
        } catch (err) {
          console.error('Streaming parser error:', err);
          controller.error(err);
        } finally {
          controller.close();
          reader.releaseLock();
        }
      },
    });

    return new Response(transformedStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('Server Tutor route execution error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'An unexpected error occurred inside the backend route.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
