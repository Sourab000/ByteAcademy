import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
}

export interface UserAccount {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  githubUsername: string | null;
  githubAvatarUrl: string | null;
  githubConnected: boolean;
}

export interface UiPreferences {
  theme: 'dark' | 'oled' | 'emerald' | 'cyberpunk';
  fontSize: 'compact' | 'standard' | 'large';
  motionPhysics: 'spring' | 'tween' | 'reduced';
  soundEffects: boolean;
  dailyReminder: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface TutorMessage {
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
}

export interface QuizResult {
  id: string;
  topicId: string;
  score: number;
  maxScore: number;
  date: string;
  xpEarned: number;
}

export interface MockInterviewResult {
  id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  score: number;
  code: string;
  feedback: string;
  durationSeconds: number;
  date: string;
}

export interface RevisionItem {
  id: string;
  topicId: string;
  type: 'DSA' | 'LANGUAGE';
  nextReviewDate: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface ByteAcademyState {
  // Profile & Streaks
  user: UserProfile;
  accounts: UserAccount[];
  activeAccountIndex: number;
  heatmap: { [dateStr: string]: number }; // e.g. { "2026-05-23": 150 }
  achievements: Achievement[];
  githubUser: {
    username: string;
    avatarUrl: string;
    connected: boolean;
    lastSync: string;
    contributions: { [dateStr: string]: number };
    isSandbox: boolean;
  } | null;
  
  // Curriculum progress
  completedDsaQuestions: string[]; // question ids e.g. ["arr-1"]
  completedLanguageLessons: { [langId: string]: string[] }; // { "python": ["py-1"] }
  
  // AI Tutor Chat History
  activeTutorMode: string;
  tutorChats: { [mode: string]: TutorMessage[] };
  
  // Quiz & Mock Interviews
  quizHistory: QuizResult[];
  mockInterviews: MockInterviewResult[];
  
  // Spaced Repetition Revision
  revisionQueue: RevisionItem[];
  
  // Actions
  addXp: (amount: number) => void;
  incrementStreak: () => void;
  unlockAchievement: (id: string, title: string, description: string, icon: string) => void;
  completeDsaQuestion: (questionId: string, topicId: string, xpReward: number) => void;
  completeLanguageLesson: (langId: string, lessonId: string, xpReward: number) => void;
  addTutorMessage: (mode: string, message: Omit<TutorMessage, 'timestamp'>) => void;
  clearTutorChat: (mode: string) => void;
  addQuizResult: (result: Omit<QuizResult, 'id' | 'date'>) => void;
  addMockInterviewResult: (result: Omit<MockInterviewResult, 'id' | 'date'>) => void;
  addToRevisionQueue: (topicId: string, type: 'DSA' | 'LANGUAGE') => void;
  processRevisionItem: (itemId: string, rating: number) => void; // rating: 1-5 for spaced repetition
  setActiveTutorMode: (mode: string) => void;
  updateProfile: (name: string, avatar: string) => void;
  uiPreferences: UiPreferences;
  updateUiPreferences: (prefs: Partial<UiPreferences>) => void;
  connectGithub: (username: string, avatarUrl: string, isSandbox?: boolean) => void;
  disconnectGithub: () => void;
  syncGithubContributions: (contributions: { [dateStr: string]: number }) => void;
  switchAccount: (index: number) => void;
  addNewAccount: (name: string, avatar: string) => void;
  removeAccount: (id: string) => void;
  resetProgress: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void;
  dismissToast: (id: string) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Novice Coder",
  avatar: "🤖",
  xp: 0,
  level: 1,
  streakDays: 0,
  lastActiveDate: "",
};

const DEFAULT_PREFERENCES: UiPreferences = {
  theme: 'emerald',
  fontSize: 'standard',
  motionPhysics: 'spring',
  soundEffects: true,
  dailyReminder: true,
};

export const useStore = create<ByteAcademyState>()(
  persist(
    (set, get) => ({
      user: DEFAULT_PROFILE,
      accounts: [
        { id: '1', name: "Novice Coder", avatar: "🤖", xp: 0, level: 1, githubUsername: null, githubAvatarUrl: null, githubConnected: false }
      ],
      activeAccountIndex: 0,
      uiPreferences: DEFAULT_PREFERENCES,
      heatmap: {},
      achievements: [],
      completedDsaQuestions: [],
      completedLanguageLessons: {},
      activeTutorMode: "Explain Simply",
      tutorChats: {},
      quizHistory: [],
      mockInterviews: [],
      revisionQueue: [],
      githubUser: null,
      toasts: [],
      showToast: (message, type = 'info', duration = 3000) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = { id, message, type, duration };
        set((state) => ({ toasts: [...state.toasts, newToast] }));
        setTimeout(() => {
          get().dismissToast(id);
        }, duration);
      },
      dismissToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      })),
      
