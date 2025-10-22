import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Spinner, Toast, ToastContainer, Modal, Badge, Card, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import AdminNavbar from '../components/AdminNavbar';
import ImageUploader from '../components/ImageUploader';
import VersionHistory from '../components/VersionHistory';
import TagInput from '../components/TagInput';
import TiptapEditor from '../components/TiptapEditor';
import { getArticleBySlug, createArticle, updateArticle, getAllTags } from '../services/api';
import { getAllCategories, createCategory } from '../services/categoryApi';
import { slugify } from '../utils/slugify';
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
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    description: '',
    color: '#0d6efd'
  });

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
        {/* Header */}
        <div className="mb-4">
          <Row className="align-items-center">
            <Col>
              <h2 className="mb-0 fw-bold">
                {isEditMode ? t('article.editTitle') : t('article.createTitle')}
              </h2>
              {formData.slug && (
                <small className="text-muted">/{formData.slug}</small>
              )}
            </Col>
            <Col xs="auto">
              {isEditMode && (
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => setShowVersionHistory(true)}
                >
                  <i className="bi bi-clock-history me-2"></i>
                  {t('article.versionHistory')}
                </Button>
              )}
            </Col>
          </Row>
        </div>

        {/* Success Toast */}
        <ToastContainer position="top-end" className="p-3" style={{ position: 'fixed', zIndex: 9999 }}>
          <Toast 
            show={showSuccessToast} 
            onClose={() => setShowSuccessToast(false)}
            delay={3000}
            autohide
            bg="success"
          >
            <Toast.Header>
              <i className="bi bi-check-circle-fill text-success me-2"></i>
              <strong className="me-auto">{t('article.success')}</strong>
            </Toast.Header>
            <Toast.Body className="text-white">{successMessage}</Toast.Body>
          </Toast>
        </ToastContainer>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </Alert>
        )}

        {/* Main Form */}
        <Card className="shadow-sm border-0">
          <Card.Body className="p-4">
            
            {/* Basic Information Section */}
            <div className="mb-5">
              <h4 className="mb-4 pb-2 border-bottom">
                <i className="bi bi-info-circle me-2"></i>
                {t('article.basicInfo')}
              </h4>
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  {t('article.title')} <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  size="lg"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  isInvalid={!!validationErrors.title}
                  placeholder={t('article.titlePlaceholder')}
                  className="border-2"
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.title}
                </Form.Control.Feedback>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Form.Label className="fw-semibold mb-0">
                        {t('article.category')} <span className="text-danger">*</span>
                      </Form.Label>
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => setShowCategoryModal(true)}
                        className="p-0 text-decoration-none"
                      >
                        <i className="bi bi-plus-circle me-1"></i>
                        {t('article.addCategory')}
                      </Button>
                    </div>
                    <Form.Select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      isInvalid={!!validationErrors.category}
                      className="border-2"
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
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">{t('article.status')}</Form.Label>
                    <div className="d-flex align-items-center h-100">
                      <Form.Check
                        type="switch"
                        id="status-switch"
                        label={
                          <Badge bg={formData.status === 'published' ? 'success' : 'secondary'} className="fs-6">
                            <i className={`bi ${formData.status === 'published' ? 'bi-check-circle' : 'bi-file-earmark-text'} me-1`}></i>
                            {formData.status === 'published' ? t('article.published') : t('article.draft')}
                          </Badge>
                        }
                        checked={formData.status === 'published'}
                        onChange={(e) => handleInputChange('status', e.target.checked ? 'published' : 'draft')}
                        className="fs-5"
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  {t('article.summary')} <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  isInvalid={!!validationErrors.summary}
                  placeholder={t('article.summaryPlaceholder')}
                  className="border-2"
                />
                <div className="d-flex justify-content-between mt-1">
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.summary}
                  </Form.Control.Feedback>
                  <small className="text-muted">
                    <i className="bi bi-file-text me-1"></i>
                    {formData.summary.length} {t('article.characters')} / {countWords(formData.summary)} {t('article.words')}
                  </small>
                </div>
              </Form.Group>
            </div>

            {/* Content Section */}
            <div className="mb-5">
              <h4 className="mb-4 pb-2 border-bottom">
                <i className="bi bi-file-earmark-richtext me-2"></i>
                {t('article.content')}
              </h4>
              
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  {t('article.content')} <span className="text-danger">*</span>
                </Form.Label>
                <TiptapEditor
                  value={formData.content}
                  onChange={(value) => handleInputChange('content', value || '')}
                  placeholder={t('article.contentPlaceholder')}
                />
                <div className="d-flex justify-content-between mt-2">
                  {validationErrors.content && (
                    <small className="text-danger">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {validationErrors.content}
                    </small>
                  )}
                  <small className="text-muted ms-auto">
                    <i className="bi bi-file-text me-1"></i>
                    {formData.content.length} {t('article.characters')} / {countWords(formData.content)} {t('article.words')}
                  </small>
                </div>
              </Form.Group>

              <Button 
                variant="outline-primary" 
                onClick={() => setShowImageUploadModal(true)}
                size="sm"
              >
                <i className="bi bi-image me-2"></i>
                {t('article.uploadImage')}
              </Button>
            </div>

            {/* Related Tests Section */}
            <div className="mb-5">
              <h4 className="mb-4 pb-2 border-bottom">
                <i className="bi bi-link-45deg me-2"></i>
                {t('article.relatedTests')}
              </h4>

              <Form.Group>
                <Form.Label className="fw-semibold">{t('article.relatedTestsLabel')}</Form.Label>
                {formData.relatedTests.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {formData.relatedTests.map((test, index) => (
                      <Badge 
                        key={index} 
                        bg="light" 
                        text="dark" 
                        className="d-flex align-items-center gap-2 px-3 py-2 border"
                      >
                        <i className="bi bi-clipboard-pulse"></i>
                        {test}
                        <button 
                          type="button" 
                          onClick={() => removeRelatedTest(test)}
                          className="btn-close btn-close-sm"
                          style={{ fontSize: '0.6rem' }}
                          aria-label="Remove"
                        />
                      </Badge>
                    ))}
                  </div>
                )}
                <Form.Control
                  type="text"
                  value={relatedTestInput}
                  onChange={(e) => setRelatedTestInput(e.target.value)}
                  onKeyDown={handleRelatedTestInputKeyDown}
                  placeholder={t('article.relatedTestsPlaceholder')}
                  className="border-2"
                />
                <Form.Text muted>
                  <i className="bi bi-info-circle me-1"></i>
                  {t('article.relatedTestsHelp')}
                </Form.Text>
              </Form.Group>
            </div>

            {/* Tags and Metadata Section */}
            <div className="mb-5">
              <h4 className="mb-4 pb-2 border-bottom">
                <i className="bi bi-tags me-2"></i>
                {t('article.metadata')}
              </h4>
              
              <TagInput
                tags={formData.tags}
                onChange={(newTags) => handleInputChange('tags', newTags)}
                maxTags={10}
                availableTags={availableTags}
              />

              {isEditMode && (
                <Form.Group className="mt-4">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-pencil-square me-2"></i>
                    {t('article.changeDescription')}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('article.changeDescriptionPlaceholder')}
                    value={formData.changeDescription}
                    onChange={(e) => handleInputChange('changeDescription', e.target.value)}
                    maxLength={200}
                    className="border-2"
                  />
                  <Form.Text className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    {t('article.changeDescriptionHelp')}
                  </Form.Text>
                </Form.Group>
              )}
            </div>

            {/* Form Actions */}
            <div className="d-flex gap-3 pt-4 border-top">
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/admin')}
                disabled={loading}
                size="lg"
              >
                <i className="bi bi-x-circle me-2"></i>
                {t('article.cancel')}
              </Button>
              <Button
                variant="outline-primary"
                onClick={() => handleSubmit(false)}
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {t('article.saving')}
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>
                    {t('article.saveAsDraft')}
                  </>
                )}
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                size="lg"
                className="ms-auto"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {t('article.publishing')}
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-check me-2"></i>
                    {t('article.publish')}
                  </>
                )}
              </Button>
            </div>

          </Card.Body>
        </Card>

        {/* Image Upload Modal */}
        <Modal 
          show={showImageUploadModal} 
          onHide={() => setShowImageUploadModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="bi bi-cloud-upload me-2"></i>
              {t('article.uploadImage')}
            </Modal.Title>
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
            <Modal.Title>
              <i className="bi bi-folder-plus me-2"></i>
              {t('article.createCategory')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                <i className="bi bi-tag me-2"></i>
                {t('categories.name')} *
              </Form.Label>
              <Form.Control
                type="text"
                value={newCategoryData.name}
                onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                placeholder={t('categories.namePlaceholder')}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                <i className="bi bi-text-paragraph me-2"></i>
                {t('categories.description')}
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={newCategoryData.description}
                onChange={(e) => setNewCategoryData({ ...newCategoryData, description: e.target.value })}
                placeholder={t('categories.descriptionPlaceholder')}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                <i className="bi bi-palette me-2"></i>
                {t('categories.color')} *
              </Form.Label>
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
              <i className="bi bi-x-circle me-2"></i>
              {t('categories.cancel')}
            </Button>
            <Button 
              variant="primary" 
              onClick={handleCreateCategory}
              disabled={!newCategoryData.name.trim()}
            >
              <i className="bi bi-check-circle me-2"></i>
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