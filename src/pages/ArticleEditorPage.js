import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Alert, Spinner, Modal, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import AdminNavbar from '../components/AdminNavbar';
import ArticleEditor from '../components/ArticleEditor';
import { getDraft, deleteDraft, createArticle, updateArticle, getArticleBySlug } from '../services/api';
import './ArticleEditorPage.css';

const ArticleEditorPage = () => {
  const { slug, draftId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialData, setInitialData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [],
    draftId: null,
    articleId: null
  });
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [discardDraftId, setDiscardDraftId] = useState(null);

  const isEditMode = !!slug;
  const isDraftMode = !!draftId;

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, draftId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isDraftMode) {
        // Load draft
        const response = await getDraft(draftId);
        if (response.success) {
          const draft = response.data;
          setInitialData({
            title: draft.title || '',
            content: draft.content || '',
            category: draft.category || '',
            tags: draft.tags || [],
            draftId: draft._id,
            articleId: draft.article || null
          });
        }
      } else if (isEditMode) {
        // Load existing article for editing
        const response = await getArticleBySlug(slug);
        if (response.success) {
          const article = response.data;
          setInitialData({
            title: article.title || '',
            content: article.content || '',
            category: article.category || '',
            tags: article.tags || [],
            draftId: null,
            articleId: article._id
          });
        }
      } else {
        // New article - check if there's a draft from location state
        const draftData = location.state?.draft;
        if (draftData) {
          setInitialData({
            title: draftData.title || '',
            content: draftData.content || '',
            category: draftData.category || '',
            tags: draftData.tags || [],
            draftId: draftData._id || null,
            articleId: null
          });
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    // Auto-save handles this, just show feedback
    console.log('Draft saved:', data);
  };

  const handlePublish = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const articleData = {
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags,
        summary: extractSummary(data.content),
        status: 'published'
      };

      if (isEditMode) {
        // Update existing article
        await updateArticle(slug, articleData);
        
        // Delete draft if it exists
        if (data.draftId) {
          await deleteDraft(data.draftId);
        }
        
        alert('Article updated successfully!');
        navigate(`/article/${slug}`);
      } else {
        // Create new article
        const response = await createArticle(articleData);
        
        // Delete draft if it exists
        if (data.draftId) {
          await deleteDraft(data.draftId);
        }
        
        alert('Article published successfully!');
        if (response.success && response.data.slug) {
          navigate(`/article/${response.data.slug}`);
        } else {
          navigate('/admin');
        }
      }
    } catch (err) {
      console.error('Error publishing article:', err);
      setError(err.response?.data?.message || err.message || 'Failed to publish article');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = (draftIdToDiscard) => {
    setDiscardDraftId(draftIdToDiscard);
    setShowDiscardModal(true);
  };

  const confirmDiscard = async () => {
    try {
      if (discardDraftId) {
        await deleteDraft(discardDraftId);
      }
      setShowDiscardModal(false);
      navigate('/admin/my-drafts');
    } catch (err) {
      console.error('Error discarding draft:', err);
      setError(err.response?.data?.message || err.message || 'Failed to discard draft');
      setShowDiscardModal(false);
    }
  };

  // Extract a summary from HTML content
  const extractSummary = (htmlContent) => {
    const plainText = htmlContent.replace(/<[^>]*>/g, '').trim();
    const words = plainText.split(/\s+/).slice(0, 50).join(' ');
    return words + (plainText.split(/\s+/).length > 50 ? '...' : '');
  };

  if (!user || !user.isAdmin) {
    return (
      <>
        <AdminNavbar />
        <Container className="mt-5">
          <Alert variant="danger">
            You must be an administrator to access this page.
          </Alert>
        </Container>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <Container className="mt-5 text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading...</p>
        </Container>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <Container className="article-editor-page mt-4 mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            {isDraftMode ? 'Edit Draft' : isEditMode ? 'Edit Article' : 'Create New Article'}
          </h2>
          <Button variant="outline-secondary" onClick={() => navigate('/admin')}>
            ← Back to Admin
          </Button>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <ArticleEditor
          initialContent={initialData.content}
          initialTitle={initialData.title}
          initialCategory={initialData.category}
          initialTags={initialData.tags}
          draftId={initialData.draftId}
          articleId={initialData.articleId}
          onSave={handleSave}
          onPublish={handlePublish}
          onDiscard={handleDiscard}
        />
      </Container>

      {/* Discard Confirmation Modal */}
      <Modal show={showDiscardModal} onHide={() => setShowDiscardModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Discard Draft</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to discard this draft? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDiscardModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDiscard}>
            Discard
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ArticleEditorPage;
