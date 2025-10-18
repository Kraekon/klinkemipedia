import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SearchBar from './SearchBar';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('SearchBar Component', () => {
  test('renders search input and button', () => {
    renderWithRouter(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/Search articles by title, content, or tags/i);
    const searchButton = screen.getByText('Search');

    expect(searchInput).toBeInTheDocument();
    expect(searchButton).toBeInTheDocument();
  });

  test('updates search query on input change', () => {
    renderWithRouter(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/Search articles by title, content, or tags/i);
    
    fireEvent.change(searchInput, { target: { value: 'albumin' } });
    
    expect(searchInput.value).toBe('albumin');
  });

  test('clears search query after submission', () => {
    renderWithRouter(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/Search articles by title, content, or tags/i);
    const form = searchInput.closest('form');
    
    fireEvent.change(searchInput, { target: { value: 'glucose' } });
    fireEvent.submit(form);
    
    expect(searchInput.value).toBe('');
  });
});
