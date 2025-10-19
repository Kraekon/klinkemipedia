import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button, Badge, Spinner, Alert, Row, Col, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import AdminNavbar from '../components/AdminNavbar';
import { getDrafts, deleteDraft } from '../services/api';
import './MyDrafts.css';

const MyDrafts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState(null);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDrafts();
      
      if (response.success) {
        setDrafts(response.data || []);
      }
    } catch (err) {
      console.error('Error loading drafts:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDraft = (draft) => {
    navigate(`/admin/editor/draft/${draft._id}`, { state: { draft } });
  };

  const handleDeleteDraft = (draft) => {
    setDraftToDelete(draft);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (draftToDelete) {
        await deleteDraft(draftToDelete._id);
        setDrafts(drafts.filter(d => d._id !== draftToDelete._id));
      }
      setShowDeleteModal(false);
      setDraftToDelete(null);
    } catch (err) {
      console.error('Error deleting draft:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete draft');
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const extractPlainText = (html) => {
    return html.replace(/<[^>]*>/g, '').trim();
  };

  const getPreview = (content) => {
    const plainText = extractPlainText(content);
    const words = plainText.split(/\s+/).slice(0, 30).join(' ');
    return words + (plainText.split(/\s+/).length > 30 ? '...' : '');
  };

  if (!user || !user.isAdmin) {
    return (
      <>
        <AdminNavbar />
        <Container className="mt-5">
          <Alert variant="danger">
            You must be an administrator to access this page.
          </Alert>
        </Container>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <Container className="mt-5 text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading drafts...</p>
        </Container>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <Container className="my-drafts-page mt-4 mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>My Drafts</h2>
          <div>
            <Button 
              variant="primary" 
              onClick={() => navigate('/admin/editor/new')}
              className="me-2"
            >
              + New Article
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/admin')}
            >
              ← Back to Admin
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {drafts.length === 0 ? (
          <Card className="text-center p-5">
            <Card.Body>
              <h4>No drafts yet</h4>
              <p className="text-muted">Start writing your first article!</p>
              <Button variant="primary" onClick={() => navigate('/admin/editor/new')}>
                Create New Article
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {drafts.map(draft => (
              <Col key={draft._id} xs={12} md={6} lg={4} className="mb-4">
                <Card className="draft-card h-100">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="draft-title">
                      {draft.title || 'Untitled Draft'}
                    </Card.Title>
                    
                    <div className="mb-2">
                      {draft.category && (
                        <Badge bg="secondary" className="me-2">
                          {draft.category}
                        </Badge>
                      )}
                      {draft.tags && draft.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} bg="info" className="me-1">
                          {tag}
                        </Badge>
                      ))}
                      {draft.tags && draft.tags.length > 3 && (
                        <Badge bg="light" text="dark">
                          +{draft.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <Card.Text className="draft-preview text-muted flex-grow-1">
                      {getPreview(draft.content || '')}
                    </Card.Text>
                    
                    <div className="draft-meta text-muted small mb-3">
                      <div>Last saved: {formatDate(draft.lastSavedAt || draft.updatedAt)}</div>
                      {draft.metadata?.wordCount && (
                        <div>{draft.metadata.wordCount} words</div>
                      )}
                    </div>
                    
                    <div className="draft-actions d-flex gap-2">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => handleEditDraft(draft)}
                        className="flex-grow-1"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteDraft(draft)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Draft</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the draft "{draftToDelete?.title || 'Untitled'}"? 
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MyDrafts;
