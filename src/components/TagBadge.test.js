import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TagBadge from './TagBadge';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('TagBadge Component', () => {
  test('renders tag name', () => {
    renderWithRouter(<TagBadge tag="test-tag" />);
    expect(screen.getByText('test-tag')).toBeInTheDocument();
  });

  test('renders non-clickable badge when clickable is false', () => {
    renderWithRouter(<TagBadge tag="test-tag" clickable={false} />);
    const badge = screen.getByText('test-tag');
    expect(badge.tagName).toBe('SPAN');
  });

  test('renders clickable badge with link when clickable is true', () => {
    renderWithRouter(<TagBadge tag="test-tag" clickable={true} />);
    const badge = screen.getByText('test-tag');
    expect(badge.closest('a')).toBeInTheDocument();
  });

  test('renders badge with remove button when onRemove is provided', () => {
    const mockRemove = jest.fn();
    renderWithRouter(<TagBadge tag="test-tag" onRemove={mockRemove} />);
    expect(screen.getByText('×')).toBeInTheDocument();
  });
});