      updateUiPreferences: (prefs) => set((state) => ({
        uiPreferences: {
          ...state.uiPreferences,
          ...prefs
        }
      })),
      
      updateProfile: (name, avatar) => set((state) => {
        const updatedUser = {
          ...state.user,
          name,
          avatar,
          lastActiveDate: new Date().toISOString().split('T')[0]
        };
        const updatedAccounts = [...state.accounts];
        if (updatedAccounts[state.activeAccountIndex]) {
          updatedAccounts[state.activeAccountIndex] = {
            ...updatedAccounts[state.activeAccountIndex],
            name,
            avatar,
          };
        }
        return {
          user: updatedUser,
          accounts: updatedAccounts,
        };
      }),
      
      connectGithub: (username, avatarUrl, isSandbox = false) => set((state) => {
        const updatedGithub = {
          username,
          avatarUrl,
          connected: true,
          lastSync: new Date().toLocaleTimeString(),
          contributions: {},
          isSandbox
        };
        const updatedUser = {
          ...state.user,
          name: username,
          avatar: isSandbox ? "⚡" : "🦊"
        };
        const updatedAccounts = [...state.accounts];
        if (updatedAccounts[state.activeAccountIndex]) {
          updatedAccounts[state.activeAccountIndex] = {
            ...updatedAccounts[state.activeAccountIndex],
            name: username,
            avatar: isSandbox ? "⚡" : "🦊",
            githubUsername: username,
            githubAvatarUrl: avatarUrl,
            githubConnected: true,
          };
        }
        return {
          githubUser: updatedGithub,
          user: updatedUser,
          accounts: updatedAccounts,
        };
      }),

      disconnectGithub: () => set((state) => {
        const updatedUser = {
          ...state.user,
          name: "Novice Coder",
          avatar: "🤖"
        };
        const updatedAccounts = [...state.accounts];
        if (updatedAccounts[state.activeAccountIndex]) {
          updatedAccounts[state.activeAccountIndex] = {
            ...updatedAccounts[state.activeAccountIndex],
            name: "Novice Coder",
            avatar: "🤖",
            githubUsername: null,
            githubAvatarUrl: null,
            githubConnected: false,
          };
        }
        return {
          githubUser: null,
          user: updatedUser,
          accounts: updatedAccounts,
        };
      }),

      syncGithubContributions: (contributions) => set((state) => {
        if (!state.githubUser) return {};
        const updatedHeatmap = { ...state.heatmap };
        Object.entries(contributions).forEach(([dateStr, count]) => {
          updatedHeatmap[dateStr] = (updatedHeatmap[dateStr] || 0) + (count * 25); // 25 XP per GitHub commit!
        });
        return {
          githubUser: {
            ...state.githubUser,
            lastSync: new Date().toLocaleTimeString(),
            contributions
          },
          heatmap: updatedHeatmap
        };
      }),

