'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useStore } from '@/store';
import { LANGUAGE_TRACKS } from '@/lib/data/languageData';

export default function LanguagesLobby() {
  const [mounted, setMounted] = useState(false);
  const completedLessons = useStore((state) => state.completedLanguageLessons);

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

  // Get track indicators
  const getTrackStats = (trackId: string) => {
    const track = LANGUAGE_TRACKS.find(t => t.id === trackId);
    if (!track) return { doneCount: 0, totalCount: 0, percent: 0 };
    
    const lessonsDone = completedLessons[trackId] || [];
    const doneCount = lessonsDone.length;
    const totalCount = track.lessons.length;
    const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
    
    return { doneCount, totalCount, percent };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 font-sans"
    >
      {/* Title Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter">Programming Language Tracks</h1>
          <p className="text-sm md:text-base text-zinc-400 mt-2 font-medium">Master syntax, OOP structures, async modules, and memory registers in independent tracks.</p>
        </div>
      </div>

      {/* Grid of Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {LANGUAGE_TRACKS.map((track) => {
          const { doneCount, totalCount, percent } = getTrackStats(track.id);
          const isStarted = doneCount > 0;
          const isFullyComplete = percent === 100 && totalCount > 0;

          // Language specific custom HSL glowing schemes
          const glowStyles: { [key: string]: string } = {
            python: 'group-hover:border-blue-500/40 from-blue-500/10 to-amber-500/10',
            javascript: 'group-hover:border-yellow-500/40 from-yellow-500/10 to-amber-500/10',
            typescript: 'group-hover:border-blue-600/40 from-blue-600/10 to-indigo-500/10',
            java: 'group-hover:border-red-500/40 from-red-500/10 to-orange-500/10',
            cpp: 'group-hover:border-indigo-500/40 from-indigo-500/10 to-purple-500/10',
            c: 'group-hover:border-zinc-500/40 from-zinc-500/10 to-slate-500/10',
            dart: 'group-hover:border-teal-500/40 from-teal-500/10 to-cyan-500/10',
          };

          const avatarLetters: { [key: string]: string } = {
            python: 'Py', javascript: 'JS', typescript: 'TS', java: 'Jv', cpp: 'C++', c: 'C', dart: 'Dt'
          };

          return (
            <motion.div
              key={track.id}
              whileHover={{ y: -4 }}
              className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6.5 shadow-xl flex flex-col justify-between h-64 relative overflow-hidden group transition-all duration-300"
            >
              {/* Custom ambient glowing backplate on hover */}
              <div className={`absolute -inset-px rounded-3xl bg-gradient-to-r ${glowStyles[track.id]} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

              <div className="relative z-10 space-y-4">
                {/* Header title */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-center font-black text-base font-mono text-zinc-100 group-hover:text-emerald-400 group-hover:scale-105 transition-all shadow-inner">
                      {avatarLetters[track.id]}
                    </div>
                    <div>
                      <h3 className="font-black text-zinc-200 text-base lg:text-lg group-hover:text-white leading-none">{track.title}</h3>
                      <span className="text-[10px] font-mono font-black uppercase tracking-wide bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850 mt-2 block w-fit">
                        {track.difficulty}
                      </span>
                    </div>
                  </div>

                  {isFullyComplete && (
                    <div className="p-1 rounded-full bg-emerald-950/40 border border-emerald-900 text-emerald-400 shadow-sm shrink-0">
                      <CheckCircle className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  )}
                </div>

                {/* Subtitle desc */}
                <p className="text-zinc-400 text-xs lg:text-sm line-clamp-3 leading-relaxed font-medium">
                  {track.description}
                </p>
              </div>

              {/* Footer stats and links */}
              <div className="relative z-10 pt-4 border-t border-zinc-900/60 flex items-center justify-between">
                <div className="space-y-1.5 w-3/5">
                  <div className="flex justify-between text-[10px] lg:text-xs font-mono font-bold text-zinc-500 mb-1">
                    <span>Lessons Complete</span>
                    <span className="font-extrabold text-zinc-300">{doneCount} / {totalCount}</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-950 border border-zinc-850 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/languages/${track.id}`}
                  className="px-6 py-2.5 bg-emerald-500 text-zinc-950 font-black rounded-xl text-xs lg:text-sm hover:bg-emerald-400 transition-colors shadow-[0_3px_15px_rgba(16,185,129,0.25)] cursor-pointer"
                >
                  {isStarted ? 'Resume' : 'Launch'}
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
