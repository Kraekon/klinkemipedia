import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Form, Alert, Pagination } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  getAdminComments,
  approveComment,
  rejectComment,
  deleteCommentPermanently
} from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminCommentModeration.css';

const AdminCommentModeration = () => {
  const { t } = useTranslation();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await getAdminComments(statusFilter, currentPage, 20);
      setComments(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
      setError(null);
    } catch (err) {
      console.error('Error fetching admin comments:', err);
      setError(t('comments.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [statusFilter, currentPage]);

  const handleApprove = async (commentId) => {
    try {
      await approveComment(commentId);
      fetchComments();
    } catch (err) {
      console.error('Error approving comment:', err);
      alert(err.response?.data?.message || t('comments.approveError'));
    }
  };

  const handleReject = async (commentId) => {
    try {
      await rejectComment(commentId);
      fetchComments();
    } catch (err) {
      console.error('Error rejecting comment:', err);
      alert(err.response?.data?.message || t('comments.rejectError'));
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm(t('comments.confirmDeletePermanent'))) {
      return;
    }

    try {
      await deleteCommentPermanently(commentId);
      fetchComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert(err.response?.data?.message || t('comments.deleteError'));
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      approved: 'success',
      pending: 'warning',
      spam: 'danger',
      deleted: 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateContent = (content, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Container className="admin-comment-moderation mt-4">
      <h2>{t('comments.moderation')}</h2>

      <div className="filters mb-3">
        <Form.Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          style={{ maxWidth: '200px' }}
        >
          <option value="">{t('comments.allStatuses')}</option>
          <option value="approved">{t('comments.statusApproved')}</option>
          <option value="pending">{t('comments.statusPending')}</option>
          <option value="spam">{t('comments.statusSpam')}</option>
          <option value="deleted">{t('comments.statusDeleted')}</option>
        </Form.Select>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <LoadingSpinner />
      ) : comments.length === 0 ? (
        <Alert variant="info">{t('comments.noCommentsFound')}</Alert>
      ) : (
        <>
          <Table striped bordered hover responsive className="comment-table">
            <thead>
              <tr>
                <th>{t('comments.author')}</th>
                <th>{t('comments.content')}</th>
                <th>{t('comments.article')}</th>
                <th>{t('common.status')}</th>
                <th>{t('comments.reports')}</th>
                <th>{t('comments.date')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {comments.map(comment => (
                <tr key={comment._id}>
                  <td>
                    {comment.userId ? comment.userId.username : t('comments.deletedUser')}
                  </td>
                  <td>{truncateContent(comment.content)}</td>
                  <td>
                    {comment.articleId && (
                      <Link to={`/articles/${comment.articleId.slug}`} target="_blank">
                        {comment.articleId.title}
                      </Link>
                    )}
                  </td>
                  <td>{getStatusBadge(comment.status)}</td>
                  <td>
                    {comment.reports && comment.reports.length > 0 ? (
                      <Badge bg="danger">{comment.reports.length}</Badge>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td>{formatDate(comment.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      {comment.status !== 'approved' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleApprove(comment._id)}
                        >
                          {t('comments.approve')}
                        </Button>
                      )}
                      {comment.status !== 'spam' && (
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={() => handleReject(comment._id)}
                        >
                          {t('comments.reject')}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(comment._id)}
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <Pagination className="justify-content-center">
              <Pagination.First
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              />
              
              {[...Array(totalPages)].map((_, idx) => {
                const page = idx + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
                ) {
                  return (
                    <Pagination.Item
                      key={page}
                      active={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Pagination.Item>
                  );
                } else if (page === currentPage - 3 || page === currentPage + 3) {
                  return <Pagination.Ellipsis key={page} disabled />;
                }
                return null;
              })}
              
              <Pagination.Next
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default AdminCommentModeration;
