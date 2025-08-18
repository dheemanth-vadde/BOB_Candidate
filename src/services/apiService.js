import axios from 'axios';

// Use the environment variables with a fallback to the new URLs you provided.
// This is the correct way to handle different API services.
const API_BASE_URL ='http://192.168.20.111:8081/api';
const API_BASE_URLS =  'https://bobjava.sentrifugo.com:8443/master/api';
const NODE_API_URL = 'https://bobbe.sentrifugo.com/api';

// Create a primary axios instance for most API calls
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a secondary axios instance for the master data API call
const apis = axios.create({
  baseURL: API_BASE_URLS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token for the primary API
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling on the primary API
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token for the secondary API
apis.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling on the secondary API
apis.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  

  // uploadJobExcel: (data) => api.post('/create_Bulk_positions', data), // Dummy POST endpoint
  // postJobRequisitions :(payload) => api.post("/requisitionpost", payload),
  // getallLocations: () => apis.get('/location/all'),
  // getallCities: () => apis.get('/city/all'),
  // updateJob: (data) => api.put('/update_positions', data),
  // getByRequisitionId: (requisition_id) => api.get(`getbyreq/${requisition_id}`),
  // getByPositionId: (position_id) => api.get(`getByPositionId/${position_id}`),
  // jobpost: (data) => api.post('/job_postings',data),
  // getDashboardQueries: () => api.get('/dashboard/queries'),
  // getDashboardMetrics: () => api.get('/dashboard/metrics'),

  updateCandidates: (data) => api.put('candidates/update_candidate', data),
  getCandidateDetails: (candidate_id) => api.get(`candidates/details-by-candidates/${candidate_id}`),
  applyJobs: (data) => api.post('candidates/apply/job',data),
  appliedpositions: (candidate_id) => api.get(`candidates/getapplied_postions/${candidate_id}`),
   
};

export default apiService;
