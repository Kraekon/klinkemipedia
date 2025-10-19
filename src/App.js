import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Alert, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import SearchPage from './pages/SearchPage';
import AdminPage from './pages/AdminPage';
import AdminArticleForm from './pages/AdminArticleForm';
import UserManagementPage from './pages/UserManagementPage';
import AdminMediaLibrary from './pages/AdminMediaLibrary';
import MediaAnalytics from './pages/MediaAnalytics';
import TagBrowsePage from './pages/TagBrowsePage';
import TagArticlesPage from './pages/TagArticlesPage';
import AdminTagManagement from './pages/AdminTagManagement';
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
    <Router>
      <div className="App">
        <Routes>
          {/* Admin routes (without main navbar) */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/new" element={<AdminArticleForm />} />
          <Route path="/admin/edit/:slug" element={<AdminArticleForm />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/media" element={<AdminMediaLibrary />} />
          <Route path="/admin/media/analytics" element={<MediaAnalytics />} />
          <Route path="/admin/tags" element={<AdminTagManagement />} />

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
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;