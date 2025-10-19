import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCollections, createCollection, updateCollection, deleteCollection } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './CollectionsPage.css';

// Emoji picker component
const EmojiPicker = ({ selected, onSelect }) => {
  const emojis = ['📚', '🔬', '🩺', '💊', '🧬', '🔍', '📊', '❤️', '🧪', '🏥', '💉', '🩹', '🫀', '🫁', '🧠', '🦷', '👁️', '👂', '🦴', '⚕️', '🔆', '✨', '⭐', '🌟', '💫'];
  
  return (
    <div className="emoji-picker">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          className={`emoji-option ${selected === emoji ? 'selected' : ''}`}
          onClick={() => onSelect(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

// Color picker component
const ColorPicker = ({ selected, onSelect }) => {
  const colors = [
    '#28a745', // Atom Green
    '#007bff', // Blue
    '#6c757d', // Gray
    '#dc3545', // Red
    '#ffc107', // Yellow
    '#17a2b8', // Cyan
    '#6f42c1', // Purple
    '#e83e8c', // Pink
    '#fd7e14', // Orange
    '#20c997', // Teal
    '#ff6b6b', // Light Red
    '#4ecdc4', // Light Cyan
  ];
  
  return (
    <div className="color-picker">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          className={`color-option ${selected === color ? 'selected' : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => onSelect(color)}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
};

const CollectionsPage = () => {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    color: '#28a745',
    icon: '📚'
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchCollections();
  }, [user]);

  const fetchCollections = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getCollections();
      setCollections(response.data || []);
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError(err.response?.data?.message || 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (collection = null) => {
    if (collection) {
      setEditingCollection(collection);
      setFormData({
        name: collection.name,
        description: collection.description || '',
        isPublic: collection.isPublic,
        color: collection.color || '#28a745',
        icon: collection.icon || '📚'
      });
    } else {
      setEditingCollection(null);
      setFormData({
        name: '',
        description: '',
        isPublic: false,
        color: '#28a745',
        icon: '📚'
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCollection(null);
    setFormData({
      name: '',
      description: '',
      isPublic: false,
      color: '#28a745',
      icon: '📚'
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Collection name is required';
    } else if (formData.name.length > 100) {
      errors.name = 'Collection name must be 100 characters or less';
    }
    
    if (formData.description.length > 500) {
      errors.description = 'Description must be 500 characters or less';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (editingCollection) {
        const response = await updateCollection(editingCollection._id, formData);
        setCollections(collections.map(c => 
          c._id === editingCollection._id ? response.data : c
        ));
      } else {
        const response = await createCollection(formData);
        setCollections([...collections, response.data]);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Error saving collection:', err);
      setFormErrors({ 
        submit: err.response?.data?.message || 'Failed to save collection' 
      });
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    if (!window.confirm('Are you sure you want to delete this collection? Bookmarks will not be deleted.')) {
      return;
    }

    try {
      await deleteCollection(collectionId);
      setCollections(collections.filter(c => c._id !== collectionId));
    } catch (err) {
      console.error('Error deleting collection:', err);
      alert('Failed to delete collection');
    }
  };

  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <Alert.Heading>Authentication Required</Alert.Heading>
          <p>Please <Link to="/login">log in</Link> to manage collections.</p>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Loading your collections..." />;
  }

  return (
    <Container className="collections-page mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Collections</h1>
        <div>
          <Button 
            as={Link} 
            to="/bookmarks" 
            variant="outline-success" 
            className="me-2"
          >
            View Bookmarks
          </Button>
          <Button variant="success" onClick={() => handleShowModal()}>
            + Create Collection
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {collections.length === 0 ? (
        <Alert variant="info" className="text-center">
          <Alert.Heading>No Collections Yet</Alert.Heading>
          <p>Create your first collection to organize your bookmarks!</p>
          <Button variant="success" onClick={() => handleShowModal()}>
            Create Collection
          </Button>
        </Alert>
      ) : (
        <Row className="g-4">
          {collections.map((collection) => (
            <Col key={collection._id} xs={12} md={6} lg={4}>
              <Card 
                className="collection-card h-100"
                style={{ borderLeft: `4px solid ${collection.color}` }}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="collection-header">
                      <span className="collection-icon" style={{ fontSize: '2rem' }}>
                        {collection.icon}
                      </span>
                      <Card.Title as="h5" className="mt-2">
                        <Link to={`/collections/${collection._id}`}>
                          {collection.name}
                        </Link>
                      </Card.Title>
                    </div>
                    <div className="collection-actions">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleShowModal(collection)}
                        className="me-1"
                        title="Edit collection"
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteCollection(collection._id)}
                        title="Delete collection"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>

                  {collection.description && (
                    <Card.Text className="text-muted small">
                      {collection.description}
                    </Card.Text>
                  )}

                  <div className="collection-meta">
                    <Badge bg="secondary" className="me-2">
                      {collection.bookmarkCount || collection.bookmarks?.length || 0} bookmarks
                    </Badge>
                    <Badge bg={collection.isPublic ? 'success' : 'secondary'}>
                      {collection.isPublic ? '🌐 Public' : '🔒 Private'}
                    </Badge>
                  </div>

                  <div className="mt-3">
                    <Button
                      as={Link}
                      to={`/collections/${collection._id}`}
                      variant="primary"
                      size="sm"
                      className="w-100"
                    >
                      View Collection
                    </Button>
                  </div>

                  <div className="mt-2">
                    <small className="text-muted">
                      Created {new Date(collection.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCollection ? 'Edit Collection' : 'Create New Collection'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formErrors.submit && (
              <Alert variant="danger">{formErrors.submit}</Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Collection Name *</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isInvalid={!!formErrors.name}
                placeholder="e.g., Liver Function Tests"
                maxLength={100}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.name}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                {formData.name.length}/100 characters
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                isInvalid={!!formErrors.description}
                placeholder="Describe your collection..."
                maxLength={500}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                {formData.description.length}/500 characters
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Icon</Form.Label>
              <EmojiPicker
                selected={formData.icon}
                onSelect={(icon) => setFormData({ ...formData, icon })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Color</Form.Label>
              <ColorPicker
                selected={formData.color}
                onSelect={(color) => setFormData({ ...formData, color })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Check
                type="checkbox"
                id="isPublic"
                label="Make this collection public (others can view it)"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              {editingCollection ? 'Save Changes' : 'Create Collection'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default CollectionsPage;
