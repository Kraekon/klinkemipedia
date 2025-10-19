import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, InputGroup, Button, ListGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getSearchSuggestions, getPopularSearches } from '../services/api';
import './SearchBar.css';

const SearchBar = ({ compact = false }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  // Fetch popular searches on mount
  useEffect(() => {
    const fetchPopularSearches = async () => {
      try {
        const response = await getPopularSearches();
        setPopularSearches(response.data || []);
      } catch (error) {
        console.error('Error fetching popular searches:', error);
      }
    };
    fetchPopularSearches();
  }, []);

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (searchQuery.trim().length >= 2) {
      setLoading(true);
      debounceTimer.current = setTimeout(async () => {
        try {
          const response = await getSearchSuggestions(searchQuery.trim());
          setSuggestions(response.data || []);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setLoading(false);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  const handleSearch = (e, query = null) => {
    if (e) e.preventDefault();
    const searchTerm = query || searchQuery.trim();
    if (searchTerm) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchQuery('');
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (slug) => {
    navigate(`/article/${slug}`);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim().length >= 2 || popularSearches.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    const totalItems = suggestions.length + popularSearches.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex].slug);
        } else if (selectedIndex >= suggestions.length && selectedIndex < totalItems) {
          const popularIndex = selectedIndex - suggestions.length;
          handleSearch(null, popularSearches[popularIndex].query);
        } else {
          handleSearch(e);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const showSuggestions = suggestions.length > 0;
  const showPopular = !searchQuery.trim() && popularSearches.length > 0;

  return (
    <div className={`search-bar-container ${compact ? 'compact' : ''}`} ref={dropdownRef}>
      <Form onSubmit={handleSearch}>
        <InputGroup size={compact ? 'sm' : 'lg'}>
          <InputGroup.Text className="search-icon">
            🔍
          </InputGroup.Text>
          <Form.Control
            ref={inputRef}
            type="search"
            placeholder={t('search.placeholder')}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            className="search-input"
            autoComplete="off"
          />
          {!compact && (
            <Button variant="primary" type="submit" className="search-button">
              {t('search.button')}
            </Button>
          )}
        </InputGroup>
      </Form>

      {showDropdown && (showSuggestions || showPopular) && (
        <div className="search-dropdown">
          {showSuggestions && (
            <>
              <div className="dropdown-header">{t('search.suggestions')}</div>
              <ListGroup variant="flush">
                {suggestions.map((article, index) => (
                  <ListGroup.Item
                    key={article._id}
                    action
                    active={selectedIndex === index}
                    onClick={() => handleSuggestionClick(article.slug)}
                    className="suggestion-item"
                  >
                    {article.title}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          )}
          
          {showPopular && (
            <>
              <div className="dropdown-header">{t('search.popularSearches')}</div>
              <ListGroup variant="flush">
                {popularSearches.map((search, index) => (
                  <ListGroup.Item
                    key={index}
                    action
                    active={selectedIndex === suggestions.length + index}
                    onClick={() => handleSearch(null, search.query)}
                    className="popular-search-item"
                  >
                    <span className="search-icon-small">🔍</span> {search.query}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          )}
        </div>
      )}
      
      {loading && searchQuery.trim() && (
        <div className="search-loading">{t('search.searching')}</div>
      )}
    </div>
  );
};

export default SearchBar;
