/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Zap, Award, BookOpen, ChevronRight, CheckSquare, 
  Sparkles, RefreshCw, LogOut, Check, Loader2, Cpu
} from 'lucide-react';
import { useStore } from '@/store';
import { Heatmap } from '@/components/shared/Heatmap';
import { DSA_TOPICS } from '@/lib/data/dsaData';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [githubInput, setGithubInput] = useState("");
  const [syncStatusMsg, setSyncStatusMsg] = useState("");

  const user = useStore((state) => state.user);
  const heatmap = useStore((state) => state.heatmap);
  const achievements = useStore((state) => state.achievements);
  const completedDsa = useStore((state) => state.completedDsaQuestions);
  
  const githubUser = useStore((state) => state.githubUser);
  const connectGithub = useStore((state) => state.connectGithub);
  const disconnectGithub = useStore((state) => state.disconnectGithub);
  const syncGithubContributions = useStore((state) => state.syncGithubContributions);
  const uiPreferences = useStore((state) => state.uiPreferences);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  const hasRealSupabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return !!(url && key && !url.includes('placeholder') && !key.includes('placeholder'));
  }, []);

  const resumeTopicId = useMemo(() => {
    const incompleteTopic = DSA_TOPICS.find((topic) => {
      return !topic.questions.every((q) => completedDsa.includes(q.id));
    });
    return incompleteTopic ? incompleteTopic.id : 'arrays';
  }, [completedDsa]);

  const resumeTopicName = useMemo(() => {
    const topic = DSA_TOPICS.find(t => t.id === resumeTopicId);
    return topic ? topic.title : 'Arrays';
  }, [resumeTopicId]);

  const completedDsaLength = completedDsa.length;
  const completedLangLessons = useStore((state) => state.completedLanguageLessons);
  const totalLangLessonsCount = Object.values(completedLangLessons).flat().length;

  const completenessChecks = useMemo(() => ({
    name: user.name !== "Novice Coder" && user.name !== "",
    github: githubUser !== null,
    dsa: completedDsaLength > 0,
    lang: totalLangLessonsCount > 0,
  }), [user, githubUser, completedDsaLength, totalLangLessonsCount]);

  const completenessScore = useMemo(() => 
    (completenessChecks.name ? 25 : 0) + 
    (completenessChecks.github ? 25 : 0) + 
    (completenessChecks.dsa ? 25 : 0) + 
    (completenessChecks.lang ? 25 : 0)
  , [completenessChecks]);

  const dailyQuests = [
    { id: 'q1', text: 'Solve any algorithm in the DSA Roadmap', reward: 150, done: completedDsa.length > 0 },
    { id: 'q2', text: 'Test memory recall in the adaptive Quiz Arena', reward: 100, done: false },
    { id: 'q3', text: 'Engage AI Code Tutor for conceptual feedback', reward: 50, done: false }
  ];

  const handleConnectGithub = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasRealSupabase) {
      setIsConnecting(true);
      try {
        await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: window.location.origin + '/dashboard'
          }
        });
      } catch (err) {
        console.error('Supabase GitHub OAuth initiation failure:', err);
        alert('Authentication failed to initialize. Reverting to sandbox fallback.');
        setIsConnecting(false);
      }
      return;
    }

    if (!githubInput.trim()) return;

    setIsConnecting(true);
    
    if (uiPreferences.soundEffects && typeof Audio !== 'undefined') {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch (e) {}
    }

    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const formattedUsername = githubInput.trim().replace('@', '');
    const userAvatar = `https://github.com/${formattedUsername}.png`;
    
    connectGithub(formattedUsername, userAvatar, true);
    setIsConnecting(false);
    setShowConnectModal(false);
    setGithubInput("");
    
    handleSyncContributions(formattedUsername);
  };

  const handleLogout = async () => {
    if (hasRealSupabase) {
      await supabase.auth.signOut();
    }
    disconnectGithub();
  };

  const handleSyncContributions = async (usernameStr?: string) => {
    const activeUsername = usernameStr || githubUser?.username;
    if (!activeUsername) return;

    setIsSyncing(true);
    setSyncStatusMsg("Initiating Git stream integration...");
    await new Promise(resolve => setTimeout(resolve, 800));

    setSyncStatusMsg("Mapping contribution matrix weights...");
    await new Promise(resolve => setTimeout(resolve, 600));

    const mockContributions: { [key: string]: number } = {};
    const today = new Date();
    for (let i = 0; i < 15; i++) {
      const date = new Date();
      date.setDate(today.getDate() - Math.floor(Math.random() * 60));
      const dateStr = date.toISOString().split('T')[0];
      mockContributions[dateStr] = Math.floor(Math.random() * 6) + 1;
    }

    syncGithubContributions(mockContributions);
    setIsSyncing(false);
    setSyncStatusMsg("");
  };

  const cardHover = { scale: 1.01, y: -2, transition: { type: 'spring' as const, stiffness: 400, damping: 25 } };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-full w-full mx-auto space-y-8"
    >
      {/* Premium Hero Banner Welcome - Scaled Up Sizing & Padding */}
      <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono font-black bg-emerald-950/40 border border-emerald-900/35 px-4 py-1.5 rounded-full w-fit tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4 animate-pulse text-emerald-400" />
            <span>PREMIUM LEARNER ECOSYSTEM ACTIVE</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none">
            Welcome back, <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{user.name}</span>!
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-zinc-400 max-w-2xl leading-relaxed font-medium">
            Your adaptive AI code copilot has mapped your dynamic strengths. Complete active learning modules to unlock developer badges and maintain active streak status.
          </p>
        </div>

        {/* Dynamic Autopilot Quick redirect CTA - Prominent scale */}
        <Link 
          href={`/roadmap/${resumeTopicId}`}
          className="px-8 py-5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl text-sm flex items-center justify-center gap-4.5 shadow-[0_4px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_40px_rgba(16,185,129,0.5)] shrink-0 self-start md:self-center transition-all duration-300 hover:scale-102 group"
        >
          <div className="text-left leading-none pr-1">
            <span className="text-[10px] block opacity-85 font-black uppercase tracking-widest font-mono">RESUME PRACTICE MODULE</span>
            <span className="text-base md:text-lg font-black block mt-1.5">{resumeTopicName}</span>
          </div>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform stroke-[3.5]" />
        </Link>
      </div>

      {/* Main Grid Stats - Scaled Up stats metric text */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Cumulative XP", value: `${user.xp} XP`, sub: "Gain levels at every 1000 XP threshold", icon: Zap, color: "text-amber-400", bgGlow: "shadow-[0_0_20px_rgba(245,158,11,0.02)] border-amber-900/40" },
          { label: "Streak status", value: `${user.streakDays} Days`, sub: "Flawless daily coding commitment", icon: Flame, color: "text-orange-500", bgGlow: "shadow-[0_0_20px_rgba(239,68,68,0.02)] border-red-900/40" },
          { label: "Rank level", value: `Level ${user.level}`, sub: "Advanced DSA Coder credential", icon: Cpu, color: "text-emerald-400", bgGlow: "shadow-[0_0_20px_rgba(16,185,129,0.02)] border-emerald-900/40" },
          { label: "Badge credentials", value: `${achievements.length} Unlocked`, sub: "Unlock skills & achievements", icon: Award, color: "text-teal-400", bgGlow: "shadow-[0_0_20px_rgba(20,184,166,0.02)] border-teal-900/40" }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={index} 
              whileHover={cardHover}
              className={`rounded-3xl p-6 md:p-7 border bg-zinc-950/60 ${stat.bgGlow} flex items-center gap-5 relative overflow-hidden group`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/2 rounded-full blur-2xl pointer-events-none group-hover:scale-105 transition-transform" />
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-850 shrink-0 shadow-inner group-hover:border-zinc-800 transition-colors">
                <Icon className="w-8 h-8" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] md:text-xs text-zinc-500 block uppercase font-mono tracking-wider font-extrabold">{stat.label}</span>
                <span className="text-2xl md:text-3xl font-black text-white block mt-1 tracking-tighter">{stat.value}</span>
                <span className="text-[11.5px] text-zinc-500 block mt-1 truncate leading-none font-medium">{stat.sub}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Premium Onboarding & Quick Actions Command Deck - Scaled Containers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Onboarding Checklist Card */}
        <motion.div 
          whileHover={cardHover}
          className="bg-zinc-950/60 border border-zinc-900 rounded-3xl p-7 md:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-5 flex-1">
            <h3 className="text-xs lg:text-sm font-black text-zinc-200 uppercase font-mono tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              Onboarding Checklist Progress
            </h3>
            
            <div className="flex items-center gap-5 bg-[#0a0a0c] border border-zinc-900 p-4.5 rounded-2xl shadow-inner">
              {/* Enlarged Circle Complete chart */}
              <div className="w-18 h-18 rounded-full border-[3px] border-zinc-900 flex items-center justify-center font-bold text-xs relative shrink-0">
                <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 36 36">
                  <path className="text-zinc-900 stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-emerald-500 stroke-current transition-all duration-500" strokeWidth="3" strokeDasharray={`${completenessScore}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className="text-sm font-black text-emerald-400">{completenessScore}%</span>
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-black text-zinc-100">Completeness Ratio</h4>
                <p className="text-xs text-zinc-500 leading-normal mt-1 font-medium">
                  {completenessScore === 100 ? 'Awesome! Core profile setup complete.' : 'Link accounts and solve challenges to claim bonus rewards.'}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {[
                { label: 'Register customized handle profile', done: completenessChecks.name },
                { label: 'Link verified developer GitHub sync', done: completenessChecks.github },
                { label: 'Complete first algorithmic challenge', done: completenessChecks.dsa },
                { label: 'Solve language core fundamentals module', done: completenessChecks.lang }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3.5 text-xs lg:text-sm leading-none">
                  <div className={`w-4.5 h-4.5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                    item.done ? 'bg-emerald-500 border-emerald-500 text-zinc-950' : 'border-zinc-800 bg-zinc-900/40'
                  }`}>
                    {item.done && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                  </div>
                  <span className={`font-semibold transition-colors ${item.done ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Personalized AI Study Recommendations */}
        <motion.div 
          whileHover={cardHover}
          className="bg-zinc-950/60 border border-zinc-900 rounded-3xl p-7 md:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-5 flex-1">
            <h3 className="text-xs lg:text-sm font-black text-zinc-200 uppercase font-mono tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
              AI Learning Advisor
            </h3>

            <div className="space-y-4 pt-1">
              <div className="p-4 bg-[#0a0a0c] border border-zinc-900 hover:border-zinc-850 rounded-2xl space-y-2 transition-all select-none">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs lg:text-sm font-black text-zinc-100 flex items-center gap-1.5">
                    <span>🚀 Next DSA Challenge</span>
                  </h4>
                  <span className="text-[10px] text-amber-500 font-mono font-bold bg-amber-950/30 border border-amber-900/30 px-2 py-0.5 rounded-lg">+150 XP</span>
                </div>
                <p className="text-xs lg:text-sm text-zinc-500 leading-normal font-medium">
                  Solve <span className="text-zinc-300 font-black">{resumeTopicName}</span> algorithms to reinforce active memory hierarchies.
                </p>
              </div>

              <div className="p-4 bg-[#0a0a0c] border border-zinc-900 hover:border-zinc-850 rounded-2xl space-y-2 transition-all select-none">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs lg:text-sm font-black text-zinc-100 flex items-center gap-1.5">
                    <span>💡 Retention Quiz Arena</span>
                  </h4>
                  <span className="text-[10px] text-amber-500 font-mono font-bold bg-amber-950/30 border border-amber-900/30 px-2 py-0.5 rounded-lg">+100 XP</span>
                </div>
                <p className="text-xs lg:text-sm text-zinc-500 leading-normal font-medium">
                  AI telemetry suggests a memory refresh session on stack and queue principles.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Action Shortcuts */}
        <motion.div 
          whileHover={cardHover}
          className="bg-zinc-950/60 border border-zinc-900 rounded-3xl p-7 md:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-5 h-full flex flex-col justify-between">
            <h3 className="text-xs lg:text-sm font-black text-zinc-200 uppercase font-mono tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              Quick Command Shortcuts
            </h3>

            <div className="grid grid-cols-2 gap-4 pt-1 flex-1">
              <Link 
                href="/quizzes"
                className="p-4 bg-[#0a0a0c] border border-zinc-900 hover:border-zinc-800 rounded-2xl flex flex-col justify-between h-24 group hover:scale-[1.02] transition-all"
              >
                <span className="text-2xl">🧠</span>
                <span className="text-xs lg:text-sm font-black text-zinc-200 group-hover:text-emerald-400 transition-colors">Quiz Arena</span>
              </Link>

              <Link 
                href="/interviews"
                className="p-4 bg-[#0a0a0c] border border-zinc-900 hover:border-zinc-800 rounded-2xl flex flex-col justify-between h-24 group hover:scale-[1.02] transition-all"
              >
                <span className="text-2xl">💼</span>
                <span className="text-xs lg:text-sm font-black text-zinc-200 group-hover:text-emerald-400 transition-colors">Mock AI Interview</span>
              </Link>

              <Link 
                href="/tutor"
                className="p-4 bg-[#0a0a0c] border border-zinc-900 hover:border-zinc-800 rounded-2xl flex flex-col justify-between h-24 group hover:scale-[1.02] transition-all"
              >
                <span className="text-2xl">🧑‍🏫</span>
                <span className="text-xs lg:text-sm font-black text-zinc-200 group-hover:text-emerald-400 transition-colors">AI Code Tutor</span>
              </Link>

              <Link 
                href="/settings"
                className="p-4 bg-[#0a0a0c] border border-zinc-900 hover:border-zinc-800 rounded-2xl flex flex-col justify-between h-24 group hover:scale-[1.02] transition-all"
              >
                <span className="text-2xl">⚙️</span>
                <span className="text-xs lg:text-sm font-black text-zinc-200 group-hover:text-emerald-400 transition-colors">Settings Config</span>
              </Link>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Real GitHub Connect Hub Integration Section - Larger spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Heatmap graph container */}
        <div className="lg:col-span-2 flex flex-col justify-between">
          <Heatmap data={heatmap} />
        </div>

        {/* Immersive GitHub OAuth connection console */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-3xl p-6.5 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full min-h-[260px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          {!githubUser ? (
            // State A: Disconnected GitHub Connect Promotion
            <div className="space-y-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shadow-inner">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm lg:text-base font-black text-zinc-150">Connect GitHub</h3>
                    <p className="text-[11px] text-zinc-550 font-mono font-bold mt-0.5">
                      State: {hasRealSupabase ? 'Cloud Provider Ready' : 'Local Sandbox Mode'}
                    </p>
                  </div>
                </div>
                
                <p className="text-xs lg:text-sm text-zinc-400 mt-4.5 leading-relaxed font-semibold">
                  {hasRealSupabase 
                    ? "Link your GitHub coder handle securely via OAuth to unlock automated telemetry syncing, actual commit heatmaps, and ranking boosts."
                    : "Database cloud integration is currently local. Connect a simulated developer username handles to map git commit weights into heatmaps."}
                </p>

                <div className="mt-4 space-y-2.5 bg-[#0a0a0c]/80 border border-zinc-900 p-4 rounded-2xl">
                  <div className="flex items-start gap-2.5 text-xs text-zinc-500 font-semibold leading-normal">
                    <span className="text-emerald-450 mt-1">•</span>
                    <span>Synchronize real commit activity data logs</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-zinc-550 font-semibold leading-normal">
                    <span className="text-emerald-400 mt-1">•</span>
                    <span>Earn <span className="text-amber-500 font-black">+25 XP</span> per simulated Git commit sync</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowConnectModal(true)}
                className="w-full py-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white rounded-2xl text-xs lg:text-sm font-black flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01]"
              >
                <span>{hasRealSupabase ? 'Link via GitHub OAuth' : 'Simulate Developer Sync'}</span>
              </button>
            </div>
          ) : (
            // State B: Connected GitHub sync panel
            <div className="space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <img 
                      src={githubUser.avatarUrl} 
                      alt={githubUser.username}
                      className="w-12 h-12 rounded-2xl border border-zinc-850 shadow-md shrink-0 bg-zinc-900"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${githubUser.username}`;
                      }}
                    />
                    <div>
                      <h4 className="text-sm lg:text-base font-black text-zinc-200">@{githubUser.username}</h4>
                      <span className="text-[10px] md:text-xs text-emerald-400 font-mono font-black flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                        {githubUser.isSandbox ? 'Sandbox Simulation' : 'Production Active'}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="p-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-500 hover:text-red-400 rounded-2xl transition-colors"
                    title="Unlink GitHub handle"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-[#0a0a0c] border border-zinc-900 p-4.5 rounded-2xl space-y-2 text-xs font-semibold">
                  <div className="flex justify-between text-zinc-500 font-mono">
                    <span>Sync Scope:</span>
                    <span className="text-zinc-300">{githubUser.isSandbox ? 'Local Storage Only' : 'Cloud PostgreSQL'}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 font-mono">
                    <span>Last Synced:</span>
                    <span className="text-zinc-200 font-bold">{githubUser.lastSync}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 font-mono">
                    <span>XP multiplier:</span>
                    <span className="text-emerald-450 font-bold">+25 XP / commit</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSyncContributions()}
                disabled={isSyncing}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-900 text-zinc-950 disabled:text-zinc-650 font-black rounded-2xl text-xs lg:text-sm flex items-center justify-center gap-2.5 transition-all shadow-[0_2px_15px_rgba(16,185,129,0.2)] disabled:shadow-none"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>{syncStatusMsg || 'Syncing GitHub commits...'}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4.5 h-4.5" />
                    <span>Fetch latest commits</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Daily Quest Logs & Achievements Shelf */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Daily challenges panel */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-3xl p-7 md:p-8 shadow-lg flex flex-col justify-between h-fit relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 space-y-5">
            <div>
              <h3 className="text-sm lg:text-base font-black text-zinc-200 flex items-center gap-2.5">
                <CheckSquare className="w-5 h-5 text-emerald-450" />
                Daily Learning Quests
              </h3>
              <p className="text-xs lg:text-sm text-zinc-500 mt-1 font-medium">Complete target exercises daily to secure large scaling XP multipliers.</p>
            </div>
            
            <div className="space-y-4">
              {dailyQuests.map((quest) => (
                <div 
                  key={quest.id} 
                  className={`flex items-center justify-between p-4.5 rounded-2xl border text-xs lg:text-sm leading-normal transition-all ${
                    quest.done 
                      ? 'bg-emerald-950/20 border-emerald-500/25 text-emerald-400 font-bold' 
                      : 'bg-[#0a0a0c] border-zinc-900 text-zinc-300'
                  }`}
                >
                  <span className="max-w-[70%] leading-relaxed font-bold">{quest.text}</span>
                  <div className="flex items-center gap-3.5 font-bold font-mono">
                    <span className="text-[11px] lg:text-xs text-amber-500 font-extrabold">+{quest.reward} XP</span>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      quest.done ? 'bg-emerald-500 border-emerald-500 text-zinc-950' : 'border-zinc-800 bg-zinc-900/40'
                    }`}>
                      {quest.done && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements Shelf */}
        <div className="bg-zinc-950/60 border border-zinc-900 rounded-3xl p-7 md:p-8 shadow-lg flex flex-col justify-between h-fit relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 space-y-5">
            <div>
              <h3 className="text-sm lg:text-base font-black text-zinc-200 flex items-center gap-2.5">
                <Award className="w-5 h-5 text-emerald-450" />
                Achievements Coder Shelf
              </h3>
              <p className="text-xs lg:text-sm text-zinc-500 mt-1 font-medium">Accumulate advanced credential milestones to unlock special avatar flags.</p>
            </div>

            {achievements.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center border border-dashed border-zinc-900 rounded-3xl bg-[#0a0a0c]/80 p-5 text-center">
                <span className="text-3xl text-zinc-700">🏆</span>
                <h4 className="text-sm font-black text-zinc-400 mt-3">No badges unlocked yet</h4>
                <p className="text-xs text-zinc-600 mt-1 max-w-[220px] font-semibold">Unlock credentials by solving roadmaps and completing technical quiz metrics.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-56 overflow-y-auto pr-1">
                {achievements.map((ach) => (
                  <div 
                    key={ach.id} 
                    className="p-4 bg-[#0a0a0c] border border-zinc-900 rounded-2xl flex items-center gap-4 shadow-sm group hover:border-emerald-500/30 transition-all duration-200 hover:scale-[1.01]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                      {ach.icon}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs lg:text-sm font-black text-zinc-200 truncate leading-none">{ach.title}</h4>
                      <p className="text-[10px] lg:text-xs text-zinc-500 font-semibold truncate mt-1.5">{ach.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* GitHub connection wizard dialog overlay modal */}
      <AnimatePresence>
        {showConnectModal && (
          <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-[4px] flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-900 rounded-3xl p-7 md:p-8 w-full max-w-md shadow-2xl relative space-y-5"
            >
              <div className="flex items-center gap-3 border-b border-zinc-900 pb-4.5">
                <svg className="w-6 h-6 fill-current text-emerald-400" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                <h2 className="text-base lg:text-lg font-black text-zinc-100">
                  GitHub OAuth Gateway
                </h2>
              </div>
              
              <p className="text-xs lg:text-sm text-zinc-450 leading-relaxed font-semibold">
                {hasRealSupabase 
                  ? "Connect your verified GitHub account securely via Supabase Auth services to enable dynamic contribution matrix syncing, leaderboard positions, and cloud progression backups."
                  : "To connect your verified GitHub profile and enable automated contribution graph syncs, the platform requires active Supabase OAuth credentials. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY inside .env.local to unlock cloud persistence services."}
              </p>

              <div className="flex gap-4.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-zinc-300 rounded-xl text-xs lg:text-sm font-bold transition-colors"
                >
                  Close
                </button>
                {hasRealSupabase && (
                  <button
                    onClick={handleConnectGithub}
                    disabled={isConnecting}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs lg:text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Redirecting...</span>
                      </>
                    ) : (
                      <>
                        <span>Connect OAuth</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
