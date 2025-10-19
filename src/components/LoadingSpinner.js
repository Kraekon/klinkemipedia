import React from 'react';
import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const LoadingSpinner = ({ message }) => {
  const { t } = useTranslation();
  const displayMessage = message || t('common.loading');
  
  return (
    <div className="text-center my-5">
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">{t('common.loading')}</span>
      </Spinner>
      {displayMessage && <p className="mt-3 text-muted">{displayMessage}</p>}
    </div>
  );
};

export default LoadingSpinner;
