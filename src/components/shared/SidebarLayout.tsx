/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, GitFork, BookOpen, MessageSquare, 
  Award, Trophy, HelpCircle, Menu, X, Flame, Plus, Trash2, Settings, LogOut
} from 'lucide-react';
import { useStore } from '@/store';
import { supabase } from '@/lib/supabase';
import { syncFromCloud, syncToCloud } from '@/lib/sync';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountAvatar, setNewAccountAvatar] = useState("💻");
  
  const user = useStore((state) => state.user);
  const accounts = useStore((state) => state.accounts);
  const activeAccountIndex = useStore((state) => state.activeAccountIndex);
  const switchAccount = useStore((state) => state.switchAccount);
  const addNewAccount = useStore((state) => state.addNewAccount);
  const removeAccount = useStore((state) => state.removeAccount);
  const incrementStreak = useStore((state) => state.incrementStreak);
  const githubUser = useStore((state) => state.githubUser);
  const uiPreferences = useStore((state) => state.uiPreferences);
  
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const completedDsa = useStore((state) => state.completedDsaQuestions);
  const completedLangLessons = useStore((state) => state.completedLanguageLessons);
  const achievements = useStore((state) => state.achievements);
  const tutorChats = useStore((state) => state.tutorChats);
  const toasts = useStore((state) => state.toasts);
  const dismissToast = useStore((state) => state.dismissToast);

  // Sync hydration checks
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  // Sync streaks on client load
  useEffect(() => {
    incrementStreak();
  }, [incrementStreak]);

  // Listen to Supabase Auth State changes for Cloud Syncing!
  useEffect(() => {
    const checkSession = async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const hasRealSupabase = !!(url && key && !url.includes('placeholder') && !key.includes('placeholder'));
      
      // Resolve or generate local guest ID to enable real Postgres persistence when offline/logged out
      let guestId = typeof window !== 'undefined' ? localStorage.getItem('byteacademy_guest_id') : null;
      if (!guestId && typeof window !== 'undefined') {
        guestId = 'guest_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('byteacademy_guest_id', guestId);
      }

      if (!hasRealSupabase) {
        setSessionToken(guestId);
        await syncFromCloud(guestId || 'guest_default');
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const githubUsername = session.user.user_metadata.user_name || session.user.user_metadata.preferred_username || session.user.email?.split('@')[0] || 'Cloud Coder';
          const avatarUrl = session.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${githubUsername}`;
          
          useStore.getState().connectGithub(githubUsername, avatarUrl, false);
          setSessionToken(session.access_token);
          await syncFromCloud(session.access_token);
        } else {
          setSessionToken(guestId);
          await syncFromCloud(guestId || 'guest_default');
        }
      } catch (err) {
        console.error('Supabase session load failure:', err);
        setSessionToken(guestId);
        await syncFromCloud(guestId || 'guest_default');
      }
    };

    checkSession();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasRealSupabase = !!(url && key && !url.includes('placeholder') && !key.includes('placeholder'));

    if (hasRealSupabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        let guestId = typeof window !== 'undefined' ? localStorage.getItem('byteacademy_guest_id') : null;
        if (!guestId && typeof window !== 'undefined') {
          guestId = 'guest_' + Math.random().toString(36).substring(2, 15);
          localStorage.setItem('byteacademy_guest_id', guestId);
        }

        if (session && session.user) {
          const githubUsername = session.user.user_metadata.user_name || session.user.user_metadata.preferred_username || session.user.email?.split('@')[0] || 'Cloud Coder';
          const avatarUrl = session.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${githubUsername}`;
          
          useStore.getState().connectGithub(githubUsername, avatarUrl, false);
          setSessionToken(session.access_token);
          
          if (event === 'SIGNED_IN') {
            await syncFromCloud(session.access_token);
            await syncToCloud(session.access_token);
          }
        } else if (event === 'SIGNED_OUT') {
          useStore.getState().disconnectGithub();
          setSessionToken(guestId);
          await syncFromCloud(guestId || 'guest_default');
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Debounced background sync effect to push Zustand changes to PostgreSQL
  useEffect(() => {
    if (!sessionToken) return;

    const timer = setTimeout(() => {
      syncToCloud(sessionToken);
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    user.xp,
    completedDsa.length,
    completedLangLessons,
    achievements.length,
    tutorChats,
    sessionToken,
    user.name,
    user.avatar,
  ]);

  if (pathname === '/' || pathname === '/login') {
    return <>{children}</>;
  }

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'DSA Roadmap', path: '/roadmap', icon: GitFork },
    { name: 'Language Tracks', path: '/languages', icon: BookOpen },
    { name: 'AI Code Tutor', path: '/tutor', icon: MessageSquare },
    { name: 'Practice Quizzes', path: '/quizzes', icon: HelpCircle },
    { name: 'Mock Interviews', path: '/interviews', icon: Award },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  // Calculate XP percentage for level meter
  const xpInCurrentLevel = user.xp % 1000;
  const levelProgress = (xpInCurrentLevel / 1000) * 100;

  // Dynamic Theme Mapping
  const themeClass = 
    uiPreferences.theme === 'oled' ? 'bg-black text-zinc-100' :
    uiPreferences.theme === 'emerald' ? 'bg-[#030604] text-emerald-100 border-emerald-950/40' :
    uiPreferences.theme === 'cyberpunk' ? 'bg-[#0a0212] text-fuchsia-100 border-fuchsia-950/40' :
    'bg-zinc-950 text-zinc-100';

  // COMPLETE Font Sizing Overhaul (Significantly Larger default scales)
  const fontClass = 
    uiPreferences.fontSize === 'compact' ? 'text-sm select-none tracking-tight font-medium' :
    uiPreferences.fontSize === 'large' ? 'text-lg lg:text-xl select-none tracking-normal leading-relaxed font-semibold' :
    'text-base select-none tracking-normal font-semibold leading-relaxed';

  return (
    <div className={`min-h-screen flex ${themeClass} ${fontClass} overflow-hidden relative`}>
      {/* Dynamic ambient backgrounds */}
      {uiPreferences.theme === 'cyberpunk' ? (
        <>
          <div className="absolute top-0 right-0 w-[45vw] h-[45vh] bg-fuchsia-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
          <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none z-0" />
        </>
      ) : uiPreferences.theme === 'emerald' ? (
        <>
          <div className="absolute top-0 right-0 w-[45vw] h-[45vh] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
          <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
        </>
      ) : (
        <>
          <div className="absolute top-0 right-0 w-[45vw] h-[45vh] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
          <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
        </>
      )}

      {/* Desktop Sidebar - Enlarged Width (w-72) */}
      <aside className="w-72 bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-900 hidden lg:flex flex-col z-30 relative shrink-0">
        
        {/* Platform Branding Logo - Scaled Up */}
        <div className="h-20 px-8 border-b border-zinc-900 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 select-none hover:scale-[1.01] transition-transform">
            <span className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-zinc-950 text-lg shadow-[0_0_12px_rgba(16,185,129,0.4)]">
              B
            </span>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              ByteAcademy
            </span>
          </Link>
          <span className="text-[10px] bg-zinc-900 border border-zinc-850 text-zinc-400 font-mono font-bold px-2 py-0.5 rounded shadow-sm">
            PRO
          </span>
        </div>

        {/* User Mini Profile Profile Card - Enlarged Padding and Components */}
        <div 
          onClick={() => setShowUserDropdown(prev => !prev)}
          className="p-6 border-b border-zinc-900 flex flex-col gap-3.5 bg-zinc-900/10 relative hover:bg-zinc-900/40 cursor-pointer select-none transition-colors group duration-200"
        >
          {mounted ? (
            <>
              {/* Spring Animated Account Actions Popover */}
              <AnimatePresence>
                {showUserDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-20 left-4 right-4 bg-[#0a0a0c]/98 border border-zinc-850 p-4.5 rounded-2xl shadow-2xl space-y-4 z-40 backdrop-blur-2xl"
                  >
                    {/* Header */}
                    <div className="border-b border-zinc-900 pb-2 text-[10px] text-zinc-400 font-mono flex items-center justify-between">
                      <span>SWITCH DEVELOPER PROFILE</span>
                      <span className="text-emerald-450 font-bold bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded uppercase font-mono text-[8px]">
                        {accounts.length} Profiles
                      </span>
                    </div>

                    {/* Accounts switcher list */}
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {accounts.map((acc, index) => (
                        <div
                          key={acc.id}
                          onClick={() => {
                            switchAccount(index);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all hover:bg-zinc-900/60 cursor-pointer group relative ${
                            index === activeAccountIndex 
                              ? 'bg-zinc-900 border border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.4)]' 
                              : 'border border-transparent hover:border-zinc-900'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8.5 h-8.5 rounded-lg bg-zinc-950 border border-zinc-850 flex items-center justify-center text-base shadow-inner overflow-hidden shrink-0">
                              {acc.githubConnected && acc.githubAvatarUrl ? (
                                <img src={acc.githubAvatarUrl} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <span>{acc.avatar}</span>
                              )}
                            </div>
                            <div className="text-left overflow-hidden min-w-0 flex-1">
                              <span className="font-bold text-zinc-200 block leading-tight truncate max-w-[140px] group-hover:text-emerald-400 transition-colors text-sm" title={acc.name}>{acc.name}</span>
                              <span className="text-[10px] text-zinc-500 font-mono mt-1 block">Lvl {acc.level} • {acc.xp} XP</span>
                            </div>
                          </div>
                          
                          {index === activeAccountIndex ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0 mr-1" />
                          ) : (
                            accounts.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Delete profile "${acc.name}"? All local progress for this account will be lost.`)) {
                                    removeAccount(acc.id);
                                  }
                                }}
                                className="text-zinc-650 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-800/80 rounded-md shrink-0"
                                title="Remove Profile"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Account CTA */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUserDropdown(false);
                        setShowCreateAccountModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-2.5 py-2.5 hover:bg-emerald-950/20 text-xs text-emerald-400 hover:text-emerald-350 font-bold border border-dashed border-emerald-900/20 hover:border-emerald-500/40 rounded-xl transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add new profile...</span>
                    </button>

                    {/* Divider */}
                    <div className="border-t border-zinc-900 pt-2.5 space-y-1.5">
                      <Link 
                        href="/settings"
                        onClick={() => setShowUserDropdown(false)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-zinc-900/60 transition-colors text-zinc-300 font-bold"
                      >
                        <Settings className="w-4 h-4 text-zinc-500" />
                        <span>Account Settings</span>
                      </Link>
                      
                      <button
                        onClick={async () => {
                          setShowUserDropdown(false);
                          if (window.confirm("Securely sign out of current ByteAcademy profile?")) {
                            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
                            const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
                            const hasRealSupabase = !!(url && key && !url.includes('placeholder') && !key.includes('placeholder'));
                            if (hasRealSupabase) {
                              try {
                                await supabase.auth.signOut();
                              } catch (e) {
                                console.error('Supabase sign out error:', e);
                              }
                            }
                            useStore.getState().disconnectGithub();
                            window.location.href = "/";
                          }
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-red-950/20 transition-colors text-left text-red-400 font-bold"
                      >
                        <LogOut className="w-4 h-4 text-red-500/60" />
                        <span>Secure Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3.5 min-w-0 w-full">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-850 flex items-center justify-center overflow-hidden text-2xl shadow-inner shrink-0 group-hover:border-zinc-700/60 transition-colors">
                  {githubUser ? (
                    <img 
                      src={githubUser.avatarUrl} 
                      alt={githubUser.username} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${githubUser.username}`;
                      }}
                    />
                  ) : (
                    <span className="text-2xl select-none">{user.avatar}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-extrabold text-zinc-200 truncate leading-tight group-hover:text-emerald-400 transition-colors" title={user.name}>{user.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/40 font-mono">
                      LVL {user.level}
                    </span>
                    <span className="text-[10.5px] text-zinc-400 flex items-center gap-0.5 font-mono font-bold">
                      {xpInCurrentLevel}/1k XP
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Level progress bar - scaled height */}
              <div className="w-full mt-2">
                <div className="w-full h-2.5 bg-zinc-900 border border-zinc-850 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                    style={{ width: `${levelProgress}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="h-14 w-full animate-pulse bg-zinc-900/50 rounded-xl" />
          )}
        </div>

        {/* Sidebar Nav links - Scaled Up Text Sizing and padding */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3.5 px-4.5 py-3 rounded-2xl text-sm lg:text-[15px] font-black tracking-normal transition-all duration-205 group relative hover:scale-[1.01] ${
                  isActive 
                    ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-900/30' 
                    : 'text-zinc-450 hover:text-zinc-100 hover:bg-zinc-900/30 border border-transparent'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute left-0 w-1.5 h-1/2 bg-emerald-500 rounded-r-md" 
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar bottom info - scaled text sizing */}
        <div className="p-6 border-t border-zinc-900">
          {mounted && (
            <div className="flex items-center justify-between bg-zinc-900/30 border border-zinc-850 p-3 rounded-2xl">
              <span className="text-[11.5px] text-zinc-500 font-mono font-bold">Streak Status:</span>
              <div className="flex items-center gap-1.5">
                <Flame className={`w-5 h-5 ${user.streakDays > 0 ? 'text-orange-500 fill-orange-500/20 animate-pulse' : 'text-zinc-600'}`} />
                <span className="text-sm font-black text-zinc-100">{user.streakDays} Days</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Floating Drawer Header - Scaled up sizes */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 flex items-center justify-between px-5 z-40">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-zinc-950 text-sm shadow-[0_0_8px_rgba(16,185,129,0.4)]">
            B
          </span>
          <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            ByteAcademy
          </span>
        </Link>
        
        <div className="flex items-center gap-3">
          {mounted && (
            <div className="flex items-center gap-1.5 text-xs font-black px-3 py-1 bg-zinc-900 border border-zinc-850 rounded-xl">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500/10" />
              <span>{user.streakDays}d</span>
            </div>
          )}
          
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer Modal - Scaled up */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="fixed inset-y-0 left-0 w-72 bg-zinc-950 border-r border-zinc-900 p-5 flex flex-col z-50 lg:hidden shadow-2xl"
          >
            <div className="flex justify-between items-center pb-4 border-b border-zinc-900 mb-5">
              <span className="font-black text-sm tracking-tight text-white uppercase">Navigation</span>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-zinc-900 rounded-lg">
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
            
            <nav className="flex-1 space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      isActive 
                        ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-900/10 font-black' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            
            <div className="pt-4 border-t border-zinc-900">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center overflow-hidden shrink-0">
                  {githubUser ? (
                    <img 
                      src={githubUser.avatarUrl} 
                      alt={githubUser.username} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${githubUser.username}`;
                      }}
                    />
                  ) : (
                    <span className="text-lg select-none">{user.avatar}</span>
                  )}
                </div>
                <div className="text-xs min-w-0 flex-1">
                  <p className="font-black text-zinc-200 truncate leading-tight max-w-[160px]" title={user.name}>{user.name}</p>
                  <p className="text-emerald-450 font-mono font-bold mt-1.5">Level {user.level}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Workspace Frame - Wide and responsive gutters scaled up */}
      <main className="flex-1 h-screen flex flex-col pt-16 lg:pt-0 overflow-y-auto relative z-10">
        <div className="flex-1 p-4 md:p-8 lg:p-10 max-w-full xl:px-12 w-full mx-auto pb-14">
          {children}
        </div>
      </main>

      {/* Create Account Dialog Modal - Scaled up */}
      <AnimatePresence>
        {showCreateAccountModal && (
          <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-[4px] flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6.5 w-full max-w-sm shadow-2xl relative space-y-5.5"
            >
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">➕</span>
                  <h2 className="text-sm font-bold text-zinc-100">Create Developer Profile</h2>
                </div>
                <button 
                  onClick={() => setShowCreateAccountModal(false)}
                  className="p-1.5 hover:bg-zinc-900 rounded-lg"
                >
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>

              <div className="space-y-4.5">
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-400 mb-2">
                    Profile Nickname
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CoderPro"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 transition-colors text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-400 mb-2.5">
                    Select Avatar Emoji
                  </label>
                  <div className="grid grid-cols-5 gap-2.5 bg-zinc-900/50 border border-zinc-900/60 p-3.5 rounded-2xl">
                    {['🧙‍♂️', '🚀', '💻', '🧠', '👾', '🔥', '⚡', '🦉', '🦊', '🐱'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewAccountAvatar(emoji)}
                        className={`w-9.5 h-9.5 rounded-xl bg-zinc-950 border flex items-center justify-center text-xl transition-all ${
                          newAccountAvatar === emoji
                            ? 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                            : 'border-zinc-850 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateAccountModal(false)}
                    className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-zinc-300 rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newAccountName.trim()) return;
                      addNewAccount(newAccountName.trim(), newAccountAvatar);
                      setNewAccountName("");
                      setShowCreateAccountModal(false);
                    }}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Create Profile</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast System Notification Overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts && toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
              className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-between gap-4 pointer-events-auto shadow-2xl backdrop-blur-md ${
                t.type === 'success' ? 'bg-[#030d05]/95 border-emerald-500/30 text-emerald-450' :
                t.type === 'error' ? 'bg-[#0d0303]/95 border-red-500/30 text-red-450' :
                t.type === 'warning' ? 'bg-[#0d0903]/95 border-amber-500/30 text-amber-450' :
                'bg-zinc-950/95 border-zinc-850 text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span>
                  {t.type === 'success' ? '🟢' :
                   t.type === 'error' ? '🔴' :
                   t.type === 'warning' ? '🟡' :
                   '🔵'}
                </span>
                <span>{t.message}</span>
              </div>
              <button
                onClick={() => dismissToast(t.id)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                aria-label="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
