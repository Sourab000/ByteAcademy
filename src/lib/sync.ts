import { useStore } from '@/store';

/**
 * Maps question IDs to their curriculum topic ID.
 */
function getTopicIdFromQuestionId(qId: string): string {
  const prefix = qId.split('-')[0];
  switch (prefix) {
    case 'arr': return 'arrays';
    case 'tree': return 'trees';
    case 'stack': return 'stacks';
    case 'queue': return 'queues';
    default: return 'recursion';
  }
}

/**
 * GET Sync: Fetches full PostgreSQL data from server and hydrates Zustand.
 * Automatically merges local sandbox changes if logging in for the first time.
 */
export async function syncFromCloud(token: string) {
  try {
    const res = await fetch('/api/sync', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Sync GET failed: ${res.statusText}`);
    }

    const { user } = await res.json();
    if (!user) return;

    const localState = useStore.getState();

    // 1. Merge User Stats (Choose the higher XP, level, and streak, or merge)
    const mergedUser = {
      name: user.name || localState.user.name || 'Cloud Developer',
      avatar: user.avatarUrl || localState.user.avatar || '🦊',
      xp: Math.max(localState.user.xp, user.xp || 0),
      level: Math.max(localState.user.level, user.level || 1),
      streakDays: Math.max(localState.user.streakDays, user.streakDays || 0),
      lastActiveDate: user.lastActiveAt ? user.lastActiveAt.split('T')[0] : localState.user.lastActiveDate,
    };

    // 2. Merge UI Preferences
    const loadedPrefs = user.uiPreferences ? {
      theme: user.uiPreferences.theme || localState.uiPreferences.theme || 'emerald',
      fontSize: user.uiPreferences.fontSize || localState.uiPreferences.fontSize || 'standard',
      motionPhysics: user.uiPreferences.motionPhysics || localState.uiPreferences.motionPhysics || 'spring',
      soundEffects: user.uiPreferences.soundEffects ?? localState.uiPreferences.soundEffects,
      dailyReminder: user.uiPreferences.dailyReminder ?? localState.uiPreferences.dailyReminder,
    } : localState.uiPreferences;

    // 3. Merge Completed DSA Questions (Union of both)
    const cloudDsa = user.dsaProgresses
      ? user.dsaProgresses.flatMap((d: any) => d.completedQuestions || [])
      : [];
    const mergedDsaQuestions = Array.from(new Set([...localState.completedDsaQuestions, ...cloudDsa]));

    // 4. Merge Completed Language Lessons (Union of both)
    const mergedLanguageLessons = { ...localState.completedLanguageLessons };
    if (user.languageProgress) {
      user.languageProgress.forEach((lp: any) => {
        const cloudLessons = lp.completedLessons || [];
        const localLessons = mergedLanguageLessons[lp.languageId] || [];
        mergedLanguageLessons[lp.languageId] = Array.from(new Set([...localLessons, ...cloudLessons]));
      });
    }

    // 5. Merge Achievements (Union by ID)
    const cloudAchievements = user.achievements
      ? user.achievements.map((ach: any) => ({
          id: ach.achievementId,
          title: ach.title,
          description: ach.description,
          icon: ach.icon,
          unlockedAt: ach.unlockedAt,
        }))
      : [];
    const achievementsMap = new Map<string, any>();
    localState.achievements.forEach((a: any) => achievementsMap.set(a.id, a));
    cloudAchievements.forEach((a: any) => achievementsMap.set(a.id, a));
    const mergedAchievements = Array.from(achievementsMap.values());

    // 6. Merge Quiz History (Union by ID)
    const cloudQuizHistory = user.quizSubmissions
      ? user.quizSubmissions.map((q: any) => ({
          id: q.id,
          topicId: q.topicId,
          score: q.score,
          maxScore: q.maxScore,
          xpEarned: q.xpEarned,
          date: q.createdAt ? q.createdAt.split('T')[0] : '',
        }))
      : [];
    const quizMap = new Map<string, any>();
    localState.quizHistory.forEach((q: any) => quizMap.set(q.id, q));
    cloudQuizHistory.forEach((q: any) => quizMap.set(q.id, q));
    const mergedQuizHistory = Array.from(quizMap.values());

    // 7. Merge Mock Interviews
    const cloudMockInterviews = user.mockInterviews
      ? user.mockInterviews.map((m: any) => ({
          id: m.id,
          title: m.title,
          difficulty: m.difficulty,
          score: m.score,
          code: m.codeSnippet,
          feedback: m.feedback,
          durationSeconds: m.durationSeconds,
          date: m.createdAt ? m.createdAt.split('T')[0] : '',
        }))
      : [];
    const mockMap = new Map<string, any>();
    localState.mockInterviews.forEach((m: any) => mockMap.set(m.id, m));
    cloudMockInterviews.forEach((m: any) => mockMap.set(m.id, m));
    const mergedMockInterviews = Array.from(mockMap.values());

    // 8. Merge Spaced-Repetition Revision Queue (Union by topicId + type)
    const cloudRevisionQueue = user.revisionItems
      ? user.revisionItems.map((r: any) => ({
          id: r.id,
          topicId: r.topicId,
          type: r.type,
          nextReviewDate: r.nextReviewDate,
          intervalDays: r.intervalDays,
          easeFactor: r.easeFactor,
          repetitions: r.repetitions,
        }))
      : [];
    const revMap = new Map<string, any>();
    localState.revisionQueue.forEach((r: any) => revMap.set(`${r.topicId}_${r.type}`, r));
    cloudRevisionQueue.forEach((r: any) => revMap.set(`${r.topicId}_${r.type}`, r));
    const mergedRevisionQueue = Array.from(revMap.values());

    // 9. Merge Tutor Message Logs
    const mergedTutorChats = { ...localState.tutorChats };
    if (user.tutorMessages) {
      user.tutorMessages.forEach((msg: any) => {
        if (!mergedTutorChats[msg.mode]) {
          mergedTutorChats[msg.mode] = [];
        }
        const exists = mergedTutorChats[msg.mode].some(
          (m: any) => m.text === msg.text && m.sender === msg.sender
        );
        if (!exists) {
          mergedTutorChats[msg.mode].push({
            sender: msg.sender,
            text: msg.text,
            timestamp: msg.timestamp,
          });
        }
      });
    }

    // Apply batch update directly to Zustand!
    useStore.setState({
      user: mergedUser,
      uiPreferences: loadedPrefs,
      completedDsaQuestions: mergedDsaQuestions,
      completedLanguageLessons: mergedLanguageLessons,
      achievements: mergedAchievements,
      quizHistory: mergedQuizHistory,
      mockInterviews: mergedMockInterviews,
      revisionQueue: mergedRevisionQueue,
      tutorChats: mergedTutorChats,
    });

    console.log('Hydration Sync Complete: Loaded data from cloud.');
  } catch (err) {
    console.error('Error syncing from cloud:', err);
  }
}

/**
 * POST Sync: Pushes current local Zustand state to cloud database securely.
 */
export async function syncToCloud(token: string) {
  try {
    const state = useStore.getState();

    // 1. Construct DSA Progresses by grouping completed questions by topic
    const dsaMap: { [topicId: string]: string[] } = {};
    state.completedDsaQuestions.forEach((qId) => {
      const topicId = getTopicIdFromQuestionId(qId);
      if (!dsaMap[topicId]) {
        dsaMap[topicId] = [];
      }
      dsaMap[topicId].push(qId);
    });
    
    const dsaProgresses = Object.entries(dsaMap).map(([topicId, completedQuestions]) => ({
      topicId,
      completedQuestions,
      completionPercent: Math.min(100, Math.round((completedQuestions.length / 2) * 100)), // assume 2 qs per topic
      masteryScore: completedQuestions.length * 50,
    }));

    // 2. Construct Language Progresses
    const languageProgresses = Object.entries(state.completedLanguageLessons).map(([languageId, completedLessons]) => ({
      languageId,
      completedLessons,
      xpEarned: completedLessons.length * 100,
    }));

    // 3. Flatten Achievements
    const achievements = state.achievements.map((ach) => ({
      achievementId: ach.id,
      title: ach.title,
      description: ach.description,
      icon: ach.icon,
      unlockedAt: ach.unlockedAt,
    }));

    // 4. Flatten Tutor message chats
    const tutorMessages: any[] = [];
    Object.entries(state.tutorChats).forEach(([mode, messages]) => {
      messages.forEach((msg) => {
        tutorMessages.push({
          mode,
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp,
        });
      });
    });

    // 5. Build full sync payload matching PostgreSQL transactional models
    const payload = {
      user: {
        name: state.user.name,
        avatar: state.user.avatar,
        xp: state.user.xp,
        level: state.user.level,
        streakDays: state.user.streakDays,
      },
      uiPreferences: state.uiPreferences,
      dsaProgresses,
      languageProgresses,
      quizSubmissions: state.quizHistory,
      mockInterviews: state.mockInterviews,
      achievements,
      revisionItems: state.revisionQueue,
      tutorMessages,
    };

    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Sync POST failed: ${res.statusText}`);
    }

    console.log('Synchronization complete: Cloud tables updated.');
  } catch (err) {
    console.error('Error syncing to cloud:', err);
  }
}
