import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Alert, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import AdminArticleForm from './pages/AdminArticleForm';
import ArticleEditorPage from './pages/ArticleEditorPage';
import MyDrafts from './pages/MyDrafts';
import UserManagementPage from './pages/UserManagementPage';
import AdminMediaLibrary from './pages/AdminMediaLibrary';
import MediaAnalytics from './pages/MediaAnalytics';
import TagBrowsePage from './pages/TagBrowsePage';
import TagArticlesPage from './pages/TagArticlesPage';
import AdminTagManagement from './pages/AdminTagManagement';
import AdminCommentModeration from './pages/AdminCommentModeration';
import VersionCompare from './components/VersionCompare';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import './App.css';

const NotFoundPage = () => {
  const { t } = useTranslation();
  
  return (
    <Container className="mt-5">
      <Alert variant="warning" className="text-center">
        <Alert.Heading className="display-4">{t('page.notFound.title')}</Alert.Heading>
        <h2 className="mb-4">{t('page.notFound.heading')}</h2>
        <p className="lead">
          {t('page.notFound.message')}
        </p>
        <p>
          {t('page.notFound.description')}
        </p>
        <hr />
        <div className="d-flex gap-2 justify-content-center">
          <Button as={Link} to="/" variant="primary" size="lg">
            {t('page.notFound.goHome')}
          </Button>
          <Button as={Link} to="/search" variant="outline-primary" size="lg">
            {t('page.notFound.searchArticles')}
          </Button>
        </div>
      </Alert>
    </Container>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Auth routes (no navbar) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin routes (without main navbar, require admin) */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/new" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminArticleForm />
              </ProtectedRoute>
            } />
            <Route path="/admin/edit/:slug" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminArticleForm />
              </ProtectedRoute>
            } />
            <Route path="/admin/editor/new" element={
              <ProtectedRoute requireAdmin={true}>
                <ArticleEditorPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/editor/:slug" element={
              <ProtectedRoute requireAdmin={true}>
                <ArticleEditorPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/editor/draft/:draftId" element={
              <ProtectedRoute requireAdmin={true}>
                <ArticleEditorPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/my-drafts" element={
              <ProtectedRoute requireAdmin={true}>
                <MyDrafts />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin={true}>
                <UserManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/media" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminMediaLibrary />
              </ProtectedRoute>
            } />
            <Route path="/admin/media/analytics" element={
              <ProtectedRoute requireAdmin={true}>
                <MediaAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/admin/tags" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminTagManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/comments" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminCommentModeration />
              </ProtectedRoute>
            } />
            <Route path="/admin/articles/:slug/compare" element={
              <ProtectedRoute requireAdmin={true}>
                <VersionCompare />
              </ProtectedRoute>
            } />

            {/* Main site routes (with main navbar) */}
            <Route path="/*" element={
              <>
                <Navbar />
                <main className="container mt-4">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/article/:slug" element={<ArticlePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/tags" element={<TagBrowsePage />} />
                    <Route path="/tag/:tagname" element={<TagArticlesPage />} />
                    <Route path="/profile/:username" element={<ProfilePage />} />
                    <Route path="/profile/edit" element={
                      <ProtectedRoute>
                        <EditProfilePage />
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;