import React from 'react';
import { Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TagBadge = ({ tag, clickable = true, onRemove, variant = 'secondary', className = '' }) => {
  const { t } = useTranslation();

  if (!clickable && !onRemove) {
    return (
      <Badge 
        bg={variant} 
        className={`me-1 mb-1 ${className}`}
      >
        {tag}
      </Badge>
    );
  }

  if (onRemove) {
    return (
      <Badge 
        bg={variant} 
        className={`me-1 mb-1 ${className}`}
        style={{ cursor: 'pointer' }}
      >
        {tag}
        <span 
          onClick={onRemove}
          className="ms-1"
          style={{ cursor: 'pointer' }}
          title={t('tags.tagRemoved')}
        >
          ×
        </span>
      </Badge>
    );
  }

  return (
    <Badge 
      as={Link}
      to={`/tag/${encodeURIComponent(tag)}`}
      bg={variant} 
      className={`me-1 mb-1 text-decoration-none ${className}`}
      style={{ cursor: 'pointer' }}
      title={t('tags.clickToFilter')}
    >
      {tag}
    </Badge>
  );
};

export default TagBadge;
