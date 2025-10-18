import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminArticleForm from './AdminArticleForm';
import * as api from '../services/api';

// Mock the API
jest.mock('../services/api');
jest.mock('../utils/slugify', () => ({
  slugify: (text) => text.toLowerCase().replace(/\s+/g, '-')
}));

const renderWithRouter = (initialPath = '/admin/new') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/admin/new" element={<AdminArticleForm />} />
        <Route path="/admin/edit/:slug" element={<AdminArticleForm />} />
        <Route path="/admin" element={<div>Admin Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
};

const mockArticle = {
  title: 'Test Article',
  slug: 'test-article',
  category: 'Electrolytes',
  summary: 'This is a test summary',
  content: 'This is test content for the article',
  referenceRanges: [
    { parameter: 'Sodium', range: '135-145', unit: 'mmol/L', ageGroup: 'All', notes: 'Normal range' }
  ],
  clinicalSignificance: 'Test significance',
  interpretation: 'Test interpretation',
  relatedTests: ['Test 1', 'Test 2'],
  tags: ['test', 'sodium'],
  references: ['Reference 1'],
  status: 'draft'
};

describe('AdminArticleForm Component - Enhanced Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.getAllTags.mockResolvedValue({ data: ['test', 'sodium', 'electrolyte'] });
  });

  describe('Character and Word Counters', () => {
    test('displays character and word count for summary field', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        const summaryInputs = screen.getAllByRole('textbox');
        const summaryInput = summaryInputs.find(input => 
          input.getAttribute('placeholder')?.includes('Brief summary')
        );
        fireEvent.change(summaryInput, { target: { value: 'Test summary' } });
      });

      await waitFor(() => {
        expect(screen.getByText(/12 characters \/ 2 words/i)).toBeInTheDocument();
      });
    });

    test('displays character and word count for content field', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        const contentInputs = screen.getAllByRole('textbox');
        const contentInput = contentInputs.find(input => 
          input.getAttribute('placeholder')?.includes('Article content')
        );
        fireEvent.change(contentInput, { target: { value: 'Test content here' } });
      });

      await waitFor(() => {
        expect(screen.getByText(/17 characters \/ 3 words/i)).toBeInTheDocument();
      });
    });

    test('shows initial character and word counts', async () => {
      renderWithRouter();
      
      await waitFor(() => {
        const counters = screen.getAllByText(/0 characters \/ 0 words/i);
        // Should have at least 2 counters (summary and content)
        expect(counters.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Enhanced Validation', () => {
    test('validates required fields on submit', async () => {
      renderWithRouter();
      
      const publishButton = screen.getByText('Publish');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
        expect(screen.getByText('Category is required')).toBeInTheDocument();
        expect(screen.getByText('Summary is required')).toBeInTheDocument();
        expect(screen.getByText('Content is required')).toBeInTheDocument();
      });
    });

    test('scrolls to top when validation errors occur', async () => {
      const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
      
      renderWithRouter();
      
      const publishButton = screen.getByText('Publish');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
      });

      scrollToSpy.mockRestore();
    });
  });

  describe('Success Notifications', () => {
    test('shows success toast notification on article update', async () => {
      api.getArticleBySlug.mockResolvedValue({ data: mockArticle });
      api.updateArticle.mockResolvedValue({ data: mockArticle });
      
      renderWithRouter('/admin/edit/test-article');
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Article')).toBeInTheDocument();
      });

      const publishButton = screen.getByText('Publish');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(screen.getByText(/Article "Test Article" updated successfully!/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('displays error message on save failure', async () => {
      api.getArticleBySlug.mockResolvedValue({ data: mockArticle });
      api.updateArticle.mockRejectedValue({
        response: { data: { message: 'Server error occurred' } }
      });
      
      renderWithRouter('/admin/edit/test-article');
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Article')).toBeInTheDocument();
      });

      const publishButton = screen.getByText('Publish');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(screen.getByText('Server error occurred')).toBeInTheDocument();
      });
    });

    test('scrolls to top when save error occurs', async () => {
      const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
      api.getArticleBySlug.mockResolvedValue({ data: mockArticle });
      api.updateArticle.mockRejectedValue(new Error('Save failed'));
      
      renderWithRouter('/admin/edit/test-article');
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Article')).toBeInTheDocument();
      });

      const publishButton = screen.getByText('Publish');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
      });

      scrollToSpy.mockRestore();
    });
  });

  describe('Form Features', () => {
    test('shows validation error message when trying to publish', async () => {
      renderWithRouter();
      
      const publishButton = screen.getByText('Publish');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(screen.getByText('Please fix the validation errors before submitting')).toBeInTheDocument();
      });
    });

    test('displays form in edit mode with article data', async () => {
      api.getArticleBySlug.mockResolvedValue({ data: mockArticle });
      
      renderWithRouter('/admin/edit/test-article');
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Article')).toBeInTheDocument();
        expect(screen.getByDisplayValue('This is a test summary')).toBeInTheDocument();
        expect(screen.getByText('Edit Article')).toBeInTheDocument();
      });
    });

    test('displays create mode title for new articles', async () => {
      renderWithRouter('/admin/new');
      
      await waitFor(() => {
        expect(screen.getByText('Create New Article')).toBeInTheDocument();
      });
    });
  });
});
