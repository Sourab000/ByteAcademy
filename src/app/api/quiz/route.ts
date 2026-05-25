import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: { quizSubmissions: true },
    });
    return NextResponse.json({ submissions: dbUser?.quizSubmissions || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch quizzes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const body = await req.json();
    const { quizId, topicId, score, maxScore, xpEarned } = body;

    if (!quizId || !topicId || typeof score !== 'number' || typeof maxScore !== 'number') {
      return NextResponse.json({ error: 'Missing required quiz fields' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const submission = await prisma.quizSubmission.create({
      data: {
        userId: dbUser.id,
        quizId,
        topicId,
        score,
        maxScore,
        xpEarned: xpEarned || 0,
      },
    });

    // Award XP dynamically
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        xp: dbUser.xp + (xpEarned || 0),
        level: Math.floor((dbUser.xp + (xpEarned || 0)) / 1000) + 1,
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to submit quiz' }, { status: 500 });
  }
}
