import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: { achievements: true },
    });
    return NextResponse.json({ achievements: dbUser?.achievements || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch achievements' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const body = await req.json();
    const { achievementId, title, description, icon } = body;

    if (!achievementId || !title || !description || !icon) {
      return NextResponse.json({ error: 'Missing achievement fields' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const achievement = await prisma.achievement.upsert({
      where: {
        userId_achievementId: { userId: dbUser.id, achievementId },
      },
      create: {
        userId: dbUser.id,
        achievementId,
        title,
        description,
        icon,
      },
      update: {
        title,
        description,
        icon,
      },
    });

    return NextResponse.json({ success: true, achievement });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to unlock achievement' }, { status: 500 });
  }
}
