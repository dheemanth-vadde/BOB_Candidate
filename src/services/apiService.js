import axios from 'axios';
import { applyInterceptors } from './interceptor';

const JOBS_BASE_URL='https://stage.bobjava.sentrifugo.com/candidate-portal/api/v1/candidate'

//const JOBS_BASE_URL='https://172.16.2.8:8082/candidate-portal/api/v1/candidate'
//const JOBS_BASE_URL='https://192.168.20.115:8082/candidate-portal/api/v1/candidate'
//const RAZOR_BASE_URL='http://192.168.20.115:8082/api/v1/razorpay';
const RAZOR_BASE_URL='https://stage.bobjava.sentrifugo.com/candidate-portal/api/v1/razorpay';
const MASTER_BASE_URLs='https://stage.bobjava.sentrifugo.com/master-portal/api/v1/master';
const CANDIDATE_BASE_URL = "https://stage.bobjava.sentrifugo.com/candidate-portal/api/v1/candidate";
//const CANDIDATE_BASE_URL='https://172.16.2.8:8082/candidate-portal/api/v1/candidate'
const jobsapi = axios.create({
  baseURL: JOBS_BASE_URL,
  headers: {
    "X-Client": "candidate",
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

const razorpayapi = axios.create({
  baseURL: RAZOR_BASE_URL,
  headers: {
    "X-Client": "candidate",
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

const mastersapi = axios.create({
  baseURL: MASTER_BASE_URLs,
  headers: {
    "X-Client": "candidate",
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

const candidateApi = axios.create({
  baseURL: CANDIDATE_BASE_URL,
  headers: {
    "X-Client": "candidate",
    "Content-Type": "application/json",
  },
  // timeout: 30000,
  withCredentials: true
});

applyInterceptors(jobsapi);
applyInterceptors(razorpayapi);
applyInterceptors(mastersapi);
applyInterceptors(candidateApi);

export const apiService = {};
export {
  jobsapi,
  razorpayapi,
  mastersapi,
  candidateApi
};

export default apiService;
