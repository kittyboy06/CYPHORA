import React, { useRef } from 'react';
import {
  UploadCloud,
  FileImage,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Zap,
  Check,
  Sparkles,
  Layers
} from 'lucide-react';

/**
 * ResultImageUpload Component
 * 
 * Implements sequential single-slot progression:
 * - Phase 1: Shows ONLY "Image 1" upload slot.
 * - Phase 2: After Image 1 is submitted & evaluated, displays a completed summary
 *            for Image 1 and unlocks the active upload slot for "Image 2".
 */
export function ResultImageUpload({
  phase = 1, // 1 for Image 1, 2 for Image 2

  // Image 1 props
  image1File,
  image1PreviewUrl,
  onSelectImage1,
  onRemoveImage1,
  image1Error,
  image1EvaluatedData = null, // { score: 200, similarity: '85.2%' }

  // Image 2 props
  image2File,
  image2PreviewUrl,
  onSelectImage2,
  onRemoveImage2,
  image2Error,

  touched,
  maxSizeBytes = 10 * 1024 * 1024,
  allowedTypes = ['image/png', 'image/jpeg', 'image/webp'],
}) {
  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const validateAndProcess = (selectedFile, onSelect) => {
    if (!selectedFile) return;

    if (!allowedTypes.includes(selectedFile.type)) {
      onSelect(null, 'Invalid file format. Please upload a PNG, JPEG, or WebP image.');
      return;
    }

    if (selectedFile.size > maxSizeBytes) {
      onSelect(
        null,
        `File is too large (${formatFileSize(selectedFile.size)}). Max allowed is ${formatFileSize(maxSizeBytes)}.`
      );
      return;
    }

    onSelect(selectedFile, null);
  };

  return (
    <section className="form-input-card upload-card" aria-labelledby="upload-heading">
      <div className="card-header">
        <div className="header-title-group">
          <Layers className="header-icon gold-text" size={20} />
          <h3 id="upload-heading">
            {phase === 1 ? 'Step 1: Upload Image 1' : 'Step 2: Upload Image 2'}
          </h3>
        </div>
        <span className="format-badge">
          {phase === 1 ? 'Phase 1 of 2' : 'Phase 2 of 2'} &bull; Max 10MB
        </span>
      </div>

      {/* =========================================================================
          PHASE 1: ONLY SHOW "IMAGE 1"
          ========================================================================= */}
      {phase === 1 && (
        <div className="single-phase-container">
          <p className="card-instruction">
            Upload your initial re-creation below as <strong>Image 1</strong>.
          </p>

          <div className={`single-slot-card ${image1PreviewUrl ? 'slot-filled' : ''}`}>
            <div className="slot-badge-row">
              <span className="slot-pill slot-pill-active">
                <Sparkles size={12} /> IMAGE 1
              </span>
              <span className="slot-subtitle">Initial Synthesis Draft</span>
            </div>

            <input
              ref={fileInputRef1}
              type="file"
              id="image1-input"
              accept={allowedTypes.join(',')}
              onChange={(e) => e.target.files?.[0] && validateAndProcess(e.target.files[0], onSelectImage1)}
              style={{ display: 'none' }}
              aria-required="true"
            />

            {!image1PreviewUrl ? (
              <div
                className={`dropzone-slot ${image1Error && touched ? 'has-error' : ''}`}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files?.[0]) validateAndProcess(e.dataTransfer.files[0], onSelectImage1);
                }}
                onClick={() => fileInputRef1.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef1.current?.click()}
              >
                <UploadCloud size={32} className="slot-upload-icon gold-text" />
                <p className="dropzone-slot-title">Upload Image 1</p>
                <span className="dropzone-slot-sub">Click to browse or drag & drop</span>
              </div>
            ) : (
              <div className="slot-preview-box">
                <div className="slot-img-wrap large-preview-wrap">
                  <img src={image1PreviewUrl} alt="Image 1 Recreation Preview" className="slot-img" />
                </div>
                <div className="slot-meta-bar">
                  <div className="slot-file-text">
                    <span className="file-name" title={image1File?.name}>
                      {image1File?.name || 'image_1.png'}
                    </span>
                    <span className="file-size">{formatFileSize(image1File?.size)}</span>
                  </div>
                  <div className="slot-actions">
                    <button
                      type="button"
                      className="slot-btn replace-btn"
                      onClick={() => fileInputRef1.current?.click()}
                      title="Replace Image 1"
                    >
                      <RefreshCw size={13} /> Replace
                    </button>
                    <button
                      type="button"
                      className="slot-btn remove-btn"
                      onClick={onRemoveImage1}
                      title="Remove Image 1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {image1Error && touched && (
              <div className="error-message slot-err" role="alert">
                <AlertCircle size={13} />
                <span>{image1Error}</span>
              </div>
            )}
            {image1PreviewUrl && !image1Error && (
              <div className="success-message slot-success">
                <CheckCircle2 size={13} />
                <span>Image 1 uploaded &bull; Ready for Step 1 evaluation</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          PHASE 2: IMAGE 1 IS EVALUATED -> NOW SHOW "IMAGE 2"
          ========================================================================= */}
      {phase === 2 && (
        <div className="phase-2-container">
          {/* Completed Image 1 Summary Card */}
          <div className="completed-slot-banner">
            <div className="completed-slot-left">
              {image1PreviewUrl && (
                <div className="completed-thumb-wrap">
                  <img src={image1PreviewUrl} alt="Image 1 Submitted" className="completed-thumb" />
                </div>
              )}
              <div className="completed-text-col">
                <div className="completed-title-row">
                  <span className="completed-pill">
                    <Check size={14} /> Image 1 Submitted
                  </span>
                  <span className="completed-pts-tag gold-text" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span>Accuracy: {image1EvaluatedData?.similarity || '0%'}</span>
                    <span style={{ opacity: 0.5 }}>|</span>
                    <span>+{image1EvaluatedData?.score || 200} PTS Earned</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="card-instruction" style={{ marginTop: '1rem' }}>
            Now upload your refined final re-creation as <strong>Image 2</strong>.
          </p>

          {/* Active Image 2 Upload Slot */}
          <div className={`single-slot-card highlight-slot-3 ${image2PreviewUrl ? 'slot-filled' : ''}`}>
            <div className="slot-badge-row">
              <span className="slot-pill slot-pill-3">
                <Zap size={12} /> IMAGE 2 &bull; FINAL EVALUATION
              </span>
              <span className="slot-subtitle gold-text">Speed Points Trigger</span>
            </div>

            <input
              ref={fileInputRef2}
              type="file"
              id="image2-input"
              accept={allowedTypes.join(',')}
              onChange={(e) => e.target.files?.[0] && validateAndProcess(e.target.files[0], onSelectImage2)}
              style={{ display: 'none' }}
              aria-required="true"
            />

            {!image2PreviewUrl ? (
              <div
                className={`dropzone-slot dropzone-highlight ${image2Error && touched ? 'has-error' : ''}`}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files?.[0]) validateAndProcess(e.dataTransfer.files[0], onSelectImage2);
                }}
                onClick={() => fileInputRef2.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef2.current?.click()}
              >
                <UploadCloud size={34} className="slot-upload-icon gold-text" />
                <p className="dropzone-slot-title gold-text">Upload Image 2</p>
                <span className="dropzone-slot-sub">Click to browse or drag & drop</span>
              </div>
            ) : (
              <div className="slot-preview-box">
                <div className="slot-img-wrap large-preview-wrap">
                  <img src={image2PreviewUrl} alt="Image 2 Final Recreation Preview" className="slot-img" />
                </div>
                <div className="slot-meta-bar">
                  <div className="slot-file-text">
                    <span className="file-name" title={image2File?.name}>
                      {image2File?.name || 'image_2.png'}
                    </span>
                    <span className="file-size">{formatFileSize(image2File?.size)}</span>
                  </div>
                  <div className="slot-actions">
                    <button
                      type="button"
                      className="slot-btn replace-btn"
                      onClick={() => fileInputRef2.current?.click()}
                      title="Replace Image 2"
                    >
                      <RefreshCw size={13} /> Replace
                    </button>
                    <button
                      type="button"
                      className="slot-btn remove-btn"
                      onClick={onRemoveImage2}
                      title="Remove Image 2"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {image2Error && touched && (
              <div className="error-message slot-err" role="alert">
                <AlertCircle size={13} />
                <span>{image2Error}</span>
              </div>
            )}
            {image2PreviewUrl && !image2Error && (
              <div className="success-message slot-success gold-text">
                <CheckCircle2 size={13} />
                <span>Image 2 loaded &bull; Ready for final submission &amp; speed scoring</span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default ResultImageUpload;
