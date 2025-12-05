import axios from 'axios';
import { store } from "../store"; // adjust path if needed
import { clearUser } from "../store/userSlice";
import { getConfig } from '@testing-library/dom';

// --- JWT Decoder helper ---
function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1]; // payload part
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    return payload;
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
}

function getToken() {
  const state = store.getState();
  const token = state.user?.authUser?.access_token || null;

  if (token) {
    const decoded = decodeJWT(token);
    if (decoded?.exp) {
      const expiry = new Date(decoded.exp * 1000);
      console.log("🔑 Token will expire at:", expiry.toLocaleString());

      const timeLeft = expiry.getTime() - Date.now();
      console.log("⏳ Time left (ms):", timeLeft, "≈", Math.round(timeLeft / 60000), "minutes");

      if (timeLeft < 3 * 60 * 1000) {
        console.warn("⚠️ Token expiring soon! Refresh flow will trigger soon.");
      }
    }
  }

  return token;
}

// Use the environment variables with a fallback to the new URLs you provided.
// This is the correct way to handle different API services.
const API_BASE_URL = 'https://dev.bobjava.sentrifugo.com:8443/test-candidate-app/api/v1';
// const API_BASE_URL = 'http://192.168.20.111:8081/api';
const API_BASE_URLS = 'https://dev.bobjava.sentrifugo.com:8443/test-master-app/api';
// const NODE_API_URL = 'https://bobbe.sentrifugo.com/api';
const JOBCREATION_API_URL = 'https://dev.bobjava.sentrifugo.com:8443/test-jobcreation-app/api/v1';
const DIGILOCKER_API_URL = 'https://dev.bobjava.sentrifugo.com:8443/test-candidate-app/api/v1';
// Create a primary axios instance for most API calls
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const digiLockerApi = axios.create({
  baseURL: DIGILOCKER_API_URL,
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
const jobcreationapis = axios.create({
  baseURL: JOBCREATION_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
// Request interceptor to add auth token for the primary API
api.interceptors.request.use(
  (config) => {
    const token = getToken();
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
      store.dispatch(clearUser());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

digiLockerApi.interceptors.request.use(
  (config) => {
    const token = getToken();
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
digiLockerApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(clearUser());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token for the secondary API
apis.interceptors.request.use(
  (config) => {
    const token = getToken();
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
      store.dispatch(clearUser());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

jobcreationapis.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

jobcreationapis.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(clearUser());
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
  getMasterData: () => apis.get('/all'),
  updateCandidates: (data) => api.put('candidates/update_candidate', data),
  getCandidateDetails: (candidate_id) => api.get(`candidates/get-by-candidate/${candidate_id}`),
  applyJobs: (data) => api.post('candidates/apply/job', data),
  appliedpositions: (candidate_id) => jobcreationapis.get(`candidates/get-applied-positions/${candidate_id}`),
  getActiveJobs: () => jobcreationapis.get(`job-positions/get-active`),
  // Get all categories (e.g., caste list)
  getAllCategories: () => apis.get('/categories/all'),
  getAllSpecialCategories: () => apis.get('/special-categories/all'),
  getAllDocuments: () => apis.get("/document-types/all"),
  // addCandidateDocument: (candidateId, documentId, data) =>
  //   api.post(`/candidate-document-store/upload/${candidateId}/${documentId}`, data),
  addCandidateDocument: (candidateId, documentId, others, data) =>
    api.post(`/candidate-document-store/upload/${candidateId}/${documentId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: others ? { others } : {}  // append ?others=<value> only if exists
    }),


  getCandidateDocuments: (candidateId) => api.get(`/candidate-document-store/documents/${candidateId}`),
  deleteCandidateDocument: (documentStoreId) =>
    api.delete(`/candidate-document-store/delete/${documentStoreId}`),

  //relaxation
  getRelaxations: () => jobcreationapis.get('/job-relaxation-policy/all'),
  getAllSpecialCategories: () => apis.get('/special-categories/all'),
  getAllReservationCategories: () => apis.get('/categories/all'),

  getConfig: () => api.get('/razorpay/config'),
  getRazorOrder: (data) => api.post('/razorpay/orders', data),
  getRazorVerify: (data) => api.post('/razorpay/verify', data),
  getChatFAQReply: (question) =>
    apis.get(`/v1/chatbot/getChatFAQReply`, {
      params: { question }
    }),
    getChatQueryReply: (question, candidateId) =>
  apis.get(`/v1/chatbot/getChatQueryReply`, {
    params: { question, candidateId }
  }),





    getConfig: () => api.get('/razorpay/config'),
    getRazorOrder: (data) => api.post('/razorpay/orders', data),
    getRazorVerify: (data) => api.post('/razorpay/verify', data),

    // ==================== DIGILOCKER API CALLS ====================

    // 1. Start Authorization
    getDigiLockerAuthUrl: (params) => digiLockerApi.get('/digilocker/authorize', { params }),

    // 2. Exchange Token (if backend expects code/state)
    exchangeDigiLockerToken: (code) =>
      digiLockerApi.post('/digilocker/token', null, {
        params: { code }
      }),

    getDigiLockerIssuedDocs: (token) =>
      digiLockerApi.get("/digilocker/issued-documents", {
        params: { authorizationHeader: `${token}` }
      }),

    getDigiLockerFile: (accessToken, fileUri, candidateId, documentId) =>
      digiLockerApi.post("/digilocker/uploadDigilockerFile", {
        accessToken,
        fileUri,
        candidateId,
        documentId,
        others: ""
      }),

    getEAadhaar: (token) =>
      digiLockerApi.get("/digilocker/eaadhaar", {
        params: { authorizationHeader: `${token}` }
      }),

};

export default apiService;
