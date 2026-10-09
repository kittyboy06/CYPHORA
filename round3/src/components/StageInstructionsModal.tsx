import React, { useState } from 'react';
import { 
  X, 
  Flame, 
  Sword, 
  Shield, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Clock, 
  Trophy, 
  Compass, 
  Layers, 
  Code2,
  BookOpen
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
  onOpenBlockGuide?: () => void;
}

export const StageInstructionsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentLevel,
  onOpenBlockGuide
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number>(currentLevel || 1);

  // Sync selectedLevel if currentLevel changes when opened
  React.useEffect(() => {
    if (isOpen) {
      setSelectedLevel(currentLevel || 1);
    }
  }, [isOpen, currentLevel]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6 select-none animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div 
        className="bg-[#0b1008] border border-[var(--border-gold)] w-full max-w-5xl h-[90vh] rounded-md shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_20px_rgba(223,177,37,0.25)] flex flex-col overflow-hidden text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[var(--border-gold)]/50 bg-[#0d140a] flex items-center justify-between gap-4 shrink-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[var(--accent-gold)]">
              <Compass size={22} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest font-bold">
                  Participant Field Guide
                </span>
                <span className="text-neutral-500 text-xs">•</span>
                <span className="text-xs font-mono text-neutral-400">Round 3 Trial Architecture</span>
              </div>
              <h2 className="text-xl md:text-2xl font-cinzel font-bold text-[var(--accent-gold)] tracking-wider uppercase mt-0.5">
                Detailed Stage Instructions & Mechanics
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onOpenBlockGuide && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBlockGuide();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[rgba(223,177,37,0.15)] border border-[var(--border-gold)]/70 hover:border-[var(--accent-gold)] text-[var(--accent-gold)] text-xs font-mono uppercase tracking-wider transition-all hover:bg-[rgba(223,177,37,0.25)] cursor-pointer"
              >
                <BookOpen size={13} />
                <span>Open Block Guide</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-sm bg-neutral-900 border border-neutral-700 hover:border-red-500 text-neutral-400 hover:text-white hover:bg-red-950/50 transition-colors cursor-pointer"
              title="Close Manual"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Level Switcher Tabs */}
        <div className="px-6 py-2.5 bg-[#0e160a] border-b border-[var(--border-gold)]/30 flex items-center gap-3 shrink-0 overflow-x-auto">
          {[
            { id: 1, name: 'Stage 1: The Broken Bridge', icon: Flame, tag: 'Triangular Progression' },
            { id: 2, name: "Stage 2: The Beast's Lair", icon: Sword, tag: 'Equipment & Stance Sensing' },
            { id: 3, name: 'Stage 3: The Path of Trials', icon: Sparkles, tag: 'FizzBuzz Modulo & Totems' },
          ].map((lvl) => {
            const Icon = lvl.icon;
            const isSelected = selectedLevel === lvl.id;
            const isCurrent = currentLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setSelectedLevel(lvl.id)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] border border-[var(--accent-gold)] font-bold shadow-[0_0_12px_rgba(223,177,37,0.25)]'
                    : 'bg-black/50 text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-[var(--accent-gold)]' : 'text-neutral-500'} />
                <span>{lvl.name}</span>
                {isCurrent && (
                  <span className="text-[9px] bg-amber-500/30 text-amber-300 border border-amber-500/50 px-1.5 py-0.2 rounded font-mono font-bold">
                    ACTIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* ======================================================== */}
          {/* LEVEL 1: THE BROKEN BRIDGE                               */}
          {/* ======================================================== */}
          {selectedLevel === 1 && (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* Target Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#10180d] border border-[var(--border-gold)]/40 p-3.5 rounded flex items-center gap-3">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-400"><Layers size={18} /></div>
                  <div>
                    <div className="text-[10px] uppercase font-mono text-neutral-400">Optimal Par Target</div>
                    <div className="text-sm font-mono font-bold text-green-400">14 Blocks or less</div>
                  </div>
                </div>
                <div className="bg-[#10180d] border border-[var(--border-gold)]/40 p-3.5 rounded flex items-center gap-3">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-400"><Clock size={18} /></div>
                  <div>
                    <div className="text-[10px] uppercase font-mono text-neutral-400">Target Par Time</div>
                    <div className="text-sm font-mono font-bold text-yellow-400">3 Minutes</div>
                  </div>
                </div>
                <div className="bg-[#10180d] border border-[var(--border-gold)]/40 p-3.5 rounded flex items-center gap-3">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-400"><Trophy size={18} /></div>
                  <div>
                    <div className="text-[10px] uppercase font-mono text-neutral-400">Stage Points Available</div>
                    <div className="text-sm font-mono font-bold text-[var(--accent-gold)]">500 Max PTS</div>
                  </div>
                </div>
              </div>

              {/* Mission Objective */}
              <div className="bg-[#0e160a] border border-[var(--border-gold)]/50 p-5 rounded space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-cinzel font-bold text-base">
                  <Compass size={18} />
                  <span>MISSION OBJECTIVE: CROSS THE EXPANDING AQUEDUCT</span>
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                  The explorer is standing at the beginning of an ancient stone aqueduct suspended over a bottomless abyss. The bridge platforms are broken at increasing intervals. Your code must guide the explorer across all platforms to reach the <strong>Golden Portal at Tile 23</strong>.
                </p>
                <div className="p-3 bg-red-950/40 border border-red-500/50 rounded flex items-start gap-3 text-red-200">
                  <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <strong className="text-red-300 uppercase tracking-wider block font-mono mb-0.5">⚠️ Fatal Hazard: Low-Hanging Jungle Vines</strong>
                    Thick canopy vines hang low directly above solid stone tiles. <strong>You can ONLY jump over gaps!</strong> If you invoke <code className="text-yellow-300 bg-black/60 px-1 py-0.2 rounded font-mono">jump()</code> while on solid ground with another ground tile ahead, the hero will collide head-on with a branch and plummet into the abyss!
                  </div>
                </div>
              </div>

              {/* Track Layout & Step Progression */}
              <div className="bg-[#0e160a] border border-[var(--border-gold)]/40 p-5 rounded space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-cinzel font-bold text-white tracking-wider uppercase">
                    1. The Triangular Sequence Pattern
                  </h3>
                  <span className="text-[11px] font-mono text-amber-400">Total Track Length: 24 Tiles (0–23)</span>
                </div>
                
                <p className="text-xs text-neutral-300 font-sans">
                  The number of run steps between each chasm increases by exactly <strong>1</strong> after every successful jump:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 font-mono text-xs text-center">
                  <div className="p-3 bg-black/60 border border-neutral-800 rounded space-y-1">
                    <div className="text-[10px] text-amber-400 font-bold uppercase">Section 1</div>
                    <div className="text-green-400 font-bold">Run 1 Tile</div>
                    <div className="text-blue-400 text-[11px]">Jump Gap 1</div>
                  </div>
                  <div className="p-3 bg-black/60 border border-neutral-800 rounded space-y-1">
                    <div className="text-[10px] text-amber-400 font-bold uppercase">Section 2</div>
                    <div className="text-green-400 font-bold">Run 2 Tiles</div>
                    <div className="text-blue-400 text-[11px]">Jump Gap 2</div>
                  </div>
                  <div className="p-3 bg-black/60 border border-neutral-800 rounded space-y-1">
                    <div className="text-[10px] text-amber-400 font-bold uppercase">Section 3</div>
                    <div className="text-green-400 font-bold">Run 3 Tiles</div>
                    <div className="text-blue-400 text-[11px]">Jump Gap 3</div>
                  </div>
                  <div className="p-3 bg-black/60 border border-neutral-800 rounded space-y-1">
                    <div className="text-[10px] text-amber-400 font-bold uppercase">Section 4</div>
                    <div className="text-green-400 font-bold">Run 4 Tiles</div>
                    <div className="text-blue-400 text-[11px]">Jump Gap 4</div>
                  </div>
                  <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded space-y-1">
                    <div className="text-[10px] text-amber-300 font-bold uppercase">Section 5 (Final)</div>
                    <div className="text-green-400 font-bold">Run 5 Tiles</div>
                    <div className="text-amber-400 font-bold text-[11px]">✨ REACH GOAL</div>
                  </div>
                </div>
              </div>

              {/* Algorithmic Blueprint */}
              <div className="bg-[#0e160a] border border-[var(--border-gold)]/40 p-5 rounded space-y-3">
                <div className="flex items-center gap-2 text-white font-cinzel font-bold text-sm">
                  <Code2 size={16} className="text-green-400" />
                  <span>2. Recommended Algorithmic Blueprint</span>
                </div>
                <p className="text-xs text-neutral-300 font-sans">
                  Instead of dragging dozens of individual <code className="text-green-400 font-mono">run()</code> blocks, build an incrementing loop using a variable:
                </p>

                <div className="p-3 bg-black/80 border border-neutral-800 rounded font-mono text-xs text-neutral-300 space-y-1.5 leading-relaxed">
                  <div className="text-neutral-500">// Initialize a variable to track how many runs to perform</div>
                  <div><span className="text-blue-400">set</span> <span className="text-amber-400">runs</span> <span className="text-blue-400">to</span> <span className="text-purple-400">1</span></div>
                  <div><span className="text-blue-400">while</span> (<span className="text-amber-400">runs</span> &lt;= <span className="text-purple-400">5</span>):</div>
                  <div className="pl-6"><span className="text-blue-400">repeat</span> <span className="text-amber-400">runs</span> <span className="text-blue-400">times</span>:</div>
                  <div className="pl-12 text-green-400">action_run()</div>
                  <div className="pl-6 text-cyan-400">action_jump() <span className="text-neutral-500">// Leaps over the pit</span></div>
                  <div className="pl-6"><span className="text-blue-400">set</span> <span className="text-amber-400">runs</span> <span className="text-blue-400">to</span> (<span className="text-amber-400">runs</span> + <span className="text-purple-400">1</span>)</div>
                </div>
              </div>

              {/* Toolbox Blocks Needed */}
              <div className="bg-[#0e160a] border border-[var(--border-gold)]/40 p-5 rounded space-y-3">
                <h4 className="text-xs font-mono uppercase text-amber-400 font-bold tracking-wider">
                  Key Blocks to Pull from the Toolbox:
                </h4>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-black/60 border border-green-500/40 text-green-300">Actions: Run (`run`)</span>
                  <span className="px-2.5 py-1 rounded bg-black/60 border border-green-500/40 text-green-300">Actions: Jump (`jump`)</span>
                  <span className="px-2.5 py-1 rounded bg-black/60 border border-amber-500/40 text-amber-300">Variables: Create / Set / Get `runs`</span>
                  <span className="px-2.5 py-1 rounded bg-black/60 border border-blue-500/40 text-blue-300">Loops: While / Repeat</span>
                  <span className="px-2.5 py-1 rounded bg-black/60 border border-purple-500/40 text-purple-300">Math: Number (`1`, `5`) & Addition (`+`)</span>
                  <span className="px-2.5 py-1 rounded bg-black/60 border border-cyan-500/40 text-cyan-300">Logic: Comparison (`&lt;=`)</span>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* LEVEL 2: THE BEAST'S LAIR                                */}
          {/* ======================================================== */}
          {selectedLevel === 2 && (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* Target Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#10180d] border border-[var(--border-gold)]/40 p-3.5 rounded flex items-center gap-3">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-400"><Layers size={18} /></div>
                  <div>
                    <div className="text-[10px] uppercase font-mono text-neutral-400">Optimal Par Target</div>
                    <div className="text-sm font-mono font-bold text-green-400">17 Blocks or less</div>
                  </div>
                </div>
                <div className="bg-[#10180d] border border-[var(--border-gold)]/40 p-3.5 rounded flex items-center gap-3">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-400"><Clock size={18} /></div>
                  <div>
                    <div className="text-[10px] uppercase font-mono text-neutral-400">Target Par Time</div>
                    <div className="text-sm font-mono font-bold text-yellow-400">5 Minutes</div>
                  </div>
                </div>
                <div className="bg-[#10180d] border border-[var(--border-gold)]/40 p-3.5 rounded flex items-center gap-3">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-400"><Trophy size={18} /></div>
                  <div>
                    <div className="text-[10px] uppercase font-mono text-neutral-400">Stage Points Available</div>
                    <div className="text-sm font-mono font-bold text-[var(--accent-gold)]">500 Max PTS</div>
                  </div>
                </div>
              </div>

              {/* Mission Objective */}
              <div className="bg-[#0e160a] border border-[var(--border-gold)]/50 p-5 rounded space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-cinzel font-bold text-base">
                  <Sword size={18} />
                  <span>MISSION OBJECTIVE: ARM YOURSELF & DEFEAT THE GUARDIAN</span>
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                  Deep within the temple caverns lies a fierce Guardian Beast blocking the escape exit. To overcome this ancient sentinel, you must first scavenge weapons, advance to the combat staging mark, and read the beast's attack patterns using sensor logic.
                </p>
              </div>

              {/* Step by Step Breakdown */}
              <div className="bg-[#0e160a] border border-[var(--border-gold)]/40 p-5 rounded space-y-4">
                <h3 className="text-sm font-cinzel font-bold text-white tracking-wider uppercase">
                  1. The 4 Mission Phases
                </h3>

                <div className="space-y-3 font-mono text-xs">
                  {/* Phase 1 */}
                  <div className="p-3 bg-black/60 border border-neutral-800 rounded flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                    <div>
                      <strong className="text-white uppercase tracking-wider block">Collect the Ancient Sword (Tile Index 2)</strong>
                      <p className="text-neutral-400 font-sans text-xs mt-0.5">
                        Run 2 steps forward to arrive at Tile 2. Call <code className="text-green-400 font-mono">equip()</code> to arm yourself with the Sword.
                      </p>
                    </div>
                  </div>

                  {/* Phase 2 */}
                  <div className="p-3 bg-black/60 border border-neutral-800 rounded flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                    <div>
                      <strong className="text-white uppercase tracking-wider block">Collect the Guardian Shield (Tile Index 4)</strong>
                      <p className="text-neutral-400 font-sans text-xs mt-0.5">
                        Run 2 steps forward to arrive at Tile 4. Call <code className="text-green-400 font-mono">equip()</code> to equip the defensive Shield.
                      </p>
                    </div>
                  </div>

                  {/* Phase 3 */}
                  <div className="p-3 bg-black/60 border border-neutral-800 rounded flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                    <div>
                      <strong className="text-white uppercase tracking-wider block">Advance to Standoff Combat Line (Tile Index 18)</strong>
                      <p className="text-neutral-400 font-sans text-xs mt-0.5">
                        Run 14 steps forward from Tile 4 to Tile 18. <strong className="text-red-400">STOP AT TILE 18!</strong> Tile 18 is exactly 3 blocks before the Beast (Tile 21). Running past Tile 18 into the Beast before defeating it results in instant death!
                      </p>
                    </div>
                  </div>

                  {/* Phase 4 */}
                  <div className="p-3 bg-black/60 border border-neutral-800 rounded flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">4</span>
                    <div>
                      <strong className="text-white uppercase tracking-wider block">Combat Phase: Stance Sensing (5 Beast HP)</strong>
                      <p className="text-neutral-400 font-sans text-xs mt-0.5">
                        While at Tile 18, use the sensor <code className="text-yellow-400 font-mono">is_beast_vulnerable()</code>:
                      </p>
                      <ul className="list-disc pl-5 mt-1 text-neutral-300 space-y-0.5 font-sans">
                        <li>If <code className="text-green-400 font-mono">true</code>: Beast drops its guard → Call <code className="text-green-400 font-mono">attack()</code> with sword!</li>
                        <li>If <code className="text-green-400 font-mono">false</code>: Beast launches an attack → Call <code className="text-blue-400 font-mono">defend()</code> with shield to deflect it!</li>
                        <li>Repeat this check 11 times until the beast collapses and the path unlocks.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Algorithmic Blueprint */}
              <div className="bg-[#0e160a] border border-[var(--border-gold)]/40 p-5 rounded space-y-3">
                <div className="flex items-center gap-2 text-white font-cinzel font-bold text-sm">
                  <Code2 size={16} className="text-green-400" />
                  <span>2. Recommended Algorithmic Blueprint</span>
                </div>

                <div className="p-3 bg-black/80 border border-neutral-800 rounded font-mono text-xs text-neutral-300 space-y-1.5 leading-relaxed">
                  <div className="text-neutral-500">// 1. Retrieve Sword</div>
                  <div><span className="text-blue-400">repeat</span> <span className="text-purple-400">2</span> <span className="text-blue-400">times</span>: <span className="text-green-400">run()</span></div>
                  <div><span className="text-cyan-400">equip()</span></div>
                  <div className="text-neutral-500 pt-1">// 2. Retrieve Shield</div>
                  <div><span className="text-blue-400">repeat</span> <span className="text-purple-400">2</span> <span className="text-blue-400">times</span>: <span className="text-green-400">run()</span></div>
                  <div><span className="text-cyan-400">equip()</span></div>
                  <div className="text-neutral-500 pt-1">// 3. Approach Standoff Line</div>
                  <div><span className="text-blue-400">repeat</span> <span className="text-purple-400">14</span> <span className="text-blue-400">times</span>: <span className="text-green-400">run()</span></div>
                  <div className="text-neutral-500 pt-1">// 4. Defeat Beast (11 combat rounds)</div>
                  <div><span className="text-blue-400">repeat</span> <span className="text-purple-400">11</span> <span className="text-blue-400">times</span>:</div>
                  <div className="pl-6"><span className="text-blue-400">if</span> <span className="text-yellow-400">is_beast_vulnerable()</span>:</div>
                  <div className="pl-12 text-green-400">attack()</div>
                  <div className="pl-6"><span className="text-blue-400">else</span>:</div>
                  <div className="pl-12 text-blue-400">defend()</div>
                </div>
              </div>

              {/* Toolbox Blocks Needed */}
              <div className="bg-[#0e160a] border border-[var(--border-gold)]/40 p-5 rounded space-y-3">
                <h4 className="text-xs font-mono uppercase text-amber-400 font-bold tracking-wider">
                  Key Blocks to Pull from the Toolbox:
                </h4>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-black/60 border border-green-500/40 text-green-300">Actions: Run, Equip, Attack, Defend</span>
                  <span className="px-2.5 py-1 rounded bg-black/60 border border-yellow-500/40 text-yellow-300">Sensors: is Beast Vulnerable? (`sensor_beast_vulnerable`)</span>
                  <span className="px-2.5 py-1 rounded bg-black/60 border border-blue-500/40 text-blue-300">Loops: Repeat [N] times</span>
                  <span className="px-2.5 py-1 rounded bg-black/60 border border-cyan-500/40 text-cyan-300">Logic: If / Else</span>
                  <span className="px-2.5 py-1 rounded bg-black/60 border border-purple-500/40 text-purple-300">Math: Numbers (`2`, `14`, `11`)</span>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* LEVEL 3: THE PATH OF TRIALS (FIZZBUZZ)                  */}
          {/* ======================================================== */}
          {selectedLevel === 3 && (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* Target Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#10180d] border border-[var(--border-gold)]/40 p-3.5 rounded flex items-center gap-3">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-400"><Layers size={18} /></div>
                  <div>
                    <div className="text-[10px] uppercase font-mono text-neutral-400">Optimal Par Target</div>
                    <div className="text-sm font-mono font-bold text-green-400">27 Blocks or less</div>
                  </div>
                </div>
                <div className="bg-[#10180d] border border-[var(--border-gold)]/40 p-3.5 rounded flex items-center gap-3">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-400"><Clock size={18} /></div>
                  <div>
                    <div className="text-[10px] uppercase font-mono text-neutral-400">Target Par Time</div>
                    <div className="text-sm font-mono font-bold text-yellow-400">7 Minutes</div>
                  </div>
                </div>
                <div className="bg-[#10180d] border border-[var(--border-gold)]/40 p-3.5 rounded flex items-center gap-3">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-400"><Trophy size={18} /></div>
                  <div>
                    <div className="text-[10px] uppercase font-mono text-neutral-400">Stage Points Available</div>
                    <div className="text-sm font-mono font-bold text-[var(--accent-gold)]">500 Max PTS</div>
                  </div>
                </div>
              </div>

              {/* Mission Objective */}
              <div className="bg-[#0e160a] border border-[var(--border-gold)]/50 p-5 rounded space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-cinzel font-bold text-base">
                  <Sparkles size={18} />
                  <span>MISSION OBJECTIVE: AWAKEN THE 3 SACRED ELEMENTAL TOTEMS</span>
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                  The final trial sanctuary is protected by <strong>3 sequential zones</strong>. At the end of each zone stands a sacred Totem: the <em>Fire Totem</em>, the <em>Goblin Totem</em>, and the <em>Final Divine Totem</em>. You must navigate all 3 zones and awaken each altar using the ancient <strong>FizzBuzz algorithm</strong>.
                </p>
              </div>

              {/* Obstacle Rules & Divisibility Map */}
              <div className="bg-[#0e160a] border border-[var(--border-gold)]/40 p-5 rounded space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-cinzel font-bold text-white tracking-wider uppercase">
                    1. The 14-Step Obstacle Modulo Rules (1-Indexed)
                  </h3>
                  <span className="text-[11px] font-mono text-purple-400">Repeat for 3 Zones</span>
                </div>

                <p className="text-xs text-neutral-300 font-sans">
                  Within each zone, count step <code className="text-amber-400 font-mono">i</code> from <strong>1 to 14</strong>:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 bg-black/60 border border-orange-500/40 rounded space-y-1">
                    <div className="flex items-center gap-2 text-orange-400 font-bold">
                      <Flame size={14} />
                      <span>i % 3 == 0 (Fire)</span>
                    </div>
                    <p className="text-neutral-400 font-sans text-xs">
                      Steps <strong>3, 6, 9, 12</strong> contain Fire Pits. Must <strong className="text-cyan-300">jump()</strong> over them!
                    </p>
                  </div>

                  <div className="p-3 bg-black/60 border border-green-500/40 rounded space-y-1">
                    <div className="flex items-center gap-2 text-green-400 font-bold">
                      <Sword size={14} />
                      <span>i % 5 == 0 (Goblin)</span>
                    </div>
                    <p className="text-neutral-400 font-sans text-xs">
                      Steps <strong>5, 10</strong> contain Goblins. Must <strong className="text-green-300">attack()</strong> to strike them down!
                    </p>
                  </div>

                  <div className="p-3 bg-black/60 border border-neutral-700 rounded space-y-1">
                    <div className="flex items-center gap-2 text-neutral-300 font-bold">
                      <ArrowRight size={14} />
                      <span>All Other Steps</span>
                    </div>
                    <p className="text-neutral-400 font-sans text-xs">
                      Steps <strong>1, 2, 4, 7, 8, 11, 13, 14</strong> are clear. Must <strong className="text-white">run()</strong> forward!
                    </p>
                  </div>
                </div>

                {/* 14-Step Visual Grid */}
                <div className="p-3 bg-black/80 border border-neutral-800 rounded space-y-2">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                    Obstacle Map for Each 14-Step Zone:
                  </span>
                  <div className="grid grid-cols-7 sm:grid-cols-14 gap-1 text-center font-mono text-[10px]">
                    {[
                      { step: 1, type: 'RUN', icon: '🏃' },
                      { step: 2, type: 'RUN', icon: '🏃' },
                      { step: 3, type: 'JUMP', icon: '🔥', hl: 'text-orange-400' },
                      { step: 4, type: 'RUN', icon: '🏃' },
                      { step: 5, type: 'ATTACK', icon: '👺', hl: 'text-green-400' },
                      { step: 6, type: 'JUMP', icon: '🔥', hl: 'text-orange-400' },
                      { step: 7, type: 'RUN', icon: '🏃' },
                      { step: 8, type: 'RUN', icon: '🏃' },
                      { step: 9, type: 'JUMP', icon: '🔥', hl: 'text-orange-400' },
                      { step: 10, type: 'ATTACK', icon: '👺', hl: 'text-green-400' },
                      { step: 11, type: 'RUN', icon: '🏃' },
                      { step: 12, type: 'JUMP', icon: '🔥', hl: 'text-orange-400' },
                      { step: 13, type: 'RUN', icon: '🏃' },
                      { step: 14, type: 'RUN', icon: '🏃' },
                    ].map((s) => (
                      <div key={s.step} className="p-1.5 bg-neutral-900 border border-neutral-800 rounded">
                        <div className="text-[9px] text-neutral-500">#{s.step}</div>
                        <div className="text-sm my-0.5">{s.icon}</div>
                        <div className={`font-bold text-[9px] ${s.hl || 'text-neutral-400'}`}>{s.type}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totem Activation Rule */}
                <div className="p-3.5 bg-purple-950/40 border border-purple-500/50 rounded flex items-start gap-3 text-purple-200">
                  <Sparkles size={18} className="text-purple-400 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <strong className="text-purple-300 uppercase tracking-wider block font-mono mb-0.5">
                      ✨ Activating the Totem (Crucial Placement Rule)
                    </strong>
                    Directly after completing the 14 movement steps, call <code className="text-yellow-300 bg-black/60 px-1 py-0.2 rounded font-mono">activate_totem()</code>! Place this block <strong>OUTSIDE</strong> the 14-step loop, but <strong>INSIDE</strong> the 3-zone repeat loop!
                  </div>
                </div>
              </div>

              {/* Algorithmic Blueprint */}
              <div className="bg-[#0e160a] border border-[var(--border-gold)]/40 p-5 rounded space-y-3">
                <div className="flex items-center gap-2 text-white font-cinzel font-bold text-sm">
                  <Code2 size={16} className="text-green-400" />
                  <span>2. Recommended Algorithmic Blueprint</span>
                </div>

                <div className="p-3 bg-black/80 border border-neutral-800 rounded font-mono text-xs text-neutral-300 space-y-1.5 leading-relaxed">
                  <div className="text-neutral-500">// Repeat for each of the 3 elemental zones</div>
                  <div><span className="text-blue-400">repeat</span> <span className="text-purple-400">3</span> <span className="text-blue-400">times</span>:</div>
                  <div className="pl-6"><span className="text-blue-400">count with</span> <span className="text-amber-400">i</span> <span className="text-blue-400">from</span> <span className="text-purple-400">1</span> <span className="text-blue-400">to</span> <span className="text-purple-400">14</span> <span className="text-blue-400">by</span> <span className="text-purple-400">1</span>:</div>
                  <div className="pl-12"><span className="text-blue-400">if</span> (<span className="text-amber-400">i</span> % <span className="text-purple-400">3</span> == <span className="text-purple-400">0</span>):</div>
                  <div className="pl-18 text-cyan-400">jump() <span className="text-neutral-500">// Over fire pit</span></div>
                  <div className="pl-12"><span className="text-blue-400">else if</span> (<span className="text-amber-400">i</span> % <span className="text-purple-400">5</span> == <span className="text-purple-400">0</span>):</div>
                  <div className="pl-18 text-green-400">attack() <span className="text-neutral-500">// Defeat goblin</span></div>
                  <div className="pl-12"><span className="text-blue-400">else</span>:</div>
                  <div className="pl-18 text-white">run() <span className="text-neutral-500">// Solid ground</span></div>
                  <div className="pl-6 text-purple-400 pt-1">activate_totem() <span className="text-neutral-500">// Awaken zone altar</span></div>
                </div>
              </div>

              {/* Toolbox Blocks Needed */}
              <div className="bg-[#0e160a] border border-[var(--border-gold)]/40 p-5 rounded space-y-3">
                <h4 className="text-xs font-mono uppercase text-amber-400 font-bold tracking-wider">
                  Key Blocks to Pull from the Toolbox:
                </h4>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-black/60 border border-green-500/40 text-green-300">Actions: Run, Jump, Attack, Activate Totem</span>
                  <span className="px-2.5 py-1 rounded bg-black/60 border border-blue-500/40 text-blue-300">Loops: Repeat [3] times & Count with [i] from [1] to [14]</span>
                  <span className="px-2.5 py-1 rounded bg-black/60 border border-cyan-500/40 text-cyan-300">Logic: If / Else If / Else & Comparison (`==`)</span>
                  <span className="px-2.5 py-1 rounded bg-black/60 border border-purple-500/40 text-purple-300">Math: Remainder of (`%`) & Numbers (`0`, `1`, `3`, `5`, `14`)</span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border-gold)]/40 bg-[#0d140a] flex items-center justify-between shrink-0">
          <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-2">
            <span>Tip: Keep block counts below optimal par for maximum efficiency scores.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 border border-[var(--accent-gold)] bg-[var(--accent-gold)] text-[#080c06] font-bold uppercase text-xs tracking-wider rounded-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            Got It // Return to Editor
          </button>
        </div>
      </div>
    </div>
  );
};
