'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Send, Trash2, Cpu, BrainCircuit, Sparkles, Terminal } from 'lucide-react';
import { useStore } from '@/store';

// Helper to parse basic markdown syntax into clean React elements
function parseInlineStyling(text: string): React.ReactNode[] {
  // Split by inline code `code` or bold **bold**
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="px-2 py-0.5 mx-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-[12px] md:text-sm">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-extrabold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function renderMarkdown(content: string) {
  if (!content) return null;

  // Split content by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    // Check if it's a code block
    if (part.startsWith('```')) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const language = match ? match[1] : '';
      const code = match ? match[2] : part.slice(3, -3);

      return (
        <div key={index} className="my-4.5 rounded-2xl bg-zinc-950 border border-zinc-900 overflow-hidden text-left font-mono text-[13px] md:text-sm shadow-2xl w-full">
          <div className="bg-zinc-900/60 px-4 py-2 text-xs font-bold text-zinc-400 border-b border-zinc-900 flex justify-between items-center select-none uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              {language || 'code'}
            </span>
            <span className="text-[10px] text-zinc-500">Read-Only Sandbox</span>
          </div>
          <pre className="p-4 overflow-x-auto text-emerald-300 leading-relaxed font-mono whitespace-pre select-text">{code.trim()}</pre>
        </div>
      );
    }

    // Normal text paragraph blocks
    const lines = part.split('\n');
    return (
      <div key={index} className="space-y-3">
        {lines.map((line, lineIndex) => {
          let renderedLine = line;

          // 1. Check for Headers: ### text, #### text, ## text
          const headerMatch = renderedLine.match(/^(#{1,6})\s+(.*)$/);
          if (headerMatch) {
            const level = headerMatch[1].length;
            const text = headerMatch[2];
            const parsedText = parseInlineStyling(text);

            if (level === 1) return <h1 key={lineIndex} className="text-lg md:text-xl font-black text-zinc-150 mt-5 mb-2 select-text">{parsedText}</h1>;
            if (level === 2) return <h2 key={lineIndex} className="text-base md:text-lg font-black text-zinc-150 mt-4 mb-2 select-text">{parsedText}</h2>;
            return <h3 key={lineIndex} className="text-sm md:text-base font-black text-emerald-400 mt-3 mb-1.5 select-text">{parsedText}</h3>;
          }

          // 2. Check for bullet lists: - text or * text
          const listMatch = renderedLine.match(/^[-*]\s+(.*)$/);
          if (listMatch) {
            const text = listMatch[1];
            return (
              <ul key={lineIndex} className="list-disc pl-6 my-1 space-y-1.5">
                <li className="text-zinc-300 text-sm md:text-base leading-relaxed select-text">
                  {parseInlineStyling(text)}
                </li>
              </ul>
            );
          }

          // 3. Spacers
          if (!renderedLine.trim()) return <div key={lineIndex} className="h-1.5" />;

          return (
            <p key={lineIndex} className="text-zinc-300 text-sm md:text-base leading-relaxed select-text">
              {parseInlineStyling(renderedLine)}
            </p>
          );
        })}
      </div>
    );
  });
}

