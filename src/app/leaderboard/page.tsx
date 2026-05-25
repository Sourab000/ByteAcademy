'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Zap, Flame, Star } from 'lucide-react';
import { useStore } from '@/store';

interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  isCurrentUser?: boolean;
}

export default function LeaderboardCenter() {
  const [mounted, setMounted] = useState(false);
  const user = useStore((state) => state.user);
  const achievements = useStore((state) => state.achievements);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Live competitive roster (merging current active user dynamically!)
  const rawLeaderboard: Omit<LeaderboardUser, 'rank'>[] = [
    { name: "StaffMaster", avatar: "💻", xp: 12500, level: 13, streak: 42 },
    { name: "AlgorithmGuru", avatar: "🧠", xp: 8900, level: 9, streak: 18 },
    { name: "BitSlinger", avatar: "👾", xp: 6200, level: 7, streak: 12 },
    { name: user.name, avatar: user.avatar, xp: user.xp, level: user.level, streak: user.streakDays, isCurrentUser: true },
    { name: "RecursionRabbit", avatar: "🦊", xp: 2100, level: 3, streak: 4 },
    { name: "BeginnerBot", avatar: "🤖", xp: 450, level: 1, streak: 1 }
  ];

  // Sort and assign ranks
  const sortedLeaderboard: LeaderboardUser[] = rawLeaderboard
    .sort((a, b) => b.xp - a.xp)
    .map((usr, idx) => ({ ...usr, rank: idx + 1 }));

  const weeklyChallenges = [
    { id: "wc1", title: "DSA Conqueror", desc: "Complete 3 distinct roadmap question submissions.", reward: 500, progress: 1, target: 3 },
    { id: "wc2", title: "Speech Perfect", desc: "Pass any Mock Interview round with a score of 80+.", reward: 600, progress: 0, target: 1 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 font-sans"
    >
      {/* Title Header Card */}
      <div className="border-b border-zinc-900 pb-5">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter">Leaderboards & Gamification</h1>
        <p className="text-sm md:text-base text-zinc-400 mt-2 font-medium">Compete with global coders, unlock rare badges, and tackle weekly challenges.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left columns: Global Rankings List */}
        <div className="lg:col-span-2 bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6.5 shadow-xl space-y-5 h-fit">
          <h2 className="text-base font-black text-zinc-200 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-450 animate-pulse" />
            Global Roster (Weekly)
          </h2>

          <div className="space-y-3">
            {sortedLeaderboard.map((usr) => (
              <motion.div
                key={usr.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4.5 rounded-2xl border flex items-center justify-between transition-all duration-200 hover:scale-[1.01] ${
                  usr.isCurrentUser
                    ? 'bg-emerald-950/20 border-emerald-500 text-white shadow-md'
                    : 'bg-zinc-950 border-zinc-900/60 text-zinc-400'
                }`}
              >
                {/* User Info and rank */}
                <div className="flex items-center gap-4.5">
                  <span className={`w-8 text-center text-sm font-black font-mono ${
                    usr.rank === 1 ? 'text-amber-400 text-base md:text-lg' :
                    usr.rank === 2 ? 'text-zinc-350' :
                    usr.rank === 3 ? 'text-amber-800' : 'text-zinc-650'
                  }`}>
                    #{usr.rank}
                  </span>

                  <div className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-805 flex items-center justify-center text-2xl shrink-0 shadow-inner select-none">
                    {usr.avatar}
                  </div>
                  
                  <div>
                    <h4 className="text-sm lg:text-base font-extrabold text-zinc-200 flex items-center gap-1.5 leading-none">
                      {usr.name}
                      {usr.isCurrentUser && (
                        <span className="text-[9px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900 text-emerald-400 font-mono font-bold uppercase tracking-wider">
                          YOU
                        </span>
                      )}
                    </h4>
                    <span className="text-xs text-zinc-500 font-mono font-semibold mt-1.5 block">Level {usr.level}</span>
                  </div>
                </div>

                {/* Score, streak stats */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5 text-xs lg:text-sm text-orange-500 font-mono font-black">
                    <Flame className="w-4 h-4 fill-orange-500/10" />
                    <span>{usr.streak}d</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-sm lg:text-base font-mono font-black text-emerald-400/90 text-right">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500/10" />
                    <span>{usr.xp} XP</span>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
        </div>

        {/* Right columns: Achievements Cabinet & Weekly challenges */}
        <div className="space-y-8 h-fit">
          {/* Weekly objectives */}
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-6.5 shadow-lg space-y-5">
            <h3 className="text-base font-black text-zinc-200 flex items-center gap-2">
              <Star className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
              Weekly Challenges
            </h3>

            <div className="space-y-4">
              {weeklyChallenges.map((wc) => (
                <div key={wc.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3.5 text-xs lg:text-sm transition-colors hover:border-zinc-800">
                  <div>
                    <h4 className="font-black text-zinc-250 flex items-center justify-between text-sm lg:text-base leading-none">
                      <span>{wc.title}</span>
                      <span className="text-[10px] lg:text-xs text-amber-500 font-mono font-black">+{wc.reward} XP</span>
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1.5 leading-normal font-semibold">{wc.desc}</p>
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] lg:text-xs font-mono font-bold text-zinc-500 mb-1">
                      <span>Completion Progress</span>
                      <span className="font-extrabold text-zinc-350">{wc.progress} / {wc.target}</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 border border-zinc-850 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.3)]" 
                        style={{ width: `${(wc.progress / wc.target) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievement shelf drawer */}
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-6.5 shadow-lg space-y-5">
            <h3 className="text-base font-black text-zinc-200 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              Achievements Box
            </h3>

            {achievements.length === 0 ? (
              <span className="text-xs text-zinc-500 font-medium italic block leading-relaxed">No badges unlocked yet. Solve DSA and languages to claim credentials.</span>
            ) : (
              <div className="flex flex-wrap gap-3">
                {achievements.map((ach) => (
                  <div 
                    key={ach.id} 
                    className="p-3 bg-zinc-950 border border-zinc-850 rounded-2xl flex items-center gap-2.5 hover:border-emerald-500/30 transition-all select-none shadow-sm cursor-help"
                    title={ach.description}
                  >
                    <span className="text-2xl">{ach.icon}</span>
                    <span className="text-xs font-black text-zinc-300 pr-1.5">{ach.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
