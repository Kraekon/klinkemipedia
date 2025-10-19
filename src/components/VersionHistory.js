import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Alert, Spinner, Badge, Pagination } from 'react-bootstrap';
import { getArticleRevisions, getArticleRevision, restoreArticleRevision } from '../services/api';
import './VersionHistory.css';

const VersionHistory = ({ show, onHide, slug, onRestore }) => {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [viewingRevision, setViewingRevision] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  useEffect(() => {
    if (show && slug) {
      fetchRevisions(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, slug]);

  const fetchRevisions = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getArticleRevisions(slug, page, pagination.limit);
      setRevisions(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching revisions:', err);
      setError(err.response?.data?.message || 'Failed to fetch revision history');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRevision = async (versionNumber) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getArticleRevision(slug, versionNumber);
      setSelectedRevision(response.data);
      setViewingRevision(true);
    } catch (err) {
      console.error('Error fetching revision:', err);
      setError(err.response?.data?.message || 'Failed to fetch revision details');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreRevision = async (versionNumber) => {
    if (!window.confirm(`Are you sure you want to restore to version ${versionNumber}? This will create a new revision.`)) {
      return;
    }

    try {
      setRestoring(true);
      setError(null);
      await restoreArticleRevision(slug, versionNumber);
      alert(`Successfully restored to version ${versionNumber}`);
      setViewingRevision(false);
      setSelectedRevision(null);
      if (onRestore) {
        onRestore();
      }
      onHide();
    } catch (err) {
      console.error('Error restoring revision:', err);
      setError(err.response?.data?.message || 'Failed to restore revision');
    } finally {
      setRestoring(false);
    }
  };

  const handleCompareToggle = (versionNumber) => {
    if (selectedForCompare.includes(versionNumber)) {
      setSelectedForCompare(selectedForCompare.filter(v => v !== versionNumber));
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare([...selectedForCompare, versionNumber]);
    }
  };

  const handleCompare = () => {
    if (selectedForCompare.length === 2) {
      // Open compare view - for now just navigate or show message
      const [v1, v2] = selectedForCompare.sort((a, b) => a - b);
      window.open(`/admin/articles/${slug}/compare?v1=${v1}&v2=${v2}`, '_blank');
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (page) => {
    fetchRevisions(page);
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {viewingRevision ? `Revision ${selectedRevision?.versionNumber}` : 'Version History'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && !viewingRevision && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading revisions...</p>
          </div>
        )}

        {!loading && !viewingRevision && revisions.length === 0 && (
          <Alert variant="info">
            No revision history available yet. Revisions will be created when you edit the article.
          </Alert>
        )}

        {!viewingRevision && revisions.length > 0 && (
          <>
            <div className="mb-3">
              <Button
                variant={compareMode ? 'secondary' : 'outline-primary'}
                size="sm"
                onClick={() => {
                  setCompareMode(!compareMode);
                  setSelectedForCompare([]);
                }}
              >
                {compareMode ? 'Cancel Compare' : 'Compare Versions'}
              </Button>
              {compareMode && selectedForCompare.length === 2 && (
                <Button
                  variant="primary"
                  size="sm"
                  className="ms-2"
                  onClick={handleCompare}
                >
                  Compare Selected
                </Button>
              )}
              {compareMode && (
                <span className="ms-2 text-muted">
                  Select 2 versions to compare ({selectedForCompare.length}/2 selected)
                </span>
              )}
            </div>

            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  {compareMode && <th style={{ width: '50px' }}></th>}
                  <th style={{ width: '100px' }}>Version</th>
                  <th>Date</th>
                  <th>Edited By</th>
                  <th>Description</th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {revisions.map((revision) => (
                  <tr key={revision.versionNumber}>
                    {compareMode && (
                      <td className="text-center">
                        <input
                          type="checkbox"
                          checked={selectedForCompare.includes(revision.versionNumber)}
                          onChange={() => handleCompareToggle(revision.versionNumber)}
                          disabled={!selectedForCompare.includes(revision.versionNumber) && selectedForCompare.length >= 2}
                        />
                      </td>
                    )}
                    <td>
                      <Badge bg="primary">v{revision.versionNumber}</Badge>
                    </td>
                    <td>{formatDate(revision.timestamp)}</td>
                    <td>{revision.editedBy}</td>
                    <td>
                      {revision.changeDescription || <em className="text-muted">No description</em>}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewRevision(revision.versionNumber)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {pagination.pages > 1 && (
              <div className="d-flex justify-content-center">
                <Pagination>
                  <Pagination.First
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1}
                  />
                  <Pagination.Prev
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  />
                  
                  {[...Array(pagination.pages)].map((_, idx) => {
                    const page = idx + 1;
                    if (
                      page === 1 ||
                      page === pagination.pages ||
                      (page >= pagination.page - 2 && page <= pagination.page + 2)
                    ) {
                      return (
                        <Pagination.Item
                          key={page}
                          active={page === pagination.page}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Pagination.Item>
                      );
                    } else if (page === pagination.page - 3 || page === pagination.page + 3) {
                      return <Pagination.Ellipsis key={page} />;
                    }
                    return null;
                  })}
                  
                  <Pagination.Next
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  />
                  <Pagination.Last
                    onClick={() => handlePageChange(pagination.pages)}
                    disabled={pagination.page === pagination.pages}
                  />
                </Pagination>
              </div>
            )}
          </>
        )}

        {viewingRevision && selectedRevision && (
          <div className="revision-view">
            <div className="revision-header mb-3">
              <h5>Version {selectedRevision.versionNumber}</h5>
              <p className="text-muted">
                Edited by {selectedRevision.editedBy} on {formatDate(selectedRevision.timestamp)}
              </p>
              {selectedRevision.changeDescription && (
                <Alert variant="info">
                  <strong>Change Description:</strong> {selectedRevision.changeDescription}
                </Alert>
              )}
            </div>

            <div className="revision-content">
              <h6>Title</h6>
              <p>{selectedRevision.title}</p>

              <h6>Category</h6>
              <p>{selectedRevision.category}</p>

              <h6>Summary</h6>
              <p>{selectedRevision.summary}</p>

              <h6>Content</h6>
              <div className="content-preview" style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #dee2e6', padding: '1rem', borderRadius: '4px' }}>
                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                  {selectedRevision.content}
                </pre>
              </div>

              <h6 className="mt-3">Status</h6>
              <Badge bg={selectedRevision.status === 'published' ? 'success' : 'secondary'}>
                {selectedRevision.status}
              </Badge>
            </div>

            <div className="revision-actions mt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setViewingRevision(false);
                  setSelectedRevision(null);
                }}
              >
                Back to List
              </Button>
              <Button
                variant="primary"
                onClick={() => handleRestoreRevision(selectedRevision.versionNumber)}
                disabled={restoring}
                className="ms-2"
              >
                {restoring ? 'Restoring...' : 'Restore This Version'}
              </Button>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default VersionHistory;
