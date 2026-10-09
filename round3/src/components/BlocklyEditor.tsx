import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState, useCallback } from 'react';
import * as Blockly from 'blockly';
import 'blockly/javascript';
import { setupBlocks } from '../blockly/customBlocks';
import { getToolboxXml } from '../blockly/toolbox';
import { getWorkspaceOptions } from '../blockly/config';
import { javascriptGenerator } from 'blockly/javascript';
import { Trash2, Focus, AlertTriangle, X } from 'lucide-react';
import { registerTempleCategory } from '../blockly/customCategory';
import '../blockly/blockly.css';

interface BlocklyEditorProps {
  level: number;
}

const BlocklyEditor = forwardRef<any, BlocklyEditorProps>(({ level }, ref) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useImperativeHandle(ref, () => ({
    getGeneratedCode: () => {
      if (!workspaceRef.current) return '';
      // @ts-ignore
      return javascriptGenerator.workspaceToCode(workspaceRef.current);
    },
    highlightBlock: (id: string | null) => {
      if (workspaceRef.current) {
        workspaceRef.current.highlightBlock(id);
      }
    },
    setXml: (xmlString: string) => {
      if (!workspaceRef.current) return;
      workspaceRef.current.clear();
      const dom = Blockly.utils.xml.textToDom(xmlString);
      Blockly.Xml.domToWorkspace(dom, workspaceRef.current);
    },
    getBlockCount: () => {
      if (!workspaceRef.current) return 0;
      return workspaceRef.current.getAllBlocks(false).length;
    },
    clearWorkspace: () => {
      if (workspaceRef.current) {
        workspaceRef.current.clear();
      }
    }
  }));

  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;
    const handleWindowResize = () => {
      if (workspaceRef.current) {
        Blockly.svgResize(workspaceRef.current);
      }
    };

    if (blocklyDiv.current && !workspaceRef.current) {
      registerTempleCategory();
      setupBlocks();
      const options = getWorkspaceOptions({ level });
      workspaceRef.current = Blockly.inject(blocklyDiv.current, options);

      // Ensure dimensions and scrollbar metrics are settled immediately after mount
      requestAnimationFrame(() => {
        if (workspaceRef.current) {
          Blockly.svgResize(workspaceRef.current);
        }
      });

      // Observe container resizes (e.g. layout changes, fullscreen toggling)
      if (typeof ResizeObserver !== 'undefined' && blocklyDiv.current) {
        resizeObserver = new ResizeObserver(() => {
          if (workspaceRef.current) {
            Blockly.svgResize(workspaceRef.current);
          }
        });
        resizeObserver.observe(blocklyDiv.current);
      }

      window.addEventListener('resize', handleWindowResize);

      const changeListener = (e: any) => {
        if (e.type === Blockly.Events.BLOCK_DRAG) {
          setIsDragging(Boolean(e.isStart));
        } else if (e.type === Blockly.Events.SELECTED) {
          setSelectedBlockId(e.newElementId || null);
        }
      };

      workspaceRef.current.addChangeListener(changeListener);
    }

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (workspaceRef.current) {
      workspaceRef.current.updateToolbox(getToolboxXml(level));
    }
  }, [level]);

  // Center / reset scroll focus to blocks
  const handleRecenter = useCallback(() => {
    if (workspaceRef.current) {
      workspaceRef.current.scrollCenter();
    }
  }, []);

  // Delete selected block
  const handleDeleteSelected = useCallback(() => {
    if (!workspaceRef.current) return;
    const selected = Blockly.common.getSelected();
    if (selected && 'dispose' in selected) {
      (selected as Blockly.BlockSvg).dispose(false, true);
      setSelectedBlockId(null);
    }
  }, []);

  // Clear all blocks with confirmation
  const handleClearConfirm = useCallback(() => {
    if (workspaceRef.current) {
      workspaceRef.current.clear();
      setSelectedBlockId(null);
    }
    setShowClearConfirm(false);
  }, []);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* Blockly Injection Surface with Visual Grid */}
      <div 
        ref={blocklyDiv} 
        id="blocklyDiv"
        className="absolute inset-0"
      />

      {/* Floating Designed Delete & Tools Station (Bottom Right) */}
      <div className="absolute bottom-5 right-6 z-30 flex items-center gap-2 pointer-events-auto">
        
        {/* Active Drag Incinerator Indicator Banner */}
        {isDragging && (
          <div className="px-3 py-1.5 rounded bg-red-950/90 border border-red-500/80 text-red-200 font-mono text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse">
            <Trash2 size={14} className="text-red-400" />
            <span className="uppercase tracking-wider">Drag to Toolbox or Press [DEL]</span>
          </div>
        )}

        {/* Delete Selected Block Button (if block is selected) */}
        {selectedBlockId && !isDragging && (
          <button
            type="button"
            onClick={handleDeleteSelected}
            title="Delete Selected Block [Del]"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black/85 border border-red-500/60 hover:border-red-400 text-red-400 hover:text-red-200 font-mono text-xs uppercase tracking-wider rounded transition-all shadow-[0_0_10px_rgba(239,68,68,0.3)] hover:shadow-[0_0_15px_rgba(239,68,68,0.6)] active:scale-95"
          >
            <Trash2 size={13} />
            <span>Delete Block</span>
            <kbd className="bg-red-950/60 border border-red-800/80 px-1 py-0.2 rounded text-[10px]">DEL</kbd>
          </button>
        )}

        {/* Recenter Canvas Button */}
        <button
          type="button"
          onClick={handleRecenter}
          title="Recenter Workspace Camera"
          className="p-2 bg-[rgba(14,18,12,0.85)] border border-[var(--border-gold)]/60 hover:border-[var(--accent-gold)] text-[var(--accent-gold)] hover:text-white rounded transition-all shadow-[0_0_10px_rgba(0,0,0,0.6)] hover:shadow-[0_0_15px_rgba(223,177,37,0.3)] active:scale-95"
        >
          <Focus size={15} />
        </button>

        {/* Clear Workspace Button */}
        <button
          type="button"
          onClick={() => setShowClearConfirm(true)}
          title="Clear Entire Workspace"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(14,18,12,0.85)] border border-[var(--border-gold)]/60 hover:border-red-500/80 text-[var(--text-muted)] hover:text-red-400 font-mono text-xs uppercase tracking-wider rounded transition-all shadow-[0_0_10px_rgba(0,0,0,0.6)] hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] active:scale-95"
        >
          <Trash2 size={14} />
          <span className="hidden sm:inline">Clear All</span>
        </button>
      </div>

      {/* Confirmation Modal for Clearing Workspace */}
      {showClearConfirm && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1008] border border-[var(--border-gold)] max-w-sm w-full p-6 rounded shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-gold)]/30 pb-3">
              <div className="flex items-center gap-2 text-red-400 font-mono text-sm uppercase tracking-wider font-bold">
                <AlertTriangle size={18} />
                <span>Incinerate Workspace</span>
              </div>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="text-neutral-500 hover:text-neutral-300"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-[var(--text-primary)] font-mono leading-relaxed">
              Are you sure you want to delete all blocks from the workspace? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-1.5 bg-black/60 border border-neutral-700 hover:border-neutral-500 text-neutral-300 font-mono text-xs uppercase tracking-wider rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearConfirm}
                className="px-4 py-1.5 bg-red-950/80 border border-red-500 hover:bg-red-900 text-red-200 font-mono text-xs uppercase tracking-wider font-bold rounded shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                Incinerate All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default BlocklyEditor;
