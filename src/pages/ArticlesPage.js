import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAllArticles } from '../services/api';
import axios from 'axios';

const ArticlesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [allArticles, setAllArticles] = useState([]); // Store all articles
  const [filteredArticles, setFilteredArticles] = useState([]); // Store filtered articles
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filter articles client-side when category changes
    if (selectedCategory === 'All') {
      setFilteredArticles(allArticles);
    } else {
      const filtered = allArticles.filter(article => {
        const articleCategory = typeof article.category === 'object' 
          ? article.category.name 
          : article.category;
        return articleCategory === selectedCategory;
      });
      setFilteredArticles(filtered);
    }
  }, [selectedCategory, allArticles]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all published articles
      const articlesResponse = await getAllArticles({ status: 'published' });
      const articlesData = articlesResponse.data || [];
      setAllArticles(articlesData);
      setFilteredArticles(articlesData);
      
      // Fetch categories
      await fetchCategories(articlesData);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (articlesData) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      const response = await axios.get(`${API_BASE_URL}/categories`);
      
      // Check if response has nested data
      const categoriesData = response.data.data || response.data;
      
      // Extract unique categories from articles
      const uniqueArticleCategories = [...new Set(
        articlesData
          .map(article => typeof article.category === 'object' ? article.category.name : article.category)
          .filter(cat => cat)
      )];
      
      console.log('Unique categories from articles:', uniqueArticleCategories);
      
      // Use categories from the new system if available, otherwise use article categories
      if (categoriesData.length > 0) {
        setCategories(categoriesData);
      } else if (uniqueArticleCategories.length > 0) {
        // Create category objects from article categories
        const categoryObjects = uniqueArticleCategories.map(cat => ({
          _id: cat,
          name: cat,
          slug: cat,
          isOldFormat: true
        }));
        setCategories(categoryObjects);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // If categories fetch fails, still extract from articles
      const uniqueArticleCategories = [...new Set(
        articlesData
          .map(article => typeof article.category === 'object' ? article.category.name : article.category)
          .filter(cat => cat)
      )];
      
      if (uniqueArticleCategories.length > 0) {
        const categoryObjects = uniqueArticleCategories.map(cat => ({
          _id: cat,
          name: cat,
          slug: cat,
          isOldFormat: true
        }));
        setCategories(categoryObjects);
      }
    }
  };

  const handleCardClick = (slug) => {
    navigate(`/article/${slug}`);
  };

  const handleTagClick = (e, tag) => {
    e.stopPropagation(); // Prevent card click
    navigate(`/tag/${tag}`);
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">{t('navigation.articles')}</h1>

      {/* Category Badge Filter */}
      <div className="mb-4">
        <h5 className="mb-3">
          <i className="bi bi-funnel me-2"></i>
          Filtrera efter Kategori
        </h5>
        <div className="d-flex flex-wrap gap-2">
          <Badge
            bg={selectedCategory === 'All' ? 'primary' : 'secondary'}
            style={{ cursor: 'pointer', fontSize: '0.9rem', padding: '0.5rem 1rem' }}
            onClick={() => setSelectedCategory('All')}
          >
            <i className="bi bi-grid-3x3-gap me-1"></i>
            Alla Kategorier ({allArticles.length})
          </Badge>
          {categories.length > 0 ? (
            categories.map((category) => {
              // Count articles in this category
              const count = allArticles.filter(article => {
                const articleCategory = typeof article.category === 'object' 
                  ? article.category.name 
                  : article.category;
                return articleCategory === category.name;
              }).length;

              return (
                <Badge
                  key={category._id}
                  bg={selectedCategory === category.name ? 'primary' : 'secondary'}
                  style={{ cursor: 'pointer', fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <i className="bi bi-folder me-1"></i>
                  {category.name} ({count})
                </Badge>
              );
            })
          ) : (
            <small className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              Inga kategorier finns ännu
            </small>
          )}
        </div>
      </div>

      <hr className="my-4" />

      {/* Articles List */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Laddar...</span>
          </Spinner>
          <p className="mt-3 text-muted">Laddar artiklar...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      ) : filteredArticles.length === 0 ? (
        <Alert variant="info">
          <i className="bi bi-inbox me-2"></i>
          Inga artiklar hittades
          {selectedCategory !== 'All' && (
            <span> för kategorin <strong>"{selectedCategory}"</strong></span>
          )}
        </Alert>
      ) : (
        <Row>
          {filteredArticles.map((article) => (
            <Col md={6} lg={4} key={article._id || article.id} className="mb-4">
              <Card 
                className="h-100 shadow-sm article-card-hover"
                onClick={() => handleCardClick(article.slug)}
                style={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="flex-grow-1 mb-0">
                      {article.title}
                    </Card.Title>
                    <i className="bi bi-arrow-right-circle text-primary ms-2" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                  
                  {article.category && (
                    <div className="mb-2">
                      <Badge bg="primary" className="mb-2">
                        <i className="bi bi-folder me-1"></i>
                        {typeof article.category === 'object' ? article.category.name : article.category}
                      </Badge>
                    </div>
                  )}
                  
                  <Card.Text className="text-muted">
                    {article.summary || article.excerpt || article.content?.substring(0, 150) + '...'}
                  </Card.Text>
                  
                  {article.tags && article.tags.length > 0 && (
                    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                      {article.tags.slice(0, 3).map((tag, idx) => (
                        <Badge
                          key={idx}
                          bg="light"
                          text="dark"
                          className="me-1 mb-1 border"
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => handleTagClick(e, tag)}
                        >
                          <i className="bi bi-tag me-1"></i>
                          {tag}
                        </Badge>
                      ))}
                      {article.tags.length > 3 && (
                        <Badge bg="light" text="dark" className="border">
                          +{article.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </Card.Body>
                
                <Card.Footer className="bg-transparent border-top">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      <i className="bi bi-calendar-event me-1"></i>
                      {new Date(article.updated_at || article.updatedAt).toLocaleDateString()}
                    </small>
                    {article.views !== undefined && (
                      <small className="text-muted">
                        <i className="bi bi-eye me-1"></i>
                        {article.views}
                      </small>
                    )}
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default ArticlesPage;