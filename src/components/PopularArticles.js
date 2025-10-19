import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getPopularArticles } from '../services/api';
import './PopularArticles.css';

const PopularArticles = ({ period = 'week', limit = 10 }) => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPopularArticles(period, limit);
        setArticles(response.data || []);
      } catch (err) {
        console.error('Error fetching popular articles:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load popular articles');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularArticles();
  }, [period, limit]);

  if (loading) {
    return (
      <Card className="popular-articles-card">
        <Card.Header>
          <h5 className="mb-0">{t('search.popularArticles')}</h5>
        </Card.Header>
        <Card.Body className="text-center py-4">
          <Spinner animation="border" size="sm" variant="primary" />
          <p className="mt-2 mb-0 text-muted">{t('common.loading')}</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="popular-articles-card">
        <Card.Header>
          <h5 className="mb-0">{t('search.popularArticles')}</h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="warning" className="mb-0">
            {t('messages.error.loadFailed')}
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <Card className="popular-articles-card">
      <Card.Header>
        <h5 className="mb-0">{t('search.popularArticles')}</h5>
        <small className="text-muted">
          {period === 'day' && t('date.today')}
          {period === 'week' && t('date.weeksAgo', { count: 1 })}
          {period === 'month' && t('date.monthsAgo', { count: 1 })}
        </small>
      </Card.Header>
      <ListGroup variant="flush" className="popular-articles-list">
        {articles.map((article, index) => (
          <ListGroup.Item key={article._id} className="popular-article-item">
            <div className="d-flex align-items-start">
              <span className="article-rank">{index + 1}</span>
              <div className="flex-grow-1">
                <Link 
                  to={`/article/${article.slug}`}
                  className="article-title"
                >
                  {article.title}
                </Link>
                <div className="article-meta">
                  <Badge bg="primary" className="me-2">{article.category}</Badge>
                  <span className="views-count">
                    👁 {article.views || 0}
                  </span>
                  {article.commentCount > 0 && (
                    <span className="comments-count ms-2">
                      💬 {article.commentCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
};

export default PopularArticles;
