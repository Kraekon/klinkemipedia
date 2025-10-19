import React, { useState, useRef } from 'react';
import { Button, Alert, ProgressBar } from 'react-bootstrap';
import { uploadImage } from '../services/api';
import MediaLibraryModal from './MediaLibraryModal';
import './ImageUploader.css';

const ImageUploader = ({ onUploadSuccess, onUploadError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPG, PNG, GIF, and WEBP images are allowed.');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit.');
    }

    return true;
  };

  const handleFileSelect = (file) => {
    try {
      validateFile(file);
      setSelectedFile(file);
      setError(null);

      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      const response = await uploadImage(selectedFile, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });

      if (response.success) {
        // Call success callback with image data
        if (onUploadSuccess) {
          onUploadSuccess({
            url: response.imageUrl,
            alt: response.alt,
            filename: response.filename
          });
        }
        // Reset state
        setSelectedFile(null);
        setPreview(null);
        setUploadProgress(0);
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload image';
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectFromLibrary = (imageData) => {
    // Call success callback with image data from library
    if (onUploadSuccess) {
      onUploadSuccess({
        url: imageData.url,
        alt: imageData.originalName,
        filename: imageData.filename
      });
    }
    setShowMediaLibrary(false);
  };

  return (
    <div className="image-uploader">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!preview ? (
        <>
          <div
            className={`upload-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon">📁</div>
            <p className="upload-text">
              Drag & drop an image here, or click to select
            </p>
            <p className="upload-hint">
              Supported: JPG, PNG, GIF, WEBP (max 5MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
          </div>
          
          <div className="divider-container">
            <div className="divider-line"></div>
            <span className="divider-text">OR</span>
            <div className="divider-line"></div>
          </div>

          <Button
            variant="outline-primary"
            className="w-100 browse-library-btn"
            onClick={() => setShowMediaLibrary(true)}
          >
            📁 Insert from Library
          </Button>
        </>
      ) : (
        <div className="preview-area">
          <div className="image-preview">
            <img src={preview} alt="Preview" />
          </div>
          <div className="file-info">
            <p className="file-name">{selectedFile.name}</p>
            <p className="file-size">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>

          {uploading && (
            <ProgressBar
              now={uploadProgress}
              label={`${uploadProgress}%`}
              animated
              className="mb-3"
            />
          )}

          <div className="upload-actions">
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Inserting Image...' : 'Insert Image'}
            </Button>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      <MediaLibraryModal
        show={showMediaLibrary}
        onHide={() => setShowMediaLibrary(false)}
        onSelectImage={handleSelectFromLibrary}
      />
    </div>
  );
};

export default ImageUploader;
