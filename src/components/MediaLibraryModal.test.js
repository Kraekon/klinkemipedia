import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import MediaLibraryModal from './MediaLibraryModal';
import * as api from '../services/api';

// Mock the API
jest.mock('../services/api');

describe('MediaLibraryModal', () => {
  const mockOnHide = jest.fn();
  const mockOnSelectImage = jest.fn();

  const mockMediaData = {
    success: true,
    data: [
      {
        _id: '1',
        url: 'http://example.com/image1.jpg',
        filename: 'image1.jpg',
        originalName: 'Test Image 1.jpg',
        size: 1024000,
        width: 800,
        height: 600,
        usageCount: 2
      },
      {
        _id: '2',
        url: 'http://example.com/image2.jpg',
        filename: 'image2.jpg',
        originalName: 'Test Image 2.jpg',
        size: 2048000,
        width: 1024,
        height: 768,
        usageCount: 0
      }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 2,
      pages: 1
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    api.getAllMedia.mockResolvedValue(mockMediaData);
  });

  test('renders modal when show is true', async () => {
    render(
      <MediaLibraryModal
        show={true}
        onHide={mockOnHide}
        onSelectImage={mockOnSelectImage}
      />
    );

    expect(screen.getByText('Browse Media Library')).toBeInTheDocument();
  });

  test('fetches and displays media items', async () => {
    render(
      <MediaLibraryModal
        show={true}
        onHide={mockOnHide}
        onSelectImage={mockOnSelectImage}
      />
    );

    await waitFor(() => {
      expect(api.getAllMedia).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(/Test Image 1/)).toBeInTheDocument();
      expect(screen.getByText(/Test Image 2/)).toBeInTheDocument();
    });
  });

  test('renders search input', async () => {
    render(
      <MediaLibraryModal
        show={true}
        onHide={mockOnHide}
        onSelectImage={mockOnSelectImage}
      />
    );

    await waitFor(() => {
      expect(api.getAllMedia).toHaveBeenCalledTimes(1);
    });

    const searchInput = screen.getByPlaceholderText('Search by filename...');
    expect(searchInput).toBeInTheDocument();
    
    // Can type in search input
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(searchInput.value).toBe('test');
  });

  test('renders filter and sort controls', async () => {
    render(
      <MediaLibraryModal
        show={true}
        onHide={mockOnHide}
        onSelectImage={mockOnSelectImage}
      />
    );

    await waitFor(() => {
      expect(api.getAllMedia).toHaveBeenCalledTimes(1);
    });

    // Check that filter options are available
    expect(screen.getByText('All Images')).toBeInTheDocument();
    expect(screen.getByText('Used Images')).toBeInTheDocument();
    expect(screen.getByText('Unused Images')).toBeInTheDocument();

    // Check that sort options are available
    expect(screen.getByText('Newest First')).toBeInTheDocument();
    expect(screen.getByText('Oldest First')).toBeInTheDocument();
    expect(screen.getByText('A-Z')).toBeInTheDocument();
    expect(screen.getByText('Z-A')).toBeInTheDocument();
  });

  test('displays empty state when no media found', async () => {
    api.getAllMedia.mockResolvedValue({
      success: true,
      data: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 }
    });

    render(
      <MediaLibraryModal
        show={true}
        onHide={mockOnHide}
        onSelectImage={mockOnSelectImage}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No images found')).toBeInTheDocument();
    });
  });

  test('displays error message on API failure', async () => {
    api.getAllMedia.mockRejectedValue(new Error('Failed to fetch media'));

    render(
      <MediaLibraryModal
        show={true}
        onHide={mockOnHide}
        onSelectImage={mockOnSelectImage}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch media/)).toBeInTheDocument();
    });
  });

  test('calls onHide when cancel button is clicked', () => {
    render(
      <MediaLibraryModal
        show={true}
        onHide={mockOnHide}
        onSelectImage={mockOnSelectImage}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });
});
