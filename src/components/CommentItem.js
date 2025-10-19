import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/AuthContext';
import CommentForm from './CommentForm';
import CommentVotes from './CommentVotes';
import CommentActions from './CommentActions';
import CommentThread from './CommentThread';
import './CommentItem.css';

const CommentItem = ({ 
  comment, 
  articleSlug, 
  onCommentUpdated, 
  onCommentDeleted, 
  onReplyAdded,
  depth = 0 
}) => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const isOwnComment = user && comment.userId && comment.userId._id === user._id;
  const isDeleted = comment.status === 'deleted';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('comments.justNow');
    if (diffMins < 60) return t('comments.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('comments.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('comments.daysAgo', { count: diffDays });
    
    return date.toLocaleDateString();
  };

  const getUserDisplayName = () => {
    if (!comment.userId) return t('comments.deletedUser');
    const { username, profile } = comment.userId;
    if (profile && (profile.firstName || profile.lastName)) {
      return `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    }
    return username;
  };

  const handleEditComplete = (updatedComment) => {
    setIsEditing(false);
    onCommentUpdated(updatedComment);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleReplyComplete = (newReply) => {
    setIsReplying(false);
    onReplyAdded(comment._id, newReply);
  };

  const handleReplyCancel = () => {
    setIsReplying(false);
  };

  const handleReplyClick = () => {
    if (depth >= 4) {
      alert(t('comments.maxDepthReached'));
      return;
    }
    setIsReplying(true);
  };

  if (isDeleted && (!comment.replies || comment.replies.length === 0)) {
    return null; // Don't show deleted comments without replies
  }

  return (
    <div className={`comment-item depth-${depth}`}>
      <div className="comment-content-wrapper">
        <CommentVotes comment={comment} onVoteUpdate={onCommentUpdated} />
        
        <div className="comment-main">
          <div className="comment-header">
            <span className="comment-author">{getUserDisplayName()}</span>
            <span className="comment-separator">•</span>
            <span className="comment-date">{formatDate(comment.createdAt)}</span>
            {comment.isEdited && (
              <>
                <span className="comment-separator">•</span>
                <span className="comment-edited">{t('comments.edited')}</span>
              </>
            )}
          </div>

          {isEditing ? (
            <CommentForm
              commentId={comment._id}
              initialContent={comment.content}
              onCommentUpdated={handleEditComplete}
              onCancel={handleEditCancel}
              isEdit
            />
          ) : (
            <>
              <div className={`comment-body ${isDeleted ? 'deleted' : ''}`}>
                {comment.content}
              </div>

              {!isDeleted && (
                <CommentActions
                  comment={comment}
                  isOwnComment={isOwnComment}
                  onEdit={() => setIsEditing(true)}
                  onDelete={() => onCommentDeleted(comment._id)}
                  onReply={handleReplyClick}
                  depth={depth}
                />
              )}
            </>
          )}

          {isReplying && user && (
            <div className="reply-form-wrapper">
              <CommentForm
                parentCommentId={comment._id}
                onReplyAdded={handleReplyComplete}
                onCancel={handleReplyCancel}
                isReply
              />
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <CommentThread
              comments={comment.replies}
              articleSlug={articleSlug}
              onCommentUpdated={onCommentUpdated}
              onCommentDeleted={onCommentDeleted}
              onReplyAdded={onReplyAdded}
              depth={depth + 1}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
