import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

// Auth APIs
export const register = async (username, email, password) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, {
    username,
    email,
    password
  });
  return response.data;
};

export const login = async (email, password) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password
  });
  return response.data;
};

export const logout = async () => {
  const response = await axios.post(`${API_BASE_URL}/auth/logout`);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axios.get(`${API_BASE_URL}/auth/me`);
  return response.data;
};

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

// Get all tags with counts
export const getTagsWithCounts = async () => {
  const response = await axios.get(`${API_BASE_URL}/tags`);
  return response.data;
};

// Get articles by tag
export const getArticlesByTag = async (tag, page = 1, limit = 10) => {
  const response = await axios.get(`${API_BASE_URL}/tags/${encodeURIComponent(tag)}/articles`, {
    params: { page, limit }
  });
  return response.data;
};

// Merge tags (admin)
export const mergeTags = async (sourceTags, targetTag) => {
  const response = await axios.put(`${API_BASE_URL}/tags/merge`, {
    sourceTags,
    targetTag
  }, {
    headers: getAdminHeaders()
  });
  return response.data;
};

// Delete tag (admin)
export const deleteTag = async (tag) => {
  const response = await axios.delete(`${API_BASE_URL}/tags/${encodeURIComponent(tag)}`, {
    headers: getAdminHeaders()
  });
  return response.data;
};

// Get related articles
export const getRelatedArticles = async (slug, limit = 5) => {
  const response = await axios.get(`${API_BASE_URL}/articles/related/${slug}`, { params: { limit } });
  return response.data;
};

// Search APIs
export const search = async (params) => {
  const response = await axios.get(`${API_BASE_URL}/search`, { params });
  return response.data;
};

export const getSearchSuggestions = async (query) => {
  const response = await axios.get(`${API_BASE_URL}/search/suggestions`, { 
    params: { q: query } 
  });
  return response.data;
};

export const getSearchHistory = async () => {
  const response = await axios.get(`${API_BASE_URL}/search/history`);
  return response.data;
};

export const getPopularSearches = async () => {
  const response = await axios.get(`${API_BASE_URL}/search/popular`);
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
  const response = await axios.get(`${API_BASE_URL}/users/admin`, {
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
  const response = await axios.post(`${API_BASE_URL}/users/admin`, userData, {
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

// Get usage details for a specific image (by ID or filename)
export const getMediaUsageById = async (mediaId) => {
  const response = await axios.get(`${API_BASE_URL}/media/${mediaId}/usage`);
  return response.data;
};

// Comment APIs
export const getComments = async (articleSlug, sort = 'newest') => {
  const response = await axios.get(`${API_BASE_URL}/articles/${articleSlug}/comments`, {
    params: { sort }
  });
  return response.data;
};

export const createComment = async (articleSlug, content) => {
  const response = await axios.post(`${API_BASE_URL}/articles/${articleSlug}/comments`, {
    content
  });
  return response.data;
};

export const editComment = async (commentId, content) => {
  const response = await axios.put(`${API_BASE_URL}/comments/${commentId}`, {
    content
  });
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await axios.delete(`${API_BASE_URL}/comments/${commentId}`);
  return response.data;
};

export const replyToComment = async (commentId, content) => {
  const response = await axios.post(`${API_BASE_URL}/comments/${commentId}/reply`, {
    content
  });
  return response.data;
};

export const upvoteComment = async (commentId) => {
  const response = await axios.post(`${API_BASE_URL}/comments/${commentId}/upvote`);
  return response.data;
};

export const downvoteComment = async (commentId) => {
  const response = await axios.post(`${API_BASE_URL}/comments/${commentId}/downvote`);
  return response.data;
};

export const removeVote = async (commentId) => {
  const response = await axios.delete(`${API_BASE_URL}/comments/${commentId}/vote`);
  return response.data;
};

export const reportComment = async (commentId, reason) => {
  const response = await axios.post(`${API_BASE_URL}/comments/${commentId}/report`, {
    reason
  });
  return response.data;
};

// Admin comment APIs
export const getAdminComments = async (status, page = 1, limit = 20) => {
  const params = { page, limit };
  if (status) params.status = status;
  const response = await axios.get(`${API_BASE_URL}/admin/comments`, { params });
  return response.data;
};

export const approveComment = async (commentId) => {
  const response = await axios.put(`${API_BASE_URL}/admin/comments/${commentId}/approve`);
  return response.data;
};

export const rejectComment = async (commentId) => {
  const response = await axios.put(`${API_BASE_URL}/admin/comments/${commentId}/reject`);
  return response.data;
};

export const deleteCommentPermanently = async (commentId) => {
  const response = await axios.delete(`${API_BASE_URL}/admin/comments/${commentId}`);
  return response.data;
};

// Media Upload API
export const uploadMedia = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await axios.post(`${API_BASE_URL}/media/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress
  });
  return response.data;
};

// Bookmark APIs
export const getBookmarks = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/bookmarks`, { params });
  return response.data;
};

export const getBookmark = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/bookmarks/${id}`);
  return response.data;
};

export const createBookmark = async (bookmarkData) => {
  const response = await axios.post(`${API_BASE_URL}/bookmarks`, bookmarkData);
  return response.data;
};

export const updateBookmark = async (id, bookmarkData) => {
  const response = await axios.put(`${API_BASE_URL}/bookmarks/${id}`, bookmarkData);
  return response.data;
};

export const deleteBookmark = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/bookmarks/${id}`);
  return response.data;
};

export const checkBookmark = async (articleId) => {
  const response = await axios.get(`${API_BASE_URL}/bookmarks/check/${articleId}`);
  return response.data;
};

// Collection APIs
export const getCollections = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/collections`, { params });
  return response.data;
};

export const getCollection = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/collections/${id}`);
  return response.data;
};

export const createCollection = async (collectionData) => {
  const response = await axios.post(`${API_BASE_URL}/collections`, collectionData);
  return response.data;
};

export const updateCollection = async (id, collectionData) => {
  const response = await axios.put(`${API_BASE_URL}/collections/${id}`, collectionData);
  return response.data;
};

export const deleteCollection = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/collections/${id}`);
  return response.data;
};

export const addBookmarkToCollection = async (collectionId, bookmarkId) => {
  const response = await axios.post(`${API_BASE_URL}/collections/${collectionId}/bookmarks`, {
    bookmarkId
  });
  return response.data;
};

export const removeBookmarkFromCollection = async (collectionId, bookmarkId) => {
  const response = await axios.delete(`${API_BASE_URL}/collections/${collectionId}/bookmarks/${bookmarkId}`);
  return response.data;
};

export const getPublicCollections = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/collections/public`, { params });
  return response.data;
};
