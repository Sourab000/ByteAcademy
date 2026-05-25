import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const today = new Date().toISOString().split('T')[0];
    const lastActive = dbUser.lastActiveAt ? dbUser.lastActiveAt.toISOString().split('T')[0] : '';
    
    let newStreak = dbUser.streakDays;

    if (lastActive === '') {
      newStreak = 1;
    } else {
      const lastDate = new Date(lastActive);
      const todayDate = new Date(today);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1; // reset streak
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        streakDays: newStreak,
        lastActiveAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, streakDays: updatedUser.streakDays });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update streak' }, { status: 500 });
  }
}
