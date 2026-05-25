import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Unlock, CheckCircle2, Zap, Clock, ChevronRight } from 'lucide-react';
import { DsaTopic } from '@/lib/data/dsaData';

interface DsaRoadmapProps {
  topics: DsaTopic[];
  completedQuestions: string[];
  unlockedTopics: string[];
}

export const DsaRoadmap: React.FC<DsaRoadmapProps> = ({ topics, completedQuestions, unlockedTopics }) => {
  
  const roadmapStages = [
    {
      title: "Data Structure Foundations",
      subtitle: "Establish contiguous registers and basic pointer movements",
      topics: ["arrays", "strings", "twopointer"]
    },
    {
      title: "Complexity & Buffers",
      subtitle: "Explore key hashing tables, bracket lifos, and queues",
      topics: ["slidingwindow", "hashmaps", "stack", "queue"]
    },
    {
      title: "Linked Nodes & Trees",
      subtitle: "Implement reference structures and binary searching indices",
      topics: ["linkedlist", "trees", "bst", "heaps"]
    },
    {
      title: "Advanced Graphs & Recursions",
      subtitle: "Unlock exponential searching and state caching checks",
      topics: ["graphs", "recursion", "backtracking", "greedy", "dp", "bitmanipulation"]
    }
  ];

  const getTopicStats = (topic: DsaTopic) => {
    const totalQ = topic.questions.length;
    const completedQ = topic.questions.filter(q => completedQuestions.includes(q.id)).length;
    const percent = totalQ > 0 ? Math.round((completedQ / totalQ) * 100) : 0;
    return { totalQ, percent };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  } as const;

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20
      }
    }
  } as const;

  return (
    <div className="w-full relative py-8 space-y-20 font-sans">
      {roadmapStages.map((stage, stageIdx) => (
        <div key={stageIdx} className="space-y-8 relative">
          
          {/* Glowing vertical connector lines between phases (Desktop only) */}
          {stageIdx < roadmapStages.length - 1 && (
            <div className="absolute left-[44px] bottom-[-80px] top-[100px] w-0.5 bg-gradient-to-b from-emerald-500/40 via-emerald-500/10 to-transparent z-0 hidden md:block" />
          )}

          {/* Premium Stage Title Header - Enlarged Typography */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: stageIdx * 0.1 }}
            className="bg-zinc-900/20 border border-zinc-900/60 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-500" />
            <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white flex items-center gap-4.5 leading-none">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-950 text-emerald-450 border border-emerald-900/55 text-sm font-mono font-extrabold shadow-inner">
                0{stageIdx + 1}
              </span>
              {stage.title}
            </h2>
            <p className="text-sm md:text-base text-zinc-400 mt-2.5 max-w-2xl leading-relaxed font-semibold">{stage.subtitle}</p>
          </motion.div>

          {/* SVG Connector Tree Workspace - Grid scaled */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 z-10"
          >
            {stage.topics.map((topicId) => {
              const topic = topics.find(t => t.id === topicId);
              if (!topic) return null;

              const isUnlocked = unlockedTopics.includes(topic.id) || topic.prerequisites.length === 0;
              const { totalQ, percent } = getTopicStats(topic);
              const isMastered = percent === 100 && totalQ > 0;

              return (
                <motion.div 
                  key={topic.id}
                  variants={cardVariants}
                  whileHover={isUnlocked ? { 
                    y: -6, 
                    scale: 1.02,
                    boxShadow: "0 12px 36px -12px rgba(16, 185, 129, 0.2)",
                    transition: { type: "spring", stiffness: 300, damping: 15 }
                  } : {}}
                  className={`group relative rounded-3xl p-6 border flex flex-col justify-between h-56 transition-colors duration-300 ${
                    isUnlocked
                      ? 'bg-zinc-900/30 backdrop-blur-md border-zinc-900 hover:border-emerald-500/40 shadow-xl'
                      : 'bg-zinc-950/80 border-zinc-950/60 opacity-50 select-none'
                  }`}
                >
                  {/* Neon mastery ambient backplate glow on hover */}
                  {isUnlocked && (
                    <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 blur-md pointer-events-none group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  {isUnlocked && isMastered && (
                    <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-60 blur-sm pointer-events-none group-hover:opacity-100 transition-opacity" />
                  )}

                  <div className="space-y-4 relative z-10">
                    {/* Header: Title and locking status - Scaled Up fonts */}
                    <div className="flex items-start justify-between">
                      <div className="overflow-hidden pr-2">
                        <h3 className="font-black text-white text-base lg:text-lg truncate group-hover:text-emerald-400 transition-colors flex items-center gap-2 leading-none">
                          {topic.title}
                          {isUnlocked ? (
                            isMastered ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-450 shrink-0" />
                            ) : null
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
                          )}
                        </h3>
                        <p className="text-zinc-450 text-xs lg:text-sm font-semibold mt-2.5 line-clamp-2 leading-relaxed">
                          {topic.description}
                        </p>
                      </div>
                      
                      <div className={`p-2 rounded-xl border shrink-0 ${
                        isUnlocked 
                          ? 'bg-emerald-950/30 border-emerald-900/35 text-emerald-450 shadow-inner' 
                          : 'bg-zinc-900/50 border-zinc-850 text-zinc-700'
                      }`}>
                        {isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex items-center gap-4 text-xs font-black text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-zinc-650" />
                        {topic.estimatedTime}
                      </span>
                      <span className="flex items-center gap-1 text-amber-500 font-extrabold font-mono">
                        <Zap className="w-3.5 h-3.5 fill-amber-500/10" />
                        +{topic.xpValue} XP
                      </span>
                    </div>
                  </div>

                  {/* Practice links & Mastery gauges - Scaled text metrics */}
                  <div className="pt-4 border-t border-zinc-900/60 flex items-center justify-between relative z-10">
                    {isUnlocked ? (
                      <>
                        <div className="w-[52%]">
                          <div className="flex justify-between text-[11px] font-mono font-bold text-zinc-550 mb-1.5">
                            <span>Mastery</span>
                            <span className="font-extrabold text-zinc-400">{percent}%</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-950 border border-zinc-850 rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-450 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.3)]"
                            />
                          </div>
                        </div>

                        <Link 
                          href={`/roadmap/${topic.id}`}
                          className="px-4.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs flex items-center gap-1 transition-all shadow-[0_3px_12px_rgba(16,185,129,0.2)] hover:scale-[1.01]"
                        >
                          <span>Practice</span>
                          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </Link>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-xs lg:text-sm text-zinc-700 font-mono font-bold">
                        <Lock className="w-4 h-4" />
                        <span>Topic Locked</span>
                      </div>
                    )}
                  </div>

                </motion.div>
              );
            })}
          </motion.div>

        </div>
      ))}
    </div>
  );
};
