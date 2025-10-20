import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PreviewPanel from './PreviewPanel';

// Mock the ArticlePreview component
jest.mock('./ArticlePreview', () => {
  return function ArticlePreview({ title, deviceMode }) {
    return (
      <div data-testid="article-preview">
        <span>Title: {title}</span>
        <span>Device: {deviceMode}</span>
      </div>
    );
  };
});

describe('PreviewPanel Component', () => {
  const mockProps = {
    title: 'Test Article',
    summary: 'Test Summary',
    content: '<p>Test Content</p>',
    category: 'Electrolytes',
    tags: ['test'],
    referenceRanges: []
  };

  test('renders preview panel header', () => {
    render(<PreviewPanel {...mockProps} />);
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  test('renders device toggle buttons', () => {
    render(<PreviewPanel {...mockProps} />);
    expect(screen.getByTitle('Desktop Preview')).toBeInTheDocument();
    expect(screen.getByTitle('Mobile Preview')).toBeInTheDocument();
  });

  test('defaults to desktop mode', () => {
    render(<PreviewPanel {...mockProps} />);
    const preview = screen.getByTestId('article-preview');
    expect(preview).toHaveTextContent('Device: desktop');
  });

  test('switches to mobile mode when mobile button is clicked', () => {
    render(<PreviewPanel {...mockProps} />);
    const mobileButton = screen.getByTitle('Mobile Preview');
    fireEvent.click(mobileButton);
    
    const preview = screen.getByTestId('article-preview');
    expect(preview).toHaveTextContent('Device: mobile');
  });

  test('switches back to desktop mode when desktop button is clicked', () => {
    render(<PreviewPanel {...mockProps} />);
    
    // First switch to mobile
    const mobileButton = screen.getByTitle('Mobile Preview');
    fireEvent.click(mobileButton);
    
    // Then switch back to desktop
    const desktopButton = screen.getByTitle('Desktop Preview');
    fireEvent.click(desktopButton);
    
    const preview = screen.getByTestId('article-preview');
    expect(preview).toHaveTextContent('Device: desktop');
  });

  test('passes all props to ArticlePreview component', () => {
    render(<PreviewPanel {...mockProps} />);
    const preview = screen.getByTestId('article-preview');
    expect(preview).toHaveTextContent('Title: Test Article');
  });

  test('desktop button has primary variant when in desktop mode', () => {
    render(<PreviewPanel {...mockProps} />);
    const desktopButton = screen.getByTitle('Desktop Preview');
    expect(desktopButton).toHaveClass('btn-primary');
  });

  test('mobile button has primary variant when in mobile mode', () => {
    render(<PreviewPanel {...mockProps} />);
    const mobileButton = screen.getByTitle('Mobile Preview');
    fireEvent.click(mobileButton);
    expect(mobileButton).toHaveClass('btn-primary');
  });

  test('renders with all optional props', () => {
    const fullProps = {
      ...mockProps,
      featuredImage: 'https://example.com/image.jpg'
    };
    render(<PreviewPanel {...fullProps} />);
    expect(screen.getByTestId('article-preview')).toBeInTheDocument();
  });
});
