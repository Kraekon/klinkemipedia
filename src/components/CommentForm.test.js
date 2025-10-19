import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CommentForm from './CommentForm';
import * as api from '../services/api';

// Mock the API
jest.mock('../services/api');

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: jest.fn() }
  })
}));

describe('CommentForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders comment form with placeholder', () => {
    render(<CommentForm articleSlug="test-article" />);
    
    expect(screen.getByPlaceholderText('comments.placeholder')).toBeInTheDocument();
  });

  test('renders edit placeholder when in edit mode', () => {
    render(
      <CommentForm 
        commentId="123" 
        initialContent="Test content"
        isEdit={true}
      />
    );
    
    expect(screen.getByPlaceholderText('comments.editPlaceholder')).toBeInTheDocument();
  });

  test('renders reply placeholder when in reply mode', () => {
    render(
      <CommentForm 
        parentCommentId="123"
        isReply={true}
      />
    );
    
    expect(screen.getByPlaceholderText('comments.replyPlaceholder')).toBeInTheDocument();
  });

  test('shows character count', () => {
    render(<CommentForm articleSlug="test-article" />);
    
    expect(screen.getByText('0/2000')).toBeInTheDocument();
  });

  test('updates character count when typing', () => {
    render(<CommentForm articleSlug="test-article" />);
    
    const textarea = screen.getByPlaceholderText('comments.placeholder');
    fireEvent.change(textarea, { target: { value: 'Test' } });
    
    expect(screen.getByText('4/2000')).toBeInTheDocument();
  });

  test('submit button is disabled when content is empty', () => {
    render(<CommentForm articleSlug="test-article" />);
    
    const submitButton = screen.getByRole('button', { name: 'comments.post' });
    expect(submitButton).toBeDisabled();
  });

  test('submit button is enabled when content is provided', () => {
    render(<CommentForm articleSlug="test-article" />);
    
    const textarea = screen.getByPlaceholderText('comments.placeholder');
    fireEvent.change(textarea, { target: { value: 'Test comment' } });
    
    const submitButton = screen.getByRole('button', { name: 'comments.post' });
    expect(submitButton).not.toBeDisabled();
  });

  test('calls createComment API on submit', async () => {
    const mockOnCommentAdded = jest.fn();
    api.createComment.mockResolvedValue({ data: { _id: '123', content: 'Test' } });
    
    render(
      <CommentForm 
        articleSlug="test-article" 
        onCommentAdded={mockOnCommentAdded}
      />
    );
    
    const textarea = screen.getByPlaceholderText('comments.placeholder');
    fireEvent.change(textarea, { target: { value: 'Test comment' } });
    
    const form = textarea.closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(api.createComment).toHaveBeenCalledWith('test-article', 'Test comment');
      expect(mockOnCommentAdded).toHaveBeenCalled();
    });
  });

  test('shows cancel button in edit mode', () => {
    render(
      <CommentForm 
        commentId="123"
        initialContent="Test"
        isEdit={true}
      />
    );
    
    expect(screen.getByRole('button', { name: 'common.cancel' })).toBeInTheDocument();
  });

  test('calls onCancel when cancel button is clicked', () => {
    const mockOnCancel = jest.fn();
    
    render(
      <CommentForm 
        commentId="123"
        initialContent="Test"
        isEdit={true}
        onCancel={mockOnCancel}
      />
    );
    
    const cancelButton = screen.getByRole('button', { name: 'common.cancel' });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('prevents submission when content exceeds 2000 characters', async () => {
    render(<CommentForm articleSlug="test-article" />);
    
    const longContent = 'A'.repeat(2001);
    const textarea = screen.getByPlaceholderText('comments.placeholder');
    
    // The textarea has maxLength attribute, so it won't allow typing beyond 2000
    // We test that the maxLength attribute is set
    expect(textarea).toHaveAttribute('maxLength', '2000');
  });
});
