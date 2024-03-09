import axios from 'axios';

const apiClient = axios.create({
  // baseURL: process.env.VUE_APP_API_URL
  baseURL: 'http://localhost:3000/'
});

export default apiClient;
