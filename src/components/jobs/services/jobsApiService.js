// src/services/masterApiService.js
import { jobsapi,razorpayapi,mastersapi} from "../../../services/apiService"; // reuse axios instances + interceptors

const jobsApiService = {
 


    //Relevamnt Jobs

    getAllDetails: (candidateId,positionId) => jobsapi.get(`candidate/get-all-details/${candidateId}/${positionId}`),
    getAppliedJobs: (candidateId, page = 0, size = 5, searchTerm = "") => jobsapi.get(`/applied-jobs/get-applied-jobs/${candidateId}?page=${page}&size=${size}&searchTerm=${searchTerm}`),
    //getAppliedJobs: (candidateId) => jobsapi.get(`/applied-jobs/get-applied-jobs/${candidateId}`),
    getActiveRequisitions: () => jobsapi.get(`/current-opportunities/get-job-requisition/active`),
    //getJobPositions: (candidateId, page = 0, size = 5) => jobsapi.get(`/current-opportunities/get-job-positions/active/${candidateId}?page=${page}&size=${size}`),
    getJobPositions: (payload) => jobsapi.post(`/current-opportunities/get-job-positions/active`,payload),
    applyToJob: (data) => jobsapi.post(`/applications/apply/job`,data),
    validateCandidateEligibility:(data) => jobsapi.post(`/applications/validate-eligibility`,data),
    //saveCompensationDetails:(data) => jobsapi.post(`/application-compensation/save-compensation-details`,data),
    saveCompensationDetails: (data) =>
      jobsapi.post(
        "/application-compensation/save-compensation-details",
        data,
        {
          headers: {
             "X-Client": "candidate",
            "Content-Type": "multipart/form-data",
          },
        }
   ),


    getMasterData:()=>mastersapi.get(`/display/all`),
    getRequestTypes:()=>mastersapi.get(`/master-dd-data/get/request-types`),
    getApplicationStatus:(applicationId) => jobsapi.get(`/track-app-status/status/${applicationId}`),
    getInterviewCentres:() => mastersapi.get(`/master-dd-data/get/interview-centres`),
    getMedicalLocations: () => mastersapi.get(`/master-dd-data/get/medical-centres`),

    //thread apis 
    createCandidateThread: (candidateId, formData) => jobsapi.post(`/candidate-conversation/create-thread/${candidateId}`, formData, {
      headers: {
        "X-Client": "candidate",
        "Content-Type": "multipart/form-data"
      }
    }),
       getCompensationDetails:(applicationId) => jobsapi.get(`/application-compensation/get-compensation-details/${applicationId}`),
    getRequestHistory: (applicationId) => jobsapi.get(`/candidate-conversation/request-history/${applicationId}`),
    downloadApplication: (applicationId) =>
  jobsapi.get(
    `/applied-jobs/download/application-form/${applicationId}`,
    {
      responseType: "blob", // 🔥 VERY IMPORTANT
    }
  ),
   //razor pay

   //getConfig: () => razorpayapi.get('/config'),
   postConfig: (data) => razorpayapi.post('/config', data),
  getRazorOrder: (data) => razorpayapi.post('/orders', data),
  getRazorVerify: (data) => razorpayapi.post('/verify', data),

  //offer letter /api/v1/candidate/applications/update-offer-decision
  getOfferLetterByApplicationId:(applicationId)=> jobsapi.get(`/offer-letter/get-offer/by-app-id/${applicationId}`),
  updateOfferDecision: (data) => jobsapi.post(`/applications/update-offer-decision`, data)
};

export default jobsApiService;
