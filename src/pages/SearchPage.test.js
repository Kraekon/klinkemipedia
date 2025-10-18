import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import SearchPage from './SearchPage';
import * as api from '../services/api';

// Mock the API
jest.mock('../services/api');

const renderWithRouter = (component, initialEntries = ['/search']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  );
};

describe('SearchPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders search page with no query', () => {
    renderWithRouter(<SearchPage />);
    
    expect(screen.getByText('Search Results')).toBeInTheDocument();
    expect(screen.getByText(/No search query provided/i)).toBeInTheDocument();
  });

  test('displays search query in badge', () => {
    renderWithRouter(<SearchPage />, ['/search?q=glucose']);
    
    expect(screen.getByText('glucose')).toBeInTheDocument();
  });

  test('shows loading spinner while searching', async () => {
    api.searchArticles.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithRouter(<SearchPage />, ['/search?q=test']);
    
    await waitFor(() => {
      expect(screen.getByText(/Searching for "test"/i)).toBeInTheDocument();
    });
  });

  test('displays search results count', async () => {
    const mockArticles = [
      { _id: '1', title: 'Article 1', slug: 'article-1' },
      { _id: '2', title: 'Article 2', slug: 'article-2' },
    ];
    
    api.searchArticles.mockResolvedValue({ data: mockArticles });
    
    renderWithRouter(<SearchPage />, ['/search?q=test']);
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText(/articles found/i)).toBeInTheDocument();
    });
  });

  test('displays no results message when search returns empty', async () => {
    api.searchArticles.mockResolvedValue({ data: [] });
    
    renderWithRouter(<SearchPage />, ['/search?q=nonexistent']);
    
    await waitFor(() => {
      expect(screen.getByText(/No results found/i)).toBeInTheDocument();
      expect(screen.getByText(/couldn't find any articles matching "nonexistent"/i)).toBeInTheDocument();
    });
  });

  test('displays error message on search failure', async () => {
    api.searchArticles.mockRejectedValue(new Error('Network error'));
    
    renderWithRouter(<SearchPage />, ['/search?q=test']);
    
    await waitFor(() => {
      expect(screen.getByText(/Search Error/i)).toBeInTheDocument();
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  test('shows clear search button when query exists', () => {
    renderWithRouter(<SearchPage />, ['/search?q=test']);
    
    expect(screen.getByText('Clear Search')).toBeInTheDocument();
  });

  test('does not show clear search button when no query', () => {
    renderWithRouter(<SearchPage />);
    
    expect(screen.queryByText('Clear Search')).not.toBeInTheDocument();
  });
});
