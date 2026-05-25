'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Sliders, Link2, Trash2, Check, Shield, 
  Monitor, Volume2, Bell, Plus, Users, Sparkles, Key, Loader2
} from 'lucide-react';
import { useStore } from '@/store';
import { supabase } from '@/lib/supabase';

export default function AccountSettings() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'integrations'>('profile');
  const [usernameInput, setUsernameInput] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const user = useStore((state) => state.user);
  const accounts = useStore((state) => state.accounts);
  const activeAccountIndex = useStore((state) => state.activeAccountIndex);
  const switchAccount = useStore((state) => state.switchAccount);
  const addNewAccount = useStore((state) => state.addNewAccount);
  const removeAccount = useStore((state) => state.removeAccount);
  const updateProfile = useStore((state) => state.updateProfile);
  
  const uiPreferences = useStore((state) => state.uiPreferences);
  const updateUiPreferences = useStore((state) => state.updateUiPreferences);

  const githubUser = useStore((state) => state.githubUser);
  const disconnectGithub = useStore((state) => state.disconnectGithub);
  const resetProgress = useStore((state) => state.resetProgress);

  const [googleLinked, setGoogleLinked] = useState(false);
  const [discordLinked, setDiscordLinked] = useState(false);
  const [vercelLinked, setVercelLinked] = useState(false);
  const [isLinkingProvider, setIsLinkingProvider] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createAvatar, setCreateAvatar] = useState("🧙‍♂️");

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      setUsernameInput(user.name);
      setSelectedEmoji(user.avatar || '🤖');
    }, 0);
    return () => clearTimeout(t);
  }, [user]);

  const hasRealSupabase = typeof window !== 'undefined' && 
    !!(process.env.NEXT_PUBLIC_SUPABASE_URL && 
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
       !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') && 
       !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder'));

  const avatarEmojis = ['🤖', '💻', '🦊', '⚡', '🧠', '🧙‍♂️', '👾', '🚀', '🐱', '🦄', '🦁', '🦉'];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    updateProfile(usernameInput.trim(), selectedEmoji);
    setSaveSuccessMsg("Profile handle updated successfully!");
    setTimeout(() => setSaveSuccessMsg(""), 3000);
  };

  const handleResetConfirm = () => {
    resetProgress();
    setShowResetConfirm(false);
    alert("Local progress reset complete. Relogging sandbox instance...");
    window.location.href = "/";
  };

  const handleGithubLink = async () => {
    if (!hasRealSupabase) {
      alert("GitHub linking requires a configured Supabase database session. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY inside .env.local to enable secure OAuth persistent bindings.");
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/settings`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      alert(`Supabase GitHub link failed: ${err.message}`);
    }
  };

  const handleGithubDisconnect = async () => {
    if (window.confirm("Disconnect GitHub account? Cloud synchronization will pause.")) {
      if (hasRealSupabase) {
        await supabase.auth.signOut();
      }
      disconnectGithub();
      setSaveSuccessMsg("GitHub profile unlinked successfully.");
      setTimeout(() => setSaveSuccessMsg(""), 3000);
    }
  };

  const handleLinkProvider = async (provider: string) => {
    setIsLinkingProvider(provider);
    
    if (uiPreferences.soundEffects && typeof Audio !== 'undefined') {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (e) {}
    }

    await new Promise(resolve => setTimeout(resolve, 1400));
    
    if (provider === 'google') setGoogleLinked(prev => !prev);
    if (provider === 'discord') setDiscordLinked(prev => !prev);
    if (provider === 'vercel') setVercelLinked(prev => !prev);
    
    setIsLinkingProvider(null);
  };

  const handleCreateNewAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;

    addNewAccount(createName.trim(), createAvatar);
    setCreateName("");
    setShowCreateForm(false);
    setSaveSuccessMsg("New developer profile registered successfully!");
    setTimeout(() => setSaveSuccessMsg(""), 3000);
  };

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-full xl:px-4 mx-auto h-[calc(100vh-100px)] flex flex-col overflow-hidden font-sans">
      {/* Settings Header Bar - Enlarged */}
      <div className="border-b border-zinc-900 pb-5 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter flex items-center gap-3">
            System Control Center
            <span className="text-xs bg-emerald-950/40 border border-emerald-900/35 text-emerald-450 font-mono font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Level {user.level} Coder
            </span>
          </h1>
          <p className="text-sm md:text-base text-zinc-450 mt-2 font-medium">Configure profile switching, dashboard styling themes, and local sync controls.</p>
        </div>
      </div>

      {/* Split Layout: Settings Tabs Navigation + Detail Card - Enlarged widths and scale */}
      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
        {/* Left Column: Tab Switchers - Width increased to lg:w-72 */}
        <div className="w-full lg:w-72 bg-zinc-950/40 border border-zinc-900 rounded-3xl p-5 flex flex-col gap-3 shrink-0 h-fit">
          <div className="text-[10px] font-black text-zinc-650 font-mono uppercase tracking-wider mb-2 px-3">
            Core Modules
          </div>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-4.5 px-4.5 py-3.5 rounded-2xl border text-sm lg:text-base font-black transition-all ${
              activeTab === 'profile'
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 font-extrabold shadow-[0_2px_8px_rgba(16,185,129,0.05)]'
                : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/20'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Profile & Account Switcher</span>
          </button>
          
          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-4.5 px-4.5 py-3.5 rounded-2xl border text-sm lg:text-base font-black transition-all ${
              activeTab === 'appearance'
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 font-extrabold shadow-[0_2px_8px_rgba(16,185,129,0.05)]'
                : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/20'
            }`}
          >
            <Sliders className="w-5 h-5" />
            <span>UI & Theme Preferences</span>
          </button>
          
          <button
            onClick={() => setActiveTab('integrations')}
            className={`w-full flex items-center gap-4.5 px-4.5 py-3.5 rounded-2xl border text-sm lg:text-base font-black transition-all ${
              activeTab === 'integrations'
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 font-extrabold shadow-[0_2px_8px_rgba(16,185,129,0.05)]'
                : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/20'
            }`}
          >
            <Link2 className="w-5 h-5" />
            <span>Connected Integrations</span>
          </button>
        </div>

        {/* Right Column: Tab View Workspace */}
        <div className="flex-1 bg-zinc-900/10 border border-zinc-900 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative h-full">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
            <AnimatePresence mode="wait">
              
              {/* Tab 1: Profile & Multi-Account Switcher */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div className="border-b border-zinc-900 pb-4">
                    <h3 className="text-lg lg:text-xl font-black text-zinc-100">Personal Details</h3>
                    <p className="text-xs lg:text-sm text-zinc-500 mt-1 font-medium">Customize your displayed persona, handle credentials, and avatar bot.</p>
                  </div>

                  {/* Profile Edit Form */}
                  <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                        <label className="block text-[11px] uppercase font-mono font-bold tracking-wider text-zinc-400">
                          Display Handle
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={24}
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-zinc-200"
                        />
                      </div>
                      
                      <div className="space-y-2.5">
                        <label className="block text-[11px] uppercase font-mono font-bold tracking-wider text-zinc-400">
                          Selected Avatar Symbol
                        </label>
                        <div className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl px-5 py-4 text-sm text-zinc-400 flex items-center gap-3">
                          <span className="text-2xl">{selectedEmoji}</span>
                          <span className="font-mono font-bold">({selectedEmoji === user.avatar ? 'Active' : 'Modified'})</span>
                        </div>
                      </div>
                    </div>

                    {/* Custom Emojis Selector Grid */}
                    <div className="space-y-4">
                      <label className="block text-[11px] uppercase font-mono font-bold tracking-wider text-zinc-400">
                        Choose Avatar Emoji
                      </label>
                      <div className="grid grid-cols-6 sm:grid-cols-8 gap-3 max-w-lg bg-zinc-950 border border-zinc-900 p-5 rounded-3xl shadow-inner">
                        {avatarEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setSelectedEmoji(emoji)}
                            className={`w-12 h-12 rounded-xl bg-zinc-900 border flex items-center justify-center text-2xl transition-all shadow-sm hover:scale-105 active:scale-95 ${
                              selectedEmoji === emoji
                                ? 'border-emerald-500 bg-emerald-950/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                                : 'border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status Feedback bar */}
                    {saveSuccessMsg && (
                      <div className="p-4 bg-emerald-950/30 border border-emerald-900/35 rounded-2xl text-xs lg:text-sm text-emerald-450 font-bold flex items-center gap-2.5 w-fit">
                        <Check className="w-5 h-5 stroke-[3.5]" />
                        <span>{saveSuccessMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl text-xs lg:text-sm flex items-center gap-2 transition-all shadow-lg hover:scale-[1.01]"
                    >
                      <span>Save profile changes</span>
                    </button>
                  </form>

                  {/* Multi-Account Hub List */}
                  <div className="border-t border-zinc-900/80 pt-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h4 className="text-base lg:text-lg font-black text-zinc-100 flex items-center gap-2">
                          <Users className="w-5 h-5 text-emerald-450" />
                          Multi-Profile Switcher Hub
                        </h4>
                        <p className="text-xs lg:text-sm text-zinc-550 mt-1 font-medium">Manage and seamlessly toggle between multiple registered developer accounts.</p>
                      </div>
                      
                      {!showCreateForm && (
                        <button
                          type="button"
                          onClick={() => setShowCreateForm(true)}
                          className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-bold rounded-2xl text-zinc-350 flex items-center gap-2 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Register New Profile</span>
                        </button>
                      )}
                    </div>

                    {/* Account Creator Form inside settings */}
                    <AnimatePresence>
                      {showCreateForm && (
                        <motion.form
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          onSubmit={handleCreateNewAccount}
                          className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl max-w-2xl space-y-5 overflow-hidden"
                        >
                          <div className="text-sm font-black text-zinc-200 flex items-center justify-between">
                            <span>Register Developer Handle</span>
                            <button 
                              type="button" 
                              onClick={() => setShowCreateForm(false)}
                              className="text-zinc-550 hover:text-zinc-300 text-xs font-mono font-bold"
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500">
                                Coder Handle Name
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. ArchitectDev"
                                value={createName}
                                onChange={(e) => setCreateName(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl px-4 py-3 text-xs lg:text-sm focus:outline-none focus:border-emerald-500 transition-colors text-zinc-200"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500">
                                Select Bot Symbol
                              </label>
                              <div className="flex gap-2 bg-zinc-900 border border-zinc-850 p-1.5 rounded-2xl w-fit">
                                {['🧙‍♂️', '🚀', '💻', '🧠', '👾'].map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setCreateAvatar(emoji)}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-colors ${
                                      createAvatar === emoji ? 'bg-zinc-800 border border-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl text-xs lg:text-sm transition-colors"
                          >
                            Add profile handle
                          </button>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    {/* Developer Profiles Grid list - Enlarged cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                      {accounts.map((acc, index) => (
                        <div 
                          key={acc.id}
                          className={`p-5 bg-zinc-950/60 border rounded-3xl flex items-center justify-between group hover:scale-[1.01] transition-all duration-200 ${
                            index === activeAccountIndex 
                              ? 'border-emerald-500 bg-emerald-950/5 shadow-[0_4px_15px_-5px_rgba(16,185,129,0.15)]' 
                              : 'border-zinc-900 hover:border-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-2xl shadow-inner shrink-0 overflow-hidden">
                              {acc.githubConnected && acc.githubAvatarUrl ? (
                                <img src={acc.githubAvatarUrl} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <span>{acc.avatar}</span>
                              )}
                            </div>
                            <div>
                              <h5 className="text-sm lg:text-base font-black text-zinc-200 leading-none">{acc.name}</h5>
                              <span className="text-[10px] lg:text-xs font-mono text-zinc-500 block mt-1.5 font-semibold">
                                Level {acc.level} • {acc.xp} XP
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {index === activeAccountIndex ? (
                              <span className="text-[9px] bg-emerald-950 border border-emerald-900 text-emerald-450 px-3 py-1 rounded-lg font-mono font-extrabold uppercase shadow-sm">
                                active
                              </span>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => switchAccount(index)}
                                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-xs text-zinc-400 hover:text-white font-bold rounded-xl transition-colors"
                                >
                                  Switch
                                </button>
                                {accounts.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`Delete profile "${acc.name}"? Progress cannot be recovered.`)) {
                                        removeAccount(acc.id);
                                      }
                                    }}
                                    className="p-2 hover:bg-zinc-900 text-zinc-650 hover:text-red-400 border border-transparent hover:border-zinc-850 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Visual Display Preferences & Theme Engine */}
              {activeTab === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div className="border-b border-zinc-900 pb-4">
                    <h3 className="text-lg lg:text-xl font-black text-zinc-100">Visual & UI Customizations</h3>
                    <p className="text-xs lg:text-sm text-zinc-500 mt-1 font-medium">Adapt screen scaling sizes, font density weights, sound matrices, and visual backgrounds.</p>
                  </div>

                  {/* Theme Mode Selector Grid - Enlarged height */}
                  <div className="space-y-4">
                    <label className="block text-[11px] uppercase font-mono font-bold tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Monitor className="w-4 h-4 text-zinc-500" />
                      Visual Mode Themes
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl">
                      {[
                        { id: 'dark', label: 'Developer Dark', desc: 'Sleek dark zinc layout framework', badge: 'STABLE' },
                        { id: 'oled', label: 'OLED Black', desc: 'Deep high contrast absolute black', badge: 'HIGH CONTRAST' },
                        { id: 'emerald', label: 'Emerald Glow', desc: 'Matrix green terminal neon overlay', badge: 'IMMERSIVE' },
                        { id: 'cyberpunk', label: 'Cyberpunk Neon', desc: 'Retro amber and violet ambient glow', badge: 'RETRO GLOW' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => updateUiPreferences({ theme: t.id as 'dark' | 'oled' | 'emerald' | 'cyberpunk' })}
                          className={`p-5 rounded-3xl border text-left flex flex-col justify-between h-32 transition-all hover:scale-[1.01] ${
                            uiPreferences.theme === t.id
                              ? 'bg-emerald-950/20 border-emerald-500 text-white shadow-[0_4px_15px_-5px_rgba(16,185,129,0.15)] font-bold'
                              : 'bg-zinc-950/60 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                          }`}
                        >
                          <div className="flex justify-between w-full items-start">
                            <span className="text-sm font-black text-zinc-200">{t.label}</span>
                            {uiPreferences.theme === t.id && (
                              <span className="text-[8px] bg-emerald-950 border border-emerald-900 text-emerald-450 px-1.5 py-0.2 rounded-lg font-mono font-extrabold uppercase">
                                active
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-500 font-normal leading-relaxed mt-2.5">{t.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sizing & physics controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                    {/* Font Density Layout selector */}
                    <div className="space-y-4">
                      <label className="block text-[11px] uppercase font-mono font-bold tracking-wider text-zinc-400">
                        Font Density Layout scale
                      </label>
                      <div className="flex bg-zinc-950 border border-zinc-900 p-2 rounded-2xl w-fit">
                        {[
                          { id: 'compact', label: 'Dense/Compact' },
                          { id: 'standard', label: 'Standard/Balanced' },
                          { id: 'large', label: 'Large Text' }
                        ].map((fs) => (
                          <button
                            key={fs.id}
                            type="button"
                            onClick={() => updateUiPreferences({ fontSize: fs.id as 'compact' | 'standard' | 'large' })}
                            className={`px-4.5 py-2.5 rounded-xl text-xs lg:text-sm transition-colors font-bold ${
                              uiPreferences.fontSize === fs.id
                                ? 'bg-zinc-900 border border-zinc-800 text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300 bg-transparent'
                            }`}
                          >
                            {fs.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Motion Settings Selector */}
                    <div className="space-y-4">
                      <label className="block text-[11px] uppercase font-mono font-bold tracking-wider text-zinc-400">
                        Framerate Easing Physics
                      </label>
                      <div className="flex bg-zinc-950 border border-zinc-900 p-2 rounded-2xl w-fit">
                        {[
                          { id: 'spring', label: 'Spring Easing' },
                          { id: 'tween', label: 'Linear Tween' },
                          { id: 'reduced', label: 'Reduced Motion' }
                        ].map((mot) => (
                          <button
                            key={mot.id}
                            type="button"
                            onClick={() => updateUiPreferences({ motionPhysics: mot.id as 'spring' | 'tween' | 'reduced' })}
                            className={`px-4.5 py-2.5 rounded-xl text-xs lg:text-sm transition-colors font-bold ${
                              uiPreferences.motionPhysics === mot.id
                                ? 'bg-zinc-900 border border-zinc-800 text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300 bg-transparent'
                            }`}
                          >
                            {mot.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sound & Notifications Toggles */}
                  <div className="space-y-5">
                    <label className="block text-[11px] uppercase font-mono font-bold tracking-wider text-zinc-400">
                      System Alert & Synthesis click matrices
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                      <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-3xl flex items-center justify-between shadow-sm">
                        <div className="space-y-1">
                          <span className="text-xs lg:text-sm font-black text-zinc-200 flex items-center gap-2">
                            <Volume2 className="w-5 h-5 text-emerald-450" />
                            Synthesized Sound Feedback
                          </span>
                          <p className="text-[11px] text-zinc-500 max-w-[240px] font-medium leading-normal">Trigger micro audio clicks when selecting options and submitting questions.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateUiPreferences({ soundEffects: !uiPreferences.soundEffects })}
                          className={`w-12 h-7 rounded-full p-0.5 transition-colors shrink-0 ${
                            uiPreferences.soundEffects ? 'bg-emerald-500' : 'bg-zinc-900 border border-zinc-800'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                            uiPreferences.soundEffects ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-3xl flex items-center justify-between shadow-sm">
                        <div className="space-y-1">
                          <span className="text-xs lg:text-sm font-black text-zinc-200 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-emerald-450" />
                            Daily Email Reminders
                          </span>
                          <p className="text-[11px] text-zinc-500 max-w-[240px] font-medium leading-normal">Receive daily quest updates to preserve your flawless streak fires.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateUiPreferences({ dailyReminder: !uiPreferences.dailyReminder })}
                          className={`w-12 h-7 rounded-full p-0.5 transition-colors shrink-0 ${
                            uiPreferences.dailyReminder ? 'bg-emerald-500' : 'bg-zinc-900 border border-zinc-800'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                            uiPreferences.dailyReminder ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Database & OAuth Connected accounts */}
              {activeTab === 'integrations' && (
                <motion.div
                  key="integrations"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div className="border-b border-zinc-900 pb-4">
                    <h3 className="text-lg lg:text-xl font-black text-zinc-100">Database & OAuth Integrations</h3>
                    <p className="text-xs lg:text-sm text-zinc-500 mt-1 font-medium">Manage production cloud databases, linked networks, and system data resets.</p>
                  </div>

                  {/* Supabase status telemetry details */}
                  <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-3xl flex items-center justify-between max-w-4xl">
                    <div className="space-y-1.5">
                      <span className="text-xs lg:text-sm font-black text-zinc-200 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-450" />
                        Supabase Database Health
                      </span>
                      <p className="text-xs lg:text-sm text-zinc-500 max-w-xl leading-relaxed font-semibold">
                        Verifies if active PostgreSQL client tokens are present to support real authenticated cloud synchronization.
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-xl border text-[10px] font-bold font-mono uppercase ${
                      hasRealSupabase 
                        ? 'bg-emerald-950/40 border-emerald-900/35 text-emerald-400' 
                        : 'bg-amber-950/40 border-amber-900/35 text-amber-500'
                    }`}>
                      {hasRealSupabase ? 'Active Cloud Connected' : 'Active DB Persistent'}
                    </span>
                  </div>

                  {/* GitHub Connector Card */}
                  <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-5 max-w-4xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 shadow-inner">
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xs lg:text-sm font-black text-zinc-200">GitHub Developer Connection</h4>
                          <span className="text-[10px] font-mono text-zinc-550 block mt-1 font-bold">
                            Status: {githubUser ? 'Supabase OAuth Connected' : 'Disconnected'}
                          </span>
                        </div>
                      </div>

                      {githubUser ? (
                        <button
                          type="button"
                          onClick={handleGithubDisconnect}
                          className="px-4.5 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-red-950/20 text-zinc-300 hover:text-red-400 rounded-2xl text-xs lg:text-sm font-bold transition-all"
                        >
                          Unlink Profile
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleGithubLink}
                          className="px-4.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl text-xs lg:text-sm transition-all shadow-md animate-pulse"
                        >
                          Connect GitHub
                        </button>
                      )}
                    </div>

                    {githubUser && (
                      <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl space-y-2.5 text-xs text-zinc-500 font-mono font-semibold">
                        <div className="flex justify-between">
                          <span>Developer Identity:</span>
                          <span className="text-zinc-200 font-bold">@{githubUser.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Telemetry Provider:</span>
                          <span className="text-zinc-200">Supabase OAuth Client</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last synchronized commit:</span>
                          <span className="text-zinc-200">{githubUser.lastSync}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interactive Connected Accounts Matrix Grid (Google, Discord, Vercel) - Scaled Up h-40 */}
                  <div className="space-y-4 max-w-4xl">
                    <label className="block text-[11px] uppercase font-mono font-bold tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-zinc-500" />
                      OAuth Connections Matrix
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { id: 'google', label: 'Google Identity', icon: '🌐', linked: googleLinked, email: `${user.name.toLowerCase()}@gmail.com` },
                        { id: 'discord', label: 'Discord Coder Community', icon: '💬', linked: discordLinked, email: `${user.name.toLowerCase()}#4508` },
                        { id: 'vercel', label: 'Vercel Deployment Sync', icon: '▲', linked: vercelLinked, email: `${user.name.toLowerCase()}-vercel` }
                      ].map((item) => (
                        <div 
                          key={item.id} 
                          className="p-5 bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col justify-between h-40 relative overflow-hidden"
                        >
                          <div className="flex justify-between w-full items-start">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">{item.icon}</span>
                              <span className="text-xs lg:text-sm font-black text-zinc-150">{item.label}</span>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold font-mono uppercase ${
                              item.linked ? 'bg-emerald-950/40 border border-emerald-900/35 text-emerald-450' : 'bg-zinc-900 border border-zinc-800 text-zinc-500'
                            }`}>
                              {item.linked ? 'Linked' : 'Offline'}
                            </span>
                          </div>

                          <div className="flex flex-col gap-2.5 mt-2">
                            {item.linked ? (
                              <span className="text-xs text-zinc-500 font-mono truncate">{item.email}</span>
                            ) : (
                              <span className="text-xs text-zinc-500 leading-normal font-semibold">Connect credentials to unlock sync features.</span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleLinkProvider(item.id)}
                              disabled={isLinkingProvider !== null}
                              className={`w-full py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                item.linked 
                                  ? 'bg-zinc-900 hover:bg-red-950/20 hover:text-red-400 border border-zinc-850 hover:border-red-900/35 text-zinc-400' 
                                  : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                              }`}
                            >
                              {isLinkingProvider === item.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Callback...</span>
                                </>
                              ) : item.linked ? (
                                <span>Disconnect Link</span>
                              ) : (
                                <span>Connect Link</span>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hard System Reset Section - Scaled Up padding and fonts */}
                  <div className="p-6 bg-zinc-950 border border-red-950/40 rounded-3xl space-y-4.5 max-w-4xl">
                    <div className="space-y-1.5">
                      <h4 className="text-xs lg:text-sm font-black text-red-400 uppercase tracking-wide">Danger Zone</h4>
                      <p className="text-xs lg:text-sm text-zinc-500 leading-normal max-w-2xl font-semibold">
                        Hard resetting will destroy your custom persistent guest or cloud credentials, clearing daily quest indicators, and deleting SM-2 learning revision histories. This action is destructive and cannot be undone.
                      </p>
                    </div>

                    {showResetConfirm ? (
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={handleResetConfirm}
                          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs lg:text-sm font-black transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Confirm Hard Reset</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowResetConfirm(false)}
                          className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-350 rounded-2xl text-xs lg:text-sm font-bold transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(true)}
                        className="px-5 py-2.5 bg-zinc-950 hover:bg-red-950/20 border border-zinc-850 hover:border-red-900/40 text-zinc-450 hover:text-red-400 rounded-2xl text-xs lg:text-sm font-bold transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Reset all progression data</span>
                      </button>
                    )}
                  </div>

                </motion.div>
              )}
              
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
