'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled runtime exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex flex-col justify-center items-center p-6 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-red-950/20 border border-red-500/30 flex items-center justify-center text-red-500 mb-6 shadow-lg">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-black text-zinc-100 tracking-tight">System Exception Intercepted</h2>
          <p className="text-sm text-zinc-500 mt-2 max-w-md leading-relaxed font-medium">
            The workspace engine encountered a runtime compilation or state boundary error. Please reload the console to clear active memory caches.
          </p>

          {this.state.error && (
            <div className="mt-5 p-4 bg-zinc-950 border border-zinc-900 rounded-2xl text-[11px] font-mono text-left max-w-lg text-red-400 overflow-x-auto select-text">
              {this.state.error.name}: {this.state.error.message}
            </div>
          )}

          <button
            onClick={this.handleReset}
            className="mt-8 px-6 py-3 bg-red-500 hover:bg-red-400 text-zinc-950 font-black rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Core Instance</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
