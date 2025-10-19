import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Form, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { uploadMedia, saveDraft, updateDraft } from '../services/api';
import './ArticleEditor.css';

const ArticleEditor = ({ 
  initialContent = '', 
  initialTitle = '',
  initialCategory = '',
  initialTags = [],
  draftId = null,
  articleId = null,
  onSave,
  onPublish,
  onDiscard
}) => {
  const editorRef = useRef(null);
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState(initialCategory);
  const [tags, setTags] = useState(initialTags);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState(draftId);
  const [uploadError, setUploadError] = useState(null);
  
  const autoSaveTimeoutRef = useRef(null);

  const CATEGORIES = [
    'Electrolytes',
    'Liver Function',
    'Kidney Function',
    'Cardiac Markers',
    'Hormones',
    'Enzymes',
    'Hematology',
    'Lipid Panel',
    'Other'
  ];

  // Calculate statistics
  const updateStatistics = useCallback((text) => {
    // Remove HTML tags for accurate counting
    const plainText = text.replace(/<[^>]*>/g, '').trim();
    
    const words = plainText.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const charCount = plainText.length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words/minute
    
    setWordCount(wordCount);
    setCharCount(charCount);
    setReadingTime(readingTime);
  }, []);

  // Auto-save functionality with debouncing
  const autoSave = useCallback(async () => {
    if (!title.trim() || !content.trim()) {
      return; // Don't save empty drafts
    }

    try {
      setIsSaving(true);
      setSaveStatus('Saving...');
      
      const draftData = {
        title,
        content,
        contentType: 'html',
        tags,
        category,
        article: articleId,
        metadata: {
          wordCount,
          editorMode: 'wysiwyg'
        }
      };

      let response;
      if (currentDraftId) {
        response = await updateDraft(currentDraftId, draftData);
      } else {
        response = await saveDraft(draftData);
        if (response.success && response.data._id) {
          setCurrentDraftId(response.data._id);
        }
      }

      setLastSaved(new Date());
      setSaveStatus('All changes saved');
      setHasUnsavedChanges(false);
      
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setSaveStatus('Failed to save');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [title, content, tags, category, articleId, currentDraftId, wordCount]);

  // Debounced auto-save
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (hasUnsavedChanges) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSave();
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [content, title, category, tags, hasUnsavedChanges, autoSave]);

  // Update statistics when content changes
  useEffect(() => {
    updateStatistics(content);
  }, [content, updateStatistics]);

  // Handle editor content change
  const handleEditorChange = (newContent) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  // Handle image upload
  const handleImageUpload = async (blobInfo, progress) => {
    return new Promise((resolve, reject) => {
      const file = blobInfo.blob();
      
      uploadMedia(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        progress(percentCompleted);
      })
        .then(response => {
          if (response.success) {
            // Return the full URL for TinyMCE
            const imageUrl = response.data.url.startsWith('http') 
              ? response.data.url 
              : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${response.data.url}`;
            resolve(imageUrl);
          } else {
            reject(response.message || 'Upload failed');
          }
        })
        .catch(error => {
          setUploadError(error.message || 'Upload failed');
          setTimeout(() => setUploadError(null), 3000);
          reject(error.message || 'Upload failed');
        });
    });
  };

  // Handle manual save
  const handleSaveDraft = async () => {
    await autoSave();
    if (onSave) {
      onSave({ title, content, category, tags, draftId: currentDraftId });
    }
  };

  // Handle publish
  const handlePublish = () => {
    if (onPublish) {
      onPublish({ title, content, category, tags, draftId: currentDraftId });
    }
  };

  // Handle discard
  const handleDiscard = () => {
    if (onDiscard) {
      onDiscard(currentDraftId);
    }
  };

  // Navigation guard
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <div className="article-editor">
      {/* Status Bar */}
      <div className="editor-status-bar mb-3 d-flex justify-content-between align-items-center">
        <div className="status-indicators">
          {isSaving && (
            <Badge bg="info" className="me-2">
              <Spinner animation="border" size="sm" className="me-1" />
              Saving...
            </Badge>
          )}
          {saveStatus && !isSaving && (
            <Badge bg={saveStatus.includes('Failed') ? 'danger' : 'success'} className="me-2">
              {saveStatus}
            </Badge>
          )}
          {lastSaved && !isSaving && !saveStatus && (
            <Badge bg="secondary" className="me-2">
              Last saved: {lastSaved.toLocaleTimeString()}
            </Badge>
          )}
        </div>
        
        <div className="editor-stats">
          <Badge bg="light" text="dark" className="me-2">
            {wordCount} words
          </Badge>
          <Badge bg="light" text="dark" className="me-2">
            {charCount} characters
          </Badge>
          <Badge bg="light" text="dark">
            ~{readingTime} min read
          </Badge>
        </div>
      </div>

      {uploadError && (
        <Alert variant="danger" dismissible onClose={() => setUploadError(null)}>
          {uploadError}
        </Alert>
      )}

      {/* Title Field */}
      <Form.Group className="mb-3">
        <Form.Label>Title *</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter article title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setHasUnsavedChanges(true);
          }}
          required
        />
      </Form.Group>

      {/* Category Field */}
      <Form.Group className="mb-3">
        <Form.Label>Category *</Form.Label>
        <Form.Select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setHasUnsavedChanges(true);
          }}
          required
        >
          <option value="">Select a category</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Form.Select>
      </Form.Group>

      {/* Tags Field */}
      <Form.Group className="mb-3">
        <Form.Label>Tags (comma-separated)</Form.Label>
        <Form.Control
          type="text"
          placeholder="e.g., sodium, electrolyte, blood-test"
          value={tags.join(', ')}
          onChange={(e) => {
            const newTags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
            setTags(newTags);
            setHasUnsavedChanges(true);
          }}
        />
      </Form.Group>

      {/* Preview Toggle */}
      <div className="mb-3">
        <Button 
          variant={showPreview ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? '📝 Edit Mode' : '👁️ Preview Mode'}
        </Button>
      </div>

      {/* Editor or Preview */}
      {showPreview ? (
        <div className="preview-container border rounded p-3 mb-3" style={{ minHeight: '400px' }}>
          <h2>{title || 'Untitled Article'}</h2>
          <div className="mb-2">
            <Badge bg="secondary" className="me-2">{category || 'No Category'}</Badge>
            {tags.map((tag, idx) => (
              <Badge key={idx} bg="info" className="me-1">{tag}</Badge>
            ))}
          </div>
          <hr />
          <div dangerouslySetInnerHTML={{ __html: content || '<p>No content yet...</p>' }} />
        </div>
      ) : (
        <div className="mb-3">
          <Form.Label>Content *</Form.Label>
          <Editor
            apiKey="no-api-key"
            onInit={(evt, editor) => editorRef.current = editor}
            value={content}
            onEditorChange={handleEditorChange}
            init={{
              height: 500,
              menubar: true,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
              ],
              toolbar: 'undo redo | blocks | ' +
                'bold italic forecolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | image media link | preview code | help',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
              images_upload_handler: handleImageUpload,
              automatic_uploads: true,
              file_picker_types: 'image',
              paste_data_images: true,
              images_reuse_filename: false,
              promotion: false,
              branding: false
            }}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="editor-actions d-flex justify-content-between mt-4">
        <div>
          <Button 
            variant="outline-secondary" 
            onClick={handleSaveDraft}
            disabled={isSaving || !title.trim() || !content.trim()}
            className="me-2"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button 
            variant="outline-danger" 
            onClick={handleDiscard}
          >
            Discard Draft
          </Button>
        </div>
        <Button 
          variant="success" 
          onClick={handlePublish}
          disabled={!title.trim() || !content.trim() || !category}
        >
          Publish Article
        </Button>
      </div>
    </div>
  );
};

export default ArticleEditor;
