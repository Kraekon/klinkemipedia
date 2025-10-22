import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Breadcrumb, Spinner, Alert, Badge, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getArticleBySlug } from '../services/api';
import TagBadge from '../components/TagBadge';
import './ArticlePage.css';

const ArticlePage = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getArticleBySlug(slug);
      setArticle(response.data);
    } catch (err) {
      console.error('Error fetching article:', err);
      if (err.response?.status === 404) {
        setError('Article not found');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load article');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{t('common.loading')}</span>
        </Spinner>
        <p className="mt-3">{t('article.loading')}</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error === 'Article not found' ? '404 - Article Not Found' : 'Error Loading Article'}
          </Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex gap-2">
            <button className="btn btn-outline-danger" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left me-2"></i>
              Go Back
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              <i className="bi bi-house-door me-2"></i>
              Go to Home
            </button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <Container className="article-page mt-4">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          <i className="bi bi-house-door me-1"></i>
          {t('navigation.home')}
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/articles' }}>
          {t('navigation.articles')}
        </Breadcrumb.Item>
        {article.category && (
          <Breadcrumb.Item>
            {typeof article.category === 'object' ? article.category.name : article.category}
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item active>{article.title}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Article Header */}
      <div className="article-header mb-4">
        <h1 className="article-title mb-3">{article.title}</h1>
        
        <div className="article-meta mb-3">
          {article.category && (
            <Badge bg="primary" className="me-2">
              <i className="bi bi-folder me-1"></i>
              {typeof article.category === 'object' ? article.category.name : article.category}
            </Badge>
          )}
          {article.status && (
            <Badge bg={article.status === 'published' ? 'success' : 'secondary'} className="me-2">
              <i className={`bi ${article.status === 'published' ? 'bi-check-circle' : 'bi-clock'} me-1`}></i>
              {article.status}
            </Badge>
          )}
          {article.views !== undefined && (
            <span className="text-muted me-3">
              <i className="bi bi-eye me-1"></i>
              {article.views} {t('article.views').toLowerCase()}
            </span>
          )}
          {article.updatedAt && (
            <span className="text-muted">
              <i className="bi bi-calendar-event me-1"></i>
              {t('article.updated')}: {new Date(article.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="article-tags mb-3">
            {article.tags.map((tag, index) => (
              <TagBadge key={index} tag={tag} clickable={true} />
            ))}
          </div>
        )}

        {/* Summary */}
        {article.summary && (
          <Card className="mb-4 border-start border-primary border-4">
            <Card.Body>
              <h5 className="mb-2">
                <i className="bi bi-info-circle me-2"></i>
                {t('article.summary')}
              </h5>
              <p className="mb-0">{article.summary}</p>
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Article Content */}
      <Card className="article-content-card mb-4">
        <Card.Body>
          <div 
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </Card.Body>
      </Card>

      {/* Reference Ranges */}
      {article.referenceRanges && article.referenceRanges.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h4 className="mb-0">
              <i className="bi bi-clipboard-data me-2"></i>
              {t('article.referenceRanges')}
            </h4>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>{t('article.parameter')}</th>
                    <th>{t('article.range')}</th>
                    <th>{t('article.unit')}</th>
                    <th>{t('article.notes')}</th>
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
              </table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Clinical Significance */}
      {article.clinicalSignificance && (
        <Card className="mb-4">
          <Card.Header>
            <h4 className="mb-0">
              <i className="bi bi-heart-pulse me-2"></i>
              {t('article.clinicalSignificance')}
            </h4>
          </Card.Header>
          <Card.Body>
            <div dangerouslySetInnerHTML={{ __html: article.clinicalSignificance }} />
          </Card.Body>
        </Card>
      )}

      {/* Interpretation */}
      {article.interpretation && (
        <Card className="mb-4">
          <Card.Header>
            <h4 className="mb-0">
              <i className="bi bi-lightbulb me-2"></i>
              {t('article.interpretation')}
            </h4>
          </Card.Header>
          <Card.Body>
            <div dangerouslySetInnerHTML={{ __html: article.interpretation }} />
          </Card.Body>
        </Card>
      )}

      {/* Related Tests */}
      {article.relatedTests && article.relatedTests.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h4 className="mb-0">
              <i className="bi bi-link-45deg me-2"></i>
              {t('article.relatedTests')}
            </h4>
          </Card.Header>
          <Card.Body>
            <div className="d-flex flex-wrap gap-2">
              {article.relatedTests.map((test, index) => (
                <Badge key={index} bg="light" text="dark" className="border">
                  <i className="bi bi-clipboard-pulse me-1"></i>
                  {test}
                </Badge>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* References */}
      {article.references && article.references.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h4 className="mb-0">
              <i className="bi bi-journal-text me-2"></i>
              {t('article.references')}
            </h4>
          </Card.Header>
          <Card.Body>
            <ol>
              {article.references.map((ref, index) => (
                <li key={index}>{ref}</li>
              ))}
            </ol>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default ArticlePage;