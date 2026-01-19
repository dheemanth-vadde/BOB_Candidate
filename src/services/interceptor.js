// interceptor.js
import axios from "axios";
import { store } from "../store";
import { clearUser } from "../components/auth/store/userSlice";

let isRefreshing = false;
let failedQueue = [];

// ---- Queue helpers ----
const processQueue = (error = null) => {
  failedQueue.forEach(promise => {
    if (error) promise.reject(error);
    else promise.resolve();
  });
  failedQueue = [];
};

// ---- Refresh API instance ----
const refreshApi = axios.create({
  baseURL: "https://stage.bobjava.sentrifugo.com/candidate-portal/api/v1",
  withCredentials: true // REQUIRED for HttpOnly cookies
});

// ---- Refresh call (COOKIE BASED) ----
async function refreshAccessToken() {
  console.log("🔄 [REFRESH] Calling refresh-token API");

  await refreshApi.post(
    "/candidate-auth/refresh-token",
    null,
    {
      headers: { "X-Client": "candidate" },
      withCredentials: true
    }
  );

  console.log("✅ [REFRESH] Success — access token cookie updated");
}

// ---- Apply interceptors ----
export function applyInterceptors(axiosInstance) {

  // ---------------- REQUEST ----------------
  axiosInstance.interceptors.request.use(
    config => {
      // ALWAYS send cookies
      config.withCredentials = true;
      return config;
    },
    error => Promise.reject(error)
  );

  // ---------------- RESPONSE ----------------
  axiosInstance.interceptors.response.use(
    response => response.data,

    async error => {
      const originalRequest = error.config;
      const status = error.response?.status;

      console.log("❌ [INTERCEPTOR] Error status:", status);

      // Not unauthorized or already retried → fail fast
      if (status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If refresh already in progress → queue request
      if (isRefreshing) {
        console.log("⏳ [REFRESH] In progress, queueing request");

        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          console.log("🔁 [QUEUE] Retrying queued request");
          return axiosInstance(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        console.log("🔐 [INTERCEPTOR] 401 detected, refreshing token");
        await refreshAccessToken();

        processQueue();
        console.log("🔁 [INTERCEPTOR] Retrying original request");

        return axiosInstance(originalRequest);

      } catch (refreshError) {
        console.error("💥 [REFRESH] Failed, logging out");

        processQueue(refreshError);
        store.dispatch(clearUser());
        window.location.href = "/login";

        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
        console.log("🔓 [REFRESH] Lock released");
      }
    }
  );
}
