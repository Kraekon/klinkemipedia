import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Row, Col, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import MediaPickerCard from './MediaPickerCard';
import { getAllMedia } from '../services/api';
import './MediaLibraryModal.css';

const MediaLibraryModal = ({ show, onHide, onSelectImage, multiSelect = false }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);
  
  // Filters and sorting
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('date');
  const [order, setOrder] = useState('desc');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch media library
  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAllMedia({
        page,
        limit,
        sort,
        order,
        filter,
        search
      });
      
      if (response.success) {
        setMedia(response.data);
        setTotalPages(response.pagination.pages);
      } else {
        setError(response.message || 'Failed to fetch media');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch media');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filter, sort, order, search]);

  useEffect(() => {
    if (show) {
      fetchMedia();
    }
  }, [show, fetchMedia]);

  // Reset state when modal closes
  useEffect(() => {
    if (!show) {
      setPage(1);
      setSearch('');
      setSearchInput('');
      setFilter('all');
      setSort('date');
      setOrder('desc');
    }
  }, [show]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    const [newSort, newOrder] = value.split('-');
    setSort(newSort);
    setOrder(newOrder);
    setPage(1);
  };

  const handleSelectImage = (imageData) => {
    onSelectImage(imageData);
    if (!multiSelect) {
      onHide();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onHide();
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="xl" 
      centered
      onKeyDown={handleKeyDown}
      className="media-library-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Browse Media Library</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Search and Filter Controls */}
        <div className="media-library-controls mb-4">
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-bold">Search</Form.Label>
                <InputGroup>
                  <InputGroup.Text>🔍</InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search by filename..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  {searchInput && (
                    <Button 
                      variant="outline-secondary"
                      onClick={() => setSearchInput('')}
                    >
                      ✕
                    </Button>
                  )}
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small fw-bold">Filter</Form.Label>
                <Form.Select value={filter} onChange={handleFilterChange}>
                  <option value="all">All Images</option>
                  <option value="used">Used Images</option>
                  <option value="unused">Unused Images</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small fw-bold">Sort By</Form.Label>
                <Form.Select value={`${sort}-${order}`} onChange={handleSortChange}>
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="name-asc">A-Z</option>
                  <option value="name-desc">Z-A</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2 text-muted">Loading images...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && media.length === 0 && (
          <div className="empty-state text-center py-5">
            <div className="empty-state-icon">📷</div>
            <h5>No images found</h5>
            <p className="text-muted">
              {search ? 'Try adjusting your search or filters' : 'No images available in the media library'}
            </p>
          </div>
        )}

        {/* Media Grid */}
        {!loading && media.length > 0 && (
          <>
            <Row className="media-picker-grid g-3">
              {media.map((item) => (
                <Col key={item._id} xs={6} sm={4} md={3} lg={2}>
                  <MediaPickerCard 
                    media={item}
                    onSelect={handleSelectImage}
                  />
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-controls d-flex justify-content-center align-items-center mt-4">
                <Button 
                  variant="outline-primary" 
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  size="sm"
                >
                  Previous
                </Button>
                <span className="mx-3 small">
                  Page {page} of {totalPages}
                </span>
                <Button 
                  variant="outline-primary" 
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MediaLibraryModal;
