import React, { useEffect, useRef, useState } from 'react';
import { ChevronUp, Maximize2, Minus, PartyPopper, CheckCircle, FileText, Folder } from 'lucide-react';
import { useOS } from '../os/state/OSContext.jsx';
import { SET_PRESENTATIONS, TASK_PRESENTATIONS, TASK_DEFINITIONS } from '../round1/taskContent.js';
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
    setCelebratedTask({ task: { ...newlyCompleted, ...TASK_PRESENTATIONS[newlyCompleted.id] }, setComplete });
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
        setObjectiveMode('docked');
      } else if (objectiveMode === 'docked') {
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

  const setPresentation = SET_PRESENTATIONS[activeTask.setId];
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
      answer: val
    });

    const isAnswerCorrect = activeTask.validator({ answer: val });

    if (isAnswerCorrect) {
      setIsCorrect(true);
      setFeedbackMsg('✓ Correct! Investigation complete.');
    } else {
      setIsCorrect(false);
      setFeedbackMsg('Not quite. Review the evidence and try again.');
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
          <div className="objective-backdrop" onClick={() => setObjectiveMode('docked')}>
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
                  <span className="objective-set-label">{setPresentation?.label} — {setPresentation?.title}</span>
                  <span className="objective-task-label">TASK {presentation.number} / 12</span>
                </div>
                <button
                  className="objective-icon-button"
                  onClick={() => setObjectiveMode('docked')}
                  aria-label="Conceal objective"
                  title="Conceal objective"
                >
                  <Minus size={16} />
                </button>
              </div>
              <div className="objective-rule" />

              {/* Title & Story */}
              <h2 id="objective-title" style={{ marginTop: '0.6rem', fontSize: '1.25rem', color: '#f0f6fc' }}>
                {presentation.playerTitle}
              </h2>
              {presentation.story && (
                <p className="objective-story" style={{ fontSize: '0.85rem', color: '#8b949e', fontStyle: 'italic', marginBottom: '0.6rem' }}>
                  {presentation.story}
                </p>
              )}

              {/* Question */}
              <div className="objective-question-box" style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '6px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#58a6ff', letterSpacing: '0.08rem', display: 'block', marginBottom: '0.3rem' }}>
                  CHALLENGE BRIEFING
                </span>
                <p className="objective-copy" style={{ fontSize: '0.95rem', color: '#c9d1d9', lineHeight: 1.5, margin: 0 }}>
                  {presentation.objective}
                </p>
              </div>

              {/* Task Evidence Reference Box */}
              {requiredAssets.length > 0 && (
                <div className="task-evidence-box" style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: '6px', padding: '0.8rem 1rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7ee787', letterSpacing: '0.08rem', display: 'block', marginBottom: '0.5rem' }}>
                    VIRTUAL OS EVIDENCE
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {requiredAssets.map(asset => (
                      <div key={asset.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#161b22', padding: '0.45rem 0.75rem', borderRadius: '4px', border: '1px solid #30363d' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileText size={15} color="#79c0ff" />
                          <span style={{ fontSize: '0.85rem', color: '#f0f6fc', fontWeight: 600 }}>{asset.name}</span>
                          <span style={{ fontSize: '0.75rem', color: '#8b949e', fontFamily: 'monospace' }}>({asset.path})</span>
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: '0.3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <button
                        type="button"
                        onClick={() => setShowPicker(true)}
                        style={{ background: '#21262d', color: '#58a6ff', border: '1px solid #30363d', padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Folder size={14} />
                        <span>Locate in Virtual OS</span>
                      </button>
                      {selectedEvidencePath && (
                        <span style={{ fontSize: '0.78rem', color: '#7ee787', fontWeight: 600, fontFamily: 'monospace' }}>
                          ✓ Selected: {selectedEvidencePath}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Hints Box */}
              {hintLevel > 0 && (
                <div className="objective-hint" style={{ background: '#1c2128', border: '1px solid #388bfd', borderRadius: '6px', padding: '0.65rem 0.9rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#58a6ff', display: 'block', marginBottom: '0.2rem' }}>
                    HINT {hintLevel} OF {presentation.hints.length}
                  </span>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#c9d1d9' }}>{presentation.hints[hintLevel - 1]}</p>
                </div>
              )}

              {/* Dedicated Answer Submission Box */}
              <form onSubmit={handleAnswerSubmit} className="objective-answer-form" style={{ marginTop: '0.5rem', background: '#161b22', border: '1px solid #30363d', borderRadius: '6px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
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
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isCorrect ? '#7ee787' : '#f85149', background: isCorrect ? 'rgba(46, 160, 67, 0.15)' : 'rgba(248, 81, 73, 0.15)', padding: '0.5rem 0.75rem', borderRadius: '4px', border: `1px solid ${isCorrect ? '#2ea043' : '#f85149'}` }}>
                    {feedbackMsg}
                  </div>
                )}
              </form>

              {/* Action Buttons Footer */}
              <div className="objective-modal-actions" style={{ marginTop: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {presentation.hints.length > hintLevel ? (
                  <button className="objective-secondary-button" onClick={revealHint}>REVEAL HINT ({hintLevel + 1}/{presentation.hints.length})</button>
                ) : <div />}
                <button className="objective-primary-button" onClick={() => setObjectiveMode('docked')}>MINIMIZE PANEL</button>
              </div>
            </section>
          </div>
        )}

        {objectiveMode === 'docked' && (
          <section className="objective-widget" aria-label="Current objective">
            <div className="objective-widget-header">
              <span>CURRENT OBJECTIVE — TASK {presentation.number}</span>
              <div>
                <button onClick={() => setObjectiveMode('expanded')} aria-label="Expand objective" title="Expand objective"><Maximize2 size={14} /></button>
                <button onClick={() => setObjectiveMode('minimized')} aria-label="Minimize objective" title="Minimize objective"><Minus size={14} /></button>
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
          <button className="objective-tab" onClick={() => setObjectiveMode('docked')} aria-label="Restore current objective" title="Restore current objective">
            <PartyPopper size={15} /> TASK {presentation.number} <Maximize2 size={13} />
          </button>
        )}

        <div className="objective-journey-hud">
          <span>JOURNEY</span>
          <strong>{Math.round(round1State.journeyProgress || 0)}%</strong>
          <small>{setPresentation?.label} — {setPresentation?.title}</small>
        </div>
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
