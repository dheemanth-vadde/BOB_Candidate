import axios from 'axios';
import { applyInterceptors } from './interceptor';

// const RAZOR_BASE_URL='https://stage.bobjava.sentrifugo.com/candidate-portal/api/v1/razorpay';
// const MASTER_BASE_URLs='https://stage.bobjava.sentrifugo.com/master-portal/api/v1/master';
// const CANDIDATE_BASE_URL = "https://stage.bobjava.sentrifugo.com/candidate-portal/api/v1/candidate";

// const RAZOR_BASE_URL='https://uat.bobjava.sentrifugo.com/candidate-portal/api/v1/razorpay';
// const MASTER_BASE_URLs='https://uat.bobjava.sentrifugo.com/master-portal/api/v1/master';
// const CANDIDATE_BASE_URL = "https://uat.bobjava.sentrifugo.com/candidate-portal/api/v1/candidate";

const RAZOR_BASE_URL='https://dev.bobjava.sentrifugo.com/candidate-portal/api/v1/razorpay';
const MASTER_BASE_URLs='https://dev.bobjava.sentrifugo.com/master-portal/api/v1/master';
const CANDIDATE_BASE_URL = "https://dev.bobjava.sentrifugo.com/candidate-portal/api/v1/candidate";

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

applyInterceptors(razorpayapi);
applyInterceptors(mastersapi);
applyInterceptors(candidateApi);

export const apiService = {};
export {
  razorpayapi,
  mastersapi,
  candidateApi
};

export default apiService;
