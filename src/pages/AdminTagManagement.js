import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup, Badge, Modal } from 'react-bootstrap';
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
  
  // Merge tags state
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [sourceTags, setSourceTags] = useState([]);
  const [targetTag, setTargetTag] = useState('');
  const [merging, setMerging] = useState(false);
  
  // Delete tag state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTagsWithCounts();
      setTags(response.data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const handleMergeTags = async () => {
    if (sourceTags.length === 0) {
      setError(t('tags.selectSourceTags'));
      return;
    }
    if (!targetTag) {
      setError(t('tags.selectTargetTag'));
      return;
    }

    try {
      setMerging(true);
      setError(null);
      await mergeTags(sourceTags, targetTag);
      setSuccessMessage(t('tags.tagsMerged'));
      setShowMergeModal(false);
      setSourceTags([]);
      setTargetTag('');
      fetchTags();
    } catch (err) {
      console.error('Error merging tags:', err);
      setError(err.response?.data?.message || err.message || 'Failed to merge tags');
    } finally {
      setMerging(false);
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
      setError(err.response?.data?.message || err.message || 'Failed to delete tag');
    } finally {
      setDeleting(false);
    }
  };

  const toggleSourceTag = (tag) => {
    if (sourceTags.includes(tag)) {
      setSourceTags(sourceTags.filter(t => t !== tag));
    } else {
      setSourceTags([...sourceTags, tag]);
    }
  };

  return (
    <>
      <AdminNavbar />
      <Container fluid className="mt-4">
        <Row>
          <Col>
            <h1 className="mb-4">{t('tags.tagManagement')}</h1>

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
              <Col md={8}>
                <Card>
                  <Card.Header>
                    <h5>{t('tags.allTags')}</h5>
                  </Card.Header>
                  <Card.Body>
                    {loading ? (
                      <p>{t('common.loading')}</p>
                    ) : tags.length === 0 ? (
                      <p className="text-muted">{t('tags.noTags')}</p>
                    ) : (
                      <ListGroup>
                        {tags.map((tagObj, index) => (
                          <ListGroup.Item
                            key={index}
                            className="d-flex justify-content-between align-items-center"
                          >
                            <div>
                              <strong>{tagObj.tag}</strong>
                              <Badge bg="primary" className="ms-2">
                                {t('tags.tagCount', { count: tagObj.count })}
                              </Badge>
                            </div>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setTagToDelete(tagObj);
                                setShowDeleteModal(true);
                              }}
                            >
                              {t('common.delete')}
                            </Button>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="mb-3">
                  <Card.Header>
                    <h5>{t('tags.mergeTags')}</h5>
                  </Card.Header>
                  <Card.Body>
                    <p className="text-muted small">
                      {t('tags.sourceTagsHelp')}
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => setShowMergeModal(true)}
                      disabled={tags.length === 0}
                      className="w-100"
                    >
                      {t('tags.mergeTags')}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Merge Tags Modal */}
        <Modal show={showMergeModal} onHide={() => setShowMergeModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{t('tags.mergeTags')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>{t('tags.selectSourceTags')}</Form.Label>
              <p className="text-muted small">{t('tags.sourceTagsHelp')}</p>
              <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {tags.map((tagObj, index) => (
                  <Form.Check
                    key={index}
                    type="checkbox"
                    id={`source-tag-${index}`}
                    label={`${tagObj.tag} (${tagObj.count})`}
                    checked={sourceTags.includes(tagObj.tag)}
                    onChange={() => toggleSourceTag(tagObj.tag)}
                  />
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('tags.selectTargetTag')}</Form.Label>
              <p className="text-muted small">{t('tags.targetTagHelp')}</p>
              <Form.Control
                type="text"
                placeholder={t('tags.enterTag')}
                value={targetTag}
                onChange={(e) => setTargetTag(e.target.value)}
              />
            </Form.Group>

            {sourceTags.length > 0 && targetTag && (
              <Alert variant="info">
                {sourceTags.join(', ')} → {targetTag}
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowMergeModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleMergeTags}
              disabled={merging || sourceTags.length === 0 || !targetTag}
            >
              {merging ? t('common.loading') : t('tags.mergeTags')}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Tag Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{t('tags.confirmDeleteTag')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{t('tags.deleteTagDetail', { tag: tagToDelete?.tag })}</p>
            {tagToDelete && (
              <Alert variant="warning">
                {t('tags.tagCount', { count: tagToDelete.count })}
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteTag}
              disabled={deleting}
            >
              {deleting ? t('common.loading') : t('common.delete')}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default AdminTagManagement;
