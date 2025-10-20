import React, { useState, useEffect, useRef } from 'react';
import { Form, Badge, ListGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import './TagInput.css';

const TagInput = ({ tags = [], onChange, maxTags = 10, availableTags = [] }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    // Filter available tags based on input and exclude already selected tags
    if (inputValue.trim()) {
      const filtered = availableTags
        .filter(tag => 
          tag.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(tag.toLowerCase())
        )
        .slice(0, 5);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, availableTags, tags]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const addTag = (tag) => {
    const normalizedTag = tag.toLowerCase().trim();
    
    if (!normalizedTag) return;
    
    if (tags.length >= maxTags) {
      alert(t('tags.maxTags', { max: maxTags }));
      return;
    }

    if (tags.includes(normalizedTag)) {
      return;
    }

    onChange([...tags, normalizedTag]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const selectSuggestion = (tag) => {
    addTag(tag);
    inputRef.current?.focus();
  };

  return (
    <div className="tag-input-container">
      <Form.Group className="mb-3">
        <Form.Label>{t('article.tags')}</Form.Label>
        <div className="tag-input-wrapper">
          <div className="tag-input-tags">
            {tags.map((tag, index) => (
              <Badge 
                key={index} 
                bg="secondary" 
                className="me-1 mb-1"
                style={{ cursor: 'pointer' }}
              >
                {tag}
                <span 
                  onClick={() => removeTag(tag)}
                  className="ms-1"
                  style={{ cursor: 'pointer' }}
                >
                  ×
                </span>
              </Badge>
            ))}
          </div>
          <div className="position-relative">
            <Form.Control
              ref={inputRef}
              type="text"
              placeholder={tags.length < maxTags ? t('article.tags.enterTag') : t('article.tags.maxTags', { max: maxTags })}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={tags.length >= maxTags}
              onFocus={() => inputValue && setShowSuggestions(filteredSuggestions.length > 0)}
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <ListGroup 
                ref={suggestionsRef}
                className="tag-suggestions position-absolute w-100 mt-1"
                style={{ zIndex: 1000 }}
              >
                {filteredSuggestions.map((suggestion, index) => (
                  <ListGroup.Item
                    key={index}
                    action
                    onClick={() => selectSuggestion(suggestion)}
                    className="cursor-pointer"
                  >
                    {suggestion}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
        </div>
        <Form.Text className="text-muted">
          {t('article.tags.maxTags', { max: maxTags })} ({tags.length}/{maxTags})
        </Form.Text>
      </Form.Group>
    </div>
  );
};

export default TagInput;
