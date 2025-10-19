const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');

export const getImageUrl = (src) => {
  if (!src) return '';
  if (src.startsWith('http')) return src; // Already full URL
  if (src.startsWith('/uploads')) return `${BACKEND_BASE_URL}${src}`;
  return src;
};