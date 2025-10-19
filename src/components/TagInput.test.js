import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagInput from './TagInput';

describe('TagInput Component', () => {
  test('renders tag input field', () => {
    render(<TagInput tags={[]} onChange={jest.fn()} />);
    expect(screen.getByPlaceholderText(/enter tag/i)).toBeInTheDocument();
  });

  test('displays existing tags', () => {
    render(<TagInput tags={['tag1', 'tag2']} onChange={jest.fn()} />);
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  test('adds tag on Enter key', async () => {
    const mockOnChange = jest.fn();
    const user = userEvent.setup();
    
    render(<TagInput tags={[]} onChange={mockOnChange} />);
    const input = screen.getByPlaceholderText(/enter tag/i);
    
    await user.type(input, 'newtag{Enter}');
    
    expect(mockOnChange).toHaveBeenCalledWith(['newtag']);
  });

  test('removes tag when clicking X', () => {
    const mockOnChange = jest.fn();
    render(<TagInput tags={['tag1', 'tag2']} onChange={mockOnChange} />);
    
    const removeButtons = screen.getAllByText('×');
    fireEvent.click(removeButtons[0]);
    
    expect(mockOnChange).toHaveBeenCalledWith(['tag2']);
  });

  test('enforces max tags limit', async () => {
    const mockOnChange = jest.fn();
    const user = userEvent.setup();
    
    // Mock alert
    window.alert = jest.fn();
    
    render(<TagInput tags={['t1', 't2', 't3']} onChange={mockOnChange} maxTags={3} />);
    const input = screen.getByPlaceholderText(/max 3 tags/i);
    
    await user.type(input, 'newtag{Enter}');
    
    expect(window.alert).toHaveBeenCalled();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  test('shows suggestions from available tags', () => {
    render(<TagInput 
      tags={[]} 
      onChange={jest.fn()} 
      availableTags={['existing1', 'existing2']} 
    />);
    
    const input = screen.getByPlaceholderText(/enter tag/i);
    fireEvent.change(input, { target: { value: 'exist' } });
    
    // Wait for suggestions to appear
    setTimeout(() => {
      expect(screen.getByText('existing1')).toBeInTheDocument();
      expect(screen.getByText('existing2')).toBeInTheDocument();
    }, 100);
  });
});
