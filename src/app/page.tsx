'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Shield, Sparkles, Code2, ArrowRight } from 'lucide-react';
import { useStore } from '@/store';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const updateProfile = useStore((state) => state.updateProfile);
  
  const [name, setName] = useState(user.name === "Novice Coder" ? "" : user.name);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || '🤖');
  const [step, setStep] = useState(user.name === "Novice Coder" ? 'welcome' : 'returning');
  const [hasRealSupabase, setHasRealSupabase] = useState(false);

  const avatars = ['🤖', '💻', '🦊', '⚡', '🧠', '🧙‍♂️', '👾', '🚀'];

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    setHasRealSupabase(!!(url && key && !url.includes('placeholder') && !key.includes('placeholder')));
  }, []);

  const handleStart = () => {
    if (step === 'welcome') {
      setStep('profile');
    } else {
      // Save profile updates to global Zustand store
      updateProfile(name.trim() || 'Hero Coder', selectedAvatar);
      router.push('/dashboard');
    }
  };

  const handleGithubSignIn = async () => {
    if (!hasRealSupabase) {
      alert("Supabase environment keys are not configured yet! Running in simulated sandbox mode.");
      useStore.getState().connectGithub("Sandbox Coder", "⚡", true);
      router.push('/dashboard');
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) {
      alert(`GitHub OAuth sign-in error: ${error.message}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  } as const;

  return (
    <div className="min-h-screen bg-[#040405] text-zinc-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Premium background radial effects */}
      <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vh] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[45vw] h-[45vh] bg-teal-500/5 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Decorative floating grid backdrops */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e0a_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full text-center relative z-10 flex flex-col items-center"
      >
        {/* Glowing ByteAcademy Tagline */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-2.5 px-5 py-2 bg-emerald-950/40 border border-emerald-900/30 rounded-full mb-6"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs lg:text-sm font-bold text-emerald-400 font-mono tracking-wider uppercase">
            The Elite AI-Powered Coding Academy
          </span>
        </motion.div>

        {step === 'welcome' && (
          <>
            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl font-black tracking-tight leading-none bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent"
            >
              Master Coding.<br/>Build the Future.
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-base md:text-lg lg:text-xl text-zinc-400 mt-8 max-w-2xl leading-relaxed"
            >
              Accelerate your software engineering career with visual DSA roadmaps, interactive language tracks, smart adaptive quizzes, and high-pressure FAANG AI Mock Interviews.
            </motion.p>

            {/* Core Feature bullet points */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4.5 w-full max-w-2xl mt-10"
            >
              {[
                { title: "Visual DSA Tree", desc: "Interactive roadmaps", icon: Code2 },
                { title: "AI Grill-Me Mode", desc: "FAANG style tutoring", icon: Zap },
                { title: "SM-2 Revision", desc: "Forgetting curve locks", icon: Shield }
              ].map((feat, index) => {
                const Icon = feat.icon;
                return (
                  <div key={index} className="bg-zinc-900/40 border border-zinc-900/80 rounded-2xl p-5 text-left transition-colors duration-200 hover:border-zinc-800">
                    <Icon className="w-5 h-5 text-emerald-450 mb-2" />
                    <h4 className="text-sm lg:text-base font-extrabold text-zinc-150">{feat.title}</h4>
                    <p className="text-xs lg:text-sm text-zinc-500 mt-1.5 leading-normal">{feat.desc}</p>
                  </div>
                );
              })}
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="mt-12 flex flex-col sm:flex-row gap-4.5 items-center justify-center w-full max-w-lg"
            >
              <button
                onClick={handleStart}
                className="w-full sm:flex-1 py-4.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl flex items-center justify-center gap-2 group transition-all duration-300 shadow-[0_4px_25px_rgba(16,185,129,0.3)] text-base cursor-pointer"
              >
                <span>Initialize Sandbox</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
              </button>

              <button
                onClick={handleGithubSignIn}
                className="w-full sm:flex-1 py-4.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-100 font-extrabold rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg text-base cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                <span>{hasRealSupabase ? 'Sign in with GitHub' : 'Simulate GitHub'}</span>
              </button>
            </motion.div>
          </>
        )}

        {step === 'profile' && (
          <motion.div 
            variants={containerVariants}
            className="w-full max-w-lg bg-zinc-900/40 backdrop-blur-md border border-zinc-900 rounded-3xl p-8 md:p-10 text-left shadow-2xl"
          >
            <h2 className="text-2xl lg:text-3xl font-black text-zinc-100 mb-1.5">Create Your Profile</h2>
            <p className="text-sm lg:text-base text-zinc-400 mb-8 font-medium">Choose your coder handle and select an avatar bot.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-xs uppercase font-mono font-bold tracking-wider text-zinc-350 mb-2.5">
                  Coder Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. NeoCoder"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono font-bold tracking-wider text-zinc-350 mb-2.5">
                  Select Avatar
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {avatars.map((av) => (
                    <button
                      key={av}
                      onClick={() => setSelectedAvatar(av)}
                      className={`h-14 rounded-2xl flex items-center justify-center text-3xl border transition-all cursor-pointer ${
                        selectedAvatar === av
                          ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                          : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:bg-zinc-900'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStart}
                className="w-full mt-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold rounded-2xl flex items-center justify-center gap-2 group transition-all shadow-[0_2px_15px_rgba(16,185,129,0.2)] text-sm md:text-base cursor-pointer"
              >
                <span>Initialize Coder Instance</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'returning' && (
          <motion.div 
            variants={containerVariants}
            className="w-full max-w-md bg-zinc-900/40 backdrop-blur-sm border border-zinc-900 p-8 rounded-3xl flex flex-col items-center shadow-xl"
          >
            <div className="w-20 h-20 rounded-2xl bg-zinc-950 border border-zinc-850 flex items-center justify-center text-5xl mb-6 shadow-inner">
              {user.avatar}
            </div>
            <h2 className="text-xl md:text-2xl font-black text-zinc-100">Welcome Back, {user.name}!</h2>
            <p className="text-xs lg:text-sm text-zinc-450 mt-2 font-mono font-semibold">Instance Status: Ready (Level {user.level})</p>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full mt-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl flex items-center justify-center gap-2 group transition-all text-sm md:text-base shadow-[0_2px_12px_rgba(16,185,129,0.2)] cursor-pointer"
            >
              <span>Resume Learning Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform stroke-[2.5]" />
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
