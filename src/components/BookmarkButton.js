import React, { useState, useEffect } from 'react';
import { Button, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { checkBookmark, createBookmark, deleteBookmark } from '../services/api';
import './BookmarkButton.css';

const BookmarkButton = ({ articleId, articleSlug, size = 'sm', showLabel = true }) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      if (!user || !articleId) {
        setLoading(false);
        return;
      }

      try {
        const response = await checkBookmark(articleId);
        setIsBookmarked(response.isBookmarked);
        if (response.bookmark) {
          setBookmarkId(response.bookmark._id);
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarkStatus();
  }, [articleId, user]);

  const handleBookmarkToggle = async () => {
    if (!user) {
      setToastMessage('Please log in to bookmark articles');
      setToastVariant('warning');
      setShowToast(true);
      return;
    }

    setProcessing(true);

    try {
      if (isBookmarked) {
        // Remove bookmark
        await deleteBookmark(bookmarkId);
        setIsBookmarked(false);
        setBookmarkId(null);
        setToastMessage('Bookmark removed');
        setToastVariant('success');
      } else {
        // Add bookmark
        const response = await createBookmark({ 
          articleId,
          notes: '',
          isFavorite: false
        });
        setIsBookmarked(true);
        setBookmarkId(response.data._id);
        setToastMessage('Article bookmarked!');
        setToastVariant('success');
      }
      setShowToast(true);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      setToastMessage(error.response?.data?.message || 'Failed to update bookmark');
      setToastVariant('danger');
      setShowToast(true);
    } finally {
      setProcessing(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Button variant="outline-secondary" size={size} disabled>
        <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
        {showLabel && <span className="ms-2">Loading...</span>}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant={isBookmarked ? 'success' : 'outline-secondary'}
        size={size}
        onClick={handleBookmarkToggle}
        disabled={processing}
        className="bookmark-button"
        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        {processing ? (
          <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
        ) : (
          <span className={`bookmark-icon ${isBookmarked ? 'bookmarked' : ''}`}>
            {isBookmarked ? '❤️' : '🤍'}
          </span>
        )}
        {showLabel && (
          <span className="ms-2">
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </span>
        )}
      </Button>

      <ToastContainer position="top-end" className="p-3" style={{ position: 'fixed', zIndex: 9999 }}>
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header>
            <strong className="me-auto">
              {toastVariant === 'success' ? '✓ Success' : '⚠ Notice'}
            </strong>
          </Toast.Header>
          <Toast.Body className={toastVariant === 'success' ? 'text-white' : ''}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default BookmarkButton;
