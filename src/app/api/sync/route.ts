import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET Handler: Pulls full cloud state for the active user.
 * Auto-registers the user if logging in for the first time.
 */
export async function GET(req: NextRequest) {
  try {
    const supabaseUser = await authenticateUser(req);
    if (!supabaseUser || !supabaseUser.email) {
      return NextResponse.json({ error: 'Unauthorized credentials.' }, { status: 401 });
    }

    const email = supabaseUser.email;

    // Retrieve or auto-create the PostgreSQL user via email matching
    let dbUser = await prisma.user.findUnique({
      where: { email },
      include: {
        dsaProgresses: true,
        languageProgress: true,
        quizSubmissions: true,
        mockInterviews: true,
        achievements: true,
        revisionItems: true,
        tutorMessages: true,
        uiPreferences: true,
      },
    });

    if (!dbUser) {
      // First-time cloud login registration
      dbUser = await prisma.user.create({
        data: {
          email,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.preferred_username || email.split('@')[0] || 'Cloud Coder',
          avatarUrl: supabaseUser.user_metadata?.avatar_url || '',
          uiPreferences: {
            create: {
              theme: 'emerald',
              fontSize: 'standard',
              motionPhysics: 'spring',
              soundEffects: true,
              dailyReminder: true,
            },
          },
        },
        include: {
          dsaProgresses: true,
          languageProgress: true,
          quizSubmissions: true,
          mockInterviews: true,
          achievements: true,
          revisionItems: true,
          tutorMessages: true,
          uiPreferences: true,
        },
      });
    }

    return NextResponse.json({ active: true, user: dbUser });
  } catch (err: any) {
    console.error('Sync GET route error:', err);
    return NextResponse.json({ error: err.message || 'Error pulling database state.' }, { status: 500 });
  }
}

/**
 * POST Handler: Batch upserts local Zustand progress variables transactionally into PostgreSQL.
 */
