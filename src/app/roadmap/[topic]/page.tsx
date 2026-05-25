'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, BookOpen, Layers, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '@/store';
import { DSA_TOPICS } from '@/lib/data/dsaData';
import { CodeEditor } from '@/components/shared/CodeEditor';

interface PageProps {
  params: Promise<{ topic: string }>;
}

export default function DsaTopicViewer({ params }: PageProps) {
  const { topic: topicId } = use(params);
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'theory' | 'visualizer'>('theory');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [dryRunStep, setDryRunStep] = useState(0);

  const completedQuestions = useStore((state) => state.completedDsaQuestions);
  const completeDsaQuestion = useStore((state) => state.completeDsaQuestion);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  const topic = DSA_TOPICS.find(t => t.id === topicId);

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-zinc-600" />
        <h2 className="text-lg font-bold text-zinc-200">DSA Topic Not Found</h2>
        <p className="text-xs text-zinc-500 max-w-sm">The path requested does not match our curriculum catalog.</p>
        <Link href="/roadmap" className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs hover:bg-zinc-850">
          Back to Skill Tree
        </Link>
      </div>
    );
  }

  const currentQuestion = topic.questions[selectedQuestionIndex] || topic.questions[0];

  const handleSuccess = () => {
    if (currentQuestion) {
      completeDsaQuestion(currentQuestion.id, topic.id, topic.xpValue);
    }
  };

  const handleNextStep = () => {
    if (topic.visualSteps && dryRunStep < topic.visualSteps.length - 1) {
      setDryRunStep(prev => prev + 1);
    } else {
      setDryRunStep(0);
    }
  };

  return (
    <div className="space-y-6 max-w-full w-full mx-auto h-[calc(100vh-80px)] flex flex-col pb-4 font-sans">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between shrink-0">
        <Link 
          href="/roadmap"
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 font-black transition-colors"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          <span>Back to Roadmap</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs uppercase font-mono font-black px-3 py-1 bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 rounded shadow-sm">
            DSA MODULE
          </span>
        </div>
      </div>

      {/* Main Splitscreen Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
        
        {/* Left Side: Curricula, Step Visualizer, and Details */}
        <div className="flex flex-col bg-zinc-900/20 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl h-full">
          {/* Header Tab Toggles */}
          <div className="bg-zinc-900/60 border-b border-zinc-900 px-6 py-4.5 flex items-center justify-between shrink-0">
            <div className="flex gap-5">
              <button
                onClick={() => setActiveTab('theory')}
                className={`text-sm lg:text-base font-black pb-1.5 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'theory' ? 'text-emerald-400 border-emerald-400 font-black' : 'text-zinc-500 hover:text-zinc-300 border-transparent'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Theory & Lessons
              </button>
              
              <button
                onClick={() => setActiveTab('visualizer')}
                className={`text-sm lg:text-base font-black pb-1.5 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'visualizer' ? 'text-emerald-400 border-emerald-400 font-black' : 'text-zinc-500 hover:text-zinc-300 border-transparent'
                }`}
              >
                <Layers className="w-4 h-4" />
                Dry Run Visualizer
              </button>
            </div>
            
            <h2 className="text-sm font-black text-zinc-200 truncate max-w-[200px]">
              {topic.title}
            </h2>
          </div>

          {/* Dynamic Content scroll area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === 'theory' ? (
                <motion.div
                  key="theory"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  {/* Topic curriculum explanation */}
                  <div>
                    <h3 className="text-base font-black text-zinc-150">Interactive Syllabus</h3>
                    <p className="text-sm lg:text-[15px] text-zinc-400 mt-3 leading-relaxed whitespace-pre-line font-medium">{topic.theory}</p>
                  </div>

                  {/* Complexity matrices */}
                  <div className="bg-zinc-950/60 border border-zinc-850 rounded-2xl p-5 space-y-4 shadow-sm">
                    <h4 className="text-sm font-black text-zinc-200 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      Complexity Analysis
                    </h4>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <span className="text-[10px] lg:text-xs text-zinc-500 block uppercase font-mono font-black tracking-wide">Time Complexity</span>
                        <span className="font-extrabold font-mono text-emerald-400 mt-1 block text-base lg:text-lg">{topic.complexity.time}</span>
                      </div>
                      <div>
                        <span className="text-[10px] lg:text-xs text-zinc-500 block uppercase font-mono font-black tracking-wide">Space Complexity</span>
                        <span className="font-extrabold font-mono text-teal-400 mt-1 block text-base lg:text-lg">{topic.complexity.space}</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed border-t border-zinc-900 pt-3.5 font-medium">
                      {topic.complexity.explanation}
                    </p>
                  </div>

                  {/* Selection question list */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-zinc-200">Practice Exercises</h3>
                    <div className="space-y-3">
                      {topic.questions.map((q, idx) => {
                        const isSolved = completedQuestions.includes(q.id);
                        return (
                          <button
                            key={q.id}
                            onClick={() => setSelectedQuestionIndex(idx)}
                            className={`w-full flex items-center justify-between p-4.5 rounded-2xl border text-left text-sm transition-all duration-200 cursor-pointer ${
                              selectedQuestionIndex === idx
                                ? 'bg-zinc-950 border-emerald-500/50 shadow-inner font-extrabold'
                                : 'bg-zinc-950/50 border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className={`w-2.5 h-2.5 rounded-full ${
                                q.difficulty === 'EASY' ? 'bg-emerald-400' :
                                q.difficulty === 'MEDIUM' ? 'bg-amber-400' : 'bg-red-400'
                              }`} />
                              <div>
                                <h4 className="font-extrabold text-zinc-200 text-sm lg:text-base leading-none">{q.title}</h4>
                                <span className={`text-[10px] lg:text-xs font-mono font-black uppercase mt-2 block ${
                                  q.difficulty === 'EASY' ? 'text-emerald-400' :
                                  q.difficulty === 'MEDIUM' ? 'text-amber-500' : 'text-red-500'
                                }`}>
                                  {q.difficulty}
                                </span>
                              </div>
                            </div>

                            {isSolved && (
                              <div className="flex items-center gap-1.5 text-[10px] lg:text-xs text-emerald-400 font-black bg-emerald-950/30 px-3 py-1 rounded-xl border border-emerald-900/40 font-mono shadow-sm">
                                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                                <span>SOLVED</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="visualizer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-sm font-black text-zinc-200">Data Structure Stepper</h3>
                    <p className="text-xs lg:text-sm text-zinc-500 mt-1 font-medium">Visualize memory models and dynamic actions step-by-step.</p>
                  </div>

                  {/* Interactive animated block */}
                  <div className="h-48 bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col items-center justify-center p-6 relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#10b9810a_0,transparent_100%)]" />

                    {/* Render visual lists */}
                    <div className="flex gap-3 relative z-10">
                      {topic.visualSteps && Array.isArray(topic.visualSteps[dryRunStep]?.visualState) ? (
                        (topic.visualSteps[dryRunStep].visualState as number[]).map((val, idx) => (
                          <motion.div
                            key={idx}
                            layout
                            className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-black text-emerald-400 text-sm shadow-md"
                          >
                            {val}
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center font-mono text-xs lg:text-sm text-emerald-400 px-5 py-3 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl">
                          {JSON.stringify(topic.visualSteps[dryRunStep]?.visualState || "Ready")}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stepper details */}
                  {topic.visualSteps && topic.visualSteps[dryRunStep] && (
                    <div className="p-5 bg-zinc-950/50 border border-zinc-900 rounded-2xl space-y-2.5">
                      <h4 className="text-xs lg:text-sm font-black text-zinc-200 font-mono text-emerald-450 leading-none">
                        Step {dryRunStep + 1}: {topic.visualSteps[dryRunStep].title}
                      </h4>
                      <p className="text-xs lg:text-sm text-zinc-400 leading-relaxed font-semibold">
                        {topic.visualSteps[dryRunStep].desc}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleNextStep}
                    className="px-6 py-3.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 rounded-2xl text-xs lg:text-sm font-black text-zinc-300 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Next Stepper Step</span>
                    <ChevronLeft className="w-4 h-4 rotate-180" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Code Editor and active task */}
        <div className="flex flex-col h-full overflow-hidden space-y-4">
          {/* Question title and details */}
          <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-5 shrink-0 shadow-md">
            <h2 className="text-base lg:text-lg font-black text-zinc-100 flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${
                currentQuestion?.difficulty === 'EASY' ? 'bg-emerald-400' :
                currentQuestion?.difficulty === 'MEDIUM' ? 'bg-amber-400' : 'bg-red-400'
              }`} />
              {currentQuestion?.title || 'Practice Challenge'}
            </h2>
            <p className="text-xs lg:text-sm text-zinc-400 mt-2.5 leading-relaxed whitespace-pre-line font-semibold">
              {currentQuestion?.description}
            </p>
          </div>

          {/* Core code editor panel */}
          {currentQuestion && (
            <div className="flex-1 min-h-[300px]">
              <CodeEditor
                initialCode={currentQuestion.starterCode}
                solutionCode={currentQuestion.solutionCode}
                testCases={currentQuestion.testCases}
                xpReward={topic.xpValue}
                onSuccess={handleSuccess}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
