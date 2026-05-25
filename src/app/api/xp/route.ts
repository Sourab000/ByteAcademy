import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const body = await req.json();
    const { amount } = body;

    if (typeof amount !== 'number') {
      return NextResponse.json({ error: 'XP amount must be a number' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const newXp = dbUser.xp + amount;
    const newLevel = Math.floor(newXp / 1000) + 1;

    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        xp: newXp,
        level: newLevel,
        lastActiveAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, xp: updatedUser.xp, level: updatedUser.level });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update XP' }, { status: 500 });
  }
}
