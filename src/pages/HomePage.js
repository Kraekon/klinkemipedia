import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ArticleList from '../components/ArticleList';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import PopularArticles from '../components/PopularArticles';
import { getAllArticles } from '../services/api';
import './HomePage.css';

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
    <Container className="home-page">
      
      <SearchBar />

      <Row>
        <Col lg={8}>
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          <ArticleList articles={articles} loading={loading} error={error} />
        </Col>
        
        <Col lg={4}>
          <div className="sidebar-widgets">
            <PopularArticles period="week" limit={10} />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
