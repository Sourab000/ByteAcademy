/**
 * ByteAcademy AI Provider Adapter Layer
 * Resolves active providers, models, API endpoints, headers, and request formatting securely.
 */

export type ProviderType = 'groq' | 'openrouter' | 'openai';

export interface ProviderConfig {
  provider: ProviderType;
  apiKey: string;
  model: string;
  endpoint: string;
  headers: Record<string, string>;
}

/**
 * Dynamically resolves the best active AI Provider based on configured environment variables
 * and optional AI_PROVIDER overrides.
 * 
 * Returns null if no active keys are found, signaling the route to stream the fallback guide.
 */
export function getActiveProviderConfig(): ProviderConfig | null {
  const env = process.env;
  
  const keys = {
    groq: env.GROQ_API_KEY || '',
    openrouter: env.OPENROUTER_API_KEY || '',
    openai: env.OPENAI_API_KEY || '',
  };

  const overrideProvider = env.AI_PROVIDER?.toLowerCase() as ProviderType | undefined;

  let resolvedProvider: ProviderType | null = null;

  // 1. If an override provider is explicitly requested, check if its key is present
  if (overrideProvider && ['groq', 'openrouter', 'openai'].includes(overrideProvider)) {
    if (keys[overrideProvider]) {
      resolvedProvider = overrideProvider;
    }
  }

  // 2. If no override was requested or the override key was missing, detect via default fallback order:
  //    Groq -> OpenRouter -> OpenAI
  if (!resolvedProvider) {
    if (keys.groq) {
      resolvedProvider = 'groq';
    } else if (keys.openrouter) {
      resolvedProvider = 'openrouter';
    } else if (keys.openai) {
      resolvedProvider = 'openai';
    }
  }

  if (!resolvedProvider) {
    return null;
  }

  // 3. Populate config depending on the resolved provider
  switch (resolvedProvider) {
    case 'groq':
      return {
        provider: 'groq',
        apiKey: keys.groq,
        model: 'llama-3.3-70b-versatile',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        headers: {
          'Authorization': `Bearer ${keys.groq}`,
          'Content-Type': 'application/json',
        },
      };
      
    case 'openrouter':
      return {
        provider: 'openrouter',
        apiKey: keys.openrouter,
        model: 'meta-llama/llama-3.3-70b-instruct',
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        headers: {
          'Authorization': `Bearer ${keys.openrouter}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://byteacademy.dev',
          'X-Title': 'ByteAcademy',
        },
      };
      
    case 'openai':
      return {
        provider: 'openai',
        apiKey: keys.openai,
        model: 'gpt-4o-mini',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Authorization': `Bearer ${keys.openai}`,
          'Content-Type': 'application/json',
        },
      };
  }
}
