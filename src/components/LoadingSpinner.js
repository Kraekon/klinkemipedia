import React from 'react';
import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message }) => {
  const { t } = useTranslation();
  const displayMessage = message || t('common.loading');
  
  return (
    <div className="loading-spinner-container">
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">{t('common.loading')}</span>
      </Spinner>
      {displayMessage && <p>{displayMessage}</p>}
    </div>
  );
};

export default LoadingSpinner;
