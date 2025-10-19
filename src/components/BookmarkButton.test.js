import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import BookmarkButton from './BookmarkButton';

// Mock the API module
jest.mock('../services/api', () => ({
  checkBookmark: jest.fn(),
  createBookmark: jest.fn(),
  deleteBookmark: jest.fn(),
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('BookmarkButton', () => {
  test('renders without crashing when user is not logged in', () => {
    renderWithProviders(<BookmarkButton articleId="123" articleSlug="test-article" />);
    // When no user is logged in, the button should not render
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
