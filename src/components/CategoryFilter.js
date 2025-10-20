import React, { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getAllCategories } from '../services/categoryApi';
import './CategoryFilter.css';

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      // Add "All" at the beginning
      const allCategories = [
        { _id: 'all', name: 'All', color: '#0d6efd' }, // Bootstrap primary blue
        ...(response.data.data || [])
      ];
      setCategories(allCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="category-filter mb-4">Loading categories...</div>;
  }
  
  return (
    <div className="category-filter mb-4">
      <h5 className="mb-3">{t('filter.by')} {t('filter.category')}</h5>
      <div className="category-badges">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.name;
          return (
            <Badge
              key={category._id}
              style={{
                backgroundColor: isSelected ? category.color : '#f1f3f5',
                color: isSelected ? '#fff' : '#495057',
                borderColor: category.color
              }}
              className={`category-badge ${isSelected ? 'active' : ''}`}
              onClick={() => onCategoryChange(category.name)}
              role="button"
            >
              {category.name}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;