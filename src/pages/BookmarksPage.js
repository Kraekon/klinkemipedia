import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, InputGroup, ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getBookmarks, deleteBookmark, updateBookmark, getCollections } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './BookmarksPage.css';

const BookmarksPage = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterFavorite, setFilterFavorite] = useState('all'); // 'all', 'true', 'false'
  const [filterCollection, setFilterCollection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNotes, setEditingNotes] = useState(null);
  const [notesText, setNotesText] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {};
        if (filterFavorite !== 'all') {
          params.favorite = filterFavorite;
        }
        if (filterCollection) {
          params.collection = filterCollection;
        }

        const [bookmarksResponse, collectionsResponse] = await Promise.all([
          getBookmarks(params),
          getCollections()
        ]);

        setBookmarks(bookmarksResponse.data || []);
        setCollections(collectionsResponse.data || []);
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
        setError(err.response?.data?.message || 'Failed to load bookmarks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, filterFavorite, filterCollection]);

  const handleDeleteBookmark = async (bookmarkId) => {
    if (!window.confirm('Are you sure you want to remove this bookmark?')) {
      return;
    }

    try {
      await deleteBookmark(bookmarkId);
      setBookmarks(bookmarks.filter(b => b._id !== bookmarkId));
    } catch (err) {
      console.error('Error deleting bookmark:', err);
      alert('Failed to delete bookmark');
    }
  };

  const handleToggleFavorite = async (bookmark) => {
    try {
      await updateBookmark(bookmark._id, {
        isFavorite: !bookmark.isFavorite
      });
      setBookmarks(bookmarks.map(b => 
        b._id === bookmark._id ? { ...b, isFavorite: !b.isFavorite } : b
      ));
    } catch (err) {
      console.error('Error updating favorite status:', err);
      alert('Failed to update favorite status');
    }
  };

  const handleSaveNotes = async (bookmarkId) => {
    try {
      await updateBookmark(bookmarkId, { notes: notesText });
      setBookmarks(bookmarks.map(b => 
        b._id === bookmarkId ? { ...b, notes: notesText } : b
      ));
      setEditingNotes(null);
      setNotesText('');
    } catch (err) {
      console.error('Error updating notes:', err);
      alert('Failed to update notes');
    }
  };

  const startEditingNotes = (bookmark) => {
    setEditingNotes(bookmark._id);
    setNotesText(bookmark.notes || '');
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      bookmark.article?.title?.toLowerCase().includes(query) ||
      bookmark.article?.summary?.toLowerCase().includes(query) ||
      bookmark.notes?.toLowerCase().includes(query)
    );
  });

  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <Alert.Heading>Authentication Required</Alert.Heading>
          <p>Please <Link to="/login">log in</Link> to view your bookmarks.</p>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Loading your bookmarks..." />;
  }

  return (
    <Container className="bookmarks-page mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Bookmarks</h1>
        <Button as={Link} to="/collections" variant="success">
          View Collections
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters and Search */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search bookmarks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setSearchQuery('')}
                    >
                      ✕
                    </Button>
                  )}
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Filter by Favorite</Form.Label>
                <Form.Select
                  value={filterFavorite}
                  onChange={(e) => setFilterFavorite(e.target.value)}
                >
                  <option value="all">All Bookmarks</option>
                  <option value="true">Favorites Only</option>
                  <option value="false">Non-Favorites</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Filter by Collection</Form.Label>
                <Form.Select
                  value={filterCollection}
                  onChange={(e) => setFilterCollection(e.target.value)}
                >
                  <option value="">All Collections</option>
                  {collections.map(collection => (
                    <option key={collection._id} value={collection._id}>
                      {collection.icon} {collection.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>View Mode</Form.Label>
                <ButtonGroup className="w-100">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'}
                    onClick={() => setViewMode('grid')}
                    size="sm"
                  >
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
                    onClick={() => setViewMode('list')}
                    size="sm"
                  >
                    List
                  </Button>
                </ButtonGroup>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Bookmarks List */}
      {filteredBookmarks.length === 0 ? (
        <Alert variant="info" className="text-center">
          <Alert.Heading>No Bookmarks Found</Alert.Heading>
          <p>
            {searchQuery || filterFavorite !== 'all' || filterCollection
              ? 'Try adjusting your filters or search criteria.'
              : 'Start bookmarking articles to build your collection!'}
          </p>
          <Button as={Link} to="/" variant="primary">
            Browse Articles
          </Button>
        </Alert>
      ) : (
        <Row className={viewMode === 'grid' ? 'g-4' : 'g-2'}>
          {filteredBookmarks.map((bookmark) => (
            <Col 
              key={bookmark._id} 
              xs={12} 
              md={viewMode === 'grid' ? 6 : 12}
              lg={viewMode === 'grid' ? 4 : 12}
            >
              <Card className={`bookmark-card ${viewMode}`}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title as="h5">
                      <Link to={`/article/${bookmark.article?.slug}`}>
                        {bookmark.article?.title}
                      </Link>
                    </Card.Title>
                    <div className="bookmark-actions">
                      <Button
                        variant={bookmark.isFavorite ? 'warning' : 'outline-secondary'}
                        size="sm"
                        onClick={() => handleToggleFavorite(bookmark)}
                        className="me-2"
                        title={bookmark.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {bookmark.isFavorite ? '⭐' : '☆'}
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteBookmark(bookmark._id)}
                        title="Remove bookmark"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>

                  {bookmark.article?.category && (
                    <Badge bg="primary" className="me-2 mb-2">
                      {bookmark.article.category}
                    </Badge>
                  )}

                  {bookmark.article?.summary && (
                    <Card.Text className="text-muted small">
                      {bookmark.article.summary.substring(0, 150)}...
                    </Card.Text>
                  )}

                  {bookmark.collections && bookmark.collections.length > 0 && (
                    <div className="mb-2">
                      <small className="text-muted">Collections: </small>
                      {bookmark.collections.map((collection) => (
                        <Badge 
                          key={collection._id} 
                          bg="secondary" 
                          className="me-1"
                          style={{ backgroundColor: collection.color }}
                        >
                          {collection.icon} {collection.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="bookmark-notes">
                    {editingNotes === bookmark._id ? (
                      <div>
                        <Form.Group className="mb-2">
                          <Form.Label className="small">Personal Notes</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            placeholder="Add personal notes..."
                            maxLength={1000}
                          />
                          <Form.Text className="text-muted">
                            {notesText.length}/1000 characters
                          </Form.Text>
                        </Form.Group>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleSaveNotes(bookmark._id)}
                          className="me-2"
                        >
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingNotes(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div>
                        {bookmark.notes ? (
                          <div className="notes-display">
                            <small className="text-muted d-block mb-1">Notes:</small>
                            <p className="mb-2">{bookmark.notes}</p>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => startEditingNotes(bookmark)}
                            >
                              Edit Notes
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => startEditingNotes(bookmark)}
                          >
                            Add Notes
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-2">
                    <small className="text-muted">
                      Bookmarked {new Date(bookmark.createdAt).toLocaleDateString()}
                    </small>
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

export default BookmarksPage;
