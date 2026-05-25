import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: { languageProgress: true },
    });
    return NextResponse.json({ progresses: dbUser?.languageProgress || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch language progress' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const body = await req.json();
    const { languageId, lessonId, xpReward } = body;

    if (!languageId || !lessonId) {
      return NextResponse.json({ error: 'Missing languageId or lessonId' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: { languageProgress: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const existingProgress = dbUser.languageProgress.find((p) => p.languageId === languageId);
    const completedLessons = existingProgress ? [...existingProgress.completedLessons] : [];

    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
    }

    const newXpEarned = completedLessons.length * 100;
    const progress = await prisma.languageProgress.upsert({
      where: {
        userId_languageId: { userId: dbUser.id, languageId },
      },
      create: {
        userId: dbUser.id,
        languageId,
        completedLessons,
        xpEarned: newXpEarned,
        level: Math.floor(newXpEarned / 1000) + 1,
        currentLessonIndex: completedLessons.length,
      },
      update: {
        completedLessons,
        xpEarned: newXpEarned,
        level: Math.floor(newXpEarned / 1000) + 1,
        currentLessonIndex: completedLessons.length,
      },
    });

    // Award XP dynamically
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        xp: dbUser.xp + (xpReward || 100),
        level: Math.floor((dbUser.xp + (xpReward || 100)) / 1000) + 1,
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update language progress' }, { status: 500 });
  }
}