export default function AiTutorChat() {
  const [mounted, setMounted] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [aiStatus, setAiStatus] = useState<{ active: boolean; provider: string; model: string }>({
    active: false,
    provider: 'none',
    model: 'Resolving AI Engine...',
  });

  const activeMode = useStore((state) => state.activeTutorMode);
  const setActiveTutorMode = useStore((state) => state.setActiveTutorMode);
  const tutorChats = useStore((state) => state.tutorChats);
  const addTutorMessage = useStore((state) => state.addTutorMessage);
  const clearTutorChat = useStore((state) => state.clearTutorChat);

  const activeChat = useMemo(() => tutorChats[activeMode] || [], [tutorChats, activeMode]);

  const tutorModes = [
    { name: "Explain Simply", desc: "Complex concepts explained like you are 5 years old.", icon: "👶" },
    { name: "Hint Only", desc: "No copy-paste answers. Clues and guide indicators only.", icon: "💡" },
    { name: "Strict Mentor", desc: "Honest feedback, strict reviews, and structural standards.", icon: "🧑‍🏫" },
    { name: "Teach With Analogies", desc: "Connecting code pointers to physical everyday operations.", icon: "🎨" },
    { name: "Grill Me Mode", desc: "Simulate high-pressure FAANG Technical Interviews and complex complexity analysis.", icon: "🔥" }
  ];

  const fetchAiStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/tutor/status');
      if (res.ok) {
        const data = await res.json();
        setAiStatus(data);
      }
    } catch (err) {
      console.error('Tutor status fetch failure:', err);
    }
  }, []);

  const sendTutorWelcome = useCallback((mode: string) => {
    let text = "";
    switch(mode) {
      case "Explain Simply":
        text = "Hello! I am your junior-friendly tutor. Pick any complex DSA concept (like heaps or recursion) and I will explain it using cartoon drawings and candy bars. What are we studying today?";
        break;
      case "Hint Only":
        text = "Welcome to the sandbox. I will help you solve problems, but I will NEVER write the code for you. Tell me what issue you are running into, and I will point you in the right direction.";
        break;
      case "Strict Mentor":
        text = "Mainframe loaded. I expect clean structures, strict type checks, and optimal algorithms. Show me your script templates and I will tear them apart to make you elite.";
        break;
      case "Teach With Analogies":
        text = "Greetings! I explain code using stories. For example, stacks are like piles of dining plates, and arrays are row seats in a movie theatre. What concept is puzzling you?";
        break;
      case "Grill Me Mode":
        text = "[FAANG System Interview Simulator Active]\nCandidate logged in. Welcome. I am your Senior Principal interviewer. We will begin our technical grilling. Let's start: Explain the optimal time complexity to search inside a sorted array of size N, and justify why linear scans are unacceptable.";
        break;
      default:
        text = "Hello! I am your AI coding assistant. How can I help you learn today?";
    }
    addTutorMessage(mode, { sender: 'tutor', text });
  }, [addTutorMessage]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    fetchAiStatus();
    return () => clearTimeout(t);
  }, [fetchAiStatus]);

  useEffect(() => {
    if (activeChat.length === 0) {
      sendTutorWelcome(activeMode);
    }
  }, [activeMode, activeChat.length, sendTutorWelcome]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat, isTyping, streamingText]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userText = inputText;
    setInputText("");
    
    // 1. Add user message to local and Zustand logs
    addTutorMessage(activeMode, { sender: 'user', text: userText });
    setIsTyping(true);
    setStreamingText("");

    try {
      // 2. Build the messages array from history, inserting the new user message too
      const chatContext = [
        ...activeChat,
        { sender: 'user' as const, text: userText }
      ];

      // 3. Initiate the streaming backend request
      const response = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: chatContext,
          mode: activeMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned error code ${response.status}`);
      }

      const bodyStream = response.body;
      if (!bodyStream) {
        throw new Error('API response returned empty body stream.');
      }

      // 4. Decode the body reader token chunks asynchronously
      const reader = bodyStream.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          accumulatedText += chunk;
          setStreamingText(accumulatedText);
        }
      }

      // 5. Stream finished successfully, persist inside store logs
      if (accumulatedText.trim()) {
        addTutorMessage(activeMode, { sender: 'tutor', text: accumulatedText });
      }

      // 6. Reward active student with gamified XP + verify streaks
      useStore.getState().addXp(15);
      useStore.getState().incrementStreak();

    } catch (err: any) {
      console.error('Tutor chat streaming exception:', err);
      addTutorMessage(
        activeMode, 
        { 
          sender: 'tutor', 
          text: `⚠️ **Connection Error**: ${err.message || 'Unable to connect to the tutor service. Please check your key configuration or internet connectivity.'}` 
        }
      );
    } finally {
      setStreamingText("");
      setIsTyping(false);
    }
  };

  const handleClear = () => {
    if (window.confirm("Delete chat history for this mode?")) {
      clearTutorChat(activeMode);
      setTimeout(() => sendTutorWelcome(activeMode), 10);
    }
  };

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 overflow-hidden max-w-full w-full mx-auto">
      
      {/* Left Column: Tutor Mode Switcher */}
      <div className="w-full md:w-80 bg-zinc-950 border border-zinc-900 rounded-3xl p-4 md:p-5 flex flex-col gap-3 md:gap-4 shrink-0">
        <div>
          <h2 className="text-base lg:text-lg font-black text-zinc-100 flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-emerald-400" />
            Tutor Personas
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-medium">Toggle tutor methods dynamically.</p>
        </div>

        <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto gap-3 md:space-y-2.5 md:gap-0 pt-1 pb-2 md:pb-0 md:pt-2 shrink-0 md:flex-1 select-none">
          {tutorModes.map((mode) => (
            <button
              key={mode.name}
              onClick={() => {
                setActiveTutorMode(mode.name);
              }}
              className={`shrink-0 w-64 md:w-full text-left p-3.5 md:p-4 rounded-2xl border flex gap-3.5 transition-all cursor-pointer ${
                activeMode === mode.name
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-white font-bold'
                  : 'bg-zinc-900/10 border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="text-2xl select-none">{mode.icon}</span>
              <div className="overflow-hidden min-w-0 flex-1">
                <h4 className="text-sm font-extrabold text-zinc-200 leading-tight truncate">{mode.name}</h4>
                <p className="text-[11px] lg:text-xs text-zinc-500 leading-normal line-clamp-2 mt-1 font-medium whitespace-normal">{mode.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Chat Console */}
      <div className="flex-1 bg-zinc-900/20 border border-zinc-900 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Chat Window Header */}
        <div className="bg-zinc-900/60 px-6 py-4.5 border-b border-zinc-900 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm md:text-base font-black text-zinc-200">
              Active Tutor: <span className="text-emerald-400 font-black">{activeMode}</span>
            </h3>
          </div>

          <div className="flex items-center gap-4">
            {/* AI Status Badge */}
            {aiStatus.provider === 'none' ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black text-yellow-400 bg-yellow-950/20 border border-yellow-500/30 rounded-full select-none animate-pulse">
                <BrainCircuit className="w-3.5 h-3.5" />
                Local Sandbox Fallback
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black text-emerald-400 bg-emerald-950/20 border border-emerald-500/30 rounded-full select-none">
                <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                AI Online: {aiStatus.provider}
              </span>
            )}

            <button
              onClick={handleClear}
              className="p-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-zinc-500 hover:text-red-400 rounded-xl transition-all cursor-pointer"
              title="Clear Chat Logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message bubble stream area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {activeChat.map((msg, index) => (
            <div
              key={index}
              className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm md:text-[15px] lg:text-base leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-emerald-500 text-zinc-950 font-semibold rounded-tr-none select-text'
                    : 'bg-zinc-950 border border-zinc-900 text-zinc-300 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {msg.sender === 'user' ? msg.text : renderMarkdown(msg.text)}
                <span className={`block text-[10px] md:text-xs mt-1.5 text-right select-none ${
                  msg.sender === 'user' ? 'text-zinc-950/60' : 'text-zinc-500'
                }`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {/* Incoming Streaming Token Bubble */}
          {streamingText && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-5 py-4 text-sm md:text-[15px] lg:text-base leading-relaxed bg-zinc-950 border border-zinc-900 text-zinc-300 rounded-tl-none relative shadow-sm">
                {renderMarkdown(streamingText)}
                <span className="inline-block w-2.5 h-4 ml-1 bg-emerald-400 animate-pulse align-middle" />
              </div>
            </div>
          )}

          {/* Typing state fallback indicator */}
          {isTyping && !streamingText && (
            <div className="flex justify-start">
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input box form */}
        <form onSubmit={handleSendMessage} className="p-5 bg-zinc-950 border-t border-zinc-900 flex gap-4 shrink-0">
          <input
            type="text"
            placeholder={`Ask tutor in ${activeMode} mode...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            className="flex-1 bg-zinc-900/60 border border-zinc-850 rounded-2xl px-5 py-4 text-sm md:text-base focus:outline-none focus:border-emerald-500 transition-colors text-zinc-200"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl text-sm flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-5 h-5 fill-current" />
          </button>
        </form>
      </div>

    </div>
  );
}
