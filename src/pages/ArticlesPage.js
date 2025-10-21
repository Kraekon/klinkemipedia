import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAllArticles } from '../services/api';
import axios from 'axios';

const ArticlesPage = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      const response = await getAllArticles(params);
      console.log('Articles response:', response);
      console.log('Filtering by category:', selectedCategory);
      setArticles(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      const response = await axios.get(`${API_BASE_URL}/categories`);
      console.log('Raw categories response:', response.data);
      
      // Check if response has nested data
      const categoriesData = response.data.data || response.data;
      console.log('Categories data:', categoriesData);
      
      // Also get all articles to see their category format
      const articlesResponse = await getAllArticles({});
      const articlesData = articlesResponse.data || [];
      
      console.log('Sample article categories:', articlesData.map(a => ({
        title: a.title,
        category: a.category,
        categoryType: typeof a.category
      })));
      
      // Extract unique categories from articles
      const uniqueOldCategories = [...new Set(
        articlesData
          .map(article => article.category)
          .filter(cat => cat && typeof cat === 'string')
      )];
      
      console.log('Old string categories from articles:', uniqueOldCategories);
      
      // If no categories in the new system, use old categories
      if (categoriesData.length === 0 && uniqueOldCategories.length > 0) {
        const oldCategoryObjects = uniqueOldCategories.map(cat => ({
          _id: cat,
          name: cat,
          slug: cat,
          isOldFormat: true
        }));
        setCategories(oldCategoryObjects);
      } else {
        setCategories(categoriesData);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      console.error('Error details:', err.response?.data);
    }
  };

  // Helper to determine what value to use for filtering
  const getCategoryFilterValue = (category) => {
    // If it's an old format category, use the name
    if (category.isOldFormat) {
      return category.name;
    }
    // For new categories, try using the slug first, then _id
    return category.slug || category._id;
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">{t('navigation.articles')}</h1>

      {/* Category Badge Filter */}
      <div className="mb-4">
        <h5 className="mb-3">Filtrera efter Kategori</h5>
        <div className="d-flex flex-wrap gap-2">
          <Badge
            bg={selectedCategory === 'All' ? 'primary' : 'secondary'}
            style={{ cursor: 'pointer', fontSize: '0.9rem', padding: '0.5rem 1rem' }}
            onClick={() => setSelectedCategory('All')}
          >
            Alla Kategorier
          </Badge>
          {categories.length > 0 ? (
            categories.map((category) => {
              const filterValue = getCategoryFilterValue(category);
              return (
                <Badge
                  key={category._id}
                  bg={selectedCategory === filterValue ? 'primary' : 'secondary'}
                  style={{ cursor: 'pointer', fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                  onClick={() => {
                    console.log('Selected category:', category);
                    console.log('Filter value:', filterValue);
                    setSelectedCategory(filterValue);
                  }}
                >
                  {category.name}
                </Badge>
              );
            })
          ) : (
            <small className="text-muted">Inga kategorier finns ännu</small>
          )}
        </div>
        {/* Debug info */}
        <small className="text-muted d-block mt-2">
          Kategorier laddade: {categories.length} | Vald: {selectedCategory}
        </small>
        <small className="text-info d-block mt-1">
          Artiklar som visas: {articles.length}
        </small>
      </div>

      <hr className="my-4" />

      {/* Articles List */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Laddar...</span>
          </Spinner>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : articles.length === 0 ? (
        <Alert variant="info">
          Inga artiklar hittades
          {selectedCategory !== 'All' && (
            <span> för kategorin "{selectedCategory}"</span>
          )}
        </Alert>
      ) : (
        <Row>
          {articles.map((article) => (
            <Col md={6} lg={4} key={article._id || article.id} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>
                    <Link to={`/article/${article.slug}`} className="text-decoration-none">
                      {article.title}
                    </Link>
                  </Card.Title>
                  {article.category && (
                    <Card.Subtitle className="mb-2 text-muted">
                      {typeof article.category === 'object' ? article.category.name : article.category}
                    </Card.Subtitle>
                  )}
                  <Card.Text>
                    {article.excerpt || article.content?.substring(0, 150) + '...'}
                  </Card.Text>
                  {article.tags && article.tags.length > 0 && (
                    <div className="mt-2">
                      {article.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="badge bg-secondary me-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Card.Body>
                <Card.Footer className="text-muted small">
                  Senast uppdaterad: {new Date(article.updated_at || article.updatedAt).toLocaleDateString()}
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