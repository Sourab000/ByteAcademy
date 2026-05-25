import { NextResponse } from 'next/server';
import { getActiveProviderConfig } from '@/lib/ai/provider';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = getActiveProviderConfig();
    
    if (!config) {
      return NextResponse.json({
        active: false,
        provider: 'none',
        model: 'None (Local Sandbox Fallback)',
      });
    }

    return NextResponse.json({
      active: true,
      provider: config.provider,
      model: config.model,
    });
  } catch (error: any) {
    return NextResponse.json({
      active: false,
      provider: 'none',
      error: error.message,
    }, { status: 500 });
  }
}
