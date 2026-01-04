// interceptor.js
import { store } from "../store";
import { clearUser } from "../components/auth/store/userSlice";

// --- JWT Decoder helper ---
function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
}

// Get token from Redux store
function getToken() {
  const state = store.getState();
  const token = state?.user?.user?.data?.accessToken;
  console.log("token: ", token)
  if (token) {
    const decoded = decodeJWT(token);
    if (decoded?.exp) {
      const expiry = new Date(decoded.exp * 1000);
      console.log("🔑 Token expires at:", expiry.toLocaleString());
    }
  }

  return token;
}

// Reusable interceptor function
export function applyInterceptors(axiosInstance) {
  // Request Interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  axiosInstance.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        store.dispatch(clearUser());
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
}
