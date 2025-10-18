import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Article APIs
export const getAllArticles = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/articles`, { params });
  return response.data;
};

export const getArticleBySlug = async (slug) => {
  const response = await axios.get(`${API_BASE_URL}/articles/${slug}`);
  return response.data;
};

export const searchArticles = async (query) => {
  const response = await axios.get(`${API_BASE_URL}/articles/search`, { params: { q: query } });
  return response.data;
};

// Create new article
export const createArticle = async (articleData) => {
  const response = await axios.post(`${API_BASE_URL}/articles`, articleData);
  return response.data;
};

// Update article
export const updateArticle = async (slug, articleData) => {
  const response = await axios.put(`${API_BASE_URL}/articles/${slug}`, articleData);
  return response.data;
};

// Delete article
export const deleteArticle = async (slug) => {
  const response = await axios.delete(`${API_BASE_URL}/articles/${slug}`);
  return response.data;
};

// Get all unique tags
export const getAllTags = async () => {
  const response = await axios.get(`${API_BASE_URL}/articles/tags`);
  return response.data;
};

// Get related articles
export const getRelatedArticles = async (slug, limit = 5) => {
  const response = await axios.get(`${API_BASE_URL}/articles/${slug}/related`, { params: { limit } });
  return response.data;
};

// User Management APIs
const getAdminHeaders = () => {
  // In production, this should use JWT tokens stored in localStorage/cookies
  return {
    'x-admin-key': process.env.REACT_APP_ADMIN_KEY || 'dev-admin-key'
  };
};

export const getAllUsers = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/users`, {
    params,
    headers: getAdminHeaders()
  });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/users/${id}`, {
    headers: getAdminHeaders()
  });
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/users`, userData, {
    headers: getAdminHeaders()
  });
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await axios.put(`${API_BASE_URL}/users/${id}`, userData, {
    headers: getAdminHeaders()
  });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/users/${id}`, {
    headers: getAdminHeaders()
  });
  return response.data;
};
