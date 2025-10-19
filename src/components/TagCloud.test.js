import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TagCloud from './TagCloud';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('TagCloud Component', () => {
  test('renders empty state when no tags', () => {
    renderWithRouter(<TagCloud tags={[]} />);
    expect(screen.getByText(/no tags/i)).toBeInTheDocument();
  });

  test('renders tags with links', () => {
    const tags = [
      { tag: 'tag1', count: 5 },
      { tag: 'tag2', count: 10 }
    ];
    renderWithRouter(<TagCloud tags={tags} />);
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  test('larger count tags have larger font size', () => {
    const tags = [
      { tag: 'small', count: 1 },
      { tag: 'large', count: 100 }
    ];
    renderWithRouter(<TagCloud tags={tags} />);
    const smallTag = screen.getByText('small');
    const largeTag = screen.getByText('large');
    
    // Get computed font sizes
    const smallSize = parseFloat(window.getComputedStyle(smallTag).fontSize);
    const largeSize = parseFloat(window.getComputedStyle(largeTag).fontSize);
    
    // Large tag should have larger font
    expect(largeSize).toBeGreaterThan(smallSize);
  });
});
