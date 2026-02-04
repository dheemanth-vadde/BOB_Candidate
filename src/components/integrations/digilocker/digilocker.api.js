import axios from 'axios';
import { store } from "../store"; // adjust path if needed
import { clearUser } from "../components/auth/store/userSlice";
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

// const DIGILOCKER_API_URL = 'https://stage.bobjava.sentrifugo.com/candidate-portal/api/v1';
const DIGILOCKER_API_URL = 'https://uat.bobjava.sentrifugo.com/candidate-portal/api/v1';

// Create a primary axios instance for most API calls
const digiLockerApis = axios.create({
  baseURL: DIGILOCKER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

digiLockerApis.interceptors.request.use(
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
digiLockerApis.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(clearUser());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const digilockerApi = {
    // 1. Start Authorization
    getDigiLockerAuthUrl: (params) => digiLockerApis.get('/digilocker/authorize', { params }),

    // 2. Exchange Token (if backend expects code/state)
    exchangeDigiLockerToken: (code) =>
      digiLockerApis.post('/digilocker/token', null, {
        params: { code }
      }),

    getDigiLockerIssuedDocs: (token) =>
      digiLockerApis.get("/digilocker/issued-documents", {
        params: { authorizationHeader: `${token}` }
      }),

    getDigiLockerFile: (accessToken, fileUri, candidateId, documentId) =>
      digiLockerApis.post("/digilocker/uploadDigilockerFile", {
        accessToken,
        fileUri,
        candidateId,
        documentId,
        others: ""
      }),

    getEAadhaar: (token) =>
      digiLockerApis.get("/digilocker/eaadhaar", {
        params: { authorizationHeader: `${token}` }
      }),

};

export default digilockerApi;
