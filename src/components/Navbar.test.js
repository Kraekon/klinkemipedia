import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  test('renders navbar with brand name', () => {
    renderWithRouter(<Navbar />);
    
    expect(screen.getByText('Klinkemipedia')).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    renderWithRouter(<Navbar />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Articles')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  test('renders search input and button', () => {
    renderWithRouter(<Navbar />);
    
    const searchInput = screen.getByPlaceholderText(/Search articles.../i);
    const searchButton = screen.getByLabelText(/Submit search/i);
    
    expect(searchInput).toBeInTheDocument();
    expect(searchButton).toBeInTheDocument();
  });

  test('updates search query on input change', () => {
    renderWithRouter(<Navbar />);
    
    const searchInput = screen.getByPlaceholderText(/Search articles.../i);
    
    fireEvent.change(searchInput, { target: { value: 'glucose' } });
    
    expect(searchInput.value).toBe('glucose');
  });

  test('shows clear button when search query exists', () => {
    renderWithRouter(<Navbar />);
    
    const searchInput = screen.getByPlaceholderText(/Search articles.../i);
    
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    expect(screen.getByLabelText(/Clear search/i)).toBeInTheDocument();
  });

  test('does not show clear button when search query is empty', () => {
    renderWithRouter(<Navbar />);
    
    expect(screen.queryByLabelText(/Clear search/i)).not.toBeInTheDocument();
  });

  test('clears search query when clear button is clicked', () => {
    renderWithRouter(<Navbar />);
    
    const searchInput = screen.getByPlaceholderText(/Search articles.../i);
    
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(searchInput.value).toBe('test');
    
    const clearButton = screen.getByLabelText(/Clear search/i);
    fireEvent.click(clearButton);
    
    expect(searchInput.value).toBe('');
  });

  test('clears search query after form submission', () => {
    renderWithRouter(<Navbar />);
    
    const searchInput = screen.getByPlaceholderText(/Search articles.../i);
    const form = searchInput.closest('form');
    
    fireEvent.change(searchInput, { target: { value: 'albumin' } });
    fireEvent.submit(form);
    
    expect(searchInput.value).toBe('');
  });

  test('does not submit empty search query', () => {
    renderWithRouter(<Navbar />);
    
    const searchInput = screen.getByPlaceholderText(/Search articles.../i);
    const form = searchInput.closest('form');
    
    fireEvent.change(searchInput, { target: { value: '   ' } });
    fireEvent.submit(form);
    
    expect(searchInput.value).toBe('   ');
  });
});
