import React, { useState, useMemo } from 'react';
import { BLOCK_DESCRIPTIONS, BlockDescription } from '../blockly/blockDescriptions';
import { Search, X, BookOpen, Layers, ShieldAlert, Sparkles, Filter, Code2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialLevel?: number;
}

export const BlockGuideModal: React.FC<Props> = ({ isOpen, onClose, initialLevel }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>(initialLevel || 'all');

  const categories = useMemo(() => {
    return ['All', 'Actions', 'Sensors', 'Logic', 'Loops', 'Math', 'Variables', 'Functions'];
  }, []);

  const filteredBlocks = useMemo(() => {
    return BLOCK_DESCRIPTIONS.filter((block) => {
      // Category filter
      if (selectedCategory !== 'All' && block.category !== selectedCategory) {
        return false;
      }
      // Level filter
      if (selectedLevel !== 'all' && !block.levels.includes(selectedLevel)) {
        return false;
      }
      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = block.name.toLowerCase().includes(q);
        const matchesSummary = block.summary.toLowerCase().includes(q);
        const matchesDesc = block.description.toLowerCase().includes(q);
        const matchesSyntax = block.syntax.toLowerCase().includes(q);
        const matchesRules = (block.rulesOrNotes || '').toLowerCase().includes(q);
        return matchesName || matchesSummary || matchesDesc || matchesSyntax || matchesRules;
      }
      return true;
    });
  }, [search, selectedCategory, selectedLevel]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6"
      onClick={onClose}
    >
      <div 
        className="bg-[#0b1008] border border-[var(--border-gold)] w-full max-w-5xl h-[88vh] rounded-md shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_20px_rgba(223,177,37,0.2)] flex flex-col overflow-hidden text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[var(--border-gold)]/50 bg-[#0d140a] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[var(--accent-gold)]">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-cinzel font-bold text-[var(--accent-gold)] tracking-wider flex items-center gap-2">
                ROUND 3 BLOCK CODEX & MANUAL
              </h2>
              <p className="text-xs font-mono text-[var(--text-muted)]">
                Exhaustive documentation, syntax, rules, and strategies for all {BLOCK_DESCRIPTIONS.length} temple blocks.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800/60 rounded border border-transparent hover:border-neutral-700 transition-colors"
            title="Close Codex (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="px-6 py-3.5 bg-black/40 border-b border-[var(--border-gold)]/20 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shrink-0">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blocks by name, syntax, or keyword..."
              className="w-full bg-[#050804] border border-[var(--border-gold)]/40 focus:border-[var(--accent-gold)] pl-9 pr-3 py-1.5 rounded text-xs font-mono text-white placeholder-neutral-600 outline-none transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Level Filter Selector */}
          <div className="flex items-center gap-1.5 self-start md:self-auto text-xs font-mono">
            <span className="text-neutral-500 text-[11px] uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter size={12} /> Level:
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: 1, label: 'L1: Bridge' },
              { id: 2, label: 'L2: Beast' },
              { id: 3, label: 'L3: Trials' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setSelectedLevel(lvl.id as any)}
                className={`px-2.5 py-1 rounded text-[11px] transition-all ${
                  selectedLevel === lvl.id
                    ? 'bg-[var(--accent-gold)] text-black font-bold shadow-[0_0_10px_rgba(223,177,37,0.4)]'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-6 py-2.5 bg-[#0a0f08] border-b border-[var(--border-gold)]/20 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider mr-1">
            Category:
          </span>
          {categories.map((cat) => {
            const count = BLOCK_DESCRIPTIONS.filter(
              (b) => cat === 'All' || b.category === cat
            ).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded text-xs font-mono tracking-wide whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500/20 text-[var(--accent-gold)] border border-[var(--accent-gold)]/60 font-semibold'
                    : 'bg-black/40 text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {cat} <span className="opacity-60 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Blocks Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredBlocks.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-8 border border-dashed border-neutral-800 rounded">
              <Search size={32} className="text-neutral-600 mb-2" />
              <p className="text-neutral-400 font-mono text-sm">No blocks matched your filter query.</p>
              <button
                type="button"
                onClick={() => { setSearch(''); setSelectedCategory('All'); setSelectedLevel('all'); }}
                className="mt-3 px-3 py-1 text-xs text-[var(--accent-gold)] underline font-mono hover:text-white"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredBlocks.map((block) => (
              <div
                key={block.id}
                className="bg-[#0e140c] border border-[var(--border-gold)]/30 hover:border-[var(--border-gold)]/80 rounded-md p-4 transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2 pb-2 border-b border-neutral-800/80">
                  <div className="flex items-center gap-2.5">
                    {/* Category pill indicator */}
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider"
                      style={{ 
                        backgroundColor: `${block.color}25`, 
                        color: block.color,
                        border: `1px solid ${block.color}60`
                      }}
                    >
                      {block.category}
                    </span>
                    <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                      {block.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Levels badges */}
                    <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400">
                      <span>Available in:</span>
                      {block.levels.map((lvl) => (
                        <span 
                          key={lvl}
                          className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-700 text-neutral-300"
                        >
                          Level {lvl}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Syntax row */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] uppercase font-mono text-neutral-500">Syntax:</span>
                  <code className="text-xs font-mono bg-black/60 px-2 py-0.5 rounded border border-neutral-800 text-green-400">
                    {block.syntax}
                  </code>
                </div>

                {/* Summary */}
                <p className="text-sm text-neutral-200 mb-2 font-sans leading-relaxed">
                  {block.summary}
                </p>

                {/* Detailed Description */}
                <p className="text-xs text-neutral-400 mb-3 font-sans leading-relaxed">
                  {block.description}
                </p>

                {/* Special rules or notes (if any) */}
                {block.rulesOrNotes && (
                  <div className="mt-2.5 p-2.5 rounded bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2 font-sans">
                    <ShieldAlert size={14} className="text-amber-400 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong className="text-amber-300 font-mono text-[11px] uppercase mr-1">Rule:</strong>
                      {block.rulesOrNotes}
                    </div>
                  </div>
                )}

                {/* Example usage snippet */}
                {block.example && (
                  <div className="mt-2 text-xs font-mono text-neutral-400 flex items-center gap-2">
                    <span className="text-[10px] uppercase text-neutral-500">Example:</span>
                    <span className="text-[var(--accent-gold)] bg-black/40 px-2 py-0.5 rounded border border-neutral-800">
                      {block.example}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-[#0d140a] border-t border-[var(--border-gold)]/40 flex items-center justify-between text-xs font-mono text-neutral-400 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[var(--accent-gold)]" />
            <span>Showing {filteredBlocks.length} of {BLOCK_DESCRIPTIONS.length} total blocks</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[var(--accent-gold)] text-black font-bold uppercase tracking-wider rounded text-xs hover:brightness-110 transition-all shadow-[0_0_12px_rgba(223,177,37,0.3)]"
          >
            Close Guide [Esc]
          </button>
        </div>
      </div>
    </div>
  );
};
