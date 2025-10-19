import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, ListGroup } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCollection, deleteCollection, removeBookmarkFromCollection } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './CollectionDetailPage.css';

const CollectionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCollection();
  }, [id]);

  const fetchCollection = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getCollection(id);
      setCollection(response.data);
    } catch (err) {
      console.error('Error fetching collection:', err);
      setError(err.response?.data?.message || 'Failed to load collection');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!window.confirm('Are you sure you want to delete this collection? Bookmarks will not be deleted.')) {
      return;
    }

    try {
      await deleteCollection(id);
      navigate('/collections');
    } catch (err) {
      console.error('Error deleting collection:', err);
      alert('Failed to delete collection');
    }
  };

  const handleRemoveBookmark = async (bookmarkId) => {
    if (!window.confirm('Remove this bookmark from the collection?')) {
      return;
    }

    try {
      await removeBookmarkFromCollection(id, bookmarkId);
      setCollection({
        ...collection,
        bookmarks: collection.bookmarks.filter(b => b._id !== bookmarkId)
      });
    } catch (err) {
      console.error('Error removing bookmark:', err);
      alert('Failed to remove bookmark');
    }
  };

  const isOwner = user && collection && collection.user?._id === user._id;

  if (loading) {
    return <LoadingSpinner message="Loading collection..." />;
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button as={Link} to="/collections" variant="primary">
            Back to Collections
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!collection) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <Alert.Heading>Collection Not Found</Alert.Heading>
          <p>The collection you're looking for doesn't exist or you don't have access to it.</p>
          <Button as={Link} to="/collections" variant="primary">
            Back to Collections
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="collection-detail-page mt-4">
      {/* Collection Header */}
      <Card 
        className="collection-header-card mb-4"
        style={{ borderLeft: `4px solid ${collection.color}` }}
      >
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <Button 
                as={Link} 
                to="/collections" 
                variant="outline-secondary" 
                size="sm"
                className="mb-3"
              >
                ← Back to Collections
              </Button>
              <div className="d-flex align-items-center gap-3">
                <span className="collection-icon" style={{ fontSize: '3rem' }}>
                  {collection.icon}
                </span>
                <div>
                  <h1>{collection.name}</h1>
                  <div className="mt-2">
                    <Badge bg="secondary" className="me-2">
                      {collection.bookmarks?.length || 0} bookmarks
                    </Badge>
                    <Badge bg={collection.isPublic ? 'success' : 'secondary'}>
                      {collection.isPublic ? '🌐 Public' : '🔒 Private'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            {isOwner && (
              <div className="collection-actions">
                <Button
                  as={Link}
                  to="/collections"
                  state={{ editCollection: collection }}
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                >
                  ✏️ Edit
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleDeleteCollection}
                >
                  🗑️ Delete
                </Button>
              </div>
            )}
          </div>

          {collection.description && (
            <Card.Text className="text-muted">
              {collection.description}
            </Card.Text>
          )}

          {collection.user && (
            <div className="mt-3">
              <small className="text-muted">
                Created by {collection.user.username} on{' '}
                {new Date(collection.createdAt).toLocaleDateString()}
              </small>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Bookmarks List */}
      {collection.bookmarks && collection.bookmarks.length === 0 ? (
        <Alert variant="info" className="text-center">
          <Alert.Heading>No Bookmarks Yet</Alert.Heading>
          <p>This collection doesn't have any bookmarks yet.</p>
          {isOwner && (
            <Button as={Link} to="/bookmarks" variant="primary">
              Add Bookmarks
            </Button>
          )}
        </Alert>
      ) : (
        <Row className="g-4">
          {collection.bookmarks?.map((bookmark) => (
            <Col key={bookmark._id} xs={12} md={6} lg={4}>
              <Card className="bookmark-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title as="h5">
                      <Link to={`/article/${bookmark.article?.slug}`}>
                        {bookmark.article?.title}
                      </Link>
                    </Card.Title>
                    {isOwner && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveBookmark(bookmark._id)}
                        title="Remove from collection"
                      >
                        ✕
                      </Button>
                    )}
                  </div>

                  {bookmark.article?.category && (
                    <Badge bg="primary" className="me-2 mb-2">
                      {bookmark.article.category}
                    </Badge>
                  )}

                  {bookmark.isFavorite && (
                    <Badge bg="warning" className="me-2 mb-2">
                      ⭐ Favorite
                    </Badge>
                  )}

                  {bookmark.article?.summary && (
                    <Card.Text className="text-muted small">
                      {bookmark.article.summary.substring(0, 100)}...
                    </Card.Text>
                  )}

                  {bookmark.notes && (
                    <div className="bookmark-notes mt-2">
                      <small className="text-muted d-block mb-1">Notes:</small>
                      <p className="small mb-0">{bookmark.notes}</p>
                    </div>
                  )}

                  <div className="mt-3">
                    <Button
                      as={Link}
                      to={`/article/${bookmark.article?.slug}`}
                      variant="primary"
                      size="sm"
                      className="w-100"
                    >
                      Read Article
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default CollectionDetailPage;
