import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import AdminNavbar from '../components/AdminNavbar';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryArticles
} from '../services/categoryApi';
import './AdminCategoryManagement.css';

const AdminCategoryManagement = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentCategory, setCurrentCategory] = useState(null);
  
  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [articlesInCategory, setArticlesInCategory] = useState(0);
  const [moveToCategory, setMoveToCategory] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6c757d'
  });

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllCategories();
      setCategories(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(t('categories.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenModal = (mode, category = null) => {
    setModalMode(mode);
    if (mode === 'edit' && category) {
      setCurrentCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color || '#6c757d'
      });
    } else {
      setCurrentCategory(null);
      setFormData({
        name: '',
        description: '',
        color: '#6c757d'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentCategory(null);
    setFormData({
      name: '',
      description: '',
      color: '#6c757d'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (modalMode === 'create') {
        await createCategory(formData);
        setSuccess(t('categories.createdSuccess'));
      } else {
        await updateCategory(currentCategory._id, formData);
        setSuccess(t('categories.updatedSuccess'));
      }
      
      handleCloseModal();
      fetchCategories();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err.response?.data?.message || t('categories.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteModal = async (category) => {
    try {
      setCategoryToDelete(category);
      const response = await getCategoryArticles(category._id);
      setArticlesInCategory(response.data.count || 0);
      setMoveToCategory('');
      setShowDeleteModal(true);
    } catch (err) {
      console.error('Error checking category articles:', err);
      setError(t('categories.checkFailed'));
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      
      if (articlesInCategory > 0 && !moveToCategory) {
        setError(t('categories.selectMoveCategory'));
        setLoading(false);
        return;
      }
      
      await deleteCategory(categoryToDelete._id, moveToCategory || null);
      setSuccess(`${t('categories.category')} "${categoryToDelete.name}" ${t('categories.deletedSuccess')}`);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      fetchCategories();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err.response?.data?.message || t('categories.deleteFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <Container className="admin-category-management py-4">
        <Row className="mb-4">
          <Col>
            <h2>{t('categories.management')}</h2>
          </Col>
          <Col className="text-end">
            <Button variant="primary" onClick={() => handleOpenModal('create')}>
              + {t('categories.add')}
            </Button>
          </Col>
        </Row>

        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

        <Card>
          <Card.Body>
            {loading && categories.length === 0 ? (
              <div className="text-center py-5">{t('categories.loading')}</div>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>{t('categories.color')}</th>
                    <th>{t('categories.name')}</th>
                    <th>{t('categories.description')}</th>
                    <th>{t('categories.articles')}</th>
                    <th>{t('categories.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category._id}>
                      <td>
                        <div
                          className="color-preview"
                          style={{ backgroundColor: category.color }}
                          title={category.color}
                        />
                      </td>
                      <td>
                        <Badge style={{ backgroundColor: category.color, color: '#fff' }}>
                          {category.name}
                        </Badge>
                      </td>
                      <td>{category.description || '-'}</td>
                      <td>{category.articleCount || 0}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleOpenModal('edit', category)}
                        >
                          {t('categories.edit')}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleOpenDeleteModal(category)}
                        >
                          {t('categories.delete')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">
                        {t('categories.noCategories')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Create/Edit Modal */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {modalMode === 'create' ? t('categories.create') : t('categories.edit')}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>{t('categories.name')} *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  maxLength={50}
                  placeholder={t('categories.namePlaceholder')}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>{t('categories.description')}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={200}
                  placeholder={t('categories.descriptionPlaceholder')}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>{t('categories.color')} *</Form.Label>
                <div className="d-flex align-items-center gap-3">
                  <Form.Control
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    style={{ width: '80px', height: '40px', cursor: 'pointer' }}
                  />
                  <Form.Control
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    pattern="^#[0-9A-Fa-f]{6}$"
                    placeholder="#6c757d"
                    style={{ width: '120px' }}
                  />
                  <Badge style={{ backgroundColor: formData.color, color: '#fff', padding: '10px 20px' }}>
                    {t('categories.preview')}
                  </Badge>
                </div>
                <Form.Text className="text-muted">
                  {t('categories.colorHelper')}
                </Form.Text>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                {t('categories.cancel')}
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {modalMode === 'create' ? t('categories.create') : t('categories.saveChanges')}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{t('categories.deleteTitle')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="warning">
              <strong>⚠️ {t('categories.deleteWarning')}</strong>
              <p className="mb-0">
                "{categoryToDelete?.name}".
              </p>
            </Alert>

            {articlesInCategory > 0 ? (
              <>
                <p>
                  {t('categories.usedBy')} <strong>{articlesInCategory}</strong> {t('categories.articlesPlural')}.
                </p>
                <Form.Group>
                  <Form.Label>{t('categories.moveTo')}</Form.Label>
                  <Form.Select
                    value={moveToCategory}
                    onChange={(e) => setMoveToCategory(e.target.value)}
                    required
                  >
                    <option value="">{t('categories.selectCategory')}</option>
                    {categories
                      .filter((cat) => cat._id !== categoryToDelete?._id)
                      .map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </>
            ) : (
              <p>{t('categories.notUsed')}</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              {t('categories.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={loading || (articlesInCategory > 0 && !moveToCategory)}
            >
              {t('categories.deleteButton')}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default AdminCategoryManagement;