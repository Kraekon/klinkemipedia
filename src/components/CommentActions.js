import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { deleteComment } from '../services/api';
import ReportModal from './ReportModal';
import './CommentActions.css';

const CommentActions = ({ comment, isOwnComment, onEdit, onDelete, onReply, depth }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(t('comments.confirmDelete'))) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteComment(comment._id);
      onDelete(comment._id);
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert(err.response?.data?.message || t('comments.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="comment-actions">
      {user && (
        <Button
          variant="link"
          size="sm"
          className="action-btn"
          onClick={onReply}
          disabled={depth >= 4}
        >
          <i className="bi bi-reply"></i> {t('comments.reply')}
        </Button>
      )}

      {isOwnComment && (
        <>
          <Button
            variant="link"
            size="sm"
            className="action-btn"
            onClick={onEdit}
          >
            <i className="bi bi-pencil"></i> {t('common.edit')}
          </Button>

          <Button
            variant="link"
            size="sm"
            className="action-btn delete"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <i className="bi bi-trash"></i> {t('common.delete')}
          </Button>
        </>
      )}

      {user && !isOwnComment && (
        <Button
          variant="link"
          size="sm"
          className="action-btn report"
          onClick={() => setShowReportModal(true)}
        >
          <i className="bi bi-flag"></i> {t('comments.report')}
        </Button>
      )}

      <ReportModal
        show={showReportModal}
        commentId={comment._id}
        onHide={() => setShowReportModal(false)}
      />
    </div>
  );
};

export default CommentActions;
