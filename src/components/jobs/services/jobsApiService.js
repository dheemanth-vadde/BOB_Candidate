// src/services/masterApiService.js
import {
  candidateApi,
  razorpayapi,
  mastersapi,
} from "../../../services/apiService"; // reuse axios instances + interceptors

const jobsApiService = {

  //Relevamnt Jobs
	
  getAllDetails: (candidateId, positionId) =>
    candidateApi.get(`candidate/get-all-details/${candidateId}/${positionId}`),
  getAppliedJobs: (candidateId, page = 0, size = 5, searchTerm = "") =>
    candidateApi.get(
      `/applied-jobs/get-applied-jobs/${candidateId}?page=${page}&size=${size}&searchTerm=${searchTerm}`,
    ),
  getActiveRequisitions: () =>
    candidateApi.get(`/current-opportunities/get-job-requisition/active`),
  getOpportunitiesJobPositions: (payload) =>
    candidateApi.post(
      `/current-opportunities/get-job-positions/active`,
      payload,
    ),
  getJobPositions: (payload) =>
    candidateApi.post(
      `/current-opportunities/get-job-positions/active`,
      payload,
    ),
  applyToJob: (data) => candidateApi.post(`/applications/apply/job`, data),
  validateCandidateEligibility: (data) =>
    candidateApi.post(`/applications/validate-eligibility`, data),
  saveCompensationDetails: (data) =>
    candidateApi.post(
      "/application-compensation/save-compensation-details",
      data,
      {
        headers: {
          "X-Client": "candidate",
          "Content-Type": "multipart/form-data",
        },
      },
    ),

  getMasterData: () => mastersapi.get(`/display/all`),
  getRequestTypes: () => mastersapi.get(`/master-dd-data/get/request-types`),
  getApplicationStatus: (applicationId) =>
    candidateApi.get(`/track-app-status/status/${applicationId}`),
  getInterviewCentres: () =>
    mastersapi.get(`/master-dd-data/get/interview-centres`),
  getMedicalLocations: () =>
    mastersapi.get(`/master-dd-data/get/medical-centres`),

  //THREAD APIs

  createCandidateThread: (candidateId, formData) =>
    candidateApi.post(
      `/candidate-conversation/create-thread/${candidateId}`,
      formData,
      {
        headers: {
          "X-Client": "candidate",
          "Content-Type": "multipart/form-data",
        },
      },
    ),
  getCompensationDetails: (applicationId) =>
    candidateApi.get(
      `/application-compensation/get-compensation-details/${applicationId}`,
    ),
  getRequestHistory: (applicationId) =>
    candidateApi.get(
      `/candidate-conversation/request-history/${applicationId}`,
    ),
  downloadApplication: (applicationId) =>
    candidateApi.get(
      `/applied-jobs/download/application-form/${applicationId}`,
      {
        responseType: "blob", // 🔥 VERY IMPORTANT
      },
    ),

  //RAZORPAY

  //getConfig: () => razorpayapi.get('/config'),
  postConfig: (data) => razorpayapi.post("/config", data),
  getRazorOrder: (data) => razorpayapi.post("/orders", data),
  getRazorVerify: (data) => razorpayapi.post("/verify", data),

  //offer letter /api/v1/candidate/applications/update-offer-decision
  getOfferLetterByApplicationId: (applicationId) =>
    candidateApi.get(`/offer-letter/get-offer/by-app-id/${applicationId}`),
  updateOfferDecision: (data) =>
    candidateApi.post(`/applications/update-offer-decision`, data),
};

export default jobsApiService;
