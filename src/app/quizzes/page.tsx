'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Timer, CheckCircle, XCircle, Award, RefreshCw, Zap, ChevronLeft } from 'lucide-react';
import { useStore } from '@/store';

interface QuizQuestion {
  id: string;
  type: 'MCQ' | 'COMPLEXITY' | 'OUTPUT' | 'DEBUG';
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

// High fidelity questions
const quizQuestions: QuizQuestion[] = [
  {
    id: "q-1",
    type: "COMPLEXITY",
    question: "What is the worst-case time complexity of inserting a node into an unbalanced Binary Search Tree (BST)?",
    options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
    answerIndex: 2,
    explanation: "In an unbalanced BST (skewed tree), the hierarchy resembles a singly linked list, which degrades lookup, search, and insertion operations to linear time O(N)."
  },
  {
    id: "q-2",
    type: "OUTPUT",
    question: "Analyze this JavaScript snippet: let a = [1, 2]; let b = a; b.push(3); console.log(a.length). What is the output?",
    options: ["2", "3", "4", "Undefined"],
    answerIndex: 1,
    explanation: "Arrays are passed by reference pointer in JavaScript. 'let b = a' makes both point to the same array block. Pushing 3 into 'b' affects 'a', so length is 3."
  },
  {
    id: "q-3",
    type: "MCQ",
    question: "Which data structure operates strictly on the First-In-First-Out (FIFO) principle?",
    options: ["Stack", "Heap", "Queue", "Hash Table"],
    answerIndex: 2,
    explanation: "A Queue operates on the FIFO principle (first element inserted is the first one removed), whereas a Stack uses Last-In-First-Out (LIFO)."
  },
  {
    id: "q-4",
    type: "DEBUG",
    question: "Find the error in this recursion method for factorial calculation: fn(n) { if (n === 0) return 1; return n * fn(n); }",
    options: ["Base case is missing", "Triggers stack overflow due to recursive step 'fn(n)' keeping N static", "Multiplying instead of adding", "Static scoping issue"],
    answerIndex: 1,
    explanation: "The recursive call passes N unchanged ('fn(n)'), meaning n will never decrement towards 0, resulting in infinite recursive loops and a stack overflow error. It should be fn(n-1)."
  }
];

export default function QuizArena() {
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIdx: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [timerCount, setTimerCount] = useState(60);
  const [quizFinished, setQuizFinished] = useState(false);
  
  const addQuizResult = useStore((state) => state.addQuizResult);
  const quizHistory = useStore((state) => state.quizHistory);

  const handleFinishQuiz = useCallback(() => {
    setQuizFinished(true);
    
    // Calculate final scores
    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answerIndex) {
        correctCount += 1;
      }
    });

    const xpEarned = correctCount * 50;

