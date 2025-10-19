import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

const ConfirmModal = ({
  show,
  onHide,
  onConfirm,
  title = 'Bekräfta',
  message,
  confirmText = 'Bekräfta',
  cancelText = 'Avbryt',
  variant = 'danger',
  isLoading = false,
  children
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && <p>{message}</p>}
        {children}
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={onHide}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button 
          variant={variant}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {confirmText}...
            </>
          ) : (
            confirmText
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
