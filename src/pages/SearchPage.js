import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Alert } from 'react-bootstrap';
import ArticleList from '../components/ArticleList';
import { searchArticles } from '../services/api';

const SearchPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setArticles([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await searchArticles(query);
        setArticles(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error searching articles:', err);
        setError(err.response?.data?.message || err.message || 'Failed to search articles');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <Container>
      <h2 className="mb-4">
        {query ? `Search results for: "${query}"` : 'Search Results'}
      </h2>

      {!query && !loading && (
        <Alert variant="info">
          Please enter a search query
        </Alert>
      )}

      {query && <ArticleList articles={articles} loading={loading} error={error} />}
    </Container>
  );
};

export default SearchPage;
