import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });
    return NextResponse.json({ user: dbUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to get profile' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const body = await req.json();
    
    const dbUser = await prisma.user.upsert({
      where: { email: user.email },
      create: {
        email: user.email,
        name: body.name || user.user_metadata.full_name || 'Coder',
        avatarUrl: body.avatarUrl || user.user_metadata.avatar_url || '',
      },
      update: {
        name: body.name,
        avatarUrl: body.avatarUrl,
        lastActiveAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, user: dbUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update profile' }, { status: 500 });
  }
}
