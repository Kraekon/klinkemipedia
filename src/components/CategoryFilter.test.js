import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryFilter from './CategoryFilter';

describe('CategoryFilter Component', () => {
  test('renders all category options', () => {
    const mockOnCategoryChange = jest.fn();
    render(
      <CategoryFilter 
        selectedCategory="All" 
        onCategoryChange={mockOnCategoryChange} 
      />
    );

    expect(screen.getByText('Filter by Category')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Electrolytes')).toBeInTheDocument();
    expect(screen.getByText('Liver Function')).toBeInTheDocument();
    expect(screen.getByText('Kidney Function')).toBeInTheDocument();
  });

  test('calls onCategoryChange when a category is clicked', () => {
    const mockOnCategoryChange = jest.fn();
    render(
      <CategoryFilter 
        selectedCategory="All" 
        onCategoryChange={mockOnCategoryChange} 
      />
    );

    const enzymesBadge = screen.getByText('Enzymes');
    fireEvent.click(enzymesBadge);

    expect(mockOnCategoryChange).toHaveBeenCalledWith('Enzymes');
  });

  test('highlights the selected category', () => {
    const mockOnCategoryChange = jest.fn();
    render(
      <CategoryFilter 
        selectedCategory="Enzymes" 
        onCategoryChange={mockOnCategoryChange} 
      />
    );

    const enzymesBadge = screen.getByText('Enzymes');
    expect(enzymesBadge).toHaveClass('active');
  });
});
