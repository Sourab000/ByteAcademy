'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ChevronLeft, BookOpen, CheckCircle2, Lock, ArrowRight, RefreshCw, HelpCircle } from 'lucide-react';
import { useStore } from '@/store';
import { LANGUAGE_TRACKS } from '@/lib/data/languageData';
import { CodeEditor } from '@/components/shared/CodeEditor';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default function LanguageWorkspace({ params }: PageProps) {
  const { lang: langId } = use(params);

  const [mounted, setMounted] = useState(false);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<{ [qIdx: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const completedLessons = useStore((state) => state.completedLanguageLessons);
  const completeLanguageLesson = useStore((state) => state.completeLanguageLesson);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  const track = LANGUAGE_TRACKS.find(t => t.id === langId);

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <h2 className="text-lg font-bold text-zinc-200">Language Track Not Found</h2>
        <Link href="/languages" className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs hover:bg-zinc-850">
          Back to Lobby
        </Link>
      </div>
    );
  }

  const activeLesson = track.lessons[activeLessonIndex] || track.lessons[0];
  const userCompletedList = completedLessons[track.id] || [];

  const handleLessonSuccess = () => {
    completeLanguageLesson(track.id, activeLesson.id, 100);
  };

  const handleQuizAnswer = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setSelectedQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    activeLesson.quizQuestions.forEach((q, idx) => {
      if (selectedQuizAnswers[idx] === q.answerIndex) {
        score += 1;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    
    // If user passed all questions, credit micro XP
    if (score === activeLesson.quizQuestions.length) {
      useStore.getState().addXp(50);
    }
  };

  const handleResetQuiz = () => {
    setSelectedQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  return (
    <div className="space-y-6 max-w-full w-full mx-auto h-[calc(100vh-80px)] flex flex-col pb-4">
      {/* Header Row */}
      <div className="flex items-center justify-between shrink-0">
        <Link 
          href="/languages"
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 font-bold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Tracks</span>
        </Link>

        <div className="flex items-center gap-2.5 text-xs">
          <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 rounded">
            {track.title} Track
          </span>
        </div>
      </div>

      {/* Main Splitscreen Layout with Lesson Navigation List on the Left */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* Leftmost Sidebar Lesson Index Selector */}
        <div className="w-56 bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex flex-col gap-2 shrink-0 hidden md:flex">
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 px-2.5 mb-2">
            Curriculum Path
          </h3>
          
          <div className="flex-1 space-y-1.5 overflow-y-auto">
            {track.lessons.map((lesson, idx) => {
              // A lesson is unlocked if it is the first one or the previous one is completed
              const isUnlocked = idx === 0 || userCompletedList.includes(track.lessons[idx - 1].id);
              const isDone = userCompletedList.includes(lesson.id);

              return (
                <button
                  key={lesson.id}
                  disabled={!isUnlocked}
                  onClick={() => {
                    setActiveLessonIndex(idx);
                    handleResetQuiz();
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all ${
                    activeLessonIndex === idx
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 font-bold'
                      : isUnlocked
                        ? 'bg-zinc-900/10 border-transparent hover:bg-zinc-900/40 text-zinc-400 hover:text-zinc-200'
                        : 'bg-transparent border-transparent opacity-40 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <span className="truncate pr-1">{lesson.title}</span>
                  
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : !isUnlocked ? (
                    <Lock className="w-3 h-3 text-zinc-700 shrink-0" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Panel: Theory Content and Quiz Module */}
        <div className="flex-1 flex flex-col bg-zinc-900/20 border border-zinc-900 rounded-2xl overflow-hidden shadow-md h-full">
          {/* Tabs */}
          <div className="bg-zinc-900/60 px-4 py-2.5 border-b border-zinc-900 flex justify-between items-center shrink-0">
            <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Lesson Curricula
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              Lesson {activeLessonIndex + 1} of {track.lessons.length}
            </span>
          </div>

          {/* Scroll container */}
          <div className="flex-1 p-5 overflow-y-auto space-y-6">
            <div className="space-y-4">
              <h1 className="text-base font-extrabold text-zinc-100">{activeLesson.title}</h1>
              <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line">{activeLesson.content}</p>
            </div>

            {/* Code syntax example card */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 space-y-2">
              <span className="text-[9px] uppercase font-mono font-bold text-zinc-500">Syntax Example</span>
              <pre className="text-[10.5px] font-mono text-emerald-400/90 leading-relaxed overflow-x-auto select-all">
                {activeLesson.codeExample}
              </pre>
            </div>

            {/* Interactive Single-Choice Quiz Section */}
            {activeLesson.quizQuestions && activeLesson.quizQuestions.length > 0 && (
              <div className="border-t border-zinc-900 pt-5 space-y-5">
                <h3 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  Active Lesson Quiz Checks
                </h3>

                <div className="space-y-4">
                  {activeLesson.quizQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-2.5">
                      <p className="text-xs text-zinc-300 font-semibold">{qIdx + 1}. {q.question}</p>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedQuizAnswers[qIdx] === optIdx;
                          const showCorrect = quizSubmitted && optIdx === q.answerIndex;
                          const showIncorrect = quizSubmitted && isSelected && optIdx !== q.answerIndex;

                          return (
                            <button
                              key={optIdx}
                              disabled={quizSubmitted}
                              onClick={() => handleQuizAnswer(qIdx, optIdx)}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                                showCorrect
                                  ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400 font-bold'
                                  : showIncorrect
                                    ? 'bg-red-950/20 border-red-500 text-red-400'
                                    : isSelected
                                      ? 'bg-zinc-950 border-emerald-500/50 text-white shadow-inner'
                                      : 'bg-zinc-950/50 border-zinc-900/60 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {/* Display explanation once quiz submitted */}
                      {quizSubmitted && selectedQuizAnswers[qIdx] !== undefined && (
                        <div className="p-2.5 bg-zinc-950 border border-zinc-900 rounded-lg text-[10px] text-zinc-400 leading-normal">
                          {selectedQuizAnswers[qIdx] === q.answerIndex ? (
                            <span className="text-emerald-400 font-bold block mb-1">Correct!</span>
                          ) : (
                            <span className="text-red-400 font-bold block mb-1">Incorrect.</span>
                          )}
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Submit / Reset Actions */}
                <div className="flex gap-3 pt-2">
                  {!quizSubmitted ? (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(selectedQuizAnswers).length < activeLesson.quizQuestions.length}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>Submit Answers</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleResetQuiz}
                        className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 rounded-xl text-xs font-bold text-zinc-300 flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retake Quiz</span>
                      </button>
                      <span className="px-3 py-2 bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 text-xs font-bold rounded-xl">
                        Score: {quizScore} / {activeLesson.quizQuestions.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Code compilation Sandbox */}
        <div className="w-[42%] flex flex-col h-full overflow-hidden space-y-4 shrink-0 hidden lg:flex">
          <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-4 shrink-0 shadow-md">
            <h2 className="text-xs font-bold text-zinc-200">Interactive Coding Challenge</h2>
            <p className="text-[10px] text-zinc-500 mt-1 max-w-sm">Write the script output described in the code comments, run to compile, and click submit.</p>
          </div>
          
          <div className="flex-1">
            <CodeEditor
              initialCode={activeLesson.starterCode}
              solutionCode={activeLesson.solutionCode}
              testCases={[{ input: 'Compilation execution test', output: 'Success' }]}
              language={track.id}
              xpReward={150}
              onSuccess={handleLessonSuccess}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
