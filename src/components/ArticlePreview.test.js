import React from 'react';
import { render, screen } from '@testing-library/react';
import ArticlePreview from './ArticlePreview';

// Mock the TagBadge component
jest.mock('./TagBadge', () => {
  return function TagBadge({ tag }) {
    return <span data-testid="tag-badge">{tag}</span>;
  };
});

// Mock the getImageUrl utility
jest.mock('../utils/imageUrl', () => ({
  getImageUrl: (url) => url
}));

describe('ArticlePreview Component', () => {
  const mockArticleData = {
    title: 'Test Article Title',
    summary: 'This is a test summary',
    content: '<p>This is test content</p>',
    category: 'Electrolytes',
    tags: ['test', 'sodium'],
    referenceRanges: [
      { parameter: 'Sodium', range: '135-145', unit: 'mmol/L', notes: 'Normal range' }
    ],
    featuredImage: 'https://example.com/image.jpg'
  };

  test('renders article title', () => {
    render(<ArticlePreview {...mockArticleData} />);
    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
  });

  test('renders article summary', () => {
    render(<ArticlePreview {...mockArticleData} />);
    expect(screen.getByText('This is a test summary')).toBeInTheDocument();
  });

  test('renders category badge', () => {
    render(<ArticlePreview {...mockArticleData} />);
    expect(screen.getByText('Electrolytes')).toBeInTheDocument();
  });

  test('renders tags', () => {
    render(<ArticlePreview {...mockArticleData} />);
    const tagBadges = screen.getAllByTestId('tag-badge');
    expect(tagBadges).toHaveLength(2);
    expect(tagBadges[0]).toHaveTextContent('test');
    expect(tagBadges[1]).toHaveTextContent('sodium');
  });

  test('renders reference ranges table', () => {
    render(<ArticlePreview {...mockArticleData} />);
    expect(screen.getByText('Reference Ranges')).toBeInTheDocument();
    expect(screen.getByText('Sodium')).toBeInTheDocument();
    expect(screen.getByText('135-145')).toBeInTheDocument();
    expect(screen.getByText('mmol/L')).toBeInTheDocument();
    expect(screen.getByText('Normal range')).toBeInTheDocument();
  });

  test('renders featured image when provided', () => {
    render(<ArticlePreview {...mockArticleData} />);
    const images = screen.getAllByRole('img');
    const featuredImage = images.find(img => img.alt === 'Test Article Title');
    expect(featuredImage).toBeTruthy();
    expect(featuredImage.src).toContain('example.com/image.jpg');
  });

  test('applies desktop class by default', () => {
    const { container } = render(<ArticlePreview {...mockArticleData} />);
    expect(container.querySelector('.preview-desktop')).toBeInTheDocument();
  });

  test('applies mobile class when deviceMode is mobile', () => {
    const { container } = render(<ArticlePreview {...mockArticleData} deviceMode="mobile" />);
    expect(container.querySelector('.preview-mobile')).toBeInTheDocument();
  });

  test('handles missing optional fields gracefully', () => {
    const minimalData = {
      title: 'Minimal Article',
      content: '<p>Content only</p>'
    };
    render(<ArticlePreview {...minimalData} />);
    expect(screen.getByText('Minimal Article')).toBeInTheDocument();
    expect(screen.queryByText('Summary')).not.toBeInTheDocument();
    expect(screen.queryByText('Reference Ranges')).not.toBeInTheDocument();
  });

  test('renders empty table when referenceRanges is empty array', () => {
    const dataWithEmptyRanges = {
      ...mockArticleData,
      referenceRanges: []
    };
    render(<ArticlePreview {...dataWithEmptyRanges} />);
    expect(screen.queryByText('Reference Ranges')).not.toBeInTheDocument();
  });

  test('displays "Content" heading when content is provided', () => {
    render(<ArticlePreview {...mockArticleData} />);
    const contentHeadings = screen.getAllByText('Content');
    expect(contentHeadings.length).toBeGreaterThan(0);
  });
});
