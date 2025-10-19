import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import './MediaPickerCard.css';

const MediaPickerCard = ({ media, onSelect }) => {
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const truncateFilename = (filename, maxLength = 25) => {
    if (filename.length <= maxLength) return filename;
    const ext = filename.substring(filename.lastIndexOf('.'));
    const name = filename.substring(0, filename.lastIndexOf('.'));
    const truncatedName = name.substring(0, maxLength - ext.length - 3);
    return truncatedName + '...' + ext;
  };

  const handleSelect = () => {
    onSelect({
      url: media.url,
      filename: media.filename,
      originalName: media.originalName,
      width: media.width,
      height: media.height
    });
  };

  return (
    <Card className="media-picker-card h-100">
      <div className="media-picker-thumbnail">
        <img 
          src={media.url} 
          alt={media.originalName}
          loading="lazy"
        />
      </div>
      <Card.Body className="d-flex flex-column p-2">
        <div className="flex-grow-1">
          <h6 className="media-picker-filename mb-1" title={media.originalName}>
            {truncateFilename(media.originalName)}
          </h6>
          <div className="media-picker-meta">
            {media.width && media.height && (
              <Badge bg="secondary" className="me-1 mb-1">
                {media.width} × {media.height}
              </Badge>
            )}
            <Badge bg="light" text="dark" className="mb-1">
              {formatFileSize(media.size)}
            </Badge>
          </div>
          {media.usageCount > 0 && (
            <Badge bg="success" className="mt-1">
              Used in {media.usageCount} article{media.usageCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={handleSelect}
          className="w-100 mt-2"
        >
          Select
        </Button>
      </Card.Body>
    </Card>
  );
};

export default MediaPickerCard;
