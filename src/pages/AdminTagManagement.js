import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table, Modal, Badge, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import AdminNavbar from '../components/AdminNavbar';
import { getTagsWithCounts, mergeTags, deleteTag } from '../services/api';
import './Admin.css';

const AdminTagManagement = () => {
  const { t } = useTranslation();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Edit tag state (using merge functionality to rename)
  const [showEditModal, setShowEditModal] = useState(false);
  const [tagToEdit, setTagToEdit] = useState(null);
  const [editedTagName, setEditedTagName] = useState('');
  const [editing, setEditing] = useState(false);
  
  // Delete tag state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Search/filter state
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTagsWithCounts();
      setTags(response.data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError(err.response?.data?.message || err.message || t('tags.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleEditTag = async () => {
    if (!editedTagName.trim()) {
      setError(t('tags.tagNameRequired'));
      return;
    }

    if (!tagToEdit) return;

    // Check if new name already exists (case insensitive)
    const newNameLower = editedTagName.trim().toLowerCase();
    const oldNameLower = tagToEdit.tag.toLowerCase();
    
    if (newNameLower !== oldNameLower) {
      const tagExists = tags.some(tag => tag.tag.toLowerCase() === newNameLower);
      if (tagExists) {
        setError(t('tags.tagExists'));
        return;
      }
    }

    try {
      setEditing(true);
      setError(null);
      
      // Use merge functionality to rename the tag
      await mergeTags([tagToEdit.tag], editedTagName.trim());
      
      setSuccessMessage(t('tags.tagUpdated'));
      setShowEditModal(false);
      setTagToEdit(null);
      setEditedTagName('');
      fetchTags();
    } catch (err) {
      console.error('Error editing tag:', err);
      setError(err.response?.data?.message || err.message || t('tags.saveFailed'));
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!tagToDelete) return;

    try {
      setDeleting(true);
      setError(null);
      await deleteTag(tagToDelete.tag);
      setSuccessMessage(t('tags.tagDeleted'));
      setShowDeleteModal(false);
      setTagToDelete(null);
      fetchTags();
    } catch (err) {
      console.error('Error deleting tag:', err);
      setError(err.response?.data?.message || err.message || t('tags.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = (tagObj) => {
    setTagToEdit(tagObj);
    setEditedTagName(tagObj.tag);
    setShowEditModal(true);
  };

  const openDeleteModal = (tagObj) => {
    setTagToDelete(tagObj);
    setShowDeleteModal(true);
  };

  // Filter tags based on search term
  const filteredTags = tags.filter(tag => 
    tag.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <AdminNavbar />
      <Container className="mt-4">
        <Row className="mb-4">
          <Col>
            <h1>{t('tags.tagManagement')}</h1>
            <p className="text-muted">
              {t('tags.allTags')}: {tags.length}
            </p>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
            {successMessage}
          </Alert>
        )}

        <Row>
          <Col>
            <Card>
              <Card.Header className="bg-primary text-white">
                <Row className="align-items-center">
                  <Col md={6}>
                    <h5 className="mb-0">
                      {t('tags.allTags')} ({filteredTags.length})
                    </h5>
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      type="text"
                      placeholder={t('tags.searchTags')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white"
                    />
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body className="p-0">
                {loading ? (
                  <div className="text-center p-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">{t('common.loading')}</p>
                  </div>
                ) : filteredTags.length === 0 ? (
                  <div className="text-center p-5">
                    <p className="text-muted">
                      {searchTerm ? t('tags.noTagsFound') : t('tags.noTags')}
                    </p>
                  </div>
                ) : (
                  <Table responsive hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '5%' }}>#</th>
                        <th style={{ width: '50%' }}>{t('tags.tagName')}</th>
                        <th style={{ width: '20%' }} className="text-center">
                          {t('tags.usageCount')}
                        </th>
                        <th style={{ width: '25%' }} className="text-end">
                          {t('tags.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTags.map((tagObj, index) => (
                        <tr key={index}>
                          <td className="text-muted">{index + 1}</td>
                          <td>
                            <strong>{tagObj.tag}</strong>
                          </td>
                          <td className="text-center">
                            <Badge bg="primary" pill>
                              {tagObj.count}
                            </Badge>
                          </td>
                          <td className="text-end">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => openEditModal(tagObj)}
                            >
                              {t('tags.edit')}
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => openDeleteModal(tagObj)}
                            >
                              {t('tags.delete')}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Edit Tag Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>{t('tags.editTag')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="info">
              <small>
                <strong>{t('tags.currentTag')}</strong> {tagToEdit?.tag}
              </small>
            </Alert>
            <Form.Group>
              <Form.Label>{t('tags.newTagName')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('tags.tagNamePlaceholder')}
                value={editedTagName}
                onChange={(e) => setEditedTagName(e.target.value)}
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleEditTag();
                  }
                }}
              />
              <Form.Text className="text-muted">
                {t('tags.renameTagInfo', { count: tagToEdit?.count || 0 })}
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              {t('tags.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleEditTag}
              disabled={editing || !editedTagName.trim() || editedTagName.trim() === tagToEdit?.tag}
            >
              {editing ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {t('tags.saving')}
                </>
              ) : (
                t('tags.save')
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Tag Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton className="bg-danger text-white">
            <Modal.Title>{t('tags.confirmDeleteTag')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="warning">
              <strong>{t('tags.deleteTagWarning')}</strong>
            </Alert>
            <p>{t('tags.deleteTagDetail', { tag: tagToDelete?.tag })}</p>
            {tagToDelete && tagToDelete.count > 0 && (
              <Alert variant="info">
                {t('tags.deleteTagUsage', { count: tagToDelete.count })}
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              {t('tags.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteTag}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {t('tags.deleting')}
                </>
              ) : (
                t('tags.delete')
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default AdminTagManagement;