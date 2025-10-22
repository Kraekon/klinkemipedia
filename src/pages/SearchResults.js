import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Form, Button, Alert, Pagination } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../components/LoadingSpinner';
import { search, getAllTags } from '../services/api';
import './SearchResults.css';

export default function SearchResults() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const q = searchParams.get('q') || '';
  const tags = searchParams.get('tags') || '';
  const author = searchParams.get('author') || '';
  const sort = searchParams.get('sort') || 'relevance';
  const page = parseInt(searchParams.get('page')) || 1;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [allTags, setAllTags] = useState([]);
  
  // Filter states
  const [selectedTags, setSelectedTags] = useState(tags ? tags.split(',') : []);
  const [selectedAuthor, setSelectedAuthor] = useState(author);
  const [selectedSort, setSelectedSort] = useState(sort);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all tags for filter
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await getAllTags();
        setAllTags(response.data || []);
      } catch (err) {
        console.error('Error fetching tags:', err);
      }
    };
    fetchTags();
  }, []);

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      if (!q.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const params = {
          q: q.trim(),
          page,
          limit: 20,
          sort: selectedSort
        };
        
        if (selectedTags.length > 0) {
          params.tags = selectedTags.join(',');
        }
        
        if (selectedAuthor) {
          params.author = selectedAuthor;
        }

        const response = await search(params);
        setResults(response.data || []);
        setTotalResults(response.total || 0);
        setTotalPages(response.pages || 0);
      } catch (err) {
        console.error('Search error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to search');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [q, page, selectedSort, selectedTags, selectedAuthor]);

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      }
      return [...prev, tag];
    });
  };

  const handleApplyFilters = () => {
    const params = { q };
    if (selectedTags.length > 0) params.tags = selectedTags.join(',');
    if (selectedAuthor) params.author = selectedAuthor;
    if (selectedSort !== 'relevance') params.sort = selectedSort;
    params.page = '1'; // Reset to first page
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setSelectedAuthor('');
    setSelectedSort('relevance');
    setSearchParams({ q });
  };

  const handlePageChange = (newPage) => {
    const params = { q, page: newPage.toString() };
    if (selectedTags.length > 0) params.tags = selectedTags.join(',');
    if (selectedAuthor) params.author = selectedAuthor;
    if (selectedSort !== 'relevance') params.sort = selectedSort;
    setSearchParams(params);
    window.scrollTo(0, 0);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (page > 1) {
      items.push(
        <Pagination.Prev key="prev" onClick={() => handlePageChange(page - 1)} />
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === page}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    if (page < totalPages) {
      items.push(
        <Pagination.Next key="next" onClick={() => handlePageChange(page + 1)} />
      );
    }

    return <Pagination className="justify-content-center mt-4">{items}</Pagination>;
  };

  if (!q) {
    return (
      <Container className="py-5">
        <Alert variant="info" className="text-center">
          <Alert.Heading>{t('search.placeholder')}</Alert.Heading>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="search-results-page py-4">
      <Row>
        {/* Filters Sidebar */}
        <Col lg={3} className="mb-4">
          <div className="filters-sidebar">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">{t('search.filters')}</h5>
              <Button 
                variant="link" 
                size="sm" 
                className="text-muted d-lg-none"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? t('common.close') : t('common.filter')}
              </Button>
            </div>

            <div className={`filters-content ${showFilters ? 'd-block' : 'd-none d-lg-block'}`}>
              {/* Sort */}
              <div className="filter-section mb-4">
                <h6>{t('search.sortBy')}</h6>
                <Form.Select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  size="sm"
                  className="filter-select"
                >
                  <option value="relevance">{t('search.relevance')}</option>
                  <option value="date">{t('search.newest')}</option>
                  <option value="popularity">{t('search.popularity')}</option>
                </Form.Select>
              </div>

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div className="filter-section mb-4">
                  <h6>{t('search.filterByTags')}</h6>
                  <div className="tags-filter">
                    {allTags.slice(0, 10).map((tag) => (
                      <Form.Check
                        key={tag}
                        type="checkbox"
                        id={`tag-${tag}`}
                        label={tag}
                        checked={selectedTags.includes(tag)}
                        onChange={() => handleTagToggle(tag)}
                        className="mb-2"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Apply Filters */}
              <div className="filter-actions">
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="w-100 mb-2"
                  onClick={handleApplyFilters}
                >
                  {t('search.applyFilters')}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  className="w-100"
                  onClick={handleClearFilters}
                >
                  {t('search.clearFilters')}
                </Button>
              </div>
            </div>
          </div>
        </Col>

        {/* Results */}
        <Col lg={9}>
          <div className="search-header mb-4">
            <h2>{t('search.results')}: "{q}"</h2>
            {!loading && totalResults > 0 && (
              <p className="text-muted">
                {t('search.resultsCount', { count: totalResults })}
              </p>
            )}
          </div>

          {loading && <LoadingSpinner message={t('search.searching')} />}

          {error && (
            <Alert variant="danger">
              <Alert.Heading>{t('messages.errorSomethingWrong')}</Alert.Heading>
              <p className="mb-0">{error}</p>
            </Alert>
          )}

          {!loading && !error && results.length === 0 && (
            <Alert variant="warning" className="text-center">
              <Alert.Heading>{t('search.noResults', { query: q })}</Alert.Heading>
              <p className="mb-0">
                <Link to="/">{t('navigation.home')}</Link>
              </p>
            </Alert>
          )}

          {!loading && !error && results.length > 0 && (
            <>
              <div className="search-results">
                {results.map((article) => (
                  <Card key={article._id} className="result-card mb-3">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Badge bg="primary">{article.category}</Badge>
                        <small className="text-muted">
                          👁 {article.views || 0} {t('search.viewCount', { count: article.views || 0 })}
                        </small>
                      </div>
                      
                      <Card.Title>
                        <Link 
                          to={`/article/${article.slug}`}
                          className="result-title"
                          dangerouslySetInnerHTML={{ __html: article.highlightedTitle || article.title }}
                        />
                      </Card.Title>
                      
                      {(article.highlightedSummary || article.summary) && (
                        <Card.Text 
                          className="result-excerpt"
                          dangerouslySetInnerHTML={{ 
                            __html: article.highlightedSummary || article.summary 
                          }}
                        />
                      )}
                      
                      {article.tags && article.tags.length > 0 && (
                        <div className="result-tags mt-2">
                          {article.tags.map((tag, idx) => (
                            <Badge key={idx} bg="secondary" className="me-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="result-meta text-muted small mt-2">
                        {article.author && <span className="me-3">✍️ {article.author}</span>}
                        {article.createdAt && (
                          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>

              {renderPagination()}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}