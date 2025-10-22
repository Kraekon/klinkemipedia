import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Alert, Spinner, Badge, Pagination } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getArticleRevisions, getArticleRevision, restoreArticleRevision } from '../services/api';
import './VersionHistory.css';

const VersionHistory = ({ show, onHide, slug, onRestore }) => {
  const { t } = useTranslation();
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
    if (!window.confirm(t('revisions.confirmRestore', { version: versionNumber }) + ' ' + t('messages.confirmProceedAction'))) {
      return;
    }

    try {
      setRestoring(true);
      setError(null);
      await restoreArticleRevision(slug, versionNumber);
      alert(t('revisions.restored', { version: versionNumber }));
      setViewingRevision(false);
      setSelectedRevision(null);
      if (onRestore) {
        onRestore();
      }
      onHide();
    } catch (err) {
      console.error('Error restoring revision:', err);
      setError(err.response?.data?.message || t('messages.errorSaveFailed'));
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
          {viewingRevision ? t('revisions.versionNumber', { number: selectedRevision?.versionNumber }) : t('revisions.title')}
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
            <p className="mt-3">{t('revisions.loadingRevisions')}</p>
          </div>
        )}

        {!loading && !viewingRevision && revisions.length === 0 && (
          <Alert variant="info">
            {t('revisions.noRevisionsAvailable')}
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
                {compareMode ? t('revisions.cancelCompare') : t('revisions.compareVersions')}
              </Button>
              {compareMode && selectedForCompare.length === 2 && (
                <Button
                  variant="primary"
                  size="sm"
                  className="ms-2"
                  onClick={handleCompare}
                >
                  {t('revisions.compareSelected')}
                </Button>
              )}
              {compareMode && (
                <span className="ms-2 text-muted">
                  {t('revisions.selectToCompare', { count: selectedForCompare.length })}
                </span>
              )}
            </div>

            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  {compareMode && <th style={{ width: '50px' }}></th>}
                  <th style={{ width: '100px' }}>{t('revisions.version')}</th>
                  <th>{t('date.date')}</th>
                  <th>{t('revisions.editedBy')}</th>
                  <th>{t('revisions.changeDescription')}</th>
                  <th style={{ width: '150px' }}>{t('common.actions')}</th>
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
                      {revision.changeDescription || <em className="text-muted">{t('revisions.noDescription')}</em>}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewRevision(revision.versionNumber)}
                      >
                        {t('common.view')}
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
              <h5>{t('revisions.versionNumber', { number: selectedRevision.versionNumber })}</h5>
              <p className="text-muted">
                {t('revisions.editedBy')} {selectedRevision.editedBy} {t('common.at')} {formatDate(selectedRevision.timestamp)}
              </p>
              {selectedRevision.changeDescription && (
                <Alert variant="info">
                  <strong>{t('revisions.changeDescription')}:</strong> {selectedRevision.changeDescription}
                </Alert>
              )}
            </div>

            <div className="revision-content">
              <h6>{t('article.title')}</h6>
              <p>{selectedRevision.title}</p>

              <h6>{t('revisions.category')}</h6>
              <p>{selectedRevision.category}</p>

              <h6>{t('revisions.summary')}</h6>
              <p>{selectedRevision.summary}</p>

              <h6>{t('article.content')}</h6>
              <div className="content-preview" style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #dee2e6', padding: '1rem', borderRadius: '4px' }}>
                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                  {selectedRevision.content}
                </pre>
              </div>

              <h6 className="mt-3">{t('article.status')}</h6>
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
                {t('revisions.backToList')}
              </Button>
              <Button
                variant="primary"
                onClick={() => handleRestoreRevision(selectedRevision.versionNumber)}
                disabled={restoring}
                className="ms-2"
              >
                {restoring ? t('revisions.restoring') : t('revisions.restoreThisVersion')}
              </Button>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default VersionHistory;
