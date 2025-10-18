import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Alert, Badge, Button } from 'react-bootstrap';
import ArticleList from '../components/ArticleList';
import LoadingSpinner from '../components/LoadingSpinner';
import { searchArticles } from '../services/api';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  const handleClearSearch = () => {
    navigate('/');
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          {query ? (
            <>
              Search results for: <Badge bg="primary">{query}</Badge>
            </>
          ) : (
            'Search Results'
          )}
        </h2>
        {query && (
          <Button variant="outline-secondary" size="sm" onClick={handleClearSearch}>
            Clear Search
          </Button>
        )}
      </div>

      {!query && !loading && (
        <Alert variant="info" className="text-center">
          <Alert.Heading>No search query provided</Alert.Heading>
          <p className="mb-0">Please enter a search term to find articles.</p>
        </Alert>
      )}

      {loading && query && (
        <LoadingSpinner message={`Searching for "${query}"...`} />
      )}

      {!loading && query && !error && articles.length > 0 && (
        <Alert variant="success" className="mb-3">
          <strong>{articles.length}</strong> {articles.length === 1 ? 'article' : 'articles'} found
        </Alert>
      )}

      {!loading && query && !error && articles.length === 0 && (
        <Alert variant="warning" className="text-center">
          <Alert.Heading>No results found</Alert.Heading>
          <p>We couldn't find any articles matching "{query}".</p>
          <p className="mb-0">Try different keywords or browse all articles on the <Alert.Link href="/">home page</Alert.Link>.</p>
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Search Error</Alert.Heading>
          <p className="mb-0">{error}</p>
        </Alert>
      )}

      {!loading && query && !error && articles.length > 0 && (
        <ArticleList articles={articles} loading={false} error={null} />
      )}
    </Container>
  );
};

export default SearchPage;
