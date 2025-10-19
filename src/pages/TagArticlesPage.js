import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Alert, Spinner, Pagination, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import ArticleCard from '../components/ArticleCard';
import { getArticlesByTag } from '../services/api';

const TagArticlesPage = () => {
  const { t } = useTranslation();
  const { tagname } = useParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    if (tagname) {
      fetchArticles(1);
    }
  }, [tagname]);

  const fetchArticles = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getArticlesByTag(tagname, page, pagination.limit);
      setArticles(response.data || []);
      setPagination(response.pagination || {
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
      });
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchArticles(newPage);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{t('common.loading')}</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/tags')}
            className="mb-3"
          >
            ← {t('common.back')}
          </Button>
          <h1>
            {t('tags.articlesTaggedWith')} "{tagname}"
          </h1>
          <p className="text-muted">
            {t('tags.tagCount', { count: pagination.total })}
          </p>
        </Col>
      </Row>

      {articles.length === 0 ? (
        <Alert variant="info">
          {t('tags.noArticlesWithTag')}
        </Alert>
      ) : (
        <>
          <Row>
            {articles.map((article) => (
              <Col key={article._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <ArticleCard article={article} />
              </Col>
            ))}
          </Row>

          {pagination.pages > 1 && (
            <Row>
              <Col>
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.page === 1}
                    />
                    <Pagination.Prev
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    />
                    
                    {[...Array(pagination.pages)].map((_, index) => {
                      const page = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === pagination.pages ||
                        (page >= pagination.page - 2 && page <= pagination.page + 2)
                      ) {
                        return (
                          <Pagination.Item
                            key={page}
                            active={page === pagination.page}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Pagination.Item>
                        );
                      } else if (
                        page === pagination.page - 3 ||
                        page === pagination.page + 3
                      ) {
                        return <Pagination.Ellipsis key={page} disabled />;
                      }
                      return null;
                    })}

                    <Pagination.Next
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    />
                    <Pagination.Last
                      onClick={() => handlePageChange(pagination.pages)}
                      disabled={pagination.page === pagination.pages}
                    />
                  </Pagination>
                </div>
              </Col>
            </Row>
          )}
        </>
      )}
    </Container>
  );
};

export default TagArticlesPage;
