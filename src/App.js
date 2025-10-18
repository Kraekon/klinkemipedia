import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import SearchPage from './pages/SearchPage';
import AdminPage from './pages/AdminPage';
import AdminArticleForm from './pages/AdminArticleForm';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Admin routes (without main navbar) */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/new" element={<AdminArticleForm />} />
          <Route path="/admin/edit/:slug" element={<AdminArticleForm />} />

          {/* Main site routes (with main navbar) */}
          <Route path="/*" element={
            <>
              <Navbar />
              <main className="container mt-4">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/article/:slug" element={<ArticlePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="*" element={<div className="text-center mt-5"><h2>404 - Page Not Found</h2></div>} />
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