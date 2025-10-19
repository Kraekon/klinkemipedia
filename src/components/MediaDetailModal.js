import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert, Badge, ListGroup } from 'react-bootstrap';
import { getImageUrl } from '../utils/imageUrl';
import { getMediaUsageById, deleteMedia } from '../services/api';
import { Link } from 'react-router-dom';

const MediaDetailModal = ({ show, onHide, media, onDelete, onCopyUrl }) => {
  const [usage, setUsage] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && media) {
      fetchUsage();
    }
  }, [show, media]);

  const fetchUsage = async () => {
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
      setError('Kunde inte ladda användningsdata');
    } finally {
      setLoadingUsage(false);
    }
  };

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
      return 'Idag';
    } else if (diffDays === 1) {
      return 'Igår';
    } else if (diffDays < 7) {
      return `${diffDays} dagar sedan`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'vecka' : 'veckor'} sedan`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'månad' : 'månader'} sedan`;
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
        <Modal.Title>Bilddetaljer</Modal.Title>
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
          <h5>Bildinformation</h5>
          <table className="table table-sm">
            <tbody>
              <tr>
                <td><strong>Filnamn:</strong></td>
                <td>{media.filename}</td>
              </tr>
              <tr>
                <td><strong>Original namn:</strong></td>
                <td>{media.originalName}</td>
              </tr>
              <tr>
                <td><strong>Storlek:</strong></td>
                <td>{formatFileSize(media.size)}</td>
              </tr>
              {media.width && media.height && (
                <tr>
                  <td><strong>Dimensioner:</strong></td>
                  <td>{media.width} × {media.height} px</td>
                </tr>
              )}
              <tr>
                <td><strong>Uppladdad:</strong></td>
                <td>{formatDate(media.uploadedAt)}</td>
              </tr>
              <tr>
                <td><strong>Uppladdad av:</strong></td>
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
          <h5>Användningsinformation</h5>
          {loadingUsage ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />
              <span className="ms-2">Laddar...</span>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : usage ? (
            <>
              <p>
                <strong>Antal användningar:</strong>{' '}
                <Badge bg={usage.usageCount > 0 ? 'success' : 'secondary'}>
                  {usage.usageCount}
                </Badge>
              </p>
              
              {usage.usageCount > 0 ? (
                <>
                  <p><strong>Används i artiklar:</strong></p>
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
                  Används inte i någon artikel
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
          📋 Kopiera URL
        </Button>
        <Button 
          variant="outline-danger" 
          onClick={handleDelete}
        >
          🗑️ Radera
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Stäng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MediaDetailModal;
