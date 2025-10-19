import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MediaPickerCard from './MediaPickerCard';

describe('MediaPickerCard', () => {
  const mockMedia = {
    _id: '1',
    url: 'http://example.com/test-image.jpg',
    filename: 'test-image.jpg',
    originalName: 'Test Image.jpg',
    size: 1024000,
    width: 800,
    height: 600,
    usageCount: 2
  };

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders media card with correct information', () => {
    render(<MediaPickerCard media={mockMedia} onSelect={mockOnSelect} />);

    expect(screen.getByText('Test Image.jpg')).toBeInTheDocument();
    expect(screen.getByText('800 × 600')).toBeInTheDocument();
    expect(screen.getByText('1000.00 KB')).toBeInTheDocument();
    expect(screen.getByText(/Used in 2 articles/)).toBeInTheDocument();
  });

  test('displays image with correct src and alt', () => {
    render(<MediaPickerCard media={mockMedia} onSelect={mockOnSelect} />);

    const img = screen.getByAltText('Test Image.jpg');
    expect(img).toHaveAttribute('src', 'http://example.com/test-image.jpg');
  });

  test('truncates long filenames', () => {
    const longNameMedia = {
      ...mockMedia,
      originalName: 'This is a very long filename that should be truncated.jpg'
    };

    render(<MediaPickerCard media={longNameMedia} onSelect={mockOnSelect} />);

    // Check that the title attribute has the full name
    const filename = screen.getByTitle(longNameMedia.originalName);
    expect(filename).toBeInTheDocument();
  });

  test('calls onSelect when Select button is clicked', () => {
    render(<MediaPickerCard media={mockMedia} onSelect={mockOnSelect} />);

    const selectButton = screen.getByText('Select');
    fireEvent.click(selectButton);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith({
      url: mockMedia.url,
      filename: mockMedia.filename,
      originalName: mockMedia.originalName,
      width: mockMedia.width,
      height: mockMedia.height
    });
  });

  test('displays correct file size for small files', () => {
    const smallFileMedia = {
      ...mockMedia,
      size: 500 // 500 bytes
    };

    render(<MediaPickerCard media={smallFileMedia} onSelect={mockOnSelect} />);

    expect(screen.getByText('500 B')).toBeInTheDocument();
  });

  test('displays correct file size for large files', () => {
    const largeFileMedia = {
      ...mockMedia,
      size: 5242880 // 5 MB
    };

    render(<MediaPickerCard media={largeFileMedia} onSelect={mockOnSelect} />);

    expect(screen.getByText('5.00 MB')).toBeInTheDocument();
  });

  test('does not display usage badge for unused images', () => {
    const unusedMedia = {
      ...mockMedia,
      usageCount: 0
    };

    render(<MediaPickerCard media={unusedMedia} onSelect={mockOnSelect} />);

    expect(screen.queryByText(/Used in/)).not.toBeInTheDocument();
  });

  test('displays singular "article" for single usage', () => {
    const singleUseMedia = {
      ...mockMedia,
      usageCount: 1
    };

    render(<MediaPickerCard media={singleUseMedia} onSelect={mockOnSelect} />);

    expect(screen.getByText(/Used in 1 article$/)).toBeInTheDocument();
  });
});
