import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, InputGroup, Button } from 'react-bootstrap';
import './SearchBar.css';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="search-bar-container mb-4">
      <Form onSubmit={handleSearch}>
        <InputGroup size="lg">
          <Form.Control
            type="search"
            placeholder="Search articles by title, content, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <Button variant="primary" type="submit" className="search-button">
            Search
          </Button>
        </InputGroup>
      </Form>
    </div>
  );
};

export default SearchBar;
