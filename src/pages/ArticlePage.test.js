import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ArticlePage from './ArticlePage';
import * as api from '../services/api';

// Mock the API
jest.mock('../services/api');

const renderWithRouter = (slug = 'test-article') => {
  return render(
    <MemoryRouter initialEntries={[`/article/${slug}`]}>
      <Routes>
        <Route path="/article/:slug" element={<ArticlePage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ArticlePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading spinner while fetching article', async () => {
    api.getArticleBySlug.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithRouter();
    
    expect(screen.getByText(/Loading article.../i)).toBeInTheDocument();
  });

  test('displays breadcrumb navigation for loaded article', async () => {
    const mockArticle = {
      _id: '1',
      title: 'Test Article',
      slug: 'test-article',
      category: 'Chemistry',
      content: 'Test content',
    };
    
    api.getArticleBySlug.mockResolvedValue({ data: mockArticle });
    
    renderWithRouter();
    
    await waitFor(() => {
      const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(breadcrumb).toBeInTheDocument();
      expect(breadcrumb).toHaveTextContent('Home');
      expect(breadcrumb).toHaveTextContent('Chemistry');
      expect(breadcrumb).toHaveTextContent('Test Article');
    });
  });

  test('displays breadcrumb without category when not available', async () => {
    const mockArticle = {
      _id: '1',
      title: 'Test Article',
      slug: 'test-article',
      content: 'Test content',
    };
    
    api.getArticleBySlug.mockResolvedValue({ data: mockArticle });
    
    renderWithRouter();
    
    await waitFor(() => {
      const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(breadcrumb).toBeInTheDocument();
      expect(breadcrumb).toHaveTextContent('Home');
      expect(breadcrumb).toHaveTextContent('Test Article');
      expect(breadcrumb).not.toHaveTextContent('Chemistry');
    });
  });

  test('displays 404 error with breadcrumb when article not found', async () => {
    api.getArticleBySlug.mockRejectedValue({ response: { status: 404 } });
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText(/404 - Article Not Found/i)).toBeInTheDocument();
      expect(screen.getByText('Article not found')).toBeInTheDocument();
      expect(screen.getByText('Go to Home')).toBeInTheDocument();
    });
  });

  test('displays error message on fetch failure', async () => {
    api.getArticleBySlug.mockRejectedValue(new Error('Network error'));
    
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText(/Error Loading Article/i)).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  test('shows breadcrumb navigation on error page', async () => {
    api.getArticleBySlug.mockRejectedValue(new Error('Test error'));
    
    renderWithRouter();
    
    await waitFor(() => {
      const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(breadcrumb).toBeInTheDocument();
      expect(breadcrumb).toHaveTextContent('Home');
      expect(breadcrumb).toHaveTextContent('Article');
    });
  });
});
