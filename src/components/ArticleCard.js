import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ArticleCard = ({ article }) => {
  const { t } = useTranslation();
  
  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column">
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
          <div className="mb-3">
            {article.tags.map((tag, index) => (
              <Badge key={index} bg="secondary" className="me-1">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            {article.views !== undefined && `${article.views} ${t('article.views').toLowerCase()}`}
          </small>
          <Button 
            as={Link} 
            to={`/article/${article.slug}`} 
            variant="primary" 
            size="sm"
          >
            {t('article.readMore')}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ArticleCard;
