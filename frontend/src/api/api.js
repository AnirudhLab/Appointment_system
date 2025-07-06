import axios from 'axios';

const API_BASE_URL = 'https://appointment-system-koix.onrender.com/api'; // TEMPORARY: HARDCODED FOR DEBUGGING

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

export default api; 