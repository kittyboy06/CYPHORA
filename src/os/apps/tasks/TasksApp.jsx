import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, HelpCircle, ChevronRight, CheckSquare, Sparkles } from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import { TASK_DEFINITIONS, TASK_PRESENTATIONS, SET_PRESENTATIONS } from '../../../round1/taskContent.js';
import { ROUND_1_SETS } from '../../../round1/round1Engine.js';
import './TasksApp.css';

export function TasksApp() {
  const { round1State, eventBus } = useOS();
  const tasks = round1State?.tasks || [];
  const activeTask = tasks.find(t => t.status === 'ACTIVE');
  const activeTaskId = activeTask?.id || null;

  const [answerInput, setAnswerInput] = useState('');
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  const [hintLevel, setHintLevel] = useState(0);

  // Reset form when active task changes
  useEffect(() => {
    setAnswerInput('');
    setFeedback({ text: '', type: '' });
    setHintLevel(0);
  }, [activeTaskId]);

  const taskDef = activeTask ? (TASK_DEFINITIONS.find(t => t.id === activeTask.id) || activeTask) : null;
  const presentation = activeTask ? (TASK_PRESENTATIONS[activeTask.id] || {
    number: activeTask.id.replace('r1_t', '').padStart(2, '0'),
    playerTitle: activeTask.title,
    objective: taskDef?.question || activeTask.description,
    story: taskDef?.story || '',
    hints: taskDef?.hints || []
  }) : null;

  const currentSetId = activeTask?.setId || ROUND_1_SETS.find(s => s.tasks.includes(activeTask?.id))?.id || 'set1';
  const setPresentation = SET_PRESENTATIONS[currentSetId];

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const totalTasks = tasks.length || 12;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);

  const handleRevealHint = () => {
    if (!presentation?.hints?.length) return;
    const nextLevel = Math.min(hintLevel + 1, presentation.hints.length);
    setHintLevel(nextLevel);
    eventBus.emit('HINT_REVEALED', {
      taskId: activeTask.id,
      hintLevel: nextLevel
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanAnswer = answerInput.trim();
    if (!cleanAnswer) {
      setFeedback({ text: 'Please enter an answer before submitting.', type: 'error' });
      return;
    }

    if (!activeTask) return;

    // Check client validation
    const isCorrect = activeTask.validator ? activeTask.validator({ answer: cleanAnswer }) : false;

    // Emit event for backend sync and engine update
    eventBus.emit('TASK_ANSWER_SUBMITTED', {
      answer: cleanAnswer
    });

    if (isCorrect) {
      setFeedback({ text: '✓ Correct! Task completed successfully.', type: 'success' });
      setAnswerInput('');
    } else {
      setFeedback({ text: 'Incorrect answer. Verify evidence and try again.', type: 'error' });
    }
  };

  if (!round1State?.round1StartedAt) {
    return (
      <div className="tasks-app-container empty">
        <AlertCircle size={32} color="#dfb125" />
        <h3>Expedition Not Started</h3>
        <p>Start the expedition from the main console to begin investigation tasks.</p>
      </div>
    );
  }

  if (round1State?.isCompleted || completedCount === 12) {
    return (
      <div className="tasks-app-container completed-all">
        <Sparkles size={40} color="#7ee787" />
        <h2>All 12 Tasks Completed</h2>
        <p>Round 1 Subsystems Restored. The path to the Light is open.</p>
        <div className="tasks-final-stats">
          <div className="stat-pill">12 / 12 Completed</div>
          <div className="stat-pill">Progress: 100%</div>
        </div>
      </div>
    );
  }

  if (!activeTask || !presentation) {
    return (
      <div className="tasks-app-container empty">
        <CheckCircle size={32} color="#7ee787" />
        <h3>All Available Tasks Completed</h3>
        <p>Awaiting subsystem sync or completion state.</p>
      </div>
    );
  }

  return (
    <div className="tasks-app-container">
      {/* Header telemetry */}
      <div className="tasks-top-bar">
        <div className="tasks-subsystem-tag">
          {setPresentation?.label || 'SUBSYSTEM'} — {setPresentation?.title || 'FIELD RESTORATION'}
        </div>
        <div className="tasks-counter-tag">
          TASK {presentation.number} / {totalTasks}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="tasks-progress-wrap" title={`Overall Progress: ${progressPercent}% (${completedCount}/${totalTasks})`}>
        <div className="tasks-progress-bar" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Main scrollable body */}
      <div className="tasks-scroll-content">
        <h2 className="tasks-title">{presentation.playerTitle}</h2>

        {presentation.story && (
          <p className="tasks-story">{presentation.story}</p>
        )}

        <div className="tasks-objective-card">
          <div className="objective-label">CURRENT OBJECTIVE</div>
          <div className="objective-text">{presentation.objective}</div>
        </div>

        {/* Revealed Hints */}
        {hintLevel > 0 && presentation.hints && presentation.hints.length > 0 && (
          <div className="tasks-hints-card">
            <div className="hints-header">
              <span>REVEALED HINTS ({hintLevel} OF {presentation.hints.length})</span>
              {hintLevel < presentation.hints.length && (
                <button type="button" className="hint-next-btn" onClick={handleRevealHint}>
                  Next Hint <ChevronRight size={13} />
                </button>
              )}
            </div>
            <div className="hints-list">
              {presentation.hints.slice(0, hintLevel).map((hintText, idx) => (
                <div key={idx} className="hint-item">
                  <div className="hint-item-badge">HINT {idx + 1} OF {presentation.hints.length}</div>
                  <p className="hint-body">{hintText}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Persistent Bottom Action Area */}
      <div className="tasks-bottom-action-area">
        {feedback.text && (
          <div className={`tasks-feedback-msg ${feedback.type}`}>
            {feedback.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="tasks-form">
          <div className="tasks-input-group">
            <input
              type="text"
              className="tasks-input"
              placeholder="Enter answer / recovered value..."
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              autoFocus
            />
            <button type="submit" className="tasks-submit-btn">
              <CheckSquare size={16} />
              <span>SUBMIT</span>
            </button>
          </div>
        </form>

        <div className="tasks-footer-controls">
          {presentation.hints && presentation.hints.length > 0 && hintLevel < presentation.hints.length ? (
            <button
              type="button"
              className="tasks-hint-btn"
              onClick={handleRevealHint}
            >
              <HelpCircle size={14} />
              <span>Request Hint {hintLevel + 1}/{presentation.hints.length}</span>
            </button>
          ) : (
            <span className="hints-depleted">
              {hintLevel > 0 ? 'All hints revealed' : 'No hints available'}
            </span>
          )}

          <div className="tasks-overall-label">
            Completed: {completedCount} / {totalTasks}
          </div>
        </div>
      </div>
    </div>
  );
}
