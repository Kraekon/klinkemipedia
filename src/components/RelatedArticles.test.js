import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RelatedArticles from './RelatedArticles';
import * as api from '../services/api';

// Mock the API
jest.mock('../services/api');

const renderWithRouter = (slug) => {
  return render(
    <BrowserRouter>
      <RelatedArticles currentArticleSlug={slug} />
    </BrowserRouter>
  );
};

const mockRelatedArticles = [
  {
    _id: '1',
    title: 'Related Article 1',
    slug: 'related-article-1',
    category: 'Electrolytes',
    summary: 'This is a summary of related article 1',
    tags: ['sodium', 'blood'],
    views: 100,
    relevanceScore: 15
  },
  {
    _id: '2',
    title: 'Related Article 2',
    slug: 'related-article-2',
    category: 'Liver Function',
    summary: 'This is a summary of related article 2',
    tags: ['liver', 'enzyme'],
    views: 50,
    relevanceScore: 10
  }
];

describe('RelatedArticles Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading spinner while fetching related articles', () => {
    api.getRelatedArticles.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithRouter('test-article');
    
    expect(screen.getByText(/Loading related articles.../i)).toBeInTheDocument();
  });

  test('displays related articles when loaded', async () => {
    api.getRelatedArticles.mockResolvedValue({ data: mockRelatedArticles });
    
    renderWithRouter('test-article');
    
    await waitFor(() => {
      expect(screen.getByText('Related Articles')).toBeInTheDocument();
      expect(screen.getByText('Related Article 1')).toBeInTheDocument();
      expect(screen.getByText('Related Article 2')).toBeInTheDocument();
    });
  });

  test('displays article summaries', async () => {
    api.getRelatedArticles.mockResolvedValue({ data: mockRelatedArticles });
    
    renderWithRouter('test-article');
    
    await waitFor(() => {
      expect(screen.getByText(/This is a summary of related article 1/i)).toBeInTheDocument();
      expect(screen.getByText(/This is a summary of related article 2/i)).toBeInTheDocument();
    });
  });

  test('displays category badges', async () => {
    api.getRelatedArticles.mockResolvedValue({ data: mockRelatedArticles });
    
    renderWithRouter('test-article');
    
    await waitFor(() => {
      expect(screen.getByText('Electrolytes')).toBeInTheDocument();
      expect(screen.getByText('Liver Function')).toBeInTheDocument();
    });
  });

  test('displays view counts', async () => {
    api.getRelatedArticles.mockResolvedValue({ data: mockRelatedArticles });
    
    renderWithRouter('test-article');
    
    await waitFor(() => {
      expect(screen.getByText(/100 views/i)).toBeInTheDocument();
      expect(screen.getByText(/50 views/i)).toBeInTheDocument();
    });
  });

  test('displays article tags', async () => {
    api.getRelatedArticles.mockResolvedValue({ data: mockRelatedArticles });
    
    renderWithRouter('test-article');
    
    await waitFor(() => {
      expect(screen.getByText('sodium')).toBeInTheDocument();
      expect(screen.getByText('liver')).toBeInTheDocument();
    });
  });

  test('does not render when no related articles found', async () => {
    api.getRelatedArticles.mockResolvedValue({ data: [] });
    
    renderWithRouter('test-article');
    
    await waitFor(() => {
      expect(screen.queryByText('Related Articles')).not.toBeInTheDocument();
    });
  });

  test('shows error message on fetch failure', async () => {
    api.getRelatedArticles.mockRejectedValue(new Error('Network error'));
    
    renderWithRouter('test-article');
    
    await waitFor(() => {
      expect(screen.getByText(/Unable to load related articles/i)).toBeInTheDocument();
    });
  });

  test('does not fetch when slug is not provided', () => {
    renderWithRouter(null);
    
    expect(api.getRelatedArticles).not.toHaveBeenCalled();
  });

  test('fetches related articles with correct parameters', async () => {
    api.getRelatedArticles.mockResolvedValue({ data: mockRelatedArticles });
    
    renderWithRouter('test-article-slug');
    
    await waitFor(() => {
      expect(api.getRelatedArticles).toHaveBeenCalledWith('test-article-slug', 4);
    });
  });

  test('truncates long summaries', async () => {
    const longSummaryArticle = [{
      ...mockRelatedArticles[0],
      summary: 'A'.repeat(150) // 150 characters
    }];
    
    api.getRelatedArticles.mockResolvedValue({ data: longSummaryArticle });
    
    renderWithRouter('test-article');
    
    await waitFor(() => {
      const summaryElement = screen.getByText(/A{100}\.\.\./);
      expect(summaryElement).toBeInTheDocument();
    });
  });

  test('creates correct links to related articles', async () => {
    api.getRelatedArticles.mockResolvedValue({ data: mockRelatedArticles });
    
    renderWithRouter('test-article');
    
    await waitFor(() => {
      const link1 = screen.getByText('Related Article 1').closest('a');
      const link2 = screen.getByText('Related Article 2').closest('a');
      
      expect(link1).toHaveAttribute('href', '/article/related-article-1');
      expect(link2).toHaveAttribute('href', '/article/related-article-2');
    });
  });
});
