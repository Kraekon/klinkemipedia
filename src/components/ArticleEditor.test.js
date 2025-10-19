import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ArticleEditor from './ArticleEditor';
import * as api from '../services/api';

// Mock the API calls
jest.mock('../services/api');

// Mock TinyMCE Editor
jest.mock('@tinymce/tinymce-react', () => ({
  Editor: (props) => (
    <textarea
      data-testid="tinymce-editor"
      value={props.value}
      onChange={(e) => props.onEditorChange(e.target.value)}
    />
  )
}));

describe('ArticleEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders editor with initial values', () => {
    render(
      <ArticleEditor
        initialTitle="Test Article"
        initialContent="<p>Test content</p>"
        initialCategory="Electrolytes"
        initialTags={['tag1', 'tag2']}
      />
    );

    expect(screen.getByDisplayValue('Test Article')).toBeInTheDocument();
    expect(screen.getByTestId('tinymce-editor')).toHaveValue('<p>Test content</p>');
  });

  test('displays word count, character count, and reading time', () => {
    render(
      <ArticleEditor
        initialContent="<p>This is a test article with some content.</p>"
      />
    );

    expect(screen.getByText(/words/)).toBeInTheDocument();
    expect(screen.getByText(/characters/)).toBeInTheDocument();
    expect(screen.getByText(/min read/)).toBeInTheDocument();
  });

  test('shows save draft button', () => {
    render(<ArticleEditor />);

    const saveDraftButton = screen.getByText('Save Draft');
    expect(saveDraftButton).toBeInTheDocument();
  });

  test('shows publish button', () => {
    render(<ArticleEditor />);

    const publishButton = screen.getByText('Publish Article');
    expect(publishButton).toBeInTheDocument();
  });

  test('shows discard draft button', () => {
    render(<ArticleEditor />);

    const discardButton = screen.getByText('Discard Draft');
    expect(discardButton).toBeInTheDocument();
  });

  test('toggles between edit and preview mode', () => {
    render(
      <ArticleEditor
        initialTitle="Test Article"
        initialContent="<p>Test content</p>"
      />
    );

    const toggleButton = screen.getByText('👁️ Preview Mode');
    fireEvent.click(toggleButton);

    expect(screen.getByText('📝 Edit Mode')).toBeInTheDocument();
    expect(screen.getByText('Test Article')).toBeInTheDocument();
  });

  test('updates title when typing', () => {
    render(<ArticleEditor />);

    const titleInput = screen.getByPlaceholderText('Enter article title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });

    expect(titleInput).toHaveValue('New Title');
  });

  test('updates category when selected', () => {
    render(<ArticleEditor />);

    const categorySelect = screen.getByRole('combobox');
    fireEvent.change(categorySelect, { target: { value: 'Hormones' } });

    expect(categorySelect).toHaveValue('Hormones');
  });

  test('disables publish button when required fields are empty', () => {
    render(<ArticleEditor />);

    const publishButton = screen.getByText('Publish Article');
    expect(publishButton).toBeDisabled();
  });

  test('enables publish button when all required fields are filled', () => {
    render(
      <ArticleEditor
        initialTitle="Test Title"
        initialContent="<p>Test content</p>"
        initialCategory="Electrolytes"
      />
    );

    const publishButton = screen.getByText('Publish Article');
    expect(publishButton).not.toBeDisabled();
  });

  test('calls onPublish when publish button is clicked', () => {
    const mockOnPublish = jest.fn();
    
    render(
      <ArticleEditor
        initialTitle="Test Title"
        initialContent="<p>Test content</p>"
        initialCategory="Electrolytes"
        onPublish={mockOnPublish}
      />
    );

    const publishButton = screen.getByText('Publish Article');
    fireEvent.click(publishButton);

    expect(mockOnPublish).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Title',
        content: '<p>Test content</p>',
        category: 'Electrolytes'
      })
    );
  });

  test('calls onDiscard when discard button is clicked', () => {
    const mockOnDiscard = jest.fn();
    const draftId = 'draft123';
    
    render(
      <ArticleEditor
        draftId={draftId}
        onDiscard={mockOnDiscard}
      />
    );

    const discardButton = screen.getByText('Discard Draft');
    fireEvent.click(discardButton);

    expect(mockOnDiscard).toHaveBeenCalledWith(draftId);
  });
});
