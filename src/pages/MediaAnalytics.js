import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Spinner, Alert, Toast, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import AdminNavbar from '../components/AdminNavbar';
import MediaCard from '../components/MediaCard';
import MediaDetailModal from '../components/MediaDetailModal';
import ConfirmModal from '../components/ConfirmModal';
import { getMediaAnalytics, getAllMedia, bulkDeleteMedia } from '../services/api';
import { getImageUrl } from '../utils/imageUrl';

const MediaAnalytics = () => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState(null);
  const [unusedImages, setUnusedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  const fetchAnalytics = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch analytics data
      const analyticsResponse = await getMediaAnalytics();
      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      }
      
      // Fetch unused images
      const unusedResponse = await getAllMedia({ filter: 'unused', limit: 100 });
      if (unusedResponse.success) {
        setUnusedImages(unusedResponse.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('messages.errorSomethingWrong'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const formatPercentage = (value, total) => {
    if (total === 0) return '0%';
    return ((value / total) * 100).toFixed(1) + '%';
  };

  const handleImageClick = (media) => {
    setSelectedMedia(media);
    setShowDetailModal(true);
  };

  const handleBulkDelete = async () => {
    if (unusedImages.length === 0) return;
    
    setDeleting(true);
    try {
      const imageIds = unusedImages.map(img => img._id);
      const response = await bulkDeleteMedia(imageIds);
      
      if (response.success) {
        showSuccessToast(t('messages.successImagesDeleted', { count: response.deleted }));
        setShowBulkDeleteModal(false);
        // Refresh analytics
        fetchAnalytics();
      } else {
        showErrorToast(t('messages.errorDeleteFailed'));
      }
    } catch (err) {
      showErrorToast(err.response?.data?.message || err.message || t('messages.errorSomethingWrong'));
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyUrl = (url) => {
    showSuccessToast(t('messages.successUrlCopied'));
  };

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setToastVariant('success');
    setShowToast(true);
  };

  const showErrorToast = (message) => {
    setToastMessage(message);
    setToastVariant('danger');
    setShowToast(true);
  };

  const calculateUnusedSize = () => {
    return unusedImages.reduce((sum, img) => sum + (img.size || 0), 0);
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <Container className="mt-4">
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">{t('common.loading')}</span>
            </Spinner>
            <p className="mt-3">{t('common.loading')}</p>
          </div>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AdminNavbar />
        <Container className="mt-4">
          <Alert variant="danger">
            <Alert.Heading>{t('messages.errorLoadFailed')}</Alert.Heading>
            <p>{error}</p>
            <Button variant="outline-danger" onClick={fetchAnalytics}>
              {t('common.back')}
            </Button>
          </Alert>
        </Container>
      </>
    );
  }

  if (!analytics) {
    return (
      <>
        <AdminNavbar />
        <Container className="mt-4">
          <Alert variant="warning">
            {t('messages.infoNoData')}
          </Alert>
        </Container>
      </>
    );
  }

  const unusedPercentage = analytics.totalImages > 0 
    ? (analytics.unusedImages / analytics.totalImages) * 100 
    : 0;

  return (
    <>
      <AdminNavbar />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>📊 {t('navigation.mediaAnalytics')}</h1>
          <Button variant="outline-primary" onClick={fetchAnalytics}>
            🔄 {t('common.back')}
          </Button>
        </div>

        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col xs={12} md={6} lg={3} className="mb-3">
            <Card className="h-100">
              <Card.Body className="text-center">
                <div style={{ fontSize: '2rem' }}>📷</div>
                <h2 className="mt-2">{analytics.totalImages}</h2>
                <p className="text-muted mb-0">{t('media.totalImages')}</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={12} md={6} lg={3} className="mb-3">
            <Card className="h-100">
              <Card.Body className="text-center">
                <div style={{ fontSize: '2rem' }}>💾</div>
                <h2 className="mt-2">{formatBytes(analytics.totalSize)}</h2>
                <p className="text-muted mb-0">{t('media.totalSize')}</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={12} md={6} lg={3} className="mb-3">
            <Card className="h-100">
              <Card.Body className="text-center">
                <div style={{ fontSize: '2rem' }}>✅</div>
                <h2 className="mt-2">{analytics.usedImages}</h2>
                <p className="text-muted mb-0">{t('media.usedImages')}</p>
                <small className="text-muted">
                  {formatPercentage(analytics.usedImages, analytics.totalImages)}
                </small>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={12} md={6} lg={3} className="mb-3">
            <Card className="h-100" bg={unusedPercentage > 20 ? 'warning' : ''}>
              <Card.Body className="text-center">
                <div style={{ fontSize: '2rem' }}>⚠️</div>
                <h2 className="mt-2">{analytics.unusedImages}</h2>
                <p className="text-muted mb-0">{t('media.unusedImages')}</p>
                <small className="text-muted">
                  {formatPercentage(analytics.unusedImages, analytics.totalImages)}
                </small>
                {unusedPercentage > 20 && (
                  <Badge bg="warning" text="dark" className="mt-2">
                    {t('media.unused')}
                  </Badge>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Most Used Images Section */}
        {analytics.mostUsed && analytics.mostUsed.length > 0 && (
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">{t('media.usedImages')}</h4>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>{t('media.filename')}</th>
                    <th>{t('media.filename')}</th>
                    <th>{t('media.usage')}</th>
                    <th>{t('media.size')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.mostUsed.map((media) => (
                    <tr key={media._id}>
                      <td>
                        <img 
                          src={getImageUrl(media.url)}
                          alt={media.originalName}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => handleImageClick(media)}
                        />
                      </td>
                      <td>
                        <Button 
                          variant="link" 
                          className="text-start p-0"
                          onClick={() => handleImageClick(media)}
                        >
                          {media.originalName}
                        </Button>
                      </td>
                      <td>
                        <Badge bg="success">{media.usageCount}</Badge>
                      </td>
                      <td>{formatBytes(media.size)}</td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleImageClick(media)}
                        >
                          {t('media.viewUsage')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}

        {/* Unused Images Section */}
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-0">{t('media.unusedImages')}</h4>
              <small className="text-muted">
                {t('media.usageCount', { count: unusedImages.length })} ({formatBytes(calculateUnusedSize())})
              </small>
            </div>
            {unusedImages.length > 0 && (
              <Button 
                variant="danger"
                onClick={() => setShowBulkDeleteModal(true)}
              >
                🗑️ {t('media.deleteUnused')}
              </Button>
            )}
          </Card.Header>
          <Card.Body>
            {unusedImages.length === 0 ? (
              <Alert variant="success">
                <strong>{t('media.noImagesFound')}</strong>
              </Alert>
            ) : (
              <>
                <Alert variant="warning">
                  ⚠️ <strong>{t('media.notUsed')}</strong>
                </Alert>
                <Row>
                  {unusedImages.map((media) => (
                    <Col key={media._id} xs={12} sm={6} md={4} lg={3} className="mb-3">
                      <div onClick={() => handleImageClick(media)} style={{ cursor: 'pointer' }}>
                        <MediaCard 
                          media={media}
                          onDelete={() => {}}
                          onCopyUrl={handleCopyUrl}
                        />
                      </div>
                    </Col>
                  ))}
                </Row>
              </>
            )}
          </Card.Body>
        </Card>

        {/* Largest Images Section */}
        {analytics.largestImages && analytics.largestImages.length > 0 && (
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">Största Bilder</h4>
              <small className="text-muted">Potentiella kandidater för optimering</small>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Bild</th>
                    <th>Filnamn</th>
                    <th>Storlek</th>
                    <th>Dimensioner</th>
                    <th>Åtgärd</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.largestImages.map((media) => (
                    <tr key={media._id}>
                      <td>
                        <img 
                          src={getImageUrl(media.url)}
                          alt={media.originalName}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => handleImageClick(media)}
                        />
                      </td>
                      <td>
                        <Button 
                          variant="link" 
                          className="text-start p-0"
                          onClick={() => handleImageClick(media)}
                        >
                          {media.originalName}
                        </Button>
                      </td>
                      <td>
                        <Badge bg={media.size > 1024 * 1024 ? 'warning' : 'info'}>
                          {formatBytes(media.size)}
                        </Badge>
                      </td>
                      <td>
                        {media.width && media.height 
                          ? `${media.width} × ${media.height} px`
                          : 'N/A'}
                      </td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleImageClick(media)}
                        >
                          Visa detaljer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}

        {/* Media Detail Modal */}
        <MediaDetailModal 
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          media={selectedMedia}
          onDelete={() => {
            setShowDetailModal(false);
            fetchAnalytics();
          }}
          onCopyUrl={handleCopyUrl}
        />

        {/* Bulk Delete Confirmation Modal */}
        <ConfirmModal
          show={showBulkDeleteModal}
          onHide={() => setShowBulkDeleteModal(false)}
          onConfirm={handleBulkDelete}
          title={t('messages.confirmDeleteUnusedImages')}
          message={t('messages.confirmDeleteUnusedImagesDetail', { count: unusedImages.length })}
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          variant="danger"
          isLoading={deleting}
        >
          <Alert variant="info">
            <strong>{t('media.totalSize')}:</strong> {formatBytes(calculateUnusedSize())}
          </Alert>
        </ConfirmModal>

        {/* Toast Notification */}
        <div className="toast-container position-fixed bottom-0 end-0 p-3">
          <Toast 
            show={showToast} 
            onClose={() => setShowToast(false)}
            delay={3000}
            autohide
            bg={toastVariant}
          >
            <Toast.Body className="text-white">
              {toastMessage}
            </Toast.Body>
          </Toast>
        </div>
      </Container>
    </>
  );
};

export default MediaAnalytics;
