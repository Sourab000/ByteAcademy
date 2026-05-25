import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: { dsaProgresses: true },
    });
    return NextResponse.json({ progresses: dbUser?.dsaProgresses || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch DSA progress' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const body = await req.json();
    const { topicId, questionId, xpReward } = body;

    if (!topicId || !questionId) {
      return NextResponse.json({ error: 'Missing topicId or questionId' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: { dsaProgresses: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const existingProgress = dbUser.dsaProgresses.find((p) => p.topicId === topicId);
    const completedQuestions = existingProgress ? [...existingProgress.completedQuestions] : [];

    if (!completedQuestions.includes(questionId)) {
      completedQuestions.push(questionId);
    }

    const completionPercent = Math.min(100, Math.round((completedQuestions.length / 2) * 100)); // assume 2 q's per topic
    const masteryScore = completedQuestions.length * 50;

    const progress = await prisma.dsaProgress.upsert({
      where: {
        userId_topicId: { userId: dbUser.id, topicId },
      },
      create: {
        userId: dbUser.id,
        topicId,
        completedQuestions,
        completionPercent,
        masteryScore,
        unlocked: true,
      },
      update: {
        completedQuestions,
        completionPercent,
        masteryScore,
        unlocked: true,
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
    return NextResponse.json({ error: err.message || 'Failed to update DSA progress' }, { status: 500 });
  }
}
