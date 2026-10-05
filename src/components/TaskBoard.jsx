import React, { useEffect, useRef, useState } from 'react';
import { ChevronUp, Maximize2, Minus, CheckCircle, CheckSquare } from 'lucide-react';
import { useOS } from '../os/state/OSContext.jsx';
import { SET_PRESENTATIONS, TASK_PRESENTATIONS, TASK_DEFINITIONS } from '../round1/taskContent.js';
import { ROUND_1_SETS } from '../round1/round1Engine.js';
import { TaskCompletionCelebration } from './TaskCompletionCelebration.jsx';
import { VirtualFilePicker } from '../os/components/VirtualFilePicker.jsx';

const formatTaskId = (task) => TASK_PRESENTATIONS[task.id]?.number || task.id.replace('r1_t', '').padStart(2, '0');

export function TaskBoard({ round1State }) {
  const { eventBus } = useOS();
  const tasks = round1State?.tasks || [];
  const activeTask = tasks.find(task => task.status === 'ACTIVE');
  const activeTaskId = activeTask?.id || null;
  const [objectiveMode, setObjectiveMode] = useState('expanded');
  const [hintLevel, setHintLevel] = useState(0);
  const [submittedAnswer, setSubmittedAnswer] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedEvidencePath, setSelectedEvidencePath] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [celebratedTask, setCelebratedTask] = useState(null);
  const previousActiveTask = useRef(null);
  const seenCompletedTasks = useRef(new Set(tasks.filter(task => task.status === 'COMPLETED').map(task => task.id)));
  const celebrationTimeout = useRef(null);

  useEffect(() => {
    if (!activeTaskId) {
      setObjectiveMode('minimized');
      return;
    }

    if (previousActiveTask.current !== activeTaskId) {
      previousActiveTask.current = activeTaskId;
      setObjectiveMode('expanded');
      setHintLevel(0);
      setSubmittedAnswer('');
      setFeedbackMsg('');
      setIsCorrect(false);
      setSelectedEvidencePath('');
    }
  }, [activeTaskId]);

  useEffect(() => {
    const newlyCompleted = tasks.find(task => task.status === 'COMPLETED' && !seenCompletedTasks.current.has(task.id));
    tasks.forEach(task => {
      if (task.status === 'COMPLETED') seenCompletedTasks.current.add(task.id);
    });
    if (!newlyCompleted) return undefined;

    if (celebrationTimeout.current) window.clearTimeout(celebrationTimeout.current);
    const setTasks = tasks.filter(task => task.setId === newlyCompleted.setId);
    const setComplete = setTasks.length > 0 && setTasks.every(task => task.status === 'COMPLETED');
    const pointsAwarded = newlyCompleted.pointsAwarded !== undefined
      ? newlyCompleted.pointsAwarded
      : Math.max(0, 20 - ((newlyCompleted.hintsUsed || 0) * 5));
    setCelebratedTask({ task: { ...newlyCompleted, ...TASK_PRESENTATIONS[newlyCompleted.id], pointsAwarded }, setComplete });
    celebrationTimeout.current = window.setTimeout(() => {
      setCelebratedTask(null);
      celebrationTimeout.current = null;
    }, setComplete ? 2800 : 2500);
    return undefined;
  }, [tasks]);

  useEffect(() => () => {
    if (celebrationTimeout.current) window.clearTimeout(celebrationTimeout.current);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (objectiveMode === 'expanded') {
        event.preventDefault();
        setObjectiveMode('minimized');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [objectiveMode]);

  if (!round1State || !activeTask) {
    return celebratedTask ? <TaskCompletionCelebration {...celebratedTask} /> : null;
  }

  const taskDef = TASK_DEFINITIONS.find(t => t.id === activeTask.id) || activeTask;
  const presentation = TASK_PRESENTATIONS[activeTask.id] || {
    number: formatTaskId(activeTask),
    playerTitle: activeTask.title.toUpperCase(),
    objective: taskDef.question || activeTask.description,
    story: taskDef.story || '',
    hints: []
  };

  const currentSetId = activeTask.setId || ROUND_1_SETS.find(s => s.tasks.includes(activeTask.id))?.id || round1State?.activeSet || 'set1';
  const setPresentation = SET_PRESENTATIONS[currentSetId];
  const requiredAssets = taskDef.requiredInput?.assets || [];

  const revealHint = () => {
    const nextLevel = Math.min(hintLevel + 1, presentation.hints.length);
    setHintLevel(nextLevel);
    eventBus.emit('HINT_REVEALED', {
      taskId: activeTask.id,
      hintLevel: nextLevel
    });
  };

  const handleVirtualFilePicked = (virtualNode) => {
    if (!virtualNode) return;
    setSelectedEvidencePath(virtualNode.path);

    eventBus.emit('FILE_SELECTED', {
      taskId: activeTask.id,
      fileName: virtualNode.name,
      filePath: virtualNode.path
    });
  };

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    const val = submittedAnswer.trim();
    if (!val) return;

    eventBus.emit('TASK_ANSWER_SUBMITTED', {
      answer: val,
      hintsUsed: hintLevel,
      taskId: activeTask.id
    });

    const isAnswerCorrect = activeTask.validator({ answer: val });

    if (isAnswerCorrect) {
      setIsCorrect(true);
      const points = Math.max(0, 20 - (hintLevel * 5));
      const penaltyNote = hintLevel > 0 ? ` (${hintLevel} hint${hintLevel > 1 ? 's' : ''} used: -${hintLevel * 5} pts)` : '';
      setFeedbackMsg(`✓ CORRECT (+${points} PTS EARNED${penaltyNote})\n\nTask complete.`);
    } else {
      setIsCorrect(false);
      setFeedbackMsg('Not quite.\n\nReview the information you recovered and try again.');
    }
  };

  const getPlaceholder = () => {
    if (taskDef.answer?.type === 'number') return 'Enter the final number...';
    if (taskDef.answer?.type === 'filename') return 'Enter the filename...';
    if (taskDef.answer?.type === 'code') return 'Enter the code...';
    return 'Enter the value you obtained...';
  };

  return (
    <>
      <div className={`objective-shell objective-${objectiveMode}`}>
        {objectiveMode === 'expanded' && (
          <div className="objective-backdrop" onClick={() => setObjectiveMode('minimized')}>
            <section
              className="objective-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="objective-title"
              onClick={event => event.stopPropagation()}
              style={{ maxWidth: '640px', width: '90%' }}
            >
              {/* Header Bar */}
              <div className="objective-modal-header">
                <div>
                  <span className="objective-set-label" style={{ fontSize: '0.78rem', fontWeight: 800, color: '#58a6ff', letterSpacing: '0.1rem', textTransform: 'uppercase' }}>
                    {setPresentation?.label} — {setPresentation?.title}
                  </span>
                  <span className="objective-task-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b949e', marginLeft: '0.75rem' }}>
                    TASK {presentation.number} / 12
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: hintLevel === 0 ? '#3fb950' : hintLevel === 1 ? '#d29922' : '#f85149',
                    background: hintLevel === 0 ? 'rgba(46, 160, 67, 0.15)' : hintLevel === 1 ? 'rgba(210, 153, 34, 0.15)' : 'rgba(248, 81, 73, 0.15)',
                    border: `1px solid ${hintLevel === 0 ? 'rgba(46, 160, 67, 0.3)' : hintLevel === 1 ? 'rgba(210, 153, 34, 0.3)' : 'rgba(248, 81, 73, 0.3)'}`,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '12px',
                    marginLeft: '0.75rem'
                  }}>
                    {hintLevel === 0 ? '20 PTS' : hintLevel === 1 ? '15 PTS (-5 HINT)' : '10 PTS (-10 HINT)'}
                  </span>
                </div>
                <button
                  className="objective-icon-button"
                  onClick={() => setObjectiveMode('minimized')}
                  aria-label="Minimize task to bottom left"
                  title="Minimize task to bottom left"
                >
                  <Minus size={16} />
                </button>
              </div>
              <div className="objective-rule" style={{ margin: '0.5rem 0 0.8rem 0', borderBottom: '1px solid #30363d' }} />

              {/* Title & Story / Scenario */}
              <h2 id="objective-title" style={{ marginTop: '0.4rem', marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 700, color: '#f0f6fc', letterSpacing: '0.02rem' }}>
                {presentation.playerTitle}
              </h2>
              {presentation.story && (
                <p className="objective-story" style={{ fontSize: '0.9rem', color: '#8b949e', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                  {presentation.story}
                </p>
              )}

              {/* Objective Box */}
              <div className="objective-question-box" style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '6px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#58a6ff', letterSpacing: '0.1rem', display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  OBJECTIVE
                </span>
                <p className="objective-copy" style={{ fontSize: '0.95rem', color: '#c9d1d9', lineHeight: 1.5, margin: 0, fontWeight: 500, whiteSpace: 'pre-line' }}>
                  {presentation.objective}
                </p>
              </div>

              {/* Dedicated Answer Submission Box */}
              <form onSubmit={handleAnswerSubmit} className="objective-answer-form" style={{ marginTop: '1rem', background: '#161b22', border: '1px solid #30363d', borderRadius: '6px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f0f6fc', letterSpacing: '0.08rem' }}>
                  FINAL ANSWER
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder={getPlaceholder()}
                    value={submittedAnswer}
                    onChange={(e) => setSubmittedAnswer(e.target.value)}
                    style={{ flex: 1, background: '#0d1117', border: '1px solid #30363d', color: '#7ee787', padding: '0.65rem 0.85rem', borderRadius: '4px', fontSize: '0.95rem', fontFamily: 'monospace', outline: 'none' }}
                  />
                  <button
                    type="submit"
                    style={{ background: '#238636', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}
                  >
                    <CheckCircle size={16} />
                    <span>SUBMIT ANSWER</span>
                  </button>
                </div>

                {feedbackMsg && (
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'pre-line', color: isCorrect ? '#7ee787' : '#f85149', background: isCorrect ? 'rgba(46, 160, 67, 0.15)' : 'rgba(248, 81, 73, 0.15)', padding: '0.5rem 0.75rem', borderRadius: '4px', border: `1px solid ${isCorrect ? '#2ea043' : '#f85149'}` }}>
                    {feedbackMsg}
                  </div>
                )}
              </form>

              {/* Action Buttons Footer */}
              <div className="objective-modal-actions" style={{ marginTop: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {presentation.hints && presentation.hints.length > 0 && !isCorrect ? (
                  <button
                    type="button"
                    className="objective-secondary-button"
                    onClick={revealHint}
                    title="Getting a hint reduces 5 points (2 hints reduce 10 points)"
                    style={{ background: '#21262d', color: '#e3b341', border: '1px solid #d29922', padding: '0.45rem 0.85rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <span>? HINT (-5 PTS)</span>
                    {hintLevel > 0 && <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({hintLevel}/{presentation.hints.length})</span>}
                  </button>
                ) : <div />}
                
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button 
                    type="button" 
                    className="objective-secondary-button" 
                    onClick={() => setObjectiveMode('minimized')}
                    style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#c9d1d9', border: '1px solid #30363d', padding: '0.55rem 1rem', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                  >
                    <Minus size={14} />
                    <span>MINIMIZE TO BOTTOM LEFT</span>
                  </button>

                  {isCorrect && (
                    <button
                      type="button"
                      className="objective-primary-button"
                      onClick={() => {
                        setIsCorrect(false);
                        setFeedbackMsg('');
                        setSubmittedAnswer('');
                      }}
                      style={{
                        background: '#238636',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.55rem 1.25rem',
                        borderRadius: '4px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      PROCEED TO NEXT TASK →
                    </button>
                  )}
                </div>
              </div>

              {/* Hint Modal Display */}
              {hintLevel > 0 && presentation.hints && presentation.hints.length > 0 && (
                <div className="objective-hint" style={{ marginTop: '1rem', background: '#1c2128', border: '1px solid #d29922', borderRadius: '6px', padding: '0.8rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e3b341', letterSpacing: '0.05rem' }}>
                      REVEALED HINTS ({hintLevel} OF {presentation.hints.length}) &bull; -{hintLevel * 5} PTS PENALTY
                    </span>
                    {hintLevel < presentation.hints.length && (
                      <button
                        type="button"
                        onClick={revealHint}
                        style={{ background: 'transparent', border: 'none', color: '#58a6ff', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        MORE SPECIFIC HINT →
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    {presentation.hints.slice(0, hintLevel).map((hText, idx) => (
                      <div key={idx} style={{ borderTop: idx > 0 ? '1px solid rgba(210, 153, 34, 0.2)' : 'none', paddingTop: idx > 0 ? '0.4rem' : '0' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#e3b341', display: 'block', marginBottom: '0.15rem' }}>
                          HINT {idx + 1} OF {presentation.hints.length}
                        </span>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#c9d1d9', lineHeight: 1.4 }}>
                          {hText}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {objectiveMode === 'docked' && (
          <section className="objective-widget" aria-label="Current objective">
            <div className="objective-widget-header">
              <span>CURRENT OBJECTIVE — TASK {presentation.number}</span>
              <div>
                <button onClick={() => setObjectiveMode('expanded')} aria-label="Expand objective popup" title="Expand objective popup"><Maximize2 size={14} /></button>
                <button onClick={() => setObjectiveMode('minimized')} aria-label="Minimize to bottom left tab" title="Minimize to bottom left tab"><Minus size={14} /></button>
              </div>
            </div>
            <button className="objective-widget-main" onClick={() => setObjectiveMode('expanded')}>
              <span className="objective-widget-id">{presentation.number}</span>
              <span><strong>{presentation.playerTitle}</strong><small>{presentation.objective}</small></span>
              <ChevronUp size={16} />
            </button>
          </section>
        )}

        {objectiveMode === 'minimized' && (
          <button 
            className="objective-tab" 
            onClick={() => setObjectiveMode('expanded')} 
            aria-label="Open task popup" 
            title="Open task popup (Task details and answer submission)"
          >
            <CheckSquare size={16} style={{ color: '#dfb125' }} />
            <span style={{ color: '#dfb125', fontWeight: 800, letterSpacing: '0.05rem' }}>TASK {presentation.number}</span>
            <span style={{ color: '#c9d1d9', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {presentation.playerTitle}
            </span>
            <ChevronUp size={15} style={{ color: '#dfb125', marginLeft: '0.2rem' }} />
          </button>
        )}
      </div>

      {celebratedTask && <TaskCompletionCelebration {...celebratedTask} />}

      {/* Virtual File Picker Modal */}
      <VirtualFilePicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelectFile={handleVirtualFilePicked}
        title="Locate Task Evidence in Virtual OS"
      />
    </>
  );
}
