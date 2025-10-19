import React from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import ArticleCard from './ArticleCard';
import LoadingSpinner from './LoadingSpinner';

const ArticleList = ({ articles, loading, error }) => {
  const { t } = useTranslation();
  
  if (loading) {
    return <LoadingSpinner message={t('article.loadingArticles')} />;
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        <Alert.Heading>{t('article.errorLoadingArticle')}</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <Alert variant="info" className="text-center">
        <p className="mb-0">{t('article.noArticlesFound')}</p>
      </Alert>
    );
  }

  return (
    <Row xs={1} md={2} lg={3} className="g-4">
      {articles.map((article) => (
        <Col key={article._id || article.slug}>
          <ArticleCard article={article} />
        </Col>
      ))}
    </Row>
  );
};

export default ArticleList;
