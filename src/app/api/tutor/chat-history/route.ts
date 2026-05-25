import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: { tutorMessages: true },
    });
    return NextResponse.json({ messages: dbUser?.tutorMessages || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch tutor messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const body = await req.json();
    const { mode, sender, text, timestamp } = body;

    if (!mode || !sender || !text) {
      return NextResponse.json({ error: 'Missing mode, sender or text' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const message = await prisma.tutorMessage.create({
      data: {
        userId: dbUser.id,
        mode,
        sender,
        text,
        timestamp: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add message' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode');

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    if (mode) {
      await prisma.tutorMessage.deleteMany({
        where: { userId: dbUser.id, mode },
      });
    } else {
      await prisma.tutorMessage.deleteMany({
        where: { userId: dbUser.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete tutor messages' }, { status: 500 });
  }
}