      switchAccount: (index) => set((state) => {
        if (index < 0 || index >= state.accounts.length) return {};
        
        const updatedAccounts = [...state.accounts];
        updatedAccounts[state.activeAccountIndex] = {
          ...updatedAccounts[state.activeAccountIndex],
          name: state.user.name,
          avatar: state.user.avatar,
          xp: state.user.xp,
          level: state.user.level,
          githubUsername: state.githubUser ? state.githubUser.username : null,
          githubAvatarUrl: state.githubUser ? state.githubUser.avatarUrl : null,
          githubConnected: state.githubUser ? state.githubUser.connected : false,
        };

        const targetAccount = updatedAccounts[index];
        const loadedUser: UserProfile = {
          name: targetAccount.name,
          avatar: targetAccount.avatar,
          xp: targetAccount.xp,
          level: targetAccount.level,
          streakDays: state.user.streakDays,
          lastActiveDate: state.user.lastActiveDate,
        };

        const loadedGithubUser = targetAccount.githubConnected ? {
          username: targetAccount.githubUsername || '',
          avatarUrl: targetAccount.githubAvatarUrl || '',
          connected: true,
          lastSync: new Date().toLocaleTimeString(),
          contributions: {},
          isSandbox: true,
        } : null;

        return {
          accounts: updatedAccounts,
          activeAccountIndex: index,
          user: loadedUser,
          githubUser: loadedGithubUser,
        };
      }),

      addNewAccount: (name, avatar) => set((state) => {
        const newAccount: UserAccount = {
          id: Math.random().toString(36).substr(2, 9),
          name: name || `Developer ${state.accounts.length + 1}`,
          avatar: avatar || '💻',
          xp: 0,
          level: 1,
          githubUsername: null,
          githubAvatarUrl: null,
          githubConnected: false,
        };
        return {
          accounts: [...state.accounts, newAccount]
        };
      }),

      removeAccount: (id) => set((state) => {
        if (state.accounts.length <= 1) return {};
        const activeAccount = state.accounts[state.activeAccountIndex];
        const nextAccounts = state.accounts.filter(a => a.id !== id);
        let nextIndex = nextAccounts.findIndex(a => a.id === activeAccount.id);
        if (nextIndex === -1) {
          nextIndex = 0;
        }
        
        // If we are deleting the active account, switch state user to the first remaining account
        const targetAccount = nextAccounts[nextIndex];
        const loadedUser: UserProfile = {
          name: targetAccount.name,
          avatar: targetAccount.avatar,
          xp: targetAccount.xp,
          level: targetAccount.level,
          streakDays: state.user.streakDays,
          lastActiveDate: state.user.lastActiveDate,
        };

        const loadedGithubUser = targetAccount.githubConnected ? {
          username: targetAccount.githubUsername || '',
          avatarUrl: targetAccount.githubAvatarUrl || '',
          connected: true,
          lastSync: new Date().toLocaleTimeString(),
          contributions: {},
          isSandbox: true,
        } : null;

        return {
          accounts: nextAccounts,
          activeAccountIndex: nextIndex,
          user: loadedUser,
          githubUser: loadedGithubUser,
        };
      }),
      
      setActiveTutorMode: (mode) => set({ activeTutorMode: mode }),

      addXp: (amount) => set((state) => {
        const newXp = state.user.xp + amount;
        const newLevel = Math.floor(newXp / 1000) + 1;
        const today = new Date().toISOString().split('T')[0];
        
        // Heatmap tracking
        const currentHeatmapVal = state.heatmap[today] || 0;
        const updatedHeatmap = { ...state.heatmap, [today]: currentHeatmapVal + amount };
        
        // Check for level achievements
        const updatedAchievements = [...state.achievements];
        if (newLevel > state.user.level) {
          const levelAchId = `level_${newLevel}`;
          if (!updatedAchievements.some(a => a.id === levelAchId)) {
            updatedAchievements.push({
              id: levelAchId,
              title: `Level ${newLevel} Reached!`,
              description: `You have successfully gathered ${newLevel * 1000} cumulative XP!`,
              icon: "⭐",
              unlockedAt: new Date().toISOString()
            });
          }
        }

        const updatedAccounts = [...state.accounts];
        if (updatedAccounts[state.activeAccountIndex]) {
          updatedAccounts[state.activeAccountIndex] = {
            ...updatedAccounts[state.activeAccountIndex],
            xp: newXp,
            level: newLevel,
          };
        }

        return {
          user: {
            ...state.user,
            xp: newXp,
            level: newLevel,
          },
          heatmap: updatedHeatmap,
          achievements: updatedAchievements,
          accounts: updatedAccounts,
        };
      }),

