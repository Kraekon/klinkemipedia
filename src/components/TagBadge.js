import React from 'react';
import { Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './TagBadge.css';

const TagBadge = ({ tag, clickable = true, onRemove, variant = 'primary', className = '' }) => {
  const { t } = useTranslation();

  const badgeClasses = `tag-badge me-1 mb-1 ${onRemove ? 'removable' : ''} ${clickable ? 'clickable' : ''} variant-${variant} ${className}`;

  if (!clickable && !onRemove) {
    return (
      <Badge 
        bg={variant} 
        className={badgeClasses}
      >
        {tag}
      </Badge>
    );
  }

  if (onRemove) {
    return (
      <Badge 
        bg={variant} 
        className={badgeClasses}
      >
        {tag}
        <span 
          onClick={onRemove}
          className="remove-icon"
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
      className={badgeClasses}
      title={t('tags.clickToFilter')}
    >
      {tag}
    </Badge>
  );
};

export default TagBadge;
