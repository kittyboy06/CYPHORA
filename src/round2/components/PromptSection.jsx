import React from 'react';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * PromptSection Component
 * 
 * Provides an accessible, styled textarea for participant prompt input.
 * Meets requirement: Label exactly "Enter your prompt" with semantic markup and validation.
 */
export function PromptSection({
  value,
  onChange,
  error,
  touched,
  maxLength = 1500,
  minLength = 10,
}) {
  const currentLength = value ? value.length : 0;
  const isTooShort = touched && value.trim().length < minLength && value.trim().length > 0;
  const isValid = touched && !error && value.trim().length >= minLength;

  return (
    <section className="form-input-card prompt-card" aria-labelledby="prompt-heading">
      <div className="card-header">
        <div className="header-title-group">
          <Sparkles className="header-icon gold-text" size={20} />
          <h3 id="prompt-heading">Recreation Prompt</h3>
        </div>
        <div className="char-counter" aria-live="polite">
          <span className={currentLength > maxLength - 50 ? 'near-limit' : ''}>
            {currentLength}
          </span>
          <span className="char-max"> / {maxLength} chars</span>
        </div>
      </div>

      <div className="input-group">
        <div className="label-row">
          <label htmlFor="participant-prompt" className="field-label">
            Enter your prompt <span className="required-star" aria-hidden="true">*</span>
          </label>
          <span className="field-hint">Describe the image composition, subject, style, lighting & details</span>
        </div>

        <div className="textarea-wrapper">
          <textarea
            id="participant-prompt"
            name="prompt"
            className={`styled-textarea ${error && touched ? 'has-error' : ''} ${isValid ? 'is-valid' : ''}`}
            placeholder="e.g., A cinematic wide-angle photograph of an ancient stone altar inside a dense bioluminescent jungle, morning mist illuminated by golden sunbeams, moss covered stone..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={5}
            maxLength={maxLength}
            required
            aria-required="true"
            aria-invalid={Boolean(error && touched)}
            aria-describedby="prompt-helper-text prompt-error-msg"
          />
        </div>

        <div className="field-meta-row">
          <span id="prompt-helper-text" className="helper-text">
            Minimum {minLength} characters required for evaluation model.
          </span>

          {error && touched && (
            <div id="prompt-error-msg" className="error-message" role="alert">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {isTooShort && !error && (
            <div className="warning-message" role="alert">
              <AlertCircle size={14} />
              <span>Keep describing... at least {minLength} characters required ({minLength - value.trim().length} more needed).</span>
            </div>
          )}

          {isValid && (
            <div className="success-message">
              <CheckCircle2 size={14} />
              <span>Prompt requirements met</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
