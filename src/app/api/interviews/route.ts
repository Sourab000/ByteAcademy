import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: { mockInterviews: true },
    });
    return NextResponse.json({ interviews: dbUser?.mockInterviews || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch interviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const body = await req.json();
    const { title, difficulty, codeSnippet, language, feedback, score, durationSeconds } = body;

    if (!title || !difficulty || typeof score !== 'number') {
      return NextResponse.json({ error: 'Missing interview fields' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const interview = await prisma.mockInterview.create({
      data: {
        userId: dbUser.id,
        title,
        difficulty,
        codeSnippet: codeSnippet || '',
        language: language || 'javascript',
        feedback: feedback || '',
        score,
        durationSeconds: durationSeconds || 0,
      },
    });

    // Award substantial XP for completing mock interviews
    const xpReward = Math.floor(score * 3);
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        xp: dbUser.xp + xpReward,
        level: Math.floor((dbUser.xp + xpReward) / 1000) + 1,
      },
    });

    return NextResponse.json({ success: true, interview });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save interview' }, { status: 500 });
  }
}
