import React, { useState } from 'react';
import { Card, Badge, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { getImageUrl } from '../utils/imageUrl';
import TagBadge from './TagBadge';
import BookmarkButton from './BookmarkButton';
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
          <BookmarkButton 
            articleId={article._id}
            articleSlug={article.slug}
            size="sm"
            showLabel={true}
          />
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
          
          <div className="article-tags">
            {article.category && (
              <Badge bg="primary" className="me-2">{article.category}</Badge>
            )}
            {article.tags && article.tags.map((tag, index) => (
              <TagBadge key={index} tag={tag} clickable={true} />
            ))}
          </div>

          {article.summary && (
            <div className="article-summary-box">
              <h5>Summary</h5>
              <p className="mb-0">{article.summary}</p>
            </div>
          )}

          <div className="mb-4">
            <h5>Content</h5>
            <div className="article-content">
              <ReactMarkdown
                components={{
                  img: ({node, ...props}) => (
                    <img
                      {...props}
                      src={getImageUrl(props.src)}
                      alt={props.alt}
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  )
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          </div>

          {article.referenceRanges && article.referenceRanges.length > 0 && (
            <div className="mb-4">
              <h5>Reference Ranges</h5>
              <Table striped bordered hover responsive className="reference-ranges-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Range</th>
                    <th>Unit</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {article.referenceRanges.map((range, index) => (
                    <tr key={index}>
                      <td>{range.parameter}</td>
                      <td>{range.range}</td>
                      <td>{range.unit}</td>
                      <td>{range.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {article.clinicalSignificance && (
            <div className="mb-4">
              <h5>Clinical Significance</h5>
              <div className="clinical-significance">
                <ReactMarkdown
                  components={{
                    img: ({node, ...props}) => (
                      <img
                        {...props}
                        src={getImageUrl(props.src)}
                        alt={props.alt}
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                    )
                  }}
                >
                  {article.clinicalSignificance}
                </ReactMarkdown>
              </div>
            </div>
          )}

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
          // Refresh the article after restore
          window.location.reload();
        }}
      />
    </div>
  );
};

export default ArticleDetail;