import React from 'react';
import { Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import './CategoryFilter.css';

const CATEGORIES = [
  'All',
  'Electrolytes',
  'Liver Function',
  'Kidney Function',
  'Cardiac Markers',
  'Hormones',
  'Enzymes',
  'Hematology',
  'Lipid Panel',
  'Other'
];

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const { t } = useTranslation();
  
  return (
    <div className="category-filter mb-4">
      <h5 className="mb-3">{t('filter.by')} {t('filter.category')}</h5>
      <div className="category-badges">
        {CATEGORIES.map((category) => (
          <Badge
            key={category}
            bg={selectedCategory === category ? 'primary' : 'secondary'}
            className={`category-badge ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onCategoryChange(category)}
            role="button"
          >
            {category}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
