import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Alert, Button } from 'react-bootstrap';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import SearchPage from './pages/SearchPage';
import AdminPage from './pages/AdminPage';
import AdminArticleForm from './pages/AdminArticleForm';
import UserManagementPage from './pages/UserManagementPage';
import AdminMediaLibrary from './pages/AdminMediaLibrary';
import MediaAnalytics from './pages/MediaAnalytics';
import './App.css';

const NotFoundPage = () => (
  <Container className="mt-5">
    <Alert variant="warning" className="text-center">
      <Alert.Heading className="display-4">404</Alert.Heading>
      <h2 className="mb-4">Page Not Found</h2>
      <p className="lead">
        Oops! The page you're looking for doesn't exist.
      </p>
      <p>
        It might have been moved or deleted, or you may have mistyped the URL.
      </p>
      <hr />
      <div className="d-flex gap-2 justify-content-center">
        <Button as={Link} to="/" variant="primary" size="lg">
          Go to Home
        </Button>
        <Button as={Link} to="/search" variant="outline-primary" size="lg">
          Search Articles
        </Button>
      </div>
    </Alert>
  </Container>
);

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

          {/* Main site routes (with main navbar) */}
          <Route path="/*" element={
            <>
              <Navbar />
              <main className="container mt-4">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/article/:slug" element={<ArticlePage />} />
                  <Route path="/search" element={<SearchPage />} />
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