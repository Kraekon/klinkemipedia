import React, { useState } from 'react';
import { Card, Button, Badge, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../utils/imageUrl';
import './MediaCard.css';

const MediaCard = ({ media, onDelete, onCopyUrl }) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(media);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(media.url);
    if (onCopyUrl) {
      onCopyUrl(media.url);
    }
  };

  const truncateFilename = (filename, maxLength = 30) => {
    if (filename.length <= maxLength) return filename;
    const ext = filename.substring(filename.lastIndexOf('.'));
    const name = filename.substring(0, filename.lastIndexOf('.'));
    const truncatedName = name.substring(0, maxLength - ext.length - 3);
    return truncatedName + '...' + ext;
  };

  return (
    <Card className="media-card h-100">
      <div className="media-card-thumbnail">
        <img 
          src={getImageUrl(media.url)}
          alt={media.originalName}
          loading="lazy"
        />
      </div>
      <Card.Body className="d-flex flex-column">
        <div className="media-card-info flex-grow-1">
          <h6 className="media-card-filename" title={media.filename}>
            {truncateFilename(media.originalName)}
          </h6>
          <div className="media-card-meta">
            <small className="text-muted d-block">
              {formatFileSize(media.size)}
            </small>
            {media.width && media.height && (
              <small className="text-muted d-block">
                {media.width} × {media.height}
              </small>
            )}
            <small className="text-muted d-block">
              {formatDate(media.uploadedAt)}
            </small>
          </div>
          <div className="mt-2">
            {media.usageCount > 0 ? (
              <Badge bg="success">
                {t('media.usageCount', { count: media.usageCount })}
              </Badge>
            ) : (
              <Badge bg="secondary">{t('media.unused')}</Badge>
            )}
          </div>
        </div>
        <div className="media-card-actions mt-3">
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={handleCopyUrl}
            className="w-100 mb-2"
          >
            📋 {t('media.copyUrl')}
          </Button>
          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-100"
          >
            {isDeleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {t('common.loading')}
              </>
            ) : (
              `🗑️ ${t('common.delete')}`
            )}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MediaCard;