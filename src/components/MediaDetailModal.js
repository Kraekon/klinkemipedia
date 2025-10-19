import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Spinner, Alert, Badge, ListGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../utils/imageUrl';
import { getMediaUsageById } from '../services/api';
import { Link } from 'react-router-dom';

const MediaDetailModal = ({ show, onHide, media, onDelete, onCopyUrl }) => {
  const { t } = useTranslation();
  const [usage, setUsage] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsage = useCallback(async () => {
    if (!media) return;
    
    setLoadingUsage(true);
    setError(null);
    try {
      const response = await getMediaUsageById(media._id);
      if (response.success) {
        setUsage(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch usage:', err);
      setError(t('messages.error.loadFailed'));
    } finally {
      setLoadingUsage(false);
    }
  }, [media, t]);

  useEffect(() => {
    if (show && media) {
      fetchUsage();
    }
  }, [show, media, fetchUsage]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      return t('date.today');
    } else if (diffDays === 1) {
      return t('date.yesterday');
    } else if (diffDays < 7) {
      return t('date.daysAgo', { count: diffDays });
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return t('date.weeksAgo', { count: weeks });
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return t('date.monthsAgo', { count: months });
    } else {
      return date.toLocaleDateString('sv-SE');
    }
  };

  const handleCopyUrl = () => {
    if (media) {
      navigator.clipboard.writeText(media.url);
      if (onCopyUrl) {
        onCopyUrl(media.url);
      }
    }
  };

  const handleDelete = () => {
    if (onDelete && media) {
      onDelete(media);
      onHide();
    }
  };

  if (!media) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{t('media.imageDetails')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Image Preview */}
        <div className="text-center mb-4">
          <img 
            src={getImageUrl(media.url)}
            alt={media.originalName}
            style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
          />
        </div>

        {/* Image Information */}
        <div className="mb-4">
          <h5>{t('media.imageDetails')}</h5>
          <table className="table table-sm">
            <tbody>
              <tr>
                <td><strong>{t('media.filename')}:</strong></td>
                <td>{media.filename}</td>
              </tr>
              <tr>
                <td><strong>{t('media.filename')}:</strong></td>
                <td>{media.originalName}</td>
              </tr>
              <tr>
                <td><strong>{t('media.size')}:</strong></td>
                <td>{formatFileSize(media.size)}</td>
              </tr>
              {media.width && media.height && (
                <tr>
                  <td><strong>{t('media.dimensions')}:</strong></td>
                  <td>{media.width} × {media.height} px</td>
                </tr>
              )}
              <tr>
                <td><strong>{t('media.uploaded')}:</strong></td>
                <td>{formatDate(media.uploadedAt)}</td>
              </tr>
              <tr>
                <td><strong>{t('media.uploadedBy')}:</strong></td>
                <td>{media.uploadedBy || 'admin'}</td>
              </tr>
              <tr>
                <td><strong>MIME-typ:</strong></td>
                <td>{media.mimeType}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Usage Information */}
        <div className="mb-3">
          <h5>{t('media.usage')}</h5>
          {loadingUsage ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />
              <span className="ms-2">{t('common.loading')}</span>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : usage ? (
            <>
              <p>
                <strong>{t('media.usageCount', { count: usage.count })}:</strong>{' '}
                <Badge bg={usage.usageCount > 0 ? 'success' : 'secondary'}>
                  {usage.usageCount}
                </Badge>
              </p>
              
              {usage.usageCount > 0 ? (
                <>
                  <p><strong>{t('media.usedIn')}:</strong></p>
                  <ListGroup>
                    {usage.articles.map((article) => (
                      <ListGroup.Item key={article._id}>
                        <Link 
                          to={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {article.title}
                        </Link>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </>
              ) : (
                <Alert variant="info">
                  {t('media.notUsed')}
                </Alert>
              )}
            </>
          ) : null}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="outline-primary" 
          onClick={handleCopyUrl}
        >
          📋 {t('media.copyUrl')}
        </Button>
        <Button 
          variant="outline-danger" 
          onClick={handleDelete}
        >
          🗑️ {t('common.delete')}
        </Button>
        <Button variant="secondary" onClick={onHide}>
          {t('common.close')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MediaDetailModal;
