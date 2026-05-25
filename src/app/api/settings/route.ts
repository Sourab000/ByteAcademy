import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: { uiPreferences: true },
    });
    return NextResponse.json({ preferences: dbUser?.uiPreferences });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const body = await req.json();
    const { theme, fontSize, motionPhysics, soundEffects, dailyReminder } = body;

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const preferences = await prisma.uiPreferences.upsert({
      where: { userId: dbUser.id },
      create: {
        userId: dbUser.id,
        theme: theme || 'emerald',
        fontSize: fontSize || 'standard',
        motionPhysics: motionPhysics || 'spring',
        soundEffects: soundEffects ?? true,
        dailyReminder: dailyReminder ?? true,
      },
      update: {
        theme,
        fontSize,
        motionPhysics,
        soundEffects,
        dailyReminder,
      },
    });

    return NextResponse.json({ success: true, preferences });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update preferences' }, { status: 500 });
  }
}
