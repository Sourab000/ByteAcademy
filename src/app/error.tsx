'use client';

import React, { useEffect } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log exception to standard telemetry stream
    console.error('Unhandled Application Fault detected:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#040405] text-zinc-100 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/4 w-[45vw] h-[45vh] bg-red-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vh] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-md w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 space-y-6 text-center">
        {/* Glowing Warning Icon */}
        <div className="mx-auto w-14 h-14 rounded-full bg-red-950/40 border border-red-900/30 flex items-center justify-center text-red-500 shadow-inner">
          <AlertOctagon className="w-6 h-6 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-black text-white tracking-tight">Mainframe Exception Caught</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            ByteAcademy encountered an unexpected state fault. This incident has been logged. Let&apos;s try rebooting the segment.
          </p>
        </div>

        {/* Diagnostic Stack Console */}
        <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 text-left font-mono text-[10px] text-zinc-500 overflow-x-auto max-h-36 leading-normal select-all">
          <span className="text-red-400 font-bold block mb-1">Error: {error.message || 'Unknown runtime error'}</span>
          {error.digest && <span className="block mt-0.5 opacity-60">Digest: {error.digest}</span>}
          {error.stack && <span className="block mt-1 whitespace-pre-wrap opacity-50">{error.stack}</span>}
        </div>

        {/* Recovery Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_2px_12px_rgba(16,185,129,0.2)] hover:scale-[1.01]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>System Re-boot</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
          >
            <Home className="w-4 h-4 text-zinc-500" />
            <span>Dashboard Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
