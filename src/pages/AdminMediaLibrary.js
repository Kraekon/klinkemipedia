import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Form, Alert, Spinner, Modal, Toast } from 'react-bootstrap';
import AdminNavbar from '../components/AdminNavbar';
import MediaCard from '../components/MediaCard';
import ImageUploader from '../components/ImageUploader';
import { getAllMedia, deleteMedia, getMediaUsage } from '../services/api';
import './AdminMediaLibrary.css';

const AdminMediaLibrary = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalImages: 0,
    totalSize: 0,
    usedImages: 0,
    unusedImages: 0
  });
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);
  
  // Filters and sorting
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('date');
  const [order, setOrder] = useState('desc');
  
  // Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteUsage, setDeleteUsage] = useState(null);
  const [deletingMedia, setDeletingMedia] = useState(false);
  
  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

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
        filter
      });
      
      if (response.success) {
        setMedia(response.data);
        setStats(response.stats);
        setTotalPages(response.pagination.pages);
      } else {
        setError(response.message || 'Failed to fetch media');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch media');
    } finally {
      setLoading(false);
    }
  }, [page, limit, sort, order, filter]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

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

  const handleDeleteClick = async (mediaItem) => {
    setDeleteTarget(mediaItem);
    
    // Check usage
    try {
      const usage = await getMediaUsage(mediaItem.filename);
      setDeleteUsage(usage);
    } catch (err) {
      console.error('Failed to check usage:', err);
      setDeleteUsage({ usageCount: 0, articles: [] });
    }
    
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    
    setDeletingMedia(true);
    try {
      const force = deleteUsage && deleteUsage.usageCount > 0;
      const response = await deleteMedia(deleteTarget.filename, force);
      
      if (response.success) {
        showSuccessToast('Image deleted successfully');
        setShowDeleteModal(false);
        setDeleteTarget(null);
        setDeleteUsage(null);
        
        // Refresh media list
        fetchMedia();
      } else {
        setError(response.message || 'Failed to delete media');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete media');
    } finally {
      setDeletingMedia(false);
    }
  };

  const handleCopyUrl = (url) => {
    showSuccessToast('URL copied to clipboard!');
  };

  const handleUploadSuccess = () => {
    showSuccessToast('Image uploaded successfully!');
    setShowUploadModal(false);
    fetchMedia();
  };

  const handleUploadError = (errorMsg) => {
    showErrorToast(errorMsg);
  };

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setToastVariant('success');
    setShowToast(true);
  };

  const showErrorToast = (message) => {
    setToastMessage(message);
    setToastVariant('danger');
    setShowToast(true);
  };

  const formatBytes = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2);
  };

  return (
    <>
      <AdminNavbar />
      <Container className="admin-media-library mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Media Library</h1>
          <Button 
            variant="primary" 
            onClick={() => setShowUploadModal(true)}
          >
            📤 Upload Image
          </Button>
        </div>

        {/* Statistics Bar */}
        <div className="stats-bar mb-4">
          <Row>
            <Col xs={6} md={3}>
              <div className="stat-card">
                <div className="stat-value">{stats.totalImages}</div>
                <div className="stat-label">Total Images</div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="stat-card">
                <div className="stat-value">{formatBytes(stats.totalSize)} MB</div>
                <div className="stat-label">Total Size</div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="stat-card">
                <div className="stat-value">{stats.usedImages}</div>
                <div className="stat-label">Used</div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="stat-card">
                <div className="stat-value">{stats.unusedImages}</div>
                <div className="stat-label">Unused</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Filter and Sort Controls */}
        <div className="controls-bar mb-4">
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter</Form.Label>
                <Form.Select value={filter} onChange={handleFilterChange}>
                  <option value="all">All Images</option>
                  <option value="used">Used Images</option>
                  <option value="unused">Unused Images</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Sort By</Form.Label>
                <Form.Select value={`${sort}-${order}`} onChange={handleSortChange}>
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="size-desc">Largest First</option>
                  <option value="size-asc">Smallest First</option>
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
          </div>
        )}

        {/* Empty State */}
        {!loading && media.length === 0 && (
          <div className="empty-state text-center py-5">
            <h3>No images uploaded yet</h3>
            <p className="text-muted">Upload your first image to get started!</p>
            <Button variant="primary" onClick={() => setShowUploadModal(true)}>
              📤 Upload Image
            </Button>
          </div>
        )}

        {/* Media Grid */}
        {!loading && media.length > 0 && (
          <>
            <Row className="media-grid">
              {media.map((item) => (
                <Col key={item._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                  <MediaCard 
                    media={item}
                    onDelete={handleDeleteClick}
                    onCopyUrl={handleCopyUrl}
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
                >
                  Previous
                </Button>
                <span className="mx-3">
                  Page {page} of {totalPages}
                </span>
                <Button 
                  variant="outline-primary" 
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Upload Modal */}
        <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Upload Image</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ImageUploader 
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </Modal.Body>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {deleteUsage && deleteUsage.usageCount > 0 ? (
              <>
                <Alert variant="warning">
                  <strong>Warning:</strong> This image is used in {deleteUsage.usageCount} article(s).
                </Alert>
                <p>The following articles use this image:</p>
                <ul>
                  {deleteUsage.articles.map((article) => (
                    <li key={article.slug}>
                      <a href={`/article/${article.slug}`} target="_blank" rel="noopener noreferrer">
                        {article.title}
                      </a>
                    </li>
                  ))}
                </ul>
                <p>Are you sure you want to delete it anyway?</p>
              </>
            ) : (
              <p>Are you sure you want to delete this image?</p>
            )}
            {deleteTarget && (
              <div className="mt-3">
                <strong>File:</strong> {deleteTarget.originalName}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowDeleteModal(false)}
              disabled={deletingMedia}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteConfirm}
              disabled={deletingMedia}
            >
              {deletingMedia ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Deleting...
                </>
              ) : (
                'Delete Anyway'
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Toast Notification */}
        <div className="toast-container position-fixed bottom-0 end-0 p-3">
          <Toast 
            show={showToast} 
            onClose={() => setShowToast(false)}
            delay={3000}
            autohide
            bg={toastVariant}
          >
            <Toast.Body className="text-white">
              {toastMessage}
            </Toast.Body>
          </Toast>
        </div>
      </Container>
    </>
  );
};

export default AdminMediaLibrary;
