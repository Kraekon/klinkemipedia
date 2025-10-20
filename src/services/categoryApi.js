import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const getAllCategories = () => {
  return axios.get(`${API_BASE_URL}/categories`);
};

export const getCategory = (id) => {
  return axios.get(`${API_BASE_URL}/categories/${id}`);
};

export const createCategory = (data) => {
  return axios.post(`${API_BASE_URL}/categories`, data, { withCredentials: true });
};

export const updateCategory = (id, data) => {
  return axios.put(`${API_BASE_URL}/categories/${id}`, data, { withCredentials: true });
};

export const deleteCategory = (id, moveToCategory = null) => {
  return axios.delete(`${API_BASE_URL}/categories/${id}`, {
    data: { moveToCategory },
    withCredentials: true
  });
};

export const getCategoryArticles = (id) => {
  return axios.get(`${API_BASE_URL}/categories/${id}/articles`);
};

export const reorderCategories = (categories) => {
  return axios.put(`${API_BASE_URL}/categories/reorder`, { categories }, { withCredentials: true });
};