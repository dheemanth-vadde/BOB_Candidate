import axios from 'axios';
import { applyInterceptors } from './interceptor';


const API_BASE_URL = 'https://dev.bobjava.sentrifugo.com:8443/test-candidate-app/api/v1';
const API_BASE_URLS = 'https://dev.bobjava.sentrifugo.com:8443/test-master-app/api';
const JOBCREATION_API_URL = 'https://dev.bobjava.sentrifugo.com:8443/test-jobcreation-app/api/v1';
const DIGILOCKER_API_URL = 'https://dev.bobjava.sentrifugo.com:8443/test-candidate-app/api/v1';


// const JOBS_BASE_URL='http://192.168.20.115:8082/api/v1/candidate'
// const JOBS_BASE_URLs='http://192.168.20.111:8082/api/v1/candidate'
// const MASTER_BASE_URLs='http://192.168.20.111:8080/api'


const JOBS_BASE_URL='https://dev.bobjava.sentrifugo.com:8443/dev-candidate-app/api/v1/candidate'
const RAZOR_BASE_URL='https://dev.bobjava.sentrifugo.com:8443/dev-candidate-app/api/v1/razorpay'
const MASTER_BASE_URLs='https://dev.bobjava.sentrifugo.com:8443/dev-master-app/api'
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

const jobsapi = axios.create({
  baseURL: JOBS_BASE_URL,
  headers: {
      "X-Client": "candidate",
    'Content-Type': 'application/json',
  },
});

const razorpayapi = axios.create({
  baseURL: RAZOR_BASE_URL,
  headers: {
      "X-Client": "candidate",
    'Content-Type': 'application/json',
  },
});

const mastersapi = axios.create({
  baseURL: MASTER_BASE_URLs,
  headers: {
      "X-Client": "candidate",
    'Content-Type': 'application/json',
  },
});


// Attach interceptors to all instances
applyInterceptors(api);
applyInterceptors(digiLockerApi);
applyInterceptors(apis);
applyInterceptors(jobcreationapis);
applyInterceptors(jobsapi);
applyInterceptors(razorpayapi);
applyInterceptors(mastersapi);

export const apiService = {
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
  deleteCandidateDocument: (documentStoreId) => api.delete(`/candidate-document-store/delete/${documentStoreId}`),

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
export {
  jobsapi,
  razorpayapi,
  mastersapi,
};


export default apiService;
