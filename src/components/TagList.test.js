import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TagList from './TagList';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('TagList Component', () => {
  test('renders empty state when no tags', () => {
    renderWithRouter(<TagList tags={[]} />);
    expect(screen.getByText(/no tags/i)).toBeInTheDocument();
  });

  test('renders tags with counts', () => {
    const tags = [
      { tag: 'tag1', count: 5 },
      { tag: 'tag2', count: 10 }
    ];
    renderWithRouter(<TagList tags={tags} showCounts={true} />);
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  test('does not show counts when showCounts is false', () => {
    const tags = [
      { tag: 'tag1', count: 5 }
    ];
    renderWithRouter(<TagList tags={tags} showCounts={false} />);
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });
});
