import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

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
