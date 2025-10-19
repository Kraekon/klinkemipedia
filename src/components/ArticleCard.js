import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TagBadge from './TagBadge';
import BookmarkButton from './BookmarkButton';
import './ArticleCard.css';

const ArticleCard = ({ article }) => {
  const { t } = useTranslation();
  
  return (
    <Card className="article-card h-100">
      <Card.Body>
        <Card.Title>{article.title}</Card.Title>
        {article.category && (
          <div className="mb-2">
            <Badge bg="primary">{article.category}</Badge>
          </div>
        )}
        <Card.Text className="flex-grow-1">
          {article.summary || article.content?.substring(0, 150) + '...'}
        </Card.Text>
        {article.tags && article.tags.length > 0 && (
          <div className="article-card-tags">
            {article.tags.map((tag, index) => (
              <TagBadge key={index} tag={tag} clickable={true} />
            ))}
          </div>
        )}
        <div className="article-card-footer">
          <small className="text-muted">
            {article.views !== undefined && `${article.views} ${t('article.views').toLowerCase()}`}
          </small>
          <div className="d-flex gap-2">
            <BookmarkButton 
              articleId={article._id}
              articleSlug={article.slug}
              size="sm"
              showLabel={false}
            />
            <Button 
              as={Link} 
              to={`/article/${article.slug}`} 
              variant="primary" 
              size="sm"
            >
              {t('article.readMore')}
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ArticleCard;
