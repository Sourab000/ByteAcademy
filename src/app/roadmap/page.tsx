'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { DSA_TOPICS } from '@/lib/data/dsaData';
import { DsaRoadmap } from '@/components/roadmap/DsaRoadmap';

export default function RoadmapDashboard() {
  const [mounted, setMounted] = useState(false);
  const completedQuestions = useStore((state) => state.completedDsaQuestions);

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

  // Calculate unlocked topics dynamically based on prerequisites
  // A topic is unlocked if it has no prerequisites, or if all prerequisites are completed
  const unlockedTopics = DSA_TOPICS.filter((topic) => {
    if (topic.prerequisites.length === 0) return true;
    return topic.prerequisites.every((prereqId) => {
      // Find the prerequisite topic questions and ensure they are all solved
      const prereqTopic = DSA_TOPICS.find((t) => t.id === prereqId);
      if (!prereqTopic) return false;
      return prereqTopic.questions.every((q) => completedQuestions.includes(q.id));
    });
  }).map((topic) => topic.id);

  // Compute platform metrics
  const totalQuestionsCount = DSA_TOPICS.reduce((sum, t) => sum + t.questions.length, 0);
  const completedQuestionsCount = completedQuestions.length;
  const overallPercent = totalQuestionsCount > 0 ? Math.round((completedQuestionsCount / totalQuestionsCount) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Title Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">DSA Interactive Skill Tree</h1>
          <p className="text-sm md:text-base text-zinc-400 mt-2 font-medium">Lock and unlock topics as you master algorithms. Fully sequential curriculums.</p>
        </div>

        {/* Dynamic score summary */}
        <div className="flex items-center gap-4 bg-zinc-900/30 border border-zinc-850 px-6 py-3 rounded-2xl shrink-0">
          <div className="text-right">
            <span className="text-xs text-zinc-500 block uppercase font-mono tracking-wider font-bold">Overall Progress</span>
            <span className="text-base lg:text-lg font-black text-zinc-200 block mt-1">
              {completedQuestionsCount} / {totalQuestionsCount} Solved
            </span>
          </div>
          
          <div className="w-14 h-14 rounded-2xl bg-emerald-950/40 border border-emerald-900/30 flex items-center justify-center text-emerald-400 font-black text-base select-none">
            {overallPercent}%
          </div>
        </div>
      </div>

      {/* Main tree renderer */}
      <DsaRoadmap 
        topics={DSA_TOPICS} 
        completedQuestions={completedQuestions} 
        unlockedTopics={unlockedTopics} 
      />
    </motion.div>
  );
}
