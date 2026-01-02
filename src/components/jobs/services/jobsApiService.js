// src/services/masterApiService.js
import { jobsapi,razorpayapi,mastersapi} from "../../../services/apiService"; // reuse axios instances + interceptors

const jobsApiService = {
  /* Users (Node API) */
  // Note: auth header is injected by nodeApi interceptor; no need to pass token manually
  // getRegister: () => jobapi.get('/getdetails/users/all'),
  // registerUser: (data) => nodeApi.post('/recruiter-auth/recruiter-register', data),

  // // city
  // getallCities: () => apis.get('/city/all'),
  // /* Locations */
  // getAllLocations: () => apis.get("/location/all"),
  // addLocation: (data) => apis.post("/location/add", data),
  // updateLocation: (id, data) => apis.put(`/location/update/${id}`, data),
  // deleteLocation: (id) => apis.delete(`/location/delete/${id}`),


  //Relevamnt Jobs

  getAllDetails: (candidateId) => jobsapi.get(`candidate/get-all-details/${candidateId}`),
  getAppliedJobs: (candidateId) => jobsapi.get(`/applied-jobs/get-applied-jobs/${candidateId}`),
  getActiveRequisitions: () => jobsapi.get(`/current-opportunities/get-job-requisition/active`),
  getJobPositions: (candidateId) => jobsapi.get(`/current-opportunities/get-job-positions/active/${candidateId}`),
   applyToJob: (data) => jobsapi.post(`/applications/apply/job`,data),
   getMasterData:()=>mastersapi.get(`api/v1/master/display/all`),
    getRequestTypes:()=>mastersapi.get(`master-dd-data/get/request-types`),

    //thread apis 
    createCandidateThread: (candidateId, formData) => jobsapi.post(`/candidate-conversation/create-thread/${candidateId}`, formData, {
      headers: {
        "X-Client": "candidate",
        "Content-Type": "multipart/form-data"
      }
    }),
    getRequestHistory: (applicationId) => jobsapi.get(`/candidate-conversation/request-history/${applicationId}`),

   //razor pay

   getConfig: () => razorpayapi.get('/config'),
  getRazorOrder: (data) => razorpayapi.post('/orders', data),
  getRazorVerify: (data) => razorpayapi.post('/verify', data),
  
};

export default jobsApiService;
