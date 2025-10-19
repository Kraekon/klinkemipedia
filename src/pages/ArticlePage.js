import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Alert, Breadcrumb, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import ArticleDetail from '../components/ArticleDetail';
import LoadingSpinner from '../components/LoadingSpinner';
import RelatedArticles from '../components/RelatedArticles';
import { getArticleBySlug } from '../services/api';

const ArticlePage = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await getArticleBySlug(slug);
        setArticle(response.data);
        setError(null);
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

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <Container>
        <LoadingSpinner message={t('article.loadingArticles')} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Breadcrumb className="mt-3">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
            {t('navigation.home')}
          </Breadcrumb.Item>
          <Breadcrumb.Item active>{t('navigation.articles')}</Breadcrumb.Item>
        </Breadcrumb>
        
        <Alert variant="danger" className="text-center mt-5">
          <Alert.Heading>{error === 'Article not found' ? t('article.articleNotFound') : t('article.errorLoadingArticle')}</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex gap-2 justify-content-center">
            <Button as={Link} to="/" variant="primary">
              {t('page.notFound.goHome')}
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      {article && (
        <>
          <Breadcrumb className="mt-3">
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
              {t('navigation.home')}
            </Breadcrumb.Item>
            {article.category && (
              <Breadcrumb.Item active>{article.category}</Breadcrumb.Item>
            )}
            <Breadcrumb.Item active>{article.title}</Breadcrumb.Item>
          </Breadcrumb>
          
          <ArticleDetail article={article} />
          
          {/* Related Articles Section */}
          <RelatedArticles currentArticleSlug={slug} />
        </>
      )}
    </Container>
  );
};

export default ArticlePage;
