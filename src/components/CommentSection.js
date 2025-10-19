import React, { useState, useEffect, useContext } from 'react';
import { Container, Alert, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/AuthContext';
import { getComments } from '../services/api';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import LoadingSpinner from './LoadingSpinner';
import './CommentSection.css';

const CommentSection = ({ articleSlug }) => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await getComments(articleSlug, sortBy);
      setComments(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(t('comments.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [articleSlug, sortBy]);

  const handleCommentAdded = (newComment) => {
    setComments(prevComments => [newComment, ...prevComments]);
  };

  const handleCommentUpdated = (updatedComment) => {
    const updateCommentsRecursively = (commentList) => {
      return commentList.map(comment => {
        if (comment._id === updatedComment._id) {
          return { ...comment, ...updatedComment };
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateCommentsRecursively(comment.replies)
          };
        }
        return comment;
      });
    };
    
    setComments(prevComments => updateCommentsRecursively(prevComments));
  };

  const handleCommentDeleted = (commentId) => {
    const deleteCommentRecursively = (commentList) => {
      return commentList.map(comment => {
        if (comment._id === commentId) {
          return { ...comment, status: 'deleted', content: '[Comment deleted]' };
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: deleteCommentRecursively(comment.replies)
          };
        }
        return comment;
      });
    };
    
    setComments(prevComments => deleteCommentRecursively(prevComments));
  };

  const handleReplyAdded = (parentCommentId, newReply) => {
    const addReplyRecursively = (commentList) => {
      return commentList.map(comment => {
        if (comment._id === parentCommentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: addReplyRecursively(comment.replies)
          };
        }
        return comment;
      });
    };
    
    setComments(prevComments => addReplyRecursively(prevComments));
  };

  return (
    <Container className="comment-section">
      <div className="comment-section-header">
        <h3>{t('comments.title')}</h3>
        <div className="comment-controls">
          <Form.Select
            size="sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">{t('comments.sortNewest')}</option>
            <option value="oldest">{t('comments.sortOldest')}</option>
            <option value="top">{t('comments.sortTop')}</option>
          </Form.Select>
        </div>
      </div>

      {user ? (
        <CommentForm
          articleSlug={articleSlug}
          onCommentAdded={handleCommentAdded}
        />
      ) : (
        <Alert variant="info" className="login-prompt">
          {t('comments.loginToComment')}
        </Alert>
      )}

      {loading ? (
        <LoadingSpinner message={t('comments.loading')} />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : comments.length === 0 ? (
        <div className="no-comments">
          <p>{t('comments.noComments')}</p>
        </div>
      ) : (
        <CommentList
          comments={comments}
          articleSlug={articleSlug}
          onCommentUpdated={handleCommentUpdated}
          onCommentDeleted={handleCommentDeleted}
          onReplyAdded={handleReplyAdded}
        />
      )}
    </Container>
  );
};

export default CommentSection;
