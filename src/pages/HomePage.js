import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import ArticleList from '../components/ArticleList';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import { getAllArticles } from '../services/api';

const HomePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const params = {};
        if (selectedCategory && selectedCategory !== 'All') {
          params.category = selectedCategory;
        }
        const response = await getAllArticles(params);
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
  }, [selectedCategory]);

  return (
    <Container>
      <div className="hero-section mb-4">
        <h1 className="display-4">Klinkemipedia</h1>
        <p className="lead mb-0">
          Clinical Chemistry Reference - Your comprehensive guide to clinical chemistry parameters, 
          reference ranges, and laboratory diagnostics.
        </p>
      </div>

      <SearchBar />

      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <ArticleList articles={articles} loading={loading} error={error} />
    </Container>
  );
};

export default HomePage;
