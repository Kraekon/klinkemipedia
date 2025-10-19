import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { createComment, editComment, replyToComment } from '../services/api';
import './CommentForm.css';

const CommentForm = ({ 
  articleSlug,
  commentId,
  parentCommentId,
  initialContent = '',
  onCommentAdded,
  onCommentUpdated,
  onReplyAdded,
  onCancel,
  isEdit = false,
  isReply = false
}) => {
  const { t } = useTranslation();
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError(t('comments.emptyError'));
      return;
    }

    if (content.length > 2000) {
      setError(t('comments.tooLongError'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let response;
      
      if (isEdit && commentId) {
        response = await editComment(commentId, content);
        onCommentUpdated && onCommentUpdated(response.data);
      } else if (isReply && parentCommentId) {
        response = await replyToComment(parentCommentId, content);
        onReplyAdded && onReplyAdded(response.data);
      } else {
        response = await createComment(articleSlug, content);
        onCommentAdded && onCommentAdded(response.data);
      }

      setContent('');
      
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError(err.response?.data?.message || t('comments.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlaceholder = () => {
    if (isEdit) return t('comments.editPlaceholder');
    if (isReply) return t('comments.replyPlaceholder');
    return t('comments.placeholder');
  };

  const getSubmitLabel = () => {
    if (isEdit) return t('comments.update');
    if (isReply) return t('comments.reply');
    return t('comments.post');
  };

  return (
    <Form onSubmit={handleSubmit} className="comment-form">
      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      
      <Form.Group>
        <Form.Control
          as="textarea"
          rows={isEdit || isReply ? 3 : 4}
          placeholder={getPlaceholder()}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          disabled={isSubmitting}
          className="comment-textarea"
        />
        <div className="char-count">
          {content.length}/2000
        </div>
      </Form.Group>

      <div className="comment-form-actions">
        <Button 
          type="submit" 
          variant="success" 
          size="sm"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? t('common.loading') : getSubmitLabel()}
        </Button>
        
        {(isEdit || isReply) && (
          <Button 
            type="button"
            variant="secondary" 
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
        )}
      </div>
    </Form>
  );
};

export default CommentForm;