    // Dispatch to Zustand store
    addQuizResult({
      topicId: "mixed_dsa",
      score: correctCount,
      maxScore: quizQuestions.length,
      xpEarned
    });
  }, [selectedAnswers, addQuizResult]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  // Timer loop when active
  useEffect(() => {
    if (!isPlaying || quizFinished) return;
    
    const timer = setInterval(() => {
      setTimerCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPlaying, quizFinished, handleFinishQuiz]);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleStartQuiz = () => {
    setIsPlaying(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setSubmitted(false);
    setTimerCount(90);
    setQuizFinished(false);
  };

  const handleOptionSelect = (optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: optIdx }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSubmitted(false);
    } else {
      handleFinishQuiz();
    }
  };

  const activeQuestion = quizQuestions[currentQuestionIndex];
  const hasSelected = selectedAnswers[currentQuestionIndex] !== undefined;

  return (
    <div className="max-w-full w-full mx-auto space-y-8 font-sans">
      
      {/* Lobby dashboard state */}
      {!isPlaying && !quizFinished && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="border-b border-zinc-900 pb-5">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter">Adaptive Quiz Arena</h1>
            <p className="text-sm md:text-base text-zinc-450 mt-2 font-medium">Target weak topics, tackle time constraints, and climb the leaderboard boards.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Arena stats card */}
            <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-900 rounded-3xl p-8 space-y-6">
              <h2 className="text-lg font-black text-zinc-200 flex items-center gap-2.5">
                <Star className="w-5 h-5 text-emerald-450 animate-pulse" />
                Mixed Algorithmic Challenge
              </h2>
              <p className="text-sm md:text-[15px] text-zinc-400 leading-relaxed font-semibold">
                A timed adaptive evaluation containing 4 mixed questions. Time constraints: 90 seconds. Success gives +50 XP per question. Scored histories are serialized to sync with profile badges.
              </p>
              
              <button
                onClick={handleStartQuiz}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl text-sm flex items-center gap-2 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.25)] cursor-pointer"
              >
                <span>Enter Timed Arena</span>
                <Timer className="w-4 h-4" />
              </button>
            </div>

            {/* Score logs side column */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6.5 space-y-5 h-fit">
              <h3 className="text-base font-black text-zinc-200 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-450" />
                Score Records
              </h3>

              {quizHistory.length === 0 ? (
                <span className="text-xs text-zinc-500 font-medium italic block">No quiz logs recorded yet.</span>
              ) : (
                <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                  {quizHistory.map((hist) => (
                    <div key={hist.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-between text-xs transition-colors hover:border-zinc-800">
                      <div>
                        <span className="font-black text-zinc-250 block text-xs lg:text-sm">Mixed DSA Arena</span>
                        <span className="text-zinc-500 font-mono block mt-1 text-[10px] lg:text-[11px] font-bold">{hist.date}</span>
                      </div>
                      <span className="font-extrabold text-emerald-400 font-mono text-sm">
                        {hist.score} / {hist.maxScore}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Active playing state */}
      {isPlaying && !quizFinished && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 md:p-10 shadow-2xl relative space-y-8"
        >
          {/* Header timer and progress indicators */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
            <span className="text-sm font-black text-zinc-300 font-mono uppercase tracking-wide">
              Question {currentQuestionIndex + 1} of {quizQuestions.length}
            </span>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-sm font-mono font-black text-amber-500">
              <Timer className="w-4 h-4 animate-pulse" />
              <span>{timerCount}s</span>
            </div>
          </div>

          {/* Active Question Box */}
          <div className="space-y-6">
            <div className="space-y-3.5">
              <span className="text-[10px] lg:text-xs uppercase font-mono font-black px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded w-fit block tracking-wider">
                {activeQuestion.type} QUESTION
              </span>
              <h2 className="text-lg md:text-xl lg:text-2xl font-black text-zinc-100 leading-relaxed">
                {activeQuestion.question}
              </h2>
            </div>

            {/* List options */}
            <div className="grid grid-cols-1 gap-3.5">
              {activeQuestion.options.map((opt, idx) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                const showCorrect = submitted && idx === activeQuestion.answerIndex;
                const showIncorrect = submitted && isSelected && idx !== activeQuestion.answerIndex;

                return (
                  <button
                    key={idx}
                    disabled={submitted}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full text-left p-5 rounded-2xl border text-sm md:text-[15px] lg:text-base font-extrabold transition-all cursor-pointer ${
                      showCorrect
                        ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400 font-bold'
                        : showIncorrect
                          ? 'bg-red-950/20 border-red-500 text-red-400'
                          : isSelected
                            ? 'bg-zinc-950 border-emerald-500/50 text-white shadow-inner font-black'
                            : 'bg-zinc-950/50 border-zinc-900/60 hover:border-zinc-850 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation drawer once submitted */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 text-sm leading-relaxed space-y-3 overflow-hidden shadow-inner"
              >
                <div className="flex items-center gap-1.5">
                  {selectedAnswers[currentQuestionIndex] === activeQuestion.answerIndex ? (
                    <span className="text-emerald-450 font-black flex items-center gap-1 text-sm lg:text-base">
                      <CheckCircle className="w-5 h-5 stroke-[2.5]" />
                      Assertion Match! Correct
                    </span>
                  ) : (
                    <span className="text-red-400 font-black flex items-center gap-1 text-sm lg:text-base">
                      <XCircle className="w-5 h-5 stroke-[2.5]" />
                      Assertion Mismatch
                    </span>
                  )}
                </div>
                <p className="text-zinc-400 font-medium">{activeQuestion.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer actions */}
          <div className="flex justify-end pt-4 border-t border-zinc-900/60">
            {!submitted ? (
              <button
                onClick={() => setSubmitted(true)}
                disabled={!hasSelected}
                className="px-6 py-4.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl text-sm flex items-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Verify Answer</span>
                <CheckCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-4.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-zinc-300 font-black rounded-2xl text-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>
                  {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Challenge' : 'Finish Quiz'}
                </span>
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Finished score breakdown state */}
      {quizFinished && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/40 border border-zinc-900 p-8 md:p-12 rounded-3xl shadow-2xl text-center space-y-8 max-w-2xl mx-auto"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-950/40 border border-emerald-900 text-emerald-400 flex items-center justify-center text-4xl mx-auto animate-bounce">
            🏆
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Quiz Arena Cleared!</h2>
            <p className="text-sm lg:text-base text-zinc-450 font-medium">Your score scorecard is fully calculated.</p>
          </div>

          {/* Score details */}
          <div className="flex items-center justify-center gap-8 max-w-md mx-auto bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl">
            <div>
              <span className="text-[10px] lg:text-xs text-zinc-500 uppercase font-mono block tracking-wide font-extrabold">Accuracy</span>
              <span className="text-lg lg:text-xl font-black text-zinc-200 block mt-1.5 font-mono">
                {quizQuestions.filter((q, idx) => selectedAnswers[idx] === q.answerIndex).length} / {quizQuestions.length} Correct
              </span>
            </div>
            
            <div className="w-px h-10 bg-zinc-900" />
            
            <div>
              <span className="text-[10px] lg:text-xs text-zinc-500 uppercase font-mono block tracking-wide font-extrabold">XP Reward</span>
              <span className="text-lg lg:text-xl font-black text-amber-500 block mt-1.5 flex items-center justify-center gap-0.5 font-mono">
                <Zap className="w-4 h-4 fill-amber-500/20" />
                +{quizQuestions.filter((q, idx) => selectedAnswers[idx] === q.answerIndex).length * 50} XP
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4.5 pt-2">
            <button
              onClick={() => {
                setQuizFinished(false);
                setIsPlaying(false);
              }}
              className="px-6 py-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 rounded-2xl text-sm font-bold text-zinc-350 transition-colors cursor-pointer"
            >
              Back to Lobby
            </button>
            <button
              onClick={handleStartQuiz}
              className="px-6.5 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl text-sm flex items-center gap-2 transition-all shadow-[0_2px_12px_rgba(16,185,129,0.2)] cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Quiz</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
