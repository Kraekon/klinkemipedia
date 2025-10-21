import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Spinner, Toast, ToastContainer, Modal, Nav, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import AdminNavbar from '../components/AdminNavbar';
import ImageUploader from '../components/ImageUploader';
import VersionHistory from '../components/VersionHistory';
import TagInput from '../components/TagInput';
import TiptapEditor from '../components/TiptapEditor';
import PreviewPanel from '../components/PreviewPanel';
import { getArticleBySlug, createArticle, updateArticle, getAllTags } from '../services/api';
import { getAllCategories, createCategory } from '../services/categoryApi';
import { slugify } from '../utils/slugify';
import { useDebounce } from '../utils/useDebounce';
import './Admin.css';

const AdminArticleForm = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!slug;

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    summary: '',
    content: '',
    relatedTests: [],
    tags: [],
    status: 'draft',
    changeDescription: ''
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingArticle, setFetchingArticle] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [availableTags, setAvailableTags] = useState([]);
  const [relatedTestInput, setRelatedTestInput] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    description: '',
    color: '#0d6efd'
  });
  
  // Debounced values for preview
  const debouncedTitle = useDebounce(formData.title, 300);
  const debouncedSummary = useDebounce(formData.summary, 300);
  const debouncedContent = useDebounce(formData.content, 300);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getAllCategories();
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const fetchAvailableTags = useCallback(async () => {
    try {
      const response = await getAllTags();
      setAvailableTags(response.data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchAvailableTags();
    if (isEditMode) {
      fetchArticle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, isEditMode, fetchCategories, fetchAvailableTags]);

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
        relatedTests: article.relatedTests || [],
        tags: article.tags || [],
        status: article.status || 'draft',
        changeDescription: ''
      });
    } catch (err) {
      console.error('Error fetching article:', err);
      setError(err.response?.data?.message || err.message || t('article.loadFailed'));
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

  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = t('article.validation.titleRequired');
    } else if (formData.title.length > 200) {
      errors.title = t('article.validation.titleTooLong');
    }

    if (!formData.category) {
      errors.category = t('article.validation.categoryRequired');
    }

    if (!formData.summary.trim()) {
      errors.summary = t('article.validation.summaryRequired');
    } else if (formData.summary.length > 500) {
      errors.summary = t('article.validation.summaryTooLong');
    }

    if (!formData.content.trim()) {
      errors.content = t('article.validation.contentRequired');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageUploadSuccess = (imageData) => {
    const htmlImage = `<img src="${imageData.url}" alt="${imageData.alt || ''}" style="max-width: 100%; height: auto;" />`;
    const currentContent = formData.content || '';
    const newContent = currentContent ? `${currentContent}\n${htmlImage}` : htmlImage;
    
    handleInputChange('content', newContent);
    setShowImageUploadModal(false);
    setSuccessMessage(t('article.imageUploadSuccess'));
    setShowSuccessToast(true);
  };

  const handleImageUploadError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleRevisionRestore = () => {
    if (isEditMode) {
      fetchArticle();
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryData.name.trim()) return;
    try {
      await createCategory(newCategoryData);
      await fetchCategories();
      setFormData(prev => ({ ...prev, category: newCategoryData.name }));
      setShowCategoryModal(false);
      setNewCategoryData({ name: '', description: '', color: '#0d6efd' });
      setSuccessMessage(t('categories.createdSuccess'));
      setShowSuccessToast(true);
    } catch (err) {
      setError(err.response?.data?.message || t('categories.saveFailed'));
    }
  };

  const handleSubmit = async (publishNow = false) => {
    if (!validateForm()) {
      setError(t('article.fixValidationErrors'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        ...formData,
        status: publishNow ? 'published' : formData.status
      };

      if (isEditMode) {
        await updateArticle(slug, submitData);
        setSuccessMessage(t('article.updateSuccess'));
      } else {
        await createArticle(submitData);
        setSuccessMessage(t('article.createSuccess'));
      }
      
      setShowSuccessToast(true);
      
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (err) {
      console.error('Error saving article:', err);
      setError(err.response?.data?.message || err.message || t('article.saveFailed'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <p className="mt-3">{t('article.loading')}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="admin-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">{isEditMode ? t('article.editTitle') : t('article.createTitle')}</h2>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary"
              onClick={() => setShowPreview(!showPreview)}
              className="d-none d-lg-block"
            >
              {showPreview ? `👁️ ${t('article.hidePreview')}` : `👁️ ${t('article.showPreview')}`}
            </Button>
            {isEditMode && (
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowVersionHistory(true)}
              >
                📜 {t('article.versionHistory')}
              </Button>
            )}
          </div>
        </div>

        <ToastContainer position="top-end" className="p-3" style={{ position: 'fixed', zIndex: 9999 }}>
          <Toast 
            show={showSuccessToast} 
            onClose={() => setShowSuccessToast(false)}
            delay={3000}
            autohide
            bg="success"
          >
            <Toast.Header>
              <strong className="me-auto">{t('article.success')}</strong>
            </Toast.Header>
            <Toast.Body className="text-white">{successMessage}</Toast.Body>
          </Toast>
        </ToastContainer>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Nav variant="tabs" className="mb-3 d-lg-none">
          <Nav.Item>
            <Nav.Link active={activeTab === 'edit'} onClick={() => setActiveTab('edit')}>
              ✏️ {t('article.edit')}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={activeTab === 'preview'} onClick={() => setActiveTab('preview')}>
              👁️ {t('article.preview')}
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <div className={`editor-layout ${showPreview ? 'with-preview' : 'no-preview'}`}>
          <div className={`editor-panel ${activeTab === 'edit' ? 'd-block' : 'd-none d-lg-block'}`}>
            <div className="article-form">
          
          {/* Basic Information */}
          <div className="form-section">
            <h3>{t('article.basicInfo')}</h3>
            
            <Form.Group className="mb-3">
              <Form.Label>{t('article.title')} <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                isInvalid={!!validationErrors.title}
                placeholder={t('article.titlePlaceholder')}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.title}
              </Form.Control.Feedback>
              {formData.slug && (
                <div className="slug-preview">
                  {t('article.slug')}: <code>{formData.slug}</code>
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="mb-0">{t('article.category')} <span className="text-danger">*</span></Form.Label>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => setShowCategoryModal(true)}
                  className="p-0"
                >
                  + {t('article.addCategory')}
                </Button>
              </div>
              <Form.Select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                isInvalid={!!validationErrors.category}
              >
                <option value="">{t('article.selectCategory')}</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validationErrors.category}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('article.summary')} <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                isInvalid={!!validationErrors.summary}
                placeholder={t('article.summaryPlaceholder')}
              />
              <div className="char-count">
                {formData.summary.length} {t('article.characters')} / {countWords(formData.summary)} {t('article.words')}
              </div>
              <Form.Control.Feedback type="invalid">
                {validationErrors.summary}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('article.content')} <span className="text-danger">*</span></Form.Label>
              <TiptapEditor
                value={formData.content}
                onChange={(value) => handleInputChange('content', value || '')}
                placeholder={t('article.contentPlaceholder')}
              />
              <div className="char-count mt-2">
                {formData.content.length} {t('article.characters')} / {countWords(formData.content)} {t('article.words')}
              </div>
              {validationErrors.content && (
                <div className="text-danger small mt-1">
                  {validationErrors.content}
                </div>
              )}
            </Form.Group>

            <div className="mb-3">
              <Button 
                variant="outline-primary" 
                onClick={() => setShowImageUploadModal(true)}
                size="sm"
              >
                📷 {t('article.uploadImage')}
              </Button>
            </div>
          </div>

          {/* Related Tests */}
          <div className="form-section">
            <h3>{t('article.relatedTests')}</h3>

            <Form.Group className="mb-3">
              <Form.Label>{t('article.relatedTestsLabel')}</Form.Label>
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
                placeholder={t('article.relatedTestsPlaceholder')}
              />
              <Form.Text muted>
                {t('article.relatedTestsHelp')}
              </Form.Text>
            </Form.Group>
          </div>

          {/* Tags and Metadata */}
          <div className="form-section">
            <h3>{t('article.metadata')}</h3>
            
            <TagInput
              tags={formData.tags}
              onChange={(newTags) => handleInputChange('tags', newTags)}
              maxTags={10}
              availableTags={availableTags}
            />

            {isEditMode && (
              <Form.Group className="mb-3">
                <Form.Label>{t('article.changeDescription')}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t('article.changeDescriptionPlaceholder')}
                  value={formData.changeDescription}
                  onChange={(e) => handleInputChange('changeDescription', e.target.value)}
                  maxLength={200}
                />
                <Form.Text className="text-muted">
                  {t('article.changeDescriptionHelp')}
                </Form.Text>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>{t('article.status')}</Form.Label>
              <div className="status-toggle">
                <Form.Check
                  type="switch"
                  id="status-switch"
                  label={formData.status === 'published' ? t('article.published') : t('article.draft')}
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
              {t('article.cancel')}
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => handleSubmit(false)}
              disabled={loading}
            >
              {loading ? t('article.saving') : t('article.saveAsDraft')}
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSubmit(true)}
              disabled={loading}
            >
              {loading ? t('article.publishing') : t('article.publish')}
            </Button>
          </div>
        </div>
          </div>

          {showPreview && (
            <div className="preview-panel-container d-none d-lg-block">
              <PreviewPanel
                title={debouncedTitle}
                summary={debouncedSummary}
                content={debouncedContent}
                category={formData.category}
                tags={formData.tags}
              />
            </div>
          )}

          <div className={`preview-tab-container d-lg-none ${activeTab === 'preview' ? 'd-block' : 'd-none'}`}>
            <PreviewPanel
              title={debouncedTitle}
              summary={debouncedSummary}
              content={debouncedContent}
              category={formData.category}
              tags={formData.tags}
            />
          </div>
        </div>

        {/* Image Upload Modal */}
        <Modal 
          show={showImageUploadModal} 
          onHide={() => setShowImageUploadModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{t('article.uploadImage')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ImageUploader
              onUploadSuccess={handleImageUploadSuccess}
              onUploadError={handleImageUploadError}
            />
          </Modal.Body>
        </Modal>

        {/* Quick Add Category Modal */}
        <Modal 
          show={showCategoryModal} 
          onHide={() => {
            setShowCategoryModal(false);
            setNewCategoryData({ name: '', description: '', color: '#0d6efd' });
          }}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{t('article.createCategory')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>{t('categories.name')} *</Form.Label>
              <Form.Control
                type="text"
                value={newCategoryData.name}
                onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                placeholder={t('categories.namePlaceholder')}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('categories.description')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={newCategoryData.description}
                onChange={(e) => setNewCategoryData({ ...newCategoryData, description: e.target.value })}
                placeholder={t('categories.descriptionPlaceholder')}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('categories.color')} *</Form.Label>
              <div className="d-flex align-items-center gap-3">
                <Form.Control
                  type="color"
                  value={newCategoryData.color}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, color: e.target.value })}
                  style={{ width: '60px', height: '38px', cursor: 'pointer' }}
                />
                <Form.Control
                  type="text"
                  value={newCategoryData.color}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, color: e.target.value })}
                  pattern="^#[0-9A-Fa-f]{6}$"
                  placeholder="#0d6efd"
                  style={{ width: '100px' }}
                />
                <Badge style={{ backgroundColor: newCategoryData.color, color: '#fff', padding: '8px 16px' }}>
                  {t('categories.preview')}
                </Badge>
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowCategoryModal(false);
                setNewCategoryData({ name: '', description: '', color: '#0d6efd' });
              }}
            >
              {t('categories.cancel')}
            </Button>
            <Button 
              variant="primary" 
              onClick={handleCreateCategory}
              disabled={!newCategoryData.name.trim()}
            >
              {t('categories.create')}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Version History Modal */}
        {isEditMode && (
          <VersionHistory
            show={showVersionHistory}
            onHide={() => setShowVersionHistory(false)}
            slug={slug}
            onRestore={handleRevisionRestore}
          />
        )}
      </div>
    </>
  );
};

export default AdminArticleForm;