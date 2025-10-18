import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import AdminNavbar from '../components/AdminNavbar';
import ReferenceRangeEditor from '../components/ReferenceRangeEditor';
import { getArticleBySlug, createArticle, updateArticle, getAllTags } from '../services/api';
import { slugify } from '../utils/slugify';
import './Admin.css';

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

const AdminArticleForm = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!slug;

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    summary: '',
    content: '',
    referenceRanges: [{ parameter: '', range: '', unit: '', ageGroup: 'All', notes: '' }],
    clinicalSignificance: '',
    interpretation: '',
    relatedTests: [],
    tags: [],
    references: [''],
    status: 'draft'
  });

  const [loading, setLoading] = useState(false);
  const [fetchingArticle, setFetchingArticle] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [relatedTestInput, setRelatedTestInput] = useState('');

  useEffect(() => {
    fetchAvailableTags();
    if (isEditMode) {
      fetchArticle();
    }
  }, [slug]);

  const fetchAvailableTags = async () => {
    try {
      const response = await getAllTags();
      setAvailableTags(response.data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  const fetchArticle = async () => {
    try {
      setFetchingArticle(true);
      const response = await getArticleBySlug(slug);
      const article = response.data;
      setFormData({
        title: article.title || '',
        slug: article.slug || '',
        category: article.category || '',
        summary: article.summary || '',
        content: article.content || '',
        referenceRanges: article.referenceRanges?.length > 0 ? article.referenceRanges : [{ parameter: '', range: '', unit: '', ageGroup: 'All', notes: '' }],
        clinicalSignificance: article.clinicalSignificance || '',
        interpretation: article.interpretation || '',
        relatedTests: article.relatedTests || [],
        tags: article.tags || [],
        references: article.references?.length > 0 ? article.references : [''],
        status: article.status || 'draft'
      });
    } catch (err) {
      console.error('Error fetching article:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load article');
    } finally {
      setFetchingArticle(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from title
    if (field === 'title' && !isEditMode) {
      setFormData(prev => ({ ...prev, slug: slugify(value) }));
    }

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleRelatedTestInputKeyDown = (e) => {
    if (e.key === 'Enter' && relatedTestInput.trim()) {
      e.preventDefault();
      if (!formData.relatedTests.includes(relatedTestInput.trim())) {
        setFormData(prev => ({ ...prev, relatedTests: [...prev.relatedTests, relatedTestInput.trim()] }));
      }
      setRelatedTestInput('');
    }
  };

  const removeRelatedTest = (testToRemove) => {
    setFormData(prev => ({
      ...prev,
      relatedTests: prev.relatedTests.filter(test => test !== testToRemove)
    }));
  };

  const handleReferenceChange = (index, value) => {
    const newReferences = [...formData.references];
    newReferences[index] = value;
    setFormData(prev => ({ ...prev, references: newReferences }));
  };

  const addReference = () => {
    setFormData(prev => ({ ...prev, references: [...prev.references, ''] }));
  };

  const removeReference = (index) => {
    if (formData.references.length > 1) {
      setFormData(prev => ({
        ...prev,
        references: prev.references.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (!formData.summary.trim()) {
      errors.summary = 'Summary is required';
    }

    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    }

    if (formData.referenceRanges.length === 0) {
      errors.referenceRanges = 'At least one reference range is required';
    } else {
      const hasInvalidRange = formData.referenceRanges.some(
        range => !range.parameter?.trim() || !range.range?.trim() || !range.unit?.trim()
      );
      if (hasInvalidRange) {
        errors.referenceRanges = 'All reference ranges must have parameter, range, and unit';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (publishNow = false) => {
    if (!validateForm()) {
      setError('Please fix the validation errors before submitting');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        ...formData,
        status: publishNow ? 'published' : formData.status,
        // Filter out empty references
        references: formData.references.filter(ref => ref.trim())
      };

      if (isEditMode) {
        await updateArticle(slug, submitData);
      } else {
        await createArticle(submitData);
      }

      navigate('/admin');
    } catch (err) {
      console.error('Error saving article:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingArticle) {
    return (
      <>
        <AdminNavbar />
        <div className="admin-container text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading article...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="admin-container">
        <h2 className="mb-4">{isEditMode ? 'Edit Article' : 'Create New Article'}</h2>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="article-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <Form.Group className="mb-3">
              <Form.Label>Title <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                isInvalid={!!validationErrors.title}
                placeholder="e.g., Sodium (Na+)"
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.title}
              </Form.Control.Feedback>
              {formData.slug && (
                <div className="slug-preview">
                  Slug: <code>{formData.slug}</code>
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                isInvalid={!!validationErrors.category}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validationErrors.category}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Summary <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                isInvalid={!!validationErrors.summary}
                placeholder="Brief summary of the article (100-300 characters recommended)"
              />
              <div className="char-count">
                {formData.summary.length} characters
              </div>
              <Form.Control.Feedback type="invalid">
                {validationErrors.summary}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Content <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={12}
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                isInvalid={!!validationErrors.content}
                placeholder="Article content (Markdown supported)"
              />
              <Form.Text muted>
                Supports Markdown formatting: **bold**, *italic*, # Headings, - Lists
              </Form.Text>
              <Form.Control.Feedback type="invalid">
                {validationErrors.content}
              </Form.Control.Feedback>
            </Form.Group>

            <Button
              variant="outline-primary"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>

            {showPreview && (
              <div className="preview-mode">
                <h2>{formData.title || 'Untitled Article'}</h2>
                {formData.category && <Badge bg="primary">{formData.category}</Badge>}
                {formData.summary && <p className="mt-3"><em>{formData.summary}</em></p>}
                <div className="mt-4" style={{ whiteSpace: 'pre-wrap' }}>
                  {formData.content || 'No content yet...'}
                </div>
              </div>
            )}
          </div>

          {/* Reference Ranges */}
          <div className="form-section">
            <h3>Reference Ranges <span className="text-danger">*</span></h3>
            <ReferenceRangeEditor
              value={formData.referenceRanges}
              onChange={(ranges) => handleInputChange('referenceRanges', ranges)}
            />
            {validationErrors.referenceRanges && (
              <div className="text-danger small mt-2">
                {validationErrors.referenceRanges}
              </div>
            )}
          </div>

          {/* Clinical Information */}
          <div className="form-section">
            <h3>Clinical Information</h3>

            <Form.Group className="mb-3">
              <Form.Label>Clinical Significance</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formData.clinicalSignificance}
                onChange={(e) => handleInputChange('clinicalSignificance', e.target.value)}
                placeholder="Describe what abnormal values mean"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Interpretation</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formData.interpretation}
                onChange={(e) => handleInputChange('interpretation', e.target.value)}
                placeholder="How to interpret results"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Related Tests</Form.Label>
              <div className="related-tests-input">
                {formData.relatedTests.map((test, index) => (
                  <span key={index} className="test-chip">
                    {test}
                    <button type="button" onClick={() => removeRelatedTest(test)}>
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <Form.Control
                type="text"
                className="mt-2"
                value={relatedTestInput}
                onChange={(e) => setRelatedTestInput(e.target.value)}
                onKeyDown={handleRelatedTestInputKeyDown}
                placeholder="Type a test name and press Enter"
              />
              <Form.Text muted>
                Press Enter to add a related test
              </Form.Text>
            </Form.Group>
          </div>

          {/* Metadata */}
          <div className="form-section">
            <h3>Metadata</h3>

            <Form.Group className="mb-3">
              <Form.Label>Tags</Form.Label>
              <div className="tag-input-container">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag-chip">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      ✕
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  className="tag-input-field"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Type a tag and press Enter"
                />
              </div>
              {availableTags.length > 0 && (
                <Form.Text muted>
                  Suggestions: {availableTags.slice(0, 5).join(', ')}
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>References</Form.Label>
              <div className="references-list">
                {formData.references.map((ref, index) => (
                  <div key={index} className="reference-item">
                    <Form.Control
                      type="text"
                      value={ref}
                      onChange={(e) => handleReferenceChange(index, e.target.value)}
                      placeholder={`Reference ${index + 1}`}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeReference(index)}
                      disabled={formData.references.length === 1}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline-primary" size="sm" onClick={addReference} className="mt-2">
                + Add Reference
              </Button>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <div className="status-toggle">
                <Form.Check
                  type="switch"
                  id="status-switch"
                  label={formData.status === 'published' ? 'Published' : 'Draft'}
                  checked={formData.status === 'published'}
                  onChange={(e) => handleInputChange('status', e.target.checked ? 'published' : 'draft')}
                />
              </div>
            </Form.Group>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <Button
              variant="secondary"
              onClick={() => navigate('/admin')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => handleSubmit(false)}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSubmit(true)}
              disabled={loading}
            >
              {loading ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminArticleForm;
