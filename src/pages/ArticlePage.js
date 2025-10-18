import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Alert } from 'react-bootstrap';
import ArticleDetail from '../components/ArticleDetail';
import LoadingSpinner from '../components/LoadingSpinner';
import { getArticleBySlug } from '../services/api';

const ArticlePage = () => {
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
        <LoadingSpinner message="Loading article..." />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger" className="text-center mt-5">
          <Alert.Heading>{error === 'Article not found' ? '404 - Article Not Found' : 'Error'}</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      {article && <ArticleDetail article={article} />}
    </Container>
  );
};

export default ArticlePage;
