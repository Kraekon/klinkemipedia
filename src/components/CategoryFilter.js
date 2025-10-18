import React from 'react';
import { Badge } from 'react-bootstrap';
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
  return (
    <div className="category-filter mb-4">
      <h5 className="mb-3">Filter by Category</h5>
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
