import React, { useState, useEffect, useMemo } from 'react';
import { BLOCK_DESCRIPTIONS } from '../blockly/blockDescriptions';
import { BookOpen, Shield, Flame, Sword, Sparkles, Clock, ArrowRight, Search, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export const TutorialScreen: React.FC<Props> = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [activeTab, setActiveTab] = useState<'briefing' | 'blocks' | 'rules'>('briefing');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const categories = useMemo(() => {
    return ['All', 'Actions', 'Sensors', 'Logic', 'Loops', 'Math', 'Variables', 'Functions'];
  }, []);

  const filteredBlocks = useMemo(() => {
    return BLOCK_DESCRIPTIONS.filter((block) => {
      if (selectedCategory !== 'All' && block.category !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          block.name.toLowerCase().includes(q) ||
          block.summary.toLowerCase().includes(q) ||
          block.description.toLowerCase().includes(q) ||
          block.syntax.toLowerCase().includes(q) ||
          (block.rulesOrNotes || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, selectedCategory]);

  return (
    <div className="w-full h-full bg-[#080c06] text-white flex flex-col font-mono select-none overflow-hidden">
      {/* Top Banner */}
      <div className="px-6 py-4 border-b border-[var(--border-gold)]/60 bg-[#0c1208] flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[var(--accent-gold)]">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-cinzel font-bold text-[var(--accent-gold)] tracking-widest uppercase">
              ROUND 3: THE BLOCKLY FOREST MANUAL
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-mono">
              Pre-Mission Briefing & Comprehensive Block Catalog. Study all commands before starting.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-black/60 border border-[var(--border-gold)]/40 text-amber-300">
            <Clock size={16} className="animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">Time Left:</span>
            <span className="text-lg font-bold font-mono tracking-widest">{formatTime(timeLeft)}</span>
          </div>

          <button
            type="button"
            onClick={onComplete}
            className="flex items-center gap-2 px-5 py-2 border border-[var(--accent-gold)] bg-[var(--accent-gold)] text-[#080c06] font-bold uppercase text-xs tracking-widest rounded-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(223,177,37,0.3)]"
          >
            <span>Begin Trial Now</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 py-2.5 bg-[#0e160a] border-b border-[var(--border-gold)]/30 flex items-center gap-3 shrink-0">
        {[
          { id: 'briefing', label: '1. Mission & Levels', icon: Flame },
          { id: 'blocks', label: `2. Block Codex (${BLOCK_DESCRIPTIONS.length})`, icon: BookOpen },
          { id: 'rules', label: '3. Rules & Scoring', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] border border-[var(--accent-gold)] font-bold shadow-[0_0_10px_rgba(223,177,37,0.2)]'
                  : 'bg-black/40 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* TAB 1: MISSION & LEVELS BRIEFING */}
        {activeTab === 'briefing' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="border border-[var(--border-gold)]/50 bg-[#0d140b]/80 p-6 rounded-sm shadow-xl">
              <h2 className="text-lg font-cinzel font-bold text-[var(--accent-gold)] mb-2 flex items-center gap-2">
                <Flame size={18} /> THE EXPEDITION CHALLENGE
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed font-sans mb-4">
                Welcome to the ancient ruins of the Blockly Forest. In this final round, you must write visual algorithm scripts to guide the hero explorer across 3 progressive trial stages. Each level tests distinct algorithmic concepts: arithmetic series, state sensors, and modular arithmetic.
              </p>
            </div>

            {/* Level Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Level 1 */}
              <div className="bg-[#0b1008] border border-[var(--border-gold)]/40 p-5 rounded-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-xs font-mono uppercase text-amber-400 font-bold">Level 1</span>
                  <span className="text-[11px] font-mono text-neutral-500">Par: 14 Blocks • 3m</span>
                </div>
                <h3 className="text-base font-cinzel font-bold text-white">The Broken Bridge</h3>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  The bridge chasms expand progressively in triangular progression: Jump, Run 1 & Jump, Run 2 & Jump, Run 3 & Jump, and so forth.
                </p>
                <div className="p-2.5 rounded bg-red-950/30 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
                  <ShieldAlert size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight">
                    Low-hanging jungle branches block jumping on solid ground! You can ONLY jump over gaps.
                  </span>
                </div>
              </div>

              {/* Level 2 */}
              <div className="bg-[#0b1008] border border-[var(--border-gold)]/40 p-5 rounded-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-xs font-mono uppercase text-amber-400 font-bold">Level 2</span>
                  <span className="text-[11px] font-mono text-neutral-500">Par: 17 Blocks • 5m</span>
                </div>
                <h3 className="text-base font-cinzel font-bold text-white">The Beast's Lair</h3>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  Run right and collect the Sword (Tile 3) and Shield (Tile 5) with <code className="text-green-400">equip()</code>. Stop 3 blocks before the Guardian Beast.
                </p>
                <div className="p-2.5 rounded bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2">
                  <Sword size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight">
                    Sense if <code className="text-yellow-400">is_beast_vulnerable()</code>: if true strike with <code className="text-green-400">attack()</code>, else guard with <code className="text-green-400">defend()</code>.
                  </span>
                </div>
              </div>

              {/* Level 3 */}
              <div className="bg-[#0b1008] border border-[var(--border-gold)]/40 p-5 rounded-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-xs font-mono uppercase text-amber-400 font-bold">Level 3</span>
                  <span className="text-[11px] font-mono text-neutral-500">Par: 27 Blocks • 7m</span>
                </div>
                <h3 className="text-base font-cinzel font-bold text-white">Path of Trials (FizzBuzz)</h3>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  Traverse 3 consecutive trial zones. Each zone has a 14-step obstacle course followed by an ancient Totem.
                </p>
                <div className="p-2.5 rounded bg-purple-950/30 border border-purple-500/40 text-purple-200 text-xs flex items-start gap-2">
                  <Sparkles size={14} className="text-purple-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight">
                    Index % 3 == 0 is Fire (Jump). Index % 5 == 0 is Goblin (Attack). Rest run. Finish zone with <code className="text-purple-300">activate_totem()</code>.
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('blocks')}
                className="px-6 py-2.5 bg-black/60 border border-[var(--border-gold)] hover:border-[var(--accent-gold)] text-[var(--accent-gold)] text-xs font-mono uppercase tracking-widest rounded transition-colors inline-flex items-center gap-2"
              >
                <span>Browse All Block Descriptions & Manual</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: BLOCK CODEX & MANUAL */}
        {activeTab === 'blocks' && (
          <div className="max-w-5xl mx-auto space-y-4">
            {/* Search and Category Filters */}
            <div className="bg-[#0b1008] border border-[var(--border-gold)]/40 p-4 rounded-sm space-y-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter blocks by name, syntax, category, or rule keyword..."
                  className="w-full bg-[#050804] border border-[var(--border-gold)]/40 focus:border-[var(--accent-gold)] pl-9 pr-3 py-2 rounded text-xs font-mono text-white placeholder-neutral-600 outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
                {categories.map((cat) => {
                  const count = BLOCK_DESCRIPTIONS.filter(
                    (b) => cat === 'All' || b.category === cat
                  ).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded text-xs font-mono whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-amber-500/20 text-[var(--accent-gold)] border border-[var(--accent-gold)]/80 font-bold'
                          : 'bg-black/50 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                      }`}
                    >
                      {cat} <span className="opacity-60 text-[10px]">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Block Cards List */}
            <div className="space-y-3">
              {filteredBlocks.map((block) => (
                <div
                  key={block.id}
                  className="bg-[#0b1008] border border-[var(--border-gold)]/30 hover:border-[var(--border-gold)]/80 p-4 rounded-sm transition-all shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-neutral-800">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold"
                        style={{
                          backgroundColor: `${block.color}25`,
                          color: block.color,
                          border: `1px solid ${block.color}60`
                        }}
                      >
                        {block.category}
                      </span>
                      <h4 className="text-base font-bold text-white font-mono">{block.name}</h4>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
                      <span>Available in:</span>
                      {block.levels.map((lvl) => (
                        <span key={lvl} className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-700 text-neutral-300">
                          Level {lvl}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase font-mono text-neutral-500">Syntax:</span>
                    <code className="text-xs font-mono bg-black/60 px-2 py-0.5 rounded border border-neutral-800 text-green-400">
                      {block.syntax}
                    </code>
                  </div>

                  <p className="text-sm text-neutral-200 mb-1.5 font-sans leading-relaxed">
                    {block.summary}
                  </p>

                  <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                    {block.description}
                  </p>

                  {block.rulesOrNotes && (
                    <div className="mt-2 p-2 rounded bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2 font-sans">
                      <ShieldAlert size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-300 font-mono text-[11px] uppercase mr-1">Rule:</strong>
                        {block.rulesOrNotes}
                      </div>
                    </div>
                  )}

                  {block.example && (
                    <div className="mt-2 text-xs font-mono text-neutral-400 flex items-center gap-2">
                      <span className="text-[10px] uppercase text-neutral-500">Example:</span>
                      <span className="text-[var(--accent-gold)] bg-black/40 px-2 py-0.5 rounded border border-neutral-800">
                        {block.example}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RULES & SCORING */}
        {activeTab === 'rules' && (
          <div className="max-w-4xl mx-auto space-y-5">
            <div className="bg-[#0b1008] border border-[var(--border-gold)]/40 p-6 rounded-sm space-y-4">
              <h2 className="text-lg font-cinzel font-bold text-[var(--accent-gold)] flex items-center gap-2">
                <CheckCircle2 size={18} /> SCORING SYSTEM & LEADERBOARD FORMULA
              </h2>
              <p className="text-sm text-neutral-300 font-sans leading-relaxed">
                Each level awards up to <strong className="text-amber-300">500 points</strong>. Your score is determined by how close you are to the optimal par metrics:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded bg-black/40 border border-neutral-800 space-y-2">
                  <h3 className="text-xs font-mono uppercase text-amber-400 font-bold">1. Block Efficiency</h3>
                  <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                    Minimize the number of blocks on your workspace! Using fewer blocks gets maximum efficiency bonuses. Loops, variables, and functions let you express solutions concisely.
                  </p>
                  <ul className="text-xs font-mono text-neutral-300 space-y-1">
                    <li>• Level 1 Par: 14 Blocks</li>
                    <li>• Level 2 Par: 17 Blocks</li>
                    <li>• Level 3 Par: 27 Blocks</li>
                  </ul>
                </div>

                <div className="p-4 rounded bg-black/40 border border-neutral-800 space-y-2">
                  <h3 className="text-xs font-mono uppercase text-amber-400 font-bold">2. Completion Speed</h3>
                  <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                    Solve each level faster than the designated Par Time to earn time multipliers.
                  </p>
                  <ul className="text-xs font-mono text-neutral-300 space-y-1">
                    <li>• Level 1 Par: 3 Minutes</li>
                    <li>• Level 2 Par: 5 Minutes</li>
                    <li>• Level 3 Par: 7 Minutes</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs font-sans space-y-2 mt-4">
                <h4 className="font-bold text-amber-300 font-mono uppercase">Pro-Tips for the Workspace:</h4>
                <ul className="list-disc pl-5 space-y-1 text-neutral-300">
                  <li>Hover over any block on the workspace or toolbox to see its instant tooltip description.</li>
                  <li>Click the <strong>📖 Block Guide</strong> button at the top anytime during gameplay to review this codex.</li>
                  <li>Click the gear icon on the <strong>if</strong> block to attach <strong>else if</strong> and <strong>else</strong> branches.</li>
                  <li>Drag unwanted blocks to the bottom-right trashcan or select and press <strong>[Delete]</strong>.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Footer */}
      <div className="px-6 py-3 border-t border-[var(--border-gold)]/40 bg-[#0c1208] flex items-center justify-between shrink-0">
        <span className="text-xs font-mono text-neutral-500">
          The trial begins automatically when the countdown ends.
        </span>
        <button
          type="button"
          onClick={onComplete}
          className="px-6 py-2 border border-[var(--border-gold)] bg-black text-[var(--accent-gold)] uppercase tracking-widest text-xs font-bold rounded-sm hover:bg-[var(--accent-gold)] hover:text-black transition-all"
        >
          Skip Tutorial & Begin Round
        </button>
      </div>
    </div>
  );
};
