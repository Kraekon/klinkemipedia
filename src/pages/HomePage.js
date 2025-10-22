import React, { useState } from 'react';
import { Container, Form, InputGroup, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './HomePage.css';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <Container className="homepage-container">
      <div className="search-section">
        <Form onSubmit={handleSearch} className="search-form">
          <InputGroup size="lg">
            <Form.Control
              type="text"
              placeholder={t('search.placeholder') || 'Sök efter artiklar...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <Button 
              variant="primary" 
              type="submit"
              className="search-button"
            >
              <i className="bi bi-search me-2"></i>
              {t('search.button') || 'Sök'}
            </Button>
          </InputGroup>
        </Form>
      </div>
    </Container>
  );
};

export default HomePage;