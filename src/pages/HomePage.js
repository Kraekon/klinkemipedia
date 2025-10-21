import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './HomePage.css';

const HomePage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <Container className="mt-5">
      <div className="text-center">
        <h1 className="display-3 mb-4">Klinkemipedia</h1>
        <p className="lead mb-5">{t('home.subtitle')}</p>
        
        <div className="search-container mx-auto" style={{ maxWidth: '600px' }}>
          <Form onSubmit={handleSearch}>
            <Form.Group className="mb-3">
              <div className="input-group input-group-lg">
                <Form.Control
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="shadow-sm"
                />
                <Button
                  variant="primary"
                  type="submit"
                  className="px-4"
                >
                  {t('search.button')}
                </Button>
              </div>
            </Form.Group>
          </Form>
        </div>
      </div>
    </Container>
  );
};

export default HomePage;