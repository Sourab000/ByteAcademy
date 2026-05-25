import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface HeatmapProps {
  data: { [dateStr: string]: number };
}

export const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  // Generate last 15 weeks for compact, high-legibility layout in card bounds
  const weeksToShow = 18;
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const datesGrid = useMemo(() => {
    const grid: Date[][] = [];
    const today = new Date();
    
    // Align columns by moving back to the Sunday of 'weeksToShow' weeks ago
    const startOffset = today.getDay(); // days since Sunday
    const totalDays = weeksToShow * 7;
    const startDate = new Date();
    startDate.setDate(today.getDate() - totalDays + (6 - startOffset));
    
    for (let w = 0; w < weeksToShow; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() - ((weeksToShow - 1 - w) * 7) + d);
        week.push(currentDate);
      }
      grid.push(week);
    }
    return grid;
  }, [weeksToShow]);

  // Map XP quantity to custom developer emerald hues
  const getCellColor = (xp: number) => {
    if (!xp || xp === 0) return 'bg-zinc-800 hover:bg-zinc-700';
    if (xp < 100) return 'bg-emerald-950/70 border border-emerald-900/30 hover:bg-emerald-900';
    if (xp < 250) return 'bg-emerald-800 border border-emerald-700/40 hover:bg-emerald-700';
    if (xp < 500) return 'bg-emerald-600 border border-emerald-500/50 hover:bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
    return 'bg-emerald-400 border border-emerald-300/60 hover:bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.6)]';
  };

  const getIntensityLabel = (xp: number) => {
    if (!xp || xp === 0) return 'No activity';
    return `${xp} XP earned`;
  };

  return (
    <div className="w-full bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-2xl relative overflow-visible">
      {/* Decorative neon ambient backlights */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <span>Activity Heatmap</span>
            <span className="text-xs font-normal text-emerald-400 px-2 py-0.5 bg-emerald-950/40 border border-emerald-900/30 rounded-full">
              GitHub Sync Active
            </span>
          </h3>
          <p className="text-xs text-zinc-400">Your daily learning frequency and coding milestones</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-zinc-800" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-950/70 border border-emerald-900/30" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-800" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-2 items-stretch overflow-visible">
        {/* Days label column */}
        <div className="flex flex-col justify-between text-[10px] text-zinc-500 pr-1 py-1 select-none font-medium">
          <span>{daysOfWeek[0]}</span>
          <span>{daysOfWeek[2]}</span>
          <span>{daysOfWeek[4]}</span>
          <span>{daysOfWeek[6]}</span>
        </div>

        {/* Calendar grid columns */}
        <div className="flex gap-[3px]">
          {datesGrid.map((week, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-[3px]">
              {week.map((date, dIndex) => {
                const dateString = date.toISOString().split('T')[0];
                const xpValue = data[dateString] || 0;
                
                return (
                  <motion.div
                    key={dateString}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 0.25,
                      delay: (wIndex * 7 + dIndex) * 0.005,
                    }}
                    className={`group relative w-3 h-3 rounded-[2.5px] cursor-pointer transition-colors duration-200 ${getCellColor(xpValue)}`}
                  >
                    {/* Interactive Glassmorphic Tooltip */}
                    <div className={`pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 w-32 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 ${
                      dIndex === 0
                        ? 'top-5 mt-2 origin-top'
                        : 'bottom-5 mb-2 origin-bottom'
                    }`}>
                      <div className="bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 rounded-lg p-2 shadow-2xl text-[10px] text-zinc-200 leading-tight">
                        <p className="font-semibold text-emerald-400 mb-0.5">{getIntensityLabel(xpValue)}</p>
                        <p className="text-zinc-500 font-mono">
                          {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className={`w-1.5 h-1.5 bg-zinc-950/90 rotate-45 absolute left-1/2 -translate-x-1/2 ${
                        dIndex === 0
                          ? 'border-l border-t border-zinc-800/80 -top-1'
                          : 'border-r border-b border-zinc-800/80 -bottom-1'
                      }`} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