export async function POST(req: NextRequest) {
  try {
    const supabaseUser = await authenticateUser(req);
    if (!supabaseUser || !supabaseUser.email) {
      return NextResponse.json({ error: 'Unauthorized credentials.' }, { status: 401 });
    }

    const email = supabaseUser.email;
    const payload = await req.json();

    if (!payload) {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    // Resolve active Postgres user profile
    const dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User profile not found. Call GET first.' }, { status: 404 });
    }

    // Batch transactional sync routine
    await prisma.$transaction(async (tx) => {
      // 1. Update Core User stats
      if (payload.user) {
        await tx.user.update({
          where: { id: dbUser.id },
          data: {
            name: payload.user.name || dbUser.name,
            avatarUrl: payload.user.avatar || dbUser.avatarUrl,
            xp: typeof payload.user.xp === 'number' ? payload.user.xp : dbUser.xp,
            level: typeof payload.user.level === 'number' ? payload.user.level : dbUser.level,
            streakDays: typeof payload.user.streakDays === 'number' ? payload.user.streakDays : dbUser.streakDays,
            lastActiveAt: new Date(),
          },
        });
      }

      // 2. Sync UI Preferences
      if (payload.uiPreferences) {
        await tx.uiPreferences.upsert({
          where: { userId: dbUser.id },
          create: {
            userId: dbUser.id,
            theme: payload.uiPreferences.theme || 'emerald',
            fontSize: payload.uiPreferences.fontSize || 'standard',
            motionPhysics: payload.uiPreferences.motionPhysics || 'spring',
            soundEffects: payload.uiPreferences.soundEffects ?? true,
            dailyReminder: payload.uiPreferences.dailyReminder ?? true,
          },
          update: {
            theme: payload.uiPreferences.theme,
            fontSize: payload.uiPreferences.fontSize,
            motionPhysics: payload.uiPreferences.motionPhysics,
            soundEffects: payload.uiPreferences.soundEffects,
            dailyReminder: payload.uiPreferences.dailyReminder,
          },
        });
      }

      // 3. Sync DSA Roadmap progress
      if (payload.dsaProgresses && Array.isArray(payload.dsaProgresses)) {
        for (const progress of payload.dsaProgresses) {
          await tx.dsaProgress.upsert({
            where: {
              userId_topicId: { userId: dbUser.id, topicId: progress.topicId },
            },
            create: {
              userId: dbUser.id,
              topicId: progress.topicId,
              masteryScore: progress.masteryScore || 0,
              completionPercent: progress.completionPercent || 0,
              completedQuestions: progress.completedQuestions || [],
              unlocked: progress.unlocked ?? true,
            },
            update: {
              masteryScore: progress.masteryScore,
              completionPercent: progress.completionPercent,
              completedQuestions: progress.completedQuestions,
              unlocked: progress.unlocked,
            },
          });
        }
      }

      // 4. Sync Languages lesson progress
      if (payload.languageProgresses && Array.isArray(payload.languageProgresses)) {
        for (const lp of payload.languageProgresses) {
          await tx.languageProgress.upsert({
            where: {
              userId_languageId: { userId: dbUser.id, languageId: lp.languageId },
            },
            create: {
              userId: dbUser.id,
              languageId: lp.languageId,
              completedLessons: lp.completedLessons || [],
              xpEarned: lp.xpEarned || 0,
              level: lp.level || 1,
              currentLessonIndex: lp.currentLessonIndex || 0,
            },
            update: {
              completedLessons: lp.completedLessons,
              xpEarned: lp.xpEarned,
              level: lp.level,
              currentLessonIndex: lp.currentLessonIndex,
            },
          });
        }
      }

      // 5. Sync Quizzes submissions
      if (payload.quizSubmissions && Array.isArray(payload.quizSubmissions)) {
        // Clear past quiz records to prevent duplicates and simplify bulk-replace syncs
        await tx.quizSubmission.deleteMany({ where: { userId: dbUser.id } });
        
        if (payload.quizSubmissions.length > 0) {
          await tx.quizSubmission.createMany({
            data: payload.quizSubmissions.map((q: any) => ({
              userId: dbUser.id,
              quizId: q.quizId || 'mixed_dsa',
              topicId: q.topicId || 'dsa',
              score: q.score || 0,
              maxScore: q.maxScore || 4,
              xpEarned: q.xpEarned || 0,
              createdAt: q.date ? new Date(q.date) : new Date(),
            })),
          });
        }
      }

      // 6. Sync Mock Interview sessions
      if (payload.mockInterviews && Array.isArray(payload.mockInterviews)) {
        await tx.mockInterview.deleteMany({ where: { userId: dbUser.id } });

        if (payload.mockInterviews.length > 0) {
          await tx.mockInterview.createMany({
            data: payload.mockInterviews.map((m: any) => ({
              userId: dbUser.id,
              title: m.title || 'DSA Interview Screen',
              difficulty: m.difficulty || 'MEDIUM',
              codeSnippet: m.code || '',
              language: m.language || 'javascript',
              feedback: m.feedback || '',
              score: m.score || 0,
              durationSeconds: m.durationSeconds || 0,
              createdAt: m.date ? new Date(m.date) : new Date(),
            })),
          });
        }
      }

      // 7. Sync unlocked achievements
      if (payload.achievements && Array.isArray(payload.achievements)) {
        for (const ach of payload.achievements) {
          await tx.achievement.upsert({
            where: {
              userId_achievementId: { userId: dbUser.id, achievementId: ach.achievementId },
            },
            create: {
              userId: dbUser.id,
              achievementId: ach.achievementId,
              title: ach.title,
              description: ach.description,
              icon: ach.icon,
              unlockedAt: ach.unlockedAt ? new Date(ach.unlockedAt) : new Date(),
            },
            update: {
              title: ach.title,
              description: ach.description,
              icon: ach.icon,
            },
          });
        }
      }

      // 8. Sync Spaced-Repetition Revision Queues
      if (payload.revisionItems && Array.isArray(payload.revisionItems)) {
        for (const item of payload.revisionItems) {
          await tx.revisionItem.upsert({
            where: {
              userId_topicId_type: { userId: dbUser.id, topicId: item.topicId, type: item.type },
            },
            create: {
              userId: dbUser.id,
              topicId: item.topicId,
              type: item.type,
              nextReviewDate: item.nextReviewDate ? new Date(item.nextReviewDate) : new Date(),
              intervalDays: item.intervalDays || 1,
              easeFactor: item.easeFactor || 2.5,
              repetitions: item.repetitions || 0,
            },
            update: {
              nextReviewDate: item.nextReviewDate ? new Date(item.nextReviewDate) : new Date(),
              intervalDays: item.intervalDays,
              easeFactor: item.easeFactor,
              repetitions: item.repetitions,
            },
          });
        }
      }

      // 9. Sync Tutor Message Histories
      if (payload.tutorMessages && Array.isArray(payload.tutorMessages)) {
        await tx.tutorMessage.deleteMany({ where: { userId: dbUser.id } });

        if (payload.tutorMessages.length > 0) {
          await tx.tutorMessage.createMany({
            data: payload.tutorMessages.map((msg: any) => ({
              userId: dbUser.id,
              mode: msg.mode || 'Explain Simply',
              sender: msg.sender,
              text: msg.text,
              timestamp: msg.timestamp || new Date().toLocaleTimeString(),
              createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
            })),
          });
        }
      }
    });

    return NextResponse.json({ success: true, message: 'Sync complete.' });
  } catch (err: any) {
    console.error('Sync POST route error:', err);
    return NextResponse.json({ error: err.message || 'Error syncing database state.' }, { status: 500 });
  }
}
