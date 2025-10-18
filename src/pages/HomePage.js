import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import ArticleList from '../components/ArticleList';
import { getAllArticles } from '../services/api';

const HomePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await getAllArticles();
        setArticles(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <Container>
      <div className="hero-section mb-4">
        <h1 className="display-4">Klinkemipedia</h1>
        <p className="lead mb-0">
          Clinical Chemistry Reference - Your comprehensive guide to clinical chemistry parameters, 
          reference ranges, and laboratory diagnostics.
        </p>
      </div>

      <ArticleList articles={articles} loading={loading} error={error} />
    </Container>
  );
};

export default HomePage;
