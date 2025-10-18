import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { getRelatedArticles } from '../services/api';

const RelatedArticles = ({ currentArticleSlug }) => {
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getRelatedArticles(currentArticleSlug, 4);
        setRelatedArticles(response.data || []);
      } catch (err) {
        console.error('Error fetching related articles:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load related articles');
      } finally {
        setLoading(false);
      }
    };

    if (currentArticleSlug) {
      fetchRelatedArticles();
    }
  }, [currentArticleSlug]);

  if (loading) {
    return (
      <div className="text-center py-3">
        <Spinner animation="border" size="sm" variant="primary" />
        <p className="mt-2 text-muted">Loading related articles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="warning" className="mb-0">
        Unable to load related articles
      </Alert>
    );
  }

  if (relatedArticles.length === 0) {
    return null; // Don't show the section if no related articles found
  }

  return (
    <div className="related-articles-section mt-5">
      <h3 className="mb-4">Related Articles</h3>
      <Row>
        {relatedArticles.map((article) => (
          <Col key={article._id} md={6} lg={3} className="mb-4">
            <Card className="h-100 related-article-card">
              <Card.Body>
                <Badge bg="primary" className="mb-2">{article.category}</Badge>
                <Card.Title as="h5">
                  <Link 
                    to={`/article/${article.slug}`} 
                    className="text-decoration-none"
                    style={{ fontSize: '1rem' }}
                  >
                    {article.title}
                  </Link>
                </Card.Title>
                {article.summary && (
                  <Card.Text className="text-muted small">
                    {article.summary.substring(0, 100)}
                    {article.summary.length > 100 ? '...' : ''}
                  </Card.Text>
                )}
                <div className="text-muted small">
                  <span className="me-3">👁 {article.views || 0} views</span>
                  {article.tags && article.tags.length > 0 && (
                    <div className="mt-2">
                      {article.tags.slice(0, 2).map((tag, idx) => (
                        <Badge key={idx} bg="secondary" className="me-1" style={{ fontSize: '0.7rem' }}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default RelatedArticles;
