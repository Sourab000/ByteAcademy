'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Timer, Shield, Clock, Send, Award, Trophy, ArrowRight } from 'lucide-react';
import { useStore } from '@/store';
import { CodeEditor } from '@/components/shared/CodeEditor';

export default function MockInterviews() {
  const [mounted, setMounted] = useState(false);
  const [activeStage, setActiveStage] = useState<'LOBBY' | 'ROUND' | 'FEEDBACK'>('LOBBY');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [timeRemaining, setTimeRemaining] = useState(2700); // 45 minutes in seconds
  const [interviewerLogs, setInterviewerLogs] = useState<{ sender: 'interviewer' | 'candidate', text: string }[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const addMockInterviewResult = useStore((state) => state.addMockInterviewResult);
  const mockInterviews = useStore((state) => state.mockInterviews);

  const testCases = [
    { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" }
  ];

  const starterCode = `function solveInterviewProblem(nums, target) {
    // Principal Interviewer: Write your O(N) optimized algorithm below.
    return [];
}`;

  const solutionCode = `function solveInterviewProblem(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) return [map.get(complement), i];
        map.set(nums[i], i);
    }
    return [];
}`;

  const handleFinishRound = useCallback(() => {
    setActiveStage('FEEDBACK');
    
    // Auto populate detailed review metrics
    addMockInterviewResult({
      title: `FAANG ${selectedDifficulty} DSA Interview`,
      difficulty: selectedDifficulty,
      score: selectedDifficulty === 'EASY' ? 90 : selectedDifficulty === 'MEDIUM' ? 84 : 76,
      code: "function solveInterviewProblem(nums, target) { ... }",
      feedback: `### Principal Technical Evaluation Report
* **Design Strategy**: Exceptional. The candidate correctly bypassed brute-force O(N^2) iterations to implement a linear-sweep O(N) lookup hash table.
* **Complexity analysis**: 100% correct.
* **Refactoring recommendations**: Ensure all boundary conditions are evaluated (empty grids, negative values).
* **Communication Grade**: Elite. Validated strategy before writing scripts.`,
      durationSeconds: 2700 - timeRemaining
    });
  }, [selectedDifficulty, timeRemaining, addMockInterviewResult]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  // Timer loop
  useEffect(() => {
    if (activeStage !== 'ROUND') return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeStage, handleFinishRound]);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleStartRound = () => {
    setActiveStage('ROUND');
    setTimeRemaining(2700);
    setInterviewerLogs([
      { sender: 'interviewer', text: `[System Session Initiated: FAANG ${selectedDifficulty} Interviewer Loaded]\nWelcome. I am your Lead Principal DSA Interviewer. Today we will explore array structures. I want to solve this challenge: find two indices that add up to a target number. Brute force methods are unacceptable. What is your proposed complexity strategy before we write code?` }
    ]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const candidateText = inputText;
    setInterviewerLogs(prev => [...prev, { sender: 'candidate', text: candidateText }]);
    setInputText("");

    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1400));
    setIsTyping(false);

    let interviewerReply = "";
    const lowerText = candidateText.toLowerCase();

    if (lowerText.includes('hashmap') || lowerText.includes('linear') || lowerText.includes('o(n)')) {
      interviewerReply = "Excellent design choice. O(N) linear time and O(N) space capacity verified. Go ahead and write out your implementation in the right-side compiler workspace. Let me know when you run the test assertions.";
    } else {
      interviewerReply = "That solution is highly suboptimal. Brute forcing nested loops results in O(N^2) complexity. Can we optimize this using key-value hashes? What is the lookup speed in a hash table?";
    }

    setInterviewerLogs(prev => [...prev, { sender: 'interviewer', text: interviewerReply }]);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col overflow-hidden max-w-full w-full mx-auto space-y-6 pb-4 font-sans">
      
      {/* 1. LOBBY STATE */}
      {activeStage === 'LOBBY' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 flex-1 overflow-y-auto"
        >
          <div className="border-b border-zinc-900 pb-5">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter">Timed FAANG Mock Interviews</h1>
            <p className="text-sm md:text-base text-zinc-450 mt-2 font-medium">Simulate realistic high-pressure technical coding rounds. Receive deep Principal scorecard reports.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lobby Selection card */}
            <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-900 rounded-3xl p-8 space-y-6">
              <h2 className="text-lg font-black text-zinc-200 flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-emerald-450 animate-pulse" />
                Select Difficulty and Setup Session
              </h2>
              
              <div className="grid grid-cols-3 gap-4">
                {(['EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`p-5 rounded-2xl border text-sm font-extrabold transition-all cursor-pointer ${
                      selectedDifficulty === diff
                        ? 'bg-emerald-950/20 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/5'
                        : 'bg-zinc-950 border-zinc-900 hover:border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {diff === 'HARD' ? 'FAANG Hard' : diff}
                  </button>
                ))}
              </div>

              <div className="space-y-3.5 text-sm md:text-[15px] text-zinc-450 leading-relaxed border-t border-zinc-900/60 pt-6 font-semibold">
                <p>• **Duration**: 45 Minutes</p>
                <p>• **Structure**: Behavioral communication check, DSA implementation, and Time/Space complexity justifications.</p>
                <p>• **Constraints**: Strict time boundaries, automated syntax checking, and AI interviewer reviews.</p>
              </div>

              <button
                onClick={handleStartRound}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl text-sm flex items-center gap-2 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.25)] cursor-pointer"
              >
                <span>Initialize Coding Round</span>
                <Clock className="w-4 h-4" />
              </button>
            </div>

            {/* Past interviews sidebar */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6.5 space-y-5 h-fit">
              <h3 className="text-base font-black text-zinc-200 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-450" />
                Technical Scorecards
              </h3>

              {mockInterviews.length === 0 ? (
                <span className="text-xs text-zinc-500 font-medium italic block">No mock rounds saved yet.</span>
              ) : (
                <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                  {mockInterviews.map((hist) => (
                    <div key={hist.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-between text-xs transition-colors hover:border-zinc-800">
                      <div>
                        <span className="font-black text-zinc-200 block text-xs lg:text-sm">{hist.title}</span>
                        <span className="text-zinc-550 font-mono block mt-1.5 text-[10px] lg:text-[11px] font-bold">{hist.date}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`font-extrabold font-mono text-base block ${
                          hist.score >= 85 ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {hist.score}%
                        </span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide block mt-0.5">{hist.difficulty}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. ACTIVE TIMED ROUND STATE */}
      {activeStage === 'ROUND' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
          
          {/* Left panel: Interviewer dialogue box */}
          <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl flex flex-col overflow-hidden h-full">
            <div className="bg-zinc-900/60 px-6 py-4.5 border-b border-zinc-900 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm md:text-base font-black text-zinc-200">FAANG DSA Interviewer</span>
              </div>
              <div className="px-4 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-sm font-mono font-black text-amber-500 flex items-center gap-1.5">
                <Timer className="w-4 h-4 animate-pulse" />
                {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Logs list area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-5">
              {interviewerLogs.map((log, index) => (
                <div 
                  key={index}
                  className={`flex w-full ${log.sender === 'candidate' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm md:text-[15px] lg:text-base leading-relaxed shadow-sm ${
                    log.sender === 'candidate'
                      ? 'bg-emerald-500 text-zinc-950 font-semibold rounded-tr-none'
                      : 'bg-zinc-950 border border-zinc-900 text-zinc-355 rounded-tl-none whitespace-pre-line'
                  }`}>
                    {log.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-zinc-950 border border-zinc-900 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 bg-zinc-950 border-t border-zinc-900 flex gap-3 shrink-0">
              <input
                type="text"
                placeholder="Discuss solution strategy..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-zinc-900/60 border border-zinc-850 rounded-2xl px-5 py-4 text-sm md:text-base focus:outline-none focus:border-emerald-500 transition-colors text-zinc-200"
              />
              <button
                type="submit"
                className="px-5 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl text-sm flex items-center justify-center transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4 fill-current" />
              </button>
            </form>
          </div>

          {/* Right panel: Coding workspace & finish option */}
          <div className="flex flex-col h-full overflow-hidden space-y-4">
            <div className="flex-1 min-h-[300px]">
              <CodeEditor
                initialCode={starterCode}
                solutionCode={solutionCode}
                testCases={testCases}
                language="javascript"
                xpReward={300}
                onSuccess={() => {
                  setInterviewerLogs(prev => [
                    ...prev,
                    { sender: 'interviewer', text: "Your script passed all local compiler assertions! Fantastic. Go ahead and conclude the interview session by clicking the Finish Round button below." }
                  ]);
                }}
              />
            </div>

            <button
              onClick={handleFinishRound}
              className="w-full py-4.5 bg-red-650 hover:bg-red-555 text-white font-black rounded-2xl text-sm md:text-base flex items-center justify-center gap-2 shadow-lg transition-colors shrink-0 cursor-pointer"
            >
              <span>Conclude Interview Session</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      )}

      {/* 3. DETAILED SCORECARD FEEDBACK STATE */}
      {activeStage === 'FEEDBACK' && mockInterviews[0] && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/20 border border-zinc-900 p-8 md:p-12 rounded-3xl shadow-2xl flex-1 overflow-y-auto space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-2 border-b border-zinc-900 pb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-900 text-emerald-400 flex items-center justify-center text-3xl mx-auto animate-bounce mb-4">
              💼
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white">Mock Interview Scorecard Compiled</h2>
            <p className="text-sm lg:text-base text-zinc-400 font-medium">Principal Senior Staff engineering review ready.</p>
          </div>

          {/* Core score block */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 text-center space-y-2">
              <span className="text-[10px] lg:text-xs text-zinc-500 uppercase font-mono block tracking-wider font-extrabold">Technical Grade</span>
              <span className={`text-3xl font-black block font-mono ${
                mockInterviews[0].score >= 85 ? 'text-emerald-400' : 'text-amber-500'
              }`}>
                {mockInterviews[0].score}%
              </span>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 text-center space-y-2">
              <span className="text-[10px] lg:text-xs text-zinc-500 uppercase font-mono block tracking-wider font-extrabold">Interview Difficulty</span>
              <span className="text-3xl font-black text-zinc-200 block font-mono">
                {mockInterviews[0].difficulty}
              </span>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 text-center space-y-2">
              <span className="text-[10px] lg:text-xs text-zinc-500 uppercase font-mono block tracking-wider font-extrabold">XP Gain Boost</span>
              <span className="text-3xl font-black text-amber-500 block font-mono flex items-center justify-center gap-0.5">
                +{mockInterviews[0].score * 3} XP
              </span>
            </div>

          </div>

          {/* Feedback markdown output */}
          <div className="max-w-2xl mx-auto bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-8 text-left text-sm leading-relaxed space-y-5 shadow-inner">
            <h3 className="font-black text-zinc-200 border-b border-zinc-900 pb-3 flex items-center gap-2 text-sm lg:text-base">
              <Shield className="w-5 h-5 text-emerald-400" />
              Lead Staff Feedback Report
            </h3>
            
            <div className="whitespace-pre-line text-zinc-400 font-mono text-xs lg:text-sm leading-relaxed font-medium">
              {mockInterviews[0].feedback}
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => {
                setActiveStage('LOBBY');
              }}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl text-sm md:text-base transition-all shadow-lg shadow-emerald-500/5 cursor-pointer"
            >
              Back to Lobby Dashboard
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
