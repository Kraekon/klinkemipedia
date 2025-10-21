import React, { useState } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TagBadge from './TagBadge';
import VersionHistory from './VersionHistory';
import './ArticleDetail.css';

const ArticleDetail = ({ article }) => {
  const { t } = useTranslation();
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  
  return (
    <div className="article-detail-container">
      <div className="article-detail-header">
        <Button as={Link} to="/" variant="outline-primary">
          ← {t('common.back')} to {t('navigation.articles')}
        </Button>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => setShowVersionHistory(true)}
          >
            📜 {t('revisions.viewHistory')}
          </Button>
        </div>
      </div>
      
      <Card className="article-detail-card">
        <Card.Body>
          <h1 className="mb-3">{article.title}</h1>
          
          <div className="article-tags mb-4">
            {article.category && (
              <Badge bg="primary" className="me-2">{article.category}</Badge>
            )}
            {article.tags && article.tags.map((tag, index) => (
              <TagBadge key={index} tag={tag} clickable={true} />
            ))}
          </div>

          {article.summary && (
            <div className="article-summary-box mb-4">
              <h5>Summary</h5>
              <p className="mb-0">{article.summary}</p>
            </div>
          )}

          <div className="article-content mb-4">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>

          {article.relatedTests && article.relatedTests.length > 0 && (
            <div className="mb-4">
              <h5>Related Tests</h5>
              <ul>
                {article.relatedTests.map((test, index) => (
                  <li key={index}>{test}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="article-meta">
            <p className="mb-1">Views: {article.views || 0}</p>
            {article.createdAt && (
              <p className="mb-1">
                Created: {new Date(article.createdAt).toLocaleDateString()}
              </p>
            )}
            {article.updatedAt && (
              <p className="mb-0">
                Updated: {new Date(article.updatedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </Card.Body>
      </Card>

      <VersionHistory
        show={showVersionHistory}
        onHide={() => setShowVersionHistory(false)}
        slug={article.slug}
        onRestore={() => {
          window.location.reload();
        }}
      />
    </div>
  );
};

export default ArticleDetail;