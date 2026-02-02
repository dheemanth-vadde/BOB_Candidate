import { candidateApi } from "../../services/apiService";

// GET disclaimer status
export const getDisclaimerStatus = (candidateId) => {
  if (!candidateId) throw new Error("candidateId is required");

  return candidateApi.get(
    `/profile/get-personal-disclaimer/${candidateId}`
  );
};

// POST disclaimer acceptance
export const saveDisclaimerStatus = (candidateId, value) => {
  if (!candidateId) throw new Error("candidateId is required");

  return candidateApi.post(
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
