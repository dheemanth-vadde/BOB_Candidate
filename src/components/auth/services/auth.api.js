import axios from "axios";

 const BASE_URL = "https://bobjava.sentrifugo.com:8443/dev-auth-app/api/v1";
//const BASE_URL = "http://192.168.20.111:8085/api/v1";

// Axios Instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-Client": "candidate",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ---------- API FUNCTIONS ----------

// Login API
export const login = (credentials) => {
  return api.post("/candidate-auth/login", { credentials });
};

// Resend Verification Email
export const resendVerification = (userId) => {
  return api.post("/candidate-auth/candidate-resend-verification", {
    user_id: userId,
  });
};

export const registerCandidate = (data) => {
  return api.post("/candidate-auth/register", data);
};

export const verifyOtp = (email, otp) => {
  return api.post(
    "/candidate-auth/verify-otp",
    { email, otp },
    { withCredentials: true }
  );
};

// Resend OTP
export const resendOtp = (email) => {
  return api.get("/candidate-auth/resend-otp", {
    params: { email },
    withCredentials: true
  });
};

// Forgot Password (send reset link)
export const forgotPassword = (email) => {
  return api.get("/candidate-auth/forgot-password", {
    params: { email },
  });
};

// Reset Password
export const resetPassword = (credentials, otp) => {
  return api.post("/candidate-auth/reset-password", {
    credentials,
    otp,
  });
};

// Verify OTP for Password Reset
export const verifyPasswordOtp = (email, otp) => {
  return api.get("/candidate-auth/password-otp-verify", {
    params: { email, otp },
    withCredentials: true,
  });
};

// Logout
export const logout = () => {
  return api.post(
    "/candidate-auth/logout",
    {},
    {
      withCredentials: true
    }
  );
};

export default {
  login,
  resendVerification,
  registerCandidate,
  verifyOtp,
  resendOtp,
	forgotPassword,
	resetPassword,
	verifyPasswordOtp,
	logout
};