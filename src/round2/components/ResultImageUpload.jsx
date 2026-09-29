import React, { useState, useRef } from 'react';
import { UploadCloud, FileImage, Trash2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

/**
 * ResultImageUpload Component
 * 
 * Provides an accessible drag-and-drop file upload zone for participants'
 * generated output images with real-time preview, metadata calculation,
 * and comprehensive client-side validation.
 */
export function ResultImageUpload({
  file,
  previewUrl,
  onFileSelect,
  onFileRemove,
  error,
  touched,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ['image/png', 'image/jpeg', 'image/webp'],
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selected = e.dataTransfer.files[0];
      validateAndProcess(selected);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      validateAndProcess(selected);
    }
  };

  const validateAndProcess = (selectedFile) => {
    if (!selectedFile) return;

    // Type validation
    if (!allowedTypes.includes(selectedFile.type)) {
      onFileSelect(null, 'Invalid file format. Please upload a PNG, JPEG, or WebP image.');
      return;
    }

    // Size validation
    if (selectedFile.size > maxSizeBytes) {
      onFileSelect(
        null,
        `File is too large (${formatFileSize(selectedFile.size)}). Maximum allowed size is ${formatFileSize(maxSizeBytes)}.`
      );
      return;
    }

    onFileSelect(selectedFile, null);
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <section className="form-input-card upload-card" aria-labelledby="upload-heading">
      <div className="card-header">
        <div className="header-title-group">
          <FileImage className="header-icon gold-text" size={20} />
          <h3 id="upload-heading">Generated Result Image</h3>
        </div>
        <span className="format-badge">PNG, JPG, WEBP &bull; Max 10MB</span>
      </div>

      <div className="input-group">
        <div className="label-row">
          <label htmlFor="result-image-input" className="field-label">
            Upload Generated Re-creation <span className="required-star" aria-hidden="true">*</span>
          </label>
          <span className="field-hint">Upload the rendered output from your image generation engine</span>
        </div>

        {/* Hidden native input */}
        <input
          ref={fileInputRef}
          type="file"
          id="result-image-input"
          name="resultImage"
          accept={allowedTypes.join(',')}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          aria-required="true"
          aria-invalid={Boolean(error && touched)}
          aria-describedby="upload-error-msg upload-helper-text"
        />

        {/* Upload Zone / Preview Area */}
        {!previewUrl ? (
          <div
            className={`dropzone-container ${isDragOver ? 'drag-over' : ''} ${error && touched ? 'has-error' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleBrowseClick();
              }
            }}
            aria-label="Click or drop file here to upload generated image"
          >
            <div className="dropzone-inner">
              <div className="upload-icon-circle">
                <UploadCloud size={32} />
              </div>
              <p className="dropzone-primary-text">
                <strong>Click to browse</strong> or drag & drop result image
              </p>
              <p className="dropzone-secondary-text">
                Supports PNG, JPG, JPEG, WEBP (Up to 10MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="preview-container">
            <div className="preview-media-box">
              <img
                src={previewUrl}
                alt="Participant Generated Output Preview"
                className="preview-img"
              />
            </div>

            <div className="preview-details-bar">
              <div className="preview-file-info">
                <FileImage size={18} className="preview-file-icon" />
                <div className="file-text-col">
                  <span className="file-name" title={file?.name}>
                    {file?.name || 'uploaded-result-image.png'}
                  </span>
                  <span className="file-size">
                    {formatFileSize(file?.size)} &bull; {file?.type?.split('/')[1]?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="preview-actions">
                <button
                  type="button"
                  className="preview-replace-btn"
                  onClick={handleBrowseClick}
                  title="Replace with another image"
                >
                  <RefreshCw size={14} /> Replace
                </button>
                <button
                  type="button"
                  className="preview-remove-btn"
                  onClick={onFileRemove}
                  title="Remove uploaded image"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation and Status Feedback */}
        <div className="field-meta-row">
          <span id="upload-helper-text" className="helper-text">
            Evaluation pipeline compares this image against the target using multi-modal feature similarity.
          </span>

          {error && touched && (
            <div id="upload-error-msg" className="error-message" role="alert">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {previewUrl && !error && (
            <div className="success-message">
              <CheckCircle2 size={14} />
              <span>Result image verified & ready for submission</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