      incrementStreak: () => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const lastActive = state.user.lastActiveDate;
        
        let newStreak = state.user.streakDays;
        
        if (lastActive === "") {
          newStreak = 1;
        } else {
          const lastDateObj = new Date(lastActive);
          const todayDateObj = new Date(today);
          const diffTime = Math.abs(todayDateObj.getTime() - lastDateObj.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1; // reset streak
          }
        }

        // Streak achievement checks
        const updatedAchievements = [...state.achievements];
        if (newStreak >= 7 && !updatedAchievements.some(a => a.id === "streak_7")) {
          updatedAchievements.push({
            id: "streak_7",
            title: "Week on Fire!",
            description: "Maintain a flawless 7-day coding streak.",
            icon: "🔥",
            unlockedAt: new Date().toISOString()
          });
        }

        return {
          user: {
            ...state.user,
            streakDays: newStreak,
            lastActiveDate: today,
          },
          achievements: updatedAchievements,
        };
      }),

      unlockAchievement: (id, title, description, icon) => set((state) => {
        if (state.achievements.some((a) => a.id === id)) return {};
        return {
          achievements: [
            ...state.achievements,
            { id, title, description, icon, unlockedAt: new Date().toISOString() }
          ]
        };
      }),

      completeDsaQuestion: (questionId, topicId, xpReward) => {
        const currentCompleted = get().completedDsaQuestions;
        if (currentCompleted.includes(questionId)) return;
        
        set((state) => ({
          completedDsaQuestions: [...state.completedDsaQuestions, questionId]
        }));
        
        // Add XP reward
        get().addXp(xpReward);
        
        // Unlock next roadmap dependencies or achievement for completing a full topic
        const completedDsaLength = get().completedDsaQuestions.length;
        if (completedDsaLength === 1) {
          get().unlockAchievement("dsa_first", "First DSA Solved", "Take your very first step into algorithms.", "🚀");
        }
        
        // Add to Revision Queue automatically
        get().addToRevisionQueue(topicId, 'DSA');
      },

      completeLanguageLesson: (langId, lessonId, xpReward) => {
        const completedLessons = get().completedLanguageLessons;
        const langLessons = completedLessons[langId] || [];
        
        if (langLessons.includes(lessonId)) return;
        
        const updatedLessons = [...langLessons, lessonId];
        
        set((state) => ({
          completedLanguageLessons: {
            ...state.completedLanguageLessons,
            [langId]: updatedLessons
          }
        }));
        
        get().addXp(xpReward);
        
        if (updatedLessons.length === 1) {
          get().unlockAchievement(`lang_first_${langId}`, `${langId.toUpperCase()} Starter`, `Unlocked your first lesson in ${langId}.`, "📝");
        }

        get().addToRevisionQueue(`${langId}_${lessonId}`, 'LANGUAGE');
      },

      addTutorMessage: (mode, message) => set((state) => {
        const modeChats = state.tutorChats[mode] || [];
        const updatedChats = [
          ...modeChats,
          { ...message, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ];
        return {
          tutorChats: {
            ...state.tutorChats,
            [mode]: updatedChats
          }
        };
      }),

      clearTutorChat: (mode) => set((state) => ({
        tutorChats: {
          ...state.tutorChats,
          [mode]: []
        }
      })),

      addQuizResult: (result) => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const newResult: QuizResult = {
          ...result,
          id: Math.random().toString(36).substr(2, 9),
          date: today,
        };
        
        const updatedAchievements = [...state.achievements];
        if (result.score === result.maxScore && !updatedAchievements.some(a => a.id === "perfect_quiz")) {
          updatedAchievements.push({
            id: "perfect_quiz",
            title: "Einstein Precision",
            description: "Scored 100% on any topic quiz challenge.",
            icon: "🧠",
            unlockedAt: new Date().toISOString()
          });
        }

        setTimeout(() => get().addXp(result.xpEarned), 10);

        return {
          quizHistory: [newResult, ...state.quizHistory],
          achievements: updatedAchievements,
        };
      }),

      addMockInterviewResult: (result) => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const newResult: MockInterviewResult = {
          ...result,
          id: Math.random().toString(36).substr(2, 9),
          date: today,
        };
        
        const updatedAchievements = [...state.achievements];
        if (result.score >= 85 && !updatedAchievements.some(a => a.id === "faang_ready")) {
          updatedAchievements.push({
            id: "faang_ready",
            title: "FAANG Caliber",
            description: "Scored an elite grade of 85+ on a Mock Technical Interview.",
            icon: "💼",
            unlockedAt: new Date().toISOString()
          });
        }
        
        // Substantial XP for completing a mock interview
        const mockXp = Math.floor(result.score * 3);
        setTimeout(() => get().addXp(mockXp), 10);

        return {
          mockInterviews: [newResult, ...state.mockInterviews],
          achievements: updatedAchievements,
        };
      }),

      addToRevisionQueue: (topicId, type) => set((state) => {
        const queue = state.revisionQueue;
        const exists = queue.some(item => item.topicId === topicId && item.type === type);
        if (exists) return {};

        const newItem: RevisionItem = {
          id: Math.random().toString(36).substr(2, 9),
          topicId,
          type,
          nextReviewDate: new Date().toISOString(),
          easeFactor: 2.5,
          intervalDays: 1,
          repetitions: 0
        };

        return {
          revisionQueue: [...queue, newItem]
        };
      }),

      processRevisionItem: (itemId, rating) => set((state) => {
        // Simple SM-2 SuperMemo Algorithm implementation
        const updatedQueue = state.revisionQueue.map((item) => {
          if (item.id !== itemId) return item;
          
          let { easeFactor, intervalDays, repetitions } = item;
          
          if (rating >= 3) {
            if (repetitions === 0) {
              intervalDays = 1;
            } else if (repetitions === 1) {
              intervalDays = 6;
            } else {
              intervalDays = Math.ceil(intervalDays * easeFactor);
            }
            repetitions += 1;
          } else {
            repetitions = 0;
            intervalDays = 1;
          }

          // Adjust Ease Factor based on user performance feedback
          easeFactor = easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
          if (easeFactor < 1.3) easeFactor = 1.3;

          const nextReview = new Date();
          nextReview.setDate(nextReview.getDate() + intervalDays);

          return {
            ...item,
            easeFactor,
            intervalDays,
            repetitions,
            nextReviewDate: nextReview.toISOString()
          };
        });

        // Add a micro XP boost for studying cards
        setTimeout(() => get().addXp(25), 10);

        return {
          revisionQueue: updatedQueue
        };
      }),

      resetProgress: () => set({
        user: DEFAULT_PROFILE,
        heatmap: {},
        achievements: [],
        completedDsaQuestions: [],
        completedLanguageLessons: {},
        tutorChats: {},
        quizHistory: [],
        mockInterviews: [],
        revisionQueue: [],
      })
    }),
    {
      name: 'byteacademy-unified-store',
      skipHydration: false,
      partialize: (state) => {
        const { toasts, ...rest } = state;
        return rest;
      }
    }
  )
);
