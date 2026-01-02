import axios from "axios";

const BASE_URL =
  "https://dev.bobjava.sentrifugo.com:8443/dev-candidate-app/api/v1/candidate";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-Client": "candidate",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ✅ GET disclaimer status
export const getDisclaimerStatus = (candidateId) => {
  if (!candidateId) throw new Error("candidateId is required");

  return api.get(
    `/profile/get-personal-disclaimer/${candidateId}`
  );
};

// ✅ POST disclaimer acceptance
export const saveDisclaimerStatus = (candidateId, value) => {
  if (!candidateId) throw new Error("candidateId is required");

  return api.post(
    `/profile/save-personal-disclaimer/${candidateId}`,
    null,
    {
      params: { personalDisclaimer: value },
    }
  );
};

export default {
  getDisclaimerStatus,
  saveDisclaimerStatus,
};
