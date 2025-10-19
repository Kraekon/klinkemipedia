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

// Upload image
export const uploadImage = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await axios.post(`${API_BASE_URL}/articles/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress
  });
  return response.data;
};

// Version History APIs
export const getArticleRevisions = async (slug, page = 1, limit = 20) => {
  const response = await axios.get(`${API_BASE_URL}/articles/${slug}/revisions`, {
    params: { page, limit }
  });
  return response.data;
};

export const getArticleRevision = async (slug, versionNumber) => {
  const response = await axios.get(`${API_BASE_URL}/articles/${slug}/revisions/${versionNumber}`);
  return response.data;
};

export const restoreArticleRevision = async (slug, versionNumber, editedBy = 'admin') => {
  const response = await axios.post(`${API_BASE_URL}/articles/${slug}/restore/${versionNumber}`, {
    editedBy
  });
  return response.data;
};

export const compareArticleRevisions = async (slug, v1, v2) => {
  const response = await axios.get(`${API_BASE_URL}/articles/${slug}/compare`, {
    params: { v1, v2 }
  });
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

// Media Management APIs
export const getAllMedia = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/media`, { params });
  return response.data;
};

export const deleteMedia = async (filename, force = false) => {
  const response = await axios.delete(`${API_BASE_URL}/media/${filename}`, {
    params: { force }
  });
  return response.data;
};

export const getMediaUsage = async (filename) => {
  const response = await axios.get(`${API_BASE_URL}/media/${filename}/usage`);
  return response.data;
};

export const getMediaStats = async () => {
  const response = await axios.get(`${API_BASE_URL}/media/stats`);
  return response.data;
};

// Get analytics data
export const getMediaAnalytics = async () => {
  const response = await axios.get(`${API_BASE_URL}/media/analytics`);
  return response.data;
};

// Get usage details for a specific image (by ID or filename)
export const getMediaUsageById = async (mediaId) => {
  const response = await axios.get(`${API_BASE_URL}/media/${mediaId}/usage`);
  return response.data;
};

// Bulk delete images
export const bulkDeleteMedia = async (imageIds) => {
  const response = await axios.delete(`${API_BASE_URL}/media/bulk`, {
    data: { imageIds }
  });
  return response.data;
};
