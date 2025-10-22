import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Badge, Modal, Alert, Spinner, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import AdminNavbar from '../components/AdminNavbar';
import { getAllArticles, deleteArticle } from '../services/api';
import './Admin.css';

const AdminPage = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, article: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllArticles({ status: '', limit: 100 });
      setArticles(response.data || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.article) return;

    try {
      setLoading(true);
      await deleteArticle(deleteModal.article.slug);
      setSuccess(`Article "${deleteModal.article.title}" deleted successfully`);
      setDeleteModal({ show: false, article: null });
      fetchArticles();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error deleting article:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete article');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      draft: 'warning',
      published: 'success',
      archived: 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const filteredArticles = articles
    .filter(article => 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'updatedAt' || sortBy === 'createdAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  return (
    <>
      <AdminNavbar />
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h2>{t('article.articleDashboard')}</h2>
            <div className="article-count">
              {t('article.articleCount', { count: filteredArticles.length })}
            </div>
          </div>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => navigate('/admin/new')}
          >
            + {t('article.createArticle')}
          </Button>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <div className="mb-3 d-flex gap-3 align-items-end">
          <Form.Group className="flex-grow-1">
            <Form.Label>{t('common.search')}</Form.Label>
            <Form.Control
              type="text"
              placeholder={t('article.searchArticles')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
          <Form.Group style={{ minWidth: '150px' }}>
            <Form.Label>{t('sort.by')}</Form.Label>
            <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="updatedAt">{t('article.lastModified')}</option>
              <option value="createdAt">{t('article.createdAt')}</option>
              <option value="title">{t('article.title')}</option>
              <option value="category">{t('article.category')}</option>
              <option value="views">{t('article.views')}</option>
            </Form.Select>
          </Form.Group>
          <Form.Group style={{ minWidth: '120px' }}>
            <Form.Label>{t('sort.by')}</Form.Label>
            <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">{t('sort.descending')}</option>
              <option value="asc">{t('sort.ascending')}</option>
            </Form.Select>
          </Form.Group>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">{t('article.loadingArticles')}</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="empty-state">
            <h3>{t('article.noArticlesFound')}</h3>
            <p>{t('article.createArticle')}</p>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => navigate('/admin/new')}
            >
              + {t('article.createArticle')}
            </Button>
          </div>
        ) : (
          <div className="admin-table">
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>{t('table.title')}</th>
                  <th>{t('table.category')}</th>
                  <th>{t('table.status')}</th>
                  <th>{t('article.views')}</th>
                  <th>{t('article.lastModified')}</th>
                  <th style={{ width: '200px' }}>{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article) => (
                  <tr key={article._id}>
                    <td>
                      <strong>{article.title}</strong>
                      {article.summary && (
                        <div className="text-muted small mt-1">
                          {article.summary.substring(0, 80)}
                          {article.summary.length > 80 ? '...' : ''}
                        </div>
                      )}
                    </td>
                    <td>{article.category || 'N/A'}</td>
                    <td>{getStatusBadge(article.status)}</td>
                    <td>{article.views || 0}</td>
                    <td className="text-nowrap">
                      {new Date(article.updatedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="table-actions">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/admin/edit/${article.slug}`)}
                        >
                          {t('common.edit')}
                        </Button>
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => navigate(`/article/${article.slug}`)}
                        >
                          {t('common.view')}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteModal({ show: true, article })}
                        >
                          {t('common.delete')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>

      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, article: null })}>
        <Modal.Header closeButton>
          <Modal.Title>{t('messages.confirmDeleteArticle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('messages.confirmDeleteArticleDetail', { title: deleteModal.article?.title })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModal({ show: false, article: null })}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t('article.deleteArticle')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminPage;
