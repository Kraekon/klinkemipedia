import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { reportComment } from '../services/api';

const ReportModal = ({ show, commentId, onHide }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      setError(t('comments.reportReasonRequired'));
      return;
    }

    if (reason.length > 500) {
      setError(t('comments.reportReasonTooLong'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await reportComment(commentId, reason);
      setSuccess(true);
      setReason('');
      
      setTimeout(() => {
        setSuccess(false);
        onHide();
      }, 2000);
    } catch (err) {
      console.error('Error reporting comment:', err);
      setError(err.response?.data?.message || t('comments.reportError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      setError(null);
      setSuccess(false);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('comments.reportComment')}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {success ? (
          <Alert variant="success">{t('comments.reportSuccess')}</Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Form.Group>
              <Form.Label>{t('comments.reportReason')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={t('comments.reportReasonPlaceholder')}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                disabled={isSubmitting}
              />
              <Form.Text className="text-muted">
                {reason.length}/500
              </Form.Text>
            </Form.Group>

            <div className="d-flex gap-2 mt-3">
              <Button
                variant="danger"
                type="submit"
                disabled={isSubmitting || !reason.trim()}
              >
                {isSubmitting ? t('common.loading') : t('comments.submitReport')}
              </Button>
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ReportModal;
