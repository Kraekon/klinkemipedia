import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TagBadge from './TagBadge';
import './ArticleCard.css';

const ArticleCard = ({ article }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/article/${article.slug}`);
  };

  const handleTagClick = (e) => {
    // Prevent card click when clicking on a tag
    e.stopPropagation();
  };
  
  return (
    <Card 
      className="article-card h-100" 
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <Card.Body>
        <Card.Title className="d-flex align-items-center justify-content-between">
          <span>{article.title}</span>
          <i className="bi bi-arrow-right-circle text-primary"></i>
        </Card.Title>
        
        {article.category && (
          <div className="mb-2">
            <Badge bg="primary">
              <i className="bi bi-folder me-1"></i>
              {article.category}
            </Badge>
          </div>
        )}
        
        <Card.Text className="flex-grow-1">
          {article.summary || article.content?.substring(0, 150) + '...'}
        </Card.Text>
        
        {article.tags && article.tags.length > 0 && (
          <div className="article-card-tags" onClick={handleTagClick}>
            {article.tags.map((tag, index) => (
              <TagBadge key={index} tag={tag} clickable={true} />
            ))}
          </div>
        )}
        
        <div className="article-card-footer">
          <small className="text-muted">
            {article.views !== undefined && (
              <>
                <i className="bi bi-eye me-1"></i>
                {article.views} {t('article.views').toLowerCase()}
              </>
            )}
          </small>
          <small className="text-primary fw-semibold">
            {t('article.readMore')}
            <i className="bi bi-chevron-right ms-1"></i>
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ArticleCard;